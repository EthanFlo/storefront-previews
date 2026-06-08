/* ============================================================
   Love Saves the Day - interactions
   Reveal on scroll, sticky header, hero zoom.
   Above-the-fold content reveals on load. A window load
   fallback reveals anything still hidden so the hero is
   never blank.
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal]")
  );

  function show(el) {
    el.classList.add("is-visible");
  }

  // If motion is reduced, just show everything right away.
  if (reduceMotion) {
    revealEls.forEach(show);
  } else if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          // Small stagger for items revealed together.
          var delay = Math.min(i * 80, 320);
          var el = entry.target;
          setTimeout(function () { show(el); }, delay);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) { observer.observe(el); });

    // Reveal anything already in view on load (above the fold).
    function revealInView() {
      revealEls.forEach(function (el) {
        if (el.classList.contains("is-visible")) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          show(el);
          observer.unobserve(el);
        }
      });
    }
    revealInView();

    // Hard fallback: once everything has loaded, reveal any
    // element still hidden so nothing stays invisible.
    window.addEventListener("load", function () {
      revealInView();
      setTimeout(function () {
        revealEls.forEach(show);
      }, 900);
    });
  } else {
    // No IntersectionObserver support, show everything.
    revealEls.forEach(show);
  }

  // ---------- Hero image scale-in ----------
  var heroPhoto = document.getElementById("heroPhoto");
  if (heroPhoto && !reduceMotion) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        heroPhoto.classList.add("zoomed");
      });
    });
  }

  // ---------- Sticky header transition ----------
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

  // Safety net: if for any reason styles loaded but JS reveal
  // never fired for above-the-fold items, ensure visibility.
  setTimeout(function () {
    revealEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        show(el);
      }
    });
  }, 600);

})();
/* Reveal safety net (Storefront Studio QA). */
(function(){function show(el){el.style.opacity='1';el.style.transform='none';}var els=document.querySelectorAll('.reveal,[data-reveal]');if(!els.length)return;if(!('IntersectionObserver' in window)){els.forEach(show);return;}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -5% 0px'});els.forEach(function(el){io.observe(el);});function sweep(){els.forEach(function(el){try{if(getComputedStyle(el).opacity==='0')show(el);}catch(_){}});}window.addEventListener('load',function(){setTimeout(sweep,500);});setTimeout(sweep,1500);})();
