/* ===========================================================
   ZenDen | script.js
   Sticky header, hero load, staggered scroll reveal.
   Reveals in-view elements on load and has a load fallback so
   nothing above the fold can stay hidden.
   =========================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Sticky header transition ---- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Hero image scale-in on load ---- */
  var hero = document.querySelector(".hero");
  if (hero) {
    requestAnimationFrame(function () {
      hero.classList.add("loaded");
    });
  }

  /* ---- Reveal helper ---- */
  function reveal(el) {
    el.classList.add("is-visible");
  }

  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  /* If reduced motion, show everything immediately and stop. */
  if (reduceMotion) {
    revealEls.forEach(reveal);
    return;
  }

  /* Reveal anything already in view right now (covers above the fold on load). */
  function revealInView() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    revealEls.forEach(function (el) {
      if (el.classList.contains("is-visible")) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) {
        reveal(el);
      }
    });
  }
  revealInView();

  /* IntersectionObserver for the rest as they scroll into view. */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) {
      if (!el.classList.contains("is-visible")) {
        io.observe(el);
      }
    });
  } else {
    /* No observer support: just show everything. */
    revealEls.forEach(reveal);
  }

  /* ---- Load fallback: reveal anything still hidden after full load. ---- */
  window.addEventListener("load", function () {
    revealInView();
    /* Safety net a moment later in case of late layout shifts. */
    setTimeout(function () {
      revealEls.forEach(function (el) {
        if (!el.classList.contains("is-visible")) {
          var r = el.getBoundingClientRect();
          var vh = window.innerHeight || document.documentElement.clientHeight;
          if (r.top < vh) reveal(el);
        }
      });
    }, 400);
  });
})();
/* Reveal safety net (Storefront Studio QA). */
(function(){function show(el){el.style.opacity='1';el.style.transform='none';}var els=document.querySelectorAll('.reveal,[data-reveal]');if(!els.length)return;if(!('IntersectionObserver' in window)){els.forEach(show);return;}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -5% 0px'});els.forEach(function(el){io.observe(el);});function sweep(){els.forEach(function(el){try{if(getComputedStyle(el).opacity==='0')show(el);}catch(_){}});}window.addEventListener('load',function(){setTimeout(sweep,500);});setTimeout(sweep,1500);})();
