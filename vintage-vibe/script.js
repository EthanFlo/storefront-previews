/* ============================================================
   VINTAGE VIBE  -  interactions
   Sticky header transition, staggered scroll reveal that never
   leaves the hero blank, gentle hero scale, reduced-motion aware.
   No em dashes anywhere in this file.
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- current year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- sticky header transition ---------- */
  var header = document.getElementById("siteHeader");
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- reveal helper ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function revealNow(el) {
    el.classList.add("is-in");
  }

  if (reduceMotion) {
    // Reduced motion: show everything right away.
    reveals.forEach(revealNow);
  } else if (!("IntersectionObserver" in window)) {
    // No observer support: show everything so nothing stays hidden.
    reveals.forEach(revealNow);
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            // Stagger items that share a parent for a gentle cascade.
            var parent = el.parentElement;
            var siblings = parent
              ? Array.prototype.filter.call(parent.children, function (c) {
                  return c.classList && c.classList.contains("reveal");
                })
              : [el];
            var idx = siblings.indexOf(el);
            var delay = idx > 0 ? Math.min(idx, 5) * 90 : 0;
            setTimeout(function () {
              revealNow(el);
            }, delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    reveals.forEach(function (el) {
      // CRITICAL: anything already in view on load is revealed right away,
      // so the hero is never a blank panel waiting on a scroll.
      var rect = el.getBoundingClientRect();
      var inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        revealNow(el);
      } else {
        observer.observe(el);
      }
    });
  }

  /* ---------- window load fallback: nothing stays hidden ---------- */
  window.addEventListener("load", function () {
    reveals.forEach(function (el) {
      if (!el.classList.contains("is-in")) {
        var rect = el.getBoundingClientRect();
        var inView = rect.top < window.innerHeight + 60 && rect.bottom > 0;
        if (inView || reduceMotion) revealNow(el);
      }
    });
  });

  /* ---------- gentle hero scale on scroll ---------- */
  var heroImg = document.querySelector(".hero-img");
  if (heroImg && !reduceMotion) {
    var ticking = false;
    function updateHero() {
      var y = window.scrollY;
      var heroH = window.innerHeight;
      if (y < heroH) {
        var p = y / heroH; // 0 to 1 across the hero
        var scale = 1.08 + p * 0.05;
        var shift = p * 32;
        heroImg.style.transform =
          "scale(" + scale.toFixed(3) + ") translateY(" + shift.toFixed(1) + "px)";
      }
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateHero);
          ticking = true;
        }
      },
      { passive: true }
    );
    updateHero();
  }

  /* ---------- smooth anchor offset for fixed header ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#" || id === "#top") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var headerH = header ? header.offsetHeight : 0;
      var top =
        target.getBoundingClientRect().top + window.pageYOffset - headerH - 12;
      window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });
})();
/* Reveal safety net (Storefront Studio QA). */
(function(){function show(el){el.style.opacity='1';el.style.transform='none';}var els=document.querySelectorAll('.reveal,[data-reveal]');if(!els.length)return;if(!('IntersectionObserver' in window)){els.forEach(show);return;}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -5% 0px'});els.forEach(function(el){io.observe(el);});function sweep(){els.forEach(function(el){try{if(getComputedStyle(el).opacity==='0')show(el);}catch(_){}});}window.addEventListener('load',function(){setTimeout(sweep,500);});setTimeout(sweep,1500);})();
