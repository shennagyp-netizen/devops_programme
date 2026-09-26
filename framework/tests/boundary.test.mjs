import{describe,expect,it}from"vitest";import{readdir,readFile}from"node:fs/promises";import{join}from"node:path";
async function files(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())out.push(...await files(p));else if(/\.tsx?$/.test(p))out.push(p)}return out}
describe("framework boundary",()=>{
 it("has no domain, database, or app dependency",async()=>{const bad=["DevOps","Docker","Kubernetes","drizzle","postgres","next/","../data/","../lib/server/"];for(const f of await files(join(process.cwd(),"src"))){const s=await readFile(f,"utf8");for(const token of bad)expect(s,f+" contains "+token).not.toContain(token)}});
 it("exposes generic package surfaces",async()=>{const s=await readFile(join(process.cwd(),"src/index.ts"),"utf8");expect(s).toContain("./core");expect(s).toContain("./runtime");expect(s).toContain("./react")});
});