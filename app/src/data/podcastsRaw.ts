export type Turn={speaker:"A"|"B";text:string};

export const dayFor=(id:string)=>id.split(".")[0];

export const podcastUrl=(dayId:string)=>`/podcasts/day-${dayId.replace("D","")}.txt`;

export function getEpisodeText(source:string,lessonId:string){
 const marker=new RegExp(`\\nEPISODE ${lessonId} —[^\\n]*\\n`);
 const match=source.match(marker);
 if(!match||match.index===undefined) return "";
 const start=match.index+match[0].length;
 const rest=source.slice(start);
 const next=rest.search(/\\nEPISODE D\\d+\\.\\d+ —/);
 return (next>=0?rest.slice(0,next):rest).trim();
}

export function parseTurns(text:string):Turn[]{
 return text
   .split(/\\n\\s*(?=Speaker [AB]:)/)
   .map(x=>x.trim())
   .filter(Boolean)
   .map(x=>{
     const m=x.match(/^Speaker ([AB]):\\s*([\\s\\S]*)$/);
     return m?{speaker:m[1] as "A"|"B",text:m[2].trim()}:{speaker:"A",text:x};
   });
}
