/* The Accidental Peacock
   Scroll reveal, sticky header, mobile call button.
   No em dashes anywhere in this file. */

(function () {
  "use strict";

  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Current year in footer */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* Reveal on scroll. Anything already in view reveals right away,
     and a load fallback clears anything still hidden. */
  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal]")
  );

  function revealAll() {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealAll();
  } else {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          // Stagger items that share a parent for a gentle cascade.
          var siblings = Array.prototype.slice.call(
            el.parentNode.querySelectorAll("[data-reveal]")
          );
          var idx = siblings.indexOf(el);
          var delay = idx > 0 ? Math.min(idx, 5) * 90 : 0;
          setTimeout(function () {
            el.classList.add("is-in");
          }, delay);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) {
      observer.observe(el);
    });

    /* Reveal anything already in the viewport on first paint,
       so the hero is never blank. */
    function revealInView() {
      revealEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("is-in");
        }
      });
    }
    revealInView();

    /* Final safety net. After load, force-reveal anything left hidden. */
    window.addEventListener("load", function () {
      setTimeout(revealAll, 700);
    });
  }

  /* Sticky header transition */
  var header = document.getElementById("siteHeader");
  function onScrollHeader() {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  if (header) {
    onScrollHeader();
    window.addEventListener("scroll", onScrollHeader, { passive: true });
  }

  /* Mobile call button appears after the hero scrolls past */
  var mobileCall = document.querySelector(".mobile-call");
  var hero = document.querySelector(".hero");
  if (mobileCall && hero) {
    if ("IntersectionObserver" in window) {
      var heroObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            mobileCall.classList.remove("show");
          } else {
            mobileCall.classList.add("show");
          }
        });
      }, { threshold: 0 });
      heroObserver.observe(hero);
    } else {
      mobileCall.classList.add("show");
    }
  }
})();
/* Reveal safety net (Storefront Studio QA). */
(function(){function show(el){el.style.opacity='1';el.style.transform='none';}var els=document.querySelectorAll('.reveal,[data-reveal]');if(!els.length)return;if(!('IntersectionObserver' in window)){els.forEach(show);return;}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -5% 0px'});els.forEach(function(el){io.observe(el);});function sweep(){els.forEach(function(el){try{if(getComputedStyle(el).opacity==='0')show(el);}catch(_){}});}window.addEventListener('load',function(){setTimeout(sweep,500);});setTimeout(sweep,1500);})();
