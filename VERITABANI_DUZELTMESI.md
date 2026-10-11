# Olay kaydı ve profil izinleri

F128, F129 ve F130 için kaynak düzeltmesi. Canlı Supabase/Coolify veritabanına uygulanmadı.

## Değişiklikler

- `events` anahtarı `(id, created_at)` oldu. PostgreSQL, bölümlenmiş tabloların birincil anahtarında bölümleme sütununu ister. Olay yükünün alanları ve takip API'si değişmedi; aynı kimlik farklı tarihte kullanılabilir, aynı kimlik/tarih çifti reddedilir.
- Nisan–Haziran 2026 bölümleri korunuyor. Diğer tarihler `DEFAULT` bölümüne gider; aylık bakım gecikmesi olay kaydını durdurmaz.
- Kullanıcı kendi profilindeki yalnız `full_name` ve `avatar_url` alanlarını düzenleyebilir. Plan, müşteri kimliği, kota, e-posta, kullanıcı kimliği ve zaman damgaları güvenilir sunucu rolünün yönetimindedir. Önceden verilmiş sütun izinleri de kaldırılır. RLS başka kullanıcının profilini korumayı sürdürür.
- İzinler açık `GRANT` ifadeleriyle tanımlıdır; Supabase'in otomatik tablo izinlerine bağlı değildir. Kullanıcı sorguları üst olay tablosunu kullanır. Bölümler için RLS ve doğrudan erişim kısıtları vardır.

Yeni kurulumda `001_initial.sql` ve ardından CLI ile oluşturulan `20261011151346_events_profile_permissions.sql` uygulanır. Mevcut kurulumda yalnız yeni düzeltme göçü gerekir; geçmiş göçler yeniden çalıştırılmaz. Yeni göç tekrar uygulamaya dayanıklıdır, kayıtları silmez veya taşımaya çalışmaz. Önceden sıradan tablo olarak kurulmuş `events` korunur. Eksik anahtarı ekler; beklenmeyen anahtar/bölüm yapısında veya çakışan bölüm adında işlemi atomik olarak durdurur.

## Doğrulama

`tests/database_regressions.py`, özel PostgreSQL kümesinde 20 test çalıştırır. Gerçek SQL; tarih sınırları, tarihi/geçerli/gelecek olaylar, eksik bölüm, tekrar göç, mevcut kayıtların korunması, beklenmeyen şemada geri alma, sütun izinleri, diğer kullanıcıya erişim, güvenilir faturalama güncellemesi ve doğrudan bölüm erişimi sınanır. Eski hatanın SQLSTATE kodları da yeniden üretilir. Testlerde kurgusal hesaplar bulunur; bulut API'si çağrılmaz.

Yerel örnek, yalnız bu test için kurulmuş ve `postgres` yönetim veritabanını kullanan kümede:

```sh
OPTIFLOW_TEST_ADMIN_URL='postgresql://postgres@127.0.0.1:55440/postgres' \
OPTIFLOW_TEST_ALLOW_DB_CREATE=1 \
python3 tests/database_regressions.py
```

`psql` PATH'te değilse `OPTIFLOW_TEST_PSQL` ile yolu verilir. Testler yalnız localhost bağlantısını kabul eder; rastgele `codex_optiflow_` adlarıyla oluşturdukları veritabanlarını temizler. Kümede test için `anon`, `authenticated` ve `service_role` rolleri oluşturulduğundan mevcut geliştirme/üretim kümesini kullanmayın. CI, bağımsız PostgreSQL 14 ve 17 servisleri kurar.

## Canlıya geçişte kalan doğrulama

Üretimde önce mevcut şema, rol üyelikleri, RLS politikaları, yedek ve göç geçmişi incelenmelidir. Anahtar ekleme/bölüm oluşturma büyük tablolarda kilit alabilir; bakım penceresi planlanmalıdır. `DEFAULT` bölümünün boyutu izlenmeli; aylık bölümler eklenirken kapsanan kayıtlar PostgreSQL'in bölüm bakım kurallarına göre taşınmalıdır. Bu değişiklik aylık bakım işini otomatik oluşturmaz.

Yerel SQL kontrolü Supabase Auth/PostgREST entegrasyonunun veya canlı takip isteğinin yerine geçmez. Dağıtımdan sonra gerçek kullanıcıyla profil düzenleme ve takip API'si doğrulanmalı, Supabase Security Advisor incelenmelidir. F131 (Stripe müşteri eşleşmesi), demo oturumu ve diğer rapor bulguları bu paketin kapsamında değildir.

## Kaynaklar

- [PostgreSQL bölümleme kuralları](https://www.postgresql.org/docs/current/ddl-partitioning.html)
- [Supabase sütun izinleri](https://supabase.com/docs/guides/database/postgres/column-level-security)
- [Supabase açık tablo izinleri değişikliği](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
