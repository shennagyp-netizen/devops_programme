import day1 from "../../../podcasts/day-1.txt?raw";
import day2 from "../../../podcasts/day-2.txt?raw";
import day3 from "../../../podcasts/day-3.txt?raw";
import day4 from "../../../podcasts/day-4.txt?raw";
import day5 from "../../../podcasts/day-5.txt?raw";

export const podcastText:Record<string,string>={
  D1:day1,D2:day2,D3:day3,D4:day4,D5:day5
};

export function getEpisodeText(dayId:string,lessonId:string){
  const source=podcastText[dayId]??"";
  const marker=new RegExp(`\\nEPISODE ${lessonId} —[^\\n]*\\n`);
  const match=source.match(marker);
  if(!match||match.index===undefined) return "";
  const start=match.index+match[0].length;
  const rest=source.slice(start);
  const next=rest.search(/\\nEPISODE D\\d+\\.\\d+ —/);
  return (next>=0?rest.slice(0,next):rest).trim();
}

export type Turn={speaker:"A"|"B";text:string};

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
