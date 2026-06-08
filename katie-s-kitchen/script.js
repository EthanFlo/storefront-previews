/* Katie's Kitchen | interactions
   - scroll reveal (reveals in-view on load + load fallback so the page is never blank)
   - hero image settle + gentle parallax
   - sticky header transition
   - demo inquiry form (no real submission)
*/
(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Hero settle (scale 1.06 -> 1) ---------- */
  var hero = document.getElementById("hero");
  if (hero) {
    // Mark ready on next frame so the CSS transition runs from the start state.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add("is-ready");
      });
    });
  }

  /* ---------- Reveal on scroll, with safe fallbacks ---------- */
  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal], .reveal")
  );

  function showAll() {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealEls.forEach(function (el) {
      // Reveal anything already on screen at load immediately.
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) {
        el.classList.add("is-in");
      } else {
        io.observe(el);
      }
    });

    // Final safety net: once everything has loaded, reveal anything still hidden
    // that happens to sit in view, so we never strand visible content at opacity 0.
    window.addEventListener("load", function () {
      revealEls.forEach(function (el) {
        if (el.classList.contains("is-in")) return;
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("is-in");
        }
      });
    });
  }

  /* ---------- Sticky header transition ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        if (window.scrollY > 12) header.classList.add("is-stuck");
        else header.classList.remove("is-stuck");
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Gentle hero parallax (disabled for reduced motion / touch) ---------- */
  var heroPhoto = document.querySelector("[data-parallax]");
  if (heroPhoto && !reduceMotion && window.matchMedia("(min-width: 700px)").matches) {
    var raf = null;
    window.addEventListener(
      "scroll",
      function () {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var y = window.scrollY;
          if (y < 900) {
            heroPhoto.style.transform =
              "scale(1.06) translateY(" + (y * 0.08).toFixed(1) + "px)";
          }
          raf = null;
        });
      },
      { passive: true }
    );
  }

  /* ---------- Demo inquiry form ---------- */
  var form = document.getElementById("inquire");
  if (form) {
    var note = form.querySelector("[data-form-note]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (note) {
        note.hidden = false;
        note.textContent =
          "Thanks. This is a preview form, so nothing was sent yet. Once the site is live, your note goes straight to Katie's inbox.";
      }
      var btn = form.querySelector("button[type=submit]");
      if (btn) {
        btn.textContent = "Got it";
        btn.disabled = true;
      }
    });
  }

  /* ---------- Footer year is static text; nothing else needed ---------- */
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
