/** satellite.js 7.2 pure-JS runtime. Its root barrel also exports Emscripten pthread modules
 * requiring node:worker_threads. Import the shipped JS units to keep those out of browsers.
 * Pin satellite.js version; cover this adapter with Vallado and numerical-rate tests.
 */
export {json2satrec,twoline2satrec,alpha5ToNumber} from '../../node_modules/satellite.js/dist/io.js';
export {propagate,gstime} from '../../node_modules/satellite.js/dist/propagation.js';
export {eciToEcf,eciToEcfVelocity,eciToGeodetic,ecfToLookAngles,geodeticToEcf} from '../../node_modules/satellite.js/dist/transforms.js';
export type {SatRec,OMMJsonObject} from 'satellite.js';
