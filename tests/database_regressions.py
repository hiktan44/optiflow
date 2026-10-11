"""Yalnız özel, yerel test kümesinde gerçek PostgreSQL izin/şema kontrolleri."""
import os
from pathlib import Path
import shutil
import subprocess
import unittest
from urllib.parse import urlsplit, urlunsplit
import uuid

ROOT = Path(__file__).resolve().parents[1]
INITIAL = (ROOT / 'supabase/migrations/001_initial.sql').read_text()
MIGRATION = (ROOT / 'supabase/migrations/20261011151346_events_profile_permissions.sql').read_text()
ADMIN = os.environ.get('OPTIFLOW_TEST_ADMIN_URL', '')
PSQL = os.environ.get('OPTIFLOW_TEST_PSQL') or shutil.which('psql')
USER_A = '11111111-1111-4111-8111-111111111111'
USER_B = '22222222-2222-4222-8222-222222222222'
PROJECT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
PROJECT_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
EVENT_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'


def query(url, sql, expected_error=None):
    result = subprocess.run(
        [PSQL, '-X', '-qAt', '-v', 'ON_ERROR_STOP=1', url],
        input='\\set VERBOSITY verbose\n' + sql, text=True, capture_output=True,
        timeout=45,
    )
    if expected_error:
        if result.returncode == 0 or expected_error not in result.stderr:
            raise AssertionError(f'Beklenen SQLSTATE {expected_error}: {result.stderr}')
    elif result.returncode:
        raise AssertionError(result.stderr)
    return result.stdout.strip()


def actor(role, user, sql):
    return f"set role {role}; set request.jwt.claim.sub = '{user}'; {sql}"


