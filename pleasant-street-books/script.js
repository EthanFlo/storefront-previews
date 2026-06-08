(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Current year in footer
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Sticky header transition
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

  // Hero image scale-in once it's loaded (honors reduced motion via CSS)
  var hero = document.querySelector(".hero");
  var heroImg = hero ? hero.querySelector(".hero-img img") : null;
  function readyHero() {
    if (hero) hero.classList.add("img-ready");
  }
  if (heroImg) {
    if (heroImg.complete) {
      readyHero();
    } else {
      heroImg.addEventListener("load", readyHero);
      heroImg.addEventListener("error", readyHero);
    }
  } else {
    readyHero();
  }

  // Reveal on scroll, with staggering, and reveal anything already in view on load
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function revealNow(el) {
    el.classList.add("in");
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(revealNow);
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          // stagger items that share a parent
          var siblings = Array.prototype.slice.call(
            el.parentNode ? el.parentNode.querySelectorAll(".reveal") : [el]
          );
          var idx = siblings.indexOf(el);
          var delay = idx > 0 ? Math.min(idx * 90, 450) : 0;
          setTimeout(function () { revealNow(el); }, delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) {
      observer.observe(el);
      // Reveal immediately if already in view on initial load (above the fold)
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        revealNow(el);
        observer.unobserve(el);
      }
    });
  }

  // Window load fallback: nothing should remain hidden after full load
  window.addEventListener("load", function () {
    revealEls.forEach(function (el) {
      if (!el.classList.contains("in")) {
        revealNow(el);
      }
    });
    readyHero();
  });

  // Mobile sticky call button: show after a little scroll
  var mobileCall = document.querySelector(".mobile-call");
  function toggleMobileCall() {
    if (!mobileCall) return;
    if (window.scrollY > 320) {
      mobileCall.classList.add("show");
    } else {
      mobileCall.classList.remove("show");
    }
  }
  toggleMobileCall();
  window.addEventListener("scroll", toggleMobileCall, { passive: true });
})();
/* Reveal safety net (Storefront Studio QA). */
(function(){function show(el){el.style.opacity='1';el.style.transform='none';}var els=document.querySelectorAll('.reveal,[data-reveal]');if(!els.length)return;if(!('IntersectionObserver' in window)){els.forEach(show);return;}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -5% 0px'});els.forEach(function(el){io.observe(el);});function sweep(){els.forEach(function(el){try{if(getComputedStyle(el).opacity==='0')show(el);}catch(_){}});}window.addEventListener('load',function(){setTimeout(sweep,500);});setTimeout(sweep,1500);})();
