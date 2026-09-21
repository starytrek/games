
'use strict';
/* sHIT.SEA: split GitHub Pages application. Geographical positions are immutable.
   Every geographic layer and annotation uses the same SVG viewBox. */
const DATA={...window.GEOSEA_DATA,maps:window.GEOSEA_MAPS};
const SEAS=Object.fromEntries(DATA.seas.map(s=>[s.id,s]));
const REGIONS=Object.fromEntries(DATA.regions.map(r=>[r.id,r]));
const $=id=>document.getElementById(id);
const NS='http://www.w3.org/2000/svg';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\u0142/g,'l');
const isPhone=()=>matchMedia('(max-width:760px)').matches;
const el=(tag,attrs={})=>{let n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;};
const state={region:'europe',mode:'study',phase:'study',selected:null,queue:[],index:0,records:[],solved:new Set(),problems:new Set(),wrongCounts:{},wrongClicks:0,tries:0,score:0,feedback:'',wrong:null,lastResult:null,retryIds:null,roundMode:'ten',timer:null,token:0};
let cam={cx:500,cy:500,u:1},baseU=1,size={w:1,h:1},map=null,raf=0,toastTimer=0,flashTimer=0,effectRaf=0,renderedLabels=[],lastFocus=null;
const active=()=>state.phase==='playing'||state.phase==='reveal';
const current=()=>state.queue[state.index];
const region=()=>REGIONS[state.region];
const point=id=>map.points[id];
const screen=p=>[(p[0]-cam.cx)/cam.u+size.w/2,(p[1]-cam.cy)/cam.u+size.h/2];
const world=(x,y)=>[cam.cx+(x-size.w/2)*cam.u,cam.cy+(y-size.h/2)*cam.u];
const zoomLevel=()=>baseU/cam.u;
const measureContext=document.createElement('canvas').getContext('2d');
function announce(s){$('announcer').textContent=s;}
function toast(s){$('toast').textContent=s;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2600);}
function closeSheet(){$('side').classList.remove('open');$('sheetShade').classList.remove('open');}
function openSheet(){$('side').classList.add('open');$('sheetShade').classList.add('open');}
function cancelPending(){clearTimeout(state.timer);state.timer=null;state.token++;clearTimeout(flashTimer);state.wrong=null;cancelAnimationFrame(effectRaf);$('effects').replaceChildren();}
function setRegion(id){if(!REGIONS[id])return;if(active()){toast('Najpierw zako\u0144cz bie\u017c\u0105 gr\u0119.');syncControls();return;}cancelPending();state.region=id;state.selected=null;state.solved.clear();state.records=[];state.score=0;state.retryIds=null;state.lastResult=null;$('search').value='';state.phase=state.mode==='study'?'study':'ready';loadMap();updateUI();closeSheet();}
function loadMap(){map=DATA.maps[state.region];const g=$('geography');g.replaceChildren();$('clipRect').setAttribute('x','0');$('clipRect').setAttribute('y','0');$('clipRect').setAttribute('width',map.width);$('clipRect').setAttribute('height',map.height);
 const grid=el('path',{d:map.grid,fill:'none',stroke:'#668b99','stroke-opacity':'.16','stroke-width':'.5','vector-effect':'non-scaling-stroke'});g.append(grid);
 for(const [type,d]of Object.entries(map.paths).sort((a,b)=>+a[0]-+b[0])){g.append(el('path',{d,fill:(+type%2===1)?'#2d5059':'#102534',stroke:'#72999e','stroke-width':'.62','stroke-linejoin':'round','vector-effect':'non-scaling-stroke'}));}
 $('regionTitle').textContent=region().name;$('mapCaption').textContent=region().ids.length+' AKWEN\u00d3W';
 $('presets').innerHTML=map.presets.map((p,i)=>`<button data-preset="${i}">${esc(p.label)}</button>`).join('');resizeMap(true);
}
function resizeMap(reset=false){let rect=$('atlas').getBoundingClientRect();if(rect.width<2||rect.height<2)return;let previousZoom=zoomLevel();size={w:rect.width,h:rect.height};baseU=Math.max(map.width/Math.max(100,size.w-42),map.height/Math.max(100,size.h-100));if(reset){cam={cx:map.width/2,cy:map.height/2,u:baseU};}else cam.u=baseU/Math.max(1,Math.min(22,previousZoom));draw();}
function resetCamera(){cam={cx:map.width/2,cy:map.height/2,u:baseU};draw();}
function setZoom(factor,x=size.w/2,y=size.h/2){let z=Math.max(1,Math.min(22,zoomLevel()*factor));const before=world(x,y);cam.u=baseU/z;cam.cx=before[0]-(x-size.w/2)*cam.u;cam.cy=before[1]-(y-size.h/2)*cam.u;clampCamera();draw();}
function focusAt(p,z){cam={cx:p[0],cy:p[1],u:baseU/Math.max(1,Math.min(22,z))};clampCamera();draw();}
function clampCamera(){cam.cx=Math.max(-map.width*.25,Math.min(map.width*1.25,cam.cx));cam.cy=Math.max(-map.height*.25,Math.min(map.height*1.25,cam.cy));}
function requestDraw(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;draw();});}
function draw(){if(!map)return;const vb=[cam.cx-size.w*cam.u/2,cam.cy-size.h*cam.u/2,size.w*cam.u,size.h*cam.u];$('atlas').setAttribute('viewBox',vb.join(' '));$('zoomValue').textContent=zoomLevel().toFixed(1)+'\u00d7';drawLabels();drawMarkers();}
function drawMarkers(){const root=$('markers');root.replaceChildren();const study=state.phase==='study';const phone=isPhone();const hit=phone?19:15;
 // All hits go through one nearest-point resolver, never SVG stacking order.
 for(const id of region().ids){const p=point(id),sc=screen(p);if(sc[0]<-30||sc[0]>size.w+30||sc[1]<-30||sc[1]>size.h+30)continue;let solved=state.solved.has(id);let selected=study&&state.selected===id;let crowded=region().ids.some(other=>other!==id&&Math.hypot(...screen(point(other)).map((v,k)=>v-sc[k]))<24);let radius=(crowded?3.8:5.2)*cam.u;
 const group=el('g',{'data-marker':id});group.append(el('circle',{cx:p[0],cy:p[1],r:hit*cam.u,class:'marker-hit'}));
 if(selected)group.append(el('circle',{cx:p[0],cy:p[1],r:10.5*cam.u,'stroke-width':1.5*cam.u,class:'selection-ring'}));
 group.append(el('circle',{cx:p[0],cy:p[1],r:radius,'stroke-width':(selected?2:1.25)*cam.u,class:'marker-dot'+(solved?' solved':'')+(state.wrong===id?' wrong':'')+(selected?' selected':'')}));
 if(solved){const tick=el('text',{x:p[0],y:p[1]+.35*cam.u,'font-size':7.5*cam.u,class:'marker-check'});tick.textContent='\u2713';group.append(tick);}
 if(study){const title=el('title');title.textContent=SEAS[id].name;group.append(title);}root.append(group);
 }
}
function intersects(a,b,pad=3){return a.x<b.x+b.w+pad&&a.x+a.w+pad>b.x&&a.y<b.y+b.h+pad&&a.y+a.h+pad>b.y;}
function labelLines(name,font,maxWidth){measureContext.font=`550 ${font}px system-ui`;let words=name.split(' '),lines=[],line='';for(const word of words){let attempt=(line?line+' ':'')+word;if(line&&measureContext.measureText(attempt).width>maxWidth){lines.push(line);line=word;}else line=attempt;}if(line)lines.push(line);return lines;}

