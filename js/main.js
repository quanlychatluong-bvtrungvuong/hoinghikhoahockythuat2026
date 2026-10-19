/* Hiển thị nội dung từ js/data.js — thông thường KHÔNG cần sửa file này. */
(function () {
  var C = window.CONF;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var fmtDate = function (iso) {
    var d = new Date(iso + (iso.length === 10 ? "T00:00:00+07:00" : ""));
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" });
  };
  var initials = function (name) {
    var parts = name.replace(/\(.*?\)/g, "").split(/[\s.]+/).filter(Boolean);
    return parts.slice(-2).map(function (p) { return p[0]; }).join("").toUpperCase();
  };
  var fullTitle = C.title + " " + C.hospital + " năm " + C.year;

  /* ---- Thông tin chung ---- */
  document.title = fullTitle;
  $("brandLogo").innerHTML = C.logo
    ? '<img src="' + esc(C.logo) + '" alt="Logo ' + esc(C.hospital) + '">'
    : '<span class="logo-mark">' + esc(C.hospitalShort) + "</span>";
  $("brandTitle").textContent = "Hội nghị KHKT " + C.hospitalShort + " " + C.year;
  $("brandSub").textContent = C.hospital;
  $("heroKicker").textContent = C.hospital.toUpperCase();
  $("heroTitle").innerHTML = esc(C.title) + "<br><span>năm " + esc(C.year) + "</span>";
  $("heroTheme").textContent = "“" + C.theme + "”";
  $("heroDate").textContent = C.dateText;
  $("heroVenue").textContent = C.venueName;
  if (C.bannerImage) {
    var b = $("heroBanner");
    b.src = C.bannerImage; b.alt = fullTitle; b.hidden = false;
    document.querySelector(".hero").classList.add("has-banner");
  }

  /* ---- Đếm ngược ---- */
  var start = new Date(C.startDate).getTime();
  var end = new Date(C.endDate).getTime();
  function tick() {
    var now = Date.now();
    var dayMs = 864e5;
    var dLeft = Math.ceil((start - now) / dayMs);
    $("dday").textContent = now > end ? "Đã kết thúc" : dLeft > 0 ? "D-" + dLeft : "Đang diễn ra";
    $("today").textContent = "Hôm nay " + new Date().toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    var cd = $("countdown");
    if (now >= start) {
      cd.innerHTML = '<div class="cd-live">' + (now > end ? "Hội nghị đã kết thúc. Cảm ơn Quý đại biểu!" : "● Hội nghị đang diễn ra") + "</div>";
      return;
    }
    var s = Math.floor((start - now) / 1000);
    var units = [[Math.floor(s / 86400), "Ngày"], [Math.floor(s % 86400 / 3600), "Giờ"], [Math.floor(s % 3600 / 60), "Phút"], [s % 60, "Giây"]];
    cd.innerHTML = units.map(function (u) {
      return '<div class="cd-box"><b>' + String(u[0]).padStart(2, "0") + "</b><span>" + u[1] + "</span></div>";
    }).join("");
  }
  tick(); setInterval(tick, 1000);

  /* ---- Các nút liên kết ---- */
  document.querySelectorAll("[data-link]").forEach(function (a) {
    var url = C.links[a.getAttribute("data-link")];
    if (url) {
      a.href = url; a.target = "_blank"; a.rel = "noopener";
    } else if (!a.classList.contains("quick-card")) {
      a.removeAttribute("href");
      a.classList.add("disabled");
      a.setAttribute("aria-disabled", "true");
      a.insertAdjacentHTML("beforeend", ' <em class="soon">Sắp mở</em>');
    }
  });

  /* ---- Mốc thời gian ---- */
  var now0 = Date.now();
  $("milestones").innerHTML = C.milestones.map(function (m) {
    var past = new Date(m.date + "T23:59:59+07:00").getTime() < now0;
    return '<li class="' + (past ? "past" : "") + '"><time>' + fmtDate(m.date) + "</time><span>" + esc(m.label) + "</span></li>";
  }).join("");

  /* ---- Tin tức ---- */
  $("news").innerHTML = C.news.length ? C.news.slice().reverse().map(function (n) {
    var t = n.link ? '<a href="' + esc(n.link) + '" target="_blank" rel="noopener">' + esc(n.title) + "</a>" : esc(n.title);
    return "<li><time>" + fmtDate(n.date) + "</time>" + t + "</li>";
  }).join("") : '<li class="empty">Chưa có tin tức.</li>';

  /* ---- Thư chào mừng & Ban tổ chức ---- */
  $("welcome").innerHTML = C.welcome.paragraphs.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
    '<p class="sign"><strong>' + esc(C.welcome.author) + "</strong><br>" + esc(C.welcome.role) + "</p>";
  $("committee").innerHTML = C.committee.map(function (c) {
    return "<dt>" + esc(c.role) + "</dt><dd>" + esc(c.name) + "</dd>";
  }).join("");

  /* ---- Chương trình (tab theo ngày) ---- */
  function showDay(i) {
    document.querySelectorAll("#dayTabs button").forEach(function (b, j) {
      b.setAttribute("aria-selected", i === j);
    });
    $("programBody").innerHTML = '<div class="agenda">' + C.program[i].sessions.map(function (s) {
      return '<div class="agenda-row"><div class="a-time">' + esc(s.time) + '</div><div class="a-main"><b>' + esc(s.title) + "</b>" +
        (s.speaker ? "<span>" + esc(s.speaker) + "</span>" : "") + "</div>" +
        (s.room ? '<div class="a-room">' + esc(s.room) + "</div>" : "") + "</div>";
    }).join("") + "</div>";
  }
  $("dayTabs").innerHTML = C.program.map(function (d, i) {
    return '<button role="tab" data-i="' + i + '">' + esc(d.day) + "</button>";
  }).join("");
  $("dayTabs").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (b) showDay(+b.dataset.i);
  });
  showDay(0);

  /* ---- Báo cáo viên ---- */
  $("speakers").innerHTML = C.speakers.length ? C.speakers.map(function (s) {
    var av = s.photo ? '<img src="' + esc(s.photo) + '" alt="' + esc(s.name) + '">' : "<span>" + esc(initials(s.name)) + "</span>";
    return '<div class="speaker"><div class="avatar">' + av + "</div><b>" + esc(s.name) + "</b><small>" + esc(s.title) + "</small></div>";
  }).join("") : "<p>Danh sách báo cáo viên đang cập nhật.</p>";

  /* ---- Phí & CME ---- */
  $("fees").innerHTML = C.fees.map(function (f) {
    return "<tr><td>" + esc(f.type) + "</td><td>" + esc(f.price) + "</td></tr>";
  }).join("");
  $("cmeNote").textContent = "★ " + C.cme;

  /* ---- Nhà tài trợ ---- */
  $("sponsors").innerHTML = C.sponsors.map(function (t, i) {
    return '<div class="tier tier-' + i + '"><h3>' + esc(t.tier) + '</h3><div class="tier-logos">' + t.items.map(function (s) {
      return '<div class="sp">' + (s.logo ? '<img src="' + esc(s.logo) + '" alt="' + esc(s.name) + '">' : "<span>" + esc(s.name) + "</span>") + "</div>";
    }).join("") + "</div></div>";
  }).join("");

  /* ---- Địa điểm & liên hệ ---- */
  $("venueName").textContent = C.venueName;
  $("venueAddress").textContent = C.venueAddress;
  $("map").src = "https://www.google.com/maps?q=" + encodeURIComponent(C.mapQuery) + "&output=embed";
  var ct = C.contact;
  $("contact").innerHTML =
    "<li><b>Đơn vị thường trực</b>" + esc(ct.unit) + "</li>" +
    "<li><b>Người liên hệ</b>" + esc(ct.person) + "</li>" +
    '<li><b>Điện thoại</b><a href="tel:' + esc(ct.phone.replace(/[^\d+]/g, "")) + '">' + esc(ct.phone) + "</a></li>" +
    '<li><b>Email</b><a href="mailto:' + esc(ct.email) + '">' + esc(ct.email) + "</a></li>" +
    (ct.fanpage ? '<li><b>Fanpage</b><a href="' + esc(ct.fanpage) + '" target="_blank" rel="noopener">' + esc(ct.fanpage) + "</a></li>" : "");

  /* ---- Footer ---- */
  $("footTitle").textContent = fullTitle;
  $("footAddr").textContent = C.hospital + " – " + C.venueAddress;
  $("copy").textContent = "© " + C.year + " " + C.hospital;

  /* ---- Mã QR của trang ---- */
  if (window.QRCode) {
    new QRCode($("qr"), { text: location.href.split("#")[0], width: 140, height: 140, colorDark: "#0b3d6e", colorLight: "#ffffff" });
  }

  /* ---- Menu điện thoại ---- */
  var btn = $("menuBtn"), nav = $("nav");
  btn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
  });
})();
