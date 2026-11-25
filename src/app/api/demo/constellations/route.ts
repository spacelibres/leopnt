import { constellationInfo, satellites, EPOCH } from '@/lib/orbits';
export function GET(){return Response.json({dataMode:'synthetic-demo',epoch:new Date(EPOCH).toISOString(),constellations:constellationInfo,satellites});}
