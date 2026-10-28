/* Hiển thị nội dung từ js/data.js — thông thường KHÔNG cần sửa file này. */
(function () {
  var C = window.CONF;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var TZ = "Asia/Ho_Chi_Minh";
  var toDate = function (iso) { return new Date(iso.length === 10 ? iso + "T00:00:00+07:00" : iso); };
  var dm = function (iso) { var p = iso.slice(0, 10).split("-"); return p[2] + "/" + p[1]; };
  var plain = function (s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase(); };
  var fullTitle = C.title + " " + C.hospital + " năm " + C.year;
  var start = toDate(C.startDate), end = toDate(C.endDate);

  /* ---------- Đầu trang & mở đầu ---------- */
  document.title = fullTitle;
  $("brandLogo").innerHTML = C.logo
    ? '<img src="' + esc(C.logo) + '" alt="Logo ' + esc(C.hospital) + '">'
    : '<span class="logo-mark">' + esc(C.hospitalShort) + "</span>";
  $("brandTitle").textContent = "Hội nghị KHKT " + C.year;
  $("brandSub").textContent = C.hospital;
  $("heroKicker").textContent = C.hospital + " · Thường niên " + C.year;
  $("heroTitle").innerHTML = esc(C.title.replace(/\s*thường niên\s*/i, " ")).trim() + " <em>" + esc(C.year) + "</em>";
  if (C.theme) $("heroTheme").textContent = C.theme; else $("heroTheme").hidden = true;
  var wd = start.toLocaleDateString("vi-VN", { weekday: "long", timeZone: TZ });
  $("dateTile").innerHTML = "<b>" + start.toLocaleDateString("vi-VN", { day: "2-digit", timeZone: TZ }) + "</b>" +
    "<span>" + esc(wd.charAt(0).toUpperCase() + wd.slice(1)) + "</span>" +
    "<strong>Tháng " + (start.getMonth() + 1) + " · " + start.getFullYear() + "</strong>";
  $("heroVenue").textContent = C.venueName;
  $("heroAddr").textContent = C.venueAddress.split(",")[0];
  if (C.bannerImage) { var b = $("heroBanner"); b.src = C.bannerImage; b.alt = fullTitle; b.hidden = false; }

  function tick() {
    var now = Date.now(), cd = $("countdown");
    if (now > end) { $("countLabel").textContent = "Trạng thái"; cd.textContent = "Đã kết thúc"; return; }
    if (now >= start) { $("countLabel").textContent = "Trạng thái"; cd.textContent = "● Đang diễn ra"; return; }
    var m = Math.floor((start - now) / 60000);
    var d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), mi = m % 60;
    cd.textContent = d > 0 ? d + " ngày " + h + " giờ" : h + " giờ " + String(mi).padStart(2, "0") + " phút";
  }
  tick(); setInterval(tick, 30000);

  /* ---------- Liên kết theo data.js ---------- */
  document.querySelectorAll("[data-link]").forEach(function (a) {
    var url = C.links[a.getAttribute("data-link")];
    if (url) {
      a.href = url;
      if (!/^#/.test(url)) { a.target = "_blank"; a.rel = "noopener"; }
    } else if (a.hasAttribute("data-hide-empty") || a.classList.contains("sec-link")) {
      a.hidden = true;
    } else {
      a.removeAttribute("href");
      a.classList.add("disabled");
      a.setAttribute("aria-disabled", "true");
      a.insertAdjacentHTML("beforeend", '<em class="soon">Sắp mở</em>');
    }
  });

  // Nút theo giờ mở/đóng: trước giờ mở hiện "Mở 07:00 30/10", sau giờ đóng hiện "Đã đóng"
  var hhmm = function (t) {
    var d = new Date(t);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }) + " " + d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", timeZone: TZ }).replace(/-/g, "/");
  };
  function applySchedule() {
    var now = Date.now();
    document.querySelectorAll("[data-link]").forEach(function (a) {
      var k = a.getAttribute("data-link"), w = C.schedule && C.schedule[k];
      if (!w || !C.links[k]) return;
      var mo = toDate(w[0]).getTime(), dong = toDate(w[1]).getTime(), badge = a.querySelector(".when");
      var pass = a.querySelector(".pass");
      if (pass) pass.hidden = !(now >= mo && now < dong);   // mật khẩu chỉ hiện trong giờ mở
      if (now >= mo && now < dong) {
        a.href = C.links[k]; a.classList.remove("disabled"); a.removeAttribute("aria-disabled");
        if (badge) badge.remove();
      } else {
        a.removeAttribute("href"); a.classList.add("disabled"); a.setAttribute("aria-disabled", "true");
        if (!badge) { a.insertAdjacentHTML("beforeend", '<em class="soon when"></em>'); badge = a.querySelector(".when"); }
        badge.textContent = now < mo ? "Mở " + hhmm(mo) : "Đã đóng";
      }
    });
  }
  applySchedule(); setInterval(applySchedule, 30000);

  // Kèm mật khẩu phòng trực tuyến trên các nút vào phòng
  if (C.links.onlineLink && C.onlinePass) {
    document.querySelectorAll('[data-link="onlineLink"]').forEach(function (a) {
      a.insertAdjacentHTML("beforeend", ' <small class="pass">MK: ' + esc(C.onlinePass) + "</small>");
    });
    applySchedule();
  }

  /* ---------- Thẻ "Một ngày hội nghị" ---------- */
  var times = function (s) {
    var m = String(s || "").match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
    return m ? { a: m[1].padStart(2, "0") + ":" + m[2], b: m[3].padStart(2, "0") + ":" + m[4] } : null;
  };
  $("dayDate").textContent = wd.charAt(0).toUpperCase() + wd.slice(1) + ", " +
    start.toLocaleDateString("vi-VN", { timeZone: TZ }) + " · " + C.venueName;
  var rows = [];
  C.program.forEach(function (p, i) {
    var t = times(p.time); if (!t) return;
    var row = rows.filter(function (r) { return r.a === t.a && r.b === t.b; })[0];
    if (!row) { row = { a: t.a, b: t.b, items: [] }; rows.push(row); }
    row.items.push(i);
  });
  rows.sort(function (x, y) { return x.a < y.a ? -1 : 1; });
  var mins = function (hm) { var p = hm.split(":"); return +p[0] * 60 + +p[1]; };
  $("dayPlan").innerHTML = rows.map(function (r, k) {
    var gap = k > 0 && mins(r.a) - mins(rows[k - 1].b) >= 45
      ? '<div class="day-row"><span></span><div class="day-gap">' + rows[k - 1].b + " – " + r.a + " · Nghỉ trưa</div></div>" : "";
    return gap + '<div class="day-row"><time>' + r.a + '</time><div class="day-lanes' + (r.items.length > 1 ? " two" : "") + '">' +
      r.items.map(function (i) {
        var p = C.program[i];
        return '<button type="button" class="day-block c' + (i % 4) + '" data-i="' + i + '"><b>' + esc(p.label) + "</b><span>" + r.a + " – " + r.b + (p.room ? " · " + esc(p.room) : "") + "</span></button>";
      }).join("") + "</div></div>";
  }).join("");
  $("dayPlan").addEventListener("click", function (e) {
    var b = e.target.closest(".day-block"); if (!b) return;
    showSession(+b.dataset.i);
    $("chuong-trinh").scrollIntoView();
  });
  if (!rows.length) $("dayPlan").closest(".day-card").hidden = true;

  /* ---------- Dải thông báo ---------- */
  var now0 = Date.now();
  $("notice").innerHTML = C.milestones.map(function (m) {
    var past = toDate(m.date + "T23:59:59+07:00").getTime() < now0;
    return '<div class="notice-item' + (past ? " past" : "") + '"><time>' + dm(m.date) + "</time><span>" + esc(m.label) + "</span></div>";
  }).concat(C.news.slice(-1).map(function (n) {
    var t = n.link ? '<a href="' + esc(n.link) + '" target="_blank" rel="noopener">' + esc(n.title) + "</a>" : esc(n.title);
    return '<div class="notice-item"><time>Mới</time><span>' + t + "</span></div>";
  })).concat(C.links.onlineLink
    ? ['<div class="notice-item" id="noticeOnline"></div>']
    : C.onlineNote ? ['<div class="notice-item"><time>Trực tuyến</time><span>' + esc(C.onlineNote) + "</span></div>"] : []).join("");

  // Dòng thông báo phòng trực tuyến: chỉ hiện link + mật khẩu trong giờ mở
  function renderOnlineNotice() {
    var el = $("noticeOnline"); if (!el) return;
    var w = C.schedule && C.schedule.onlineLink, now = Date.now();
    var name = esc(C.onlineName || "Phòng trực tuyến");
    var mo = w ? toDate(w[0]).getTime() : 0, dong = w ? toDate(w[1]).getTime() : Infinity;
    el.innerHTML = "<time>Trực tuyến</time><span>" + (now < mo ? name + " mở lúc " + hhmm(mo)
      : now >= dong ? name + " đã đóng"
      : '<a href="' + esc(C.links.onlineLink) + '" target="_blank" rel="noopener">' + name + "</a>" + (C.onlinePass ? " · Mật khẩu: <b>" + esc(C.onlinePass) + "</b>" : "")) + "</span>";
  }
  renderOnlineNotice(); setInterval(renderOnlineNotice, 30000);

  /* ---------- Lời ngỏ ---------- */
  $("welcome").innerHTML = C.welcome.paragraphs.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
    '<p class="sign"><strong>' + esc(C.welcome.author) + "</strong><br>" + esc(C.welcome.role) + "</p>";
  if (C.committeeTitle) $("committeeTitle").textContent = C.committeeTitle;
  $("committee").innerHTML = C.committee.map(function (c) {
    return "<li><span>" + esc(c.role) + "</span><b>" + esc(c.name) + "</b></li>";
  }).join("");

  /* ---------- 01 Chương trình ---------- */
  function showSession(i) {
    var p = C.program[i];
    document.querySelectorAll("#dayTabs button").forEach(function (b, j) {
      b.setAttribute("aria-selected", i === j);
      b.tabIndex = i === j ? 0 : -1;
    });
    $("sessionMeta").innerHTML = (p.time ? "<span><b>Thời gian:</b> " + esc(p.time) + "</span>" : "") +
      (p.room ? "<span><b>Hội trường:</b> " + esc(p.room) + "</span>" : "");
    $("chairs").innerHTML = p.chairs && p.chairs.length
      ? "<b>Chủ tọa đoàn</b><ul>" + p.chairs.map(function (c) {
          return "<li><b>" + esc(c.name) + "</b><span>" + esc(c.title) + "</span></li>";
        }).join("") + "</ul>"
      : "";
    $("programBody").innerHTML = p.sessions.map(function (s) {
      var cls = /^Giải lao/.test(s.title) ? " break" : s.speaker ? "" : " plain";
      return '<li class="slot' + cls + '"><time>' + esc(s.time) + '</time><div class="slot-body"><div class="slot-card">' +
        '<p class="slot-title">' + esc(s.title) + "</p>" +
        (s.speaker ? '<div class="slot-who"><b>' + esc(s.speaker) + "</b>" + (s.role ? "<span>" + esc(s.role) + "</span>" : "") + "</div>" : "") +
        "</div></div></li>";
    }).join("");
  }
  $("dayTabs").innerHTML = C.program.map(function (p, i) {
    var t = times(p.time);
    return '<button role="tab" data-i="' + i + '"><b>' + esc(p.label || p.day) + "</b>" + (t ? "<span>" + t.a + " – " + t.b + "</span>" : "") + "</button>";
  }).join("");
  $("dayTabs").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (b) showSession(+b.dataset.i);
  });
  $("dayTabs").addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var btns = [].slice.call(this.querySelectorAll("button"));
    var k = btns.indexOf(document.activeElement); if (k < 0) return;
    k = (k + (e.key === "ArrowRight" ? 1 : btns.length - 1)) % btns.length;
    btns[k].focus(); showSession(k);
  });
  showSession(0);

  /* ---------- 02 Đăng ký ---------- */
  $("cmeNote").textContent = C.cme;
  if (C.audience) $("audience").textContent = C.audience;
  else { $("audience").hidden = true; $("audience").previousElementSibling.hidden = true; }

  /* ---------- Nhà tài trợ ---------- */
  if (!C.sponsors.length) { $("nha-tai-tro").hidden = true; $("navSponsors").hidden = true; }
  $("sponsors").innerHTML = C.sponsors.map(function (t) {
    return '<div class="tier"><h3>' + esc(t.tier) + '</h3><div class="tier-logos">' + t.items.map(function (s) {
      return '<div class="sp">' + (s.logo ? '<img src="' + esc(s.logo) + '" alt="' + esc(s.name) + '">' : "<span>" + esc(s.name) + "</span>") + "</div>";
    }).join("") + "</div></div>";
  }).join("");

  /* ---------- 04 Địa điểm & liên hệ ---------- */
  $("map").src = "https://www.google.com/maps?q=" + encodeURIComponent(C.mapQuery) + "&output=embed";
  var ct = C.contact;
  var rooms = C.program.filter(function (p) { return p.room; }).map(function (p) { return p.label + ": " + p.room; });
  $("contact").innerHTML =
    "<li><span>Địa điểm</span><b>" + esc(C.venueName) + "</b><br>" + esc(C.venueAddress) + "</li>" +
    (rooms.length ? "<li><span>Hội trường</span>" + rooms.map(esc).join("<br>") + "</li>" : "") +
    (ct.unit ? "<li><span>Đơn vị thường trực</span>" + esc(ct.unit) + "</li>" : "") +
    (ct.person ? "<li><span>Người liên hệ</span>" + esc(ct.person) + "</li>" : "") +
    (ct.phone ? '<li><span>Điện thoại</span><a href="tel:' + esc(ct.phone.replace(/[^\d+]/g, "")) + '">' + esc(ct.phone) + "</a></li>" : "") +
    (ct.email ? '<li><span>Email</span><a href="mailto:' + esc(ct.email) + '">' + esc(ct.email) + "</a></li>" : "") +
    (ct.fanpage ? '<li><span>Fanpage</span><a href="' + esc(ct.fanpage) + '" target="_blank" rel="noopener">' + esc(ct.fanpage) + "</a></li>" : "") +
    '<li><a href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(C.mapQuery) + '" target="_blank" rel="noopener">Chỉ đường bằng Google Maps →</a></li>';

  /* ---------- Chân trang ---------- */
  $("footTitle").textContent = fullTitle;
  $("footAddr").textContent = C.hospital + " – " + C.venueAddress;
  $("copy").textContent = "© " + C.year + " " + C.hospital;

  /* ---------- Menu điện thoại ---------- */
  var btn = $("menuBtn"), nav = $("nav");
  btn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
  });
})();
