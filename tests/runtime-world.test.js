import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const text=name=>fs.readFileSync(new URL(name,root),'utf8');
const dependency=(file,name)=>new URL(text(file).match(new RegExp("['\"]([^'\"]*"+name.replaceAll('.','\\.')+"(?:\\?[^'\"]*)?)['\"]"))[1],new URL(file,root));
test('rendering and AI import one identical store module URL',()=>{
 assert.equal(dependency('game.js','market-world.js').href,dependency('market-ai.js','market-world.js').href);
});
test('AI default navigation follows every store expansion and reset',async()=>{
 const world=await import(dependency('game.js','market-world.js').href),ai=await import(dependency('game.js','market-ai.js').href);
 try{for(const scale of [1,1.3,1.69,2.197,1]){
  const graph=world.setStoreScale(scale);
  for(let edge=0;edge<graph.edges.length;edge++){
   const state={...ai.createRoach(()=>.3),edge,reverse:false,distance:graph.edges[edge].length*.4};
   assert.deepEqual(ai.sampleRoach(state),ai.sampleRoach(state,graph),`scale ${scale}, edge ${edge}`);
   const context={player:[999,1,999]},expected=ai.stepRoach(state,.03,context,()=>.4,graph);
   assert.deepEqual(ai.stepRoach(state,.03,context,()=>.4),expected);
  }
  const customer=ai.createCustomer(0);assert.ok(world.CUSTOMER_ROUTES.some(route=>route===customer.route));
 }}finally{world.setStoreScale(1);}
});
