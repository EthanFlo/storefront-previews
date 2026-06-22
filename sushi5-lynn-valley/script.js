/* ============================================================
   Sushi5 - Lynn Valley. Site behaviour.
   Honest, restrained "the settle" motion. Fails open: if any
   of this throws, the page is already fully visible via CSS.
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     DATA - kept in sync with site-data.json (verified facts).
     ---------------------------------------------------------- */

  // Weekly hours in 24h minutes for America/Vancouver.
  // index 0 = Sunday ... 6 = Saturday
  var HOURS = {
    0: { open: 660, close: 1080, label: "11:00 AM to 6:00 PM" }, // Sun 11-6
    1: { open: 660, close: 1140, label: "11:00 AM to 7:00 PM" }, // Mon 11-7
    2: { open: 660, close: 1140, label: "11:00 AM to 7:00 PM" }, // Tue
    3: { open: 660, close: 1140, label: "11:00 AM to 7:00 PM" }, // Wed
    4: { open: 660, close: 1200, label: "11:00 AM to 8:00 PM" }, // Thu 11-8
    5: { open: 660, close: 1200, label: "11:00 AM to 8:00 PM" }, // Fri
    6: { open: 660, close: 1140, label: "11:00 AM to 7:00 PM" }  // Sat 11-7
  };

  var MENU = [
    { name: "Nigiri Sushi", items: [
      ["Tamago (Egg Omelette)", "$1.50"], ["Hokkigai (Surf Clam)", "$1.50"],
      ["Inari (Bean Curd)", "$1.75"], ["Saba (Mackerel)", "$1.75"],
      ["Ebi (Cooked Prawn)", "$1.75"], ["Masago (Smelt Roe)", "$1.75"],
      ["Hamachi (Yellowtail)", "$1.75"], ["Wild Salmon", "$1.75"],
      ["Smoked Salmon", "$1.95"], ["Tobiko (Flying Fish Roe)", "$1.95"],
      ["Taka (Octopus)", "$1.95"], ["Ika (Squid)", "$2.25"],
      ["Kani (Real Crab)", "$2.25"], ["Unagi (BBQ Eel)", "$2.50"],
      ["Uni (Sea Urchin)", "$2.50"], ["Toro (Tuna Belly)", "$2.50"],
      ["Spot Prawn", "$2.50"], ["Chopped Scallop & Tobiko", "$2.50"],
      ["Tobiko & Quail Egg", "$2.95"], ["Ikura (Salmon Roe)", "$2.95"]
    ]},
    { name: "Aburi Sushi (Seared)", items: [
      ["Seared Tuna", "$2.25"], ["Seared Wild Salmon", "$2.50"],
      ["Seared Toro", "$2.75"], ["Seared Hamachi", "$3.50"]
    ]},
    { name: "Sashimi", items: [
      ["Tuna Sashimi (4 pcs)", "$6.95"], ["Tuna Sashimi (7 pcs)", "$10.95"],
      ["Wild Salmon Sashimi (4 pcs)", "$7.95"], ["Wild Salmon Sashimi (7 pcs)", "$11.95"],
      ["Spicy Tuna Sashimi (5 pcs)", "$7.95"], ["Spicy Wild Salmon Sashimi (5 pcs)", "$8.95"],
      ["Spicy Tuna / Wild Salmon Sashimi (5 pcs)", "$8.95"],
      ["Toro Sashimi, Tuna Belly (5 pcs)", "$11.95"], ["Hamachi Sashimi, Yellowtail (5 pcs)", "$14.95"],
      ["Tuna & Wild Salmon Sashimi (4 pcs each)", "$12.95"],
      ["Half Assorted Sashimi (8 pcs)", "$11.95"], ["Assorted Sashimi (12 pcs)", "$16.95"]
    ]},
    { name: "Maki & Rolls", items: [
      ["Avocado Roll", "$2.95"], ["Cucumber Roll", "$2.95"], ["Tuna Roll", "$2.95"],
      ["Wild Salmon Roll", "$3.25"], ["California Roll", "$3.95", "Crab meat, avocado & cucumber"],
      ["Avocado & Cucumber Roll", "$3.95"], ["Negihamachi Roll", "$3.95", "Yellowtail with green onion"],
      ["Tamago Roll", "$3.95"], ["Spicy Tuna Roll", "$4.25"], ["Salmon Avocado Roll", "$4.50"],
      ["Spicy Wild Salmon Roll", "$4.50"], ["Yam Tempura Roll", "$4.50"], ["Vege Tempura Roll", "$4.50"],
      ["Chopped Scallop Roll", "$4.50"], ["Vegetable Roll", "$4.50"], ["Chicken Breast Teriyaki Roll", "$4.50"],
      ["Beef Teriyaki Roll", "$4.50"], ["Negitoro Roll", "$4.75", "Tuna belly with green onion"],
      ["AAC Roll", "$5.95"], ["B.C. Roll", "$5.95", "BBQ wild salmon skin & vegetable"],
      ["Alaska Roll", "$6.95"], ["Real Crab California Roll", "$6.95"], ["Futo Maki Roll", "$6.95"]
    ]},
    { name: "Special & Signature Rolls", items: [
      ["Lion King Roll", "$15.95", "Prawn tempura, crab, avocado & cucumber, topped with seared wild salmon, Parmesan, crunch potato & tobiko"],
      ["Snow Mountain Roll", "$13.25", "Crab, avocado & cucumber, topped with seared tuna & Parmesan"],
      ["Rainbow Roll", "$15.95"], ["Dragon Roll", "$15.95"], ["Red Dragon Roll", "$10.95"],
      ["Spider Roll", "$10.95"], ["Mexican Roll", "$10.95"], ["Barbie Roll", "$10.95"],
      ["Hawaiian Roll", "$10.95"], ["Pink Tiger Roll", "$10.95"], ["Las Vegas Roll", "$8.95"],
      ["California Salsa Roll", "$8.95"], ["Victoria Roll", "$7.95"], ["New York New York Roll", "$18.95"],
      ["Crispy White Mountain Roll", "$19.95"]
    ]},
    { name: "Oshi Sushi (Pressed)", items: [
      ["Oshisushi Spicy Tuna (6 pcs)", "$10.95"], ["Oshisushi Wild Salmon (6 pcs)", "$10.95"],
      ["Oshisushi Negi Toro (6 pcs)", "$10.95"]
    ]},
    { name: "Appetizers", items: [
      ["Vegetable Sunomono", "$3.95"], ["Shrimp / Octopus Sunomono", "$4.25"], ["Seafood Sunomono", "$4.95"],
      ["Edamame (Steamed Soybean)", "$4.50"], ["Gyoza / Veggie Gyoza (5 pcs)", "$5.50"],
      ["Spinach Gomae", "$4.95", "Spinach with house sesame sauce"],
      ["Chicken Karaage", "$6.95", "Deep fried boneless crispy chicken"],
      ["Angry Jalapeno", "$6.95", "Deep fried jalapeno with cream cheese & spicy tuna"],
      ["Kushiage", "$6.95", "2 skewers chicken breast with house sauce"],
      ["Tuna Tataki", "$10.95"], ["Agedashi Tofu", "$4.95", "Deep fried tofu with dashi-based sauce"],
      ["Spicy Agedashi Tofu", "$5.50"], ["Ebi Mayo", "$7.95"]
    ]},
    { name: "Tempura", items: [
      ["Tempura Appetizer", "$6.95", "3 pcs prawn, 2 pcs yam"],
      ["Prawn Tempura (4 pcs)", "$4.95"], ["Prawn Tempura (8 pcs)", "$7.95"],
      ["Yam Tempura", "$5.95"], ["Vegetable Tempura (8 pcs)", "$8.95"]
    ]},
    { name: "Salads", items: [
      ["Vegetable Sunomono Salad", "$3.95"], ["Seaweed Salad", "$6.95"],
      ["Grilled Chicken Salad", "$8.95"], ["Fresh Tuna Salad", "$8.95"],
      ["Calamari Salad", "$8.95", "Seasoned squid with vegetables"]
    ]},
    { name: "Soups & Sides", items: [
      ["Miso Soup", "$1.75"], ["Spicy Miso Soup", "$1.95"], ["Rice", "$2.50"],
      ["Brown Rice", "$2.50"], ["Side Sauce", "$1.00"]
    ]},
    { name: "Lunch Teriyaki", time: "Mon to Fri, 10 AM to 2 PM, with rice & miso soup", items: [
      ["Chicken / Beef / Tofu Teriyaki", "$9.95"], ["BBQ Short Rib (Korean Style)", "$13.95"]
    ]},
    { name: "Donburi & Rice Bowls", items: [
      ["Tuna Don", "$11.95", "Tuna sashimi on sushi rice"], ["Spicy Tuna Don", "$12.95"],
      ["Wild Salmon Don", "$12.95"], ["Spicy Wild Salmon Don", "$13.95"],
      ["Chirashi Don", "$17.95", "Assorted sashimi on sushi rice"], ["Half Chirashi Don", "$11.95"],
      ["Unagi Don", "$15.95", "Fresh barbecued eel on sushi rice"]
    ]},
    { name: "Noodles", time: "Mon to Fri, 10 AM to 4 PM", items: [
      ["Chicken / Beef Udon", "$9.50"], ["Tempura Udon", "$11.95"],
      ["Chicken / Beef / Vegetable Yaki Soba", "$9.50"], ["Chicken / Beef / Vegetable Yaki Udon", "$9.50"]
    ]},
    { name: "Lunch Sets & Combos", items: [
      ["Lunch A", "$13.95"], ["Lunch B", "$19.95"], ["Lunch C", "$19.95"],
      ["Lunch D", "$11.95"], ["Lunch S", "$11.95"], ["Chef's Choice", "$19.50"]
    ]},
    { name: "Combo Platters & Party Trays", items: [
      ["Tuna & Wild Salmon Combo", "$11.95"], ["Favourite Roll Combo", "$11.95"],
      ["Nigiri Sushi Combo", "$11.95"], ["Spicy Tuna Combo", "$12.95"],
      ["Hercules Roll Combo", "$12.95"], ["New York New York Combo", "$13.95"],
      ["Sashimi & Sushi Combo", "$14.95"], ["Deluxe Sushi Combo", "$16.95"],
      ["Vegetable Combo", "$10.95"], ["Mixed Combo", "$30.95"],
      ["Variety Roll Combo", "$35.95"], ["Premium Combo", "$37.95"],
      ["Party Tray A (for 2 to 3)", "$34.95"], ["Party Tray B (for 3 to 4)", "$44.95"],
      ["Party Tray C (for 4)", "$54.95"]
    ]}
  ];

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function ce(tag, cls) { var el = document.createElement(tag); if (cls) el.className = cls; return el; }

  /* ----------------------------------------------------------
     Vancouver "now": derive local day/minutes regardless of the
     visitor's own timezone, using Intl in the Vancouver zone.
     ---------------------------------------------------------- */
  function vancouverNow() {
    try {
      var fmt = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Vancouver",
        weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false
      });
      var parts = fmt.formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });
      var dayIdx = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[map.weekday];
      var hour = parseInt(map.hour, 10);
      if (hour === 24) hour = 0; // some engines render midnight as 24
      var min = parseInt(map.minute, 10);
      return { day: dayIdx, minutes: hour * 60 + min };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function fmtTime(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    var ap = h >= 12 ? "PM" : "AM";
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    return h12 + (m ? ":" + (m < 10 ? "0" + m : m) : ":00") + " " + ap;
  }

  function computeStatus() {
    var now = vancouverNow();
    var today = HOURS[now.day];
    var result = { open: false, text: "", today: today ? today.label : "" };

    if (today && now.minutes >= today.open && now.minutes < today.close) {
      result.open = true;
      result.text = "Open now · until " + fmtTime(today.close);
      return result;
    }

    // Closed. If before today's open, show today's opening.
    if (today && now.minutes < today.open) {
      result.text = "Closed · opens " + fmtTime(today.open) + " today";
      return result;
    }

    // After close (or no hours today): find the next open day.
    for (var i = 1; i <= 7; i++) {
      var di = (now.day + i) % 7;
      var h = HOURS[di];
      if (h) {
        var dayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][di];
        var when = (i === 1) ? "tomorrow" : dayName;
        result.text = "Closed · opens " + fmtTime(h.open) + " " + when;
        return result;
      }
    }
    result.text = "Closed";
    return result;
  }

  function renderStatus() {
    var st = computeStatus();
    var pill = $("#statusPill"), txt = $("#statusText");
    var heroToday = $("#heroToday");
    var qiToday = $("#qiToday"), qiStatus = $("#qiStatus");

    if (pill) { pill.classList.remove("open", "closed"); pill.classList.add(st.open ? "open" : "closed"); }
    if (txt) txt.textContent = st.text;
    if (heroToday && st.today) heroToday.textContent = "Today " + st.today;
    if (qiToday) qiToday.textContent = st.today || "See hours";
    if (qiStatus) qiStatus.textContent = st.open ? "Open now" : "Closed now";
  }

  function highlightToday() {
    var now = vancouverNow();
    var rows = document.querySelectorAll("#hoursTable tr[data-day]");
    for (var i = 0; i < rows.length; i++) {
      if (parseInt(rows[i].getAttribute("data-day"), 10) === now.day) {
        rows[i].classList.add("today");
      }
    }
  }

  /* ----------------------------------------------------------
     MENU rendering + tabs
     ---------------------------------------------------------- */
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

  function renderMenu() {
    var tabsEl = $("#menuTabs"), bodyEl = $("#menuBody");
    if (!tabsEl || !bodyEl) return;

    var frag = document.createDocumentFragment();
    var tabFrag = document.createDocumentFragment();

    MENU.forEach(function (section, idx) {
      var id = "cat-" + slug(section.name);

      var tab = ce("button", "menu-tab");
      tab.type = "button";
      tab.textContent = section.name;
      tab.setAttribute("data-target", id);
      if (idx === 0) tab.classList.add("active");
      tabFrag.appendChild(tab);

      var sec = ce("div", "menu-section");
      sec.id = id;

      var head = ce("div", "menu-section-head");
      var h3 = ce("h3"); h3.textContent = section.name; head.appendChild(h3);
      if (section.time) {
        var t = ce("span", "menu-section-time"); t.textContent = section.time; head.appendChild(t);
      }
      sec.appendChild(head);

      var grid = ce("div", "menu-items");
      section.items.forEach(function (it) {
        var row = ce("div", "menu-item");
        var main = ce("div", "menu-item-main");
        var nm = ce("span", "menu-item-name"); nm.textContent = it[0];
        main.appendChild(nm);
        if (it[2]) { var d = ce("p", "menu-item-desc"); d.textContent = it[2]; main.appendChild(d); }
        var price = ce("span", "menu-item-price"); price.textContent = it[1];
        row.appendChild(main); row.appendChild(price);
        grid.appendChild(row);
      });
      sec.appendChild(grid);
      frag.appendChild(sec);
    });

    tabsEl.appendChild(tabFrag);
    bodyEl.appendChild(frag);

    // Tab click -> smooth scroll to section
    tabsEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".menu-tab");
      if (!btn) return;
      var target = document.getElementById(btn.getAttribute("data-target"));
      if (target) target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
    });

    // Highlight active tab as sections scroll past
    if ("IntersectionObserver" in window) {
      var sections = bodyEl.querySelectorAll(".menu-section");
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            var id = en.target.id;
            var tabs = tabsEl.querySelectorAll(".menu-tab");
            tabs.forEach(function (tb) {
              var on = tb.getAttribute("data-target") === id;
              tb.classList.toggle("active", on);
              if (on && tb.scrollIntoView) {
                try { tb.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" }); } catch (e2) {}
              }
            });
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
      sections.forEach(function (s) { spy.observe(s); });
    }
  }

  /* ----------------------------------------------------------
     Scroll reveals (IntersectionObserver) + rescue sweep
     ---------------------------------------------------------- */
  function setupReveals() {
    var targets = document.querySelectorAll(".reveal-card, .section-head .reveal-text, .story-text .reveal-text, .visit-info.reveal-text");

    if (prefersReduced || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); obs.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    targets.forEach(function (el) { io.observe(el); });

    // Rescue sweep: after load + 1.5s, reveal anything still hidden
    // and near the viewport so nothing is ever stuck at opacity:0.
    window.setTimeout(function () {
      targets.forEach(function (el) {
        if (el.classList.contains("is-in")) return;
        var cs = window.getComputedStyle(el);
        if (parseFloat(cs.opacity) < 0.5) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight + 400 && r.bottom > -400) {
            el.classList.add("is-in");
          }
        }
      });
    }, 1500);
  }

  /* ----------------------------------------------------------
     Parallax (hero img + photo band), transform on img only.
     ---------------------------------------------------------- */
  function setupParallax() {
    if (prefersReduced) return;
    var heroImg = $(".hero-img");
    var bandImg = $(".photoband-img");
    var band = $(".photoband");
    var ticking = false;

    function update() {
      ticking = false;
      var y = window.pageYOffset;
      if (heroImg) heroImg.style.transform = "translate3d(0," + (y * 0.12) + "px,0)";
      if (bandImg && band) {
        var rect = band.getBoundingClientRect();
        var offset = (rect.top - window.innerHeight) * -0.08;
        bandImg.style.transform = "translate3d(0," + offset + "px,0)";
      }
    }
    function onScroll() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /* ----------------------------------------------------------
     Header scroll state + active nav
     ---------------------------------------------------------- */
  function setupHeader() {
    var header = $("#siteHeader");
    function onScroll() {
      if (!header) return;
      header.classList.toggle("scrolled", window.pageYOffset > 24);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if ("IntersectionObserver" in window) {
      var links = {};
      document.querySelectorAll(".main-nav a").forEach(function (a) {
        var id = a.getAttribute("href").slice(1);
        if (id) links[id] = a;
      });
      var ids = Object.keys(links);
      var secs = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
      if (secs.length) {
        var navSpy = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              ids.forEach(function (id) { if (links[id]) links[id].classList.remove("active"); });
              if (links[en.target.id]) links[en.target.id].classList.add("active");
            }
          });
        }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
        secs.forEach(function (s) { navSpy.observe(s); });
      }
    }
  }

  /* ----------------------------------------------------------
     NOREN intro curtain - first paint, skippable, once is fine.
     Absent entirely under reduced motion.
     ---------------------------------------------------------- */
  function setupNoren() {
    if (prefersReduced) return;

    var wrap = ce("div", "noren");
    wrap.setAttribute("aria-hidden", "true");
    var left = ce("div", "noren-panel noren-left");
    var right = ce("div", "noren-panel noren-right");
    var hint = ce("div", "noren-hint");
    hint.textContent = "tap to enter";
    wrap.appendChild(left); wrap.appendChild(right); wrap.appendChild(hint);
    document.body.appendChild(wrap);
    document.body.style.overflow = "hidden";

    var dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      wrap.classList.add("parted");
      document.body.style.overflow = "";
      window.setTimeout(function () {
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
      }, 1150);
      cleanup();
    }
    function onKey() { dismiss(); }
    function onScrollDismiss() { dismiss(); }
    function cleanup() {
      wrap.removeEventListener("click", dismiss);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onScrollDismiss);
      window.removeEventListener("touchmove", onScrollDismiss);
    }
    wrap.addEventListener("click", dismiss);
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onScrollDismiss, { passive: true });
    window.addEventListener("touchmove", onScrollDismiss, { passive: true });

    // Auto-part after a beat, then self-remove.
    window.setTimeout(dismiss, 1150);

    // Hard safety: never trap the user. Force-clear after 4s no matter what.
    window.setTimeout(function () {
      document.body.style.overflow = "";
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }, 4000);
  }

  /* ----------------------------------------------------------
     Boot. Each piece guarded so one failure cannot block others.
     ---------------------------------------------------------- */
  function safe(fn) { try { fn(); } catch (e) { /* fail open */ } }

  function init() {
    safe(renderStatus);
    safe(highlightToday);
    safe(renderMenu);
    safe(setupReveals);
    safe(setupParallax);
    safe(setupHeader);
    safe(setupNoren);
    // Refresh the open/closed status every minute.
    window.setInterval(function () { safe(renderStatus); }, 60000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
