export const STORE={minX:-14.72,maxX:14.72,minZ:-11.72,maxZ:11.72,height:4.2};
const rect=(name,x,z,w,d,minY,maxY)=>({name,x,z,w,d,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY,maxY});
export const VENDING={name:'vending',type:'vending',x:0,z:9.7,w:1.4,d:.8,minX:-.7,maxX:.7,minZ:9.3,maxZ:10.1,minY:0,maxY:2.3};
export const FIXTURES=[VENDING,...[-2,2].map((x,i)=>({...rect('display'+i,x,6.7,1.1,1.8,0,1.88),type:'shelf',label:'SPECIALS'})),...[-10,-6,6,10].map((x,i)=>({...rect('freezer'+i,x,6.7,2,1.2,0,.95),type:'freezer'})),...[-10,-6,-2,2,6,10].map((x,i)=>({...rect('shelf'+i,x,-3.2,1.4,8.8,0,1.88),type:'shelf'})),...[-6,6].map((x,i)=>({...rect('produce'+i,x,4.0,1.8,1.1,0,.9),type:'produce'})),...[-10,-6,6,10].map((x,i)=>({...rect('checkout'+i,x,10.2,2.1,.9,0,1),type:'checkout'})),...[-10,-5,0,5,10].map((x,i)=>({...rect('chiller'+i,x,-11.4,4,.7,0,2.5),type:'chiller'}))];
export const overlap=(x,z,b,r=.18)=>x+r>b.minX+1e-6&&x-r<b.maxX-1e-6&&z+r>b.minZ+1e-6&&z-r<b.maxZ-1e-6;
export function canOccupy(x,y,z,height=1.65,r=.18){return x>=STORE.minX&&x<=STORE.maxX&&z>=STORE.minZ&&z<=STORE.maxZ&&y>=-1e-6&&y+height<=STORE.height+1e-6&&!FIXTURES.some(b=>overlap(x,z,b,r)&&y+height>b.minY+1e-5&&y<b.maxY-1e-5);}
export function stepPlayer(body,f,r,yaw,dt,{sprinting=false,jump=false,speedMultiplier=1}={}){
 const p={...body},d=Math.min(.04,Math.max(0,dt)),speed=(sprinting?5.6:2.05)*speedMultiplier,norm=Math.max(1,Math.hypot(f,r));
 if(jump&&p.grounded)p.vy=6.4;
 const dx=(-Math.sin(yaw)*f+Math.cos(yaw)*r)*speed*d/norm,dz=(-Math.cos(yaw)*f-Math.sin(yaw)*r)*speed*d/norm;
 if(canOccupy(p.x+dx,p.y,p.z))p.x+=dx;if(canOccupy(p.x,p.y,p.z+dz))p.z+=dz;
 p.vy-=12*d;let next=p.y+p.vy*d;p.grounded=false;
 if(p.vy<=0){let floor=0;for(const b of FIXTURES)if(overlap(p.x,p.z,b)&&p.y>=b.maxY-1e-5&&next<=b.maxY)floor=Math.max(floor,b.maxY);if(next<=floor){next=floor;p.vy=0;p.grounded=true;}}
 else{let ceiling=STORE.height-1.65;for(const b of FIXTURES)if(overlap(p.x,p.z,b)&&p.y+1.65<=b.minY+1e-5&&next+1.65>=b.minY)ceiling=Math.min(ceiling,b.minY-1.65);if(next>=ceiling){next=ceiling;p.vy=0;}}
 p.y=Math.max(0,next);return p;
}
export function floorPoint(random=Math.random){for(let i=0;i<200;i++){const x=STORE.minX+.9+random()*(STORE.maxX-STORE.minX-1.8),z=STORE.minZ+1.7+random()*(STORE.maxZ-STORE.minZ-2.6);if(canOccupy(x,0,z,1.65,.65))return [x,z];}return [0,4.5];}
const len=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
function clear(a,b,n){for(let i=0,N=Math.ceil(len(a,b)/.06);i<=N;i++){const p=a.map((v,j)=>v+(b[j]-v)*i/N+n[j]*.015);for(const box of FIXTURES){const q=[Math.max(box.minX,Math.min(p[0],box.maxX)),Math.max(box.minY,Math.min(p[1],box.maxY)),Math.max(box.minZ,Math.min(p[2],box.maxZ))];if(len(p,q)<.023)return false;}}return true;}
export function buildStoreNavigation(){
 const nodes=[],edges=[],map=new Map(),known=new Set(),up=[0,1,0];
 function node(p){const key=p.join(',');if(!map.has(key)){map.set(key,nodes.length);nodes.push({p,edges:[]});}return map.get(key);}
 function connect(a,b,n=up,surface='floor'){if(len(a,b)<.001||!clear(a,b,n))return;const u=node(a),v=node(b),key=[Math.min(u,v),Math.max(u,v)].join(':');if(known.has(key))return;known.add(key);const id=edges.length;edges.push({a:u,b:v,n,surface,length:len(a,b)});nodes[u].edges.push(id);nodes[v].edges.push(id);}
 const xs=[-12,-8,-4,0,4,8,12],zs=[-9,-6,-3,0,2.6,5.3,8.3];
 for(const x of xs)for(let i=0;i<zs.length-1;i++)connect([x,.035,zs[i]],[x,.035,zs[i+1]]);
 for(const z of [-9,2.6,5.3,8.3])for(let i=0;i<xs.length-1;i++)connect([xs[i],.035,z],[xs[i+1],.035,z]);
 for(const x of [-10,-6,-2,2,6,10]){
  for(const sign of [-1,1]){const sx=x+sign*.735;connect([x+sign*2,.035,0],[sx,.035,0]);connect([sx,.035,0],[sx,1.915,0],[sign,0,0],'shelf');}
  connect([x-.735,1.915,0],[x+.735,1.915,0],up,'shelf');
  connect([x-.735,1.915,0],[x-.735,1.915,-3],up,'shelf');connect([x-.735,1.915,-3],[x+.735,1.915,-3],up,'shelf');connect([x+.735,1.915,-3],[x+.735,1.915,0],up,'shelf');
 }
 connect([12,.035,2.6],[14.965,.035,2.6]);connect([14.965,.035,2.6],[14.965,4.165,2.6],[-1,0,0],'wall');connect([14.965,4.165,2.6],[-14.965,4.165,2.6],[0,-1,0],'ceiling');connect([-14.965,4.165,2.6],[-14.965,.035,2.6],[1,0,0],'wall');connect([-14.965,.035,2.6],[-12,.035,2.6]);
 const coverDistance=nodes.map(()=>Infinity),pending=new Set(nodes.map((_,i)=>i));for(const e of edges)if(e.surface==='shelf')coverDistance[e.a]=coverDistance[e.b]=0;
 while(pending.size){let u=-1;for(const v of pending)if(u<0||coverDistance[v]<coverDistance[u])u=v;pending.delete(u);for(const id of nodes[u].edges){const e=edges[id],v=e.a===u?e.b:e.a;coverDistance[v]=Math.min(coverDistance[v],coverDistance[u]+e.length);}}
 return {nodes,edges,coverDistance};
}
export let STORE_NAVIGATION=buildStoreNavigation();
export const CUSTOMER_ROUTES=[
 [[-12,8.3],[-12,-9],[-8,-9],[-8,2.6],[-12,2.6]],
 [[0,2.6],[0,-9],[4,-9],[4,2.6]],
 [[12,8.3],[12,-9],[8,-9],[8,2.6],[12,2.6]],
 [[-4,8.3],[-4,2.6],[0,2.6],[0,8.3]]
];

