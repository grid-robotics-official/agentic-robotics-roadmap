'use strict';
(() => {
  const header = document.querySelector('.masthead');
  const top = document.querySelector('.floating-top');
  let scheduled = false;
  function update() {
    header?.classList.toggle('is-scrolled', scrollY > 16);
    if (top) top.hidden = scrollY < 320;
    scheduled = false;
  }
  addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();

(() => {
  const buttons = [...document.querySelectorAll('[data-copy]')];
  const timers = new WeakMap();
  function render(button) {
    const zh = document.documentElement.lang.startsWith('zh');
    const state = button.dataset.copyState || 'idle';
    const citation = button.dataset.copy === 'citation';
    button.textContent = state === 'copied' ? (zh ? '已复制' : 'Copied') : state === 'failed' ? (zh ? '重试' : 'Retry') : (zh ? '复制' : 'Copy');
    button.title = state === 'failed' ? (zh ? '复制失败，文本已选中，请手动复制。' : 'Copy failed. Text selected; copy it manually.') : zh ? (citation ? '复制引用' : '复制邮箱地址') : (citation ? 'Copy Citation' : 'Copy Email Address');
    button.setAttribute('aria-label', state === 'idle' ? button.title : button.textContent);
  }
  buttons.forEach(button => {
    render(button);
    button.addEventListener('click', async () => {
      const source = document.querySelector(button.dataset.copy === 'citation' ? '#citation-code' : '.join-email');
      clearTimeout(timers.get(button));
      try {
        await navigator.clipboard.writeText(source.textContent.trim());
        button.dataset.copyState = 'copied';
      } catch {
        const range = document.createRange();
        range.selectNodeContents(source);
        const selection = getSelection();
        selection.removeAllRanges(); selection.addRange(range);
        button.dataset.copyState = 'failed';
      }
      render(button);
      timers.set(button, setTimeout(() => { button.dataset.copyState = 'idle'; render(button); }, 1800));
    });
  });
  new MutationObserver(() => buttons.forEach(render)).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();

(() => {
 const top=document.querySelector('.floating-top');
 if(!top)return;
 function label(){const text=document.documentElement.lang.startsWith('zh')?'返回顶部':'Back to Top';top.setAttribute('aria-label',text);top.title=text;top.querySelector('span').textContent=document.documentElement.lang.startsWith('zh')?'顶部':'TOP'}
 label();
 new MutationObserver(label).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