// Two ordered annotation banks on phones. Dynamic programming minimizes
// leader lengths subject to non-overlap, marker clearance and screen bounds.
// The geographic map itself keeps its full width and immutable coordinates.
function mobileLabelBanks(items,markerObstacles){
 const ordered=[...items].sort((a,b)=>a.p[0]-b.p[0]);const mid=Math.ceil(ordered.length/2);let result=[];
 for(const [bank,side]of [[ordered.slice(0,mid),'left'],[ordered.slice(mid),'right']]){
  bank.sort((a,b)=>a.p[1]-b.p[1]);const step=3,top=49,bottom=size.h-60,count=Math.floor((bottom-top)/step)+1;
  let prev=Array(count).fill(Infinity),backs=[];
  for(let i=0;i<bank.length;i++){
   const a=bank[i],x=side==='left'?8:size.w-8-a.w,next=Array(count).fill(Infinity),back=Array(count).fill(-1);let bestCost=Infinity,bestIndex=-1,scan=0;
   for(let j=0;j<count;j++){
    let y=top+j*step;
    if(i){const maxPrev=Math.floor((y-bank[i-1].h-4-top)/step);while(scan<=maxPrev&&scan<count){if(prev[scan]<bestCost){bestCost=prev[scan];bestIndex=scan;}scan++;}}
    const rect={x,y,w:a.w,h:a.h};if(y+a.h>bottom||markerObstacles.some(o=>intersects(rect,o,2)))continue;
    let cost=(y+a.h/2-a.p[1])**2;if(!i){next[j]=cost;}else if(bestIndex>=0){next[j]=bestCost+cost;back[j]=bestIndex;}
   }
   prev=next;backs.push(back);
  }
  let index=prev.indexOf(Math.min(...prev));
  if(!Number.isFinite(prev[index])){
   // Rare short landscape viewport: ordered labels, no typography shrinking.
   let y=top;for(const a of bank){result.push({a,best:{x:side==='left'?8:size.w-8-a.w,y,w:a.w,h:a.h}});y+=a.h+4;}
  }else{
   for(let i=bank.length-1;i>=0;i--){const a=bank[i];result.push({a,best:{x:side==='left'?8:size.w-8-a.w,y:top+index*step,w:a.w,h:a.h}});index=backs[i][index];}
  }
 }
 return result;
}
function drawLabels(){const labels=$('labels'),leaders=$('leaders');labels.replaceChildren();leaders.replaceChildren();renderedLabels=[];if(state.phase!=='study')return;
 const phone=isPhone(),font=phone?11.8:(size.w>2400?17:13.2),gap=font+3.2;
 let visible=region().ids.map(id=>({id,p:screen(point(id))})).filter(a=>a.p[0]>=0&&a.p[0]<=size.w&&a.p[1]>=0&&a.p[1]<=size.h);
 const markerObstacles=visible.map(a=>({x:a.p[0]-7,y:a.p[1]-7,w:14,h:14}));
 const obstacles=[{x:0,y:0,w:size.w,h:phone?46:82},{x:size.w-60,y:size.h-178,w:60,h:178},{x:0,y:size.h-33,w:phone?145:305,h:33}];
 const placed=[],layouts=[];for(const a of visible){a.lines=labelLines(SEAS[a.id].name,font,phone?140:205);a.w=Math.max(...a.lines.map(l=>measureContext.measureText(l).width))+15;a.h=a.lines.length*gap+10;a.density=visible.filter(b=>Math.hypot(a.p[0]-b.p[0],a.p[1]-b.p[1])<90).length;}
 visible.sort((a,b)=>b.density-a.density||a.p[1]-b.p[1]||a.id.localeCompare(b.id));
 if(phone)layouts.push(...mobileLabelBanks(visible,markerObstacles));
 for(const a of phone?[]:visible){const [px,py]=a.p;let best=null,bestScore=Infinity;const fits=r=>r.x>=7&&r.y>=(phone?45:78)&&r.x+r.w<=size.w-7&&r.y+r.h<=size.h-7&&!obstacles.some(o=>intersects(r,o,1))&&!placed.some(o=>intersects(r,o,3))&&!markerObstacles.some(o=>intersects(r,o,2));
 const test=(x,y)=>{let r={x,y,w:a.w,h:a.h};if(!fits(r))return;let nearestX=Math.max(x,Math.min(x+a.w,px)),nearestY=Math.max(y,Math.min(y+a.h,py));let score=Math.hypot(nearestX-px,nearestY-py)+Math.abs(y+a.h/2-py)*.08;if(score<bestScore){best=r;bestScore=score;}};
 for(let distance=13;distance<Math.max(size.w,size.h)*1.12;distance+=phone?22:26){for(let angle=0;angle<16;angle++){let t=angle*Math.PI/8;test(px+Math.cos(t)*(distance+a.w/2)-a.w/2,py+Math.sin(t)*(distance+a.h/2)-a.h/2);}if(best&&distance>bestScore+60)break;}
 if(!best){for(let y=phone?48:84;y<size.h-a.h-9;y+=6){for(let x=8;x<size.w-a.w-8;x+=9)test(x,y);}}
 if(!best){ // Exceptional very short viewport: reduce this label before allowing any overlap.
  a.lines=labelLines(SEAS[a.id].name,font*.86,phone?138:200);a.w=Math.max(...a.lines.map(l=>measureContext.measureText(l).width))+12;a.h=a.lines.length*(gap*.86)+8;a.small=true;
  for(let y=phone?48:84;y<size.h-a.h-8;y+=4)for(let x=8;x<size.w-a.w-8;x+=7)test(x,y);
 }
 if(!best){ // Deterministic final fallback, kept visible; viewport QA verifies it is never needed in supported sizes.
  best={x:8,y:48+placed.length*(a.h+3),w:a.w,h:a.h};console.warn('Label packing fallback',a.id,size);
 }
 placed.push(best);layouts.push({a,best});
 }

 for(const {a,best} of layouts){const [px,py]=a.p;const wp=world(best.x,best.y),real=point(a.id);let end=[Math.max(best.x+5,Math.min(best.x+best.w-5,px)),Math.max(best.y+3,Math.min(best.y+best.h-3,py))];let ep=world(...end);let selected=state.selected===a.id;
 leaders.append(el('path',{d:`M${real[0]},${real[1]}L${ep[0]},${ep[1]}`,class:'leader'+(selected?' selected':''),'stroke-width':(selected?1.8:.8)*cam.u}));
 const group=el('g',{'data-label':a.id,class:'sea-label'+(selected?' selected':''),tabindex:'0',role:'button','aria-label':SEAS[a.id].name});group.append(el('rect',{x:wp[0],y:wp[1],width:best.w*cam.u,height:best.h*cam.u,rx:5*cam.u,class:'label-bg','stroke-width':.7*cam.u}));
 let f=font*(a.small?.86:1);a.lines.forEach((line,i)=>{const text=el('text',{x:wp[0]+7*cam.u,y:wp[1]+(7+f+i*(f+3.2))*cam.u,'font-size':f*cam.u,class:'label-text'});text.textContent=line;group.append(text);});labels.append(group);renderedLabels.push({id:a.id,...best});
 }
}
function chooseStudy(id,fromList=false){state.selected=id;updateFact();updateList();if(fromList){const p=point(id),sc=screen(p);if(sc[0]<20||sc[0]>size.w-20||sc[1]<50||sc[1]>size.h-35)focusAt(p,Math.max(2,zoomLevel()));}draw();if(isPhone()&&!fromList)toast(SEAS[id].name+' \u00b7 szczeg\u00f3\u0142y w panelu Lista');}
function nearestAt(x,y){return region().ids.map(id=>{let s=screen(point(id));return{id,p:s,d:Math.hypot(x-s[0],y-s[1])};}).sort((a,b)=>a.d-b.d);}
function mapTap(x,y,labelId=null){if(state.phase==='reveal')return;if(state.phase==='study'&&labelId){chooseStudy(labelId);return;}
 const choices=nearestAt(x,y);if(!choices.length||choices[0].d>(isPhone()?23:18))return;const nearest=choices[0];
 if(state.phase==='study'){chooseStudy(nearest.id);return;}
 if(state.phase!=='playing'){toast('Wybierz tryb gry i naci\u015bnij GRAJ.');return;}
 if(state.solved.has(nearest.id)){toast('To morze jest ju\u017c zaliczone.');return;}
 const neighbors=choices.filter(c=>c.id!==nearest.id&&!state.solved.has(c.id)&&Math.hypot(c.p[0]-nearest.p[0],c.p[1]-nearest.p[1])<(isPhone()?25:14));
 if(neighbors.length&&zoomLevel()<21){let minDistance=Math.min(...neighbors.map(c=>Math.hypot(c.p[0]-nearest.p[0],c.p[1]-nearest.p[1])));let desired=Math.min(22,zoomLevel()*Math.min(4,Math.max(1.7,32/Math.max(minDistance,1))));focusAt(point(nearest.id),desired);toast('Powi\u0119kszono skupisko. Teraz wybierz k\u00f3\u0142ko.');return;}
 answer(nearest.id);
}
function syncControls(){document.querySelectorAll('[data-region]').forEach(s=>{s.value=state.region;s.disabled=active();});document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.mode===state.mode);b.disabled=active();});$('app').classList.toggle('game',active());}
function studyMarkup(){return `<div class="study-info"><strong>Wszystkie nazwy s\u0105 na mapie.</strong><br>Kliknij podpis lub k\u00f3\u0142ko, aby pozna\u0107 akwen. Przybli\u017caj przyciskami, k\u00f3\u0142kiem myszy lub dwoma palcami.<div class="tip">Niebieskie k\u00f3\u0142ko = punkt na wodzie, nie granice morza.</div></div>`;}
function stageMarkup(){if(state.phase==='study')return studyMarkup();if(state.phase==='ready'){let n=state.retryIds?state.retryIds.length:(state.mode==='ten'?Math.min(10,region().ids.length):region().ids.length);let title=state.retryIds?'Powt\u00f3rka trudnych m\u00f3rz':state.mode==='ten'?'Szybka runda':'Pe\u0142na runda';return `<div class="stage"><div class="compact-ready"><div class="ready-copy"><div class="eyebrow">${n} pyta\u0144 \u00b7 do ${n*10} punkt\u00f3w</div><h2>${title}</h2><p class="ready-desc">10 pkt za pierwsz\u0105 pr\u00f3b\u0119, 5 pkt za drug\u0105. Po dw\u00f3ch b\u0142\u0119dach poka\u017cemy odpowied\u017a.</p></div><button class="primary start" data-act="play">GRAJ</button></div></div>`;}
 if(active()){let sea=SEAS[current()];let done=state.records.length;return `<div class="stage"><div class="eyebrow">Znajd\u017a \u00b7 pytanie ${Math.min(state.index+1,state.queue.length)} z ${state.queue.length}</div><h2>${esc(sea.name)}</h2><div class="score-line"><span>Uko\u0144czono ${done} z ${state.queue.length}</span><b>${state.score} / ${state.queue.length*10} pkt</b></div><div class="progress-track"><div style="width:${done/state.queue.length*100}%"></div></div><div class="feedback ${state.phase==='reveal'?'good':state.tries?'bad':''}">${esc(state.feedback||'Kliknij w\u0142a\u015bciwe niebieskie k\u00f3\u0142ko.')}</div><div class="game-buttons"><button data-act="skip" ${state.phase==='reveal'?'disabled':''}>Pomi\u0144 / poka\u017c</button><button class="quiet danger" data-act="end">Zako\u0144cz gr\u0119</button></div></div>`;}
 if(state.phase==='results')return `<div class="stage"><div class="eyebrow">Runda zako\u0144czona</div><h2>${state.score} / ${state.queue.length*10} pkt</h2><p>Uko\u0144czono ${state.records.length} z ${state.queue.length}.</p><button class="primary start" data-act="results">ZOBACZ WYNIK</button></div>`;return '';
}
function updateUI(){syncControls();$('desktopStage').innerHTML=stageMarkup();$('mobileStage').innerHTML=state.phase==='study'?'':stageMarkup();updateFact();updateList();requestAnimationFrame(()=>resizeMap(false));}
function updateFact(){const box=$('fact');if(state.phase!=='study'||!state.selected){box.hidden=true;box.innerHTML='';return;}const s=SEAS[state.selected];box.hidden=false;box.innerHTML=`<h3>${esc(s.name)}</h3><div class="factmeta">${esc(s.kind)} \u00b7 ${formatCoord(s.lat,'N','S')} ${formatCoord(s.lon,'E','W')}</div><p>${esc(s.description)}</p><button data-detail="${s.id}" class="quiet">Nazwa, aliasy i \u017ar\u00f3d\u0142a \u2197</button>`;}
function updateList(){const q=norm($('search').value);let ids=region().ids.filter(id=>norm([SEAS[id].name,...SEAS[id].aliases].join(' ')).includes(q)).sort((a,b)=>SEAS[a].name.localeCompare(SEAS[b].name,'pl'));$('listCount').textContent=ids.length+' / '+region().ids.length;$('listTitle').textContent=active()?'Lista bez podpowiedzi':'Akweny na mapie';$('seaList').innerHTML=ids.map(id=>{const s=SEAS[id],done=state.solved.has(id);let tag=s.kind==='morze'?'':s.kind==='cz\u0119\u015b\u0107 morza'?'cz\u0119\u015b\u0107':s.kind;return `<button class="sea-row ${done?'done ':''}${state.selected===id&&state.phase==='study'?'selected':''}" data-sea="${id}" ${state.phase==='study'?'':'disabled'}><span class="status">${done?'\u2713':'\u25cf'}</span><span class="sea-name">${esc(s.name)}</span>${tag?`<span class="tag">${esc(tag)}</span>`:''}</button>`;}).join('')||'<div class="empty">Brak pasuj\u0105cego akwenu na tej mapie.</div>';}
function setMode(mode){if(active())return;cancelPending();state.mode=mode;state.phase=mode==='study'?'study':'ready';state.selected=null;state.solved.clear();state.retryIds=null;state.score=0;state.records=[];resetCamera();updateUI();closeSheet();}
function shuffled(ids){let a=[...ids];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function startGame(){if(state.phase!=='ready')return;cancelPending();let ids=state.retryIds?[...state.retryIds]:region().ids;state.queue=shuffled(ids);if(!state.retryIds&&state.mode==='ten')state.queue=state.queue.slice(0,10);if(!state.queue.length)return;state.phase='playing';state.index=0;state.records=[];state.solved=new Set();state.problems=new Set();state.wrongCounts={};state.wrongClicks=0;state.tries=0;state.score=0;state.selected=null;state.feedback='';state.roundMode=state.mode;state.lastResult=null;closeModal();closeSheet();resetCamera();updateUI();announce('Znajd\u017a: '+SEAS[current()].name);}
function answer(id){if(state.phase!=='playing'||state.solved.has(id))return;if(id===current()){finishQuestion(state.tries?5:10,'found');return;}
 state.tries++;state.wrongClicks++;state.problems.add(current());state.wrongCounts[current()]=(state.wrongCounts[current()]||0)+1;state.wrong=id;clearTimeout(flashTimer);flashTimer=setTimeout(()=>{state.wrong=null;drawMarkers();},430);
 if(state.tries>=2){finishQuestion(0,'shown');}else{state.feedback='Nie to miejsce. Druga pr\u00f3ba: 5 pkt.';updateUI();drawMarkers();announce(state.feedback);}
}
function finishQuestion(points,reason){if(state.phase!=='playing')return;const id=current();if(points===0)state.problems.add(id);state.score+=points;state.records.push({id,points,reason,errors:state.tries});state.solved.add(id);state.phase='reveal';state.feedback=points===10?'Trafione! +10 pkt':points===5?'Dobrze za drugim razem. +5 pkt':reason==='skipped'?'Odpowied\u017a pokazana. 0 pkt.':'Dwa b\u0142\u0119dy. Oto w\u0142a\u015bciwe morze. 0 pkt.';
 const p=point(id),sc=screen(p);if(sc[0]<60||sc[0]>size.w-60||sc[1]<65||sc[1]>size.h-65)focusAt(p,Math.max(1.3,zoomLevel()));updateUI();drawMarkers();reveal(id);announce(state.feedback+' '+SEAS[id].name);const token=state.token;state.timer=setTimeout(()=>{if(token!==state.token||state.phase!=='reveal')return;state.index++;state.tries=0;state.feedback='';state.wrong=null;$('effects').replaceChildren();if(state.index>=state.queue.length){endGame(false);}else{state.phase='playing';updateUI();draw();announce('Znajd\u017a: '+SEAS[current()].name);}},points===0?1500:1050);
}
function reveal(id){cancelAnimationFrame(effectRaf);$('effects').replaceChildren();let p=point(id);let ring=el('circle',{cx:p[0],cy:p[1],r:65*cam.u,'stroke-width':3*cam.u,class:'reveal-ring'});$('effects').append(ring);let begin=performance.now();const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;function step(t){let progress=Math.min(1,(t-begin)/(reduced?1:850));let ease=1-Math.pow(1-progress,3);ring.setAttribute('r',(65-58.5*ease)*cam.u);ring.setAttribute('stroke-width',(3-1.3*ease)*cam.u);if(progress<1)effectRaf=requestAnimationFrame(step);}effectRaf=requestAnimationFrame(step);}
function endGame(early=true){if(!active())return;cancelPending();state.phase='results';state.lastResult={region:state.region,mode:state.roundMode,score:state.score,total:state.queue.length,completed:state.records.length,correct:state.records.filter(r=>r.points>0).length,first:state.records.filter(r=>r.points===10).length,second:state.records.filter(r=>r.points===5).length,shown:state.records.filter(r=>r.points===0).length,wrongClicks:state.wrongClicks,problems:[...state.problems],early,records:[...state.records]};updateUI();draw();showResults();}
function retry(){if(!state.lastResult||!state.lastResult.problems.length)return;const ids=[...state.lastResult.problems];cancelPending();state.mode='full';state.retryIds=ids;state.phase='ready';state.solved.clear();state.selected=null;state.records=[];state.score=0;closeModal();closeSheet();resetCamera();updateUI();}
function playAgain(){const m=state.lastResult?.mode||state.mode;closeModal();setMode(m==='study'?'ten':m);}
function formatCoord(n,pos,neg){return Math.abs(n).toFixed(2).replace('.',',')+'\u00b0'+(n>=0?pos:neg);}
function openModal(html){lastFocus=document.activeElement;$('modal').innerHTML=html;$('modalShade').hidden=false;$('modal').scrollTop=0;$('modal').querySelector('button')?.focus();}
function closeModal(){$('modalShade').hidden=true;if(lastFocus&&document.contains(lastFocus))lastFocus.focus({preventScroll:true});}
function modalHeader(title,kicker=''){return `<div class="modal-top"><div>${kicker?`<div class="result-kicker">${kicker}</div>`:''}<h2 id="modalTitle">${title}</h2></div><button class="quiet close" data-act="closeModal" aria-label="Zamknij">\u2715</button></div>`;}
function leaderboardRows(rows,own=null){
 if(!rows.length)return '<div class="ranking-empty">Brak wyników.</div>';
 let ownInTop=own&&rows.some(x=>x.id===own.row?.id);
 let body=rows.map((x,i)=>`<tr${own?.row?.id===x.id?' class="me"':''}><td>${i+1}</td><td>${esc(x.name)}</td><td><strong>${x.score}</strong> / ${x.max}</td><td>${new Date(x.created_at||x.date).toLocaleDateString('pl-PL')}</td></tr>`).join('');
 if(own&&own.rank>rows.length&&!ownInTop){
   body+=`<tr class="ellipsis"><td colspan="4">…</td></tr><tr class="me"><td>${own.rank}</td><td>${esc(own.row.name)} <span class="you">Ty</span></td><td><strong>${own.row.score}</strong> / ${own.row.max}</td><td>${new Date(own.row.created_at||own.row.date).toLocaleDateString('pl-PL')}</td></tr>`;
 }
 return `<table class="ranking-table"><thead><tr><th>#</th><th>Gracz</th><th>Wynik</th><th>Data</th></tr></thead><tbody>${body}</tbody></table>`;
}
function rankingMarkup(r){return `<div class="rank-box"><h3>Zapisz wynik</h3><p>${GeoSeaRanking.backendReady()?'Wynik trafi do wspólnego rankingu online.':'Ranking globalny nie jest jeszcze połączony — zapis lokalny nadal działa.'}</p><div class="rank-form"><input id="playerName" maxlength="${GeoSeaRanking.MAX_NAME}" autocomplete="nickname" inputmode="text" pattern="[\\p{L}\\p{N}]+" placeholder="Twój nick" aria-label="Twój nick"><button class="primary" data-act="saveScore">Zapisz wynik</button></div><div id="rankMsg" class="rank-msg"></div><div class="rank-actions"><button class="quiet" data-act="leaderboard">&#127942; Zobacz wyniki</button></div></div>`;}
async function saveScore(){
 const r=state.lastResult;if(!r)return;const input=$('playerName'),msg=$('rankMsg');if(!input||!msg)return;
 if(r.saved){msg.className='rank-msg good';msg.textContent='Ten wynik jest już zapisany.';return;}
 const spam=GeoSeaRanking.antiSpam();if(!spam.ok){msg.className='rank-msg bad';msg.textContent=spam.reason;return;}
 const check=GeoSeaRanking.validate(input.value);
 if(!check.ok){msg.className='rank-msg bad';msg.textContent=check.reason;if(check.offensive){r.invalidNick=true;input.disabled=true;document.querySelector('[data-act="saveScore"]')?.setAttribute('disabled','');}return;}
 const local={name:check.name,score:r.score,max:r.total*10,region:r.region,mode:r.mode,date:new Date().toISOString()};GeoSeaRanking.add(local);
 try{
   if(GeoSeaRanking.backendReady()){
     const row=await GeoSeaRanking.globalAdd(local);const pos=row?await GeoSeaRanking.globalPosition(row.region,row.mode,row.score):null;
     r.saved=true;msg.className='rank-msg good';msg.textContent=pos?`Wynik zapisany globalnie. Twoje miejsce: ${pos}.`:'Wynik zapisany globalnie.';
   }else{
     r.saved=true;msg.className='rank-msg good';msg.textContent='Wynik zapisany na tym urządzeniu.';
   }
 }catch(err){r.saved=true;msg.className='rank-msg bad';msg.textContent='Zapis lokalny OK, ale ranking online jest chwilowo niedostępny.';}
 input.disabled=true;document.querySelector('[data-act="saveScore"]')?.setAttribute('disabled','');
}
async function showLeaderboard(){
 const regionId=state.region,last=GeoSeaRanking.lastGlobal();
 openModal(modalHeader('Wyniki',esc(REGIONS[regionId].name))+'<div id="leaderboardBody" class="leaderboard-body"><div class="ranking-loading">Ładowanie wyników…</div></div>');
 const body=$('leaderboardBody');if(!body)return;
 const renderMode=async(mode,label)=>{
   let rows=[],own=null;
   if(GeoSeaRanking.backendReady()){
     rows=await GeoSeaRanking.globalTop(regionId,mode,20);
     if(last&&last.region===regionId&&last.mode===mode){own={row:last,rank:await GeoSeaRanking.globalPosition(regionId,mode,last.score)};}
   }else{
     rows=GeoSeaRanking.top(regionId,mode,20).map((x,i)=>({...x,id:'local-'+i,created_at:x.date}));
   }
   return `<section class="leaderboard-section"><div class="leaderboard-head"><h3>${label}</h3><span>${GeoSeaRanking.backendReady()?'Globalne Top 20':'Na tym urządzeniu'}</span></div>${leaderboardRows(rows,own)}</section>`;
 };
 try{body.innerHTML=(await renderMode('ten','Gra 10'))+(await renderMode('full','Pełna gra'));}
 catch(err){body.innerHTML='<div class="ranking-empty">Nie udało się pobrać rankingu online.</div>';}
}
function showResults(){const r=state.lastResult;if(!r)return;const percent=Math.round(r.score/(r.total*10)*100);openModal(modalHeader(r.early?'Runda zako\u0144czona':'Koniec rundy',esc(REGIONS[r.region].name))+
 `<div class="result-score">${r.score}<small> / ${r.total*10} pkt</small></div><p><strong>${percent}% punkt\u00f3w</strong> \u00b7 Uko\u0144czono <strong>${r.completed} z ${r.total}</strong>. ${r.total-r.completed?'Nieuko\u0144czone pytania: '+(r.total-r.completed)+'.':''}</p><div class="progress-track"><div style="width:${percent}%"></div></div>${rankingMarkup(r)}<div class="result-stats"><div class="result-stat"><b>${r.correct}</b>Poprawnie</div><div class="result-stat"><b>${r.wrongClicks}</b>B\u0142ędy</div><div class="result-stat"><b>${r.shown}</b>Pokazane</div></div><p>${r.first} za pierwszym razem \u00b7 ${r.second} za drugim. B\u0142\u0119dne klikni\u0119cia s\u0105 liczone osobno od uko\u0144czonych pyta\u0144.</p><h3>${r.problems.length?'Do prze\u0107wiczenia: '+r.problems.length:'Brak b\u0142\u0119dnych odpowiedzi'}</h3>${r.problems.length?`<p>Tu trafiaj\u0105 morza, przy kt\u00f3rych by\u0142 cho\u0107 jeden b\u0142\u0105d, pomini\u0119cie lub pokazanie odpowiedzi. Nierozpocz\u0119te pytania nie s\u0105 automatycznie dodawane.</p><div class="problem-list">${r.problems.map(id=>`<span class="problem-pill">${esc(SEAS[id].name)}</span>`).join('')}</div>`:'<p>'+(!r.completed?'Nie udzielono jeszcze \u017cadnej odpowiedzi.':'\u015awietna praca. Mo\u017cesz wr\u00f3ci\u0107 do nauki albo zagra\u0107 ponownie.')+'</p>'}<div class="result-actions"><button class="primary" data-act="retry" ${r.problems.length?'':'disabled'}>\u0106wicz tylko b\u0142\u0119dne${r.problems.length?' ('+r.problems.length+')':''}</button><button data-act="learnAll">Nauka wszystkich</button><button class="quiet" data-act="again">Zagraj ponownie</button></div>`);}
function sourceMarkup(s){return s.sources.map(a=>`<a href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">${esc(a.label)} \u2197</a>`).join('');}
function detail(id){const s=SEAS[id];if(!s)return;openModal(modalHeader(esc(s.name),esc(s.kind))+`<p>${esc(s.description)}</p><p><strong>Punkt na mapie:</strong> ${formatCoord(s.lat,'N','S')}, ${formatCoord(s.lon,'E','W')}. To punkt reprezentacyjny, nie granica ani \u015bcis\u0142y \u015brodek morza.</p>${s.note?`<div class="note-card"><strong>Wa\u017cne o nazwie</strong><p>${esc(s.note)}</p></div>`:''}${s.aliases.length?`<p><strong>Aliasy i nazwy z listy:</strong> ${esc(s.aliases.join(' \u00b7 '))}</p>`:''}<div class="source-block">${sourceMarkup(s)}<p>Odno\u015bniki do \u017ar\u00f3de\u0142 otwieraj\u0105 strony internetowe. Sama gra, mapa i informacje dzia\u0142aj\u0105 bez internetu.</p></div>`);}
function about(){const notes=['arctic','bohai','baffin','caspian','dead','davis','bohol','newguinea','icarian','scotia','inland'];openModal(modalHeader('Atlas, zasady i \u017ar\u00f3d\u0142a','sHIT.SEA \u00b7 20.09.2026')+
 `<p><strong>Jedna mapa, jeden uk\u0142ad wsp\u00f3\u0142rz\u0119dnych.</strong> Kontury, punkty, podpisy i linie u\u017cywaj\u0105 wsp\u00f3lnego SVG. Przybli\u017canie jest proporcjonalne. Odwzorowania kartograficzne z natury maj\u0105 zniekszta\u0142cenia; aplikacja nie dodaje rozci\u0105gania obrazu w CSS.</p><h3>Jak si\u0119 uczy\u0107</h3><p>W trybie Nauka wszystkie nazwy pojawiaj\u0105 si\u0119 od razu, z liniami do punkt\u00f3w. Na zbli\u017ceniu pozostaj\u0105 podpisy punkt\u00f3w w widocznym kadrze. Przycisk dopasowania mapy przywraca ca\u0142y region. Zbli\u017cenia u g\u00f3ry pomagaj\u0105 w Grecji i Indonezji. Mo\u017cesz przeci\u0105ga\u0107 map\u0119, u\u017cywa\u0107 k\u00f3\u0142ka myszy, klawiszy +, \u2212, 0 oraz gestu dw\u00f3ch palc\u00f3w.</p><h3>Gra bez podpowiedzi</h3><p>Wybierz Gra 10 lub Pe\u0142na gra, potem GRAJ. 10 pkt za pierwsz\u0105 pr\u00f3b\u0119, 5 za drug\u0105, 0 po dw\u00f3ch b\u0142\u0119dach albo pomini\u0119ciu. Pokazane i znalezione punkty pozostaj\u0105 zielone. Zako\u0144cz gr\u0119 dzia\u0142a tak\u017ce przed pierwsz\u0105 odpowiedzi\u0105. Gdy k\u00f3\u0142ka s\u0105 zbyt blisko, pierwsze dotkni\u0119cie przybli\u017ca skupisko bez kary. Wskazanie pustej wody nie jest odpowiedzi\u0105.</p><p>Gdy region ma mniej ni\u017c 10 akwen\u00f3w, Gra 10 obejmuje wszystkie dost\u0119pne. Ameryka Po\u0142udniowa ma tylko 2 akweny z podanej listy. Afryka uwzgl\u0119dnia \u015br\u00f3dziemnomorskie s\u0105siedztwo, nie wy\u0142\u0105cznie morza dotykaj\u0105ce jej brzegu.</p><h3>72 nazwy wej\u015bciowe, 71 obiekt\u00f3w gry</h3><p>Nie tworz\u0119 drugiego punktu dla niepotwierdzonej nazwy Po\u0142udniowo-antylskie. Jest jawnie powi\u0105zana interpretacyjnie z Morzem Scotia, a nie traktowana jako oficjalny synonim. Kategorie ocean, zatoka i jezioro s\u0105 oznaczone. K\u00f3\u0142ka reprezentuj\u0105 miejsca na akwenach, nie ich pe\u0142ny zasi\u0119g.</p>`+
 notes.map(id=>`<div class="note-card"><strong>${esc(SEAS[id].name)}</strong><p>${esc(SEAS[id].note)}</p>${sourceMarkup(SEAS[id])}</div>`).join('')+
 `<h3>Podstawa geograficzna</h3><p>Polskie nazwy i wi\u0119kszo\u015b\u0107 wsp\u00f3\u0142rz\u0119dnych: KSNG, Urz\u0119dowy wykaz polskich nazw geograficznych \u015bwiata (2019), wraz ze zmianami opublikowanymi do 24 czerwca 2026 r. Bohol: WCS/IUCN. Punkt Ikaryjskiego: OpenStreetMap. Punkt Oceanu Arktycznego wybrano na otwartej przestrzeni akwenu. Wsp\u00f3\u0142rz\u0119dne i opis mo\u017cesz sprawdzi\u0107 dla ka\u017cdego has\u0142a.</p><p>Linia brzegowa: <strong>GSHHG / GSHHS, Wessel &amp; Smith</strong>, dane WGS84 dostarczone w pakiecie Basemap; rozdzielczo\u015b\u0107 intermediate, dla mapy \u015bwiata low. Dane kontur\u00f3w: GNU Lesser General Public License. To wektorowa mapa pogl\u0105dowa, nie nawigacyjna. Niewielkie wyspy i sezonowe/p\u0142ywowe brzegi podlegaj\u0105 generalizacji. Brak granic politycznych jest celowy.</p><div class="source-block"><a href="https://www.gov.pl/web/ksng/urzedowy-wykaz-polskich-nazw-geograficznych-swiata2" target="_blank" rel="noopener noreferrer">KSNG: wykaz nazw i aktualizacje \u2197</a><a href="https://www.ngdc.noaa.gov/mgg/shorelines/shorelines.html" target="_blank" rel="noopener noreferrer">NOAA: GSHHG, opis i pochodzenie danych \u2197</a><a href="https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html" target="_blank" rel="noopener noreferrer">Licencja danych GSHHG: LGPL \u2197</a></div><p>Na telefonie lista i ustawienia s\u0105 w wysuwanym panelu; domy\u015blnie pierwsze\u0144stwo ma mapa. Aplikacja nie wysy\u0142a danych, nie u\u017cywa CDN ani po\u0142\u0105cze\u0144 sieciowych i nie wymaga instalacji.</p>`);}
function action(a){switch(a){case'play':startGame();break;case'skip':finishQuestion(0,'skipped');break;case'end':endGame(true);break;case'zoomIn':setZoom(1.6);break;case'zoomOut':setZoom(1/1.6);break;case'reset':resetCamera();break;case'openSheet':openSheet();break;case'closeSheet':closeSheet();break;case'closeModal':closeModal();break;case'about':about();break;case'results':showResults();break;case'leaderboard':showLeaderboard();break;case'retry':retry();break;case'learnAll':closeModal();setMode('study');break;case'again':playAgain();break;case'saveScore':saveScore();break;}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act],[data-mode],[data-sea],[data-detail],[data-preset]');if(!b||b.disabled)return;if(b.dataset.act)action(b.dataset.act);else if(b.dataset.mode)setMode(b.dataset.mode);else if(b.dataset.sea&&state.phase==='study')chooseStudy(b.dataset.sea,true);else if(b.dataset.detail)detail(b.dataset.detail);else if(b.dataset.preset!==undefined){let p=map.presets[+b.dataset.preset];focusAt(p.point,p.zoom);}});
document.querySelectorAll('[data-region]').forEach(s=>{s.innerHTML=DATA.regions.map(r=>`<option value="${r.id}">${esc(r.name)}</option>`).join('');s.addEventListener('change',()=>setRegion(s.value));});
$('search').addEventListener('input',updateList);
document.addEventListener('input',e=>{if(e.target?.id==='playerName'){const clean=GeoSeaRanking.sanitizeInput(e.target.value);if(e.target.value!==clean)e.target.value=clean;}});
// Unified pointer handling: mouse drag, touch drag and two-finger pinch.
const pointers=new Map();let gesture=null;
function local(e){const r=$('atlas').getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top];}
$('atlas').addEventListener('pointerdown',e=>{if(e.button&&e.button!==0)return;const p=local(e);pointers.set(e.pointerId,p);$('atlas').setPointerCapture(e.pointerId);$('atlas').classList.add('dragging');if(pointers.size===1)gesture={start:p,last:p,moved:false,label:e.target.closest('[data-label]')?.dataset.label};else if(pointers.size===2){const a=[...pointers.values()];gesture={pinch:true,dist:Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]),center:[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2],moved:true};}});
$('atlas').addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId)||!gesture)return;const p=local(e);pointers.set(e.pointerId,p);if(pointers.size>=2){const a=[...pointers.values()],dist=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]),center=[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2];if(gesture.pinch){let anchor=world(...gesture.center);cam.u=baseU/Math.max(1,Math.min(22,zoomLevel()*dist/Math.max(gesture.dist,1)));cam.cx=anchor[0]-(center[0]-size.w/2)*cam.u;cam.cy=anchor[1]-(center[1]-size.h/2)*cam.u;clampCamera();requestDraw();}gesture={pinch:true,dist,center,moved:true};}else if(!gesture.pinch){if(Math.hypot(p[0]-gesture.start[0],p[1]-gesture.start[1])>6)gesture.moved=true;if(gesture.moved){cam.cx-=(p[0]-gesture.last[0])*cam.u;cam.cy-=(p[1]-gesture.last[1])*cam.u;clampCamera();requestDraw();}gesture.last=p;}});
function pointerEnd(e,cancel=false){if(!pointers.has(e.pointerId))return;const p=local(e),g=gesture;pointers.delete(e.pointerId);if(!pointers.size){$('atlas').classList.remove('dragging');gesture=null;if(!cancel&&g&&!g.moved&&!g.pinch)mapTap(...p,g.label);}else{const remain=[...pointers.values()][0];gesture={start:remain,last:remain,moved:true};}}
$('atlas').addEventListener('pointerup',e=>pointerEnd(e));$('atlas').addEventListener('pointercancel',e=>pointerEnd(e,true));
$('atlas').addEventListener('wheel',e=>{e.preventDefault();setZoom(Math.exp(-e.deltaY*.0015),...local(e));},{passive:false});
$('atlas').addEventListener('dblclick',e=>e.preventDefault());
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('modalShade').hidden)closeModal();else closeSheet();return;}if(!$('modalShade').hidden){if(e.key==='Tab'){const focusables=[...$('modal').querySelectorAll('button:not(:disabled),a[href],input,select')];const first=focusables[0],last=focusables.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}return;}
 if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if((e.key==='Enter'||e.key===' ')&&e.target.dataset.label&&state.phase==='study'){e.preventDefault();chooseStudy(e.target.dataset.label);return;}if(e.key==='+'||e.key==='='){e.preventDefault();setZoom(1.6);}else if(e.key==='-'){e.preventDefault();setZoom(1/1.6);}else if(e.key==='0'){e.preventDefault();resetCamera();}});
new ResizeObserver(()=>{if(map)resizeMap(false);}).observe($('mapArea'));
// Read-only diagnostics make layout and game-state QA reproducible without affecting play.
window.geoSeaDiagnostics=()=>({region:state.region,phase:state.phase,mode:state.mode,queue:[...state.queue],current:current(),score:state.score,completed:state.records.length,total:state.queue.length,solved:[...state.solved],problems:[...state.problems],tries:state.tries,lastResult:state.lastResult,zoom:zoomLevel(),labels:renderedLabels.map(x=>({...x})),points:region().ids.map(id=>({id,xy:screen(point(id)),lon:SEAS[id].lon,lat:SEAS[id].lat})),size:{...size},matrix:(()=>{const m=$('atlas').getScreenCTM();return m?{a:m.a,b:m.b,c:m.c,d:m.d}:null;})()});
loadMap();updateUI();

