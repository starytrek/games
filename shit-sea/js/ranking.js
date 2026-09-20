'use strict';
window.GeoSeaRanking=(()=>{
 const KEY='shitsea-ranking-v2';
 const ATTEMPT_KEY='shitsea-ranking-attempts-v1';
 const MAX_NAME=16;
 const BLOCKED_WORDS=[
  'dupa','dupek','dupka','dupeczka',
  'kurwa','kurwa','kurwy','kurwo','kurwica','kurwiszon',
  'chuj','huj','chuja','chujek','chujnia',
  'pierdol','pierdolony','pierdolona','pierdolnik',
  'jebac','jebany','jebana','zjeb','zjebany','pojeb','pojebany',
  'pizda','pizdy','pizdziec',
  'cipa','cipka','cipy',
  'kutas','kutafon',
  'cwel','cwele',
  'dziwka','dziwki',
  'suka','suki','sukinsyn',
  'skurwysyn','skurwiel',
  'debil','idiota','idiotka','kretyn','kretynka',
  'fuck','fucker','fucking','shit','bitch','asshole','dick','cock','pussy'
 ];
 const normalize=s=>String(s||'')
  .trim()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .replace(/ł/g,'l')
  .replace(/[@4]/g,'a')
  .replace(/[0]/g,'o')
  .replace(/[1!|]/g,'i')
  .replace(/[3]/g,'e')
  .replace(/[$5]/g,'s')
  .replace(/[7]/g,'t')
  .replace(/[^a-z0-9]/g,'');
 const offensive=name=>{
  const n=normalize(name);
  return BLOCKED_WORDS.some(w=>n.includes(normalize(w)));
 };
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
 const antiSpam=()=>{
  const now=Date.now();
  let a=[];try{a=JSON.parse(sessionStorage.getItem(ATTEMPT_KEY)||'[]');if(!Array.isArray(a))a=[];}catch{a=[];}
  a=a.filter(t=>now-t<10000);
  if(a.length>=5)return {ok:false,reason:'Za dużo prób zapisu naraz. Spróbuj ponownie za kilka sekund.'};
  a.push(now);sessionStorage.setItem(ATTEMPT_KEY,JSON.stringify(a));
  return {ok:true};
 };
 const add=entry=>{const all=read();all.push(entry);all.sort((a,b)=>b.score-a.score||new Date(a.date)-new Date(b.date));write(all);return all;};
 const top=(region,mode,limit=10)=>read().filter(x=>(!region||x.region===region)&&(!mode||x.mode===mode)).slice(0,limit);
 return {offensive,validate,sanitizeInput,antiSpam,add,top,read,MAX_NAME};
})();