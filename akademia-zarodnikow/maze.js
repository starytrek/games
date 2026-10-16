'use strict';
/* A self-contained arcade layer. It never changes biology answers or awards knowledge points. */
const MykoMaze=(()=>{
 const W=21,H=15,dirs=[[0,-1],[1,0],[0,1],[-1,0]],key=(x,y)=>x+','+y;
 function shuffled(a,r=Math.random){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 function path(grid,start,end,blocked=[]){const q=[start],seen=new Set([key(...start)]),parents=new Map(),stop=new Set(blocked);for(let i=0;i<q.length;i++){const [x,y]=q[i];if(x===end[0]&&y===end[1]){const out=[[x,y]];let p=key(x,y);while(parents.has(p)){const v=parents.get(p);out.unshift(v);p=key(...v)}return out}for(const [dx,dy]of dirs){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(grid[ny]?.[nx]===0&&!seen.has(k)&&!stop.has(k)){seen.add(k);parents.set(k,[x,y]);q.push([nx,ny])}}}return []}
 function create(r=Math.random){const grid=Array.from({length:H},()=>Array(W).fill(1)),stack=[[1,1]];grid[1][1]=0;while(stack.length){const [x,y]=stack.at(-1),next=shuffled(dirs,r).map(([dx,dy])=>[x+dx*2,y+dy*2,dx,dy]).find(([nx,ny])=>nx>0&&ny>0&&nx<W-1&&ny<H-1&&grid[ny][nx]);if(next){const[nx,ny,dx,dy]=next;grid[y+dy][x+dx]=grid[ny][nx]=0;stack.push([nx,ny])}else stack.pop()}
 const route=path(grid,[1,1],[W-2,H-2]),gun=route[2],slots=[.3,.55,.78].map(f=>route[Math.max(5,Math.floor((route.length-1)*f))]),crates=[...new Set(slots.map(p=>key(...p)))];const reserved=new Set([key(1,1),key(W-2,H-2),key(...gun),...crates]);const cells=[];grid.forEach((row,y)=>row.forEach((v,x)=>{if(!v&&!reserved.has(key(x,y)))cells.push([x,y])}));const gems=shuffled(cells,r).slice(0,6),taken=new Set(gems.map(p=>key(...p))),enemies=shuffled(cells.filter(([x,y])=>!taken.has(key(x,y))&&Math.abs(x-1)+Math.abs(y-1)>10),r).slice(0,3).map(([x,y])=>({x,y,stun:0}));return{version:1,grid,x:1,y:1,dir:1,gun,armed:false,crates,gems,enemies,found:0,broken:0,lives:3,invulnerable:0,won:false,steps:0};}
 function move(s,dir){if(s.won||s.lives<=0)return false;s.dir=dir;const[dx,dy]=dirs[dir],x=s.x+dx,y=s.y+dy;if(s.grid[y]?.[x]!==0||s.crates.includes(key(x,y)))return false;s.x=x;s.y=y;s.steps++;if(!s.armed&&s.gun[0]===x&&s.gun[1]===y)s.armed=true;const n=s.gems.findIndex(p=>p[0]===x&&p[1]===y);if(n>=0){s.gems.splice(n,1);s.found++}if(x===W-2&&y===H-2&&s.found===6&&s.broken>=2)s.won=true;return true;}
 function shoot(s){if(!s.armed||s.won||s.lives<=0)return null;const[dx,dy]=dirs[s.dir];for(let i=1;i<=5;i++){const x=s.x+dx*i,y=s.y+dy*i;if(s.grid[y]?.[x]!==0)break;const k=key(x,y),n=s.crates.indexOf(k);if(n>=0){s.crates.splice(n,1);s.broken++;return{x,y,kind:'crate'}}const enemy=s.enemies.find(e=>e.x===x&&e.y===y);if(enemy){enemy.stun=5;return{x,y,kind:'enemy'}}}return{x:s.x+dx*2,y:s.y+dy*2,kind:'light'};}
 function enemies(s,dt,r=Math.random){s.invulnerable=Math.max(0,s.invulnerable-dt);for(const e of s.enemies){e.stun=Math.max(0,e.stun-dt);if(e.stun)continue;const route=path(s.grid,[e.x,e.y],[s.x,s.y],s.crates),choices=shuffled(dirs,r).map(([dx,dy])=>[e.x+dx,e.y+dy]).filter(([x,y])=>s.grid[y]?.[x]===0&&!s.crates.includes(key(x,y)));const p=r()<.55&&route.length>1?route[1]:choices[0];if(p){e.x=p[0];e.y=p[1]}}collision(s);}
 function collision(s){if(!s.invulnerable&&!s.won&&s.enemies.some(e=>!e.stun&&e.x===s.x&&e.y===s.y)){s.lives--;s.x=1;s.y=1;s.invulnerable=2;return true}return false;}
 // Smooth arcade simulation. Coordinates are tile centres; the original grid/save remains intact.
 const TAU=Math.PI*2,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const angleGap=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
 function blocked(s,x,y){return s.grid[y]?.[x]!==0||s.crates.includes(key(x,y));}
 function fits(s,x,y,r=.22){
  for(let yy=Math.floor(y-r+.5);yy<=Math.floor(y+r+.5);yy++)for(let xx=Math.floor(x-r+.5);xx<=Math.floor(x+r+.5);xx++){
   if(!blocked(s,xx,yy))continue;
   const nx=clamp(x,xx-.5,xx+.5),ny=clamp(y,yy-.5,yy+.5);
   if((x-nx)**2+(y-ny)**2<r*r-1e-8)return false;
  }return true;
 }
 function visible(s,a,b){const n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/.07);for(let i=1;i<=n;i++){const t=i/n;if(blocked(s,Math.round(a.x+(b.x-a.x)*t),Math.round(a.y+(b.y-a.y)*t)))return false}return true;}
 function target(s,body,range=6){return s.enemies.filter(e=>e.stun<=0&&Math.hypot(e.x-body.x,e.y-body.y)<=range&&visible(s,body,e)).sort((a,b)=>Math.hypot(a.x-body.x,a.y-body.y)-Math.hypot(b.x-body.x,b.y-body.y))[0]||null;}
 function validState(s){return s&&[1,2].includes(s.version)&&Array.isArray(s.grid)&&s.grid.length===H&&s.grid.every(row=>Array.isArray(row)&&row.length===W&&row.every(v=>v===0||v===1))&&Number.isFinite(s.x)&&Number.isFinite(s.y)&&Array.isArray(s.crates)&&Array.isArray(s.gems)&&Array.isArray(s.enemies)&&Array.isArray(s.gun)&&s.lives>0;}
 function runtime(state,r=Math.random){
  const s=validState(state)?JSON.parse(JSON.stringify(state)):create(r);s.version=2;
  if(!fits(s,s.x,s.y)){s.x=1;s.y=1}
  s.invulnerable=Math.max(0,Number(s.invulnerable)||0);s.enemies=s.enemies.map(e=>({...e,stun:Math.max(0,Number(e.stun)||0),waypoint:null,previous:null,flash:0,attack:0}));
  return{s,body:{x:s.x,y:s.y,vx:0,vy:0,angle:Number.isFinite(s.lookAngle)?s.lookAngle:(s.dir-1)*Math.PI/2,look:Number.isFinite(s.lookAngle)?s.lookAngle:(s.dir-1)*Math.PI/2},projectiles:[],particles:[],input:{x:0,y:0,fire:false},shotRequested:false,fireClock:0,aim:null,time:0,shake:0,gate:0,winTime:s.won?.7:0,events:[],rng:r};
 }
 function burst(g,x,y,color,n=10){for(let i=0;i<n&&g.particles.length<90;i++){const a=g.rng()*TAU,v=.6+g.rng()*2;g.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.3+g.rng()*.3,color})}}
 function emit(g,type,x,y){g.events.push(type);burst(g,x,y,type==='crate'?'#d8f397':type==='damage'?'#ffb0cb':'#a7fff0',type==='gate'?24:10);}
 function requestShot(g){g.shotRequested=true;}
 function doFire(g){
  const{s,body:b}=g;if(!s.armed||g.fireClock>0||s.won||s.lives<=0)return false;
  const t=g.aim,a=t?Math.atan2(t.y-b.y,t.x-b.x):b.look;
  g.projectiles.push({x:b.x,y:b.y,dx:Math.cos(a),dy:Math.sin(a),distance:0,life:.65});
  if(g.projectiles.length>18)g.projectiles.shift();g.fireClock=.3;g.shotRequested=false;emit(g,'shot',b.x+Math.cos(a)*.25,b.y+Math.sin(a)*.25);return true;
 }
 function pick(g){const{s,body:b}=g;
  if(!s.armed&&Math.hypot(b.x-s.gun[0],b.y-s.gun[1])<.4){s.armed=true;emit(g,'armed',b.x,b.y)}
  for(let i=s.gems.length-1;i>=0;i--)if(Math.hypot(b.x-s.gems[i][0],b.y-s.gems[i][1])<.4){s.gems.splice(i,1);s.found++;emit(g,'gem',b.x,b.y)}
  if(s.found===6&&s.broken>=2){if(!g.gate)emit(g,'gate',W-2,H-2);g.gate=1;
   if(Math.hypot(b.x-(W-2),b.y-(H-2))<.42){s.won=true;g.winTime=.7;emit(g,'win',b.x,b.y)}
  }
 }
 function travel(g,dt){
  const{s,body:b,input}=g;let ix=clamp(input.x,-1,1),iy=clamp(input.y,-1,1),len=Math.hypot(ix,iy);if(len>1){ix/=len;iy/=len}
  // Centre assistance is limited to 0.23 tile: turns feel forgiving without crossing walls.
  if(Math.abs(ix)>Math.abs(iy)*1.35&&Math.abs(b.y-Math.round(b.y))<.23){const yy=b.y+(Math.round(b.y)-b.y)*(1-Math.exp(-dt/.045));if(fits(s,b.x,yy))b.y=yy;iy=0}
  else if(Math.abs(iy)>Math.abs(ix)*1.35&&Math.abs(b.x-Math.round(b.x))<.23){const xx=b.x+(Math.round(b.x)-b.x)*(1-Math.exp(-dt/.045));if(fits(s,xx,b.y))b.x=xx;ix=0}
  const ease=1-Math.exp(-dt/.095);b.vx+=(ix*3.3-b.vx)*ease;b.vy+=(iy*3.3-b.vy)*ease;
  if(Math.hypot(ix,iy)>.12)b.look=Math.atan2(iy,ix);
  const x=b.x+b.vx*dt,y=b.y+b.vy*dt;
  if(fits(s,x,b.y))b.x=x;else b.vx=0;
  if(fits(s,b.x,y))b.y=y;else b.vy=0;
  s.x=b.x;s.y=b.y;s.lookAngle=b.angle;s.dir=((Math.round(b.look/(Math.PI/2))+1)%4+4)%4;
 }
 function moveEnemies(g,dt){const{s,body:b}=g;
  for(const e of s.enemies){e.flash=Math.max(0,e.flash-dt);e.attack=Math.max(0,e.attack-dt);e.stun=Math.max(0,e.stun-dt);if(e.stun>0)continue;
   if(!e.waypoint){
    // Older saves contain integer enemies; a paused smooth save may be midway along a corridor.
    const sx=Math.round(e.x),sy=Math.round(e.y),near=Math.hypot(b.x-e.x,b.y-e.y)<6;
    if(Math.hypot(e.x-sx,e.y-sy)>.02)e.waypoint=[sx,sy];
    else{const options=dirs.map(([dx,dy])=>[sx+dx,sy+dy]).filter(([x,y])=>!blocked(s,x,y));let route=near?path(s.grid,[sx,sy],[Math.round(b.x),Math.round(b.y)],s.crates):[];
     let choices=options.filter(p=>!e.previous||key(...p)!==key(...e.previous));if(!choices.length)choices=options;
     e.waypoint=route.length>1?route[1]:shuffled(choices,g.rng)[0];e.previous=[sx,sy];}
   }
   if(e.waypoint){const dx=e.waypoint[0]-e.x,dy=e.waypoint[1]-e.y,d=Math.hypot(dx,dy),v=Math.min(d,dt*(Math.hypot(b.x-e.x,b.y-e.y)<5?1.65:1.25));
    if(d>.001){const xx=e.x+dx/d*v,yy=e.y+dy/d*v;if(fits(s,xx,yy,.2)){e.x=xx;e.y=yy}else e.waypoint=null}
    if(d<=v+.001){if(e.waypoint){[e.x,e.y]=e.waypoint;e.waypoint=null}}
   }
   if(!s.invulnerable&&e.attack<=0&&Math.hypot(e.x-b.x,e.y-b.y)<.48&&visible(s,e,b)){
    s.lives--;s.invulnerable=2;e.attack=2;emit(g,'damage',b.x,b.y);b.x=s.x=1;b.y=s.y=1;b.vx=b.vy=0;g.shake=.15;break;
   }
  }
 }
 function advanceProjectiles(g,dt){const{s}=g;
  for(let i=g.projectiles.length-1;i>=0;i--){const p=g.projectiles[i];let remove=false;const n=Math.max(1,Math.ceil(dt*12/.08));
   for(let j=0;j<n&&!remove;j++){p.x+=p.dx*12*dt/n;p.y+=p.dy*12*dt/n;p.distance+=12*dt/n;
    const x=Math.round(p.x),y=Math.round(p.y),k=key(x,y),ci=s.crates.indexOf(k);
    if(ci>=0){s.crates.splice(ci,1);s.broken++;g.shake=.16;emit(g,'crate',x,y);remove=true}
    else if(s.grid[y]?.[x]!==0)remove=true;
    else{const e=s.enemies.find(e=>e.stun<=0&&Math.hypot(e.x-p.x,e.y-p.y)<.34);if(e){e.stun=5;e.flash=.25;emit(g,'hit',e.x,e.y);remove=true}}
   }
   p.life-=dt;if(remove||p.distance>=6||p.life<=0)g.projectiles.splice(i,1);
  }
 }
 function step(g,dt){dt=clamp(Number(dt)||0,0,.1);g.events=[];const n=Math.max(1,Math.ceil(dt/(1/120)));for(let i=0;i<n;i++){
   const d=dt/n,{s,body:b}=g;g.time+=d;g.fireClock=Math.max(0,g.fireClock-d);g.shake=Math.max(0,g.shake-d);s.invulnerable=Math.max(0,s.invulnerable-d);
   for(const p of g.particles){p.x+=p.vx*d;p.y+=p.vy*d;p.life-=d}g.particles=g.particles.filter(p=>p.life>0);
   if(s.won){g.winTime=Math.max(0,g.winTime-d);continue}if(s.lives<=0)continue;
   travel(g,d);pick(g);moveEnemies(g,d);g.aim=s.armed?target(s,b):null;
   const a=g.aim?Math.atan2(g.aim.y-b.y,g.aim.x-b.x):b.look;b.angle+=angleGap(b.angle,a)*(1-Math.exp(-d/.075));
   if(g.input.fire||g.shotRequested)doFire(g);advanceProjectiles(g,d);pick(g);
  }return g;
 }
 function camera(g,cam,dt,width,height){const scale=Math.max(width/10,height/10),vw=width/scale,vh=height/scale,ease=1-Math.exp(-Math.min(dt,.1)/.12);
  const tx=clamp(g.body.x,vw/2-.5,W-.5-vw/2),ty=clamp(g.body.y,vh/2-.5,H-.5-vh/2);cam.x+=(tx-cam.x)*ease;cam.y+=(ty-cam.y)*ease;cam.scale=scale;return cam;
 }
 let cleanup=null;
 function stop(){const dispose=cleanup;cleanup=null;dispose?.();}
 function mount(host,{state,onSave=()=>{},onWin=()=>{},title='Leśne laboratorium'}){
  stop();const g=runtime(state),s=g.s;let last=0,frameId=0,saveClock=0,finished=false,disposed=false,paused=false,firePointer=null,stickPointer=null,keyboard=new Set(),stick={x:0,y:0},disposers=[];
  const cam={x:g.body.x,y:g.body.y,scale:40};host.hidden=false;host.innerHTML=`<section class="maze-panel maze-smooth"><div class="maze-top"><strong class="maze-title"></strong><button class="maze-reset" aria-label="Rozpocznij nowy labirynt">↻</button><details class="maze-guide"><summary aria-label="Zasady labiryntu">?</summary><p>Zdobądź ✚, zbierz 6 świateł, rozbij 2 osłony i znajdź złotą bramę. Myko sam celuje w widoczną bakterię. Na komputerze: WASD / strzałki, spacja. Strzykawka światła jest baśniowym narzędziem.</p></details></div><div class="maze-hud" role="status"></div><div class="maze-viewport"><canvas width="720" height="620" tabindex="0" aria-label="Labirynt Myko. WASD lub strzałki: ruch. Spacja: strzał z automatycznym celowaniem."></canvas><div class="maze-toast" aria-live="polite"></div><div class="maze-controls"><div class="maze-joystick" role="group" aria-label="Joystick ruchu. Przesuń palcem w wybranym kierunku."><span class="maze-stick-rim"></span><span class="maze-stick-knob"></span><span class="maze-stick-label">RUCH</span></div><button class="maze-fire" aria-label="Strzał. Przytrzymaj, aby strzelać automatycznie."><span>✚</span>STRZAŁ</button></div><button class="maze-resume" hidden>Wznów grę</button><div class="maze-outcome" hidden><h3></h3><p></p><button class="maze-again">Spróbuj ponownie</button></div></div></section>`;
  const panel=host.querySelector('.maze-panel'),canvas=host.querySelector('canvas'),ctx=canvas.getContext('2d'),hud=host.querySelector('.maze-hud'),toast=host.querySelector('.maze-toast'),fire=host.querySelector('.maze-fire'),joystick=host.querySelector('.maze-joystick'),knob=host.querySelector('.maze-stick-knob'),resume=host.querySelector('.maze-resume'),outcome=host.querySelector('.maze-outcome');host.querySelector('.maze-title').textContent=title.replace(/ · labirynt$/,'');
  let toastUntil=0,lastHud='',lastDims='',width=720,height=620;
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function listen(el,type,fn,opts){el.addEventListener(type,fn,opts);disposers.push(()=>el.removeEventListener(type,fn,opts))}
  function save(){s.x=g.body.x;s.y=g.body.y;s.lookAngle=g.body.angle;onSave(s)}
  function message(text,seconds=2.2){toast.textContent=text;toastUntil=g.time+seconds;}
  function resetInput(){stickPointer=firePointer=null;stick={x:0,y:0};keyboard.clear();g.input={x:0,y:0,fire:false};g.shotRequested=false;knob.style.transform='translate(-50%,-50%)';joystick.classList.remove('engaged');fire.classList.remove('firing');}
  function active(){return !host.hidden&&canvas.isConnected&&canvas.offsetParent!==null&&!document.querySelector('dialog[open]')&&!document.hidden;}
  function pause(){if(finished)return;resetInput();paused=true;resume.hidden=false;save();}
  function update(){const text=`♥ ${s.lives}   ◇ ${s.found}/6   ▣ ${s.broken}/2   ${s.armed?'✚ GOTOWE':'ZNAJDŹ ✚'}`;if(text!==lastHud){hud.textContent=text;lastHud=text}fire.disabled=!s.armed||s.lives<=0||s.won;if(g.time>toastUntil)toast.textContent='';}
  function restart(){mount(host,{state:null,onSave,onWin,title})}
  listen(host.querySelector('.maze-reset'),'click',restart);listen(host.querySelector('.maze-again'),'click',restart);
  listen(resume,'click',()=>{paused=false;resume.hidden=true;last=0;canvas.focus()});
  listen(document,'visibilitychange',()=>{if(document.hidden)pause()});listen(window,'blur',pause);
  const keys={ArrowUp:[0,-1],w:[0,-1],W:[0,-1],ArrowRight:[1,0],d:[1,0],D:[1,0],ArrowDown:[0,1],s:[0,1],S:[0,1],ArrowLeft:[-1,0],a:[-1,0],A:[-1,0]};
  listen(document,'keydown',e=>{if(!active()||paused||finished||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(e.key in keys||e.code==='Space'){e.preventDefault();e.stopImmediatePropagation();keyboard.add(e.key in keys?e.key:' ');if(e.code==='Space'&&!e.repeat)requestShot(g)}},{capture:true});
  listen(document,'keyup',e=>{keyboard.delete(e.key);if(e.code==='Space')keyboard.delete(' ')},{capture:true});
  function aimStick(e){const rect=joystick.getBoundingClientRect(),radius=rect.width*.34,dx=e.clientX-rect.left-rect.width/2,dy=e.clientY-rect.top-rect.height/2,d=Math.hypot(dx,dy),v=Math.min(1,d/radius),mag=v<.13?0:(v-.13)/.87;stick={x:d?dx/d*mag:0,y:d?dy/d*mag:0};const travel=Math.min(d,radius);knob.style.transform=`translate(calc(-50% + ${d?dx/d*travel:0}px),calc(-50% + ${d?dy/d*travel:0}px))`;}
  listen(joystick,'pointerdown',e=>{if(stickPointer!==null||finished||paused)return;e.preventDefault();stickPointer=e.pointerId;joystick.setPointerCapture?.(e.pointerId);joystick.classList.add('engaged');aimStick(e)});
  listen(joystick,'pointermove',e=>{if(e.pointerId!==stickPointer)return;e.preventDefault();aimStick(e)});
  function releaseStick(e){if(e.pointerId!==stickPointer)return;stickPointer=null;stick={x:0,y:0};knob.style.transform='translate(-50%,-50%)';joystick.classList.remove('engaged')}
  for(const t of ['pointerup','pointercancel','lostpointercapture'])listen(joystick,t,releaseStick);
  listen(fire,'pointerdown',e=>{if(firePointer!==null||paused||fire.disabled)return;e.preventDefault();firePointer=e.pointerId;fire.setPointerCapture?.(e.pointerId);fire.classList.add('firing');requestShot(g)});
  function releaseFire(e){if(e.pointerId!==firePointer)return;firePointer=null;fire.classList.remove('firing')}
  for(const t of ['pointerup','pointercancel','lostpointercapture'])listen(fire,t,releaseFire);
  // Assistive-technology / keyboard activation still gets one shot without a pointer.
  listen(fire,'click',e=>{if(e.detail===0)requestShot(g)});
  listen(canvas,'pointerdown',()=>canvas.focus({preventScroll:true}));
  function events(){for(const type of g.events){if(type==='armed')message('✚ Strzykawka gotowa. Przytrzymaj STRZAŁ — Myko sam celuje.');if(type==='gem')message('Światło '+s.found+'/6');if(type==='crate')message('Osłona rozbita! '+s.broken+'/2');if(type==='hit')message('Bakteria ogłuszona');if(type==='damage')message('Uwaga! Chwila ochrony po trafieniu.');if(type==='gate')message('Złota brama otwarta!',4)}
   if(s.won&&g.winTime<=0&&!finished){finished=true;save();stop();onWin(s);return}
   if(s.lives<=0&&!finished){finished=true;resetInput();save();outcome.hidden=false;outcome.querySelector('h3').textContent='Myko wraca do bazy';outcome.querySelector('p').textContent='Odkrycia biologiczne są zapisane. Spróbuj nowego labiryntu.';}
  }
  function resize(){const rect=canvas.getBoundingClientRect(),ratio=Math.min(window.devicePixelRatio||1,1.6),dims=[Math.round(rect.width),Math.round(rect.height),ratio].join(':');if(!rect.width||!rect.height||dims===lastDims)return;lastDims=dims;width=rect.width;height=rect.height;canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0)}
  function draw(){resize();if(!ctx)return;ctx.save();ctx.fillStyle='#081f26';ctx.fillRect(0,0,width,height);const z=cam.scale;
   if(g.shake>0&&!reduced)ctx.translate(Math.sin(g.time*110)*2*g.shake/.16,Math.cos(g.time*91)*1.5*g.shake/.16);
   ctx.translate(width/2-cam.x*z,height/2-cam.y*z);ctx.scale(z,z);
   const xmin=Math.max(0,Math.floor(cam.x-width/2/z)-1),xmax=Math.min(W-1,Math.ceil(cam.x+width/2/z)+1),ymin=Math.max(0,Math.floor(cam.y-height/2/z)-1),ymax=Math.min(H-1,Math.ceil(cam.y+height/2/z)+1);
   for(let y=ymin;y<=ymax;y++)for(let x=xmin;x<=xmax;x++){
    if(s.grid[y][x]){ctx.fillStyle='#1e4d58';ctx.fillRect(x-.48,y-.48,.96,.96);ctx.fillStyle='#316b72';ctx.fillRect(x-.44,y-.44,.88,.1);ctx.fillStyle='#123d46';ctx.fillRect(x-.44,y+.32,.88,.1)}
    else{ctx.fillStyle='#12323a';ctx.fillRect(x-.5,y-.5,1,1);ctx.fillStyle='#32525a';ctx.fillRect(x-.025,y-.025,.05,.05)}
   }
   for(const item of s.crates){const[x,y]=item.split(',').map(Number);ctx.fillStyle='#aac768';ctx.beginPath();ctx.roundRect(x-.39,y-.39,.78,.78,.17);ctx.fill();ctx.strokeStyle='#dbec9c';ctx.lineWidth=.035;ctx.stroke();ctx.fillStyle='#668b44';ctx.fillRect(x-.25,y-.06,.5,.12);}
   for(const[x,y]of s.gems){const bob=reduced?0:Math.sin(g.time*3+x)*.055;ctx.fillStyle='#72d9cd22';ctx.beginPath();ctx.arc(x,y,.46,0,TAU);ctx.fill();ctx.fillStyle='#a9fff0';ctx.beginPath();ctx.moveTo(x,y-.28+bob);ctx.lineTo(x+.18,y+bob);ctx.lineTo(x,y+.28+bob);ctx.lineTo(x-.18,y+bob);ctx.fill();ctx.fillStyle='#effff3';ctx.fillRect(x-.025,y-.16+bob,.05,.17);}
   if(!s.armed){const[x,y]=s.gun;ctx.fillStyle='#fce4a322';ctx.beginPath();ctx.arc(x,y,.45,0,TAU);ctx.fill();ctx.strokeStyle='#ffe2a0';ctx.lineWidth=.13;ctx.beginPath();ctx.moveTo(x-.22,y);ctx.lineTo(x+.22,y);ctx.moveTo(x,y-.22);ctx.lineTo(x,y+.22);ctx.stroke();}
   const gx=W-2,gy=H-2,open=g.gate||s.found===6&&s.broken>=2;ctx.strokeStyle=open?'#ffe8a0':'#8f8059';ctx.lineWidth=.08;ctx.beginPath();ctx.roundRect(gx-.33,gy-.4,.66,.8,.13);ctx.stroke();ctx.fillStyle=open?'#ffda5c44':'#8f805920';ctx.fill();if(open){ctx.fillStyle='#ffe9aa';ctx.beginPath();ctx.arc(gx,gy,.11+Math.sin(g.time*4)*.03,0,TAU);ctx.fill()}
   for(const e of s.enemies){ctx.save();ctx.translate(e.x,e.y);if(!reduced)ctx.rotate(Math.sin(g.time*5+e.x)*.07);ctx.fillStyle=e.flash>0?'#ffffff':e.stun>0?'#73c8cd':'#c68cc8';ctx.beginPath();ctx.ellipse(0,0,.29,.22,0,0,TAU);ctx.fill();ctx.strokeStyle=e.stun>0?'#b3f3ee':'#e5b2e4';ctx.lineWidth=.045;for(let a=0;a<TAU;a+=Math.PI/4){ctx.beginPath();ctx.moveTo(Math.cos(a)*.24,Math.sin(a)*.18);ctx.lineTo(Math.cos(a)*.36,Math.sin(a)*.29);ctx.stroke()}ctx.fillStyle='#243443';ctx.fillRect(-.13,-.08,.065,.075);ctx.fillRect(.065,-.08,.065,.075);if(e.stun>0){ctx.fillStyle='#f0edba';ctx.font='.22px system-ui';ctx.textAlign='center';ctx.fillText('✧',0,-.4)}ctx.restore();}
   if(g.aim){ctx.strokeStyle='#f7e6aa99';ctx.lineWidth=.025;ctx.setLineDash([.09,.1]);ctx.beginPath();ctx.arc(g.aim.x,g.aim.y,.47,0,TAU);ctx.stroke();ctx.setLineDash([])}
   const b=g.body;if(!s.invulnerable||Math.floor(g.time*10)%2){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.angle);const walk=!reduced?Math.sin(g.time*18)*Math.min(.035,Math.hypot(b.vx,b.vy)*.012):0;ctx.fillStyle='#06151c66';ctx.beginPath();ctx.ellipse(0,.07,.3,.22,0,0,TAU);ctx.fill();ctx.fillStyle='#fff0d5';ctx.beginPath();ctx.ellipse(-.04,walk,.2,.24,0,0,TAU);ctx.fill();ctx.fillStyle='#efa3c7';ctx.beginPath();ctx.ellipse(-.13,walk,.22,.32,0,Math.PI/2,Math.PI*1.5);ctx.fill();ctx.fillStyle='#fff0db';ctx.beginPath();ctx.arc(-.2,-.13+walk,.045,0,TAU);ctx.arc(-.22,.09+walk,.035,0,TAU);ctx.fill();ctx.fillStyle='#25313d';ctx.beginPath();ctx.arc(.07,-.085+walk,.035,0,TAU);ctx.arc(.07,.085+walk,.035,0,TAU);ctx.fill();if(s.armed){ctx.strokeStyle='#d7ffee';ctx.lineWidth=.07;ctx.beginPath();ctx.moveTo(.16,.1);ctx.lineTo(.4,.1);ctx.stroke();ctx.fillStyle='#83dfd6';ctx.fillRect(.2,.025,.15,.15)}ctx.restore();}
   for(const p of g.projectiles){ctx.strokeStyle='#c0fff066';ctx.lineWidth=.15;ctx.beginPath();ctx.moveTo(p.x-p.dx*.3,p.y-p.dy*.3);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.fillStyle='#e0fff5';ctx.beginPath();ctx.arc(p.x,p.y,.075,0,TAU);ctx.fill()}
   for(const p of g.particles){ctx.globalAlpha=Math.min(1,p.life*3);ctx.fillStyle=p.color;ctx.fillRect(p.x-.025,p.y-.025,.05,.05)}ctx.globalAlpha=1;ctx.restore();
   // Soft edge vignette hints at the unexplored maze without hiding the immediate corridor.
   const shade=ctx.createRadialGradient(width*.5,height*.45,Math.min(width,height)*.28,width*.5,height*.45,Math.max(width,height)*.72);shade.addColorStop(0,'#06192300');shade.addColorStop(1,'#06192388');ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);
  }
  function frame(now){if(disposed)return;const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;if(active()&&!paused&&!finished){let x=stick.x,y=stick.y;for(const k of keyboard){if(keys[k]){x+=keys[k][0];y+=keys[k][1]}}g.input={x,y,fire:firePointer!==null||keyboard.has(' ')};step(g,dt);events();if(disposed)return;camera(g,cam,dt,width,height);saveClock+=dt;if(saveClock>=.8){save();saveClock=0}}else if(!active()){resetInput();last=0}update();draw();frameId=requestAnimationFrame(frame)}
  cleanup=()=>{disposed=true;cancelAnimationFrame(frameId);resetInput();save();disposers.forEach(f=>f());};
  update();resize();camera(g,cam,1,width,height);draw();save();frameId=requestAnimationFrame(frame);return s;
 }
 return{create,path,move,shoot,enemies,collision,mount,stop,W,H,runtime,step,requestShot,visible,target,fits,camera};
})();
if(typeof window!=='undefined')window.MykoMaze=MykoMaze;
if(typeof module!=='undefined')module.exports=MykoMaze;
