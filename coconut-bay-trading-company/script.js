(function () {
  "use strict";

  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Current year in footer */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Sticky header transition on scroll */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 24) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Hero image scale-in once the image is ready */
  var hero = document.querySelector(".hero");
  function readyHero() {
    if (hero) hero.classList.add("is-ready");
  }
  var heroImg = document.querySelector(".hero-img");
  if (heroImg) {
    if (heroImg.complete) {
      requestAnimationFrame(readyHero);
    } else {
      heroImg.addEventListener("load", readyHero);
      heroImg.addEventListener("error", readyHero);
    }
  }
  /* Safety: never leave the hero unscaled-in for long */
  window.setTimeout(readyHero, 600);

  /* Reveal-on-scroll, with reveal-in-view on load */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  function showAll() {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  if (prefersReduced || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var inView = rect.top < (window.innerHeight || document.documentElement.clientHeight) && rect.bottom > 0;
      if (inView) {
        /* Anything already in view (above the fold) reveals immediately on load */
        el.classList.add("is-in");
      } else {
        observer.observe(el);
      }
    });
  }

  /* Window load fallback: reveal anything still hidden */
  window.addEventListener("load", function () {
    revealEls.forEach(function (el) {
      if (!el.classList.contains("is-in")) {
        var rect = el.getBoundingClientRect();
        var inView = rect.top < (window.innerHeight || document.documentElement.clientHeight) && rect.bottom > 0;
        if (inView || prefersReduced) {
          el.classList.add("is-in");
        }
      }
    });
  });

  /* Smooth-scroll for in-page anchors, closing any default jump */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "start"
      });
    });
  });
})();
/* Reveal safety net (Storefront Studio QA). */
(function(){function show(el){el.style.opacity='1';el.style.transform='none';}var els=document.querySelectorAll('.reveal,[data-reveal]');if(!els.length)return;if(!('IntersectionObserver' in window)){els.forEach(show);return;}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -5% 0px'});els.forEach(function(el){io.observe(el);});function sweep(){els.forEach(function(el){try{if(getComputedStyle(el).opacity==='0')show(el);}catch(_){}});}window.addEventListener('load',function(){setTimeout(sweep,500);});setTimeout(sweep,1500);})();
