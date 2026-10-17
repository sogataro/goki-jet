import {rewardMultiplier} from './pickups.js?v=0.3.0';
export const RULES={initialSatisfaction:50,noticePenalty:10,killReward:5,spraySeconds:30,sprayPenalty:15,cleanReward:5,dirtPeriod:30,corpseSeconds:4,respawnDelay:9,killDose:.9,noticeSeconds:.85,mopSeconds:.8};
export function createStoreState(){return {satisfaction:50,points:0,nextPickupAt:240,doubleUntil:0,powerUntil:0,cookieUntil:0,cookiePosition:null,trapAmmo:0,highSatisfactionTime:0,satisfactionBonuses:0,sprayUpgrade:0,bombAmmo:0,shotgunAmmo:0,level:1,elapsed:0,rocketAmmo:0,nextGachaAt:60,gachaAvailable:false,kills:0,cleaned:0,sprayCount:0,lost:false,tool:'spray',selectedWeapon:'spray',sprayRemaining:30,seen:new Set(),sprayedThisBurst:new Set(),nextDirtAt:30,dirtPenaltyTime:0,dirtPenalties:0};}
export function changeSatisfaction(state,delta){if(state.lost)return 0;const old=state.satisfaction;state.satisfaction=Math.max(0,Math.min(100,old+delta));state.lost=state.satisfaction===0;if(state.satisfaction<90)state.highSatisfactionTime=0;return state.satisfaction-old;}
export function noticeRoach(state,customer,roach){if(state.lost||!roach.alive)return false;const key=customer.id+':'+roach.id;if(state.seen.has(key))return false;state.seen.add(key);changeSatisfaction(state,-RULES.noticePenalty);return true;}
export function sprayCustomer(state,customer){if(state.lost||state.tool!=='spray'||state.sprayedThisBurst.has(customer.id))return false;state.sprayedThisBurst.add(customer.id);state.sprayCount++;changeSatisfaction(state,-15);return true;}
export function endSprayBurst(state){state.sprayedThisBurst.clear();}
export function ownedWeapons(state){const tools=['spray'];if(state.rocketAmmo>0)tools.push('rocket');if(state.bombAmmo>0)tools.push('bomb');if(state.sprayUpgrade===4)tools.push('shotgun');return tools;}
export function switchTool(state){if(state.tool==='mop')state.tool=ownedWeapons(state).includes(state.selectedWeapon)?state.selectedWeapon:'spray';else{state.selectedWeapon=state.tool;state.tool='mop';}endSprayBurst(state);return state.tool;}
export function cycleWeapon(state){const tools=ownedWeapons(state),current=state.tool==='mop'?state.selectedWeapon:state.tool;state.tool=tools[(tools.indexOf(current)+1)%tools.length];state.selectedWeapon=state.tool;endSprayBurst(state);return state.tool;}
export function cleanDirt(state,dirt){if(state.lost||state.tool!=='mop'||!dirt.active)return false;dirt.active=false;state.cleaned++;state.points+=10*rewardMultiplier(state);changeSatisfaction(state,5);return true;}
export function killRoach(state,roach){if(state.lost||!roach.alive)return false;roach.alive=false;roach.deadAt=state.elapsed;roach.respawnAt=roach.permanent===false?Infinity:state.elapsed+RULES.respawnDelay;state.kills++;state.points+=20*rewardMultiplier(state);changeSatisfaction(state,RULES.killReward);return true;}
export function corpseVisible(roach,elapsed){return !roach.alive&&elapsed-roach.deadAt<RULES.corpseSeconds;}
export function advanceStore(state,dt,activeDirt=0){
 if(state.lost)return 0;let remaining=Math.max(0,dt),additions=0,count=activeDirt;
 if(count<6)state.dirtPenaltyTime=0;if(state.satisfaction<90)state.highSatisfactionTime=0;
 while(remaining>1e-8&&!state.lost){
  const untilDirt=Math.max(0,state.nextDirtAt-state.elapsed),untilPenalty=count>=6?15-state.dirtPenaltyTime:Infinity;
  const untilBonus=state.satisfaction>=90?30-state.highSatisfactionTime:Infinity;const step=Math.min(remaining,untilDirt,untilPenalty,untilBonus);state.elapsed+=step;remaining-=step;if(count>=6)state.dirtPenaltyTime+=step;if(state.satisfaction>=90)state.highSatisfactionTime+=step;
  if(state.highSatisfactionTime>=30-1e-8){state.highSatisfactionTime=0;state.points+=100;state.satisfactionBonuses++;}
  if(state.dirtPenaltyTime>=15-1e-8){state.dirtPenaltyTime=0;state.dirtPenalties++;changeSatisfaction(state,-10);}
  if(!state.lost&&state.elapsed>=state.nextDirtAt-1e-8){additions+=2;count+=2;state.nextDirtAt+=RULES.dirtPeriod;}
 }
 return additions;
}
export function sprayCone(origin,dir,target,radius=.05,range=5.5,spread=.065){const v=target.map((t,i)=>t-origin[i]),d=Math.hypot(...v),along=v.reduce((s,t,i)=>s+t*dir[i],0);return d<=range&&along>0&&d*d-along*along<=(radius+along*spread)**2;}
export function customerSprayContact(origin,dir,customer,visible=()=>true,range=5.5,spread=.065){return [.2,.75,1.2,1.6].some(y=>{const p=[customer.x,y,customer.z];return sprayCone(origin,dir,p,.22,range,spread)&&visible(p);});}
export function customerSees(customer,target,visible=true){if(!target.alive||!visible)return false;const dx=target.position[0]-customer.x,dz=target.position[2]-customer.z,d=Math.hypot(dx,dz);if(d>(target.size>=3?4.5:2.6)||Math.abs(target.position[1]-1.5)>2)return false;return d<.25||(-Math.sin(customer.yaw)*dx-Math.cos(customer.yaw)*dz)/d>.45;}
export function mopTarget(origin,dir,dirt){if(dir[1]>=-.03)return false;const distance=-origin[1]/dir[1];if(distance<0||distance>2.8)return false;const x=origin[0]+dir[0]*distance,z=origin[2]+dir[2]*distance;return dirt.active&&Math.hypot(x-dirt.x,z-dirt.z)<.52;}
export function mouseLook(yaw,pitch,dx,dy,sensitivity=1,reposition=false){if(reposition)return {yaw,pitch};const k=.00085*sensitivity;return {yaw:yaw-dx*k,pitch:Math.max(-1.48,Math.min(1.48,pitch-dy*k))};}
export function formatTime(seconds){const ms=Math.max(0,Math.floor(seconds*100));return `${String(Math.floor(ms/6000)).padStart(2,'0')}:${String(Math.floor(ms/100)%60).padStart(2,'0')}.${String(ms%100).padStart(2,'0')}`;}

