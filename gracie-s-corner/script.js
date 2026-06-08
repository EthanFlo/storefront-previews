/* ===========================================================
   Gracie's Corner, Essex CT
   =========================================================== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- current year in footer ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---- hero image scale-in on load ---- */
  var hero = document.querySelector(".hero");
  function loadHero() { if (hero) { hero.classList.add("loaded"); } }
  // kick it on next frame so the transition runs
  requestAnimationFrame(function () { requestAnimationFrame(loadHero); });

  /* ---- sticky header transition ---- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) { return; }
    if (window.scrollY > 40) { header.classList.add("scrolled"); }
    else { header.classList.remove("scrolled"); }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- stagger helper: index reveals inside a group ---- */
  function applyStagger(selector, step) {
    var groups = document.querySelectorAll(selector);
    groups.forEach(function (group) {
      var items = group.querySelectorAll(".reveal");
      items.forEach(function (item, i) {
        item.style.setProperty("--d", (i * step) + "ms");
      });
    });
  }
  applyStagger(".hero-content", 110);
  applyStagger(".shelf-grid", 80);
  applyStagger(".story-facts", 90);

  /* ---- reveal-on-scroll ----
     Critical: reveal anything already in view on load, and a
     window 'load' fallback that reveals anything still hidden.   */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function showAll() {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  if (prefersReduced || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      // already in view on load? show immediately, no waiting on scroll.
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("is-visible");
      } else {
        observer.observe(el);
      }
    });
  }

  /* ---- safety net: nothing should stay hidden after full load ---- */
  window.addEventListener("load", function () {
    setTimeout(function () {
      revealEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("is-visible");
        }
      });
    }, 200);
  });

  /* ---- smooth anchor scrolling with header offset ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id === "#" || id.length < 2) { return; }
      var target = document.querySelector(id);
      if (!target) { return; }
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 74;
      window.scrollTo({
        top: top,
        behavior: prefersReduced ? "auto" : "smooth"
      });
    });
  });

})();
/* Reveal safety net (Storefront Studio QA): guarantees nothing stays invisible on load. */
(function(){function show(el){el.style.opacity='1';el.style.transform='none';}var els=document.querySelectorAll('.reveal,[data-reveal]');if(!els.length)return;if(!('IntersectionObserver' in window)){els.forEach(show);return;}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -5% 0px'});els.forEach(function(el){io.observe(el);});function sweep(){els.forEach(function(el){try{if(getComputedStyle(el).opacity==='0')show(el);}catch(_){}});}window.addEventListener('load',function(){setTimeout(sweep,500);});setTimeout(sweep,1500);})();
