'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let lang;try{lang=new URLSearchParams(location.search).get('lang')||localStorage.getItem('grid-language')||'en'}catch{lang='en'}
if(!['en','zh'].includes(lang))lang='en';
let theme=document.documentElement.dataset.theme==='dark'?'dark':'light';
function renderTheme(){
 const dark=theme==='dark';document.documentElement.dataset.theme=theme;
 const label=lang==='zh'?(dark?'切换到日间模式':'切换到夜间模式'):(dark?'Switch to Light Mode':'Switch to Dark Mode');
 $('#theme-toggle').setAttribute('aria-pressed',String(dark));$('#theme-toggle').setAttribute('aria-label',label);$('#theme-toggle').title=label;
 $('meta[name="theme-color"]').content=dark?'#101722':'#ffffff';
}
$('#theme-toggle').addEventListener('click',()=>{theme=theme==='dark'?'light':'dark';try{localStorage.setItem('grid-theme',theme)}catch{}renderTheme()});
const pair=(en,zh)=>({en,zh});
const dimensions=EVALUATION_DIMENSIONS;
const state={dimension:0};
function text(selector,value){$(selector).textContent=value}
function animate(element){if(!reduced.matches)element.animate([{opacity:.3,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'ease-out'})}
function renderGroup(group){
 $$(`[data-${group}]`).forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset[group]===state[group])));
 if(group==='dimension'){
  const d=dimensions[state.dimension];
  ['level','title','copy'].forEach(k=>text('#dimension-'+k,d[k][lang]));
  $('#dimension-items').replaceChildren(...d.items.map(item=>{
   const li=document.createElement('li');li.dataset.subdimension=item.id;
   li.classList.toggle('embodiment-related',item.embodied);
   if(item.embodied)li.title=lang==='zh'?'具身相关子维度':'Embodiment-related sub-dimension';
   const name=document.createElement('strong');name.className='dimension-name';name.textContent=item.name[lang];
   const definition=document.createElement('span');definition.className='dimension-definition';definition.textContent=item.definition[lang];
   li.append(name,definition);return li;
  }));
 }
}

