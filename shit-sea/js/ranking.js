'use strict';
window.GeoSeaRanking=(()=>{
 const KEY='shitsea-ranking-v1';
 const BLOCKED=[/(^|[^a-z])kurw[a-z]*/i,/chuj|huj/i,/pierdol/i,/jeb[a-z]*/i,/pizd/i,/cip[a-z]*/i,/kutas/i,/skurw/i,/zjeb/i,/pojeb/i,/cwel/i,/dziwk/i,/suk[a-z]*/i];
 const normalize=s=>String(s||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l');
 const offensive=name=>{const n=normalize(name).replace(/[@4]/g,'a').replace(/[0]/g,'o').replace(/[1!]/g,'i').replace(/[3]/g,'e').replace(/[$5]/g,'s');return BLOCKED.some(r=>r.test(n));};
 const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[];}catch{return [];}};
 const write=v=>localStorage.setItem(KEY,JSON.stringify(v.slice(0,100)));
 const add=entry=>{const all=read();all.push(entry);all.sort((a,b)=>b.score-a.score||new Date(a.date)-new Date(b.date));write(all);return all;};
 const top=(region,mode,limit=10)=>read().filter(x=>(!region||x.region===region)&&(!mode||x.mode===mode)).slice(0,limit);
 return {offensive,add,top,read};
})();