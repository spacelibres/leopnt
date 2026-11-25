import packageInfo from '../../../../package.json';
export const dynamic='force-dynamic';

export function GET(){
  return Response.json({status:'ok',version:packageInfo.version,release:process.env.LEOPNT_RELEASE??'local'}, {headers:{'Cache-Control':'no-store'}});
}
