
'use strict';
const MykoTrail=(()=>{
 function init(p){const x=p.expedition;if(x.trail)return x.trail;const collected=[];for(const [key,r] of Object.entries(x.rooms||{})){if(!/^[0-5]:[0-2]$/.test(key))continue;for(const i of r.found||[])if([0,1,2].includes(i))collected.push(key+':'+i)}return x.trail={version:1,collected:[...new Set(collected)],spent:0};}
 function gems(w,nodes){return nodes.flatMap((end,n)=>{const start=n?nodes[n-1]:0;return[0,1,2].map(i=>({id:w+':'+n+':'+i,s:start+(end-start)*(i+1)/4,node:n}))});}
 function collect(p,w,from,to,nodes,max){const x=init(p),lo=Math.min(from,to)-1,hi=Math.max(from,to)+1;const found=gems(w,nodes).filter(g=>g.s>=lo&&g.s<=hi&&g.s<=max&&!x.collected.includes(g.id));x.collected.push(...found.map(g=>g.id));return found;}
 function balance(p){const x=init(p);return Math.max(0,x.collected.length-x.spent);}
 function forge(p){const x=init(p);if(balance(p)<3)return false;x.spent+=3;p.expedition.potions.push('glow');return true;}
 return{init,gems,collect,balance,forge};
})();
if(typeof module!=='undefined')module.exports=MykoTrail;
