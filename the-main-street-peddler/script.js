/* The Main Street Peddler
   Sticky header transition, staggered scroll reveal, and a safe load fallback
   so nothing above the fold can stay hidden. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Sticky header tone change on scroll */
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Reveal helper, with optional stagger delay from data-reveal-delay */
  function reveal(el) {
    var delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
    if (reduceMotion) {
      el.classList.add('is-visible');
      return;
    }
    window.setTimeout(function () {
      el.classList.add('is-visible');
    }, delay * 110);
  }

  var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  /* If motion is reduced or IntersectionObserver is missing, show everything now */
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) {
      /* Reveal anything already in view on load, observe the rest */
      var rect = el.getBoundingClientRect();
      var inView = rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom > 0;
      if (inView) {
        reveal(el);
      } else {
        observer.observe(el);
      }
    });
  }

  /* Load fallback: anything still hidden gets revealed so the page can never
     be left blank, even if the observer never fires. */
  window.addEventListener('load', function () {
    window.setTimeout(function () {
      items.forEach(function (el) {
        if (!el.classList.contains('is-visible')) {
          el.classList.add('is-visible');
        }
      });
    }, 600);
  });

})();
/* Reveal safety net (Storefront Studio QA). */
(function(){function show(el){el.style.opacity='1';el.style.transform='none';}var els=document.querySelectorAll('.reveal,[data-reveal]');if(!els.length)return;if(!('IntersectionObserver' in window)){els.forEach(show);return;}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -5% 0px'});els.forEach(function(el){io.observe(el);});function sweep(){els.forEach(function(el){try{if(getComputedStyle(el).opacity==='0')show(el);}catch(_){}});}window.addEventListener('load',function(){setTimeout(sweep,500);});setTimeout(sweep,1500);})();
