import{useMemo,useState}from"react";import{days,lessons}from"./data/curriculum";import{LessonPanel}from"./components/LessonPanel";import{Progress}from"./components/Progress";
const K="devops-programme-mastered";
export default function App(){
 const[s,setS]=useState(lessons[0].id);
 const[m,setM]=useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem(K)||"[]")}catch{return[]}});
 const l=useMemo(()=>lessons.find(x=>x.id===s)??lessons[0],[s]);
 function toggle(id:string){const n=m.includes(id)?m.filter(x=>x!==id):[...m,id];setM(n);localStorage.setItem(K,JSON.stringify(n))}
 return <div className="app-shell"><header className="hero"><div><span className="eyebrow">DEVOPS PROGRAMME</span><h1>From scattered knowledge to operational mastery.</h1><p>Five intensive days. Mac-first labs. Networking from first principles.</p></div><Progress total={lessons.length} completed={m.length}/></header>
 <main className="layout"><aside className="sidebar"><h3>Curriculum</h3>{days.map(d=><div className="day" key={d.id}><div className="day-title">{d.title}</div><div className="range">{d.range}</div>{lessons.filter(x=>x.id.startsWith(d.id)).map(x=><button key={x.id} className={l.id===x.id?"lesson-link selected":"lesson-link"} onClick={()=>setS(x.id)}><span>{x.id}</span><span>{x.title}</span>{m.includes(x.id)?<b>✓</b>:null}</button>)}</div>)}</aside>
 <LessonPanel lesson={l} mastered={m.includes(l.id)} onMaster={()=>toggle(l.id)}/></main></div>
}