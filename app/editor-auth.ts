import { env } from 'cloudflare:workers';
const encoder=new TextEncoder();
export const sessionCookie='pickup_editor';
export const secret=()=> (env as unknown as {PICKUP_EDIT_PASSWORD?:string}).PICKUP_EDIT_PASSWORD||'';
const hex=(data:ArrayBuffer)=>Array.from(new Uint8Array(data),b=>b.toString(16).padStart(2,'0')).join('');
export async function equalSecret(a:string,b:string){const hashes=await Promise.all([a,b].map(v=>crypto.subtle.digest('SHA-256',encoder.encode(v))));const x=new Uint8Array(hashes[0]),y=new Uint8Array(hashes[1]);let diff=0;for(let i=0;i<x.length;i++)diff|=x[i]^y[i];return diff===0}
async function signature(value:string){const key=await crypto.subtle.importKey('raw',encoder.encode(secret()),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,encoder.encode(value)))}
export async function newSession(){const value=String(Date.now()+12*60*60*1000)+'.'+crypto.randomUUID();return value+'.'+await signature(value)}
export async function canEdit(req:Request){if(!secret())return false;const token=req.headers.get('authorization')?.match(/^Bearer ([^ ]+)$/)?.[1]||req.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(sessionCookie+'='))?.slice(sessionCookie.length+1);if(!token)return false;const parts=token.split('.');if(parts.length!==3||!/^\d+$/.test(parts[0])||Number(parts[0])<=Date.now()||Number(parts[0])>Date.now()+12*60*60*1000)return false;return equalSecret(parts[2],await signature(parts.slice(0,2).join('.')))}
export const sameOrigin=(req:Request)=>req.headers.get('origin')===new URL(req.url).origin||req.headers.get('origin')==='https://zhizhi67742.github.io';

export function corsHeaders(req:Request){const origin=req.headers.get('origin');return {'Cache-Control':'no-store','Vary':'Origin',...(origin&&sameOrigin(req)?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, POST, PUT, DELETE, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'600'}:{})}}
export function preflight(req:Request){return new Response(null,{status:sameOrigin(req)?204:403,headers:corsHeaders(req)})}
