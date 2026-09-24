const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav');
const header = document.querySelector('.header');
function closeMenu(){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');}
toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});
document.addEventListener('click',event=>{if(!event.target.closest('.header'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
window.addEventListener('scroll',()=>header.classList.toggle('is-scrolled',scrollY>12),{passive:true});
document.querySelector('#year').textContent=new Date().getFullYear();
