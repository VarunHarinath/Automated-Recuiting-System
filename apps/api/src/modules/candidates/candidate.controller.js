import { sendSuccess } from '../../lib/responses.js'; import { createCandidate,getCandidate,listCandidates,updateCandidate } from './candidate.service.js'; import { candidateCreateSchema,candidateIdSchema,candidateListSchema,candidateUpdateSchema,parseInput } from './candidate.validation.js';
const actor=req=>({...req.auth,ipAddress:req.ip,userAgent:req.get('user-agent')});
export async function createCandidateController(req,res){const result=await createCandidate(parseInput(candidateCreateSchema,req.body),actor(req));return sendSuccess(res,result.candidate,201,result.warning?{warnings:[result.warning]}:{});}
export async function listCandidatesController(req,res){const r=await listCandidates(parseInput(candidateListSchema,req.query));return sendSuccess(res,r.candidates,200,r.meta);}
export async function getCandidateController(req,res){return sendSuccess(res,await getCandidate(parseInput(candidateIdSchema,req.params).id));}
export async function updateCandidateController(req,res){const{id}=parseInput(candidateIdSchema,req.params);return sendSuccess(res,await updateCandidate(id,parseInput(candidateUpdateSchema,req.body),actor(req)));}