class DatabaseRegressions(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        parsed = urlsplit(ADMIN)
        if (os.environ.get('OPTIFLOW_TEST_ALLOW_DB_CREATE') != '1' or not PSQL
                or parsed.scheme not in ('postgres', 'postgresql')
                or parsed.hostname not in ('127.0.0.1', 'localhost', '::1')
                or parsed.path != '/postgres'):
            raise RuntimeError('Özel yerel test kümesini ve veritabanı oluşturma iznini açıkça belirtin.')
        cls.connection = parsed
        query(ADMIN, """
          do $$ begin
            if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
            if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
            if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
            if exists (select 1 from pg_roles where rolname in ('anon', 'authenticated') and (rolsuper or rolbypassrls or rolcanlogin))
              or not exists (select 1 from pg_roles where rolname = 'service_role' and rolbypassrls and not rolcanlogin) then
              raise exception 'Özel Supabase test rolü sözleşmesi sağlanmadı';
            end if;
          end $$;
        """)

    def setUp(self):
        self.name = 'codex_optiflow_' + uuid.uuid4().hex
        query(ADMIN, f'create database {self.name};')
        self.url = urlunsplit(self.connection._replace(path='/' + self.name))
        query(self.url, """
          create schema auth;
          create table auth.users(id uuid primary key, email text not null);
          create function auth.uid() returns uuid language sql stable as $$
            select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
          $$;
          grant usage on schema auth, public to anon, authenticated, service_role;
          -- Eski Supabase projelerindeki geniş varsayılan izinleri de sınar.
          alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
        """)

    def tearDown(self):
        query(ADMIN, f'drop database {self.name} with (force);')

    def install(self, initial=INITIAL, migrate=True):
        query(self.url, initial)
        if migrate:
            query(self.url, MIGRATION)
        query(self.url, f"""
          insert into auth.users values ('{USER_A}', 'bir@example.test'), ('{USER_B}', 'iki@example.test');
          insert into projects(id, user_id, name, domain) values
            ('{PROJECT_A}', '{USER_A}', 'Bir', 'bir.example.test'),
            ('{PROJECT_B}', '{USER_B}', 'İki', 'iki.example.test');
        """)

    def event(self, date, project=PROJECT_A, event_id=EVENT_ID):
        return f"""insert into events(id, project_id, session_id, visitor_id, event_type, created_at)
          values ('{event_id}', '{project}', 'kurgu-oturum', 'kurgu-ziyaretci', 'pageview', '{date}');"""

    def legacy(self, key='primary key (id, created_at)'):
        # Eski dağıtımdaki aylık şemayı, geçerli/eksik/farklı anahtarla kurar.
        old = INITIAL.replace('primary key (id, created_at)', key)
        old = old.replace('create table events_default partition of events default;', '')
        old = old.replace('alter table events_default enable row level security;', '')
        old = old.replace('revoke all on events_2026_04, events_2026_05, events_2026_06, events_default from public, anon, authenticated;', '')
        return old

    def test_original_partition_key_is_rejected(self):
        broken = INITIAL.replace('primary key (id, created_at)', 'primary key (id)')
        query(self.url, broken, '0A000')

    def test_initial_migration_alone_is_safe(self):
        self.install(migrate=False)
        query(self.url, actor('service_role', '', self.event('2026-10-11T12:00:00Z')))
        query(self.url, actor('authenticated', USER_A, "update profiles set plan='premium';"), '42501')
        query(self.url, actor('authenticated', USER_A, 'select * from events_default;'), '42501')

    def test_clean_install_has_partition_key(self):
        self.install()
        self.assertEqual(query(self.url, "select pg_get_constraintdef(oid) from pg_constraint where conrelid='events'::regclass and contype='p';"), 'PRIMARY KEY (id, created_at)')

    def test_historical_current_future_and_month_boundaries(self):
        self.install()
        dates = ['2024-01-01T00:00:00Z', '2026-04-01T00:00:00Z',
                 '2026-04-30T23:59:59Z', '2026-05-01T00:00:00Z',
                 '2026-06-01T00:00:00Z', '2026-07-01T00:00:00Z',
                 '2026-10-11T12:00:00Z', '2030-01-01T00:00:00Z']
        for date in dates:
            query(self.url, actor('service_role', '', self.event(date)))
        query(self.url, actor('service_role', '', "insert into events(project_id, session_id, visitor_id, event_type) values ('" + PROJECT_A + "', 'kurgu', 'kurgu', 'pageview');"))
        self.assertEqual(query(self.url, 'select count(*) from events;'), '9')
        self.assertEqual(query(self.url, "select tableoid::regclass from events where created_at='2026-05-01T00:00:00Z';"), 'events_2026_05')
        query(self.url, self.event(dates[0]), '23505')

    def test_old_schema_rejects_missing_month_then_recovers(self):
        self.install(self.legacy(), migrate=False)
        query(self.url, self.event('2026-10-11T12:00:00Z'), '23514')
        query(self.url, MIGRATION)
        query(self.url, self.event('2026-10-11T12:00:00Z'))

    def test_existing_data_and_repeat_apply(self):
        self.install(self.legacy(), migrate=False)
        query(self.url, self.event('2026-04-15T12:00:00Z'))
        query(self.url, MIGRATION)
        query(self.url, MIGRATION)
        self.assertEqual(query(self.url, 'select count(*) from events;'), '1')

    def test_missing_key_is_repaired_without_losing_rows(self):
        self.install(self.legacy('unique (id, created_at)'), migrate=False)
        query(self.url, self.event('2026-04-15T12:00:00Z'))
        query(self.url, MIGRATION)
        self.assertEqual(query(self.url, 'select count(*) from events;'), '1')
        self.assertEqual(query(self.url, "select count(*) from pg_constraint where conrelid='events'::regclass and contype='p';"), '1')

    def test_unexpected_key_fails_atomically(self):
        self.install(self.legacy('primary key (id, created_at, project_id)'), migrate=False)
        query(self.url, 'grant update(plan) on profiles to authenticated;')
        query(self.url, MIGRATION, 'P0001')
        self.assertEqual(query(self.url, "select to_regclass('public.events_default') is null;"), 't')
        self.assertEqual(query(self.url, "select has_column_privilege('authenticated', 'profiles', 'plan', 'UPDATE');"), 't')

    def test_named_existing_default_is_reused(self):
        self.install(self.legacy(), migrate=False)
        query(self.url, 'create table historical_catch_all partition of events default;')
        query(self.url, MIGRATION)
        query(self.url, self.event('2030-01-01T00:00:00Z'))
        self.assertEqual(query(self.url, 'select tableoid::regclass from events;'), 'historical_catch_all')
        query(self.url, actor('authenticated', USER_A, 'select * from historical_catch_all;'), '42501')

    def test_default_name_collision_rolls_back(self):
        self.install(self.legacy(), migrate=False)
        query(self.url, 'create table events_default(marker text);')
        query(self.url, MIGRATION, '42P07')
        self.assertEqual(query(self.url, "select relkind from pg_class where oid='events_default'::regclass;"), 'r')

    def test_ordinary_legacy_table_is_preserved(self):
        start = INITIAL.index('create table events_2026_04')
        end = INITIAL.index('-- subscriptions')
        ordinary = INITIAL[:start] + INITIAL[end:]
        ordinary = ordinary.replace(') partition by range (created_at);', ');')
        ordinary = ordinary.replace('revoke all on events_2026_04, events_2026_05, events_2026_06, events_default from public, anon, authenticated;', '')
        self.install(ordinary, migrate=False)
        query(self.url, self.event('2026-10-11T12:00:00Z'))
        query(self.url, MIGRATION)
        self.assertEqual(query(self.url, 'select count(*) from events;'), '1')
        self.assertEqual(query(self.url, "select relkind from pg_class where oid='events'::regclass;"), 'r')

    def test_personal_fields_can_be_updated(self):
        self.install()
        query(self.url, actor('authenticated', USER_A, "update profiles set full_name='Deneme Kullanıcısı', avatar_url='https://example.test/avatar.png' where id='" + USER_A + "';"))
        self.assertEqual(query(self.url, f"select full_name from profiles where id='{USER_A}';"), 'Deneme Kullanıcısı')

    def test_billing_identity_quota_and_timestamp_fields_are_blocked(self):
        self.install()
        unsafe = {'plan': "'premium'", 'mtu_limit': '999999', 'stripe_customer_id': "'cus_kurgu'",
                  'email': "'yeni@example.test'", 'id': f"'{USER_B}'", 'created_at': 'now()', 'updated_at': 'now()'}
        for column, value in unsafe.items():
            with self.subTest(column=column):
                query(self.url, actor('authenticated', USER_A, f'update profiles set {column}={value};'), '42501')

    def test_anonymous_profile_update_is_blocked(self):
        self.install()
        query(self.url, actor('anon', USER_A, "update profiles set full_name='İzinsiz';"), '42501')

    def test_another_user_profile_is_hidden_and_unchanged(self):
        self.install()
        self.assertEqual(query(self.url, actor('authenticated', USER_A, f"select count(*) from profiles where id='{USER_B}';")), '0')
        query(self.url, actor('authenticated', USER_A, f"update profiles set full_name='İzinsiz' where id='{USER_B}';"))
        self.assertEqual(query(self.url, f"select full_name is null from profiles where id='{USER_B}';"), 't')

    def test_trusted_billing_updates_still_work(self):
        self.install()
        query(self.url, actor('service_role', '', f"update profiles set plan='premium', mtu_limit=9000, stripe_customer_id='cus_kurgu' where id='{USER_A}';"))
        self.assertEqual(query(self.url, f"select plan from profiles where id='{USER_A}';"), 'premium')

    def test_old_column_and_public_update_grants_are_removed(self):
        self.install(migrate=False)
        query(self.url, 'grant update(plan, mtu_limit) on profiles to authenticated, anon, public;')
        query(self.url, actor('authenticated', USER_A, "update profiles set plan='premium';"))
        query(self.url, MIGRATION)
        query(self.url, actor('authenticated', USER_A, "update profiles set plan='free';"), '42501')
        query(self.url, actor('anon', USER_A, "update profiles set mtu_limit=999;"), '42501')

    def test_parent_event_reads_obey_owner_rls(self):
        self.install()
        query(self.url, self.event('2026-10-11T12:00:00Z'))
        query(self.url, self.event('2026-10-12T12:00:00Z', PROJECT_B))
        self.assertEqual(query(self.url, actor('authenticated', USER_A, 'select count(*) from events;')), '1')
        query(self.url, actor('authenticated', USER_A, self.event('2026-10-13T12:00:00Z')), '42501')

    def test_direct_partition_column_grants_are_removed(self):
        self.install(migrate=False)
        query(self.url, 'grant select(id) on events_2026_04 to public, anon, authenticated;')
        query(self.url, MIGRATION)
        for role in ['anon', 'authenticated']:
            query(self.url, actor(role, USER_A, 'select id from events_2026_04;'), '42501')
        self.assertEqual(query(self.url, "select bool_and(c.relrowsecurity) from pg_partition_tree('events'::regclass) p join pg_class c on c.oid=p.relid;"), 't')

    def test_no_automatic_grants_are_required(self):
        query(self.url, 'alter default privileges in schema public revoke all on tables from anon, authenticated, service_role;')
        self.install()
        query(self.url, actor('authenticated', USER_A, "update profiles set full_name='İzin açık';"))
        query(self.url, actor('service_role', '', self.event('2030-01-01T00:00:00Z')))
        self.assertEqual(query(self.url, actor('authenticated', USER_A, 'select count(*) from events;')), '1')


if __name__ == '__main__':
    unittest.main(verbosity=2)
