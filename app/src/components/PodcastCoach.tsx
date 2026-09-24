import{useMemo,useState}from"react";
import type{Lesson}from"../data/curriculum";
import{getEpisodeText,parseTurns}from"../data/podcastsRaw";

type Phase="brief"|"listen"|"coach"|"lab"|"recall"|"done";
const dayFor=(id:string)=>id.split(".")[0];

export function PodcastCoach({lesson}:{lesson:Lesson}){
 const[phase,setPhase]=useState<Phase>("brief");
 const[turnIndex,setTurnIndex]=useState(0);
 const[prediction,setPrediction]=useState("");
 const[coachAnswer,setCoachAnswer]=useState("");
 const[showHint,setShowHint]=useState(false);
 const[recallAnswers,setRecallAnswers]=useState<string[]>(()=>lesson.recall.map(()=> ""));
 const[recallDone,setRecallDone]=useState<boolean[]>(()=>lesson.recall.map(()=>false));
 const[seconds,setSeconds]=useState(20);
 const episode=useMemo(()=>getEpisodeText(dayFor(lesson.id),lesson.id),[lesson.id]);
 const turns=useMemo(()=>parseTurns(episode),[episode]);
 const current=turns[turnIndex];
 const allRecall=recallDone.every(Boolean);

 const nextTurn=()=>{
   if(turnIndex>=turns.length-1){setPhase("lab");return;}
   const next=turnIndex+1;
   setTurnIndex(next);
   if(next>0&&next%6===0)setPhase("coach");
 };
 const reset=()=>{
   setPhase("brief");setTurnIndex(0);setPrediction("");setCoachAnswer("");setShowHint(false);
   setRecallAnswers(lesson.recall.map(()=> ""));setRecallDone(lesson.recall.map(()=>false));setSeconds(20);
 };

 return <div className="podcast-coach">
  <div className="coach-banner">
   <div><span className="eyebrow">CO-TEACHER MODE</span><h3>The podcast teaches. I make you think.</h3></div>
   <div className="coach-phase">{phase}</div>
  </div>

  {phase==="brief"&&<div className="coach-grid">
    <div className="content-card">
      <h4>Before you press play</h4>
      <p>Do not try to memorize this episode. Listen for the causal chain: what talks to what, what state changes, and what evidence would expose a failure.</p>
      <p><strong>Prediction:</strong> In one sentence, what do you expect to be the first thing that breaks when this concept is misconfigured?</p>
      <textarea value={prediction} onChange={e=>setPrediction(e.target.value)} placeholder="Write your prediction in your own words." />
      <button className="primary" onClick={()=>setPhase("listen")} disabled={!prediction.trim()}>Start guided listening</button>
    </div>
    <div className="content-card coach-rule">
      <h4>How to use the audio</h4>
      <p>Play the episode in your normal audio player. Keep this panel open. When the speaker asks you to predict, pause the audio here and answer before continuing.</p>
      <p>Do not read the transcript instead of listening on the first pass. The transcript is the recovery path when a sentence was hard to catch.</p>
    </div>
  </div>}

  {phase==="listen"&&<div className="content-card">
    <div className="coach-row"><strong>Guided transcript</strong><span>{Math.min(turnIndex+1,turns.length)}/{turns.length} turns</span></div>
    {current?<div className="turn-card"><strong>Speaker {current.speaker}</strong><p>{current.text}</p></div>:<p>Transcript unavailable for this episode. Continue with the exercise cards.</p>}
    <div className="coach-actions">
      <button onClick={()=>setPhase("coach")}>Pause for a prediction</button>
      <button className="primary" onClick={nextTurn}>{turnIndex>=turns.length-1?"Finish listening":"Next spoken section"}</button>
    </div>
  </div>}

  {phase==="coach"&&<div className="coach-grid">
    <div className="content-card">
      <span className="eyebrow">STOP HERE</span>
      <h4>Say it before you see it</h4>
      <p>{lesson.recall[1]??lesson.recall[0]}</p>
      <textarea value={coachAnswer} onChange={e=>setCoachAnswer(e.target.value)} placeholder="Explain it like you are talking to another engineer." />
      <div className="timer-row">
        <button onClick={()=>setSeconds(s=>Math.max(0,s-5))}>−5s</button>
        <strong>{seconds}s</strong>
        <button onClick={()=>setSeconds(s=>s+5)}>+5s</button>
      </div>
      <button className="secondary" onClick={()=>setShowHint(v=>!v)}>{showHint?"Hide hint":"Show a hint"}</button>
      {showHint&&<p className="hint">Start from the layer below the current concept. Name the request, the state change, and the evidence you expect to observe.</p>}
      <button className="primary" onClick={()=>setPhase("listen")}>Resume podcast</button>
    </div>
    <div className="content-card">
      <h4>Co-teacher note</h4>
      <p>A good answer is specific enough that another engineer could test it. “The network is broken” is a symptom-shaped guess, not a useful hypothesis.</p>
    </div>
  </div>}

  {phase==="lab"&&<div className="content-card">
    <span className="eyebrow">OPERATE → BREAK → DIAGNOSE</span>
    <h4>Now leave the podcast and touch the system</h4>
    <p>{lesson.lab.objective}</p>
    <pre><code>{lesson.lab.command}</code></pre>
    <p><strong>Challenge:</strong> {lesson.lab.challenge}</p>
    <div className="coach-actions"><button className="primary" onClick={()=>setPhase("recall")}>I ran the lab — test me</button></div>
  </div>}

  {phase==="recall"&&<div className="content-card">
    <span className="eyebrow">RETRIEVAL</span><h4>No notes now.</h4>
    {lesson.recall.map((q,i)=><label className="recall-row" key={q}>
      <span>{i+1}. {q}</span>
      <textarea value={recallAnswers[i]} onChange={e=>setRecallAnswers(a=>a.map((v,j)=>j===i?e.target.value:v))} placeholder="Answer in your own words." />
      <button onClick={()=>setRecallDone(r=>r.map((v,j)=>j===i?!v:v))}>{recallDone[i]?"Done ✓":"Mark answer checked"}</button>
    </label>)}
    <button className="primary" disabled={!allRecall} onClick={()=>setPhase("done")}>Finish episode</button>
  </div>}

  {phase==="done"&&<div className="content-card success-card">
    <span className="eyebrow">EPISODE COMPLETE</span><h4>You listened, predicted, operated and recalled.</h4>
    <p>Your next move is not another video. Repeat the failure challenge until you can explain the evidence before running the command.</p>
    <button className="primary" onClick={reset}>Replay as a second pass</button>
  </div>}
 </div>
}
