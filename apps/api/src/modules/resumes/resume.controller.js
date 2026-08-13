import { sendSuccess } from '../../lib/responses.js';
import { getResumeStatus, processResume } from './resume.service.js';
import { parseInput, resumeIdSchema } from './resume.validation.js';
const actor=req=>({...req.auth,ipAddress:req.ip,userAgent:req.get('user-agent')});
export async function processResumeController(req,res){const{id}=parseInput(resumeIdSchema,req.params);return sendSuccess(res,await processResume(id,actor(req)),202);}
export async function reprocessResumeController(req,res){const{id}=parseInput(resumeIdSchema,req.params);return sendSuccess(res,await processResume(id,actor(req),true),202);}
export async function getResumeStatusController(req,res){const{id}=parseInput(resumeIdSchema,req.params);return sendSuccess(res,await getResumeStatus(id));}