function renderLanguage(){
 document.documentElement.lang=lang==='zh'?'zh-CN':'en';$('.masthead nav').setAttribute('aria-label',lang==='zh'?'主导航':'Main Navigation');$('.contents nav').setAttribute('aria-label',lang==='zh'?'本页目录':'On This Page');document.title=lang==='zh'?'展望 Agentic Robotics · 理格万物':'Envisioning Agentic Robotics · Grid Robotics';
 $('.hero-resources').setAttribute('aria-label',lang==='zh'?'论文资源':'Paper resources');
 $('.hero-paper').title=lang==='zh'?'阅读论文（PDF）':'Read the Paper (PDF)';
 const brandName=lang==='zh'?'理格万物':'Grid Robotics';
 $$('.brand,.footer-brand').forEach(link=>link.setAttribute('aria-label',brandName));
 $$('meta[name="application-name"],meta[name="apple-mobile-web-app-title"]').forEach(meta=>meta.content=brandName);
 $('#site-manifest').href='assets/brand/site'+(lang==='zh'?'-zh':'')+'.webmanifest?v=20261112-final18';
 $$('[data-i18n]').forEach(e=>{const entry=COPY[e.dataset.i18n];if(entry)e.innerHTML=entry[lang]});
 $$('[data-alt]').forEach(e=>e.alt=COPY[e.dataset.alt][lang]);
 $$('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));$$('.table-scroll').forEach((e,i)=>e.setAttribute('aria-label',(lang==='zh'?['已报道的比较结果','基准覆盖范围']:['Reported Comparisons','Benchmark Coverage'])[i]));
 $$('[data-project-link]').forEach(link=>{
  const url=new URL(link.getAttribute('href'),location.href);
  if(link.matches('.header-join')){link.href=url.hash;return;}
  url.search=location.search;
  url.searchParams.set('lang',lang);
  link.href=url.pathname.split('/').pop()+url.search+url.hash;
 });
 Object.keys(state).forEach(renderGroup);renderTheme();
 window.FigureViewer?.refreshLanguage();

}
$$('[data-lang]').forEach(b=>b.addEventListener('click',()=>{lang=b.dataset.lang;try{localStorage.setItem('grid-language',lang)}catch{}const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);renderLanguage()}));
Object.keys(state).forEach(group=>$$(`[data-${group}]`).forEach(b=>b.addEventListener('click',()=>{state[group]=+b.dataset[group];renderGroup(group);const selector={dimension:'.dimension-detail'}[group];animate($(selector))})));
const links=$$('.contents nav a'),sections=links.map(a=>$(a.hash));let pending=false,anchorSelection=null;
// Preserve the clicked destination when adjacent final sections share the same scroll limit.
document.addEventListener('click',event=>{const a=event.target.closest('a[href^="#"]');if(a){anchorSelection=links.some(link=>link.hash===a.hash)?a.hash.slice(1):null;requestAnimationFrame(updatePosition)}});
const releaseAnchor=()=>{anchorSelection=null};
addEventListener('wheel',releaseAnchor,{passive:true});addEventListener('touchstart',releaseAnchor,{passive:true});addEventListener('pointerdown',releaseAnchor,{passive:true});
addEventListener('keydown',event=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))releaseAnchor()});
addEventListener('hashchange',()=>{if(links.some(a=>a.hash===location.hash)){anchorSelection=location.hash.slice(1);updatePosition()}});
function updatePosition(){let id=sections[0].id;const threshold=$('.masthead').getBoundingClientRect().bottom+64;for(const s of sections)if(s.getBoundingClientRect().top<threshold)id=s.id;if(scrollY+innerHeight>=document.documentElement.scrollHeight-2)id=sections.at(-1).id;if(anchorSelection)id=anchorSelection;links.forEach(a=>{const active=a.hash==='#'+id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});$$('.nav-group').forEach(group=>group.classList.toggle('current',!!group.querySelector('a.active')));const contents=$('.contents'),active=links.find(a=>a.classList.contains('active'));if(active&&contents.offsetParent){const a=active.getBoundingClientRect(),c=contents.getBoundingClientRect();if(a.top<c.top+8)contents.scrollTop-=c.top+8-a.top;else if(a.bottom>c.bottom-8)contents.scrollTop+=a.bottom-c.bottom+8;}const max=document.documentElement.scrollHeight-innerHeight;$('.reading-progress i').style.width=(max>0?Math.min(100,scrollY/max*100):100)+'%';pending=false}
addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(updatePosition)}},{passive:true});addEventListener('resize',updatePosition);renderLanguage();updatePosition();

// Hover previews an explanation; click or keyboard activation keeps it open.
(() => {
 const hover=matchMedia('(hover:hover) and (pointer:fine)');
 document.querySelectorAll('.conclusion-detail').forEach(detail=>{
  const summary=detail.querySelector('summary');let pinned=false,keyboard=false;
  summary.addEventListener('click',event=>{event.preventDefault();pinned=!pinned;detail.open=pinned});
  detail.addEventListener('pointerenter',event=>{if(hover.matches&&!keyboard&&event.pointerType!=='touch')detail.open=true});
  detail.addEventListener('pointerleave',()=>{if(!pinned&&!detail.contains(document.activeElement))detail.open=false});
  detail.addEventListener('pointermove',event=>{if(event.movementX||event.movementY)keyboard=false});
  detail.addEventListener('focusin',()=>{detail.open=true});
  detail.addEventListener('focusout',event=>{if(!pinned&&!detail.contains(event.relatedTarget))detail.open=false});
  detail.addEventListener('keydown',event=>{keyboard=true;if(event.key==='Escape'){event.preventDefault();pinned=false;summary.focus();detail.open=false}});
 });
})();
