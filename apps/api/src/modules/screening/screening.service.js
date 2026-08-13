import { prisma } from '../../database/runtime-client.js';
import { ApiError } from '../../lib/api-error.js';

const audit=(actor,action,id,metadata)=>({actorUserId:actor.id,action,entityType:'SCREENING_RESULT',entityId:id,metadata,ipAddress:actor.ipAddress,userAgent:actor.userAgent});
const detailInclude={configuration:true,criterionResults:{orderBy:{criterionType:'asc'}},overriddenBy:{select:{id:true,firstName:true,lastName:true,email:true}},application:{select:{id:true,applicationCode:true,currentStatus:true,candidate:{select:{id:true,firstName:true,lastName:true}},job:{select:{id:true,jobCode:true,title:true}}}},resume:{select:{id:true,originalFileName:true,processedAt:true}}};
const score=(ratio)=>Math.round(Math.max(0,Math.min(1,ratio))*10000)/100;
const recommendationFor=value=>value>=80?'HIGH_MATCH':value>=60?'MODERATE_MATCH':'LOW_MATCH';

async function context(applicationId){
  const application=await prisma.application.findUnique({where:{id:applicationId},include:{candidate:{include:{skills:{include:{skill:true}},education:true,resumes:{where:{processingStatus:'COMPLETED'},orderBy:[{isPrimary:'desc'},{processedAt:'desc'}]}}},job:{include:{skills:{include:{skill:true}}}}}});
  if(!application)throw new ApiError(404,'APPLICATION_NOT_FOUND','The requested application was not found.');
  const resume=application.candidate.resumes[0];if(!resume)throw new ApiError(409,'PROCESSED_RESUME_REQUIRED','A successfully processed resume is required before screening.');
  const configuration=await prisma.screeningConfiguration.findFirst({where:{isDefault:true},orderBy:{createdAt:'desc'}});
  if(!configuration)throw new ApiError(409,'SCREENING_CONFIGURATION_REQUIRED','A default screening configuration is required.');
  return{application,resume,configuration};
}

function calculate({application,resume,configuration}){
  const candidateNames=new Set(application.candidate.skills.map(x=>x.skill.normalizedName));
  const parsed=resume.parsedData&&typeof resume.parsedData==='object'?resume.parsedData:{};
  for(const name of Array.isArray(parsed.skills)?parsed.skills:[])candidateNames.add(String(name).trim().toLowerCase());
  const required=application.job.skills.filter(x=>x.requirementType==='REQUIRED');
  const preferred=application.job.skills.filter(x=>x.requirementType==='PREFERRED');
  const matched=required.filter(x=>candidateNames.has(x.skill.normalizedName));
  const missing=required.filter(x=>!candidateNames.has(x.skill.normalizedName));
  const matchedPreferred=preferred.filter(x=>candidateNames.has(x.skill.normalizedName));
  const skillsScore=required.length?score(matched.length/required.length):100;
  const preferredScore=preferred.length?score(matchedPreferred.length/preferred.length):100;
  const candidateYears=Number(application.candidate.totalExperienceYears??parsed.total_experience_years??0);
  const minimumYears=Number(application.job.minimumExperienceYears);
  const experienceScore=minimumYears>0?score(candidateYears/minimumYears):100;
  const weights={skills:Number(configuration.skillsWeight),experience:Number(configuration.experienceWeight),education:Number(configuration.educationWeight),preferred:Number(configuration.preferredCriteriaWeight)};
  const applicable=[...(required.length?[['skills',skillsScore]]:[]),...(minimumYears>0?[['experience',experienceScore]]:[]),...(preferred.length?[['preferred',preferredScore]]:[])];
  const denominator=applicable.reduce((sum,[key])=>sum+weights[key],0);
  const total=denominator?Math.round(applicable.reduce((sum,[key,value])=>sum+weights[key]*value,0)/denominator*100)/100:0;
  const criteria=[
    {criterionType:'REQUIRED_SKILLS',criterionName:'Required skills',expectedValue:required.map(x=>x.skill.name),actualValue:[...candidateNames],matched:missing.length===0,score:required.length?weights.skills*skillsScore/100:0,maximumScore:required.length?weights.skills:0,details:{applicable:required.length>0,matched:matched.map(x=>x.skill.name),missing:missing.map(x=>x.skill.name)}},
    {criterionType:'EXPERIENCE',criterionName:'Minimum experience',expectedValue:{minimumYears},actualValue:{totalExperienceYears:candidateYears},matched:minimumYears===0||candidateYears>=minimumYears,score:minimumYears>0?weights.experience*experienceScore/100:0,maximumScore:minimumYears>0?weights.experience:0,details:{applicable:minimumYears>0}},
    {criterionType:'EDUCATION',criterionName:'Education requirement',expectedValue:null,actualValue:application.candidate.education.map(x=>({degree:x.degree,fieldOfStudy:x.fieldOfStudy})),matched:true,score:0,maximumScore:0,details:{applicable:false,reason:'The Job model has no education requirement.'}},
    {criterionType:'PREFERRED_SKILLS',criterionName:'Preferred skills',expectedValue:preferred.map(x=>x.skill.name),actualValue:matchedPreferred.map(x=>x.skill.name),matched:preferred.length===0||matchedPreferred.length===preferred.length,score:preferred.length?weights.preferred*preferredScore/100:0,maximumScore:preferred.length?weights.preferred:0,details:{applicable:preferred.length>0}},
  ];
  return{totalScore:total,skillsScore,experienceScore,educationScore:0,preferredCriteriaScore:preferredScore,matchedSkills:matched.map(x=>x.skill.name),missingRequiredSkills:missing.map(x=>x.skill.name),summary:`Matched ${matched.length} of ${required.length} required skills; experience ${candidateYears} years against ${minimumYears} required; education not scored because the job has no education requirement.`,recommendation:recommendationFor(total),criteria};
}

