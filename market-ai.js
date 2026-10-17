import {canOccupy,STORE_NAVIGATION as NAVIGATION,CUSTOMER_ROUTES} from './market-world.js?v=0.2.0-auto1';
const length=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const mix=(a,b,f)=>a.map((v,i)=>v+(b[i]-v)*f);
const cover=s=>s==='shelf';
const floorDistances=new WeakMap();
function distancesToFloor(graph){if(floorDistances.has(graph))return floorDistances.get(graph);const dist=graph.nodes.map(n=>n.p[1]<.04?0:Infinity),pending=new Set(graph.nodes.map((_,i)=>i));while(pending.size){let u=-1;for(const v of pending)if(u<0||dist[v]<dist[u])u=v;pending.delete(u);for(const id of graph.nodes[u].edges){const e=graph.edges[id],v=e.a===u?e.b:e.a;dist[v]=Math.min(dist[v],dist[u]+e.length);}}floorDistances.set(graph,dist);return dist;}

export function createRoach(random=Math.random,graph=NAVIGATION){
 const edge=Math.floor(random()*graph.edges.length),e=graph.edges[edge];
 return {edge,reverse:random()<.5,distance:random()*e.length,mode:'wander',timer:.5+random(),threat:0,flightLeft:0,cooldown:0,speed:.75+random()*.45,shelfTime:0,age:0,moved:0,previous:-1};
}
export function sampleRoach(ai,graph=NAVIGATION){
 const e=graph.edges[ai.edge],from=graph.nodes[ai.reverse?e.b:e.a].p,to=graph.nodes[ai.reverse?e.a:e.b].p;
 const direction=to.map((v,i)=>(v-from[i])/e.length);
 return {position:mix(from,to,ai.distance/e.length),normal:e.n,direction,surface:e.surface,mode:ai.mode};
}
const reverse=(ai,graph)=>{ai.reverse=!ai.reverse;ai.distance=graph.edges[ai.edge].length-ai.distance;};
function fleeOrientation(ai,player,graph){
 const e=graph.edges[ai.edge],s=sampleRoach(ai,graph),from=ai.reverse?e.b:e.a,to=ai.reverse?e.a:e.b;
 const near=mix(s.position,graph.nodes[to].p,Math.min(1,.45/Math.max(.01,e.length-ai.distance))),away=mix(s.position,graph.nodes[from].p,Math.min(1,.45/Math.max(.01,ai.distance)));
 const forward=e.length-ai.distance+graph.coverDistance[to]-(length(near,player)-length(s.position,player))*1.8;
 const backward=ai.distance+graph.coverDistance[from]-(length(away,player)-length(s.position,player))*1.8;
 if(backward+.12<forward)reverse(ai,graph);
}
function nextEdge(ai,node,player,random,graph){
 const choices=graph.nodes[node].edges;
 if(ai.shelfTime>=2){const dist=distancesToFloor(graph);let selected=choices[0],best=Infinity;for(const id of choices){const e=graph.edges[id],v=e.a===node?e.b:e.a,score=e.length+dist[v];if(score<best){best=score;selected=id;}}ai.previous=ai.edge;ai.edge=selected;ai.reverse=graph.edges[selected].b===node;ai.distance=0;return;}
 const weights=choices.map(id=>{
  const e=graph.edges[id],to=e.a===node?e.b:e.a;
  if(ai.mode==='flee'){
   const p=graph.nodes[node].p,q=mix(p,graph.nodes[to].p,Math.min(1,.6/e.length));
   const score=(cover(e.surface)?5:0)-(e.length+graph.coverDistance[to])*.6+(length(q,player)-length(p,player))*2.5;
   return Math.exp(Math.max(-8,Math.min(7,score)))*(id===ai.edge?.18:1);
  }
  return (id===ai.edge?.12:1)*(id===ai.previous?.45:1)*(cover(e.surface)?1.1:1);
 });
 let r=random()*weights.reduce((a,b)=>a+b,0),selected=choices.at(-1);
 for(let i=0;i<choices.length;i++){r-=weights[i];if(r<=0){selected=choices[i];break;}}
 ai.previous=ai.edge;ai.edge=selected;ai.reverse=graph.edges[selected].b===node;ai.distance=0;
}

