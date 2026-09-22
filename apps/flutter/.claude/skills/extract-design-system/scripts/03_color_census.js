const pg = await figma.getNodeByIdAsync('__PAGE_ID__');
await figma.setCurrentPageAsync(pg);
const isStatus = n => /status/i.test(n.name) && /ios|bar|iphone/i.test(n.name);
const screenOf = n => { let p=n; while (p && p.parent && p.parent.type!=='SECTION' && p.parent.type!=='PAGE') p=p.parent; return p?p.name+'#'+p.id:'?'; };
const hex = (c,o) => '#'+[Math.round((o===undefined?1:o)*255),c.r,c.g,c.b].map((x,i)=>Math.round(i?x*255:x).toString(16).padStart(2,'0')).join('').toUpperCase();
const col = new Map(); const grads = new Map(); let imgFill=0, imgStroke=0; const imgScreens=new Set();
const nodes = pg.findAll(n => !isStatus(n));
let inStatus = 0;
const inStatusTree = n => { let p=n.parent; while(p){ if(isStatus(p)) return true; p=p.parent;} return false; };
for (const n of nodes) {
  if (inStatusTree(n)) { inStatus++; continue; }
  const handle = (paints, kind) => {
    if (!Array.isArray(paints)) return;
    for (const p of paints) {
      if (p.visible===false) continue;
      if (p.type==='SOLID') {
        const h = hex(p.color, p.opacity);
        const e = col.get(h) || {f:0,s:0,t:0,v:0,fr:0,screens:new Set(),names:new Map(),bound:0};
        if (kind==='fill') { e.f++; if (n.type==='TEXT') e.t++; else if (n.type==='VECTOR'||n.type==='BOOLEAN_OPERATION') e.v++; else e.fr++; } else e.s++;
        e.screens.add(screenOf(n));
        if (n.type!=='VECTOR') { const nm = n.name.slice(0,22); e.names.set(nm,(e.names.get(nm)||0)+1); }
        if (p.boundVariables && p.boundVariables.color) e.bound++;
        col.set(h,e);
      } else if (p.type.startsWith('GRADIENT')) {
        const stops = p.gradientStops.map(s=>hex(s.color, s.color.a)+'@'+s.position.toFixed(2)).join(',');
        const k = p.type+' '+stops + (p.opacity!==undefined&&p.opacity<1?' op='+p.opacity:'');
        const e = grads.get(k)||{c:0,screens:new Set(),names:new Set(),kind:kind};
        e.c++; e.screens.add(screenOf(n)); if(e.names.size<4) e.names.add(n.name.slice(0,25)+'#'+n.id); grads.set(k,e);
      } else if (p.type==='IMAGE') { if(kind==='fill') imgFill++; else imgStroke++; imgScreens.add(screenOf(n)); }
    }
  };
  handle(n.fills,'fill'); handle(n.strokes,'stroke');
}
const rows = [...col.entries()].sort((a,b)=>(b[1].f+b[1].s)-(a[1].f+a[1].s)).map(([h,e])=>{
  const topNames = [...e.names.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]+'×'+x[1]).join(';');
  return `${h} f=${e.f}(txt${e.t},vec${e.v},frm${e.fr}) s=${e.s} scr=${e.screens.size} bound=${e.bound} | ${topNames}`;
});
const g = [...grads.entries()].map(([k,e])=>`${e.kind} ×${e.c} scr=${e.screens.size} ${k} | ${[...e.names].join(';')}`);
return `scanned=${nodes.length} skippedInStatus=${inStatus} distinctSolids=${col.size}\n${rows.join('\n')}\n\nGRADIENTS(${grads.size})\n${g.join('\n')}\n\nIMAGE fills=${imgFill} strokes=${imgStroke} screens=${imgScreens.size}`;