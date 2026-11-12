import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENARIOS,REFORM_VERSION,REFORM_SOURCES,WEIGHT_GROUPS,REFORM_MODULES,comparisonGrade,comparisonModulePoints,compareModule,compareThresholds } from '../dist/reform-data.js';

// Independent transcription: SGB XI §15/Anlage2 and BT-Drs21/8869 pp28/54.
const limits={current:[12.5,27,47.5,70,90],draft:[15,30,50,70,90]};
for(const [scenario,thresholds] of Object.entries(limits))test(`${scenario}: each grade boundary below, exactly at, and above`,()=>{
  assert.equal(comparisonGrade(0,scenario),0);assert.equal(comparisonGrade(100,scenario),5);
  thresholds.forEach((boundary,i)=>{assert.equal(comparisonGrade(boundary-.001,scenario),i);assert.equal(comparisonGrade(boundary,scenario),i+1);assert.equal(comparisonGrade(boundary+.001,scenario),i+1);});
});
const weighted={1:[0,2.5,5,7.5,10],2:[0,3.75,7.5,11.25,15],3:[0,3.75,7.5,11.25,15],4:[0,10,20,30,40],5:[0,5,10,15,20],6:[0,3.75,7.5,11.25,15]};
const intervals={current:{1:[1,3,5,9,15],2:[1,5,10,16,33],3:[0,2,4,6,65],4:[2,7,18,36,54],5:[0,1,3,5,15],6:[0,3,6,11,18]},draft:{1:[1,3,6,9,15],2:[1,5,10,16,33],3:[0,2,4,6,65],4:[3,9,24,39,54],5:[0,1,3,5,15],6:[1,3,6,11,18]}};
for(const [scenario,modules] of Object.entries(intervals))for(const [module,upperBounds] of Object.entries(modules))test(`${scenario}: every raw value and every interval in module ${module}`,()=>{
  for(let raw=0;raw<=upperBounds.at(-1);raw++)assert.equal(comparisonModulePoints(Number(module),raw,scenario),weighted[module][upperBounds.findIndex(n=>raw<=n)],`raw ${raw}`);
});
test('Documented comparison examples and unchanged modules',()=>{
  assert.deepEqual(compareThresholds(28),{points:28,current:2,draft:1});
  assert.deepEqual(compareModule(4,8),{module:4,raw:8,current:20,draft:10,difference:-10});
  assert.equal(compareModule(1,6).difference,-2.5);assert.equal(compareModule(6,1).difference,-3.75);
  for(const module of [2,3,5])for(let raw=0;raw<=intervals.current[module].at(-1);raw++)assert.equal(compareModule(module,raw).difference,0);
  for(const module of [1,4,6])for(let raw=0;raw<=intervals.current[module].at(-1);raw++)assert.ok(compareModule(module,raw).difference<=0);
});
test('100 percent in five groups, six individually described modules, shared 2/3 counted once',()=>{
  assert.equal(WEIGHT_GROUPS.reduce((sum,g)=>sum+g.weight,0),100);assert.equal(WEIGHT_GROUPS.reduce((sum,g)=>sum+g.draftWeight,0),100);
  assert.deepEqual(WEIGHT_GROUPS.flatMap(g=>g.modules),[1,2,3,4,5,6]);assert.deepEqual(WEIGHT_GROUPS.map(g=>g.weight),[10,15,40,20,15]);
  assert.deepEqual(WEIGHT_GROUPS.find(g=>g.id==='23').modules,[2,3]);assert.equal(REFORM_MODULES.length,6);
  for(const group of WEIGHT_GROUPS)assert.equal(group.weight,group.draftWeight);
});
test('Comparison rejects out-of-range, fractional raw values, unknown rules and non-numbers',()=>{
  for(const value of [-1,100.01,NaN,Infinity,'28',null])assert.throws(()=>comparisonGrade(value,'current'),RangeError);
  assert.throws(()=>comparisonGrade(28,'future'),RangeError);
  for(const value of [-1,54.1,55,NaN,Infinity,'8'])assert.throws(()=>comparisonModulePoints(4,value,'draft'),RangeError);
  assert.throws(()=>comparisonModulePoints(7,0,'current'),RangeError);
});
test('Draft provenance is versioned and separate from current law',()=>{
  assert.equal(REFORM_VERSION.status,'draft');assert.equal(REFORM_VERSION.checkedAt,'2026-11-12');
  assert.notEqual(SCENARIOS.current.thresholds,SCENARIOS.draft.thresholds);assert.notEqual(SCENARIOS.current.tables,SCENARIOS.draft.tables);
  assert.equal(REFORM_SOURCES.draft.url,'https://dserver.bundestag.de/btd/21/088/2108869.pdf');
  for(const table of Object.values(SCENARIOS.draft.tables)){assert.equal(table.page,54);assert.equal(table.source,'draft');}
});
