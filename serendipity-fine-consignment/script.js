/* ============================================================
   Serendipity Fine Consignment  -  interactions
   - Sticky header transition on scroll
   - Scroll reveal (fade + rise), staggered
   - Reveal-on-load safety: anything in view on load shows
     immediately, plus a window 'load' fallback for the rest
   - Subtle hero image settle on load
   - Honors prefers-reduced-motion
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---- Hero settle: scale image down once it's ready ---- */
  var hero = document.querySelector(".hero");
  function readyHero() {
    if (hero) { hero.classList.add("is-ready"); }
  }
  if (hero) {
    var heroImg = hero.querySelector(".hero-img");
    if (heroImg && heroImg.complete) {
      requestAnimationFrame(readyHero);
    } else if (heroImg) {
      heroImg.addEventListener("load", readyHero, { once: true });
      heroImg.addEventListener("error", readyHero, { once: true });
      // hard fallback so the hero never stays zoomed
      setTimeout(readyHero, 600);
    } else {
      readyHero();
    }
  }

  /* ---- Sticky header transition ---- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) { return; }
    if (window.pageYOffset > 24) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  if (header) {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function showAll() {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Reduced motion or no IntersectionObserver: just show everything.
  if (prefersReduced || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) {
      // CRITICAL: if it's already on screen at load, reveal now so the
      // fold is never blank waiting for a scroll.
      var rect = el.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < vh * 0.92 && rect.bottom > 0) {
        el.classList.add("is-visible");
      } else {
        io.observe(el);
      }
    });

    // Fallback: once everything has loaded, force-reveal anything still
    // hidden that has scrolled into view (covers anything the observer missed).
    window.addEventListener("load", function () {
      window.setTimeout(function () {
        revealEls.forEach(function (el) {
          if (!el.classList.contains("is-visible")) {
            var r = el.getBoundingClientRect();
            var vh2 = window.innerHeight || document.documentElement.clientHeight;
            if (r.top < vh2) {
              el.classList.add("is-visible");
            }
          }
        });
      }, 120);
    });
  }

  /* ---- Smooth anchor focus for accessibility ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function () {
      var id = link.getAttribute("href");
      if (!id || id === "#") { return; }
      var target = document.querySelector(id);
      if (!target) { return; }
      window.setTimeout(function () {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }, 420);
    });
  });
})();

/* Reveal safety net (Storefront Studio QA): guarantees nothing stays invisible on load. */
(function(){function show(el){el.style.opacity='1';el.style.transform='none';}var els=document.querySelectorAll('.reveal,[data-reveal]');if(!els.length)return;if(!('IntersectionObserver' in window)){els.forEach(show);return;}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -5% 0px'});els.forEach(function(el){io.observe(el);});function sweep(){els.forEach(function(el){try{if(getComputedStyle(el).opacity==='0')show(el);}catch(_){}});}window.addEventListener('load',function(){setTimeout(sweep,500);});setTimeout(sweep,1500);})();
