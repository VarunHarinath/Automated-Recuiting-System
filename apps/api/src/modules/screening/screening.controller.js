import { sendSuccess } from '../../lib/responses.js';
import { getJobRankings,getScreening,listApplicationScreenings,overrideScreening,runScreening } from './screening.service.js';
import { idSchema,overrideSchema,parseInput,rankingSchema } from './screening.validation.js';
const actor=req=>({...req.auth,ipAddress:req.ip,userAgent:req.get('user-agent')});
export async function screenController(req,res){const{id}=parseInput(idSchema,req.params);return sendSuccess(res,await runScreening(id,actor(req)),201);}
export async function rescreenController(req,res){const{id}=parseInput(idSchema,req.params);return sendSuccess(res,await runScreening(id,actor(req),true),201);}
export async function listScreeningsController(req,res){const{id}=parseInput(idSchema,req.params);return sendSuccess(res,await listApplicationScreenings(id));}
export async function getScreeningController(req,res){const{id}=parseInput(idSchema,req.params);return sendSuccess(res,await getScreening(id));}
export async function overrideScreeningController(req,res){const{id}=parseInput(idSchema,req.params);return sendSuccess(res,await overrideScreening(id,parseInput(overrideSchema,req.body),actor(req)));}
export async function rankingsController(req,res){const{id}=parseInput(rankingSchema,req.params);return sendSuccess(res,await getJobRankings(id));}
