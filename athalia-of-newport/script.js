/* Athalia of Newport | interactions
   Goals: never leave content hidden, honor reduced motion. */

(function () {
  "use strict";

  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---- Sticky header transition ---- */
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

  /* ---- Reveal on scroll ---- */
  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal]")
  );

  function showAll() {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  // If reduced motion, just show everything immediately.
  if (prefersReduced || !("IntersectionObserver" in window)) {
    showAll();
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
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });

    // Reveal anything already in view on load (critical for above-the-fold).
    function revealInView() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      revealEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) {
          el.classList.add("is-visible");
        }
      });
    }
    revealInView();

    // Fallback: once the page has fully loaded, reveal anything still hidden.
    window.addEventListener("load", function () {
      revealInView();
      // Safety net a beat later in case images shifted layout.
      setTimeout(function () {
        var stillHidden = revealEls.filter(function (el) {
          return !el.classList.contains("is-visible");
        });
        var vh = window.innerHeight || document.documentElement.clientHeight;
        stillHidden.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < vh && r.bottom > 0) {
            el.classList.add("is-visible");
          }
        });
      }, 600);
    });
  }

  /* ---- Smooth anchor scrolling with header offset ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        70;
      window.scrollTo({
        top: top,
        behavior: prefersReduced ? "auto" : "smooth"
      });
    });
  });
})();
/* Reveal safety net (Storefront Studio QA). */
(function(){function show(el){el.style.opacity='1';el.style.transform='none';}var els=document.querySelectorAll('.reveal,[data-reveal]');if(!els.length)return;if(!('IntersectionObserver' in window)){els.forEach(show);return;}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -5% 0px'});els.forEach(function(el){io.observe(el);});function sweep(){els.forEach(function(el){try{if(getComputedStyle(el).opacity==='0')show(el);}catch(_){}});}window.addEventListener('load',function(){setTimeout(sweep,500);});setTimeout(sweep,1500);})();
