// Resolve every evidence node id the docs cite. Replace the IDS placeholder with a JSON array of "12:345" ids (batch ≤ 400 per call to stay under the return cap).
// Replace the GEO placeholder with [["12:345",["width","height","cornerRadius"]], …] (or []) to spot-check geometry against documented values.
const pg = await figma.getNodeByIdAsync('__PAGE_ID__'); await figma.setCurrentPageAsync(pg);   // ids on an unloaded page resolve to null
const ids = __IDS__; const geoReq = __GEO__;
const found = [], missing = [];
for (const id of ids) { const n = await figma.getNodeByIdAsync(id); if (!n) { missing.push(id); continue; } found.push(`${id} ${n.type} ${n.name.slice(0,24)} ${Math.round(n.width)}x${Math.round(n.height)}`); }
const geo = [];
for (const [id, keys] of geoReq) { const n = await figma.getNodeByIdAsync(id); if (!n) { geo.push(id+' MISSING'); continue; } geo.push(id+' '+keys.map(k=>k+'='+(typeof n[k]==='number'?Math.round(n[k]*100)/100:JSON.stringify(n[k]))).join(' ')); }
return `checked=${ids.length} found=${found.length} missing=${JSON.stringify(missing)}\n${found.join('\n')}\nGEO\n${geo.join('\n')}`;
