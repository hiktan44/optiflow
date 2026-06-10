import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: project } = await supabase
    .from('projects')
    .select('id, snippet_key')
    .eq('snippet_key', key)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Invalid snippet key' }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  const js = `(function(k,a){
var c=function(){
  fetch(a+'/api/track',{method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({snippet_key:k,visitor_id:localStorage.getItem('_of_vid')||(function(){var i='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=Math.random()*16|0,v=c=='x'?r:(r&0x3|0x8);return v.toString(16);});localStorage.setItem('_of_vid',i);return i;})(),session_id:sessionStorage.getItem('_of_sid')||(function(){var i='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=Math.random()*16|0,v=c=='x'?r:(r&0x3|0x8);return v.toString(16);});sessionStorage.setItem('_of_sid',i);return i;})(),event_type:'pageview',metadata:{url:location.href,referrer:document.referrer}})
  }).catch(function(){});
};
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',c);}else{c();}
})('${project.snippet_key}','${appUrl}');`

  return new NextResponse(js, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    },
  })
}
