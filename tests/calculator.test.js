import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, MODULES, RULESET, SOURCES } from '../dist/data.js';
import { calculate, calculateModule5, criterionRange, gradeForPoints, weightedPoints, groupAPoints, groupBPoints, groupCPoints, isAnswered, round4 } from '../dist/calculator.js';

const independent=()=>Object.fromEntries(QUESTIONS.map(q=>[q.id,q.type==='choice'?0:q.type==='continence'?{eligible:false}:q.type==='frequency'?{day:0}:{week:0}]));
const maximum=()=>Object.fromEntries(QUESTIONS.map(q=>[q.id,q.type==='choice'?Math.max(...q.options.map(o=>o.value)):q.type==='continence'?{eligible:true,value:3}:q.type==='frequency'?{day:9}:q.type==='intensive'?{daily:true}:{week:0}]));

test('Complete statutory catalog, all source references and help texts',()=>{
  assert.equal(QUESTIONS.length,64);
  assert.equal(new Set(QUESTIONS.map(q=>q.id)).size,64);
  assert.deepEqual(MODULES.map(m=>m.questions.length),[5,11,13,13,16,6]);
  for(const q of QUESTIONS){
    assert.ok(q.question.length>10 && q.help.length>20,q.id);
    assert.ok(q.sourceIds.every(id=>SOURCES[id]),q.id);
    for(const option of q.options??[]) assert.ok(option.label && option.description.length>10,q.id);
  }
});

