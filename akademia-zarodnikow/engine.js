'use strict';
const MykoEngine=(()=>{
 const curves=[[[120,700],[110,630],[145,560],[220,555]],[[220,555],[350,550],[330,390],[460,380]],[[460,380],[520,375],[550,320],[510,300]],[[510,300],[485,250],[620,240],[650,330]],[[650,330],[675,420],[720,490],[810,500]],[[810,500],[870,520],[900,620],[880,700]]];
 const points=[{x:120,y:700,s:0}],ends=[];let length=0;
 for(const c of curves){for(let i=1;i<=35;i++){const t=i/35,u=1-t;const x=u*u*u*c[0][0]+3*u*u*t*c[1][0]+3*u*t*t*c[2][0]+t*t*t*c[3][0],y=u*u*u*c[0][1]+3*u*u*t*c[1][1]+3*u*t*t*c[2][1]+t*t*t*c[3][1];const last=points[points.length-1];length+=Math.hypot(x-last.x,y-last.y);points.push({x,y,s:length})}ends.push(length)}
 const nodeS=[ends[0],ends[2],ends[4]],path='M120 700 '+curves.map(c=>'C'+c.slice(1).map(p=>p.join(' ')).join(' ')).join(' ');
 function at(s){s=Math.max(0,Math.min(length,s));let i=points.findIndex(p=>p.s>=s);if(i<=0)return {...points[0]};const a=points[i-1],b=points[i],t=(s-a.s)/(b.s-a.s);return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,s,angle:Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI}}
 function closest(x,y,max=length){return points.filter(p=>p.s<=max).reduce((a,b)=>Math.hypot(a.x-x,a.y-y)<Math.hypot(b.x-x,b.y-y)?a:b)}
 function ease(t){return t*t*(3-2*t)}
 function migrate(input){const s=input&&typeof input==='object'&&!Array.isArray(input)?input:{};s.people=s.people&&typeof s.people==='object'?s.people:{};s.version=2;for(const name of Object.keys(s.people)){const p=s.people[name];if(!p||typeof p!=='object'){delete s.people[name];continue}p.facts=p.facts||{};p.complete=Array.isArray(p.complete)?p.complete:[];p.runs=Array.isArray(p.runs)?p.runs:[];p.stars=Number.isFinite(p.stars)?p.stars:0;p.world=Number.isInteger(p.world)?p.world:0;p.positions=p.positions||{};p.sessions=p.sessions||{};p.history=Array.isArray(p.history)?p.history:[];if(p.active){p.active.hintLevel=p.active.hintLevel||(+!!p.active.hinted);p.active.draft=p.active.draft||[];p.active.matched=p.active.matched||[]}}return s}
 function blank(){return{facts:{},complete:[],stars:0,runs:[],world:0,active:null,positions:{},sessions:{},history:[]}}
 function evaluate(q,draft,matched){if(q.type==='link')return q.pairs.every((p,i)=>matched[i]===p[1]);if(q.type==='sort')return q.correct.every((v,i)=>matched[i]===v);if(q.type==='order')return draft.length===q.correct.length&&draft.every((v,i)=>v===q.correct[i]);return draft.length===q.correct.length&&q.correct.every(i=>draft.includes(i))}
 function ready(q,draft,matched){if(q.type==='link')return q.pairs.every((_,i)=>!!matched[i]);if(q.type==='sort')return q.items.every((_,i)=>Number.isInteger(matched[i]));if(q.type==='order')return draft.length===q.options.length;return draft.length>0}
 function award(p,a,q,correct){const f=p.facts[q.id]||(p.facts[q.id]={best:0,tries:0,wrong:0,weak:false});f.tries++;const row={id:q.id,at:new Date().toISOString(),correct,hints:a.hintLevel||0,attempt:a.tries+1};p.history.push(row);p.history=p.history.slice(-350);if(!correct){a.tries++;a.mistakes++;f.wrong++;f.weak=true;return 0}const reward=a.tries?20:a.hinted?60:100,delta=Math.max(0,reward-(f.best||0));p.stars+=delta;a.earned+=delta;f.best=Math.max(f.best||0,reward);f.weak=reward<100;if(!a.tries)a.first++;a.solved=true;return delta}
 function review(p,questions){return questions.filter(q=>p.facts[q.id]?.weak).sort((a,b)=>(p.facts[b.id].wrong||0)-(p.facts[a.id].wrong||0))}
 return {path,points,nodeS,length,at,closest,ease,migrate,blank,evaluate,ready,award,review};
})();
if(typeof module!=='undefined')module.exports=MykoEngine;
