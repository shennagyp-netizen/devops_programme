import{describe,expect,it}from"vitest";import{appendEvidence,deriveProgress,evaluateCompletion,recordCompletion}from"../src/core/authority.ts";
const item={id:"item-1",programmeId:"p",courseId:"c",sectionId:"s",kind:"practice",title:"Practice",description:"Practice",modes:["do"],completion:{kind:"evidence",requirements:[{kind:"proof"}]}};
const base={completedItemIds:[],evidence:[],assessmentPasses:[]};
describe("framework authority",()=>{
 it("blocks completion without evidence",()=>expect(evaluateCompletion(item,base)).toEqual({accepted:false,reason:"EVIDENCE_REQUIRED"}));
 it("rejects evidence for another item",()=>expect(evaluateCompletion(item,{...base,evidence:[{id:"wrong",learnerId:"learner",itemId:"other",kind:"proof",providerId:"p",reference:"x",verifiedAt:"2026-09-26T12:00:00.000Z"}]}).accepted).toBe(false));
 it("deduplicates evidence",()=>{const e={id:"e",learnerId:"learner",itemId:"item-1",kind:"proof",providerId:"p",reference:"r",verifiedAt:"2026-09-26T12:00:00.000Z"};expect(appendEvidence(appendEvidence(base,e),e).evidence).toHaveLength(1)});
 it("records completion only after acceptance",()=>{const s=appendEvidence(base,{id:"e",learnerId:"learner",itemId:"item-1",kind:"proof",providerId:"p",reference:"r",verifiedAt:"2026-09-26T12:00:00.000Z"});expect(recordCompletion(item.id,s,evaluateCompletion(item,s)).completedItemIds).toEqual(["item-1"])});
 it("derives progress",()=>expect(deriveProgress({items:[item]},{completedItemIds:["item-1"],evidence:[],assessmentPasses:[]}).percentage).toBe(100));
});