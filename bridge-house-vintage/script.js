/* ============================================================
   Bridge House Vintage | interactions
   Reveal-on-load safe. Above-the-fold is never left hidden.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- current year in footer ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  /* ---- assign stagger delays from data-reveal-delay ---- */
  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal]")
  );
  revealEls.forEach(function (el) {
    var d = el.getAttribute("data-reveal-delay");
    if (d) { el.style.setProperty("--d", d); }
  });

  function show(el) { el.classList.add("is-visible"); }

  /* ---- reduced motion: reveal everything immediately ---- */
  if (reduceMotion) {
    revealEls.forEach(show);
  } else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          show(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) {
      /* Reveal anything already in view on load (covers the hero). */
      var r = el.getBoundingClientRect();
      var inView = r.top < (window.innerHeight || document.documentElement.clientHeight) && r.bottom > 0;
      if (inView) {
        show(el);
      } else {
        io.observe(el);
      }
    });
  } else {
    /* No observer support: just show them all. */
    revealEls.forEach(show);
  }

  /* ---- load fallback: nothing stays hidden ---- */
  window.addEventListener("load", function () {
    revealEls.forEach(function (el) {
      if (!el.classList.contains("is-visible")) {
        var r = el.getBoundingClientRect();
        var inView = r.top < (window.innerHeight || document.documentElement.clientHeight) && r.bottom > 0;
        if (inView || reduceMotion) { show(el); }
      }
    });
  });

  /* ---- hard safety net: never leave content invisible ---- */
  window.setTimeout(function () {
    revealEls.forEach(function (el) {
      if (!el.classList.contains("is-visible")) { show(el); }
    });
  }, 2600);

  /* ---- sticky header transition ---- */
  var header = document.getElementById("siteHeader");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 28) { header.classList.add("scrolled"); }
      else { header.classList.remove("scrolled"); }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
/* Reveal safety net (Storefront Studio QA). */
(function(){function show(el){el.style.opacity='1';el.style.transform='none';}var els=document.querySelectorAll('.reveal,[data-reveal]');if(!els.length)return;if(!('IntersectionObserver' in window)){els.forEach(show);return;}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -5% 0px'});els.forEach(function(el){io.observe(el);});function sweep(){els.forEach(function(el){try{if(getComputedStyle(el).opacity==='0')show(el);}catch(_){}});}window.addEventListener('load',function(){setTimeout(sweep,500);});setTimeout(sweep,1500);})();
