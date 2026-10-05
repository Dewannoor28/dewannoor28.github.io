(() => {
  const D = window.PORTFOLIO_DATA || PORTFOLIO_DATA;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const slug = s => s.toLowerCase().normalize('NFKD').replace(/[–—]/g,'-').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const page = document.body.dataset.page || 'home';

  // Theme
  const savedTheme = localStorage.getItem('dn-theme-v4');
  document.documentElement.dataset.theme = savedTheme || 'light';
  const themeBtn = $('#theme-toggle');
  const paintTheme = () => { if(themeBtn) themeBtn.textContent = document.documentElement.dataset.theme === 'light' ? '☀' : '☾'; };
  paintTheme();
  themeBtn?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next; localStorage.setItem('dn-theme-v4', next); paintTheme();
  });

  // Mobile nav
  const menuBtn = $('#menu-toggle'), mobileNav = $('#mobile-nav');
  const setMenu = open => {
    if(!mobileNav || !menuBtn) return;
    mobileNav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuBtn.textContent = open ? '×' : '≡';
  };
  menuBtn?.setAttribute('aria-expanded','false');
  menuBtn?.setAttribute('aria-controls','mobile-nav');
  menuBtn?.addEventListener('click', e => { e.stopPropagation(); setMenu(!mobileNav?.classList.contains('open')); });
  $$('#mobile-nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', e => { if(mobileNav?.classList.contains('open') && !mobileNav.contains(e.target) && e.target !== menuBtn) setMenu(false); });
  addEventListener('resize', () => { if(innerWidth > 980) setMenu(false); }, {passive:true});

  // Header + progress
  const onScroll = () => {
    $('.site-header')?.classList.toggle('scrolled', scrollY > 18);
    const h = document.documentElement.scrollHeight - innerHeight;
    const pct = h > 0 ? (scrollY / h) * 100 : 0;
    const bar = $('.progress'); if(bar) bar.style.width = pct + '%';
  };
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // Active page nav
  $$('[data-nav]').forEach(a => { if(a.dataset.nav === page) a.classList.add('active'); });

  // Cursor
  if (matchMedia('(pointer:fine)').matches) {
    const c = $('.cursor'), d = $('.cursor-dot');
    addEventListener('mousemove', e => { if(c){c.style.left=e.clientX+'px';c.style.top=e.clientY+'px'} if(d){d.style.left=e.clientX+'px';d.style.top=e.clientY+'px'} });
    $$('a,button,.gallery-item,.card').forEach(el => { el.addEventListener('mouseenter',()=>c?.classList.add('hover')); el.addEventListener('mouseleave',()=>c?.classList.remove('hover')); });
  }

  // Canvas coding network
  const canvas = $('#code-canvas');
  if (canvas && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d'); let nodes=[]; let raf; let mx=-999,my=-999;
    const resize = () => { const dpr=Math.min(devicePixelRatio||1,2); canvas.width=innerWidth*dpr; canvas.height=innerHeight*dpr; canvas.style.width=innerWidth+'px'; canvas.style.height=innerHeight+'px'; ctx.setTransform(dpr,0,0,dpr,0,0); nodes=Array.from({length:Math.min(matchMedia('(pointer:coarse)').matches?34:70,Math.max(14,Math.floor(innerWidth/20)))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18})); };
    const draw = () => { ctx.clearRect(0,0,innerWidth,innerHeight); ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#79ffc1'; nodes.forEach((n,i)=>{ n.x+=n.vx;n.y+=n.vy;if(n.x<0||n.x>innerWidth)n.vx*=-1;if(n.y<0||n.y>innerHeight)n.vy*=-1; const dist=Math.hypot(n.x-mx,n.y-my); if(dist<120){n.x+=(n.x-mx)*.003;n.y+=(n.y-my)*.003} ctx.globalAlpha=.28;ctx.beginPath();ctx.arc(n.x,n.y,1.5,0,Math.PI*2);ctx.fill(); for(let j=i+1;j<nodes.length;j++){const o=nodes[j],dd=Math.hypot(n.x-o.x,n.y-o.y);if(dd<120){ctx.globalAlpha=(1-dd/120)*.09;ctx.beginPath();ctx.moveTo(n.x,n.y);ctx.lineTo(o.x,o.y);ctx.strokeStyle=ctx.fillStyle;ctx.stroke()}} }); ctx.globalAlpha=1; raf=requestAnimationFrame(draw); };
    resize(); draw(); addEventListener('resize',resize); addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY},{passive:true});
  }

  // Reveal animations
  const io = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } }), {threshold:.12});
  $$('.reveal,.stagger').forEach(el => io.observe(el));

  // v8 Smart scene scroll: section-by-section on desktop, native touch scroll on mobile.
  if(page==='home' && innerWidth>1100 && matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    const scenes=$$('main > .hero, main > .section');
    const sceneLabels=['home','about','research','projects','publications','stack','terminal','education','leadership','milestones','gallery','contact'];
    const rail=document.createElement('nav'); rail.className='section-rail'; rail.setAttribute('aria-label','Homepage sections');
    rail.innerHTML=scenes.map((_,i)=>`<button class="section-dot${i===0?' active':''}" type="button" data-index="${i}" data-label="${sceneLabels[i]||('section '+(i+1))}" aria-label="Go to ${sceneLabels[i]||('section '+(i+1))}"></button>`).join('');
    document.body.appendChild(rail);
    const dots=$$('.section-dot',rail); let current=0, lock=false, unlockTimer;
    const mark=i=>{current=Math.max(0,Math.min(scenes.length-1,i));dots.forEach((d,n)=>d.classList.toggle('active',n===current));scenes.forEach((scene,n)=>scene.classList.toggle('scene-current',n===current));};
    const visibleIndex=()=>{
      let best=0,dist=Infinity;
      scenes.forEach((s,i)=>{const r=s.getBoundingClientRect(),d=Math.abs(r.top-76);if(d<dist){dist=d;best=i}});return best;
    };
    const go=i=>{
      i=Math.max(0,Math.min(scenes.length-1,i)); if(i===current && Math.abs(scenes[i].getBoundingClientRect().top-76)<8)return;
      mark(i); lock=true; document.body.classList.add('section-transitioning'); scenes[i].scrollIntoView({behavior:'smooth',block:'start'});
      clearTimeout(unlockTimer); unlockTimer=setTimeout(()=>{lock=false;document.body.classList.remove('section-transitioning')},820);
    };
    dots.forEach((d,i)=>d.addEventListener('click',()=>go(i)));
    const observer=new IntersectionObserver(entries=>{if(lock)return;const hit=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(hit)mark(scenes.indexOf(hit.target));},{threshold:[.25,.45,.65]});
    scenes.forEach(s=>observer.observe(s));
    addEventListener('wheel',e=>{
      if(lock || Math.abs(e.deltaY)<22 || e.ctrlKey || e.metaKey) return;
      if(e.target.closest('input,textarea,.terminal,.command,.image-modal,[data-native-scroll]')) return;
      const i=visibleIndex(), s=scenes[i], r=s.getBoundingClientRect();
      // Tall scenes keep native scrolling until the active edge is reached.
      const tall=r.height>innerHeight*1.06;
      const header=76, bottomGap=r.bottom-innerHeight;
      if(tall){
        if(e.deltaY>0 && bottomGap>22) return;
        if(e.deltaY<0 && r.top<header-22) return;
      }
      const next=i+(e.deltaY>0?1:-1);
      if(next<0||next>=scenes.length) return;
      e.preventDefault(); go(next);
    },{passive:false});
  }

  // Boot intro on homepage (visible on refresh; cache-busted in v7)
  const boot = $('#boot');
  if (boot) {
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){ boot.remove(); document.body.classList.remove('is-booting'); }
    else {
      const lines = [
        ['dewan@portfolio:~$ ./initialize.sh',''],
        ['[✓] profile.loaded','ok'],['[✓] research.loaded','ok'],['[✓] projects.loaded','ok'],['[✓] publications.loaded','ok'],['[✓] interface.connected','ok'],
        ['launching PORTFOLIO_OS ...','dim']
      ];
      const log=$('#boot-log'); let i=0;
      const next=()=>{ if(i<lines.length){ const p=document.createElement('div');p.className='boot-line '+lines[i][1];p.textContent=lines[i][0];log.appendChild(p);i++;setTimeout(next,i===1?300:220);} else setTimeout(()=>{boot.classList.add('hidden');document.body.classList.remove('is-booting');setTimeout(()=>boot.remove(),700)},450)}; next();
    }
  }

  // Command palette
  const commands = [
    ['Home','index.html','⌂'],['Research','research.html','R'],['Publications','publications.html','P'],['Projects','projects.html','⌘'],['Experience','experience.html','E'],['Education','education.html','ED'],['Achievements','achievements.html','A'],
    ['Download CV', D.site.cvFile, '↓'],['GitHub', D.socialLinks.find(x=>x.label==='GitHub')?.url,'↗'],['Google Scholar',D.socialLinks.find(x=>x.label==='Google Scholar')?.url,'↗'],['Email','mailto:'+D.site.email,'@']
  ].filter(x=>x[1]);
  const cmd=$('#command'), input=$('#command-input'), results=$('#command-results');
  const renderCommands=(q='')=>{ if(!results)return; const f=commands.filter(c=>c[0].toLowerCase().includes(q.toLowerCase()));results.innerHTML=f.map((c,i)=>`<a class="command-item ${i===0?'active':''}" href="${esc(c[1])}" ${/^https?:/.test(c[1])?'target="_blank" rel="noopener"':''}><span>${esc(c[0])}</span><span>${esc(c[2])}</span></a>`).join(''); };
  renderCommands();
  const openCmd=()=>{cmd?.classList.add('open');input?.focus();renderCommands('')}; const closeCmd=()=>cmd?.classList.remove('open');
  $$('#command-open,[data-command-open]').forEach(x=>x.addEventListener('click',openCmd)); cmd?.addEventListener('click',e=>{if(e.target===cmd)closeCmd()}); input?.addEventListener('input',e=>renderCommands(e.target.value));
  addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();cmd?.classList.contains('open')?closeCmd():openCmd()}if(e.key==='Escape')closeCmd()});

  // Footer year
  $$('.js-year').forEach(el=>el.textContent=new Date().getFullYear());

  // Shared social rendering — v8 icon-first links with click animation
  const socialSVG = label => {
    const key=String(label||'').toLowerCase();
    if(key.includes('linkedin')) return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="8" cy="9" r="1.25" fill="currentColor"/><path d="M7 11.2v5.8M11 17v-5.8m0 2.5c.55-1.8 4.7-2.05 4.7 1.2V17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
    if(key.includes('github')) return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5a3 3 0 0 0 0 6h8a3 3 0 0 0 0-6M9 18.5a3 3 0 0 0 0-6h6a3 3 0 0 0 0 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M8.3 8.5h7.4M9 15.5h6" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>`;
    if(key.includes('scholar')) return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9.2 12 4l8.5 5.2L12 14.4 3.5 9.2Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M6.5 11.2v4.2c2.9 2.2 8.1 2.2 11 0v-4.2M20.5 9.2v5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`;
    if(key.includes('orcid')) return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><text x="12" y="15" text-anchor="middle" font-size="8">iD</text></svg>`;
    if(key.includes('researchgate')) return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><text x="12" y="15" text-anchor="middle" font-size="7.5">RG</text></svg>`;
    if(key.includes('facebook')) return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M13.2 18v-5h2l.35-2.25h-2.35V9.3c0-.65.22-1.1 1.18-1.1h1.3V6.2c-.5-.08-1.08-.14-1.77-.14-1.75 0-2.95 1.07-2.95 3.03v1.66H9v2.25h1.96v5" fill="currentColor"/></svg>`;
    if(key.includes('whatsapp')) return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 19.2 6 16.4A7.6 7.6 0 1 1 9.1 19l-3.9.2Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 8.2c.2-.45.42-.46.72-.47h.35c.15 0 .33.03.43.27l.7 1.64c.08.2.06.37-.07.55l-.5.62c-.14.17-.1.34-.02.48.44.82 1.06 1.48 1.84 2 .19.12.37.2.55.02l.73-.86c.17-.2.36-.17.56-.08l1.55.74c.22.1.36.17.4.31.04.15-.02.82-.44 1.36-.42.55-1.2.82-1.78.82-.58 0-1.46-.16-2.72-.74-1.34-.62-2.54-1.62-3.39-2.8-.84-1.16-1.32-2.39-1.32-3.2 0-.81.3-1.26.41-1.43Z" fill="currentColor"/></svg>`;
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9 12h6m-3-3 3 3-3 3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  };
  const socialColor = label => {
    const key=String(label||'').toLowerCase();
    if(key.includes('linkedin')) return '#0a66c2';
    if(key.includes('github')) return '#596579';
    if(key.includes('scholar')) return '#4968d7';
    if(key.includes('orcid')) return '#79a700';
    if(key.includes('researchgate')) return '#00a88f';
    if(key.includes('facebook')) return '#1877f2';
    if(key.includes('whatsapp')) return '#25d366';
    return 'var(--accent)';
  };
  const socials = (target, limit=null) => {
    const el=$(target); if(!el)return;
    const list=limit?D.socialLinks.slice(0,limit):D.socialLinks;
    el.innerHTML=list.map(x=>`<a class="social-link" style="--social-accent:${socialColor(x.label)}" href="${esc(x.url)}" target="_blank" rel="noopener" aria-label="Open ${esc(x.label)} profile"><span class="social-icon">${socialSVG(x.label)}</span><span class="social-label">${esc(x.label)}</span></a>`).join('');
    $$('.social-link',el).forEach(a=>a.addEventListener('click',()=>{a.classList.remove('social-clicked');void a.offsetWidth;a.classList.add('social-clicked');setTimeout(()=>a.classList.remove('social-clicked'),800)}));
  };
  socials('#hero-social',5); socials('#footer-social');

  const typeWords = ['working on AI/ML research','interning in mobile app security'];
  const typeEl=$('#typing-role');
  if(typeEl){
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduced){
      let i=0;
      typeEl.textContent=typeWords[0];
      setInterval(()=>{i=(i+1)%typeWords.length;typeEl.classList.remove('status-crossfade');void typeEl.offsetWidth;typeEl.textContent=typeWords[i];typeEl.classList.add('status-crossfade')},2600);
    } else {
      let wi=0,ci=0,del=false;
      const tick=()=>{const w=typeWords[wi];typeEl.textContent=w.slice(0,ci);if(!del&&ci<w.length)ci++;else if(!del){del=true;return setTimeout(tick,1350)}else if(ci>0)ci--;else{del=false;wi=(wi+1)%typeWords.length}setTimeout(tick,del?30:58)};
      tick();
    }
  }

  const typeHeroCode=()=>{
    const box=$('#hero-code'); if(!box) return;
    const lines=[
      {indent:'', key:'const', raw:' current = {'},
      {indent:'  ', key:'research', raw: ': "AI/ML + HAR",'},
      {indent:'  ', key:'internship', raw: ': "Byte Capsule",'},
      {indent:'  ', key:'track', raw: ': "Mobile App Security",'},
      {indent:'  ', key:'status', raw: ': "building + learning"'},
      {indent:'', key:'', raw:'};'}
    ];
    const render=()=>{
      box.innerHTML='';
      lines.forEach((line,i)=>{
        const row=document.createElement('div');
        row.className='code-line';
        row.style.setProperty('--delay',`${i*0.42}s`);
        const visibleText=(line.indent + (line.key?line.key:'') + line.raw).replace(/\s/g,' ').trim();
        row.style.setProperty('--chars', Math.max(10, visibleText.length));
        if(line.key==='const') row.innerHTML=`<span class="k">const</span><span class="plain"> current = {</span>`;
        else if(line.key){
          const m=line.raw.match(/: (.+?)(,)?$/);
          const val=m?m[1]:line.raw;
          const comma=(m&&m[2])?m[2]:'';
          row.innerHTML=`<span class="plain">${line.indent}</span><span class="key2">${line.key}</span><span class="plain">: </span><span class="v">${val}</span><span class="plain">${comma}</span>`;
        } else row.innerHTML=`<span class="plain">};</span>`;
        box.appendChild(row);
      });
    };
    render();
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(render, 7600);
  };
  typeHeroCode();

  const renderMetrics=()=>{const el=$('#hero-metrics');if(!el)return;el.innerHTML=D.hero.highlights.map(x=>`<div class="metric"><strong data-count="${esc(x.value)}">0</strong><span>${esc(x.label)}</span></div>`).join('');const counterIO=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const n=e.target, raw=n.dataset.count, target=parseFloat(raw); if(Number.isNaN(target)){n.textContent=raw;return} let start=0; const dur=900,t0=performance.now(); const f=t=>{const p=Math.min(1,(t-t0)/dur),v=target*p; n.textContent=raw.includes('.')?v.toFixed(2):Math.round(v); if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f);counterIO.unobserve(n)}),{threshold:.5});$$('[data-count]').forEach(x=>counterIO.observe(x))};

  const renderMarquee=()=>{const el=$('#marquee-track');if(!el)return;const words=D.about.focusAreas;el.innerHTML=[...words,...words].map(x=>`<span>${esc(x)}</span>`).join('')};
  const renderResearchRows=(target='#research-rows', limit=null)=>{const el=$(target);if(!el)return;const rows=(limit?D.researchStory.steps.slice(0,limit):D.researchStory.steps);el.innerHTML=rows.map(s=>`<article class="research-row"><div class="num">${esc(s.number)}</div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></article>`).join('')};
  const renderProjects=(target='#project-grid', mode='featured')=>{const el=$(target);if(!el)return;const list=mode==='featured'?D.projects.filter(x=>x.featured):D.projects;el.innerHTML=list.map((p,i)=>`<article class="card project-card"><span class="project-code">${String(i+1).padStart(2,'0')}</span><div class="card-kicker">${esc(p.category)}</div><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><div class="stack">${p.stack.map(s=>`<span>${esc(s)}</span>`).join('')}</div><div class="card-links"><a href="project.html?id=${encodeURIComponent(slug(p.title))}">Case study →</a><a href="${esc(p.link)}" target="_blank" rel="noopener">GitHub ↗</a></div></article>`).join('')};
  const renderPubs=(target='#publication-list', filter='all')=>{const el=$(target);if(!el)return;const list=D.publications.filter(p=>filter==='all'||p.status.toLowerCase().includes(filter.toLowerCase()));el.innerHTML=list.map(p=>`<article class="publication"><div class="year">${esc(p.year)}<br><small>${esc(p.status)}</small></div><div><h3>${esc(p.title)}</h3><p>${esc(p.venue)}</p><p>${esc(p.role||'')}</p><div class="stack">${(p.tags||[]).slice(0,5).map(t=>`<span>${esc(t)}</span>`).join('')}</div></div><div class="pub-actions"><a class="mini-btn" href="publication.html?id=${encodeURIComponent(slug(p.title))}">Details</a>${p.doi?`<a class="mini-btn" href="${esc(p.doi)}" target="_blank" rel="noopener">DOI ↗</a>`:''}</div></article>`).join('')||'<div class="empty">No publications in this filter.</div>'};
  const renderEducation=()=>{const el=$('#education-grid');if(!el)return;el.innerHTML=D.education.map(x=>`<article class="media-card text-only"><div class="body"><div class="role">${esc(x.period)}</div><h3>${esc(x.degree)}</h3><p><b>${esc(x.institution)}</b></p><p>${esc(x.result)}</p><p>${esc(x.details)}</p></div></article>`).join('')};
  const renderSkills=()=>{const j=$('#skills-json'),g=$('#skill-cloud'); if(j){const entries=Object.entries(D.skills).slice(0,5);j.innerHTML=`<span class="brace">{</span>\n${entries.map(([k,v])=>`  <span class="key">"${esc(k)}"</span>: [\n${v.slice(0,6).map((x,i)=>`    <span class="str">"${esc(x)}"</span>${i<v.slice(0,6).length-1?',':''}`).join('\n')}\n  ]`).join(',\n')}\n<span class="brace">}</span>`} if(g){g.innerHTML=Object.entries(D.skills).map(([k,v])=>`<div class="skill-box"><h4>${esc(k)}</h4><p>${v.join(' · ')}</p></div>`).join('')}};
  const renderLeadership=()=>{const el=$('#leadership-grid');if(!el)return;el.innerHTML=D.leadership.map(x=>`<article class="media-card ${x.image?'':'text-only'}">${x.image?`<img src="${esc(x.image)}" alt="${esc(x.organization)}" loading="lazy">`:''}<div class="body"><div class="role">${esc(x.currentRole)} · ${esc(x.period)}</div><h3>${esc(x.organization)}</h3><p>${esc(x.description)}</p>${x.roles?.length?`<p>${x.roles.map(r=>'• '+esc(r)).join('<br>')}</p>`:''}</div></article>`).join('')};
  const renderAchievements=()=>{const el=$('#achievement-grid');if(!el)return;el.innerHTML=D.achievements.map(x=>`<article class="media-card"><img src="${esc(x.image)}" alt="${esc(x.title)}" loading="lazy"><div class="body"><div class="role">${esc(x.subtitle)}</div><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p></div></article>`).join('')};
  const renderGallery=()=>{const el=$('#gallery-grid');if(!el)return;el.innerHTML=D.gallery.map(x=>`<figure class="gallery-item" data-img="${esc(x.image)}" data-title="${esc(x.title)}"><img src="${esc(x.image)}" alt="${esc(x.title)}" loading="lazy"><figcaption class="gallery-caption"><span>${esc(x.category)}</span><h4>${esc(x.title)}</h4></figcaption></figure>`).join('');$$('.gallery-item').forEach(it=>it.addEventListener('click',()=>{const m=$('#image-modal');$('#modal-image').src=it.dataset.img;$('#modal-image').alt=it.dataset.title;m?.classList.add('open')}))};
  $('#modal-close')?.addEventListener('click',()=>$('#image-modal')?.classList.remove('open'));$('#image-modal')?.addEventListener('click',e=>{if(e.target.id==='image-modal')e.currentTarget.classList.remove('open')});

  const renderExperience=(target='#experience-timeline')=>{const el=$(target);if(!el)return;const items=D.experience.map(x=>({period:x.period,title:x.title,sub:x.organization,text:x.bullets.join(' '),skills:x.skills||[]}));el.innerHTML=items.map((x,i)=>`<article class="git-item"><div class="hash">commit ${('exp'+(i+1)+'2026').padEnd(10,'0')} · ${esc(x.period)}</div><h3>${esc(x.title)}</h3><p><b>${esc(x.sub)}</b></p><p>${esc(x.text)}</p>${x.skills.length?`<div class="stack">${x.skills.map(s=>`<span>${esc(s)}</span>`).join('')}</div>`:''}</article>`).join('')};

  const setupTerminal=()=>{const input=$('#terminal-input'), out=$('#terminal-output');if(!input||!out)return;const cmds={help:'about  research  projects  publications  experience  education  achievements  contact  clear',about:'Dewan Nafiul Islam Noor — CSE postgraduate researcher working across AI, computer vision, healthcare AI, cybersecurity and software systems.',research:'Opening research...',projects:'Opening projects...',publications:'Opening publications...',experience:'Opening experience...',education:'Opening education...',achievements:'Opening achievements...',contact:`email: ${D.site.email}`};input.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const c=input.value.trim().toLowerCase();out.textContent+=`\ndewan@portfolio:~$ ${c}\n`;if(c==='clear'){out.textContent='';input.value='';return}out.textContent+=(cmds[c]||`command not found: ${c}. type 'help'.`)+'\n';input.value='';const pages={research:'research.html',projects:'projects.html',publications:'publications.html',experience:'experience.html',education:'education.html',achievements:'achievements.html'};if(pages[c])setTimeout(()=>location.href=pages[c],450);out.parentElement.scrollTop=out.parentElement.scrollHeight})};

  // Stronger scroll motion for dynamically-rendered portfolio items
  const registerDynamicMotion=()=>{
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items=$$('.card,.publication,.research-row,.git-item,.education-grid > article,.skill-box,.media-card');
    const itemIO=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(!e.isIntersecting)return;
      const el=e.target;
      const siblings=el.parentElement?[...el.parentElement.children]:[];
      const idx=Math.max(0,siblings.indexOf(el));
      el.style.setProperty('--motion-delay',Math.min(idx,6)*70+'ms');
      el.classList.add('motion-in');
      itemIO.unobserve(el);
    }),{threshold:.12,rootMargin:'0px 0px -4% 0px'});
    items.forEach(el=>{if(!el.classList.contains('motion-ready')){el.classList.add('motion-ready');itemIO.observe(el)}});
  };

  // Subtle developer-style motion
  $$('.portrait-card,.card').forEach(el=>{
    el.addEventListener('mousemove',e=>{if(!matchMedia('(pointer:fine)').matches)return;const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform=`perspective(900px) rotateX(${-y*3}deg) rotateY(${x*4}deg) translateY(-2px)`});
    el.addEventListener('mouseleave',()=>el.style.transform='');
  });
  $$('.btn').forEach(el=>{el.addEventListener('mousemove',e=>{if(!matchMedia('(pointer:fine)').matches)return;const r=el.getBoundingClientRect();el.style.translate=`${(e.clientX-r.left-r.width/2)*.05}px ${(e.clientY-r.top-r.height/2)*.06}px`});el.addEventListener('mouseleave',()=>el.style.translate='0 0')});

  // Home
  if(page==='home'){
    $('#hero-name') && ($('#hero-name').innerHTML='<span class="name-line">DEWAN NAFIUL</span><br><span class="outline name-line">ISLAM NOOR</span>');
    $('#hero-intro') && ($('#hero-intro').textContent=D.hero.intro);
    $('#profile-image') && ($('#profile-image').src=D.site.profileImage);
    $('#cv-button') && ($('#cv-button').href=D.site.cvFile);
    renderMetrics(); renderMarquee(); renderResearchRows('#research-rows',4); renderProjects('#project-grid','featured'); renderPubs('#publication-list','Published'); renderEducation(); renderSkills(); renderLeadership(); renderAchievements(); renderGallery(); renderExperience(); setupTerminal();
  }

  // Filters on listing pages/home
  $$('[data-project-filter]').forEach(b=>b.addEventListener('click',()=>{$$('[data-project-filter]').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderProjects('#project-grid',b.dataset.projectFilter)}));
  $$('[data-pub-filter]').forEach(b=>b.addEventListener('click',()=>{$$('[data-pub-filter]').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderPubs('#publication-list',b.dataset.pubFilter)}));

  if(page==='research'){renderResearchRows();const t=$('#thesis');if(t)t.innerHTML=`<div class="card-kicker">Undergraduate thesis · ${esc(D.thesis.period)}</div><h2>${esc(D.thesis.title)}</h2><p>${esc(D.thesis.summary)}</p><div class="stack">${D.thesis.technologies.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`;renderPubs('#publication-list','all')}
  if(page==='projects'){renderProjects('#project-grid','all')}
  if(page==='publications'){renderPubs('#publication-list','all')}
  if(page==='experience'){renderExperience()}
  if(page==='education'){renderEducation();renderSkills()}
  if(page==='achievements'){renderAchievements();renderLeadership();renderGallery()}
  requestAnimationFrame(registerDynamicMotion);

  if(page==='project-detail'){
    const id=new URLSearchParams(location.search).get('id');const p=D.projects.find(x=>slug(x.title)===id)||D.projects[0];
    $('#detail-title').textContent=p.title;$('#detail-kicker').textContent=p.category;$('#detail-description').textContent=p.description;$('#detail-stack').innerHTML=p.stack.map(x=>`<span>${esc(x)}</span>`).join('');$('#detail-github').href=p.link;
    const related=D.publications.find(pub=>pub.tags?.some(t=>p.stack.some(s=>s.toLowerCase().includes(t.toLowerCase())||t.toLowerCase().includes(s.toLowerCase()))));
    $('#detail-related').innerHTML=related?`<h3>Related research</h3><p>${esc(related.title)}</p><a class="btn ghost" href="publication.html?id=${encodeURIComponent(slug(related.title))}">Open publication →</a>`:'<h3>Connected work</h3><p>This project is part of Dewan Nafiul Islam Noor’s broader research and software portfolio.</p><a class="btn ghost" href="projects.html">Explore all projects →</a>';
  }
  if(page==='publication-detail'){
    const id=new URLSearchParams(location.search).get('id');const p=D.publications.find(x=>slug(x.title)===id)||D.publications[0];
    $('#detail-title').textContent=p.title;$('#detail-kicker').textContent=p.type;$('#detail-description').textContent=p.summary;$('#detail-venue').textContent=p.venue;$('#detail-authors').textContent=p.authors;$('#detail-role').textContent=p.role||'';$('#detail-stack').innerHTML=(p.tags||[]).map(x=>`<span>${esc(x)}</span>`).join('');
    const doi=$('#detail-doi');if(p.doi){doi.href=p.doi}else doi.style.display='none';const gh=$('#detail-github');if(p.github){gh.href=p.github}else gh.style.display='none';
    const related=D.projects.find(pr=>p.tags?.some(t=>pr.stack.some(s=>s.toLowerCase().includes(t.toLowerCase())||t.toLowerCase().includes(s.toLowerCase()))));
    $('#detail-related').innerHTML=related?`<h3>Related project</h3><p>${esc(related.title)}</p><a class="btn ghost" href="project.html?id=${encodeURIComponent(slug(related.title))}">Open project →</a>`:'<h3>Research index</h3><p>Browse the full publication record and connected research themes.</p><a class="btn ghost" href="publications.html">All publications →</a>';
  }
})();
