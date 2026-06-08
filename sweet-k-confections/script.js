(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---------- Sticky header state ---------- */
  var header = document.getElementById("siteHeader");
  var mobileBar = document.querySelector(".mobile-bar");

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;

    if (header) {
      if (y > 40) { header.classList.add("scrolled"); }
      else { header.classList.remove("scrolled"); }
    }

    // Show mobile bar once user is past the hero.
    if (mobileBar) {
      if (y > window.innerHeight * 0.6) { mobileBar.classList.add("show"); }
      else { mobileBar.classList.remove("show"); }
    }
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ---------- Hero parallax (subtle) ---------- */
  var heroPhoto = document.getElementById("heroPhoto");
  if (heroPhoto && !reduceMotion) {
    var heroSection = document.getElementById("hero");
    window.addEventListener("scroll", function () {
      if (!heroSection) return;
      var rect = heroSection.getBoundingClientRect();
      if (rect.bottom < 0) return; // out of view
      var shift = Math.min(window.pageYOffset * 0.18, 90);
      heroPhoto.style.transform = "scale(1.06) translateY(" + shift + "px)";
    }, { passive: true });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Inquiry form -> mailto handoff ---------- */
  var form = document.getElementById("inquireForm");
  var success = document.getElementById("formSuccess");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = (document.getElementById("name").value || "").trim();
      var email = (document.getElementById("email").value || "").trim();
      var type = document.getElementById("event").value || "";
      var date = document.getElementById("date").value || "";
      var guests = document.getElementById("guests").value || "";
      var details = (document.getElementById("details").value || "").trim();

      // Light validation: name + email required.
      if (!name || !email) {
        var firstEmpty = !name ? document.getElementById("name") : document.getElementById("email");
        if (firstEmpty) { firstEmpty.focus(); }
        return;
      }

      var lines = [
        "Name: " + name,
        "Email: " + email,
        "Event type: " + type,
        "Event date: " + (date || "not set"),
        "Approx. guests: " + (guests || "not set"),
        "",
        "Details:",
        (details || "(none added)")
      ];

      var subject = "Cake inquiry from " + name;
      var body = lines.join("\n");
      var href = "mailto:hello@sweetkconfections.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      if (success) { success.hidden = false; }
      window.location.href = href;
    });
  }

  /* ---------- Smooth in-page anchors (respect reduced motion) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });
    });
  });
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
