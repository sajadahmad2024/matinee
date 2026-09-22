// Pass 1: __PAGE_ID__ = '' → lists every page (id|name). Child counts are not reported: unloaded pages have no children in this runtime. NEVER trust get_metadata without a nodeId for this: it reports one page.
// Pass 2: __PAGE_ID__ = the chosen page id → lists its sections and root frames (evidence ids for the screen registry).
const pages = figma.root.children.map(p => `${p.id}|${p.name}`);
const PAGE_ID = '__PAGE_ID__';
if (!PAGE_ID) return 'PAGES\n' + pages.join('\n');
const vis = await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(vis);
const out = [];
for (const s of vis.children) {
  if (s.type === 'SECTION') {
    out.push(`S ${s.id}|${s.name}|${Math.round(s.width)}x${Math.round(s.height)}|kids=${s.children.length}`);
    for (const f of s.children) {
      out.push(`  ${f.type[0]} ${f.id}|${f.name}|${Math.round(f.width)}x${Math.round(f.height)}`);
    }
  } else if ('children' in s) {
    out.push(`T ${s.type} ${s.id}|${s.name}|${Math.round(s.width)}x${Math.round(s.height)}`);   // root frame outside any section
  }   // loose text/shapes at page root (canvas labels) are not screens
}
return 'PAGES\n' + pages.join('\n') + '\n\nPAGE ' + vis.name + '\n' + out.join('\n');