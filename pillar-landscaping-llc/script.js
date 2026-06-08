(function () {
  "use strict";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Current year in footer
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Scroll reveal
  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll(".reveal")
  );

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  // Subtle hero parallax
  var heroBg = document.querySelector("[data-parallax]");
  if (heroBg && !reduceMotion) {
    var ticking = false;
    var update = function () {
      var offset = window.pageYOffset || 0;
      if (offset < window.innerHeight) {
        heroBg.style.transform = "translate3d(0," + offset * 0.18 + "px,0)";
      }
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }

  // Demo quote form (no real submission)
  var form = document.getElementById("quote-form");
  var status = document.getElementById("form-status");

  if (form && status) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.querySelector("#name");
      var phone = form.querySelector("#phone");

      var nameVal = name && name.value.trim();
      var phoneVal = phone && phone.value.trim();

      if (!nameVal || !phoneVal) {
        status.textContent =
          "Please add your name and a phone number so Ben can reach you.";
        status.classList.add("error");
        if (!nameVal && name) {
          name.focus();
        } else if (phone) {
          phone.focus();
        }
        return;
      }

      status.classList.remove("error");
      status.textContent =
        "Thanks, " +
        nameVal +
        ". This is a demo, so nothing was sent. On the live site, Ben would get this and call you back at " +
        phoneVal +
        ".";
      form.reset();
    });
  }
})();

/* Reveal safety net (added by Storefront Studio QA): guarantees no element stays
   invisible if the primary scroll-reveal misses on-load / above-the-fold content. */
(function () {
  function show(el){ el.style.opacity = '1'; el.style.transform = 'none'; }
  var els = document.querySelectorAll('.reveal,[data-reveal]');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) { els.forEach(show); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
  els.forEach(function (el) { io.observe(el); });
  function sweep(){ els.forEach(function (el){ try { if (getComputedStyle(el).opacity === '0') show(el); } catch(_){} }); }
  window.addEventListener('load', function(){ setTimeout(sweep, 500); });
  setTimeout(sweep, 1500);
})();
