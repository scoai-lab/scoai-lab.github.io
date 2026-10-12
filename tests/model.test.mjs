import test from 'node:test';
import assert from 'node:assert/strict';
import { selectEntries, nextDeadline, countdown, calendar, safeURL } from '../assets/model.js';

const now = Date.parse('2026-10-12T00:00:00Z');
const entries = [
 {id:'a',name:'Alpha',description:'Learning',place:'Paris',country:'France',tags:['AI','A*','CNF'],deadlines:[{date:'2026-10-15T00:00:00Z',abstract:'2026-10-10T00:00:00Z'}]},
 {id:'b',name:'Beta',description:'Security',place:'Hanoi',country:'Vietnam',tags:['SC','A','JRN'],deadlines:[{date:'2026-10-20T00:00:00Z'}]},
 {id:'c',name:'Gamma',tags:['AI','A'],tba:true,deadlines:[{date:'2026-11-01T00:00:00Z'}]},
 {id:'d',name:'Old',tags:['AI','B'],deadlines:[{date:'2026-01-01T00:00:00Z'}]}
];
test('OR within groups and AND across groups, with country and text search',()=>{
 assert.deepEqual(selectEntries(entries,{groups:[['AI','SC'],['A*']],q:'par',country:'France'},now).map(x=>x.id),['a']);
 assert.deepEqual(selectEntries(entries,{q:'nothing'},now),[]);
});
test('confirmed upcoming precedes unannounced and expired; status distinguishes each',()=>{
 assert.deepEqual(selectEntries(entries,{},now).map(x=>x.id),['a','b','c','d']);
 assert.deepEqual(selectEntries(entries,{status:'upcoming'},now).map(x=>x.id),['a','b']);
 assert.deepEqual(selectEntries(entries,{status:'tba'},now).map(x=>x.id),['c']);
});
test('next deadline ignores passed abstract and unknown/expected dates',()=>{
 assert.equal(nextDeadline(entries[0],now),Date.parse('2026-10-15T00:00:00Z'));
 assert.equal(nextDeadline(entries[2],now),Infinity);
 assert.equal(nextDeadline({deadlines:[{date:'TBA'}]},now),Infinity);
});
test('countdown handles boundary and day rollover',()=>{
 assert.deepEqual(countdown(now+86461000,now),{days:1,hours:0,minutes:1,seconds:1,expired:false});
 assert.equal(countdown(now,now).expired,true);
});
test('calendar exports actual future paper/abstract dates in UTC and escapes fields',()=>{
 const data=calendar([{...entries[0],name:'Alpha, Test;\\Lab\nNew'}],now);
 assert.match(data,/DTSTART:20261015T000000Z/);
 assert.match(data,/Alpha\\, Test\\;\\\\Lab\\nNew/);
 assert.equal((data.match(/BEGIN:VEVENT/g)||[]).length,1);
 assert.equal((calendar([entries[2]],now).match(/BEGIN:VEVENT/g)||[]).length,0);
});
test('external links reject executable URL schemes',()=>{
 assert.equal(safeURL('javascript:alert(1)'),'#');
 assert.equal(safeURL('https://example.org/'),'https://example.org/');
});
test('calendar identities follow a deadline, not its position in a source array',()=>{
 const first={...entries[0],deadlines:[{date:'2026-10-15T00:00:00Z'}]};
 const other={...first,deadlines:[{date:'2027-01-15T00:00:00Z'}]};
 const moved={...first,deadlines:[{date:'2026-01-01T00:00:00Z'},...first.deadlines]};
 const uid=e=>calendar([e],now).match(/UID:(.+)/)[1];
 assert.notEqual(uid(first),uid(other));
 assert.equal(uid(first),uid(moved));
});
