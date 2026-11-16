'use strict';
(() => {
  const triggers = 'button.figure-open, button[data-figure]';
  let dialog = document.querySelector('#figure-dialog');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'figure-dialog';
    dialog.innerHTML = `<div class="viewer-toolbar"><p id="viewer-title"></p><div>
      <button type="button" id="zoom-out">−</button>
      <button type="button" id="zoom-in">+</button>
      <button type="button" id="zoom-fit">Fit</button>
      <button type="button" id="close-viewer">Close ×</button>
      </div></div><div class="viewer-canvas"><img id="viewer-image" alt=""></div>`;
    document.body.append(dialog);
  }
  const viewer = dialog.querySelector('#viewer-image');
  const title = dialog.querySelector('#viewer-title');
  const canvas = dialog.querySelector('.viewer-canvas');
  const toolbar = dialog.querySelector('.viewer-toolbar');
  const zoomIn = dialog.querySelector('#zoom-in');
  const zoomOut = dialog.querySelector('#zoom-out');
  const fit = dialog.querySelector('#zoom-fit');
  const close = dialog.querySelector('#close-viewer');
  let opener = null, zoom = 1, fitWidth = 0, loadVersion = 0;

  function sizeFigure(reset = false) {
    if (!dialog.open || !viewer.naturalWidth || !viewer.naturalHeight) return;
    if (reset) {
      zoom = 1;
      canvas.style.height = Math.max(1, dialog.clientHeight - toolbar.offsetHeight) + 'px';
      const style = getComputedStyle(canvas);
      const width = canvas.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const height = canvas.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      fitWidth = Math.max(1, Math.min(width, height * viewer.naturalWidth / viewer.naturalHeight));
      canvas.scrollTo(0, 0);
    }
    viewer.style.width = fitWidth * zoom + 'px';
    viewer.dataset.zoomed = String(zoom > 1.02);
    zoomIn.disabled = !fitWidth || zoom >= 5;
    zoomOut.disabled = !fitWidth || zoom <= .5;
    fit.disabled = !fitWidth;
  }

  function refreshLanguage() {
    const zh = document.documentElement.lang.toLowerCase().startsWith('zh');
    dialog.setAttribute('aria-label', zh ? '原图查看器' : 'Figure Viewer');
    zoomIn.setAttribute('aria-label', zh ? '放大' : 'Zoom In');
    zoomOut.setAttribute('aria-label', zh ? '缩小' : 'Zoom Out');
    fit.textContent = zh ? '适应窗口' : 'Fit';
    close.textContent = zh ? '关闭 ×' : 'Close ×';
    document.querySelectorAll(triggers).forEach(button => {
      button.setAttribute('aria-label', zh ? '放大查看原图' : 'Enlarge Original Figure');
      button.setAttribute('aria-haspopup', 'dialog');
    });
    if (opener) {
      const source = opener.querySelector('img');
      const caption = opener.closest('figure')?.querySelector('figcaption');
      title.textContent = caption?.innerText.trim() || source.alt;
      viewer.alt = source.alt;
      if (dialog.open) requestAnimationFrame(() => sizeFigure(true));
    }
  }

  async function openFigure(button) {
    const source = button.querySelector('img');
    if (!source) return;
    opener = button;
    const version = ++loadVersion;
    fitWidth = 0;
    dialog.dataset.loading = 'true';
    canvas.setAttribute('aria-busy', 'true');
    zoomIn.disabled = zoomOut.disabled = fit.disabled = true;
    viewer.style.width = '';
    viewer.dataset.zoomed = 'false';
    // The source src keeps the full-resolution asset when the page uses srcset.
    viewer.src = button.dataset.figureSrc || source.src;
    refreshLanguage();
    if (!dialog.open) dialog.showModal();
    close.focus({ preventScroll: true });
    try { await viewer.decode(); } catch {}
    if (version === loadVersion && dialog.open) {
      sizeFigure(true);
      dialog.dataset.loading = 'false';
      canvas.setAttribute('aria-busy', 'false');
    }
  }

  document.addEventListener('click', event => {
    const button = event.target.closest(triggers);
    if (button) openFigure(button);
  });
  zoomIn.addEventListener('click', () => { zoom = Math.min(5, zoom * 1.4); sizeFigure(); });
  zoomOut.addEventListener('click', () => { zoom = Math.max(.5, zoom / 1.4); sizeFigure(); });
  fit.addEventListener('click', () => sizeFigure(true));
  close.addEventListener('click', () => dialog.close());
  // Native dialog supplies Escape handling, modal focus trapping, and inert background.
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    ++loadVersion;
    dialog.dataset.loading = 'false';
    canvas.setAttribute('aria-busy', 'false');
    const target = opener;
    opener = null;
    if (target?.isConnected) target.focus({ preventScroll: true });
  });
  addEventListener('resize', () => sizeFigure(true));
  new MutationObserver(refreshLanguage).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  window.FigureViewer = { refreshLanguage };
  refreshLanguage();
})();
