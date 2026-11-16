/* Progressive UI corrections — original app.js stays intact. */
(() => {
  'use strict';
  const D=window.PORTFOLIO_DATA;
  if(!D)return;
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const slug=s=>String(s).toLowerCase().normalize('NFKD').replace(/[–—]/g,'-').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const linkSvg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.5 13.5a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M13.5 10.5a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1"/></svg>';
  const infoSvg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></svg>';
  const devicons={
    Python:'python/python-original',C:'c/c-original','C++':'cplusplus/cplusplus-original',
    Java:'java/java-original',PHP:'php/php-original',JavaScript:'javascript/javascript-original',
    TypeScript:'typescript/typescript-original',HTML:'html5/html5-original',CSS:'css3/css3-original',
    React:'react/react-original',Flutter:'flutter/flutter-original',TensorFlow:'tensorflow/tensorflow-original',
    Keras:'keras/keras-original','scikit-learn':'scikitlearn/scikitlearn-original',
    NumPy:'numpy/numpy-original',Pandas:'pandas/pandas-original',Matplotlib:'matplotlib/matplotlib-original',
    OpenCV:'opencv/opencv-original',Git:'git/git-original',GitHub:'github/github-original',
    Linux:'linux/linux-original',MySQL:'mysql/mysql-original',Supabase:'supabase/supabase-original',
    Bootstrap:'bootstrap/bootstrap-original','Android Studio':'androidstudio/androidstudio-original',
    LaTeX:'latex/latex-original'
  };
  function nav(){
    const menu=$('#mobile-nav'),button=$('#menu-toggle');
    if(!button||!menu)return;
    const paint=()=>{const open=menu.classList.contains('open');button.textContent=open?'×':'☰';button.setAttribute('aria-label',open?'Close menu':'Open menu');button.setAttribute('aria-expanded',String(open));};
    paint();button.addEventListener('click',paint);
    document.addEventListener('keydown',e=>{
      if(e.key!=='Escape'||!menu.classList.contains('open'))return;
      menu.classList.remove('open');paint();button.focus();
    });
    $$('a',menu).forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');paint()}));
  }
  function skillCards(){
    const box=$('#skill-cloud');if(!box)return;
    box.innerHTML=Object.entries(D.skills).map(([title,values])=>
      '<div class="skill-box"><h4>'+esc(title)+'</h4><div class="skill-pills">'+values.map(value=>{
        const icon=devicons[value];
        return '<span class="skill-pill">'+(icon?'<img alt="" loading="lazy" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/'+esc(icon)+'.svg" onerror="this.style.display=\'none\'">':'')+esc(value)+'</span>';
      }).join('')+'</div></div>'
    ).join('');
    box.classList.add('visible');
  }
  function enhanceResearch(){
    const repoByHeading=[
      [/human activity recognition/i,'https://github.com/Dewannoor28/HAR-Activation-Optimizer-Study'],
      [/healthcare.*patient monitoring/i,'https://github.com/Dewannoor28/PAMAP2-CNN-BiLSTM-GRU-HAR']
    ];
    $$('.research-row').forEach(row=>{
      if($('.research-link',row))return;
      const heading=$('h3',row)?.textContent||'';
      const match=repoByHeading.find(([pattern])=>pattern.test(heading));
      const link=document.createElement('a');link.className='research-link';
      link.href=match?.[1]||'https://github.com/Dewannoor28';
      link.target='_blank';link.rel='noopener noreferrer';
      link.textContent=match?'View Repository ↗':'Explore GitHub ↗';
      link.setAttribute('aria-label',match?'Open corresponding GitHub repository':'Open GitHub profile; dedicated repository not available');
      row.appendChild(link);
    });
  }
  function pubLinks(){
    $$('.pub-actions a').forEach(a=>{
      if(a.dataset.pubEnhanced)return;
      const title=a.textContent.trim();
      if(/^DOI/i.test(title)){a.classList.add('doi-enhanced');a.innerHTML=linkSvg+'<span>View DOI</span>';a.setAttribute('aria-label','Open paper DOI');}
      else if(/^Details/i.test(title)){a.innerHTML=infoSvg+'<span>Paper Details</span>';}
      a.dataset.pubEnhanced='yes';
    });
  }
  function homePapers(){
    if(document.body.dataset.page!=='home')return;
    const list=$('#publication-list');if(!list)return;
    if(!$('#recent-accepted-panel')){
      const panel=document.createElement('div');panel.className='recent-accepted-panel';panel.id='recent-accepted-panel';
      const pending=D.publications.filter(p=>/Accepted/i.test(p.status)).slice(0,5);
      panel.innerHTML='<h3>Recently accepted <span>2026</span></h3>'+pending.map(p=>
        '<a class="new-paper-link" href="publication.html?id='+encodeURIComponent(slug(p.title))+'"><span>'+esc(p.type)+'</span><strong>'+esc(p.title)+'</strong><small>'+esc(p.status)+'</small></a>'
      ).join('')+'<div class="actions" style="margin-top:15px"><a class="btn ghost" href="publications.html">Browse all research outputs →</a></div>';
      list.after(panel);
    }
    const leaders=$$('#leadership-grid > .media-card');
    leaders.forEach((card,i)=>{
      if(i>=3){card.remove();return;}
      // Only show the highlighted position and short description on Home.
      // Full role progression stays in the Leadership & Learning page.
      const paragraphs=$('.body > p',card);
      paragraphs.slice(1).forEach(p=>p.remove());
    });
  }
  function gallCategory(x){
    const txt=((x.title||x.organization||'')+' '+(x.image||'')).toLowerCase();
    if(/award|recognition|dean|crest/.test(txt))return 'Awards & Recognition';
    if(/conference|research|thesis|spicscon|session|presentation/.test(txt))return 'Research & Conferences';
    if(/lead|hult|welfare|society|club|volunteer/.test(txt))return 'Leadership & Community';
    return 'Campus Life';
  }
  const morePhotos=[
    {title:'Research in Action',image:'assets/images/slide-research.webp'},
    {title:'IEEE SPICSCON Session',image:'assets/images/spicscon-session-2026.webp'},
    {title:'Conference with Researchers',image:'assets/images/spicscon-conference-group-2026.webp'},
    {title:'Thesis Milestone',image:'assets/images/thesis-supervisor.webp'},
    {title:'BAUET Computer Society',image:'assets/images/lead-computer-society.webp'},
    {title:'BAUET Welfare Club',image:'assets/images/lead-welfare.webp'},
    {title:'Hult Prize',image:'assets/images/lead-hult.webp'},
    {title:'Research Presentation',image:'assets/images/gallery-research.webp'},
    {title:'University Life',image:'assets/images/gallery-university.webp'},
    {title:'Award Ceremony',image:'assets/images/gallery-award.webp'},
    {title:'Hult Prize Journey',image:'assets/images/gallery-hult.webp'},
    {title:'Welfare Outreach',image:'assets/images/gallery-welfare.webp'},
    {title:'Student Leadership',image:'assets/images/gallery-computer-society.webp'}
  ];
  function gallery(){
    const grid=$('#gallery-v9-grid');if(!grid)return;
    // Use the original site's captions, achievement notes and role records;
    // a photo without verified details receives only a neutral caption.
    const photos=[], seen=new Set();
    const sources=[
      ...(D.gallery||[]),
      ...(D.achievements||[]),
      ...(D.heroSlides||[]),
      ...(D.leadership||[]),
      ...(D.photoReel||[]),
      ...morePhotos
    ];
    for(const x of sources){
      if(!x?.image || seen.has(x.image) || /mind.?storm|photo.?media/i.test((x.title||x.organization||'')+' '+x.image))continue;
      seen.add(x.image);
      const category=gallCategory(x);
      const title=x.title||x.organization||'Portfolio Moment';
      const description=x.caption||x.description||(
        x.category==='Research'?'A selected photograph from my academic research activities.':
        'A photograph from my portfolio journey, included in this gallery of research, leadership and campus memories.'
      );
      const role=x.currentRole ? x.currentRole+(x.period?' · '+x.period:'') : (x.subtitle||'');
      const year=String(x.year||((x.period||'').match(/\b20\d{2}\b/g)||[]).slice(-1)[0]||((title).match(/\b20\d{2}\b/)||[])[0]||'');
      photos.push({image:x.image,title,category,description,year,role});
    }
    const modal=$('#gallery-v9-modal'),preview=$('#gallery-v9-preview'),
      caption=$('#gallery-v9-caption'),description=$('#gallery-v9-description'),
      meta=$('#gallery-v9-meta'),roleText=$('#gallery-v9-role');
    let activeTrigger=null;
    const render=(category='All')=>{
      const selected=photos.filter(x=>category==='All'||category===x.category);
      grid.innerHTML=selected.map(x=>{
        const i=photos.indexOf(x);
        return '<button class="gallery-v9-card" type="button" data-gallery-index="'+i+'" aria-label="View photo details: '+esc(x.title)+'">'+
        '<img src="'+esc(x.image)+'" alt="'+esc(x.title)+'" loading="lazy" decoding="async">'+
        '<strong>'+esc(x.title)+'</strong><small>'+esc(x.category)+'</small></button>';
      }).join('');
    };
    render();
    $$('.gallery-filter').forEach(btn=>btn.addEventListener('click',()=>{
      $$('.gallery-filter').forEach(x=>x.classList.remove('active'));
      btn.classList.add('active');render(btn.dataset.filter||'All');
    }));
    grid.addEventListener('click',e=>{
      const card=e.target.closest('.gallery-v9-card');
      if(!card||!modal||!preview)return;
      const item=photos[Number(card.dataset.galleryIndex)];
      if(!item)return;
      activeTrigger=card;
      preview.src=item.image;preview.alt=item.title;
      if(caption)caption.textContent=item.title;
      if(description)description.textContent=item.description;
      if(meta)meta.textContent=item.category+(item.year?' · '+item.year:'');
      if(roleText){
        roleText.textContent=item.role||'';
        roleText.hidden=!item.role;
      }
      if(!modal.open)modal.showModal();
    });
    $('#gallery-v9-close')?.addEventListener('click',()=>modal?.close());
    modal?.addEventListener('click',e=>{if(e.target===modal)modal.close();});
    modal?.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.open){e.preventDefault();modal.close();}});
    modal?.addEventListener('close',()=>{activeTrigger?.focus({preventScroll:true});});
  }
  function leadership(){
    const target=$('#leadership-v9-timeline');if(!target)return;
    const keep=new Set(['BAUET Computer Society','BAUET Welfare Club','Hult Prize at BAUET']);
    const items=[];
    for(const leader of D.leadership||[]){
      if(!keep.has(leader.organization))continue;
      for(const role of leader.roles?.length?leader.roles:[leader.currentRole+' — '+leader.period]){
        const parts=role.split(/\s+[—–]\s+/);
        items.push({name:parts[0],period:parts[1]||leader.period,organization:leader.organization,detail:leader.description});
      }
    }
    for(const cert of D.certifications||[]){items.push({name:cert.title,period:cert.date,organization:cert.issuer,detail:'Professional learning and certification'});}
    target.innerHTML=items.map(x=>'<article><small>'+esc(x.period)+' · '+esc(x.organization)+'</small><h3>'+esc(x.name)+'</h3><p>'+esc(x.detail)+'</p></article>').join('');
  }
  function init(){
    nav();skillCards();enhanceResearch();pubLinks();homePapers();gallery();leadership();
    const list=$('#publication-list');
    if(list && 'MutationObserver' in window){new MutationObserver(()=>pubLinks()).observe(list,{childList:true,subtree:true});}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
