const pg = await figma.getNodeByIdAsync('__PAGE_ID__');
await figma.setCurrentPageAsync(pg);
const all = pg.findAll(n => true);
const varUse = new Map(); // varId -> {props:Map, screens:Set, sampleNodes:[]}
const screenOf = n => { let p=n; while (p && p.parent && p.parent.type!=='SECTION' && p.parent.type!=='PAGE') p=p.parent; return p?`${p.name}#${p.id}`:'?'; };
const add = (id, prop, n) => { if(!id) return; const e = varUse.get(id)||{props:{},screens:new Set(),nodes:[]}; e.props[prop]=(e.props[prop]||0)+1; e.screens.add(screenOf(n)); if(e.nodes.length<3) e.nodes.push(`${n.name}#${n.id}`); varUse.set(id,e); };
const styleUse = new Map();
for (const n of all) {
  if (n.boundVariables) for (const k in n.boundVariables) { const v=n.boundVariables[k]; const arr=Array.isArray(v)?v:[v]; for (const a of arr) { if (a&&a.id) add(a.id,k,n); else if (a&&typeof a==='object') for (const kk in a) if (a[kk]&&a[kk].id) add(a[kk].id,k+'.'+kk,n); } }
  if (Array.isArray(n.fills)) n.fills.forEach((p,i)=>{ if(p.boundVariables) for(const k in p.boundVariables) add(p.boundVariables[k]?.id,'fills.'+k,n); });
  if (Array.isArray(n.strokes)) n.strokes.forEach((p,i)=>{ if(p.boundVariables) for(const k in p.boundVariables) add(p.boundVariables[k]?.id,'strokes.'+k,n); });
  if (n.type==='TEXT' && typeof n.textStyleId==='string' && n.textStyleId) { const e=styleUse.get(n.textStyleId)||{count:0,screens:new Set(),nodes:[]}; e.count++; e.screens.add(screenOf(n)); if(e.nodes.length<2) e.nodes.push(`${n.name}#${n.id}`); styleUse.set(n.textStyleId,e); }
}
const hex = c => '#'+[c.r,c.g,c.b].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('').toUpperCase() + (c.a!==undefined && c.a<1 ? ' a='+c.a.toFixed(2):'');
const resolve = async (val, depth=0) => { if (val && val.type==='VARIABLE_ALIAS') { const v2 = await figma.variables.getVariableByIdAsync(val.id); if(!v2) return 'alias->MISSING'; const c2 = await figma.variables.getVariableCollectionByIdAsync(v2.variableCollectionId); const chain = []; for (const m of c2.modes) chain.push(`${m.name}=${await resolve(v2.valuesByMode[m.modeId], depth+1)}`); return `alias->${v2.name}[${c2.name}]{${chain.join(';')}}`; } if (val && typeof val==='object' && 'r' in val) return hex(val); return JSON.stringify(val); };
const out = [];
const colls = new Map();
for (const [id,u] of varUse) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (!v) { out.push(`VAR ${id} MISSING props=${JSON.stringify(u.props)}`); continue; }
  const c = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
  colls.set(c.id, {name:c.name, key:c.key, modes:c.modes.map(m=>m.name), n:c.variableIds.length, remote:c.remote});
  const vals = [];
  for (const m of c.modes) vals.push(`${m.name}=${await resolve(v.valuesByMode[m.modeId])}`);
  out.push(`VAR ${v.name} type=${v.resolvedType} key=${v.key} coll=${c.name}(${c.id}) remote=${v.remote}\n   values: ${vals.join(' | ')}\n   props=${JSON.stringify(u.props)} screens=${u.screens.size} e.g. ${[...u.screens].slice(0,4).join(', ')}\n   nodes: ${u.nodes.join(', ')}`);
}
out.push('\nCOLLECTIONS');
for (const [id,c] of colls) out.push(`${id} ${c.name} key=${c.key} modes=${c.modes.join('/')} vars=${c.n} remote=${c.remote}`);
out.push('\nTEXT STYLES');
for (const [id,u] of styleUse) {
  const s = await figma.getStyleByIdAsync(id);
  if (!s) { out.push(`STYLE ${id} MISSING count=${u.count}`); continue; }
  out.push(`STYLE ${s.name} key=${s.key} remote=${s.remote} font=${s.fontName.family}/${s.fontName.style} size=${s.fontSize} lh=${JSON.stringify(s.lineHeight)} ls=${JSON.stringify(s.letterSpacing)} count=${u.count} screens=${[...u.screens].slice(0,3).join(', ')} nodes=${u.nodes.join(', ')}`);
}
return out.join('\n');