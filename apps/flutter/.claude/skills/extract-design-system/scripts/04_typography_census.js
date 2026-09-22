const pg = await figma.getNodeByIdAsync('__PAGE_ID__');
await figma.setCurrentPageAsync(pg);
const isStatus = n => /status/i.test(n.name) && /ios|bar|iphone/i.test(n.name);
const inStatusTree = n => { let p=n.parent; while(p){ if(isStatus(p)) return true; p=p.parent;} return false; };
const screenOf = n => { let p=n; while (p && p.parent && p.parent.type!=='SECTION' && p.parent.type!=='PAGE') p=p.parent; return p?p.name+'#'+p.id:'?'; };
const hex = (c,o) => '#'+[Math.round((o===undefined?1:o)*255),c.r,c.g,c.b].map((x,i)=>Math.round(i?x*255:x).toString(16).padStart(2,'0')).join('').toUpperCase();
const texts = pg.findAllWithCriteria({types:['TEXT']}).filter(t=>!inStatusTree(t));
const sig = new Map();
let mixedNodes = 0, segTotal = 0;
for (const t of texts) {
  const segs = t.getStyledTextSegments(['fontName','fontSize','lineHeight','letterSpacing','textCase','textDecoration','fills','textStyleId']);
  if (segs.length>1) mixedNodes++;
  for (const s of segs) {
    segTotal++;
    const lh = s.lineHeight.unit==='AUTO'?'auto':(s.lineHeight.unit==='PIXELS'?s.lineHeight.value+'px':s.lineHeight.value+'%');
    const ls = s.letterSpacing.value===0?'0':(s.letterSpacing.unit==='PIXELS'?s.letterSpacing.value+'px':s.letterSpacing.value+'%');
    const k = `${s.fontName.family}/${s.fontName.style}|${s.fontSize}|${lh}|${ls}|${s.textCase==='ORIGINAL'?'':s.textCase}|${s.textDecoration==='NONE'?'':s.textDecoration}`;
    const e = sig.get(k)||{c:0,colors:new Map(),align:new Map(),screens:new Set(),names:new Map(),styled:0};
    e.c++;
    const f = (s.fills||[]).find(p=>p.type==='SOLID'&&p.visible!==false);
    const ch = f?hex(f.color,f.opacity):((s.fills||[])[0]?(s.fills[0].type):'none');
    e.colors.set(ch,(e.colors.get(ch)||0)+1);
    e.align.set(t.textAlignHorizontal[0],(e.align.get(t.textAlignHorizontal[0])||0)+1);
    e.screens.add(screenOf(t));
    const nm = t.name.slice(0,18); e.names.set(nm,(e.names.get(nm)||0)+1);
    if (s.textStyleId) e.styled++;
    sig.set(k,e);
  }
}
const rows = [...sig.entries()].sort((a,b)=>b[1].c-a[1].c).map(([k,e])=>{
  const cols = [...e.colors.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4).map(x=>x[0]+'×'+x[1]).join(',');
  const al = [...e.align.entries()].map(x=>x[0]+x[1]).join('');
  const nm = [...e.names.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]).join(';');
  return `${k}|n=${e.c}|scr=${e.screens.size}|al=${al}|sty=${e.styled}|${cols}|${nm}`;
});
return `texts=${texts.length} mixed=${mixedNodes} segments=${segTotal} distinct=${sig.size}\nfamily/style|size|lh|ls|case|deco|n|scr|align|styled|colors|samples\n${rows.join('\n')}`;