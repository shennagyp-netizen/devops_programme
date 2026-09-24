import{useState}from"react";
import type{Lesson}from"../data/curriculum";
import{MotionIllustration}from"./MotionIllustration";
import{PodcastCoach}from"./PodcastCoach";

type Mode="learn"|"listen"|"do"|"recall"|"design";
export function LessonPanel({lesson,mastered,onMaster}:{lesson:Lesson;mastered:boolean;onMaster:()=>void}){
 const[m,setM]=useState<Mode>("learn");
 return <section className="lesson"><div className="lesson-head"><div><span className="eyebrow">{lesson.id} · {lesson.domain}</span><h2>{lesson.title}</h2><p>{lesson.objective}</p></div><button className={mastered?"mastered":"primary"} onClick={onMaster}>{mastered?"Mastered":"Mark mastered"}</button></div>
 <MotionIllustration lesson={lesson}/>
 <nav className="mode-tabs">{(["learn","listen","do","recall","design"]as Mode[]).map(x=><button key={x} className={m===x?"active":""} onClick={()=>setM(x)}>{x==="listen"?"co-teacher":x}</button>)}</nav>
 {m==="learn"&&<div className="content-card"><h3>Mental model</h3><p>{lesson.objective}</p><p>Connect it to the layer below, the layer above and the failure mode that appears when it is wrong.</p></div>}
 {m==="listen"&&<PodcastCoach lesson={lesson}/>}
 {m==="do"&&<div className="content-card"><h3>Mac lab</h3><p>{lesson.lab.objective}</p><pre><code>{lesson.lab.command}</code></pre><h4>Break/fix</h4><p>{lesson.lab.challenge}</p></div>}
 {m==="recall"&&<div className="content-card"><h3>Retrieval</h3><ol>{lesson.recall.map(q=><li key={q}>{q}</li>)}</ol></div>}
 {m==="design"&&<div className="content-card"><h3>Production design</h3><p>Place this concept in a system serving millions of users. Identify dependency, failure domain, first signal, mitigation and recovery.</p></div>}
 </section>
}
