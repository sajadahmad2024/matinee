const pg = await figma.getNodeByIdAsync('__PAGE_ID__');
await figma.setCurrentPageAsync(pg);
const isStatus = n => /status/i.test(n.name) && /ios|bar|iphone/i.test(n.name);
const inStatus = n => { let p=n.parent; while(p){ if(isStatus(p)) return true; p=p.parent;} return false; };
const screenOf = n => { let p=n; while (p && p.parent && p.parent.type!=='SECTION' && p.parent.type!=='PAGE') p=p.parent; return p?p.name.slice(0,14)+'#'+p.id:'?'; };
const hex = (c,o) => { const a=Math.round((o===undefined?1:o)*255); return '#'+(a===255?'':a.toString(16).padStart(2,'0'))+[c.r,c.g,c.b].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('').toUpperCase(); };
const paint = arr => { if(!Array.isArray(arr)) return ''; const v=arr.filter(p=>p.visible!==false); if(!v.length) return ''; const p=v[0]; if(p.type==='SOLID') return hex(p.color,p.opacity); if(p.type.startsWith('GRADIENT')) return 'G('+p.gradientStops.map(s=>hex(s.color,s.color.a)).join('>')+')'; return p.type; };
const rad = n => n.cornerRadius===figma.mixed?`${n.topLeftRadius}/${n.topRightRadius}/${n.bottomRightRadius}/${n.bottomLeftRadius}`:String(n.cornerRadius);
const pad = n => ('layoutMode' in n && n.layoutMode!=='NONE')?`${n.paddingTop}/${n.paddingRight}/${n.paddingBottom}/${n.paddingLeft} g${n.primaryAxisAlignItems==='SPACE_BETWEEN'?'SB':n.itemSpacing}`:'-';
const sw = n => Array.isArray(n.strokes)&&n.strokes.some(s=>s.visible!==false) ? (n.strokeWeight===figma.mixed?`T${n.strokeTopWeight}B${n.strokeBottomWeight}`:String(n.strokeWeight)) : '0';
const eff = n => (n.effects||[]).filter(e=>e.visible!==false).map(e=>e.type.includes('SHADOW')?`S(${e.offset.x},${e.offset.y},${e.radius},${hex(e.color,e.color.a)})`:`B${e.radius}`).join('+');
const firstText = n => { const t = n.findOne ? n.findOne(x=>x.type==='TEXT') : null; if(!t) return ''; const f=t.fontName===figma.mixed?{family:'MIX',style:''}:t.fontName; const fs = t.fontSize===figma.mixed?'mix':t.fontSize; return `${f.family.replace(/ /g,'')}-${f.style.replace(/ /g,'')} ${fs} ${paint(t.fills)}`; };
const agg = (list, keyFn) => { const m=new Map(); for (const n of list) { const k=keyFn(n); const e=m.get(k)||{c:0,scr:new Set(),ids:[]}; e.c++; e.scr.add(screenOf(n)); if(e.ids.length<2) e.ids.push(n.id); m.set(k,e);} return [...m.entries()].sort((a,b)=>b[1].c-a[1].c).map(([k,e])=>`×${e.c} scr${e.scr.size} ${k} [${e.ids.join(',')}]`); };
const frames = pg.findAll(n => (n.type==='FRAME'||n.type==='INSTANCE'||n.type==='RECTANGLE') && !inStatus(n) && !isStatus(n));
const out = [];
// Heuristics below are generic (names + geometry); tighten them per file only in a scratch copy, never here.
// BUTTONS: name contains Button/Btn/CTA, filled or stroked, contains text, height 24..64
const isBtnName = n => /Button|Btn|CTA/i.test(n.name);
const btns = frames.filter(n => isBtnName(n) && n.height<=64 && n.height>=24 && (paint(n.fills)||sw(n)!=='0') && n.findOne && n.findOne(x=>x.type==='TEXT'));
out.push('## BUTTONS (name~Button, filled/stroked, has text) '+btns.length);
out.push(...agg(btns, n=>`h${Math.round(n.height)} F:${paint(n.fills)} S:${paint(n.strokes)}@${sw(n)} R:${rad(n)} P:${pad(n)} E:${eff(n)} T:${firstText(n)}`));
// PILLS/CHIPS: radius>=16 or 999/9999, height 16..35, has text, not button
const pills = frames.filter(n => !isBtnName(n) && n.height>=14 && n.height<=35 && n.width<200 && (n.cornerRadius===figma.mixed?false:n.cornerRadius>=8) && (paint(n.fills)||sw(n)!=='0') && n.findOne && n.findOne(x=>x.type==='TEXT'));
out.push('\n## PILLS/CHIPS/BADGES (r>=8, h14-35, w<200, has text) '+pills.length);
out.push(...agg(pills, n=>`h${Math.round(n.height)} F:${paint(n.fills)} S:${paint(n.strokes)}@${sw(n)} R:${rad(n)} P:${pad(n)} T:${firstText(n)}`).slice(0,45));
// CARDS: any solid/gradient-filled or stroked frame, radius 8-24, width>=100, height>=40, not a button/input/tab
const cards = frames.filter(n => n.width>=100 && n.height>=40 && n.cornerRadius!==figma.mixed && n.cornerRadius>=8 && n.cornerRadius<=24 && ((paint(n.fills)&&paint(n.fills)!=='IMAGE')||sw(n)!=='0') && !/Button|Btn|Input|Tab/i.test(n.name));
out.push('\n## CARD SURFACES (w>=100,h>=40,r8-24) '+cards.length);
out.push(...agg(cards, n=>`F:${paint(n.fills)} S:${paint(n.strokes)}@${sw(n)} R:${rad(n)} P:${pad(n)} E:${eff(n)}`).slice(0,40));
// INPUTS
const inputs = frames.filter(n => /Input/i.test(n.name));
out.push('\n## INPUTS '+inputs.length);
out.push(...agg(inputs, n=>`${Math.round(n.width)}x${Math.round(n.height)} F:${paint(n.fills)} S:${paint(n.strokes)}@${sw(n)} R:${rad(n)} P:${pad(n)} E:${eff(n)} T:${firstText(n)}`));
// PROGRESS BARS: height<=6, width>=20, radius>0, has a child frame with fill
const bars = frames.filter(n => n.type==='FRAME' && n.height<=6 && n.height>=2 && n.width>=20 && n.children && n.children.length===1 && n.children[0].type==='FRAME' && paint(n.fills));
out.push('\n## PROGRESS TRACKS (h2-6 with 1 fill child) '+bars.length);
out.push(...agg(bars, n=>`h${n.height} track:${paint(n.fills)} R:${rad(n)} fill:${paint(n.children[0].fills)}`));
// AVATARS: image-filled, radius==w/2
const avatars = frames.filter(n => Math.abs(n.width-n.height)<0.5 && n.width>=24 && n.width<=100 && n.cornerRadius!==figma.mixed && Math.abs(n.cornerRadius-n.width/2)<1 && (paint(n.fills)==='IMAGE' || (n.children&&n.children.some(c=>paint(c.fills)==='IMAGE'))));
out.push('\n## AVATARS (circle w/ image) '+avatars.length);
out.push(...agg(avatars, n=>`${Math.round(n.width)} S:${paint(n.strokes)}@${sw(n)}`));
// ICON frames
const icons = frames.filter(n => n.type==='FRAME' && Math.abs(n.width-n.height)<0.5 && n.width<=40 && n.children && n.children.every(c=>c.type==='VECTOR'||c.type==='BOOLEAN_OPERATION'||c.type==='GROUP'));
const im = new Map(); for (const n of icons) im.set(n.width,(im.get(n.width)||0)+1);
out.push('\n## ICON FRAME SIZES: '+[...im.entries()].sort((a,b)=>b[1]-a[1]).map(e=>e[0]+'×'+e[1]).join(' '));
// HEADERS
const headers = frames.filter(n => /Header|AppBar|App Bar|TopBar|Top Bar/i.test(n.name));
out.push('\n## HEADERS '+headers.length);
out.push(...agg(headers, n=>`${Math.round(n.width)}x${Math.round(n.height)} F:${paint(n.fills)} P:${pad(n)} T:${firstText(n)}`));
// SHEETS (top-only radius)
const sheets = frames.filter(n => n.cornerRadius===figma.mixed && n.topLeftRadius>0 && n.bottomLeftRadius===0);
out.push('\n## SHEETS (top-only radius) '+sheets.length);
out.push(...agg(sheets, n=>`${Math.round(n.width)}x${Math.round(n.height)} F:${paint(n.fills)} S:${paint(n.strokes)}@${sw(n)} R:${rad(n)} P:${pad(n)} E:${eff(n)}`));
// HANDLES
const handles = frames.filter(n => n.height<=4 && n.width>=30 && n.width<=44 && paint(n.fills) && (!n.children||n.children.length===0));
out.push('\n## SHEET HANDLES: '+agg(handles, n=>`${n.width}x${n.height} ${paint(n.fills)} R:${rad(n)}`).join(' | '));
// DIVIDERS
const divs = frames.filter(n => n.height===1 && n.width>=60 && paint(n.fills) && (!n.children||n.children.length===0));
out.push('\n## DIVIDERS (h1): '+agg(divs, n=>`${paint(n.fills)}`).join(' | '));
// BOTTOM NAV custom
const navs = frames.filter(n => /BottomNav|Bottom Nav|Nav ?Bar|TabBar|Tab Bar|Navigation/i.test(n.name) && n.width>=300);
out.push('\n## BOTTOM NAVS '+navs.length+': '+agg(navs, n=>`${n.type} ${Math.round(n.width)}x${Math.round(n.height)} F:${paint(n.fills)} S:${paint(n.strokes)}@${sw(n)} P:${pad(n)}`).join(' | '));
return out.join('\n');