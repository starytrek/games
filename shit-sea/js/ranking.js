'use strict';
window.GeoSeaRanking=(()=>{
 const KEY='shitsea-ranking-v2';
 const LAST_KEY='shitsea-last-global-score-v1';
 const ATTEMPT_KEY='shitsea-ranking-attempts-v1';
 const MAX_NAME=16;
 const BLOCKED_WORDS=[
  'dupa','dupek','dupka','dupeczka',
  'kurwa','kurwy','kurwo','kurwica','kurwiszon',
  'chuj','huj','chuja','chujek','chujnia',
  'pierdol','pierdolony','pierdolona','pierdolnik',
  'jebac','jebany','jebana','zjeb','zjebany','pojeb','pojebany',
  'pizda','pizdy','pizdziec','cipa','cipka','cipy',
  'kutas','kutafon','cwel','cwele','dziwka','dziwki',
  'suka','suki','sukinsyn','skurwysyn','skurwiel',
  'debil','idiota','idiotka','kretyn','kretynka',
  'fuck','fucker','fucking','shit','bitch','asshole','dick','cock','pussy'
 ];
 const normalize=s=>String(s||'').trim().toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l')
  .replace(/[@4]/g,'a').replace(/[0]/g,'o').replace(/[1!|]/g,'i')
  .replace(/[3]/g,'e').replace(/[$5]/g,'s').replace(/[7]/g,'t')
  .replace(/[^a-z0-9]/g,'');
 const offensive=name=>{const n=normalize(name);return BLOCKED_WORDS.some(w=>n.includes(normalize(w)));};
 const validChars=name=>/^[\p{L}\p{N}]+$/u.test(String(name||''));
 const validate=name=>{
  const raw=String(name||'').trim();
  if(raw.length<2)return {ok:false,reason:'Wpisz nick — minimum 2 znaki.'};
  if(raw.length>MAX_NAME)return {ok:false,reason:`Nick może mieć maksymalnie ${MAX_NAME} znaków.`};
  if(!validChars(raw))return {ok:false,reason:'Nick może zawierać tylko litery i cyfry — bez spacji i znaków specjalnych.'};
  if(offensive(raw))return {ok:false,offensive:true,reason:'Brzydko się wpisałeś 😄 — ten wynik nie trafia do rankingu. Możesz zagrać jeszcze raz.'};
  return {ok:true,name:raw};
 };
 const sanitizeInput=value=>Array.from(String(value||'')).filter(ch=>/[\p{L}\p{N}]/u.test(ch)).join('').slice(0,MAX_NAME);
 const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[];}catch{return [];}};
 const write=v=>localStorage.setItem(KEY,JSON.stringify(v.slice(0,100)));
 const add=entry=>{const all=read();all.push(entry);all.sort((a,b)=>b.score-a.score||new Date(a.date)-new Date(b.date));write(all);return all;};
 const top=(region,mode,limit=20)=>read().filter(x=>(!region||x.region===region)&&(!mode||x.mode===mode)).slice(0,limit);
 const antiSpam=()=>{
  const now=Date.now();let a=[];
  try{a=JSON.parse(sessionStorage.getItem(ATTEMPT_KEY)||'[]');if(!Array.isArray(a))a=[];}catch{a=[];}
  a=a.filter(t=>now-t<10000);
  if(a.length>=5)return {ok:false,reason:'Za dużo prób zapisu naraz. Spróbuj ponownie za kilka sekund.'};
  a.push(now);sessionStorage.setItem(ATTEMPT_KEY,JSON.stringify(a));return {ok:true};
 };
 const cfg=()=>window.GEOSEA_BACKEND||{};
 const backendReady=()=>/^https:\/\/.+\.supabase\.co$/i.test(cfg().url||'')&&String(cfg().publishableKey||'').startsWith('sb_publishable_');
 const headers=(extra={})=>({'apikey':cfg().publishableKey,'Authorization':'Bearer '+cfg().publishableKey,'Content-Type':'application/json',...extra});
 const endpoint=(query='')=>cfg().url.replace(/\/$/,'')+'/rest/v1/leaderboard'+query;
 async function api(query='',options={}){
  if(!backendReady())throw new Error('Ranking globalny nie jest jeszcze podłączony.');
  const res=await fetch(endpoint(query),{...options,headers:headers(options.headers||{})});
  if(!res.ok){let m='Błąd rankingu online.';try{const j=await res.json();m=j.message||j.error||m;}catch{}throw new Error(m);}
  return res;
 }
 const enc=encodeURIComponent;
 async function globalTop(region,mode,limit=20){
  const q=`?select=id,name,score,max,region,mode,created_at&region=eq.${enc(region)}&mode=eq.${enc(mode)}&order=score.desc,created_at.asc&limit=${Math.min(100,Math.max(1,limit))}`;
  return (await api(q)).json();
 }
 async function globalAdd(entry){
  const body={name:entry.name,score:entry.score,max:entry.max,region:entry.region,mode:entry.mode};
  const res=await api('?select=id,name,score,max,region,mode,created_at',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(body)});
  const rows=await res.json();const row=rows[0];
  if(row)localStorage.setItem(LAST_KEY,JSON.stringify(row));
  return row;
 }
 async function globalPosition(region,mode,score){
  const q=`?select=id&region=eq.${enc(region)}&mode=eq.${enc(mode)}&score=gt.${Number(score)}&limit=1`;
  const res=await api(q,{headers:{Prefer:'count=exact',Range:'0-0'}});
  const cr=res.headers.get('content-range')||'*/0';
  const total=Number(cr.split('/').pop())||0;
  return total+1;
 }
 const lastGlobal=()=>{try{return JSON.parse(localStorage.getItem(LAST_KEY)||'null');}catch{return null;}};
 return {offensive,validate,sanitizeInput,antiSpam,add,top,read,MAX_NAME,backendReady,globalTop,globalAdd,globalPosition,lastGlobal};
})();