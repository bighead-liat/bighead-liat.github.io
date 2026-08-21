/* ==========================================================================
   lightbox.js — 图片灯箱
   接管带 data-lightbox 的图片。支持 Esc 关闭、←/→ 翻页、
   点遮罩关闭、关闭后焦点回到触发图片。
   ========================================================================== */
(function () {
  'use strict';

  var imgs = [];
  var index = 0;
  var lastFocus = null;
  var box, boxImg, boxCap, btnPrev, btnNext;

  function build() {
    box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', '图片查看 / Image viewer');

    box.innerHTML =
      '<button class="lightbox__btn lightbox__btn--close" type="button" aria-label="关闭 / Close">✕</button>' +
      '<button class="lightbox__btn lightbox__btn--prev" type="button" aria-label="上一张 / Previous">‹</button>' +
      '<button class="lightbox__btn lightbox__btn--next" type="button" aria-label="下一张 / Next">›</button>' +
      '<img class="lightbox__img" alt="">' +
      '<p class="lightbox__cap"></p>';

    document.body.appendChild(box);

    boxImg = box.querySelector('.lightbox__img');
    boxCap = box.querySelector('.lightbox__cap');
    btnPrev = box.querySelector('.lightbox__btn--prev');
    btnNext = box.querySelector('.lightbox__btn--next');

    box.querySelector('.lightbox__btn--close').addEventListener('click', close);
    btnPrev.addEventListener('click', function () { step(-1); });
    btnNext.addEventListener('click', function () { step(1); });

    // 只有点在遮罩本身（不是图片/按钮）时才关闭
    box.addEventListener('click', function (e) {
      if (e.target === box) close();
    });
  }

  function captionFor(img) {
    var fig = img.closest ? img.closest('figure') : null;
    var cap = fig ? fig.querySelector('figcaption') : null;
    // figcaption 里可能同时含中英两段，取当前语言可见的那段
    if (cap) {
      var lang = document.documentElement.getAttribute('data-lang') || 'zh';
      var scoped = cap.querySelector('[data-lang="' + lang + '"]');
      return (scoped || cap).textContent.trim();
    }
    return img.getAttribute('alt') || '';
  }

  function show(i) {
    index = (i + imgs.length) % imgs.length;
    var img = imgs[index];

    // 有 data-full 时用原图，否则用缩略图本身
    boxImg.src = img.getAttribute('data-full') || img.currentSrc || img.src;
    boxImg.alt = img.getAttribute('alt') || '';
    boxCap.textContent = captionFor(img);

    var multi = imgs.length > 1;
    btnPrev.hidden = !multi;
    btnNext.hidden = !multi;
  }

  function open(i, trigger) {
    lastFocus = trigger || document.activeElement;
    show(i);
    box.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    box.querySelector('.lightbox__btn--close').focus();
  }

  function close() {
    box.classList.remove('is-open');
    document.body.style.overflow = '';
    boxImg.removeAttribute('src');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }

  function step(d) {
    show(index + d);
  }

  function isOpen() {
    return box && box.classList.contains('is-open');
  }

  function init() {
    imgs = Array.prototype.slice.call(
      document.querySelectorAll('img[data-lightbox]')
    );
    if (!imgs.length) return;

    build();

    imgs.forEach(function (img, i) {
      // 图片本身不可聚焦，包一层可聚焦语义让键盘也能打开
      img.setAttribute('role', 'button');
      img.setAttribute('tabindex', '0');
      img.addEventListener('click', function () { open(i, img); });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(i, img);
        }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
