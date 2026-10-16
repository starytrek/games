'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM('<aside><div id="host"></div></aside>',{url:'https://starytrek.github.io/games/akademia-zarodnikow/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
let callbacks=new Map(),next=0,now=1000,saved,wins=0;
w.requestAnimationFrame=fn=>{callbacks.set(++next,fn);return next};w.cancelAnimationFrame=id=>callbacks.delete(id);w.matchMedia=()=>({matches:false});
Object.defineProperty(w.HTMLElement.prototype,'offsetParent',{get(){return this.parentElement}});
w.HTMLElement.prototype.setPointerCapture=function(){};w.HTMLElement.prototype.getClientRects=function(){return [this.getBoundingClientRect()]};
w.HTMLElement.prototype.getBoundingClientRect=function(){return {x:0,y:0,left:0,top:0,width:this.classList.contains('maze-joystick')?112:390,height:this.classList.contains('maze-joystick')?112:580,right:390,bottom:580}};
const grad={addColorStop(){}};const ctx=new Proxy({createRadialGradient:()=>grad},{get:(o,k)=>o[k]||(()=>{})});w.HTMLCanvasElement.prototype.getContext=()=>ctx;
w.eval(fs.readFileSync('akademia-zarodnikow/maze.js','utf8'));const M=w.MykoMaze,host=w.document.getElementById('host');
const s=M.create();s.grid=s.grid.map((row,y)=>row.map((_,x)=>!x||!y||x===20||y===14?1:0));s.armed=true;s.enemies=[];s.crates=[];s.gems=[];s.x=3;s.y=3;
function frames(n){for(let i=0;i<n;i++){now+=1000/60;const list=[...callbacks.values()];callbacks.clear();list.forEach(fn=>fn(now))}}
function pointer(el,type,id,x,y){const ev=new w.Event(type,{bubbles:true,cancelable:true});Object.assign(ev,{pointerId:id,clientX:x,clientY:y});el.dispatchEvent(ev);assert(ev.defaultPrevented||type!=='pointerdown')}
M.mount(host,{state:s,onSave:v=>saved=JSON.parse(JSON.stringify(v)),onWin:()=>wins++});frames(2);
const joystick=host.querySelector('.maze-joystick'),fire=host.querySelector('.maze-fire');pointer(joystick,'pointerdown',1,94,56);pointer(fire,'pointerdown',2,340,530);frames(54);assert(saved.x>3,'Joystick held moves while second pointer fires');assert(fire.classList.contains('firing'));assert(joystick.classList.contains('engaged'));pointer(joystick,'pointermove',1,56,94);frames(54);assert(saved.y>3.3,'Turn while shooting');pointer(fire,'pointercancel',2,340,530);frames(4);assert(!fire.classList.contains('firing'));assert(joystick.classList.contains('engaged'),'Releasing shot does not release joystick');pointer(joystick,'pointerup',1,56,94);frames(60);let x=saved.x,y=saved.y;frames(60);assert(Math.hypot(saved.x-x,saved.y-y)<.025,'Joystick release brakes');
w.dispatchEvent(new w.Event('blur'));assert(!host.querySelector('.maze-resume').hidden);x=saved.x;y=saved.y;frames(40);assert.equal(saved.x,x);assert.equal(saved.y,y);host.querySelector('.maze-resume').click();frames(5);
host.querySelector('.maze-reset').click();frames(3);assert.equal(saved.x,1);assert.equal(saved.y,1);assert.equal(saved.found,0);assert.equal(saved.lives,3);M.stop();assert.equal(callbacks.size,0,'Unmount cancels animation');
// Closing during the short victory animation must not lose the win on resume.
const won={...saved,won:true,found:6,broken:2};M.mount(host,{state:won,onSave:v=>saved=JSON.parse(JSON.stringify(v)),onWin:()=>wins++});frames(50);assert.equal(wins,1);assert.equal(callbacks.size,0);assert.equal(host.querySelectorAll('.maze-dpad').length,0);w.close();
console.log('PASS: two simultaneous touch pointer IDs, joystick turning + held fire, cancellation independence, 95ms release braking, blur pause/resume, fresh restart, saved victory resume and RAF cleanup');