export async function runScreening(applicationId,actor,isRescreen=false){const ctx=await context(applicationId);const result=calculate(ctx);return prisma.$transaction(async tx=>{const row=await tx.screeningResult.create({data:{applicationId,resumeId:ctx.resume.id,configurationId:ctx.configuration.id,totalScore:result.totalScore,skillsScore:result.skillsScore,experienceScore:result.experienceScore,educationScore:result.educationScore,preferredCriteriaScore:result.preferredCriteriaScore,matchedSkills:result.matchedSkills,missingRequiredSkills:result.missingRequiredSkills,summary:result.summary,recommendation:result.recommendation,criterionResults:{create:result.criteria}}});await tx.auditLog.create({data:audit(actor,isRescreen?'SCREENING_RERUN':'SCREENING_RUN',row.id,{applicationId,totalScore:result.totalScore,configurationId:ctx.configuration.id})});return tx.screeningResult.findUniqueOrThrow({where:{id:row.id},include:detailInclude});});}
export async function listApplicationScreenings(applicationId){const exists=await prisma.application.findUnique({where:{id:applicationId},select:{id:true}});if(!exists)throw new ApiError(404,'APPLICATION_NOT_FOUND','The requested application was not found.');return prisma.screeningResult.findMany({where:{applicationId},include:detailInclude,orderBy:[{screenedAt:'desc'},{id:'desc'}]});}
export async function getScreening(id){const row=await prisma.screeningResult.findUnique({where:{id},include:detailInclude});if(!row)throw new ApiError(404,'SCREENING_NOT_FOUND','The requested screening result was not found.');return row;}
export async function overrideScreening(id,input,actor){await getScreening(id);return prisma.$transaction(async tx=>{const row=await tx.screeningResult.update({where:{id},data:{recommendation:input.recommendation,isOverridden:true,overrideReason:input.reason,overriddenById:actor.id}});await tx.auditLog.create({data:audit(actor,'SCREENING_OVERRIDE',id,{recommendation:input.recommendation,reasonProvided:true})});return tx.screeningResult.findUniqueOrThrow({where:{id:row.id},include:detailInclude});});}
export async function getJobRankings(jobId){const job=await prisma.job.findUnique({where:{id:jobId},select:{id:true}});if(!job)throw new ApiError(404,'JOB_NOT_FOUND','The requested job was not found.');const rows=await prisma.screeningResult.findMany({where:{application:{jobId}},include:detailInclude,orderBy:[{screenedAt:'desc'},{id:'desc'}]});const latest=new Map();for(const row of rows)if(!latest.has(row.applicationId))latest.set(row.applicationId,row);return [...latest.values()].sort((a,b)=>Number(b.totalScore)-Number(a.totalScore)||a.application.applicationCode.localeCompare(b.application.applicationCode));}