// These expected arrays are transcribed independently from SGB XI Anlage 2,
// not derived from the production rules. Every integer raw score is checked.
const expectedTables={
  1:[0,0,2.5,2.5,5,5,7.5,7.5,7.5,7.5,...Array(6).fill(10)],
  2:[0,0,...Array(4).fill(3.75),...Array(5).fill(7.5),...Array(6).fill(11.25),...Array(17).fill(15)],
  3:[0,3.75,3.75,7.5,7.5,11.25,11.25,...Array(59).fill(15)],
  4:[...Array(3).fill(0),...Array(5).fill(10),...Array(11).fill(20),...Array(18).fill(30),...Array(18).fill(40)],
  5:[0,5,10,10,15,15,...Array(10).fill(20)],
  6:[0,...Array(3).fill(3.75),...Array(3).fill(7.5),...Array(5).fill(11.25),...Array(7).fill(15)],
};
for(const [module,table] of Object.entries(expectedTables)){
  test(`Module ${module}: every statutory table cell and boundaries`,()=>{
    assert.equal(table.length,RULESET.tables[module].maxRaw+1);
    table.forEach((expected,raw)=>assert.equal(weightedPoints(Number(module),raw),expected,`M${module} raw=${raw}`));
    assert.throws(()=>weightedPoints(Number(module),-1),RangeError);
    assert.throws(()=>weightedPoints(Number(module),table.length),RangeError);
    assert.throws(()=>weightedPoints(Number(module),0.1),RangeError);
  });
}
for(const [boundary,grade] of [[12.5,1],[27,2],[47.5,3],[70,4],[90,5]]){
  test(`Care-grade boundary ${boundary}: immediately below, on, and above`,()=>{
    assert.equal(gradeForPoints(boundary-0.0001),grade-1);
    assert.equal(gradeForPoints(boundary),grade);
    assert.equal(gradeForPoints(boundary+0.0001),grade);
  });
}
test('Overall limits and invalid inputs',()=>{
  assert.equal(gradeForPoints(0),0); assert.equal(gradeForPoints(100),5);
  for(const n of [-1,100.001,NaN,Infinity,'90']) assert.throws(()=>gradeForPoints(n),RangeError);
  assert.throws(()=>weightedPoints(7,0),RangeError);
  assert.throws(()=>calculate(independent(),{adult:false}),RangeError);
  assert.throws(()=>calculate(independent(),{adult:null}),RangeError);
});
test('All independent is 0; all maximal is 100 and raw maxima match statute',()=>{
  const low=calculate(independent()), high=calculate(maximum());
  assert.deepEqual(low.total,{min:0,max:0}); assert.deepEqual(low.grade,{min:0,max:0});
  assert.deepEqual(high.total,{min:100,max:100}); assert.deepEqual(high.grade,{min:5,max:5});
  assert.deepEqual(high.modules.map(m=>m.raw.min),[15,33,65,54,15,18]);
  assert.equal(high.complete,true);assert.equal(high.answeredCount,64);
});
test('Module 2 and 3 use only higher WEIGHTED score, not higher raw or their sum',()=>{
  const a=independent(); a['2.1']=3;a['3.1']=3;
  let r=calculate(a); assert.equal(r.modules[1].weighted.min,3.75);assert.equal(r.modules[2].weighted.min,7.5);assert.equal(r.total.min,7.5);
  a['2.2']=3;a['2.3']=3;a['2.4']=3; // M2 raw12 > M3 raw3; weighted11.25 >7.5
  r=calculate(a);assert.equal(r.total.min,11.25);
  a['3.1']=5;a['3.2']=5; // M3 raw10 < M2 raw12, yet weighted15 >11.25
  r=calculate(a);assert.equal(r.total.min,15);
});
test('Every combination of M2/M3 raw scores uses weighted maximum',()=>{
  function assignments(questions){
    let possibilities=new Map([[0,{}]]);
    for(const q of questions){
      const next=new Map();
      for(const [sum,answers] of possibilities)for(const option of q.options)next.set(sum+option.value,{...answers,[q.id]:option.value});
      possibilities=next;
    }
    return possibilities;
  }
  const base=independent();
  for(const [raw2,answers2] of assignments(MODULES[1].questions))for(const [raw3,answers3] of assignments(MODULES[2].questions)){
    const r=calculate({...base,...answers2,...answers3});
    assert.equal(r.total.min,Math.max(expectedTables[2][raw2],expectedTables[3][raw3]),`raw2=${raw2}, raw3=${raw3}`);
  }
});
test('Module 3 uses 0,1,3,5 for every behavior',()=>{
  for(const q of MODULES[2].questions) assert.deepEqual(q.options.map(o=>o.value),[0,1,3,5]);
  const a=independent();a['3.1']=1;assert.equal(calculate(a).modules[2].raw.min,1);
  a['3.1']=2;assert.throws(()=>calculate(a),RangeError);
});
test('Module 4 distinct scales: eating ×3, drinking/toilet ×2, others ×1',()=>{
  for(const id of ['4.8','4.9','4.10','4.1']){
    const expected=id==='4.8'?[0,3,6,9]:id==='4.1'?[0,1,2,3]:[0,2,4,6];
    assert.deepEqual(QUESTIONS.find(q=>q.id===id).options.map(o=>o.value),expected);
    for(const value of expected){const a=independent();a[id]=value;assert.equal(calculate(a).modules[3].raw.min,value);}
  }
});
test('Incontinence requires eligibility; unknown eligibility stays uncertain',()=>{
  for(const id of ['4.11','4.12']){
    assert.deepEqual(criterionRange(id,{eligible:false,value:3}),{min:0,max:0});
    assert.deepEqual(criterionRange(id,{eligible:true,value:3}),{min:3,max:3});
    assert.deepEqual(criterionRange(id,{eligible:null,value:2}),{min:0,max:2});
    assert.deepEqual(criterionRange(id,{eligible:true,value:null}),{min:0,max:3});
    assert.equal(isAnswered(id,{eligible:null,value:2}),false);
  }
});
test('Tube feeding is 0/6/3; full tube feeding does not erase eating/drinking',()=>{
  assert.deepEqual(QUESTIONS.find(q=>q.id==='4.13').options.map(o=>o.value),[0,6,3]);
  const a=independent();a['4.8']=9;a['4.9']=6;a['4.13']=3;
  assert.equal(calculate(a).modules[3].raw.min,18);
  a['4.13']=6;assert.equal(calculate(a).modules[3].raw.min,21);
  a['4.13']=null;assert.deepEqual(calculate(a).modules[3].raw,{min:15,max:21});
});
test('Module5 group A all threshold sides',()=>{
  for(const [x,p] of [[0,0],[0.9999,0],[1,1],[1.0001,1],[2.9999,1],[3,1],[3.0001,2],[7.9999,2],[8,2],[8.0001,3]]) assert.equal(groupAPoints(x),p);
});
test('Module5 group B all threshold sides including rounded 1/7',()=>{
  for(const [x,p] of [[0,0],[0.1428,0],[0.1429,1],[0.143,1],[0.9999,1],[1,2],[1.0001,2],[2.9999,2],[3,3],[3.0001,3]]) assert.equal(groupBPoints(x),p);
  const a=independent();a['5.8']={week:1};const b=calculateModule5(a).groups[1];assert.equal(b.dayAverage,0.1429);assert.equal(b.raw.min,1);
  a['5.8']={month:4};assert.equal(calculateModule5(a).groups[1].raw.min,0);
  a['5.8']={month:5};assert.equal(calculateModule5(a).groups[1].raw.min,1);
});
test('Module5 group C all threshold sides',()=>{
  for(const [x,p] of [[0,0],[4.2999,0],[4.3,1],[4.3001,1],[8.5999,1],[8.6,2],[8.6001,2],[12.8999,2],[12.9,3],[12.9001,3],[59.9999,3],[60,6],[60.0001,6]]) assert.equal(groupCPoints(x),p);
});
test('Module5 sums counts before daily conversion, rounds each step to 4 places',()=>{
  const a=independent();a['5.1']={day:3};a['5.2']={month:3};a['5.5']={week:2};
  const g=calculateModule5(a).groups[0];assert.equal(g.dayAverage,3.3857);assert.equal(g.raw.min,2);
  a['5.1']={week:2};a['5.2']={week:3};a['5.5']={week:2};assert.equal(calculateModule5(a).groups[0].dayAverage,1);
  a['5.1']={month:29};a['5.2']={month:1};a['5.5']={week:0};assert.equal(calculateModule5(a).groups[0].dayAverage,1);
  assert.equal(round4(1/7),0.1429);assert.equal(round4(2/7),0.2857);assert.equal(round4(1/30),0.0333);
});
test('Module5 official group B example after one-unit encoding',()=>{
  const a=independent();a['5.10']={month:32};a['5.8']={week:2};
  const b=calculateModule5(a).groups[1];assert.equal(b.dayAverage,1.3524);assert.equal(b.raw.min,2);
});
test('Every module5 frequency criterion contributes to its assigned group',()=>{
  for(let index=1;index<=11;index++){
    const a=independent();a[`5.${index}`]={day:1};const m=calculateModule5(a);
    assert.equal(m.raw.min,index<=7?1:2,`5.${index}`);
    assert.equal(m.groups[index<=7?0:1].raw.min,index<=7?1:2);
  }
});
test('Module5 visits use exactly 4.3/8.6 and 1/2, not 30/7',()=>{
  for(const [id,w,m] of [['5.12',8.6,2],['5.13',4.3,1],['5.14',4.3,1],['5.15',8.6,2]]){
    const a=independent();a[id]={week:1};assert.equal(calculateModule5(a).groups[2].frequencyPoints,w);
    a[id]={month:1};assert.equal(calculateModule5(a).groups[2].frequencyPoints,m);
  }
  const a=independent();a['5.13']={week:1};a['5.15']={month:1};
  const c=calculateModule5(a).groups[2];assert.equal(c.frequencyPoints,6.3);assert.equal(c.raw.min,1);
  a['5.13']={week:3};a['5.15']={month:0};assert.equal(calculateModule5(a).groups[2].frequencyPoints,12.9);assert.equal(calculateModule5(a).groups[2].raw.min,3);
});
test('Module5 daily intensive is fixed60 and6 group points; diet independent',()=>{
  const a=independent();a['5.12']={daily:true};let m=calculateModule5(a);
  assert.equal(m.groups[2].frequencyPoints,60);assert.equal(m.raw.min,6);
  for(const value of [0,1,2,3]){a['5.16']=value;m=calculateModule5(a);assert.equal(m.raw.min,6+value);}
});
test('Module5 invalid, fractional, mixed-period or daily visit answers rejected',()=>{
  for(const value of [{day:-1},{day:0.5},{day:'1'},{day:Infinity},{day:1,week:1},{day:Number.MAX_SAFE_INTEGER+1},{}]){
    const a=independent();a['5.1']=value;assert.throws(()=>calculate(a));
  }
  for(const id of ['5.13','5.14','5.15']){const a=independent();a[id]={day:1};assert.throws(()=>calculate(a));}
  const a=independent();a['5.12']={daily:true,week:1};assert.throws(()=>calculate(a));
});
test('No answers yield conservative full0–100 range, not an exact score',()=>{
  const r=calculate();assert.equal(r.complete,false);assert.equal(r.answeredCount,0);assert.equal(r.missingIds.length,64);assert.deepEqual(r.total,{min:0,max:100});assert.deepEqual(r.grade,{min:0,max:5});
});
test('Missing answers remain marked even when weighted range collapses',()=>{
  const a=maximum();a['3.1']=null;const r=calculate(a);
  assert.equal(r.complete,false);assert.deepEqual(r.missingIds,['3.1']);assert.deepEqual(r.total,{min:100,max:100});
});
test('Unknown M5 measures bound their group, never silently treated as zero',()=>{
  const a=independent();a['5.1']=null;let r=calculate(a);assert.deepEqual(r.modules[4].raw,{min:0,max:3});assert.deepEqual(r.total,{min:0,max:10});
  a['5.12']=null;r=calculate(a);assert.deepEqual(r.modules[4].raw,{min:0,max:9});assert.deepEqual(r.total,{min:0,max:20});
});
test('All one-choice missing ranges contain every completion and attain endpoints',()=>{
  for(const q of QUESTIONS.filter(q=>q.type==='choice')){
    const a=independent();a[q.id]=null;const bounded=calculate(a).total;
    const totals=q.options.map(option=>calculate({...a,[q.id]:option.value}).total.min);
    assert.equal(bounded.min,Math.min(...totals),q.id);assert.equal(bounded.max,Math.max(...totals),q.id);
  }
});
test('Documented integrated example: 38.75 points gives grade2',()=>{
  const a=independent();a['1.1']=2; // M1 raw2 ->2.5
  a['2.1']=2; // M2 raw2 ->3.75
  a['4.1']=3;a['4.2']=3;a['4.3']=2; // M4 raw8 ->20
  a['5.1']={day:1}; // M5 raw1 ->5
  a['6.1']=2;a['6.2']=2; // M6 raw4 ->7.5
  const r=calculate(a);assert.equal(r.total.min,38.75);assert.equal(r.grade.min,2);assert.equal(r.complete,true);
});
test('No exceptional grade5 is automatically assigned below90',()=>{
  const a=independent();for(const q of MODULES[0].questions)a[q.id]=3;
  const r=calculate(a);assert.equal(r.total.min,10);assert.equal(r.grade.min,0);assert.match(r.exceptionNotice,/Pflegegrad 5/);
});
test('Engine is deterministic and does not mutate input',()=>{
  const a=maximum(),snapshot=JSON.stringify(a),one=calculate(a),two=calculate(a);
  assert.deepEqual(one,two);assert.equal(JSON.stringify(a),snapshot);
});
