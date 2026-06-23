/* ============================================================
   SUSHI5 · Lynn Valley — behaviour (light minimalist build)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- header scroll state ---------- */
  var hd = document.getElementById("hd");
  function onScroll() {
    if (hd) hd.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- live open / closed ---------- */
  // JS day index 0=Sun..6=Sat → [openMinutes, closeMinutes]
  var HOURS = {
    0: [11 * 60, 18 * 60], // Sun 11–6
    1: [11 * 60, 19 * 60], // Mon 11–7
    2: [11 * 60, 19 * 60], // Tue 11–7
    3: [11 * 60, 19 * 60], // Wed 11–7
    4: [11 * 60, 20 * 60], // Thu 11–8
    5: [11 * 60, 20 * 60], // Fri 11–8
    6: [11 * 60, 19 * 60]  // Sat 11–7
  };

  function vancouverNow() {
    var s = new Date().toLocaleString("en-US", { timeZone: "America/Vancouver" });
    return new Date(s);
  }
  function fmt12(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    var ap = h >= 12 ? "PM" : "AM";
    var hh = h % 12; if (hh === 0) hh = 12;
    return hh + (m ? ":" + (m < 10 ? "0" + m : m) : ":00") + " " + ap;
  }

  function computeStatus() {
    var v = vancouverNow();
    var day = v.getDay();
    var mins = v.getHours() * 60 + v.getMinutes();
    var today = HOURS[day];
    var open = today && mins >= today[0] && mins < today[1];
    var closingSoon = open && (today[1] - mins) <= 45;

    // header pill
    var hdStatus = document.getElementById("hdStatus");
    if (hdStatus) {
      hdStatus.classList.toggle("closed", !open);
      hdStatus.querySelector("span").textContent = open ? "open now" : "closed";
    }

    // hero line
    var hero = document.getElementById("heroStatus");
    if (hero) {
      if (open) {
        hero.innerHTML = (closingSoon ? "<b>Closing soon</b> · " : "<b>Open now</b> · ") +
          "today until " + fmt12(today[1]);
      } else {
        // find next opening
        var next = null, addDays = 0;
        for (var i = 0; i <= 7; i++) {
          var d = (day + i) % 7;
          var h = HOURS[d];
          if (!h) continue;
          if (i === 0 && mins < h[0]) { next = h[0]; addDays = 0; break; }
          if (i > 0) { next = h[0]; addDays = i; break; }
        }
        var when = addDays === 0 ? "today at " + fmt12(next)
          : addDays === 1 ? "tomorrow at " + fmt12(next)
          : "on " + ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][(day + addDays) % 7] + " at " + fmt12(next);
        hero.innerHTML = "<b>Closed now</b> · opens " + when;
      }
    }

    // highlight today's hours row
    var rows = document.querySelectorAll(".hours tr");
    for (var r = 0; r < rows.length; r++) {
      rows[r].classList.toggle("today", parseInt(rows[r].getAttribute("data-day"), 10) === day);
    }
  }
  computeStatus();
  setInterval(computeStatus, 60 * 1000);

  /* ---------- menu render ---------- */
  var MENU = window.SUSHI5_MENU || [];
  var SHORT = {
    "Nigiri Sushi": "Nigiri",
    "Aburi Sushi (Seared)": "Aburi",
    "Sashimi": "Sashimi",
    "Maki / Rolls": "Maki & Rolls",
    "Special / Signature Rolls": "Signature Rolls",
    "Oshi Sushi (Pressed)": "Oshi",
    "Appetizers": "Appetizers",
    "Tempura": "Tempura",
    "Salads": "Salads",
    "Soups & Sides": "Soups & Sides",
    "Donburi / Rice Bowls": "Donburi",
    "Lunch Sets / Combos": "Lunch Sets",
    "Combo Platters & Party Trays": "Combos & Trays"
  };
  function shortLabel(name) {
    if (SHORT[name]) return SHORT[name];
    if (/Teriyaki/i.test(name)) return "Teriyaki";
    if (/Noodles/i.test(name)) return "Noodles";
    return name.replace(/\s*\(.*?\)\s*/g, "").trim();
  }
  function splitName(name) {
    var m = name.match(/^(.*?)\s*\((.*)\)\s*$/);
    if (m) return { main: m[1].trim(), note: m[2].trim() };
    return { main: name, note: "" };
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  var tabsEl = document.getElementById("menuTabs");
  var panelsEl = document.getElementById("menuPanels");
  if (tabsEl && panelsEl && MENU.length) {
    MENU.forEach(function (cat, i) {
      var btn = document.createElement("button");
      btn.className = "tab" + (i === 0 ? " active" : "");
      btn.type = "button";
      btn.setAttribute("role", "tab");
      btn.textContent = shortLabel(cat.name);
      btn.setAttribute("data-i", i);
      tabsEl.appendChild(btn);

      var sn = splitName(cat.name);
      var panel = document.createElement("div");
      panel.className = "menu-panel" + (i === 0 ? " active" : "");
      panel.setAttribute("data-i", i);

      var html = "<h3>" + esc(sn.main) + "</h3>";
      if (sn.note) html += '<p class="panel-note">' + esc(sn.note) + "</p>";
      html += '<ul class="items">';
      cat.items.forEach(function (it) {
        var nm = esc(it[0]), pr = esc(it[1]), ds = it[2] ? esc(it[2]) : "";
        html += '<li><div class="item-top"><span class="item-name">' + nm +
          '</span><span class="item-dots"></span><span class="item-price">' + pr + "</span></div>";
        if (ds) html += '<p class="item-desc">' + ds + "</p>";
        html += "</li>";
      });
      html += "</ul>";
      panel.innerHTML = html;
      panelsEl.appendChild(panel);
    });

    tabsEl.addEventListener("click", function (e) {
      var b = e.target.closest(".tab");
      if (!b) return;
      var i = b.getAttribute("data-i");
      tabsEl.querySelectorAll(".tab").forEach(function (t) { t.classList.toggle("active", t === b); });
      panelsEl.querySelectorAll(".menu-panel").forEach(function (p) {
        p.classList.toggle("active", p.getAttribute("data-i") === i);
      });
      b.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    });
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- order sheet ---------- */
  var sheet = document.getElementById("orderSheet");
  function openSheet() { if (sheet) { sheet.hidden = false; document.body.style.overflow = "hidden"; } }
  function closeSheet() { if (sheet) { sheet.hidden = true; document.body.style.overflow = ""; } }
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-order-open]")) { e.preventDefault(); openSheet(); }
    else if (e.target.closest("[data-order-close]")) { closeSheet(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sheet && !sheet.hidden) closeSheet();
  });
})();
