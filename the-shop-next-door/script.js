/* ============================================================
   The Shop Next Door | interactions
   - Scroll reveal that ALSO shows in-view + on-load elements
   - Sticky header state
   - Subtle hero parallax (rAF, reduced-motion aware)
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  /* ---------- Reveal on scroll (+ on load / in view) ---------- */
  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal]")
  );

  function showAll() {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    // No motion or no observer: everything is simply visible.
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
      var rect = el.getBoundingClientRect();
      var inView = rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
                   rect.bottom > 0;
      if (inView) {
        // Anything already on screen at load reveals immediately. Hero never blanks.
        el.classList.add("is-visible");
      } else {
        io.observe(el);
      }
    });

    // Fallback: once the page fully loads, reveal anything still hidden.
    window.addEventListener("load", function () {
      revealEls.forEach(function (el) {
        if (!el.classList.contains("is-visible")) {
          var rect = el.getBoundingClientRect();
          var inView = rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
                       rect.bottom > 0;
          if (inView) { el.classList.add("is-visible"); }
        }
      });
    });

    // Hard safety net: never leave above-the-fold content stuck hidden.
    setTimeout(function () {
      revealEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) {
          el.classList.add("is-visible");
        }
      });
    }, 1200);
  }

  /* ---------- Sticky header state ---------- */
  var header = document.getElementById("siteHeader");
  function onScrollHeader() {
    if (!header) { return; }
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  onScrollHeader();

  /* ---------- Hero parallax ---------- */
  var heroImg = document.querySelector("[data-parallax]");
  var ticking = false;

  function updateScrollEffects() {
    onScrollHeader();
    if (heroImg && !reduceMotion) {
      var y = window.scrollY;
      if (y < window.innerHeight) {
        // gentle downward drift + held scale
        var shift = y * 0.18;
        heroImg.style.transform = "translateY(" + shift + "px) scale(1.04)";
      }
    }
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  }, { passive: true });

  /* ---------- Smooth anchor focus for accessibility ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id && id.length > 1) {
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start"
          });
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }
      }
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