const baseStore={...STORE},baseFixtures=FIXTURES.map(f=>({...f})),baseRoutes=CUSTOMER_ROUTES.map(r=>r.map(p=>[...p])),baseNavigation=structuredClone(STORE_NAVIGATION);
export function setStoreScale(scale){
 for(const key of ['minX','maxX','minZ','maxZ'])STORE[key]=baseStore[key]*scale;
 FIXTURES.forEach((f,i)=>{for(const key of ['x','z','w','d','minX','maxX','minZ','maxZ'])f[key]=baseFixtures[i][key]*scale;});
 CUSTOMER_ROUTES.forEach((route,i)=>route.forEach((p,j)=>{p[0]=baseRoutes[i][j][0]*scale;p[1]=baseRoutes[i][j][1]*scale;}));
 STORE_NAVIGATION=structuredClone(baseNavigation);for(const n of STORE_NAVIGATION.nodes){n.p[0]*=scale;n.p[2]*=scale;}
 for(const e of STORE_NAVIGATION.edges)e.length=len(STORE_NAVIGATION.nodes[e.a].p,STORE_NAVIGATION.nodes[e.b].p);
 const {nodes,edges}=STORE_NAVIGATION,dist=nodes.map(()=>Infinity),pending=new Set(nodes.map((_,i)=>i));for(const e of edges)if(e.surface==='shelf')dist[e.a]=dist[e.b]=0;
 while(pending.size){let u=-1;for(const v of pending)if(u<0||dist[v]<dist[u])u=v;pending.delete(u);for(const id of nodes[u].edges){const e=edges[id],v=e.a===u?e.b:e.a;dist[v]=Math.min(dist[v],dist[u]+e.length);}}STORE_NAVIGATION.coverDistance=dist;
 return STORE_NAVIGATION;
}
