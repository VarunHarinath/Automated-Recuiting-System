import { prisma } from '../../database/runtime-client.js';
import { ApiError } from '../../lib/api-error.js';
import { processStoredResume } from '../../clients/resume-processing.client.js';

const safeSelect = { id:true,candidateId:true,originalFileName:true,mimeType:true,processingStatus:true,processingError:true,uploadedAt:true,processedAt:true,isPrimary:true,createdAt:true,updatedAt:true };
const audit=(actor,action,id,metadata)=>({actorUserId:actor.id,action,entityType:'RESUME',entityId:id,metadata,ipAddress:actor.ipAddress,userAgent:actor.userAgent});
async function load(id){const resume=await prisma.resume.findUnique({where:{id}});if(!resume)throw new ApiError(404,'RESUME_NOT_FOUND','The requested resume was not found.');return resume;}

export async function processResume(id,actor,isReprocess=false){
  const resume=await load(id);
  if(resume.processingStatus==='PROCESSING')throw new ApiError(409,'RESUME_ALREADY_PROCESSING','The resume is already being processed.');
  await prisma.$transaction([prisma.resume.update({where:{id},data:{processingStatus:'PROCESSING',processingError:null}}),prisma.auditLog.create({data:audit(actor,isReprocess?'RESUME_REPROCESSING_STARTED':'RESUME_PROCESSING_STARTED',id,{candidateId:resume.candidateId})})]);
  try{
    const skills=(await prisma.skill.findMany({select:{name:true},orderBy:{name:'asc'}})).map(row=>row.name);
    const result=await processStoredResume(resume,skills);
    return await prisma.$transaction(async tx=>{const updated=await tx.resume.update({where:{id},data:{processingStatus:'COMPLETED',extractedText:result.extracted_text,parsedData:result.parsed_data,processingError:null,processedAt:new Date()},select:safeSelect});await tx.auditLog.create({data:audit(actor,isReprocess?'RESUME_REPROCESSED':'RESUME_PROCESSED',id,{candidateId:resume.candidateId,warningCount:result.warnings?.length??0})});return updated;});
  }catch(error){const code=error instanceof ApiError?error.code:'RESUME_PROCESSING_FAILED';await prisma.$transaction([prisma.resume.update({where:{id},data:{processingStatus:'FAILED',processingError:code,processedAt:new Date()}}),prisma.auditLog.create({data:audit(actor,'RESUME_PROCESSING_FAILED',id,{candidateId:resume.candidateId,errorCode:code})})]);throw error;}
}
export async function getResumeStatus(id){await load(id);return prisma.resume.findUniqueOrThrow({where:{id},select:safeSelect});}
