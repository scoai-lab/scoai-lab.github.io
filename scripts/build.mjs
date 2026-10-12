import { cp, mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const dist=join(root,'dist');
for(const kind of ['conference','mpc']){
 const data=JSON.parse(await readFile(join(root,'data',`${kind}.json`),'utf8'));
 if(!data.entries.length || new Set(data.entries.map(e=>e.id)).size!==data.entries.length)throw Error(`Invalid or duplicate ${kind} data`);
 for(const entry of data.entries){
  if(!entry.name || !Array.isArray(entry.deadlines))throw Error(`Incomplete entry: ${entry.name}`);
  for(const d of entry.deadlines)for(const k of ['date','abstract'])if(d[k]&&!Number.isFinite(Date.parse(d[k])))throw Error(`Invalid timestamp: ${entry.name} ${d[k]}`);
 }
}
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
for(const path of ['index.html','credits.html','conference-deadlines','mpc-deadlines','assets','data'])await cp(join(root,path),join(dist,path),{recursive:true});
await mkdir(join(dist,'docs'),{recursive:true});
for(const file of ['MPC-LICENSE.txt','CCF-LICENSE.txt'])await cp(join(root,'docs',file),join(dist,'docs',file));
await writeFile(join(dist,'.nojekyll'),'');
console.log('Built dist/: home, conference deadlines, MPC deadlines, credits, local assets and data.');
