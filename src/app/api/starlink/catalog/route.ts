import {getCatalog,catalogMetadata} from '@/lib/catalog';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){try{const c=await getCatalog();return Response.json({...catalogMetadata(c),records:c.records},{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({dataMode:'starlink-gp',error:e instanceof Error?e.message:'星历不可用',records:[]},{status:503,headers:{'Cache-Control':'no-store'}});}}
