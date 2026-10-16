'use strict';
const assert=require('node:assert/strict'),M=require('../akademia-zarodnikow/maze.js');
const seed=n=>()=>((n=(n*1664525+1013904223)>>>0)/4294967296);
function room(){const s=M.create(seed(1));s.grid=s.grid.map((row,y)=>row.map((_,x)=>x===0||y===0||x===M.W-1||y===M.H-1?1:0));s.x=3;s.y=3;s.armed=true;s.enemies=[];s.gems=[];s.crates=[];return M.runtime(s,seed(9))}
const advance=(g,seconds,dt=1/60)=>{for(let i=0;i<Math.round(seconds/dt);i++)M.step(g,dt)};
{
 const g=room();g.input.x=1;M.step(g,1/60);assert(g.body.x>3&&g.body.x<3.03,'Fractional movement begins immediately');advance(g,.2);assert(g.body.vx>2.8);g.input.x=0;const start=g.body.x,v=g.body.vx;advance(g,.1);assert(g.body.vx<v*.4&&g.body.vx>v*.25,'95ms damping');advance(g,.4);assert(g.body.x-start<.35,'No icy long slide');
 const a=room(),b=room();a.input.x=b.input.x=1;advance(a,1,1/30);advance(b,1,1/120);assert(Math.abs(a.body.x-b.body.x)<.06,'Delta-time invariant movement');
 const wall=room();wall.s.grid[3][4]=1;wall.input.x=1;advance(wall,3);assert(wall.body.x<3.29&&M.fits(wall.s,wall.body.x,wall.body.y),'No tunnelling through wall');wall.input.y=1;advance(wall,1);assert(M.fits(wall.s,wall.body.x,wall.body.y),'Wall sliding remains valid');
 const turn=room();turn.body.y=turn.s.y=3.2;turn.input.x=1;advance(turn,.18);assert(Math.abs(turn.body.y-3)<.025,'Forgiving turn centring');
}
{
 const g=room();g.s.enemies=[{x:5,y:3,stun:0,attack:0,flash:0},{x:3,y:6,stun:0,attack:0,flash:0}];g.body.look=Math.PI;assert.equal(M.target(g.s,g.body),g.s.enemies[0]);g.s.grid[3][4]=1;assert.equal(M.target(g.s,g.body),g.s.enemies[1],'Occluded closest enemy skipped');g.s.grid[3][4]=0;
 M.requestShot(g);M.step(g,1/60);assert(g.body.angle>0||g.body.angle===0);const bx=g.body.x,by=g.body.y;advance(g,.3);assert(g.s.enemies[0].stun>0,'Autoaim hits without player facing target');assert.equal(g.body.x,bx);assert.equal(g.body.y,by);g.s.grid[4][3]=1;M.step(g,1/60);assert.equal(g.aim,null,'Lost line of sight clears marker');
 const hold=room();hold.input.fire=true;let shots=0;for(let i=0;i<60;i++){M.step(hold,1/60);shots+=hold.events.filter(e=>e==='shot').length}assert.equal(shots,4,'Held fire repeats at 300ms cooldown');assert(hold.projectiles.length>=1);assert(hold.fireClock>0);assert(hold.particles.length<=90);assert(hold.projectiles.length<=18);
 const shield=room();shield.s.crates=['4,3'];shield.input.fire=true;advance(shield,.8);assert.equal(shield.s.broken,1);assert.equal(shield.s.crates.length,0);advance(shield,.8);assert.equal(shield.s.broken,1,'No duplicate destruction credit');
 const blocked=room();blocked.s.grid[3][4]=1;blocked.s.enemies=[{x:5,y:3,stun:0,attack:0,flash:0}];blocked.input.fire=true;advance(blocked,.25);assert.equal(blocked.s.enemies[0].stun,0,'Shots cannot pass through walls');
 const hurt=room();hurt.s.enemies=[{x:3,y:3,stun:0,attack:0,flash:0}];M.step(hurt,1/60);assert.equal(hurt.s.lives,2);hurt.s.enemies[0].x=hurt.body.x;hurt.s.enemies[0].y=hurt.body.y;M.step(hurt,1/60);assert.equal(hurt.s.lives,2,'Contact damage cooldown');
}
{
 const g=room();const cam={x:3,y:3,scale:1};g.body.x=10;M.camera(g,cam,1/60,390,620);assert(cam.x>3&&cam.x<10,'Camera eases');assert(390/cam.scale<10&&620/cam.scale<=10,'Mobile crops map and keeps square tiles');
 const old=M.create(seed(42)),before=JSON.stringify(old),newGame=M.runtime(old);assert.equal(JSON.stringify(old),before,'Old save is never mutated during migration');assert.equal(newGame.s.version,2);assert.deepEqual(newGame.s.grid,old.grid);assert.deepEqual(newGame.s.gems,old.gems);
 newGame.input.x=1;advance(newGame,.15);const resumed=M.runtime(JSON.parse(JSON.stringify(newGame.s)));assert.equal(resumed.body.x,newGame.body.x);assert.equal(resumed.s.lives,newGame.s.lives);assert.equal(resumed.s.found,newGame.s.found);
}
// Solve through actual continuous physics + moving projectiles; no player teleportation.
for(let n=1;n<=24;n++){
 const s=M.create(seed(n));s.enemies=[];let g=M.runtime(s,seed(n+900));
 function reach(goal){const route=M.path(g.s.grid,[Math.round(g.body.x),Math.round(g.body.y)],goal);assert(route.length);for(const [x,y]of route.slice(1)){
  if(g.s.won)return;let loops=0;
  while(Math.hypot(g.body.x-x,g.body.y-y)>.035){
   const dx=x-g.body.x,dy=y-g.body.y;g.body.look=Math.atan2(dy,dx);g.input={x:Math.max(-1,Math.min(1,dx*5)),y:Math.max(-1,Math.min(1,dy*5)),fire:g.s.armed};M.step(g,1/60);
   assert(M.fits(g.s,g.body.x,g.body.y),'Valid collision throughout route');assert(++loops<240,'Route must not get stuck');if(g.s.won)return;
  }
 }}
 reach(g.s.gun);assert(g.s.armed);g=M.runtime(JSON.parse(JSON.stringify(g.s)),seed(n+1800));for(const gem of [...g.s.gems])reach(gem);reach([M.W-2,M.H-2]);assert(g.s.won,'Whole smooth run can win');assert.equal(g.s.found,6);assert(g.s.broken>=2);
}
// Patrol/chase runs continuously and stays inside corridors, even across a save/resume.
for(let n=30;n<40;n++){let g=M.runtime(M.create(seed(n)),seed(n+500));g.s.invulnerable=999;for(let i=0;i<1800;i++){if(i===900)g=M.runtime(JSON.parse(JSON.stringify(g.s)),seed(n+600));M.step(g,1/60);g.s.enemies.forEach(e=>assert(M.fits(g.s,e.x,e.y,.2),'Enemy cannot cross walls'))}}
console.log('PASS: continuous/delta-time motion, 95ms damping, corner assist, walls, nearest visible autoaim, projectiles, cooldown, stun, damage, camera, old-save migration/resume and 24 full smooth victories');
