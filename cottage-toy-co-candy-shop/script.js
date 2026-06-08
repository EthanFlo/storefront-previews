/* Cottage Toy Co. & Candy Shop | interactions
   - Sticky header transition on scroll
   - Staggered scroll-reveal that ALSO reveals in-view elements on load
   - window load fallback so nothing stays hidden above the fold */

(function () {
  "use strict";

  var header = document.getElementById("siteHeader");
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- Sticky header transition ----- */
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ----- Reveal helper with stagger by group ----- */
  function revealEl(el) {
    el.classList.add("is-visible");
  }

  function revealNow(els) {
    els.forEach(function (el, i) {
      var delay = prefersReduced ? 0 : Math.min(i, 5) * 90;
      window.setTimeout(function () { revealEl(el); }, delay);
    });
  }

  /* If reduced motion, just show everything immediately. */
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(revealEl);
  } else {
    var observer = new IntersectionObserver(function (entries, obs) {
      var batch = [];
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          batch.push(entry.target);
          obs.unobserve(entry.target);
        }
      });
      if (batch.length) revealNow(batch);
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) { observer.observe(el); });

    /* Reveal anything already in view on load (e.g. the hero, above the fold). */
    function revealInView() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      revealEls.forEach(function (el) {
        if (el.classList.contains("is-visible")) return;
        var rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.95 && rect.bottom > 0) {
          revealEl(el);
        }
      });
    }
    revealInView();
    document.addEventListener("DOMContentLoaded", revealInView);
  }

  /* ----- Hard fallback: once everything is loaded, nothing stays hidden ----- */
  window.addEventListener("load", function () {
    revealEls.forEach(function (el) {
      if (!el.classList.contains("is-visible")) {
        el.classList.add("is-visible");
      }
    });
  });
})();
/* Reveal safety net (Storefront Studio QA). */
(function(){function show(el){el.style.opacity='1';el.style.transform='none';}var els=document.querySelectorAll('.reveal,[data-reveal]');if(!els.length)return;if(!('IntersectionObserver' in window)){els.forEach(show);return;}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -5% 0px'});els.forEach(function(el){io.observe(el);});function sweep(){els.forEach(function(el){try{if(getComputedStyle(el).opacity==='0')show(el);}catch(_){}});}window.addEventListener('load',function(){setTimeout(sweep,500);});setTimeout(sweep,1500);})();
