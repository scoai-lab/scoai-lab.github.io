import { cp, mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
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
// Fresh URLs prevent stale cached styling and controls after a deployment.
for (const asset of ['style.css','app.js','theme.js']) {
 const hash=createHash('sha256').update(await readFile(join(dist,'assets',asset))).digest('hex').slice(0,10);
 for (const page of ['index.html','credits.html','conference-deadlines/index.html','mpc-deadlines/index.html']) {
  const path=join(dist,page);const html=await readFile(path,'utf8');
  await writeFile(path,html.replaceAll(`assets/${asset}"`,`assets/${asset}?v=${hash}"`));
 }
}
console.log('Built dist/: home, conference deadlines, MPC deadlines, credits, local assets and data.');
