import type{CompletionRule,EvidenceRecord,LearnerState,LearningItem}from"./contracts";
export type CompletionDecision={accepted:true;evidenceIds:string[]}|{accepted:false;reason:"EVIDENCE_REQUIRED"|"ASSESSMENT_REQUIRED"};
function evidenceDecision(rule:Extract<CompletionRule,{kind:"evidence"}>,item:LearningItem,state:LearnerState):CompletionDecision{
 const candidates=state.evidence.filter(e=>e.learnerId.length>0&&e.itemId===item.id);const used=new Set<string>();const ids:string[]=[];
 for(const req of rule.requirements){const need=req.count??1;const matches=candidates.filter(e=>e.kind===req.kind&&!used.has(e.id));if(matches.length<need)return{accepted:false,reason:"EVIDENCE_REQUIRED"};for(const m of matches.slice(0,need)){used.add(m.id);ids.push(m.id)}}
 return{accepted:true,evidenceIds:ids};
}
export function evaluateCompletion(item:LearningItem,state:LearnerState):CompletionDecision{
 if(state.completedItemIds.includes(item.id))return{accepted:false,reason:"ASSESSMENT_REQUIRED"};
 if(item.completion.kind==="assessment"){const assessmentId=item.completion.assessmentId;const passed=state.assessmentPasses.some(p=>p.learnerId.length>0&&p.assessmentId===assessmentId);return passed?{accepted:true,evidenceIds:[]}:{accepted:false,reason:"ASSESSMENT_REQUIRED"}}
 return evidenceDecision(item.completion,item,state);
}
export function deriveProgress(programme:{items:LearningItem[]},state:LearnerState){const total=programme.items.length;const completed=programme.items.filter(i=>state.completedItemIds.includes(i.id)).length;return{completed,total,percentage:total===0?0:Math.round(completed/total*100)}}
export function recordCompletion(itemId:string,state:LearnerState,decision:CompletionDecision):LearnerState{if(!decision.accepted||state.completedItemIds.includes(itemId))return state;return{...state,completedItemIds:[...state.completedItemIds,itemId]}}
export function appendEvidence(state:LearnerState,evidence:EvidenceRecord):LearnerState{if(state.evidence.some(e=>e.id===evidence.id||(e.learnerId===evidence.learnerId&&e.itemId===evidence.itemId&&e.reference===evidence.reference)))return state;return{...state,evidence:[...state.evidence,evidence]}}