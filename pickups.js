export const PICKUP_TYPES=['double','cookie','power','boom'];
export function duePickups(state){if(state.lost)return 0;let count=0;while(state.elapsed>=state.nextPickupAt){state.nextPickupAt+=240;count++;}return count;}
export function activatePickup(state,type,position){if(state.lost||!PICKUP_TYPES.includes(type))return false;if(type==='double')state.doubleUntil=state.elapsed+15;if(type==='power')state.powerUntil=state.elapsed+15;if(type==='cookie'){state.cookieUntil=state.elapsed+20;state.cookiePosition=[...position];}return true;}
export const rewardMultiplier=state=>state.elapsed<(state.doubleUntil??0)?2:1;
export const powered=state=>state.elapsed<(state.powerUntil??0);
export function grantLevel(state){state.level++;state.points+=500;}
