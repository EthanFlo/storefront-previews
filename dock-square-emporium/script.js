/* ============================================================
   Dock Square Emporium
   Reveal-on-scroll (with on-load + load fallback safety),
   sticky header transition, subtle hero parallax, year stamp.
   Honors prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---- Reveal on scroll ----
     Critical: anything already in view on load is revealed immediately,
     and a window 'load' fallback reveals anything still hidden so the
     hero (and everything else) can never get stuck at opacity:0. */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function revealNow(el) {
    el.classList.add("is-visible");
  }

  function revealAll() {
    revealEls.forEach(revealNow);
  }

  if (prefersReduced || !("IntersectionObserver" in window)) {
    // No animation desired or supported: just show everything.
    revealAll();
  } else {
    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Stagger items that share a parent for a gentle cascade.
            var el = entry.target;
            var delay = 0;
            var parent = el.parentElement;
            if (parent) {
              var siblings = Array.prototype.filter.call(
                parent.children,
                function (c) {
                  return c.classList && c.classList.contains("reveal");
                }
              );
              var idx = siblings.indexOf(el);
              if (idx > 0) delay = Math.min(idx * 80, 320);
            }
            el.style.transitionDelay = delay + "ms";
            revealNow(el);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealEls.forEach(function (el) {
      // Reveal elements already in the viewport on load right away.
      var rect = el.getBoundingClientRect();
      var inView =
        rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom > 0;
      if (inView) {
        revealNow(el);
      } else {
        observer.observe(el);
      }
    });

    // Safety net: once everything has loaded, force-reveal anything
    // still hidden (covers late layout shifts, failed observers, etc.).
    window.addEventListener("load", function () {
      window.setTimeout(function () {
        revealEls.forEach(function (el) {
          if (!el.classList.contains("is-visible")) {
            var rect = el.getBoundingClientRect();
            var inView =
              rect.top <
                (window.innerHeight || document.documentElement.clientHeight) &&
              rect.bottom > 0;
            if (inView) revealNow(el);
          }
        });
      }, 600);
    });
  }

  /* ---- Sticky header state ---- */
  var header = document.getElementById("siteHeader");
  if (header) {
    var onScrollHeader = function () {
      if (window.pageYOffset > 24) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };
    onScrollHeader();
    window.addEventListener("scroll", onScrollHeader, { passive: true });
  }

  /* ---- Subtle hero parallax + scale ---- */
  var heroImg = document.querySelector(".hero-img");
  if (heroImg && !prefersReduced) {
    var ticking = false;
    var onScrollHero = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = window.pageYOffset;
        // Only bother while the hero is plausibly in view.
        if (y < window.innerHeight) {
          var shift = y * 0.18;
          var scale = 1.08 + Math.min(y / 4000, 0.06);
          heroImg.style.transform =
            "translateY(" + shift + "px) scale(" + scale.toFixed(3) + ")";
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScrollHero, { passive: true });
  }

  /* ---- Smooth in-page anchor focus for accessibility ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      // Let CSS smooth-scroll handle motion; just manage focus target.
      window.setTimeout(function () {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }, prefersReduced ? 0 : 350);
    });
  });
})();

/* Reveal safety net (Storefront Studio QA): guarantees nothing stays invisible on load. */
(function () {
  function show(el){ el.style.opacity='1'; el.style.transform='none'; }
  var els=document.querySelectorAll('.reveal,[data-reveal]'); if(!els.length) return;
  if(!('IntersectionObserver' in window)){els.forEach(show);return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -5% 0px'});
  els.forEach(function(el){io.observe(el);});
  function sweep(){els.forEach(function(el){try{if(getComputedStyle(el).opacity==='0')show(el);}catch(_){}});}
  window.addEventListener('load',function(){setTimeout(sweep,500);}); setTimeout(sweep,1500);
})();
