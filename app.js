(() => {
  const D = window.PORTFOLIO_DATA;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const slug = s => s.toLowerCase().normalize('NFKD').replace(/[–—]/g,'-').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const page = document.body.dataset.page || 'home';
  if (!D) {
    console.warn('Portfolio data unavailable; static HTML fallback remains visible.');
    document.documentElement.classList.add('static-fallback');
    return;
  }
  const mq = q => window.matchMedia ? window.matchMedia(q) : {matches:false};

  // Theme
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('dn-theme-v4'); } catch (_) {}
  document.documentElement.dataset.theme = savedTheme || 'light';
  const themeBtn = $('#theme-toggle');
  const paintTheme = () => { if(themeBtn) themeBtn.textContent = document.documentElement.dataset.theme === 'light' ? '☀' : '☾'; };
  paintTheme();
  themeBtn?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next; try { localStorage.setItem('dn-theme-v4', next); } catch (_) {} paintTheme();
  });

  // v32: lightweight multilingual translator (loads Google Translate only when needed).
  const languageNames = {en:'EN',bn:'BN',hi:'HI',ar:'AR',ja:'JA'};
  const savedLanguage = (()=>{try{return localStorage.getItem('dn-language')||'en'}catch(_){return 'en'}})();
  let activeLanguage = languageNames[savedLanguage] ? savedLanguage : 'en';

  const setLanguageDirection = lang => {
    document.documentElement.lang = lang === 'en' ? 'en' : lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl-language', lang === 'ar');
  };
  setLanguageDirection(activeLanguage);

  const clearTranslateCookies = () => {
    const expires='Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie=`googtrans=; expires=${expires}; path=/`;
    document.cookie=`googtrans=; expires=${expires}; path=/; domain=${location.hostname}`;
    document.cookie=`googtrans=; expires=${expires}; path=/; domain=.${location.hostname}`;
  };

  const protectOwnName = (root=document.body) => {
    const fullName='Dewan Nafiul Islam Noor';
    const upperName='DEWAN NAFIUL ISLAM NOOR';
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()){
      const node=walker.currentNode;
      const parent=node.parentElement;
      if(!parent || parent.closest('script,style,textarea,.notranslate,[translate="no"]')) continue;
      if(node.nodeValue?.includes(fullName) || node.nodeValue?.includes(upperName)) nodes.push(node);
    }
    nodes.forEach(node=>{
      const text=node.nodeValue||'';
      const pattern=/(Dewan Nafiul Islam Noor|DEWAN NAFIUL ISLAM NOOR)/g;
      const parts=text.split(pattern);
      if(parts.length<2)return;
      const frag=document.createDocumentFragment();
      parts.forEach(part=>{
        if(part===fullName || part===upperName){
          const span=document.createElement('span');
          span.className='notranslate protected-name';
          span.setAttribute('translate','no');
          span.textContent=part;
          frag.append(span);
        }else if(part){
          frag.append(document.createTextNode(part));
        }
      });
      node.parentNode?.replaceChild(frag,node);
    });
  };

  let translateLoading=false;
  window.googleTranslateElementInit=()=>{
    if(!window.google?.translate?.TranslateElement)return;
    const host=$('#google_translate_element');
    if(host && !host.dataset.ready){
      new google.translate.TranslateElement({
        pageLanguage:'en',
        includedLanguages:'bn,hi,ar,ja',
        autoDisplay:false
      },'google_translate_element');
      host.dataset.ready='1';
    }
    document.dispatchEvent(new Event('dn-translate-ready'));
  };

  const loadTranslator=()=>{
    if(window.google?.translate?.TranslateElement){
      window.googleTranslateElementInit();
      return;
    }
    if(translateLoading || $('#dn-google-translate-script'))return;
    translateLoading=true;
    const script=document.createElement('script');
    script.id='dn-google-translate-script';
    script.src='https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async=true;
    script.onerror=()=>{translateLoading=false;document.body.classList.add('translator-unavailable')};
    document.head.append(script);
  };

  const applyGoogleLanguage=(lang,attempt=0)=>{
    const combo=document.querySelector('.goog-te-combo');
    if(combo){
      if(combo.value!==lang){
        combo.value=lang;
        combo.dispatchEvent(new Event('change',{bubbles:true}));
      }
      return;
    }
    if(attempt<35)setTimeout(()=>applyGoogleLanguage(lang,attempt+1),120);
  };

  const setupLanguageSwitcher=()=>{
    const wrap=$('#language-switcher'), toggle=$('#language-toggle'), menu=$('#language-menu'), code=$('#language-code');
    if(!wrap||!toggle||!menu)return;

    const paint=()=>{
      if(code)code.textContent=languageNames[activeLanguage]||'EN';
      $$('[data-lang]',menu).forEach(btn=>btn.classList.toggle('active',btn.dataset.lang===activeLanguage));
    };
    paint();

    const close=()=>{menu.classList.remove('open');toggle.setAttribute('aria-expanded','false')};
    toggle.addEventListener('click',e=>{
      e.stopPropagation();
      const open=!menu.classList.contains('open');
      menu.classList.toggle('open',open);
      toggle.setAttribute('aria-expanded',String(open));
      if(open && activeLanguage!=='en')loadTranslator();
    });
    document.addEventListener('click',e=>{if(!wrap.contains(e.target))close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});

    $$('[data-lang]',menu).forEach(btn=>btn.addEventListener('click',()=>{
      const lang=btn.dataset.lang;
      if(!languageNames[lang] || lang===activeLanguage){close();return;}
      activeLanguage=lang;
      try{localStorage.setItem('dn-language',lang)}catch(_){}
      setLanguageDirection(lang);
      paint();
      close();

      if(lang==='en'){
        clearTranslateCookies();
        location.reload();
        return;
      }

      protectOwnName();
      loadTranslator();
      applyGoogleLanguage(lang);
    }));

    document.addEventListener('dn-translate-ready',()=>applyGoogleLanguage(activeLanguage));
    if(activeLanguage!=='en'){
      protectOwnName();
      loadTranslator();
    }
  };

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
  if (mq('(pointer:fine)').matches) {
    const c = $('.cursor'), d = $('.cursor-dot');
    addEventListener('mousemove', e => { if(c){c.style.left=e.clientX+'px';c.style.top=e.clientY+'px'} if(d){d.style.left=e.clientX+'px';d.style.top=e.clientY+'px'} });
    $$('a,button,.gallery-item,.card').forEach(el => { el.addEventListener('mouseenter',()=>c?.classList.add('hover')); el.addEventListener('mouseleave',()=>c?.classList.remove('hover')); });
  }

  // Reveal animations
  const io = ('IntersectionObserver' in window)
    ? new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } }), {threshold:.12})
    : { observe(el){ el.classList.add('visible'); }, unobserve(){} };
  $$('.reveal,.stagger').forEach(el => io.observe(el));

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

  // Lightweight image error handling. Assets are shipped with the repository; no inline photo blobs are embedded.
  document.addEventListener('error', event=>{
    const photo=event.target;
    if(!(photo instanceof HTMLImageElement) || photo.dataset.uploadNotice) return;
    photo.dataset.uploadNotice='1';
    photo.classList.add('image-load-failed');
    photo.alt=(photo.alt||'Image')+' — image unavailable';
  },true);

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


  // v21: deterministic letter-by-letter hero typing.
  const heroName = $('#hero-name');
  const kineticEl = $('#kinetic-phrase');
  const reducedMotion = mq('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  const appendTypedChar = (target, ch, accent=false) => {
    if (ch === ' ') {
      target.append(document.createTextNode('\u00A0'));
      return;
    }
    const span = document.createElement('span');
    span.className = 'typed-char' + (accent ? ' typed-accent' : '');
    span.textContent = ch;
    target.append(span);
  };

  const typeName = async () => {
    if (!heroName) return;
    const words = ['DEWAN','NAFIUL','ISLAM','NOOR'];
    heroName.textContent = '';
    heroName.classList.add('is-typing');

    for (let w = 0; w < words.length; w++) {
      const wordWrap = document.createElement('span');
      wordWrap.className = 'typed-name-word' + (w === words.length - 1 ? ' typed-name-accent' : '');
      heroName.append(wordWrap);

      for (const ch of words[w]) {
        appendTypedChar(wordWrap, ch, w === words.length - 1);
        await sleep(72);
      }

      if (w === 1) {
        const br = document.createElement('br');
        br.className = 'mobile-name-break';
        heroName.append(br);
      }
      if (w < words.length - 1) {
        heroName.append(document.createTextNode(' '));
        await sleep(150);
      }
    }
    heroName.classList.remove('is-typing');
  };

  const typeLine = async (text) => {
    if (!kineticEl) return;
    kineticEl.textContent = '';
    kineticEl.classList.add('is-typing');
    for (const ch of text) {
      kineticEl.textContent += ch;
      await sleep(42);
    }
    kineticEl.classList.remove('is-typing');
  };

  const eraseLine = async () => {
    if (!kineticEl) return;
    kineticEl.classList.add('is-typing');
    while (kineticEl.textContent.length) {
      kineticEl.textContent = kineticEl.textContent.slice(0, -1);
      await sleep(16);
    }
    kineticEl.classList.remove('is-typing');
  };

  const typeCurrentWork = async () => {
    if (!kineticEl) return;
    const phrases = [
      'AI/ML RESEARCH · HAR · COMPUTER VISION · HEALTHCARE AI',
      'BYTE CAPSULE · MOBILE APPLICATION SECURITY INTERNSHIP'
    ];
    let phraseIndex = 0;
    while (true) {
      await typeLine(phrases[phraseIndex]);
      await sleep(1800);
      await eraseLine();
      await sleep(220);
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  };

  const startHeroTyping = async () => {
    if (page !== 'home') return;
    await typeName();
    await sleep(280);
    typeCurrentWork();
  };

  startHeroTyping();

  const renderMetrics=()=>{const el=$('#hero-metrics');if(!el)return;el.innerHTML=D.hero.highlights.map(x=>`<div class="metric"><strong data-count="${esc(x.value)}">0</strong><span>${esc(x.label)}</span></div>`).join('');const animate=n=>{const raw=n.dataset.count,target=parseFloat(raw);if(Number.isNaN(target)){n.textContent=raw;return}const dur=900,t0=performance.now();const f=t=>{const p=Math.min(1,(t-t0)/dur),v=target*p;n.textContent=raw.includes('.')?v.toFixed(2):Math.round(v);if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)};if(!('IntersectionObserver' in window)){ $$('[data-count]').forEach(animate); return; }const counterIO=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;animate(e.target);counterIO.unobserve(e.target)}),{threshold:.5});$$('[data-count]').forEach(x=>counterIO.observe(x))};

  const renderMarquee=()=>{const el=$('#marquee-track');if(!el)return;const words=D.about.focusAreas;el.innerHTML=[...words,...words].map(x=>`<span>${esc(x)}</span>`).join('')};
  const renderResearchRows=(target='#research-rows', limit=null)=>{const el=$(target);if(!el)return;const rows=(limit?D.researchStory.steps.slice(0,limit):D.researchStory.steps);el.innerHTML=rows.map(s=>`<article class="research-row"><div class="num">${esc(s.number)}</div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></article>`).join('')};
  const renderProjects=(target='#project-grid', mode='featured')=>{const el=$(target);if(!el)return;const list=mode==='featured'?D.projects.filter(x=>x.featured):D.projects;el.innerHTML=list.map((p,i)=>`<article class="card project-card"><span class="project-code">${String(i+1).padStart(2,'0')}</span><div class="card-kicker">${esc(p.category)}</div><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><div class="stack">${p.stack.map(s=>`<span>${esc(s)}</span>`).join('')}</div><div class="card-links"><a href="project.html?id=${encodeURIComponent(slug(p.title))}">Case study →</a><a href="${esc(p.link)}" target="_blank" rel="noopener">GitHub ↗</a></div></article>`).join('')};
  const renderPubs=(target='#publication-list', filter='all')=>{const el=$(target);if(!el)return;const list=D.publications.filter(p=>filter==='all'||p.status.toLowerCase().includes(filter.toLowerCase()));el.innerHTML=list.map(p=>`<article class="publication"><div class="year">${esc(p.year)}<br><small>${esc(p.status)}</small></div><div><h3>${esc(p.title)}</h3><p>${esc(p.venue)}</p><p>${esc(p.role||'')}</p><div class="stack">${(p.tags||[]).slice(0,5).map(t=>`<span>${esc(t)}</span>`).join('')}</div></div><div class="pub-actions"><a class="mini-btn" href="publication.html?id=${encodeURIComponent(slug(p.title))}">Details</a>${p.doi?`<a class="mini-btn" href="${esc(p.doi)}" target="_blank" rel="noopener">DOI ↗</a>`:''}</div></article>`).join('')||'<div class="empty">No publications in this filter.</div>'};
  const renderEducation=()=>{const el=$('#education-grid');if(!el)return;el.innerHTML=D.education.map((x,i)=>`<article class="media-card education-card text-only"><div class="education-code">EDU_${String(i+1).padStart(2,'0')}</div><div class="body"><div class="role">${esc(x.period)}</div><h3>${esc(x.degree)}</h3><p><b>${esc(x.institution)}</b></p><p class="education-result">${esc(x.result)}</p>${x.details?`<p>${esc(x.details)}</p>`:''}</div></article>`).join('')};
  const renderSkills=()=>{const j=$('#skills-json'),g=$('#skill-cloud'); if(j){const entries=Object.entries(D.skills).slice(0,5);j.innerHTML=`<span class="brace">{</span>\n${entries.map(([k,v])=>`  <span class="key">"${esc(k)}"</span>: [\n${v.slice(0,6).map((x,i)=>`    <span class="str">"${esc(x)}"</span>${i<v.slice(0,6).length-1?',':''}`).join('\n')}\n  ]`).join(',\n')}\n<span class="brace">}</span>`} if(g){g.innerHTML=Object.entries(D.skills).map(([k,v])=>`<div class="skill-box"><h4>${esc(k)}</h4><p>${v.join(' · ')}</p></div>`).join('')}};
  const renderLeadership=()=>{const el=$('#leadership-grid');if(!el)return;el.innerHTML=D.leadership.map((x,i)=>`<article class="media-card ${x.image?'':'text-only'}">${x.image?`<img src="${esc(x.image)}" alt="${esc(x.organization)}" loading="${page==='achievements'&&i<2?'eager':'lazy'}" decoding="async" fetchpriority="${page==='achievements'&&i===0?'high':'auto'}">`:''}<div class="body"><div class="role">${esc(x.currentRole)} · ${esc(x.period)}</div><h3>${esc(x.organization)}</h3><p>${esc(x.description)}</p>${x.roles?.length?`<p>${x.roles.map(r=>'• '+esc(r)).join('<br>')}</p>`:''}</div></article>`).join('')};
  const renderAchievements=()=>{const el=$('#achievement-grid');if(!el)return;el.innerHTML=D.achievements.map((x,i)=>`<article class="media-card"><img src="${esc(x.image)}" alt="${esc(x.title)}" loading="${page==='achievements'&&i<2?'eager':'lazy'}" decoding="async" fetchpriority="${page==='achievements'&&i===0?'high':'auto'}"><div class="body"><div class="role">${esc(x.subtitle)}</div><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p></div></article>`).join('')};
  const renderJourney=()=>{const el=$('#journey-strip');if(!el)return;el.innerHTML=(D.heroSlides||[]).map((x,i)=>`<article class="journey-card journey-story-card" aria-hidden="${i===0?'false':'true'}"><img src="${esc(x.image)}" alt="${esc(x.title)}" loading="${i===0?'eager':'lazy'}" decoding="async" fetchpriority="${i===0?'high':'low'}"><div class="journey-copy"><span>${String(i+1).padStart(2,'0')} / ${esc((x.category||'Story').toUpperCase())}</span><h3>${esc(x.title)}</h3><p class="journey-caption">${esc(x.caption||'')}</p><p class="journey-story">${esc(x.story||x.caption||'')}</p></div></article>`).join('')};
  const setupJourneySlider=()=>{
    const viewport=$('#journey-slider'), track=$('#journey-strip');
    if(!viewport||!track)return;
    const cards=$$('.journey-story-card',track);
    if(!cards.length)return;
    const prev=$('#journey-prev'), next=$('#journey-next'), count=$('#journey-count');
    let index=0, timer=null, touchX=null;

    viewport.setAttribute('tabindex','0');
    const update=()=>{
      track.style.transform=`translate3d(-${index*100}%,0,0)`;
      cards.forEach((card,i)=>card.setAttribute('aria-hidden',String(i!==index)));
      if(count) count.textContent=`${index+1} / ${cards.length}`;
    };
    const stop=()=>{if(timer){clearInterval(timer);timer=null;}};
    const start=()=>{if(cards.length<2)return;stop();timer=setInterval(()=>{index=(index+1)%cards.length;update();},5200);};
    const go=step=>{index=(index+step+cards.length)%cards.length;update();stop();start();};

    prev?.addEventListener('click',()=>go(-1));
    next?.addEventListener('click',()=>go(1));
    viewport.addEventListener('keydown',e=>{
      if(e.key==='ArrowLeft'){e.preventDefault();go(-1);}
      if(e.key==='ArrowRight'){e.preventDefault();go(1);}
    });
    viewport.addEventListener('mouseenter',stop);
    viewport.addEventListener('mouseleave',start);
    viewport.addEventListener('focusin',stop);
    viewport.addEventListener('focusout',start);
    viewport.addEventListener('touchstart',e=>{touchX=e.changedTouches[0]?.clientX??null;stop();},{passive:true});
    viewport.addEventListener('touchend',e=>{
      if(touchX===null)return;
      const dx=(e.changedTouches[0]?.clientX??touchX)-touchX;
      if(Math.abs(dx)>45) go(dx<0?1:-1);
      touchX=null;
      start();
    },{passive:true});
    document.addEventListener('visibilitychange',()=>document.hidden?stop():start());

    update();
    start();
  };

  const renderPhotoReel=()=>{const el=$('#photo-reel-track');if(!el)return;const list=D.photoReel||[];el.innerHTML=list.map((x,i)=>`<figure class="photo-reel-card" aria-hidden="${i===0?'false':'true'}"><img src="${esc(x.image)}" alt="${esc(x.title)}" loading="${i===0?'eager':'lazy'}" decoding="async" fetchpriority="${i===0?'high':'low'}"><figcaption>${esc(x.title)}</figcaption></figure>`).join('')};

  const setupPhotoSlider=()=>{
    const viewport=$('.photo-reel'), track=$('#photo-reel-track');
    if(!viewport||!track)return;
    const cards=$$('.photo-reel-card',track);
    if(!cards.length)return;
    const prev=$('#reel-prev'), next=$('#reel-next'), count=$('#reel-count');
    let index=0, timer=null, touchX=null;

    viewport.setAttribute('tabindex','0');
    const update=()=>{
      track.style.transform=`translate3d(-${index*100}%,0,0)`;
      cards.forEach((card,i)=>card.setAttribute('aria-hidden',String(i!==index)));
      if(count) count.textContent=`${index+1} / ${cards.length}`;
    };
    const go=step=>{index=(index+step+cards.length)%cards.length;update();restart();};
    const stop=()=>{if(timer){clearInterval(timer);timer=null;}};
    const start=()=>{if(cards.length<2)return;stop();timer=setInterval(()=>{index=(index+1)%cards.length;update();},4200);};
    const restart=()=>{stop();start();};

    prev?.addEventListener('click',()=>go(-1));
    next?.addEventListener('click',()=>go(1));
    viewport.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();go(-1)}else if(e.key==='ArrowRight'){e.preventDefault();go(1)}});
    viewport.addEventListener('mouseenter',stop);
    viewport.addEventListener('mouseleave',start);
    viewport.addEventListener('focusin',stop);
    viewport.addEventListener('focusout',start);
    viewport.addEventListener('touchstart',e=>{touchX=e.changedTouches[0]?.clientX??null;stop();},{passive:true});
    viewport.addEventListener('touchend',e=>{if(touchX===null)return;const dx=(e.changedTouches[0]?.clientX??touchX)-touchX;if(Math.abs(dx)>45)go(dx<0?1:-1);touchX=null;start();},{passive:true});
    document.addEventListener('visibilitychange',()=>document.hidden?stop():start());

    update();
    start();
  };
  const renderGallery=()=>{const el=$('#gallery-grid');if(!el)return;el.innerHTML=D.gallery.map((x,i)=>`<figure class="gallery-item" data-img="${esc(x.image)}" data-title="${esc(x.title)}"><img src="${esc(x.image)}" alt="${esc(x.title)}" loading="${page==='achievements'&&i<2?'eager':'lazy'}" decoding="async" fetchpriority="${page==='achievements'&&i===0?'high':'auto'}"><figcaption class="gallery-caption"><span>${esc(x.category)}</span><h4>${esc(x.title)}</h4></figcaption></figure>`).join('');$$('.gallery-item').forEach(it=>it.addEventListener('click',()=>{const m=$('#image-modal');$('#modal-image').src=it.dataset.img;$('#modal-image').alt=it.dataset.title;m?.classList.add('open')}))};
  $('#modal-close')?.addEventListener('click',()=>$('#image-modal')?.classList.remove('open'));$('#image-modal')?.addEventListener('click',e=>{if(e.target.id==='image-modal')e.currentTarget.classList.remove('open')});

  const renderExperience=(target='#experience-timeline')=>{const el=$(target);if(!el)return;const items=D.experience.map(x=>({period:x.period,title:x.title,sub:x.organization,text:x.bullets.join(' '),skills:x.skills||[]}));el.innerHTML=items.map((x,i)=>`<article class="git-item"><div class="hash">commit ${('exp'+(i+1)+'2026').padEnd(10,'0')} · ${esc(x.period)}</div><h3>${esc(x.title)}</h3><p><b>${esc(x.sub)}</b></p><p>${esc(x.text)}</p>${x.skills.length?`<div class="stack">${x.skills.map(s=>`<span>${esc(s)}</span>`).join('')}</div>`:''}</article>`).join('')};

  const setupTerminal=()=>{const input=$('#terminal-input'), out=$('#terminal-output');if(!input||!out)return;const cmds={help:'about  research  projects  publications  experience  education  achievements  contact  clear',about:'Dewan Nafiul Islam Noor — CSE postgraduate researcher working across AI, computer vision, healthcare AI, cybersecurity and software systems.',research:'Opening research...',projects:'Opening projects...',publications:'Opening publications...',experience:'Opening experience...',education:'Opening education...',achievements:'Opening achievements...',contact:`email: ${D.site.email}`};input.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const c=input.value.trim().toLowerCase();out.textContent+=`\ndewan@portfolio:~$ ${c}\n`;if(c==='clear'){out.textContent='';input.value='';return}out.textContent+=(cmds[c]||`command not found: ${c}. type 'help'.`)+'\n';input.value='';const pages={research:'research.html',projects:'projects.html',publications:'publications.html',experience:'experience.html',education:'education.html',achievements:'achievements.html'};if(pages[c])setTimeout(()=>location.href=pages[c],450);out.parentElement.scrollTop=out.parentElement.scrollHeight})};

  // Stronger scroll motion for dynamically-rendered portfolio items
  const registerDynamicMotion=()=>{
    if(mq('(prefers-reduced-motion: reduce)').matches) return;
    const items=$$('.card,.publication,.research-row,.git-item,.skill-box,.media-card').filter(el=>!el.closest('.stagger'));
    if(!('IntersectionObserver' in window)){items.forEach(el=>el.classList.add('motion-in'));return;}
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
    el.addEventListener('mousemove',e=>{if(!mq('(pointer:fine)').matches)return;const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform=`perspective(900px) rotateX(${-y*3}deg) rotateY(${x*4}deg) translateY(-2px)`});
    el.addEventListener('mouseleave',()=>el.style.transform='');
  });
  $$('.btn').forEach(el=>{el.addEventListener('mousemove',e=>{if(!mq('(pointer:fine)').matches)return;const r=el.getBoundingClientRect();el.style.translate=`${(e.clientX-r.left-r.width/2)*.05}px ${(e.clientY-r.top-r.height/2)*.06}px`});el.addEventListener('mouseleave',()=>el.style.translate='0 0')});

  // Home
  if(page==='home'){
    $('#hero-intro') && ($('#hero-intro').textContent=D.hero.intro);
    // Photo embedded in index.html is the failsafe; use assets path only after it loads.
    const heroPhoto=$('#profile-image');
    if(heroPhoto && D.site.profileImage){
      const safeEmbeddedPhoto=heroPhoto.src;
      heroPhoto.addEventListener('error',()=>{if(heroPhoto.src!==safeEmbeddedPhoto) heroPhoto.src=safeEmbeddedPhoto;});
      const fullPhoto=new Image();
      fullPhoto.onload=()=>{heroPhoto.src=D.site.profileImage};
      fullPhoto.src=D.site.profileImage;
    }
    $('#cv-button') && ($('#cv-button').href=D.site.cvFile);
    renderMetrics(); renderMarquee(); renderResearchRows('#research-rows',4); renderProjects('#project-grid','featured'); renderPubs('#publication-list','Published'); renderEducation(); renderSkills(); renderLeadership(); renderAchievements(); renderPhotoReel(); setupPhotoSlider(); renderJourney(); setupJourneySlider(); renderGallery(); renderExperience(); setupTerminal();
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
  protectOwnName();
  setupLanguageSwitcher();

  // v28: scroll-triggered sequence. Content remains visible unless this JS successfully activates it.
  const setupScrollSequence=()=>{
    if(page!=='home') return;
    const sections=$$('main > section:not(.hero)');
    const selector='.section-head,.research-row,.project-card,.publication,.skill-box,.education-card,.leadership-grid>.media-card,.achievement-grid>.media-card,.photo-reel,.journey-slider,.gallery-item,.contact-shell,.metric';
    const targets=[];
    sections.forEach(section=>{
      const items=$$(selector,section);
      items.forEach((el,i)=>{
        el.style.setProperty('--scroll-delay', Math.min(i,8)*85+'ms');
        el.classList.add('scroll-seq-ready');
        targets.push(el);
      });
    });
    if(!targets.length)return;
    if(!('IntersectionObserver' in window)){
      targets.forEach(el=>el.classList.add('scroll-seq-in'));
      return;
    }
    const seqIO=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        entry.target.classList.add('scroll-seq-in');
        seqIO.unobserve(entry.target);
      });
    },{threshold:.12,rootMargin:'0px 0px -7% 0px'});
    targets.forEach(el=>{
      const r=el.getBoundingClientRect();
      if(r.top < innerHeight*.94 && r.bottom > 0) el.classList.add('scroll-seq-in');
      else seqIO.observe(el);
    });
  };

  const activateRevealFailSafe=()=>{
    const targets=$$('.reveal,.stagger');
    targets.forEach(el=>{
      const r=el.getBoundingClientRect();
      if(r.top < innerHeight*1.15 && r.bottom > -80) el.classList.add('visible');
      else io.observe(el);
    });
    // Never leave content invisible if IntersectionObserver is delayed/buggy (notably some Safari layouts).
    setTimeout(()=>{
      $$('.reveal,.stagger').forEach(el=>el.classList.add('visible'));
      $$('.motion-ready:not(.motion-in)').forEach(el=>el.classList.add('motion-in'));
    },1800);
  };
  requestAnimationFrame(()=>{registerDynamicMotion();activateRevealFailSafe();setupScrollSequence();});

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

  queueMicrotask(()=>{
    protectOwnName();
    if(activeLanguage!=='en')applyGoogleLanguage(activeLanguage);
  });
})();
