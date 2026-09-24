const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav');
function closeMenu(){nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false');}
menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
document.addEventListener('click',event=>{if(!event.target.closest('.header'))closeMenu();});
const dialog=document.querySelector('#photo-dialog');
const dialogImage=document.querySelector('#dialog-image');
document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{dialogImage.src=button.dataset.photo;dialogImage.alt=button.dataset.caption;document.querySelector('#dialog-caption').textContent=button.dataset.caption;dialog.showModal();}));
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
document.querySelector('#year').textContent=new Date().getFullYear();

// Content remains visible without JavaScript or when reduced motion is enabled.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const runningAnimations = new Set();
function animateElement(element, keyframes, options) {
  if (motionPreference.matches || typeof element.animate !== 'function') return;
  const animation = element.animate(keyframes, options);
  runningAnimations.add(animation);
  const clear = () => runningAnimations.delete(animation);
  animation.addEventListener('finish', clear, {once:true});
  animation.addEventListener('cancel', clear, {once:true});
}
const entranceFrames = [
  {opacity:0, transform:'translateY(26px)'},
  {opacity:1, transform:'translateY(0)'}
];
const entranceTiming = {duration:1050, easing:'cubic-bezier(.2,.7,.2,1)', fill:'backwards'};
document.querySelectorAll('.hero-copy > *').forEach((element,index) => {
  animateElement(element, entranceFrames, {...entranceTiming,delay:index*80});
});
animateElement(document.querySelector('.hero-visual'),
  [{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],
  {...entranceTiming,duration:850,delay:150});
let revealObserver;
const revealed = new WeakSet();
if ('IntersectionObserver' in window && !motionPreference.matches) {
  revealObserver = new IntersectionObserver((entries) => {
    let stagger = 0;
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        revealed.delete(entry.target);
        return;
      }
      if (revealed.has(entry.target)) return;
      revealed.add(entry.target);
      animateElement(entry.target, entranceFrames, {...entranceTiming,delay:Math.min(stagger++,3)*90});
    });
  }, {threshold:0, rootMargin:'0px 0px -35px 0px'});
  document.querySelectorAll('.hero-copy, .hero-visual, .proof-grid > div, .about > div, .section-heading, .solution-card, .gallery > figure, .quality-grid > div:first-child, .quality-points article, .contact > div, .contact-details, .contact-form, .tds-group, .footer-main, .footer-bottom').forEach(element => {
    // Hero children already have a staggered first-load entrance.
    if (element.matches('.hero-copy, .hero-visual')) revealed.add(element);
    revealObserver.observe(element);
  });
}
motionPreference.addEventListener('change', event => {
  if (event.matches) {
    revealObserver?.disconnect();
    runningAnimations.forEach(animation => animation.cancel());
    runningAnimations.clear();
  }
});
const header = document.querySelector('.header');
let scrollScheduled = false;
function updateHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 12);
  scrollScheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scrollScheduled) {scrollScheduled=true;requestAnimationFrame(updateHeader);}
}, {passive:true});
updateHeader();


// Count once when the statistics come into view; keep final values as the fallback.
const counters = document.querySelectorAll('[data-count]');
const countFrames = new Map();
function countText(element, value) {
  return String(value).padStart(Number(element.dataset.digits || 1), '0') + (element.dataset.suffix || '');
}
function finishCounters() {
  countFrames.forEach(frame => cancelAnimationFrame(frame));
  countFrames.clear();
  counters.forEach(element => { element.textContent = countText(element, Number(element.dataset.count)); });
}
let counterObserver;
if ('IntersectionObserver' in window && !motionPreference.matches) {
  counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      counterObserver.unobserve(element);
      const target = Number(element.dataset.count);
      let started;
      element.textContent = countText(element, 0);
      function tick(now) {
        if (motionPreference.matches) {finishCounters();return;}
        if (started === undefined) started = now;
        const progress = Math.min((now - started) / 1500, 1);
        const eased = 1 - Math.pow(1 - progress, 2);
        element.textContent = countText(element, Math.floor(target * eased));
        if (progress < 1) countFrames.set(element, requestAnimationFrame(tick));
        else {element.textContent = countText(element, target);countFrames.delete(element);}
      }
      countFrames.set(element, requestAnimationFrame(tick));
    });
  }, {threshold:0.65});
  counters.forEach(element => counterObserver.observe(element));
}
motionPreference.addEventListener('change', event => {
  if (event.matches) {counterObserver?.disconnect();finishCounters();}
});


// Smooth, interruptible section navigation without changing wheel/touch behaviour.
let navigationFrame = 0;
let restoreScrollStyle = null;
function stopNavigationScroll() {
  cancelAnimationFrame(navigationFrame);
  navigationFrame = 0;
  if (restoreScrollStyle) {restoreScrollStyle();restoreScrollStyle = null;}
}
function smoothNavigate(target, hash) {
  stopNavigationScroll();
  if (motionPreference.matches) return false;
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  restoreScrollStyle = () => {root.style.scrollBehavior = previous;};
  const start = window.scrollY;
  const offset = header.getBoundingClientRect().height + 16;
  const destination = Math.max(0, Math.min(target.getBoundingClientRect().top + start - offset, root.scrollHeight - window.innerHeight));
  const distance = destination - start;
  const duration = Math.min(1250, Math.max(750, Math.abs(distance) * .35));
  let started;
  function step(now) {
    if (started === undefined) started = now;
    const progress = Math.min((now - started) / duration, 1);
    const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
    window.scrollTo(0, start + distance * eased);
    if (progress < 1) navigationFrame = requestAnimationFrame(step);
    else {
      stopNavigationScroll();
      if (location.hash !== hash) history.pushState(null, '', hash);
      const oldTabindex = target.getAttribute('tabindex');
      if (oldTabindex === null) target.setAttribute('tabindex', '-1');
      target.focus({preventScroll:true});
      if (oldTabindex === null) target.addEventListener('blur', () => target.removeAttribute('tabindex'), {once:true});
    }
  }
  navigationFrame = requestAnimationFrame(step);
  return true;
}
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const hash = link.getAttribute('href');
    const target = document.getElementById(hash.slice(1));
    if (target && smoothNavigate(target, hash)) event.preventDefault();
  });
});
['wheel', 'touchstart', 'pointerdown'].forEach(type => window.addEventListener(type, stopNavigationScroll, {passive:true}));
window.addEventListener('keydown', event => {if (['ArrowUp','ArrowDown','PageUp','PageDown','Home','End','Escape',' '].includes(event.key)) stopNavigationScroll();});
window.addEventListener('popstate', stopNavigationScroll);
motionPreference.addEventListener('change', event => {if (event.matches) stopNavigationScroll();});

