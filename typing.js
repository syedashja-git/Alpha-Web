(() => {
  const heading = document.querySelector('.hero h1');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  if (!heading) return;
  heading.setAttribute('aria-label', 'Stronger structures. Lasting protection.');
  heading.classList.add('typing-heading');
  const letters = [];
  const walk = parent => {
    [...parent.childNodes].forEach(node => {
      if (node.nodeType === 3) {
        const fragment = document.createDocumentFragment();
        for (const letter of node.textContent) {
          const span = document.createElement('span');
          span.textContent = letter;
          span.className = 'typing-character pending';
          span.setAttribute('aria-hidden', 'true');
          letters.push(span);
          fragment.appendChild(span);
        }
        node.replaceWith(fragment);
      } else if (node.nodeType === 1 && node.tagName !== 'BR') walk(node);
    });
  };
  walk(heading);
  let index = 0, timer, started = false;
  function finish() {
    clearTimeout(timer);
    letters.forEach(letter => letter.classList.remove('pending','cursor'));
  }
  function tick() {
    // if (preference.matches) {finish();return;}
    if (document.hidden) {timer = setTimeout(tick, 200);return;}
    if (index) letters[index - 1].classList.remove('cursor');
    const letter = letters[index++];
    if (!letter) return;
    letter.classList.remove('pending');
    letter.classList.add('cursor');
    timer = setTimeout(index < letters.length ? tick : finish, index === letters.length ? 1200 : letter.textContent === '.' ? 550 : 95);
  }
  function start() {
    if (started) return;
    started = true;
    timer = setTimeout(tick, 700);
  }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, {once:true});
  setTimeout(start, 8000);
  preference.addEventListener('change', event => {if (event.matches) finish();});
})();
