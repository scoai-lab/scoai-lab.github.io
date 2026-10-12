import { selectEntries, nextDeadline, statusOf, instant, countdown, calendar, safeURL } from './model.js';

const page=document.body.dataset.page;
const base=page==='home'?'./':'../';
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Preferences are optional. */}};
let language=read('scoai-language','en'); if(!['en','vi'].includes(language))language='en';
const messages={
 en:{about:'About',research:'Research',team:'Our team',tools:'Research tools',exploreResearch:'Explore our research',researchTools:'Research tools',aboutLabel:'01 / ABOUT THE LAB',researchLabel:'02 / RESEARCH AREAS',resourcesLabel:'03 / RESOURCES FOR RESEARCHERS',teamLabel:'04 / OUR TEAM',supplyChain:'Supply Chain Optimization',inventory:'Inventory Management',demand:'Demand Forecasting',operations:'Operations Research',decision:'Decision Making',exploreDeadlines:'Explore deadlines',backTop:'Back to top',filters:'Filters',clear:'Reset filters',search:'Search conferences',searchPlaceholder:'Name, topic, or location…',export:'Export calendar',sort:'Sort by',deadline:'Deadline',event:'Event date',name:'Name',timezone:'Display timezone',country:'Host country',allCountries:'All countries',status:'Deadline status',all:'All deadlines',upcoming:'Upcoming',tba:'To be announced',past:'Past deadlines',paper:'Paper deadline',abstract:'Abstract deadline',closed:'Deadline passed',round:'Round',details:'All rounds & details',rebuttal:'Rebuttal',abstractNote:'Abstract / registration',official:'Official website',addCalendar:'Add to calendar',noResults:'No matching conferences',tryFilters:'Try a different search or reset your filters.',loadMore:'Show more conferences',showing:'Showing',of:'of',conferences:'conferences',confirm:'Always confirm dates with the official call for papers.',filterHint:'Choose any options. Matches are combined across groups.',expected:'CFP not yet announced',expectedNote:'Dates from a previous or expected round are not confirmed submission deadlines.',previous:'Previous / reference deadline',updated:'Data snapshot updated',source:'Data source',snapshot:'Dates are from community-maintained source snapshots.',calendarReady:'Calendar downloaded. Import the .ics file into your calendar.',noCalendar:'No confirmed upcoming deadlines match these filters.',loadError:'Unable to load deadlines',loadErrorText:'The local data could not be loaded. Please retry.',retry:'Try again',local:'Local time',aoe:'Anywhere on Earth (UTC−12)',sourceZone:'Original timezone',emptyTime:'Date not announced',rank:'CORE ranking',researchArea:'Research area',researchDomain:'Research domain',publicationType:'Publication type',theme:'Color theme',light:'Light',dark:'Dark',auto:'Auto',language:'Switch to Vietnamese',menu:'Open navigation',built:'Research with purpose. Decisions with evidence.',rights:'SCOAI Lab · Supply Chain Optimization & AI Laboratory',credits:'Sources & acknowledgements',browse:'Browse research deadlines',conferenceDescription:'Paper and abstract deadlines across computer science research.',mpcDescription:'Conferences, journals, and workshops for secure multi-party computation.',days:'d',hours:'h',minutes:'m',seconds:'s'},
 vi:{about:'Giới thiệu',research:'Nghiên cứu',team:'Đội ngũ',tools:'Công cụ nghiên cứu',exploreResearch:'Khám phá nghiên cứu',researchTools:'Công cụ nghiên cứu',aboutLabel:'01 / GIỚI THIỆU',researchLabel:'02 / LĨNH VỰC NGHIÊN CỨU',resourcesLabel:'03 / TÀI NGUYÊN NGHIÊN CỨU',teamLabel:'04 / ĐỘI NGŨ',supplyChain:'Tối ưu hóa chuỗi cung ứng',inventory:'Quản lý tồn kho',demand:'Dự báo nhu cầu',operations:'Nghiên cứu vận trù',decision:'Ra quyết định',exploreDeadlines:'Xem hạn nộp bài',backTop:'Về đầu trang',filters:'Bộ lọc',clear:'Xóa bộ lọc',search:'Tìm hội nghị',searchPlaceholder:'Tên, chủ đề hoặc địa điểm…',export:'Xuất lịch',sort:'Sắp xếp',deadline:'Hạn nộp bài',event:'Ngày sự kiện',name:'Tên',timezone:'Múi giờ hiển thị',country:'Quốc gia tổ chức',allCountries:'Tất cả quốc gia',status:'Trạng thái',all:'Tất cả hạn nộp',upcoming:'Sắp đến hạn',tba:'Chưa công bố',past:'Đã hết hạn',paper:'Hạn nộp bài',abstract:'Hạn abstract',closed:'Đã hết hạn',round:'Vòng',details:'Các vòng & chi tiết',rebuttal:'Phản biện',abstractNote:'Abstract / đăng ký',official:'Trang chính thức',addCalendar:'Thêm vào lịch',noResults:'Không tìm thấy hội nghị',tryFilters:'Thử từ khóa khác hoặc xóa bộ lọc.',loadMore:'Xem thêm hội nghị',showing:'Hiển thị',of:'trên',conferences:'hội nghị',confirm:'Luôn đối chiếu thời hạn với thông báo nộp bài chính thức.',filterHint:'Chọn tùy ý. Các nhóm bộ lọc được kết hợp với nhau.',expected:'CFP chưa được công bố',expectedNote:'Ngày từ vòng trước hoặc dự kiến chưa phải hạn nộp bài được xác nhận.',previous:'Hạn nộp trước / tham khảo',updated:'Dữ liệu được cập nhật',source:'Nguồn dữ liệu',snapshot:'Ngày tháng lấy từ dữ liệu do cộng đồng duy trì.',calendarReady:'Đã tải lịch. Nhập tệp .ics vào ứng dụng lịch của bạn.',noCalendar:'Không có hạn nộp sắp tới đã được xác nhận theo bộ lọc này.',loadError:'Không tải được thời hạn',loadErrorText:'Không thể tải dữ liệu. Vui lòng thử lại.',retry:'Thử lại',local:'Giờ địa phương',aoe:'Anywhere on Earth (UTC−12)',sourceZone:'Múi giờ gốc',emptyTime:'Chưa công bố ngày',rank:'Xếp hạng CORE',researchArea:'Lĩnh vực nghiên cứu',researchDomain:'Hướng nghiên cứu',publicationType:'Loại ấn phẩm',theme:'Giao diện',light:'Sáng',dark:'Tối',auto:'Tự động',language:'Switch to English',menu:'Mở điều hướng',built:'Nghiên cứu có mục đích. Quyết định có cơ sở.',rights:'SCOAI Lab · Phòng nghiên cứu Tối ưu hóa Chuỗi cung ứng & AI',credits:'Nguồn & ghi nhận',browse:'Theo dõi hạn nộp nghiên cứu',conferenceDescription:'Hạn nộp paper và abstract trong các lĩnh vực khoa học máy tính.',mpcDescription:'Hội nghị, tạp chí và workshop về tính toán đa bên an toàn.',days:'n',hours:'g',minutes:'p',seconds:'s'}
};
messages.en.conferenceTool='Conference Deadlines';messages.vi.conferenceTool='Hạn nộp hội nghị';messages.en.mpcTool='MPC Deadlines';messages.vi.mpcTool='Hạn nộp MPC';messages.vi.language='Chuyển sang tiếng Anh';
messages.en.showResults='Show results';messages.vi.showResults='Xem kết quả';
messages.en.closeFilters='Close filters';messages.vi.closeFilters='Đóng bộ lọc';
messages.en.onTime='RESEARCH, RIGHT ON TIME';messages.vi.onTime='NGHIÊN CỨU, ĐÚNG THỜI ĐIỂM';
const optionLabels={
 'Architecture & Systems':'Kiến trúc & hệ thống','Networking':'Mạng máy tính','Security & Privacy':'An toàn & quyền riêng tư','Software Engineering':'Kỹ thuật phần mềm','Databases & Data Mining':'Cơ sở dữ liệu & khai phá dữ liệu','Theory':'Lý thuyết','Graphics & Multimedia':'Đồ họa & đa phương tiện','Artificial Intelligence':'Trí tuệ nhân tạo','HCI & Ubiquitous Computing':'Tương tác người–máy & điện toán phổ biến','Interdisciplinary & Emerging':'Liên ngành & lĩnh vực mới','Practical':'Thực hành','Applied':'Ứng dụng','Machine Learning':'Học máy','Hardware':'Phần cứng','SoKs':'Tổng quan hệ thống (SoK)','Position':'Bài quan điểm','Conferences':'Hội nghị','Journals':'Tạp chí','Workshops':'Workshop','Posters':'Poster','Crypto Schools':'Trường học mật mã','Miscellaneous':'Khác','National':'Cấp quốc gia','Unranked':'Chưa xếp hạng','Not classified':'Chưa phân loại'
};
const optionLabel=name=>language==='vi'?(optionLabels[name]||name):name;
const t=key=>messages[language][key]||key;
const paths={arrow:'M4 12h16m-6-6 6 6-6 6',up:'M12 20V4m-6 6 6-6 6 6',down:'M12 4v16m-6-6 6 6 6-6',external:'M14 4h6v6m0-6-9 9M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5',calendar:'M7 3v4m10-4v4M4 10h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1M8 14h2m4 0h2m-8 3h2',shield:'M12 3 3 7v6c0 5 9 9 9 9s9-4 9-9V7zM8 12l3 3 5-6',network:'M5 7 12 3l7 4v10l-7 4-7-4ZM5 7l7 6 7-6m-7 6v8M5 17l14-10',box:'M3 7l9-4 9 4v11l-9 4-9-4ZM3 7l9 4 9-4M12 11v11M7 5l9 4',chart:'M4 3v17h17M7 15l4-5 4 2 5-7',route:'M4 6h10a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8h11M17 19l3 3-3 3M4 3v6',compass:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M16 8l-3 5-5 3 3-5Z',search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6',pin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6',download:'M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5',filter:'M4 6h16M7 12h10m-7 6h4',close:'M6 6l12 12M6 18 18 6',menu:'M4 6h16M4 12h16M4 18h16',sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',moon:'M20.5 13.1A8.7 8.7 0 0 1 10.9 3.5 8.7 8.7 0 1 0 20.5 13.1Z',monitor:'M3 4h18v13H3ZM8 21h8m-4-4v4',info:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M12 10v7m0-11v1'};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.info}"/></svg>`;
function icons(root=document){$$('[data-icon]',root).forEach(e=>e.innerHTML=icon(e.dataset.icon));}
function translateStatic(){
 document.documentElement.lang=language;
 $$('[data-t]').forEach(e=>e.textContent=t(e.dataset.t));
 $$('[data-en][data-vi]').forEach(e=>e.innerHTML=e.dataset[language]);
 const lang=$('#language');lang.textContent=language==='en'?'VI':'EN';lang.setAttribute('aria-label',t('language'));
 paintThemeButton();
 $('#menu').setAttribute('aria-label',t('menu'));
 if(page!=='home')$('.tracker-description').textContent=t(page+'Description');
}
let themeChoice='light';
function paintThemeButton(){
 const button=$('#theme');if(!button)return;
 const next={light:'dark',dark:'auto',auto:'light'}[themeChoice];
 const label=language==='vi'?`Giao diện: ${t(themeChoice)}. Chuyển sang ${t(next)}.`:`Theme: ${t(themeChoice)}. Switch to ${t(next)}.`;
 button.innerHTML=icon({light:'sun',dark:'moon',auto:'monitor'}[themeChoice]);
 button.setAttribute('aria-label',label);button.title=label;button.dataset.choice=themeChoice;
}
function shell(){
 $('#header').innerHTML=`<div class="header wrap"><a class="brand" href="${base}" aria-label="SCOAI Lab home"><img src="${base}assets/scoai-logo-transparent.png" alt="SCOAI Lab" width="1774" height="887"></a><nav class="nav" id="navigation" aria-label="Main navigation"><a href="${base}#about" data-t="about"></a><a href="${base}#research" data-t="research"></a><a href="${base}#team" data-t="team"></a><a class="nav-resources" href="${base}${page==='home'?'#resources':'conference-deadlines/'}"><span data-t="tools"></span>${icon('arrow')}</a></nav><div class="header-controls"><button id="language" class="language-button" type="button"></button><button id="theme" class="theme-button" type="button"></button><button id="menu" class="menu-toggle" aria-controls="navigation" aria-expanded="false">${icon('menu')}</button></div></div>`;
 $('#footer').innerHTML=`<div class="footer wrap"><div class="footer-top"><div><a class="brand" href="${base}" aria-label="SCOAI Lab home"><img src="${base}assets/scoai-logo-transparent.png" alt="SCOAI Lab" width="1774" height="887" loading="lazy"></a><p class="footer-tagline" data-t="built"></p></div><div class="footer-links"><a href="${base}#research" data-t="research"></a><a href="${base}conference-deadlines/" data-t="conferenceTool">Conference Deadlines</a><a href="${base}mpc-deadlines/" data-t="mpcTool">MPC Deadlines</a><a href="https://github.com/scoai-lab/scoai-lab.github.io" target="_blank" rel="noopener noreferrer">GitHub ${icon('external')}</a></div></div><div class="footer-bottom"><span data-t="rights"></span><span>© ${new Date().getFullYear()} SCOAI Lab <span aria-hidden="true"> / </span> <a href="${base}credits.html" data-t="credits"></a></span></div></div>`;
 try{themeChoice=localStorage.getItem('scoai-theme')||'light';}catch{themeChoice='light';}
 if(!['light','dark','auto'].includes(themeChoice))themeChoice='light';
 const applyTheme=()=>{document.documentElement.dataset.theme=themeChoice==='auto'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):themeChoice;try{localStorage.setItem('scoai-theme',themeChoice);}catch{}paintThemeButton();};
 $('#theme').addEventListener('click',()=>{themeChoice={light:'dark',dark:'auto',auto:'light'}[themeChoice];applyTheme();});
 matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(themeChoice==='auto')applyTheme();});
 applyTheme();
 $('#menu').addEventListener('click',()=>{const open=$('#navigation').classList.toggle('open');$('#menu').setAttribute('aria-expanded',String(open));});
 $$('#navigation a').forEach(a=>a.addEventListener('click',()=>{const wasOpen=$('#navigation').classList.contains('open');$('#navigation').classList.remove('open');$('#menu').setAttribute('aria-expanded','false');if(wasOpen)$('#menu').focus({preventScroll:true});}));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#navigation').classList.contains('open')){$('#navigation').classList.remove('open');$('#menu').setAttribute('aria-expanded','false');$('#menu').focus();}else if(e.key==='Escape'&&$('#filters')?.classList.contains('open')){$('#filters').classList.remove('open');$('#filter-toggle').setAttribute('aria-expanded','false');$('#filter-toggle').focus();}});
 $('#language').addEventListener('click',()=>{language=language==='en'?'vi':'en';save('scoai-language',language);translateStatic();if(dataset)renderTracker();});
 translateStatic();icons();
}
let dataset,visibleEntries=[],limit=24,refreshAt=Infinity;
const defaultState={q:'',groups:[],country:'',status:'all',sort:'deadline'};
let stored=read(`scoai-${page}-filters`,{});
let state={...defaultState,...(stored && typeof stored==='object'?stored:{})};
if(typeof state.q!=='string')state.q='';
if(!['all','upcoming','tba','past'].includes(state.status))state.status='all';
if(!['deadline','event','name'].includes(state.sort))state.sort='deadline';
if(!Array.isArray(state.groups))state.groups=[];
state.groups=state.groups.map(g=>Array.isArray(g)?g.filter(x=>typeof x==='string'):[]);
const localZone=Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
let zone=read('scoai-timezone',localZone);
try{new Intl.DateTimeFormat('en',{timeZone:zone});}catch{zone=localZone;}
let dateFormatter;
function dateLabel(raw){const when=instant(raw);if(!Number.isFinite(when))return t('emptyTime');return dateFormatter.format(when);}
function buildFormatter(){dateFormatter=new Intl.DateTimeFormat(language==='vi'?'vi-VN':'en-GB',{timeZone:zone,day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZoneName:'short'});}
function groupName(group){return t({'Research area':'researchArea','Research domain':'researchDomain','Publication type':'publicationType','CORE ranking':'rank'}[group.label]||group.label);}
function zoneOptions(){
 const zones=new Set([localZone,'Etc/GMT+12','UTC','Asia/Ho_Chi_Minh','Asia/Singapore','Asia/Tokyo','Europe/London','Europe/Paris','America/New_York','America/Los_Angeles']);
 if(Intl.supportedValuesOf)Intl.supportedValuesOf('timeZone').forEach(z=>zones.add(z));
 return [...zones].map(z=>`<option value="${esc(z)}" ${z===zone?'selected':''}>${esc(z==='Etc/GMT+12'?t('aoe'):z===localZone?`${t('local')} · ${z.replaceAll('_',' ')}`:z.replaceAll('_',' '))}</option>`).join('');
}
function renderTracker(){
 buildFormatter();
 const countries=[...new Set(dataset.entries.map(e=>e.country).filter(Boolean))].sort();
 $('#tracker').innerHTML=`<aside class="filter-sidebar" id="filters" aria-label="${t('filters')}"><div class="filter-heading"><h2>${t('filters')}</h2><button class="clear-button" data-clear>${t('clear')}</button><button class="filter-close" id="filter-close" aria-label="${t('closeFilters')}">${icon('close')}</button></div><div class="filter-group"><label class="form-label" for="timezone">${t('timezone')}</label><select id="timezone" class="select-control">${zoneOptions()}</select></div><div class="filter-group"><label class="form-label" for="status">${t('status')}</label><select id="status" class="select-control">${['all','upcoming','tba','past'].map(s=>`<option value="${s}" ${s===state.status?'selected':''}>${t(s)}</option>`).join('')}</select></div>${dataset.groups.map((g,i)=>`<fieldset class="filter-group"><legend>${groupName(g)}</legend>${g.options.map(o=>`<label class="filter-option"><input type="checkbox" data-group="${i}" value="${esc(o.tag)}" ${(state.groups[i]||[]).includes(o.tag)?'checked':''}><span>${esc(optionLabel(o.name))}</span></label>`).join('')}</fieldset>`).join('')}${countries.length?`<div class="filter-group"><label class="form-label" for="country">${t('country')}</label><select id="country" class="select-control"><option value="">${t('allCountries')}</option>${countries.map(c=>`<option ${state.country===c?'selected':''} value="${esc(c)}">${esc(c)}</option>`).join('')}</select></div>`:''}<button class="button primary filter-apply" id="filter-apply">${t('showResults')}</button><p class="filter-hint">${t('filterHint')}</p><div class="side-note">${icon('info')}<p>${t('confirm')}</p></div></aside><div class="results-area"><div class="search-tools"><div class="search-wrap"><label class="form-label" for="search">${t('search')}</label>${icon('search')}<input type="search" id="search" autocomplete="off" placeholder="${t('searchPlaceholder')}" value="${esc(state.q)}"></div><button class="button mobile-filter" id="filter-toggle" aria-controls="filters" aria-expanded="false">${icon('filter')}${t('filters')}</button><button class="button export-button" id="export">${icon('download')}<span class="export-label">${t('export')}</span></button></div><div class="results-toolbar"><p class="result-count" id="result-count" role="status" aria-live="polite"></p><div class="sort-control"><label for="sort">${t('sort')}</label><select id="sort">${['deadline','event','name'].map(s=>`<option value="${s}" ${state.sort===s?'selected':''}>${t(s)}</option>`).join('')}</select></div></div><div class="active-filters" id="active-filters"></div><div class="deadline-list" id="deadline-list"></div><div class="load-more" id="load-more"></div><p class="data-note">${t('updated')}: ${esc(new Intl.DateTimeFormat(language==='vi'?'vi-VN':'en-GB',{dateStyle:'medium'}).format(new Date(dataset.syncedAt)))} · ${t('source')}: <a href="${safeURL(dataset.source)}" target="_blank" rel="noopener noreferrer">${page==='mpc'?'MPC Deadlines':'Conference Deadlines / ccfddl'}</a><br>${t('snapshot')} ${t('confirm')}</p></div>`;
 $('#search').addEventListener('input',e=>{state.q=e.target.value;updateResults(true);});
 $$('[data-group]').forEach(input=>input.addEventListener('change',()=>{state.groups=dataset.groups.map((_,i)=>$$(`input[data-group="${i}"]:checked`).map(x=>x.value));updateResults(true);}));
 ['status','sort','country'].forEach(key=>{const node=$('#'+key);if(node)node.addEventListener('change',()=>{state[key]=node.value;updateResults(true);});});
 $('#timezone').addEventListener('change',e=>{zone=e.target.value;save('scoai-timezone',zone);buildFormatter();updateResults();});
 $('#filter-toggle').addEventListener('click',()=>{const open=$('#filters').classList.toggle('open');$('#filter-toggle').setAttribute('aria-expanded',String(open));if(open){$('#filters').scrollIntoView({block:'start',behavior:'auto'});$('#timezone').focus({preventScroll:true});}});
 $$('[data-clear]').forEach(b=>b.addEventListener('click',resetFilters));
 const closeFilters=()=>{$('#filters').classList.remove('open');$('#filter-toggle').setAttribute('aria-expanded','false');$('#filter-toggle').focus();};
 $('#filter-close').addEventListener('click',closeFilters);$('#filter-apply').addEventListener('click',closeFilters);
 $('#export').addEventListener('click',()=>downloadCalendar(visibleEntries));
 updateResults();
}
function resetFilters(){state={...defaultState,groups:dataset.groups.map(()=>[])};limit=24;save(`scoai-${page}-filters`,state);renderTracker();$('#search').focus({preventScroll:true});}
function timerHTML(raw){const when=instant(raw);if(!Number.isFinite(when))return '';return `<div class="timer" data-time="${when}"></div>`;}
function deadlineBlock(label,raw){return `<div class="deadline-block"><div class="small-label">${label}</div><div class="deadline-date">${esc(dateLabel(raw))}</div>${timerHTML(raw)}</div>`;}
function card(entry){
 const now=Date.now(),status=statusOf(entry,now),next=nextDeadline(entry,now),urgent=status==='upcoming'&&next-now<7*86400000;
 const rounds=(entry.deadlines||[]).map((d,i)=>({...d,round:i+1}));
 const current=rounds.find(d=>instant(d.date)>now&&Number.isFinite(instant(d.date)))||rounds.at(-1)||{};
 const rank=(entry.tags||[]).find(tag=>['A*','A','B','C','National','Unranked','Not classified'].includes(tag));
 const names=dataset.groups.flatMap(g=>g.options);
 const tags=(entry.tags||[]).filter(tag=>tag!==rank&&!['EXP','EXPCFP'].includes(tag)).slice(0,4).map(tag=>names.find(n=>n.tag===tag)?.name||tag);
 const details=rounds.length>1||entry.comment||entry.abdeadline||entry.rebut||current.comment||entry.sourceTimezone;
 let deadlineBody=status==='tba'?`<div><span class="tba-label">${t('expected')}</span><p class="tba-description">${t('expectedNote')}</p>${current.date?`<p class="tba-description">${t('previous')}: ${esc(dateLabel(current.date))}</p>`:''}</div>`:`${current.abstract?deadlineBlock(t('abstract'),current.abstract):''}${deadlineBlock(t('paper')+(rounds.length>1?` · ${t('round')} ${current.round}/${rounds.length}`:''),current.date)}`;
 return `<article class="deadline-card ${urgent?'urgent':''}" data-id="${esc(entry.id)}"><div class="deadline-card-head"><div><h2 class="conference-name"><a href="${esc(safeURL(entry.link))}" target="_blank" rel="noopener noreferrer">${esc(entry.name)} <span class="conference-year">${esc(entry.year)}</span>${icon('external')}</a></h2><p class="conference-description">${esc(entry.description)}</p></div>${rank?`<span class="rank-badge">CORE <strong>${esc(rank)}</strong></span>`:''}</div><div class="conference-meta">${entry.date?`<span>${icon('calendar')}${esc(entry.date)}</span>`:''}${entry.place?`<span>${icon('pin')}${esc(entry.place)}</span>`:''}</div><div class="card-deadlines">${deadlineBody}</div><div class="card-bottom"><div class="card-tags">${tags.map(tag=>`<span>${esc(optionLabel(tag))}</span>`).join('')}</div>${status==='upcoming'?`<button class="card-calendar" data-calendar="${esc(entry.id)}" aria-label="${t('addCalendar')}: ${esc(entry.name)}" title="${t('addCalendar')}">${icon('calendar')}</button>`:''}</div>${details?`<details class="card-details"><summary>${t('details')}</summary>${entry.sourceTimezone?`<p>${t('sourceZone')}: ${esc(entry.sourceTimezone)}</p>`:''}${entry.abdeadline?`<p><strong>${t('abstractNote')}:</strong> ${esc(entry.abdeadline)} <span>(${t('sourceZone')})</span></p>`:''}${entry.rebut?`<p><strong>${t('rebuttal')}:</strong> ${esc(entry.rebut)}</p>`:''}${entry.comment?`<p>${esc(entry.comment)}</p>`:''}${rounds.map(d=>`<div class="round-row"><strong>${t('round')} ${d.round}</strong> · ${t('paper')}: ${esc(dateLabel(d.date))}${d.abstract?`<br>${t('abstract')}: ${esc(dateLabel(d.abstract))}`:''}${d.comment?`<p>${esc(d.comment)}</p>`:''}</div>`).join('')}</details>`:''}</article>`;
}
function updateResults(reset=false){
 const openCards=new Set($$('.deadline-card:has(details[open])').map(e=>e.dataset.id));
 const focused=document.activeElement;
 const focusedCard=focused?.closest('.deadline-card')?.dataset.id;
 const focusSelector=focused?.matches('summary')?'summary':focused?.matches('[data-calendar]')?'[data-calendar]':null;
 refreshAt=Math.min(Infinity,...dataset.entries.map(e=>nextDeadline(e)));
 if(reset)limit=24;save(`scoai-${page}-filters`,state);
 visibleEntries=selectEntries(dataset.entries,state);
 $('#filter-apply').textContent=`${t('showResults')} (${visibleEntries.length})`;
 $('#result-count').innerHTML=`<strong>${visibleEntries.length}</strong> ${t('conferences')} <span>· ${t('showing')} ${Math.min(limit,visibleEntries.length)} ${t('of')} ${visibleEntries.length}</span>`;
 const chips=dataset.groups.flatMap((g,i)=>(state.groups[i]||[]).map(tag=>({group:i,tag,name:g.options.find(o=>o.tag===tag)?.name||tag})));
 $('#active-filters').innerHTML=chips.map(c=>`<button class="filter-chip" data-chip-group="${c.group}" data-chip-tag="${esc(c.tag)}" aria-label="${t('clear')}: ${esc(optionLabel(c.name))}">${esc(optionLabel(c.name))}${icon('close')}</button>`).join('');
 $$('[data-chip-group]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.chipGroup);state.groups[i]=state.groups[i].filter(x=>x!==b.dataset.chipTag);$$(`input[data-group="${i}"]`).forEach(input=>{input.checked=state.groups[i].includes(input.value);});updateResults(true);$('#search').focus({preventScroll:true});}));
 $('#deadline-list').innerHTML=visibleEntries.length?visibleEntries.slice(0,limit).map(card).join(''):`<div class="empty-state">${icon('search')}<h2>${t('noResults')}</h2><p>${t('tryFilters')}</p><button class="button" id="empty-reset">${t('clear')}</button></div>`;
 $('#empty-reset')?.addEventListener('click',resetFilters);
 $('#load-more').innerHTML=limit<visibleEntries.length?`<button class="button" id="more">${t('loadMore')} ${icon('down')}</button>`:'';
 $('#more')?.addEventListener('click',()=>{const previousLimit=limit;limit+=24;updateResults();const nextCard=$$('.deadline-card')[previousLimit];if(nextCard)$('a',nextCard)?.focus({preventScroll:true});});
 $$('[data-calendar]').forEach(b=>b.addEventListener('click',()=>downloadCalendar(dataset.entries.filter(e=>e.id===b.dataset.calendar))));
 $$('.deadline-card').forEach(e=>{if(openCards.has(e.dataset.id)&&$('details',e))$('details',e).open=true;if(e.dataset.id===focusedCard&&focusSelector)$(focusSelector,e)?.focus({preventScroll:true});});
 tick();
}
function tick(){
 const now=Date.now();
 if(dataset&&now>=refreshAt){updateResults();return;}
 $$('[data-time]').forEach(el=>{const when=Number(el.dataset.time),c=countdown(when,now);el.className='timer'+(c.expired?' expired':when-now<7*86400000?' urgent':'');el.innerHTML=c.expired?t('closed'):`${c.days}<small>${t('days')}</small> ${String(c.hours).padStart(2,'0')}<small>${t('hours')}</small> ${String(c.minutes).padStart(2,'0')}<small>${t('minutes')}</small> ${String(c.seconds).padStart(2,'0')}<small>${t('seconds')}</small>`;});
}
let toastTimeout;
function toast(message){$('.toast')?.remove();const e=document.createElement('div');e.className='toast';e.setAttribute('role','status');e.textContent=message;document.body.append(e);clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>e.remove(),5000);}
function downloadCalendar(entries){
 const content=calendar(entries);if(!content.includes('BEGIN:VEVENT')){toast(t('noCalendar'));return;}
 const blob=new Blob([content],{type:'text/calendar;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`scoai-${page}-deadlines.ics`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast(t('calendarReady'));
}
async function load(){
 try{
   const response=await fetch(`${base}data/${page}.json`);if(!response.ok)throw Error(response.status);
   const data=await response.json();if(!Array.isArray(data.entries)||!Array.isArray(data.groups))throw Error('Invalid data');
   dataset=data;state.groups=dataset.groups.map((g,i)=>(state.groups[i]||[]).filter(tag=>g.options.some(o=>o.tag===tag)));renderTracker();
 }catch{ $('#tracker').innerHTML=`<div class="empty-state" style="grid-column:1/-1">${icon('info')}<h2>${t('loadError')}</h2><p>${t('loadErrorText')}</p><button id="retry" class="button">${t('retry')}</button></div>`;$('#retry').addEventListener('click',load); }
}
shell();
if(['conference','mpc'].includes(page)){load();setInterval(()=>{if(!document.hidden)tick();},1000);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&dataset)tick();});}