export function stepRoach(input,dt,context={},random=Math.random,graph=NAVIGATION){
 const ai={...input,moved:0},d=Math.max(0,Math.min(.05,dt)),player=context.player??[0,1.5,0];
 if(d===0)return ai;
 ai.age+=d;ai.timer-=d;ai.cooldown=Math.max(0,ai.cooldown-d);ai.threat=Math.max(0,ai.threat-d);ai.flightLeft=Math.max(0,ai.flightLeft-d);
 const current=sampleRoach(ai,graph),distance=length(current.position,player);
 ai.shelfTime=cover(current.surface)?(ai.shelfTime??0)+d:0;
 const aim=context.aim??[0,0,-1],toward=current.position.map((v,i)=>(v-player[i])/Math.max(.001,distance));
 const sprayed=context.spraying&&context.visible!==false&&distance<5.5&&toward.reduce((n,v,i)=>n+v*aim[i],0)>.86;
 const startled=context.running&&distance<2.8||context.visible!==false&&distance<.95;
 if(context.hitting||((sprayed||startled)&&ai.cooldown===0)){
  if(ai.shelfTime<2&&ai.threat===0&&ai.flightLeft===0)fleeOrientation(ai,player,graph);
  ai.threat=context.hitting?2.4:1.5;ai.flightLeft=context.hitting?8:5;ai.cooldown=.8;ai.mode='flee';ai.timer=.3;
 }
 const escaping=ai.threat>0||ai.flightLeft>0;
 if(escaping)ai.mode='flee';
 else if(ai.mode==='flee'){
  ai.mode=cover(current.surface)?'hide':'wander';ai.timer=ai.mode==='hide'?.8+random()*1.8:.3+random();
 }
 if(ai.timer<=0&&!escaping){
  const r=random();
  if(cover(current.surface)&&r<.32){ai.mode='hide';ai.timer=.6+random()*1.7;}
  else if(r<.22){ai.mode='pause';ai.timer=.12+random()*.48;}
  else{
   ai.mode=r<.58?'dash':'wander';ai.timer=.4+random()*1.3;ai.speed=ai.mode==='dash'?1.25+random()*.65:.55+random()*.6;
   if(r>.82&&ai.distance>.12&&ai.distance<graph.edges[ai.edge].length-.12)reverse(ai,graph);
  }
 }
 // Cover interrupts a pursuit briefly, unless spray is still actually hitting.
 if(ai.mode==='flee'&&cover(current.surface)&&ai.distance>.25&&!context.hitting&&context.visible===false){ai.mode='hide';ai.threat=0;ai.flightLeft=0;ai.timer=.8+random()*1.5;}
 if(ai.shelfTime>=2){const e=graph.edges[ai.edge],dist=distancesToFloor(graph),from=ai.reverse?e.b:e.a,to=ai.reverse?e.a:e.b;if(ai.distance+dist[from]<e.length-ai.distance+dist[to]-.001)reverse(ai,graph);ai.mode='descend';ai.speed=1.8;}
 let budget=(ai.mode==='hide'||ai.mode==='pause')?0:d*(ai.mode==='flee'?2.15+Math.sin(ai.age*17)*.2:ai.speed);
 budget*=context.speedMultiplier??1;ai.moved=budget;
 for(let guard=0;budget>0&&guard<12;guard++){
  const e=graph.edges[ai.edge],remaining=e.length-ai.distance;
  if(budget<remaining){ai.distance+=budget;break;}
  budget-=remaining;const node=ai.reverse?e.a:e.b;nextEdge(ai,node,player,random,graph);
 }
 return ai;
}

export function createCustomer(id){const route=CUSTOMER_ROUTES[id%CUSTOMER_ROUTES.length];return {id,x:route[0][0],z:route[0][1],yaw:0,next:1,wait:1+id*.4,alertUntil:0,awareness:new Map(),route};}
export function stepCustomer(input,dt,random=Math.random){const c={...input};if(c.wait>0){c.wait=Math.max(0,c.wait-dt);return c;}const [x,z]=c.route[c.next],dx=x-c.x,dz=z-c.z,d=Math.hypot(dx,dz),step=Math.min(d,Math.min(.05,Math.max(0,dt))*(.72+c.id*.07));c.yaw=Math.atan2(-dx,-dz);if(d>.001){c.x+=dx/d*step;c.z+=dz/d*step;}if(d<=step+.01){c.next=(c.next+1)%c.route.length;if(random()<.35)c.wait=.6+random()*1.4;}return c;}

export function stepCustomers(inputs,dt,player,random=Math.random){
 const result=inputs.map(c=>({...c})),d=Math.min(.05,Math.max(0,dt));
 for(let i=0;i<result.length;i++){
  const c=result[i],n=stepCustomer(c,d,random);if(c.wait>0){result[i]=n;continue;}
  const [gx,gz]=c.route[c.next],dx=gx-c.x,dz=gz-c.z,length=Math.hypot(dx,dz);if(length<.001){result[i]=n;continue;}
  const ux=dx/length,uz=dz/length,others=result.filter((_,j)=>j!==i),obstacles=[...others,player];
  let target=c.avoidTarget;
  if(target&&Math.hypot(target[0]-c.x,target[1]-c.z)<.12)target=null;
  if(!target&&obstacles.some(o=>{const x=o.x-c.x,z=o.z-c.z,along=x*ux+z*uz;return along>-.1&&along<1.15&&Math.abs(x*uz-z*ux)<.58;})){
   for(const sign of [1,-1]){const x=c.x+ux*.6-uz*.75*sign,z=c.z+uz*.6+ux*.75*sign;if(canOccupy(x,0,z,1.65,.26)&&obstacles.every(o=>Math.hypot(x-o.x,z-o.z)>.48)){target=[x,z];break;}}
  }
  const tx=target?target[0]-c.x:dx,tz=target?target[1]-c.z:dz,dist=Math.hypot(tx,tz),vx=tx/Math.max(.001,dist),vz=tz/Math.max(.001,dist),step=Math.min(dist,d*(.72+(c.id%4)*.07));
  let moved=false;
  for(const angle of [0,.45,-.45,.9,-.9,1.4,-1.4]){const x=c.x+(vx*Math.cos(angle)-vz*Math.sin(angle))*step,z=c.z+(vx*Math.sin(angle)+vz*Math.cos(angle))*step;
   if(!canOccupy(x,0,z,1.65,.24))continue;
   if(obstacles.some(o=>{const min=o===player ? .54 : .46,old=Math.hypot(c.x-o.x,c.z-o.z),next=Math.hypot(x-o.x,z-o.z);return next<min&&next<old+1e-6;}))continue;
   result[i]={...n,x,z,yaw:Math.atan2(c.x-x,c.z-z),avoidTarget:target};moved=true;break;
  }
  if(!moved)result[i]={...c,avoidTarget:null};
 }
 return result;
}
