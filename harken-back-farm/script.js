/* ============================================================
   Harken Back Farm | interactions
   - Scroll reveal (reveals in-view on load + load fallback)
   - Sticky header transition
   - Subtle hero parallax
   - Current year
   ============================================================ */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Current year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  function revealNow(el) { el.classList.add('is-in'); }

  if (prefersReduced || !('IntersectionObserver' in window)) {
    // Show everything immediately
    revealEls.forEach(revealNow);
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Stagger within a group based on DOM order among siblings
          var el = entry.target;
          var delay = 0;
          var sibs = el.parentElement
            ? Array.prototype.slice.call(el.parentElement.querySelectorAll('[data-reveal]'))
            : [el];
          var idx = sibs.indexOf(el);
          if (idx > 0) { delay = Math.min(idx, 5) * 80; }
          el.style.transitionDelay = delay + 'ms';
          revealNow(el);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(function (el) {
      // CRITICAL: reveal anything already in view on load right away
      var rect = el.getBoundingClientRect();
      var inView = rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
                   rect.bottom > 0;
      if (inView) {
        revealNow(el);
      } else {
        io.observe(el);
      }
    });

    // Safety net: anything still hidden after full load gets revealed
    window.addEventListener('load', function () {
      window.setTimeout(function () {
        revealEls.forEach(function (el) {
          var rect = el.getBoundingClientRect();
          var inView = rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
                       rect.bottom > 0;
          if (inView && !el.classList.contains('is-in')) {
            revealNow(el);
          }
        });
      }, 60);
    });
  }

  /* ---------- Sticky header transition ---------- */
  var header = document.getElementById('siteHeader');
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  onScrollHeader();

  /* ---------- Hero parallax (subtle) ---------- */
  var heroImg = document.querySelector('.hero-img');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      onScrollHeader();
      if (heroImg && !prefersReduced) {
        var y = window.scrollY;
        if (y < window.innerHeight) {
          heroImg.style.transform = 'scale(1.04) translateY(' + (y * 0.12) + 'px)';
        }
      }
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Smooth anchor focus for accessibility ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id && id.length > 1) {
        var target = document.querySelector(id);
        if (target) {
          // allow native smooth scroll; move focus after
          window.setTimeout(function () {
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
          }, 400);
        }
      }
    });
  });
})();
/* Reveal safety net (Storefront Studio QA): guarantees nothing stays invisible on load. */
(function () {
  function show(el){ el.style.opacity='1'; el.style.transform='none'; }
  var els=document.querySelectorAll('.reveal,[data-reveal]'); if(!els.length) return;
  if(!('IntersectionObserver' in window)){els.forEach(show);return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -5% 0px'});
  els.forEach(function(el){io.observe(el);});
  function sweep(){els.forEach(function(el){try{if(getComputedStyle(el).opacity==='0')show(el);}catch(_){}});}
  window.addEventListener('load',function(){setTimeout(sweep,500);}); setTimeout(sweep,1500);
})();
