// Pure deadline logic shared by both trackers. No browser or timezone dependency.
export const instant = value => { const n = Date.parse(value); return Number.isFinite(n) ? n : Infinity; };
export function nextDeadline(entry, now = Date.now()) {
  if (entry.tba) return Infinity;
  return Math.min(Infinity, ...(entry.deadlines || []).flatMap(d => [instant(d.abstract), instant(d.date)]).filter(t => t > now));
}
export function statusOf(entry, now = Date.now()) {
  if (entry.tba) return 'tba';
  if (nextDeadline(entry, now) !== Infinity) return 'upcoming';
  return (entry.deadlines || []).some(d => instant(d.date) !== Infinity) ? 'past' : 'tba';
}
export function selectEntries(entries, state = {}, now = Date.now()) {
  const query = (state.q || '').trim().toLocaleLowerCase();
  const filtered = entries.filter(e => (!query || [e.name,e.description,e.place,e.year].join(' ').toLocaleLowerCase().includes(query))
    && (!state.country || e.country === state.country)
    && (!state.status || state.status === 'all' || statusOf(e,now) === state.status)
    && (state.groups || []).every(group => !group.length || group.some(tag => (e.tags || []).includes(tag))));
  return filtered.sort((a,b) => {
    if (state.sort === 'name') return a.name.localeCompare(b.name);
    if (state.sort === 'event') return instant(a.eventStart) - instant(b.eventStart) || a.name.localeCompare(b.name);
    const order = {upcoming:0,tba:1,past:2};
    return order[statusOf(a,now)] - order[statusOf(b,now)] || nextDeadline(a,now) - nextDeadline(b,now) || a.name.localeCompare(b.name);
  });
}
export function countdown(when, now = Date.now()) {
  let seconds = Math.max(0, Math.floor((when-now)/1000));
  const days = Math.floor(seconds/86400); seconds %= 86400;
  const hours = Math.floor(seconds/3600); seconds %= 3600;
  const minutes = Math.floor(seconds/60); seconds %= 60;
  return {days,hours,minutes,seconds,expired:when<=now};
}
export function safeURL(value) {
  try { const u = new URL(value); return ['https:','http:'].includes(u.protocol) ? u.href : '#'; } catch { return '#'; }
}
const escapeICS = value => String(value || '').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
const icsDate = time => new Date(time).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
function foldICS(line) {
  const lines = []; let chunk = ''; let bytes = 0;
  for (const char of line) {
    const size = new TextEncoder().encode(char).length;
    if (bytes + size > 73) { lines.push(chunk); chunk = ' '; bytes = 1; }
    chunk += char; bytes += size;
  }
  lines.push(chunk); return lines.join('\r\n');
}
export function calendar(entries, now = Date.now()) {
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SCOAI Lab//Research Deadlines//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
  for (const e of entries) {
    if (e.tba) continue;
    for (const d of (e.deadlines || [])) {
      for (const [kind,raw] of [['Paper',d.date],['Abstract',d.abstract]]) {
        const when=instant(raw); if (!Number.isFinite(when) || when<=now) continue;
        lines.push('BEGIN:VEVENT',`UID:${e.id}-${icsDate(when)}-${kind}@scoai-lab`, `DTSTAMP:${icsDate(now)}`,`DTSTART:${icsDate(when)}`,`DTEND:${icsDate(when+60000)}`,`SUMMARY:${escapeICS(`${e.name} ${e.year || ''} — ${kind} deadline`)}`,`DESCRIPTION:${escapeICS(e.description+'\n'+(d.comment||e.comment||'')+'\nConfirm with the official call for papers.')}`,`URL:${safeURL(e.link)}`,`LOCATION:${escapeICS(e.place)}`,'END:VEVENT');
      }
    }
  }
  lines.push('END:VCALENDAR'); return lines.map(foldICS).join('\r\n')+'\r\n';
}
