import {canEdit,equalSecret,newSession,secret,sessionCookie,sameOrigin,corsHeaders,preflight} from '../../editor-auth';
export const dynamic='force-dynamic';
const response=(req:Request,data:unknown,status=200,cookie?:string)=>Response.json(data,{status,headers:{...corsHeaders(req),...(cookie?{'Set-Cookie':cookie}:{})}});
const attempts=new Map<string,{count:number,until:number}>();
export async function GET(req:Request){return response(req,{canEdit:await canEdit(req)})}
export async function POST(req:Request){if(!sameOrigin(req))return response(req,{error:'來源不符'},403);if(!secret())return response(req,{error:'編輯密碼尚未設定'},503);const ip=req.headers.get('cf-connecting-ip')||'unknown';const now=Date.now();for(const [key,value] of attempts)if(value.until<=now)attempts.delete(key);const current=attempts.get(ip)||{count:0,until:now+60000};if(current.count>=5)return response(req,{error:'嘗試次數過多，請一分鐘後再試'},429);current.count++;attempts.set(ip,current);try{const raw=await req.text();if(raw.length>1024)return response(req,{error:'密碼錯誤'},401);const body=JSON.parse(raw);if(typeof body.password!=='string'||!await equalSecret(body.password,secret()))return response(req,{error:'密碼錯誤'},401);attempts.delete(ip);const token=await newSession();return response(req,{canEdit:true,...(req.headers.get('origin')==='https://zhizhi67742.github.io'?{token}:{})},200,`${sessionCookie}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`)}catch{return response(req,{error:'資料格式錯誤'},400)}}
export async function DELETE(req:Request){if(!sameOrigin(req))return response(req,{error:'來源不符'},403);return response(req,{canEdit:false},200,`${sessionCookie}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`)}

export const OPTIONS=preflight;
