/* ==========================================================================
   site.js — 语言切换、主题切换、导航高亮
   无依赖。所有内容已在 HTML 中，本文件只做状态切换与增强。
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var LANG_KEY = 'liat-site-lang';
  var THEME_KEY = 'liat-site-theme';

  /* ---------- 语言 ---------- */

  function readLang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved === 'zh' || saved === 'en') return saved;
    } catch (e) {
      /* localStorage 可能被隐私模式禁用，忽略 */
    }
    // 无偏好时按浏览器语言猜一次：非中文环境给英文
    return /^zh\b/i.test(navigator.language || '') ? 'zh' : 'en';
  }

  function applyLang(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');

    var btn = document.getElementById('lang-toggle');
    if (btn) {
      // 按钮显示的是"点了会切到哪种语言"
      btn.textContent = lang === 'zh' ? 'EN' : '中';
      btn.setAttribute(
        'aria-label',
        lang === 'zh' ? 'Switch to English' : '切换到中文'
      );
    }

    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {}
  }

  /* ---------- 主题 ---------- */

  function readTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);

    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀' : '☾';
      btn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light theme' : '切换到深色主题'
      );
    }

    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
  }

  /* ---------- 导航高亮（scrollspy） ---------- */

  function initScrollSpy() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll('.nav__links a[href^="#"]')
    );
    if (!links.length || !('IntersectionObserver' in window)) return;

    var byId = {};
    var targets = [];

    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if (!el) return;
      byId[id] = a;
      targets.push(el);
    });

    if (!targets.length) return;

    // 记录每个区块当前是否在观察窗内，再挑最靠上的那个高亮。
    // 只看 isIntersecting 会在多个区块同时可见时来回跳。
    var visible = {};

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting;
        });

        var current = null;
        for (var i = 0; i < targets.length; i++) {
          if (visible[targets[i].id]) {
            current = targets[i].id;
            break;
          }
        }

        links.forEach(function (a) {
          a.classList.remove('is-active');
          a.removeAttribute('aria-current');
        });

        if (current && byId[current]) {
          byId[current].classList.add('is-active');
          byId[current].setAttribute('aria-current', 'true');
        }
      },
      {
        // 顶部让开吸顶导航，底部收紧，使"当前区块"贴近视口上方
        rootMargin: '-70px 0px -55% 0px',
        threshold: 0
      }
    );

    targets.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- 启动 ---------- */

  function init() {
    applyLang(readLang());
    applyTheme(readTheme());

    var langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
      langBtn.addEventListener('click', function () {
        applyLang(root.getAttribute('data-lang') === 'zh' ? 'en' : 'zh');
      });
    }

    var themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
      });
    }

    // 用户没显式选过主题时，跟随系统变化
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function (e) {
        var explicit = null;
        try {
          explicit = localStorage.getItem(THEME_KEY);
        } catch (err) {}
        if (!explicit) applyTheme(e.matches ? 'dark' : 'light');
      };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }

    initScrollSpy();

    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
