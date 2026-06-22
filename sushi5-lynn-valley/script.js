/* ============================================================
   SUSHI5 · Lacquer & Ember · behaviour
   Fails open: CSS keeps hero copy alive at first paint, and a
   rescue sweep reveals anything still computed opacity:0.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- THE MENU (real data, real prices) ---------- */
  var MENU = [
    { name: "Nigiri Sushi", img: "./img2/r-nigiri.jpg",
      note: "Per piece.",
      items: [
        ["Tamago (Egg Omelette)","$1.50"],["Hokkigai (Surf Clam)","$1.50"],
        ["Inari (Bean Curd)","$1.75"],["Saba (Mackerel)","$1.75"],
        ["Ebi (Cooked Prawn)","$1.75"],["Masago (Smelt Roe)","$1.75"],
        ["Hamachi (Yellowtail)","$1.75"],["Wild Salmon","$1.75"],
        ["Smoked Salmon","$1.95"],["Tobiko (Flying Fish Roe)","$1.95"],
        ["Taka (Octopus)","$1.95"],["Ika (Squid)","$2.25"],
        ["Kani (Real Crab)","$2.25"],["Unagi (BBQ Eel)","$2.50"],
        ["Uni (Sea Urchin)","$2.50"],["Toro (Tuna Belly)","$2.50"],
        ["Spot Prawn","$2.50"],["Chopped Scallop & Tobiko","$2.50"],
        ["Tobiko & Quail Egg","$2.95"],["Ikura (Salmon Roe)","$2.95"]
      ] },
    { name: "Aburi (Seared)", img: "./img2/r-aburi.jpg",
      note: "Lightly torched. Per piece.",
      items: [
        ["Seared Tuna","$2.25"],["Seared Wild Salmon","$2.50"],
        ["Seared Toro","$2.75"],["Seared Hamachi","$3.50"]
      ] },
    { name: "Sashimi", img: "./img2/r-sashimi.jpg",
      note: "Sliced fresh, no rice.",
      items: [
        ["Tuna Sashimi (4 pcs)","$6.95"],["Tuna Sashimi (7 pcs)","$10.95"],
        ["Wild Salmon Sashimi (4 pcs)","$7.95"],["Wild Salmon Sashimi (7 pcs)","$11.95"],
        ["Spicy Tuna Sashimi (5 pcs)","$7.95"],["Spicy Wild Salmon Sashimi (5 pcs)","$8.95"],
        ["Spicy Tuna / Wild Salmon Sashimi (5 pcs)","$8.95"],
        ["Toro Sashimi, Tuna Belly (5 pcs)","$11.95"],
        ["Hamachi Sashimi, Yellowtail (5 pcs)","$14.95"],
        ["Tuna & Wild Salmon Sashimi (4 pcs each)","$12.95"],
        ["Half Assorted Sashimi (8 pcs)","$11.95"],["Assorted Sashimi (12 pcs)","$16.95"]
      ] },
    { name: "Maki & Rolls", img: "./img2/r-california.jpg",
      note: "",
      items: [
        ["Avocado Roll","$2.95"],["Cucumber Roll","$2.95"],["Tuna Roll","$2.95"],
        ["Wild Salmon Roll","$3.25"],["California Roll","$3.95","Crab meat, avocado & cucumber"],
        ["Avocado & Cucumber Roll","$3.95"],["Negihamachi Roll","$3.95","Yellowtail with green onion"],
        ["Tamago Roll","$3.95"],["Spicy Tuna Roll","$4.25"],["Salmon Avocado Roll","$4.50"],
        ["Spicy Wild Salmon Roll","$4.50"],["Yam Tempura Roll","$4.50"],
        ["Vege Tempura Roll","$4.50"],["Chopped Scallop Roll","$4.50"],
        ["Vegetable Roll","$4.50"],["Chicken Breast Teriyaki Roll","$4.50"],
        ["Beef Teriyaki Roll","$4.50"],["Negitoro Roll","$4.75","Tuna belly with green onion"],
        ["AAC Roll","$5.95"],["B.C. Roll","$5.95","BBQ wild salmon skin & vegetable"],
        ["Alaska Roll","$6.95"],["Real Crab California Roll","$6.95"],["Futo Maki Roll","$6.95"]
      ] },
    { name: "Signature Rolls", img: "./img2/r-signature.jpg",
      note: "The counter's specialty rolls.",
      items: [
        ["Lion King Roll","$15.95","Prawn tempura, crab, avocado & cucumber, topped with seared wild salmon, Parmesan, crunch potato & tobiko"],
        ["Snow Mountain Roll","$13.25","Crab, avocado & cucumber, topped with seared tuna & Parmesan"],
        ["Rainbow Roll","$15.95"],["Dragon Roll","$15.95"],["Red Dragon Roll","$10.95"],
        ["Spider Roll","$10.95"],["Mexican Roll","$10.95"],["Barbie Roll","$10.95"],
        ["Hawaiian Roll","$10.95"],["Pink Tiger Roll","$10.95"],["Las Vegas Roll","$8.95"],
        ["California Salsa Roll","$8.95"],["Victoria Roll","$7.95"],
        ["New York New York Roll","$18.95"],["Crispy White Mountain Roll","$19.95"]
      ] },
    { name: "Oshi (Pressed)", img: "./img2/r-oshi.jpg",
      note: "Pressed sushi, 6 pieces.",
      items: [
        ["Oshisushi Spicy Tuna (6 pcs)","$10.95"],
        ["Oshisushi Wild Salmon (6 pcs)","$10.95"],
        ["Oshisushi Negi Toro (6 pcs)","$10.95"]
      ] },
    { name: "Appetizers", img: "./img2/r-gyoza.jpg",
      note: "",
      items: [
        ["Vegetable Sunomono","$3.95"],["Shrimp / Octopus Sunomono","$4.25"],
        ["Seafood Sunomono","$4.95"],["Edamame (Steamed Soybean)","$4.50"],
        ["Gyoza / Veggie Gyoza (5 pcs)","$5.50"],["Spinach Gomae","$4.95","Spinach with house sesame sauce"],
        ["Chicken Karaage","$6.95","Deep fried boneless crispy chicken"],
        ["Angry Jalapeno","$6.95","Deep fried jalapeno with cream cheese & spicy tuna"],
        ["Kushiage","$6.95","2 skewers chicken breast with house sauce"],
        ["Tuna Tataki","$10.95"],["Agedashi Tofu","$4.95","Deep fried tofu with dashi-based sauce"],
        ["Spicy Agedashi Tofu","$5.50"],["Ebi Mayo","$7.95"]
      ] },
    { name: "Tempura", img: "./img2/r-tempura.jpg",
      note: "",
      items: [
        ["Tempura Appetizer","$6.95","3 pcs prawn, 2 pcs yam"],
        ["Prawn Tempura (4 pcs)","$4.95"],["Prawn Tempura (8 pcs)","$7.95"],
        ["Yam Tempura","$5.95"],["Vegetable Tempura (8 pcs)","$8.95"]
      ] },
    { name: "Salads", img: "./img2/fallback.jpg",
      note: "",
      items: [
        ["Vegetable Sunomono Salad","$3.95"],["Seaweed Salad","$6.95"],
        ["Grilled Chicken Salad","$8.95"],["Fresh Tuna Salad","$8.95"],
        ["Calamari Salad","$8.95","Seasoned squid with vegetables"]
      ] },
    { name: "Soups & Sides", img: "./img2/r-udon.jpg",
      note: "",
      items: [
        ["Miso Soup","$1.75"],["Spicy Miso Soup","$1.95"],["Rice","$2.50"],
        ["Brown Rice","$2.50"],["Side Sauce","$1.00"]
      ] },
    { name: "Lunch Teriyaki", img: "./img2/r-teriyaki.jpg",
      note: "Mon to Fri, 10am to 2pm. With rice & miso soup.",
      items: [
        ["Chicken / Beef / Tofu Teriyaki","$9.95"],
        ["BBQ Short Rib (Korean Style)","$13.95"]
      ] },
    { name: "Donburi / Rice Bowls", img: "./img2/r-teriyaki.jpg",
      note: "On sushi rice.",
      items: [
        ["Tuna Don","$11.95","Tuna sashimi on sushi rice"],["Spicy Tuna Don","$12.95"],
        ["Wild Salmon Don","$12.95"],["Spicy Wild Salmon Don","$13.95"],
        ["Chirashi Don","$17.95","Assorted sashimi on sushi rice"],
        ["Half Chirashi Don","$11.95"],["Unagi Don","$15.95","Fresh barbecued eel on sushi rice"]
      ] },
    { name: "Noodles", img: "./img2/r-udon.jpg",
      note: "Mon to Fri, 10am to 4pm.",
      items: [
        ["Chicken / Beef Udon","$9.50"],["Tempura Udon","$11.95"],
        ["Chicken / Beef / Vegetable Yaki Soba","$9.50"],
        ["Chicken / Beef / Vegetable Yaki Udon","$9.50"]
      ] },
    { name: "Lunch Sets", img: "./img2/r-combo.jpg",
      note: "",
      items: [
        ["Lunch A","$13.95"],["Lunch B","$19.95"],["Lunch C","$19.95"],
        ["Lunch D","$11.95"],["Lunch S","$11.95"],["Chef's Choice","$19.50"]
      ] },
    { name: "Combos & Party Trays", img: "./img2/r-combo.jpg",
      note: "Party trays serve 2 to 4.",
      items: [
        ["Tuna & Wild Salmon Combo","$11.95"],["Favourite Roll Combo","$11.95"],
        ["Nigiri Sushi Combo","$11.95"],["Spicy Tuna Combo","$12.95"],
        ["Hercules Roll Combo","$12.95"],["New York New York Combo","$13.95"],
        ["Sashimi & Sushi Combo","$14.95"],["Deluxe Sushi Combo","$16.95"],
        ["Vegetable Combo","$10.95"],["Mixed Combo","$30.95"],
        ["Variety Roll Combo","$35.95"],["Premium Combo","$37.95"],
        ["Party Tray A (for 2-3)","$34.95"],["Party Tray B (for 3-4)","$44.95"],
        ["Party Tray C (for 4)","$54.95"]
      ] },
  ];

  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function $(id){ return document.getElementById(id); }

  /* ---------- MENU SECTION (tabs + panels) ---------- */
  function buildMenuSection(){
    var tabs = $("menuTabs"), panels = $("menuPanels");
    if(!tabs || !panels) return;
    var tHtml = "", pHtml = "";
    MENU.forEach(function(cat, i){
      var sel = i === 0 ? "true" : "false";
      tHtml += '<button class="menu-tab" role="tab" aria-selected="'+sel+'" data-i="'+i+'">'+esc(cat.name)+'</button>';
      var rows = cat.items.map(function(it){
        var desc = it[2] ? '<span class="mi-desc">'+esc(it[2])+'</span>' : "";
        return '<div class="menu-item"><span class="mi-name">'+esc(it[0])+desc+'</span>'+
               '<span class="mi-leader"></span><span class="mi-price">'+esc(it[1])+'</span></div>';
      }).join("");
      var note = cat.note ? '<span class="mp-note">'+esc(cat.note)+'</span>' : "";
      pHtml += '<div class="menu-panel'+(i===0?' active':'')+'" data-i="'+i+'">'+
               '<div class="menu-panel-head"><h3>'+esc(cat.name)+'</h3>'+note+'</div>'+
               '<div class="menu-grid">'+rows+'</div></div>';
    });
    tabs.innerHTML = tHtml;
    panels.innerHTML = pHtml;

    tabs.addEventListener("click", function(e){
      var b = e.target.closest(".menu-tab"); if(!b) return;
      var i = b.getAttribute("data-i");
      tabs.querySelectorAll(".menu-tab").forEach(function(t){ t.setAttribute("aria-selected", t===b ? "true":"false"); });
      panels.querySelectorAll(".menu-panel").forEach(function(p){ p.classList.toggle("active", p.getAttribute("data-i")===i); });
    });
  }

  /* ---------- OVERLAY MENU PANEL ---------- */
  var overlay, lastFocus = null;
  function buildOverlay(){
    overlay = $("menuOverlay");
    if(!overlay) return;
    var cats = $("overlayCats"), list = $("overlayList");
    var pImg = $("previewImg"), pCap = $("previewCaption"), pFrame = pImg ? pImg.parentElement : null;

    var cHtml = MENU.map(function(cat,i){
      return '<button class="ocat" data-i="'+i+'" '+(i===0?'aria-current="true"':'')+'>'+
             esc(cat.name)+'<span class="ocount">'+cat.items.length+'</span></button>';
    }).join("");
    cats.innerHTML = cHtml;

    function renderList(i){
      var cat = MENU[i];
      var rows = cat.items.map(function(it){
        var desc = it[2] ? '<span class="oi-desc">'+esc(it[2])+'</span>' : "";
        return '<div class="oitem"><span class="oi-name">'+esc(it[0])+desc+'</span>'+
               '<span class="oi-leader"></span><span class="oi-price">'+esc(it[1])+'</span></div>';
      }).join("");
      var note = cat.note ? '<p class="olist-note">'+esc(cat.note)+'</p>' : '<p class="olist-note">Made fresh to order.</p>';
      list.innerHTML = '<h3 class="olist-head">'+esc(cat.name)+'</h3>'+note+rows;
      list.scrollTop = 0;
    }
    function swapPreview(i){
      if(!pImg || !pFrame) return;
      var cat = MENU[i];
      if(reduceMotion){ pImg.src = cat.img; if(pCap) pCap.textContent = cat.name; return; }
      pFrame.classList.add("swap");
      window.setTimeout(function(){
        pImg.src = cat.img;
        if(pCap) pCap.textContent = cat.name;
        pFrame.classList.remove("swap");
      }, 260);
    }
    function select(i){
      cats.querySelectorAll(".ocat").forEach(function(b){
        b.setAttribute("aria-current", b.getAttribute("data-i")===String(i) ? "true":"false");
      });
      renderList(i); swapPreview(i);
    }
    renderList(0);

    cats.addEventListener("click", function(e){
      var b = e.target.closest(".ocat"); if(!b) return;
      select(parseInt(b.getAttribute("data-i"),10));
    });
    cats.addEventListener("mouseover", function(e){
      var b = e.target.closest(".ocat"); if(!b) return;
      swapPreview(parseInt(b.getAttribute("data-i"),10));
    });
  }

  function openOverlay(){
    if(!overlay) return;
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add("overlay-locked");
    requestAnimationFrame(function(){ overlay.classList.add("open"); });
    var close = $("closeMenuPanel");
    if(close) close.focus();
    var trig = $("openMenuPanel");
    if(trig) trig.setAttribute("aria-expanded","true");
  }
  function closeOverlay(){
    if(!overlay) return;
    overlay.classList.remove("open");
    document.body.classList.remove("overlay-locked");
    var trig = $("openMenuPanel");
    if(trig) trig.setAttribute("aria-expanded","false");
    window.setTimeout(function(){ overlay.hidden = true; }, reduceMotion ? 0 : 560);
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- LIVE OPEN / CLOSED STATUS ---------- */
  // hours in minutes from midnight, indexed by JS day (0=Sun..6=Sat)
  var HOURS = {
    0: [11*60, 18*60],   // Sun 11-6
    1: [11*60, 19*60],   // Mon 11-7
    2: [11*60, 19*60],   // Tue 11-7
    3: [11*60, 19*60],   // Wed 11-7
    4: [11*60, 20*60],   // Thu 11-8
    5: [11*60, 20*60],   // Fri 11-8
    6: [11*60, 19*60]    // Sat 11-7
  };
  function vancouverNow(){
    // Build a Date reflecting America/Vancouver wall-clock time.
    try{
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone:"America/Vancouver", weekday:"short", hour:"2-digit",
        minute:"2-digit", hour12:false
      }).formatToParts(new Date());
      var map = {}; parts.forEach(function(p){ map[p.type]=p.value; });
      var wk = {Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[map.weekday];
      var h = parseInt(map.hour,10) % 24;
      var m = parseInt(map.minute,10);
      return { day: wk, mins: h*60 + m };
    }catch(e){
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours()*60 + d.getMinutes() };
    }
  }
  function fmt(mins){
    var h = Math.floor(mins/60), m = mins%60;
    var ap = h >= 12 ? "PM" : "AM";
    var hr = h % 12; if(hr === 0) hr = 12;
    return hr + (m ? ":"+(m<10?"0"+m:m) : ":00") + " " + ap;
  }
  function updateStatus(){
    var pill = $("statusPill"), txt = $("statusText"), today = $("heroToday");
    if(!pill || !txt) return;
    var now = vancouverNow();
    var h = HOURS[now.day];
    var open = h && now.mins >= h[0] && now.mins < h[1];
    pill.classList.remove("is-open","is-closed");
    if(open){
      pill.classList.add("is-open");
      txt.textContent = "Open now, until " + fmt(h[1]);
    } else {
      pill.classList.add("is-closed");
      // find next opening
      var nextDay = now.day, ahead = 0;
      if(h && now.mins < h[0]){
        txt.textContent = "Closed, opens " + fmt(h[0]) + " today";
      } else {
        for(var i=1;i<=7;i++){
          var d = (now.day + i) % 7;
          if(HOURS[d]){ nextDay = d; ahead = i; break; }
        }
        var dayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][nextDay];
        var when = ahead === 1 ? "tomorrow" : dayName;
        txt.textContent = "Closed, opens " + when + " at " + fmt(HOURS[nextDay][0]);
      }
    }
    if(today && h){
      today.textContent = "Today, " + fmt(h[0]) + " to " + fmt(h[1]);
    }
  }

  /* ---------- HIGHLIGHT TODAY IN HOURS TABLE ---------- */
  function highlightToday(){
    var t = $("hoursTable"); if(!t) return;
    var day = vancouverNow().day;
    t.querySelectorAll("tr[data-day]").forEach(function(r){
      r.classList.toggle("today", r.getAttribute("data-day") === String(day));
    });
  }

  /* ---------- STICKY HEADER + ORDER TRAY ---------- */
  function scrollChrome(){
    var header = $("siteHeader"), tray = $("orderTray"), hero = $("hero");
    var ticking = false;
    function update(){
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if(header) header.classList.toggle("scrolled", y > 40);
      if(tray){
        var heroH = hero ? hero.offsetHeight : 600;
        tray.classList.toggle("visible", y > heroH * 0.6);
      }
      ticking = false;
    }
    window.addEventListener("scroll", function(){
      if(!ticking){ window.requestAnimationFrame(update); ticking = true; }
    }, { passive:true });
    update();
  }

  /* ---------- SCROLL REVEALS ("the settle") ---------- */
  function reveals(){
    var els = document.querySelectorAll(".reveal-text, .reveal-media");
    if(reduceMotion || !("IntersectionObserver" in window)){
      els.forEach(function(el){ el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin:"0px 0px -8% 0px", threshold:0.08 });
    els.forEach(function(el){ io.observe(el); });
  }

  /* tag reveal targets + add stagger groups */
  function tagReveals(){
    document.querySelectorAll(
      ".section-head, .story-copy, .visit-info, .visit-hours"
    ).forEach(function(g){ g.classList.add("in-group"); });

    var sel = [
      ".section-head .kicker", ".section-head .section-title", ".section-head .section-lead",
      ".story-copy .kicker", ".story-copy .section-title", ".story-copy p", ".story-copy .story-marks",
      ".reel-card", ".reel-foot",
      ".quote", ".visit-photo", ".visit-map", ".story-media",
      ".info-block", ".hours-table", ".visit-hours .info-note"
    ].join(",");
    document.querySelectorAll(sel).forEach(function(el){
      if(el.classList.contains("story-media") || el.classList.contains("visit-photo") ||
         el.classList.contains("visit-map") || el.classList.contains("reel-card")){
        el.classList.add("reveal-media");
      } else {
        el.classList.add("reveal-text");
      }
    });
  }

  /* ---------- RESCUE SWEEP (load + 1.5s) ---------- */
  function rescueSweep(){
    window.setTimeout(function(){
      document.querySelectorAll(".reveal-text, .reveal-media").forEach(function(el){
        if(el.classList.contains("in")) return;
        var cs = window.getComputedStyle(el);
        if(parseFloat(cs.opacity) < 0.05){
          var r = el.getBoundingClientRect();
          if(r.top < window.innerHeight + 200 && r.bottom > -200){
            el.classList.add("in");
          }
        }
      });
    }, 1500);
  }

  /* ---------- WIRE UP ---------- */
  function bind(id, fn){ var el = $(id); if(el) el.addEventListener("click", fn); }

  function init(){
    buildMenuSection();
    buildOverlay();
    updateStatus();
    highlightToday();
    scrollChrome();
    tagReveals();
    reveals();

    ["openMenuPanel","openMenuPanelHero","openMenuPanelReel","openMenuPanelSection","openMenuPanelTray"]
      .forEach(function(id){ bind(id, openOverlay); });
    bind("closeMenuPanel", closeOverlay);

    document.addEventListener("keydown", function(e){
      if(e.key === "Escape" && overlay && overlay.classList.contains("open")) closeOverlay();
    });

    var y = $("year"); if(y) y.textContent = new Date().getFullYear();

    // refresh status every minute
    window.setInterval(updateStatus, 60000);

    rescueSweep();
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }

  /* ---------- JSON-LD (Restaurant) ---------- */
  try{
    var ld = {
      "@context":"https://schema.org","@type":"Restaurant",
      "name":"Sushi5",
      "servesCuisine":"Japanese",
      "priceRange":"$10-30",
      "telephone":"+16049711811",
      "email":"sushi5restaurant@gmail.com",
      "url":"https://ethanflo.github.io/storefront-previews/sushi5-lynn-valley/",
      "image":"https://ethanflo.github.io/storefront-previews/sushi5-lynn-valley/img2/hero-aburi.jpg",
      "acceptsReservations":false,
      "address":{
        "@type":"PostalAddress",
        "streetAddress":"1199 Lynn Valley Rd #115",
        "addressLocality":"North Vancouver",
        "addressRegion":"BC","postalCode":"V7J 3H1","addressCountry":"CA"
      },
      "sameAs":[
        "https://www.instagram.com/sushi_5_lynnvalley/",
        "https://www.facebook.com/sushi5NorthVancouver/"
      ],
      "aggregateRating":{
        "@type":"AggregateRating","ratingValue":"4.2","reviewCount":"258"
      },
      "openingHoursSpecification":[
        {"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday"],"opens":"11:00","closes":"19:00"},
        {"@type":"OpeningHoursSpecification","dayOfWeek":["Thursday","Friday"],"opens":"11:00","closes":"20:00"},
        {"@type":"OpeningHoursSpecification","dayOfWeek":"Saturday","opens":"11:00","closes":"19:00"},
        {"@type":"OpeningHoursSpecification","dayOfWeek":"Sunday","opens":"11:00","closes":"18:00"}
      ]
    };
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  }catch(e){ /* schema is non-essential */ }

})();
