import type{AssessmentPass,EvidenceRecord,LearningItem}from"./contracts";
export type EvidenceRequest={learnerId:string;item:LearningItem};
export interface EvidenceProvider{id:string;supports(item:LearningItem):boolean;verify(request:EvidenceRequest):Promise<EvidenceRecord>}
export type AssessmentSubmission={assessmentId:string;learnerId:string;answers:Record<string,unknown>};
export interface AssessmentProvider{id:string;issue(assessmentId:string,learnerId:string):Promise<{attemptId:string;questions:unknown[]}>;submit(submission:AssessmentSubmission):Promise<AssessmentPass|null>}
export interface ContentProvider{getItem(itemId:string):Promise<{title:string;body:string;media?:unknown}>}
export interface TutorProvider{id:string;ask(input:{learnerId:string;itemId:string;message:string}):Promise<{message:string;references?:string[]}>}