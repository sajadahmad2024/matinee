const pg = await figma.getNodeByIdAsync('__PAGE_ID__');
await figma.setCurrentPageAsync(pg);
const isStatus = n => /status/i.test(n.name) && /ios|bar|iphone/i.test(n.name);
const inStatusTree = n => { let p=n.parent; while(p){ if(isStatus(p)) return true; p=p.parent;} return false; };
const hex = (c,o) => '#'+[Math.round((o===undefined?1:o)*255),c.r,c.g,c.b].map((x,i)=>Math.round(i?x*255:x).toString(16).padStart(2,'0')).join('').toUpperCase();
const inc = (m,k,v=1) => m.set(k,(m.get(k)||0)+v);
const pad = new Map(), gap = new Map(), rad = new Map(), radPer = new Map(), sw = new Map(), swAlign=new Map(), eff = new Map(), opac = new Map(), lay = new Map(), sizing = new Map();
const nodes = pg.findAll(n => n.type!=='VECTOR' && n.type!=='BOOLEAN_OPERATION' && !isStatus(n) && !inStatusTree(n));
let alCount=0;
for (const n of nodes) {
  if ('layoutMode' in n && n.layoutMode!=='NONE') {
    alCount++;
    inc(pad, `${n.paddingTop}/${n.paddingRight}/${n.paddingBottom}/${n.paddingLeft}`);
    inc(gap, n.primaryAxisAlignItems==='SPACE_BETWEEN'?'SB':String(n.itemSpacing));
    inc(lay, `${n.layoutMode[0]} ${n.primaryAxisAlignItems}/${n.counterAxisAlignItems} ${n.primaryAxisSizingMode[0]}${n.counterAxisSizingMode[0]}${n.layoutWrap==='WRAP'?' WRAP':''}`);
  }
  if ('cornerRadius' in n) {
    if (n.cornerRadius===figma.mixed) inc(radPer, `${n.topLeftRadius}/${n.topRightRadius}/${n.bottomRightRadius}/${n.bottomLeftRadius}`);
    else if (n.cornerRadius>0) inc(rad, String(n.cornerRadius));
  }
  if (Array.isArray(n.strokes) && n.strokes.some(s=>s.visible!==false)) {
    const w = n.strokeWeight===figma.mixed ? `T${n.strokeTopWeight}/R${n.strokeRightWeight}/B${n.strokeBottomWeight}/L${n.strokeLeftWeight}` : String(n.strokeWeight);
    inc(sw, w); inc(swAlign, n.strokeAlign);
  }
  if (Array.isArray(n.effects)) for (const e of n.effects) { if (e.visible===false) continue;
    let k = e.type;
    if (e.type==='DROP_SHADOW'||e.type==='INNER_SHADOW') k += ` off=${e.offset.x},${e.offset.y} blur=${e.radius} spread=${e.spread||0} ${hex(e.color, e.color.a)}`;
    else k += ` r=${e.radius}`;
    const v = eff.get(k)||{c:0,names:new Set()}; v.c++; if(v.names.size<3) v.names.add(n.name.slice(0,20)+'#'+n.id); eff.set(k,v); }
  if ('opacity' in n && n.opacity<1) inc(opac, n.opacity.toFixed(2));
}
const top = (m,n=40) => [...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,n).map(e=>`${e[0]}×${e[1]}`).join(' ');
// root screens
const roots = [];
const rootFrames = []; for (const s of pg.children) { if (s.type==='SECTION') rootFrames.push(...s.children.filter(c=>'children' in c)); else if ('children' in s) rootFrames.push(s); }
for (const f of rootFrames) {
  const fill = Array.isArray(f.fills)&&f.fills[0]? (f.fills[0].type==='SOLID'?hex(f.fills[0].color,f.fills[0].opacity):f.fills[0].type):'none';
  roots.push(`${f.id}|${Math.round(f.width)}x${Math.round(f.height)}|${fill}|lay=${f.layoutMode}|clip=${f.clipsContent}|r=${f.cornerRadius===figma.mixed?'mix':f.cornerRadius}|kids=${f.children.length}:${f.children.map(c=>c.name.slice(0,14)).join(',')}`);
}
return `autolayoutFrames=${alCount}\nPADDING(T/R/B/L): ${top(pad,60)}\n\nGAP: ${top(gap,40)}\n\nLAYOUT: ${top(lay,25)}\n\nRADIUS: ${top(rad,30)}\nRADIUS per-corner: ${top(radPer,20)}\n\nSTROKE W: ${top(sw,15)} align: ${top(swAlign)}\n\nEFFECTS(${eff.size}):\n${[...eff.entries()].sort((a,b)=>b[1].c-a[1].c).map(([k,v])=>`×${v.c} ${k} | ${[...v.names].join(';')}`).join('\n')}\n\nOPACITY: ${top(opac,20)}\n\nROOTS:\n${roots.join('\n')}`;