import {test} from 'node:test';import assert from 'node:assert/strict';
import {stepCustomers} from '../market-ai.js';
import {canOccupy} from '../market-world.js';
const customer=(id,x,z,route)=>({id,x,z,route,next:1,wait:0,yaw:0,alertUntil:0,awareness:new Map()});
test('head-on shoppers pass instead of blocking each other',()=>{let cs=[customer(0,0,-3,[[0,-3],[0,1]]),customer(1,0,1,[[0,1],[0,-3]])];let crossed=false;for(let i=0;i<500;i++){cs=stepCustomers(cs,.025,{x:99,z:99},()=>.9);assert.ok(Math.hypot(cs[0].x-cs[1].x,cs[0].z-cs[1].z)>.45);if(cs[0].z>cs[1].z)crossed=true;for(const c of cs)assert.ok(canOccupy(c.x,0,c.z,1.65,.24));}assert.ok(crossed);});
test('shoppers can go around a browsing customer and player',()=>{for(const blocker of ['customer','player']){let cs=[customer(0,0,-3,[[0,-3],[0,1]])],player={x:99,z:99};if(blocker==='customer')cs.push({...customer(1,0,-1,[[0,-1],[0,1]]),wait:100});else player={x:0,z:-1};let passed=false;for(let i=0;i<450;i++){cs=stepCustomers(cs,.025,player,()=>.9);if(cs[0].z>0)passed=true;}assert.ok(passed,blocker);}});
