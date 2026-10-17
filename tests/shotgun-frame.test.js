import {test} from 'node:test';import assert from 'node:assert/strict';
import {shotgunFrameHit,sprayStats} from '../market-state.js';
const view={fov:73,aspect:16/9,width:1440,height:810,frameSize:136};
test('shotgun only hits within the visible square and eight metre range',()=>{assert.ok(shotgunFrameHit([0,0,-4],view));const edge=68/405*4*Math.tan(73*Math.PI/360);assert.ok(shotgunFrameHit([edge*.99,edge*.99,-4],view));assert.equal(shotgunFrameHit([edge*1.01,0,-4],view),false);assert.equal(shotgunFrameHit([0,edge*1.01,-4],view),false);assert.equal(shotgunFrameHit([0,0,-8.01],view),false);assert.equal(shotgunFrameHit([0,0,4],view),false);});
test('square hit geometry also matches resized viewports',()=>{const v={...view,aspect:1,width:600,height:600,frameSize:100};const x=50/300*3*Math.tan(73*Math.PI/360);assert.ok(shotgunFrameHit([x*.99,0,-3],v));assert.equal(shotgunFrameHit([x*1.01,0,-3],v),false);});
test('1500 point upgrade increases range only',()=>{assert.equal(sprayStats({sprayUpgrade:2}).spread,sprayStats({sprayUpgrade:3}).spread);assert.equal(sprayStats({sprayUpgrade:3}).range,8);});
