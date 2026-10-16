const assert=require('node:assert/strict'),M=require('../akademia-zarodnikow/maze.js');
let layouts=new Set();
for(let seed=1;seed<=120;seed++){
 let n=seed;const random=()=>((n=(n*1664525+1013904223)>>>0)/4294967296),s=M.create(random);layouts.add(JSON.stringify(s.grid));
 assert.equal(s.gems.length,6);assert.equal(s.crates.length,3);assert.equal(s.enemies.length,3);
 const first=M.path(s.grid,[1,1],s.gun,s.crates);assert(first.length>0,'Weapon must be reachable before breaking any wall');
 function reach(target){if(s.won)return;const path=M.path(s.grid,[s.x,s.y],target);assert(path.length);for(const [x,y]of path.slice(1)){if(s.won)return;const dx=x-s.x,dy=y-s.y,dir=dx===1?1:dx===-1?3:dy===1?2:0;s.dir=dir;if(s.crates.includes(x+','+y)){assert(s.armed);const hit=M.shoot(s);assert.equal(hit.kind,'crate')}assert(M.move(s,dir));}}
 reach(s.gun);assert(s.armed);for(const p of [...s.gems])reach(p);reach([M.W-2,M.H-2]);assert(s.won);assert.equal(s.found,6);assert(s.broken>=2);assert.equal(s.lives,3);
}
assert(layouts.size>115,'Layouts must vary');
const s=M.create();s.enemies=[{x:s.x,y:s.y,stun:0}];assert(M.collision(s));assert.equal(s.lives,2);assert(!M.collision(s),'No double damage during invulnerability');s.invulnerable=0;s.enemies[0].stun=3;assert(!M.collision(s),'Stunned shadows do not cause damage');
console.log('PASS: 120 solvable, varied mazes; weapon before gates; all collectibles reachable; shooting; exit conditions; collision and invulnerability');
