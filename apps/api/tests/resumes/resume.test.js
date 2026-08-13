import { randomUUID } from 'node:crypto';
import { mkdir,writeFile } from 'node:fs/promises';
import argon2 from 'argon2';import request from'supertest';import{afterAll,beforeAll,describe,expect,it,vi}from'vitest';import{app}from'../../src/app.js';import{prisma}from'../../src/database/runtime-client.js';import{signAccessToken}from'../../src/modules/auth/auth.jwt.js';
let token,resume;const run=randomUUID();
beforeAll(async()=>{const user=await prisma.user.create({data:{firstName:'Resume',lastName:'Tester',email:`resume-${run}@test.local`,passwordHash:await argon2.hash('Test!12345'),role:'RECRUITER'}});token=signAccessToken(user);const candidate=await prisma.candidate.create({data:{firstName:'Jane',lastName:'Doe',email:`jane-${run}@test.local`,normalizedEmail:`jane-${run}@test.local`}});await mkdir('storage/tests',{recursive:true});await writeFile(`storage/tests/${run}.pdf`,'fake');resume=await prisma.resume.create({data:{candidateId:candidate.id,originalFileName:'resume.pdf',storedFileName:`${run}.pdf`,storageKey:`tests/${run}.pdf`,mimeType:'application/pdf',fileSize:4,checksum:run,uploadedById:user.id}});global.fetch=vi.fn(async()=>({ok:true,json:async()=>({extracted_text:'Jane Doe',parsed_data:{name:'Jane Doe',email:candidate.email,phone:null,skills:[],education:[],experience:[],total_experience_years:2,summary:null},warnings:[]})}));});
afterAll(()=>prisma.$disconnect());const auth=()=>({Authorization:`Bearer ${token}`});
describe.sequential('Resume processing API',()=>{
it('PARSE-NODE-01 requires authentication',async()=>expect((await request(app).get(`/api/v1/resumes/${resume.id}/processing-status`)).status).toBe(401));
it('PARSE-NODE-02 returns uploaded status',async()=>expect((await request(app).get(`/api/v1/resumes/${resume.id}/processing-status`).set(auth())).body.data.processingStatus).toBe('UPLOADED'));
it('PARSE-NODE-03 processes a stored resume',async()=>expect((await request(app).post(`/api/v1/resumes/${resume.id}/process`).set(auth())).body.data.processingStatus).toBe('COMPLETED'));
it('PARSE-NODE-04 persists extracted data',async()=>expect((await prisma.resume.findUnique({where:{id:resume.id}})).extractedText).toBe('Jane Doe'));
it('PARSE-NODE-05 reprocesses without overwriting candidate',async()=>{await request(app).post(`/api/v1/resumes/${resume.id}/reprocess`).set(auth());expect((await prisma.candidate.findUnique({where:{id:resume.candidateId}})).firstName).toBe('Jane');});
it('PARSE-NODE-06 audits processing',async()=>expect(await prisma.auditLog.count({where:{entityId:resume.id}})).toBeGreaterThan(0));
it('PARSE-NODE-07 missing resume is 404',async()=>expect((await request(app).post(`/api/v1/resumes/${randomUUID()}/process`).set(auth())).status).toBe(404));
});
