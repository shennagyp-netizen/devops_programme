import{appendEvidence,deriveProgress,evaluateCompletion,recordCompletion}from"../core/authority";
import type{ExperienceSession,ExperienceView,LearningIntent,LearningProgramme,LearnerState}from"../core/contracts";
import{deriveControls}from"./controlPolicy";
export type LearningRuntime={getState():{session:ExperienceSession;learner:LearnerState};getView():ExperienceView;dispatch(intent:LearningIntent):void};
export function createLearningRuntime(programme:LearningProgramme,initialLearner:LearnerState,initialSession:ExperienceSession):LearningRuntime{let learner=initialLearner;let session=initialSession;
const item=()=>{const x=programme.items.find(i=>i.id===session.itemId);if(!x)throw new Error("Unknown learning item");return x};
const getView=()=>({session,currentItem:item(),controls:deriveControls(item(),session,learner),progress:deriveProgress(programme,learner)});
const dispatch=(intent:LearningIntent)=>{switch(intent.type){
case"SELECT_COURSE":{const c=programme.courses.find(x=>x.id===intent.courseId);if(!c)return;const s=programme.sections.find(x=>x.id===c.sectionIds[0]);session={...session,courseId:c.id,sectionId:s?.id??session.sectionId,itemId:s?.itemIds[0]??session.itemId};return}
case"SELECT_SECTION":{const s=programme.sections.find(x=>x.id===intent.sectionId);if(!s)return;session={...session,sectionId:s.id,courseId:s.courseId,itemId:s.itemIds[0]??session.itemId};return}
case"SELECT_ITEM":if(programme.items.some(x=>x.id===intent.itemId))session={...session,itemId:intent.itemId};return;
case"SELECT_MODE":session={...session,mode:intent.mode};return;
case"REQUEST_EVIDENCE":{const x=item();if(x.completion.kind!=="evidence")return;const r=x.completion.requirements[0];if(!r)return;learner=appendEvidence(learner,{id:"demo-evidence-"+x.id,learnerId:"demo-learner",itemId:x.id,kind:r.kind,providerId:intent.providerId??"demo-provider",reference:"demo:"+x.id,verifiedAt:new Date().toISOString()});return}
case"SUBMIT_ASSESSMENT":{const x=item();if(x.completion.kind==="assessment"&&x.completion.assessmentId===intent.assessmentId&&!learner.assessmentPasses.some(p=>p.assessmentId===intent.assessmentId))learner={...learner,assessmentPasses:[...learner.assessmentPasses,{assessmentId:intent.assessmentId,learnerId:"demo-learner",attemptId:"demo-attempt-"+x.id,passedAt:new Date().toISOString()}]};return}
case"COMPLETE_ITEM":{const x=item();learner=recordCompletion(x.id,learner,evaluateCompletion(x,learner));return}
case"OPEN_REMEDIATION":session={...session,remediationOpen:true};return;}};return{getState:()=>({session,learner}),getView,dispatch}}