export function consumeSpray(state,dt){if(state.lost||state.tool!=='spray')return 0;const used=Math.min(state.sprayRemaining,Math.max(0,dt));state.sprayRemaining=Math.max(0,state.sprayRemaining-used);return used;}
export function buySpray(state){return buyItem(state,'refill');}

export function forwardTap(input,now,repeat=false){if(repeat)return input;const double=now-input.lastTap<=300;return {lastTap:double?-Infinity:now,sprinting:double};}

export function holdForward(input,pressed,dt){const held=pressed?(input.held??0)+Math.max(0,dt):0;return {...input,held,sprinting:pressed&&(input.sprinting||held>=.5)};}

export function levelSettings(elapsed){const level=1+Math.floor(Math.max(0,elapsed)/120);return {level,speed:1.2**(level-1),scale:storeScaleForLevel(level),roaches:3+3*(level-1),customers:4+Math.floor(level/2)};}

export function advanceGacha(state){if(state.lost)return false;let appeared=false;while(state.elapsed>=state.nextGachaAt){state.nextGachaAt+=60;if(!state.gachaAvailable){state.gachaAvailable=true;appeared=true;}}return appeared;}
export const GACHA_REWARDS=[{result:4,weight:28,points:200},{result:3,weight:20},{result:5,weight:15,points:500},{result:1,weight:10},{result:6,weight:4,points:1000},{result:7,weight:2,points:2000},{result:8,weight:1,points:5000},{result:2,weight:20}];
export function drawGacha(state,random=Math.random){if(state.lost||!state.gachaAvailable)return 0;state.gachaAvailable=false;const roll=Math.max(0,Math.min(.999999999999,random()))*100;let cumulative=0;const reward=GACHA_REWARDS.find(r=>{cumulative+=r.weight;return roll<cumulative;});if(reward.result===2)state.rocketAmmo=3;if(reward.points)state.points+=reward.points;return reward.result;}
export function fireRocket(state){if(state.lost||state.tool!=='rocket'||state.rocketAmmo<=0)return false;state.rocketAmmo--;return true;}
export function blastContains(center,position,radius=2){return Math.hypot(...center.map((v,i)=>v-position[i]))<=radius;}
export function requiredDose(roach){return roach.size>=3?1.5:RULES.killDose;}

export const UPGRADE_COSTS=[500,1000,1500,3000];
export function sprayStats(state,aiming=false){const stage=Math.min(3,state.sprayUpgrade);const a=aimStats(aiming);return {range:[5.5,6,7,8][stage]*a.range,spread:[.065,.085,.105,.105][stage]*a.area};}
export function shopCost(state,item){return item==='refill'?100:item==='bombs'?500:item==='upgrade'&&state.sprayUpgrade<4?UPGRADE_COSTS[state.sprayUpgrade]:Infinity;}
export function buyItem(state,item){const cost=shopCost(state,item);if(state.lost||!Number.isFinite(cost)||state.points<cost)return false;state.points-=cost;if(item==='refill'){state.sprayRemaining=RULES.spraySeconds;if(state.sprayUpgrade===4)state.shotgunAmmo=5;}else if(item==='bombs')state.bombAmmo++;else{state.sprayUpgrade++;if(state.sprayUpgrade===4)state.shotgunAmmo=5;}endSprayBurst(state);return true;}
export function useBomb(state){if(state.lost||state.tool!=='bomb'||state.bombAmmo<=0)return false;state.bombAmmo--;return true;}
export function fireShotgun(state){if(state.lost||state.tool!=='shotgun'||state.shotgunAmmo<=0)return false;state.shotgunAmmo--;return true;}

export function shotgunFrameHit(viewPoint,{fov,aspect,width,height,frameSize},range=8){const [x,y,z]=viewPoint;if(z>=0||Math.hypot(x,y,z)>range)return false;const tangent=Math.tan(fov*Math.PI/360),px=x/(-z*tangent*aspect)*width/2,py=y/(-z*tangent)*height/2;return Math.abs(px)<=frameSize/2&&Math.abs(py)<=frameSize/2;}

export function aimStats(aiming){return {range:aiming?1.4:1,area:aiming?.8:1,movement:aiming?.7:1};}
export function rocketStats(aiming){const a=aimStats(aiming);return {range:140*a.range,radius:2*a.area};}

export function storeScaleForLevel(level){return 1.3**2;}

export function useTrap(state){if(state.lost||state.tool!=='trap'||state.trapAmmo<=0)return false;state.trapAmmo--;return true;}
