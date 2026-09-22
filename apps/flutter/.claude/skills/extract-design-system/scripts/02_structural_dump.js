// Paged structural dump of every root frame on the page. One call per chunk: set __CHUNK__ = 0,1,2,… until the header's PAGES count is reached.
// Output line grammar: <indent><TypeInitial>[I=instance] <name> #<id> <w>x<h>[@x,y] [HIDDEN] F:<fills> S:<strokes>@<w> R:<radius> L:<layout P:pad G:gap A:align sizing> Z:<sizing> O:<opacity> E:<effects> T:<font-style size/lh[/ls] case align "text"> →<main component> =REP#<id of identical subtree already printed>
// Colours are #RRGGBB or #AARRGGBB; {name} after a paint is the bound variable. Status-bar subtrees are collapsed to ~StatusBar.
const PAGE = __CHUNK__, BUDGET = 19000, PAGEID = '__PAGE_ID__';
const pg = await figma.getNodeByIdAsync(PAGEID);
await figma.setCurrentPageAsync(pg);
const isStatus = n => /status/i.test(n.name) && /ios|bar|iphone/i.test(n.name);
const hex = (c,o) => { const a=Math.round((o===undefined?1:o)*255); return '#'+(a===255?'':a.toString(16).padStart(2,'0'))+[c.r,c.g,c.b].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('').toUpperCase(); };
const varCache = new Map();
const vname = async id => { if(!varCache.has(id)){ const v=await figma.variables.getVariableByIdAsync(id); varCache.set(id, v?v.name.replace(/^.*\//,''):'?'); } return varCache.get(id); };
const paintStr = async p => { if(p.visible===false) return null; let s; if(p.type==='SOLID') s=hex(p.color,p.opacity); else if(p.type.startsWith('GRADIENT')) s='G('+p.gradientStops.map(st=>hex(st.color,st.color.a)).join('>')+')'; else if(p.type==='IMAGE') s='IMG'; else s=p.type; if(p.boundVariables&&p.boundVariables.color) s+='{'+await vname(p.boundVariables.color.id)+'}'; return s; };
const paintsStr = async arr => { if(!Array.isArray(arr)) return ''; const out=[]; for(const p of arr){ const s=await paintStr(p); if(s) out.push(s);} return out.join('+'); };
const r1 = x => Math.round(x*10)/10;
const sigMap = new Map(); const lines = [];
const sigOf = n => { let s = n.type[0]+n.name+'|'+Math.round(n.width)+'x'+Math.round(n.height); if(n.type==='TEXT') s+='|'+n.characters.slice(0,30); if('children' in n) s+='['+n.children.map(sigOf).join(',')+']'; return s; };
const countDesc = n => 'children' in n ? n.children.reduce((a,c)=>a+1+countDesc(c),0) : 0;
const walk = async (n, d, parentAL) => {
  if (isStatus(n)) { lines.push(' '.repeat(d)+'~StatusBar #'+n.id); return; }
  const isVec = n.type==='VECTOR'||n.type==='BOOLEAN_OPERATION'||n.type==='LINE'||n.type==='ELLIPSE'||n.type==='STAR'||n.type==='POLYGON';
  const parts = [];
  let head = ' '.repeat(d) + n.type[0] + (n.type==='INSTANCE'?'I':'') + ' ' + n.name.replace(/\n/g,' ').slice(0,26) + ' #' + n.id + ' ' + Math.round(n.width)+'x'+Math.round(n.height);
  if (!parentAL || n.layoutPositioning==='ABSOLUTE') head += '@'+Math.round(n.x)+','+Math.round(n.y);
  if (n.visible===false) parts.push('HIDDEN');
  const f = await paintsStr(n.fills); if (f) parts.push('F:'+f);
  const s = await paintsStr(n.strokes); if (s) { const w = n.strokeWeight===figma.mixed?`T${n.strokeTopWeight}R${n.strokeRightWeight}B${n.strokeBottomWeight}L${n.strokeLeftWeight}`:n.strokeWeight; parts.push('S:'+s+'@'+w); }
  if ('cornerRadius' in n) { if (n.cornerRadius===figma.mixed) parts.push(`R:${n.topLeftRadius}/${n.topRightRadius}/${n.bottomRightRadius}/${n.bottomLeftRadius}`); else if (n.cornerRadius>0) parts.push('R:'+r1(n.cornerRadius)); }
  if ('layoutMode' in n && n.layoutMode!=='NONE') {
    let l = 'L:'+n.layoutMode[0]; if (n.layoutWrap==='WRAP') l+='w';
    const pa = [n.paddingTop,n.paddingRight,n.paddingBottom,n.paddingLeft]; if (pa.some(x=>x)) l+=' P:'+pa.join('/');
    l += ' G:'+(n.primaryAxisAlignItems==='SPACE_BETWEEN'?'SB':n.itemSpacing);
    const al = (n.primaryAxisAlignItems==='MIN'?'':n.primaryAxisAlignItems[0])+(n.counterAxisAlignItems==='MIN'?'':'/'+n.counterAxisAlignItems[0]); if (al) l+=' A:'+al;
    l += ' '+n.primaryAxisSizingMode[0]+n.counterAxisSizingMode[0];
    parts.push(l);
  }
  if (parentAL && n.layoutSizingHorizontal && (n.layoutSizingHorizontal!=='FIXED'||n.layoutSizingVertical!=='FIXED')) parts.push('Z:'+n.layoutSizingHorizontal[0]+n.layoutSizingVertical[0]);
  if ('opacity' in n && n.opacity<1) parts.push('O:'+r1(n.opacity));
  if (Array.isArray(n.effects)) for (const e of n.effects) { if (e.visible===false) continue; if (e.type.includes('SHADOW')) parts.push(`E:${e.type[0]}S(${e.offset.x},${e.offset.y},${e.radius},${e.spread||0},${hex(e.color,e.color.a)})`); else parts.push(`E:${e.type[0]}B(${e.radius})`); }
  if (n.type==='TEXT') {
    const segs = n.getStyledTextSegments(['fontName','fontSize','lineHeight','letterSpacing','textCase','fills']);
    const sg = segs[0]; const lh = sg.lineHeight.unit==='AUTO'?'a':(sg.lineHeight.unit==='PIXELS'?r1(sg.lineHeight.value):r1(sg.lineHeight.value)+'%'); const ls = sg.letterSpacing.value?('/'+r1(sg.letterSpacing.value)+(sg.letterSpacing.unit==='PERCENT'?'%':'')):'';
    parts.push(`T:${sg.fontName.family.replace(/ /g,'')}-${sg.fontName.style.replace(/ /g,'')} ${sg.fontSize}/${lh}${ls}${sg.textCase!=='ORIGINAL'?' '+sg.textCase[0]:''} ${n.textAlignHorizontal[0]}${segs.length>1?' MIX'+segs.length:''} "${n.characters.replace(/\n/g,'⏎').slice(0,28)}"`);
  }
  if (n.type==='INSTANCE') { try { const mc = await n.getMainComponentAsync(); if (mc) parts.push('→'+((mc.parent&&mc.parent.type==='COMPONENT_SET')?mc.parent.name+'/':'')+mc.name); } catch(e){} }
  if (isVec) { lines.push(head+' '+parts.filter(p=>p.startsWith('F:')||p.startsWith('S:')||p.startsWith('O:')).join(' ')); return; }
  let rep = null;
  if ('children' in n && n.children.length && countDesc(n)>=3) { const sg = sigOf(n); if (sigMap.has(sg)) rep = sigMap.get(sg); else sigMap.set(sg, n.id); }
  if (rep) { lines.push(head+' '+parts.join(' ')+' =REP#'+rep); return; }
  lines.push(head+' '+parts.join(' '));
  if ('children' in n) { const al = 'layoutMode' in n && n.layoutMode!=='NONE'; for (const c of n.children) await walk(c, d+1, al); }
};
let rootHdr = false;
for (const sec of pg.children) { if (sec.type==='SECTION') { lines.push('## SECTION '+sec.name+' #'+sec.id); for (const f of sec.children) if ('children' in f) await walk(f, 0, false); } else if ('children' in sec) { if (!rootHdr) { lines.push('## ROOT FRAMES (no section)'); rootHdr = true; } await walk(sec, 0, false); } }
const pages = []; let cur = [], len = 0;
for (const l of lines) { if (len + l.length + 1 > BUDGET && cur.length) { pages.push(cur); cur = []; len = 0; } cur.push(l); len += l.length + 1; }
if (cur.length) pages.push(cur);
return `PAGES=${pages.length} PAGE=${PAGE} LINES=${lines.length}\n` + (pages[PAGE]||[]).join('\n');
