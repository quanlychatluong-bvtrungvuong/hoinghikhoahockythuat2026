/**
 * VẬN HÀNH NGÀY HỘI NGHỊ — chạy hàm caiDatVanHanh() (1 lần, chạy lại được)
 * ---------------------------------------------------------------
 * Cần trong cùng dự án: tao-trang-tong-hop.gs (SHEET_ID, DS_BUOI, taoTongHop),
 * chuan-bi-ngay-hoi-nghi.functions.gs (TITLE_RE, taoDanhSachMoi) và dữ liệu MOI_DATA, POST_TESTS.
 *
 * 1. taoFormLeTan(): form "Lễ tân – Điểm danh hộ" cho nhân viên lễ tân (người không tự điểm danh được,
 *    chưa đăng ký, dự thay, sửa thông tin). KHÔNG đăng trên website.
 * 2. caiLichMoForm(): đóng/mở form tự động theo LICH (trigger theo giờ), kèm thông báo khi form đóng.
 * 3. lapXetCME(): tab "Xét CME" — mỗi người × mỗi buổi đăng ký nhận CME: giờ điểm danh, điểm post-test,
 *    kết luận tự động; cột "Online ≥80%", "Duyệt cấp CME", "Ghi chú" do người duyệt điền (giữ nguyên khi
 *    cập nhật). Tự cập nhật mỗi 15 phút đến 05/11/2026. Tab "Danh sách cấp CME" lọc người đã duyệt.
 */

var TZ = "Asia/Ho_Chi_Minh";
var NGUONG_DAT = 7;            // số câu đúng tối thiểu / 10 (70%)
var LIEN_HE = "ThS. Nguyễn Mạnh Tuân – Phòng Quản lý chất lượng – 0969 019 051";
var DONG_CUOI = "2026-11-04T23:59:00+07:00";

// Lịch mở/đóng từng form (theo tên tab câu trả lời trong file Sheets)
var LICH = [
  { sheet: "Điểm danh nội viện",   mo: "2026-10-30T07:00:00+07:00", dong: "2026-10-30T17:00:00+07:00" },
  { sheet: "Điểm danh ngoại viện", mo: "2026-10-30T07:00:00+07:00", dong: "2026-10-30T17:00:00+07:00" },
  { sheet: "Đặt câu hỏi",          mo: "2026-10-30T07:00:00+07:00", dong: "2026-10-30T17:00:00+07:00" },
  { sheet: "Post-test Nội khoa",   mo: "2026-10-30T11:00:00+07:00", dong: DONG_CUOI },
  { sheet: "Post-test Ngoại khoa", mo: "2026-10-30T11:00:00+07:00", dong: DONG_CUOI },
  { sheet: "Post-test Điều dưỡng", mo: "2026-10-30T16:00:00+07:00", dong: DONG_CUOI },
  { sheet: "Check-out CME",        mo: "2026-10-30T11:00:00+07:00", dong: DONG_CUOI },
  { sheet: "Điểm danh lễ tân",     mo: "2026-10-30T06:30:00+07:00", dong: DONG_CUOI }
];

// Buổi → bài post-test và giờ đến muộn nhất để vẫn đủ 80% thời lượng
var BUOI_INFO = {
  "Buổi sáng – Phiên Nội khoa":                { test: "Post-test Nội khoa",   muon: "07:54", buoi: "sáng" },
  "Buổi sáng – Phiên Ngoại khoa":              { test: "Post-test Ngoại khoa", muon: "07:54", buoi: "sáng" },
  "Buổi chiều – Hội nghị Khoa học Điều dưỡng": { test: "Post-test Điều dưỡng", muon: "13:54", buoi: "chiều" }
};

var HANDLERS = ["capNhatTrangThaiForm", "lapXetCME", "donTriggerVanHanh"];

function caiDatVanHanh() {
  taoFormLeTan();
  taoDanhSachMoi();
  lapXetCME();
  taoTongHop();
  caiLichMoForm();
}

/* ---------- tiện ích ---------- */
function moFormTheoTab_(ss, ten) {
  var sh = ss.getSheetByName(ten); if (!sh || !sh.getFormUrl()) return null;
  for (var i = 0; i < 3; i++) {
    try { return FormApp.openByUrl(sh.getFormUrl()); } catch (e) { Utilities.sleep(1500); }
  }
  throw new Error("Không mở được form của tab " + ten);
}
function gio_(iso) { return Utilities.formatDate(new Date(iso), TZ, "HH:mm 'ngày' dd/MM/yyyy"); }
function khoa_(s) {
  return String(s || "").normalize("NFC").toLowerCase().replace(new RegExp(TITLE_RE), "").replace(/\s+/g, " ").trim();
}
function cotMap_(head) { var m = {}; head.forEach(function (h, i) { m[String(h).trim()] = i; }); return m; }

/* ---------- 1. Form lễ tân ---------- */
function taoFormLeTan() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  if (ss.getSheetByName("Điểm danh lễ tân")) { Logger.log("Đã có form lễ tân – bỏ qua"); return; }
  var f = FormApp.create("Lễ tân – Điểm danh hộ – Hội nghị KHKT BV Trưng Vương 2026");
  f.setTitle("Lễ tân – Điểm danh hộ")
   .setDescription("DÀNH CHO NHÂN VIÊN LỄ TÂN / BAN TỔ CHỨC. Không chia sẻ cho đại biểu.\n" +
     "Dùng khi đại biểu không tự điểm danh được, chưa đăng ký, dự thay người khác, hoặc cần sửa thông tin đã điểm danh.")
   .setConfirmationMessage("Đã ghi nhận. Bấm \"Gửi câu trả lời khác\" để điểm danh người tiếp theo.");
  try { f.setRequireLogin(false); } catch (e) {}
  f.addTextItem().setTitle("Họ và tên").setHelpText("Ghi đầy đủ, đúng như thư mời / giấy tờ").setRequired(true);
  f.addTextItem().setTitle("Đơn vị công tác").setRequired(true);
  f.addTextItem().setTitle("Số điện thoại");
  f.addTextItem().setTitle("Email").setHelpText("Để nhận chứng nhận CME (nếu có)")
    .setValidation(FormApp.createTextValidation().requireTextIsEmail().build());
  f.addMultipleChoiceItem().setTitle("Buổi / Phiên tham dự").setChoiceValues(DS_BUOI).setRequired(true);
  f.addMultipleChoiceItem().setTitle("Hình thức tham dự").setChoiceValues(["Trực tiếp", "Trực tuyến"]).setRequired(true);
  f.addMultipleChoiceItem().setTitle("Trường hợp").setChoiceValues([
    "Có trong danh sách mời – không tự điểm danh được",
    "Chưa đăng ký – tham dự tại chỗ",
    "Dự thay cho người khác",
    "Sửa thông tin đã điểm danh"]).setRequired(true);
  f.addTextItem().setTitle("Dự thay cho / thông tin cần sửa").setHelpText("Ghi họ tên người được thay, hoặc nội dung cần sửa");
  f.addTextItem().setTitle("Người ghi nhận").setRequired(true);
  f.setDestination(FormApp.DestinationType.SPREADSHEET, SHEET_ID);
  SpreadsheetApp.flush(); Utilities.sleep(2000);
  SpreadsheetApp.openById(SHEET_ID).getSheets().forEach(function (sh) {
    var fu = sh.getFormUrl(); if (fu && fu.indexOf(f.getId()) > -1) sh.setName("Điểm danh lễ tân");
  });
  var link = f.getPublishedUrl(); try { link = f.shortenFormUrl(link); } catch (e) {}
  Logger.log("FORM LỄ TÂN | " + link);
}

/* ---------- 2. Lịch mở/đóng form ---------- */
function capNhatTrangThaiForm() {
  var ss = SpreadsheetApp.openById(SHEET_ID), now = new Date();
  LICH.forEach(function (x) {
    var f = moFormTheoTab_(ss, x.sheet); if (!f) return;
    var mo = new Date(x.mo), dong = new Date(x.dong), dangMo = now >= mo && now < dong;
    f.setAcceptingResponses(dangMo);
    if (!dangMo) {
      // Thông báo khi form đóng: thử bản đầy đủ, lỗi thì dùng bản ngắn; không để lỗi này chặn việc đóng/mở
      var ngan = now < mo ? "Form sẽ mở lúc " + gio_(x.mo) + "." : "Form đã đóng lúc " + gio_(x.dong) + ".";
      try { f.setCustomClosedFormMessage(ngan + " Liên hệ Ban Tổ chức: " + LIEN_HE + "."); }
      catch (e) {
        try { f.setCustomClosedFormMessage(ngan); } catch (e2) { Logger.log("Không ghi được thông báo cho " + x.sheet + ": " + e2); }
      }
    }
    Logger.log((dangMo ? "MỞ   " : "ĐÓNG ") + x.sheet + " (mở " + gio_(x.mo) + " – đóng " + gio_(x.dong) + ")");
  });
}

function caiLichMoForm() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (HANDLERS.indexOf(t.getHandlerFunction()) > -1) ScriptApp.deleteTrigger(t);
  });
  var now = new Date(), moc = {};
  LICH.forEach(function (x) { [x.mo, x.dong].forEach(function (s) { if (new Date(s) > now) moc[s] = 1; }); });
  Object.keys(moc).forEach(function (s) {
    ScriptApp.newTrigger("capNhatTrangThaiForm").timeBased().at(new Date(s)).create();
  });
  ScriptApp.newTrigger("lapXetCME").timeBased().everyMinutes(15).create();
  ScriptApp.newTrigger("donTriggerVanHanh").timeBased().at(new Date("2026-11-05T08:00:00+07:00")).create();
  capNhatTrangThaiForm();
  Logger.log("Đã đặt " + Object.keys(moc).length + " mốc đóng/mở form, cập nhật Xét CME mỗi 15 phút.");
}

function donTriggerVanHanh() {
  capNhatTrangThaiForm();
  lapXetCME();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (HANDLERS.indexOf(t.getHandlerFunction()) > -1) ScriptApp.deleteTrigger(t);
  });
}

/* ---------- 3. Xét CME ---------- */
function docTab_(ss, ten) {
  var sh = ss.getSheetByName(ten); if (!sh || sh.getLastRow() < 2) return { m: {}, rows: [] };
  var v = sh.getDataRange().getValues();
  return { m: cotMap_(v[0]), rows: v.slice(1) };
}

function lapXetCME() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  // Lượt điểm danh từ 3 nguồn: khóa họ tên + buổi → giờ sớm nhất, nguồn, hình thức
  var dd = {};
  function themDD(ten, nguon, cotTen, cotBuoi, cotHt, cotEmail) {
    var t = docTab_(ss, ten);
    t.rows.forEach(function (r) {
      var b = BUOI_INFO[r[t.m[cotBuoi]]]; if (!b || !r[0]) return;
      var keys = [khoa_(r[t.m[cotTen]])];
      if (cotEmail && r[t.m[cotEmail]]) keys.push(String(r[t.m[cotEmail]]).toLowerCase().trim());
      keys.forEach(function (k) {
        if (!k) return;
        var id = k + "|" + b.buoi, cur = dd[id], tg = new Date(r[0]);
        if (!cur || tg < cur.tg) dd[id] = { tg: tg, nguon: nguon, ht: cotHt ? r[t.m[cotHt]] : "Trực tiếp" };
      });
    });
  }
  themDD("Điểm danh nội viện", "Nội viện", "Họ và tên", "Buổi / Phiên tham dự", null, null);
  themDD("Điểm danh ngoại viện", "Ngoại viện", "Họ và tên", "Buổi / Phiên tham dự", "Hình thức tham dự", null);
  themDD("Điểm danh lễ tân", "Lễ tân", "Họ và tên", "Buổi / Phiên tham dự", "Hình thức tham dự", "Email");

  // Điểm post-test cao nhất theo email
  var diem = {};
  Object.keys(BUOI_INFO).forEach(function (bk) {
    var ten = BUOI_INFO[bk].test; if (diem[ten]) return; diem[ten] = {};
    var t = docTab_(ss, ten), cd = t.m["Điểm số"] !== undefined ? t.m["Điểm số"] : (t.m["Điểm"] !== undefined ? t.m["Điểm"] : t.m["Score"]);
    t.rows.forEach(function (r) {
      var em = String(r[t.m["Email"]] || "").toLowerCase().trim(); if (!em || cd === undefined) return;
      var d = parseInt(String(r[cd]), 10); if (isNaN(d)) return;
      if (diem[ten][em] === undefined || d > diem[ten][em]) diem[ten][em] = d;
    });
  });

  // Giữ cột người duyệt điền tay
  var hdr = ["Buổi / Phiên", "Họ và tên", "Năm sinh", "Chức danh", "Trình độ", "Đơn vị công tác", "Email",
             "Giờ điểm danh", "Điểm danh qua", "Hình thức", "Post-test", "Kết luận tự động",
             "Online ≥80% (xác nhận)", "Duyệt cấp CME", "Ghi chú người duyệt"];
  var sh = ss.getSheetByName("Xét CME"), giu = {};
  if (sh && sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, hdr.length).getValues().forEach(function (r) {
      giu[String(r[6]).toLowerCase() + "|" + r[0]] = [r[12], r[13], r[14]];
    });
  }

  // Mỗi người (email) × mỗi buổi đăng ký nhận CME — lấy lần check-out gần nhất
  var co = docTab_(ss, "Check-out CME"), m = co.m, cap = {};
  co.rows.forEach(function (r) {
    var em = String(r[m["Email"]] || "").toLowerCase().trim(); if (!em) return;
    String(r[m["Buổi / Phiên đã tham dự"]] || "").split(/,\s*(?=Buổi)/).forEach(function (bk) {
      bk = bk.trim(); if (!BUOI_INFO[bk]) return;
      var id = em + "|" + bk; if (!cap[id] || new Date(r[0]) > new Date(cap[id][0])) cap[id] = r;
    });
  });

  var out = Object.keys(cap).sort().map(function (id) {
    var r = cap[id], em = id.split("|")[0], bk = id.split("|")[1], b = BUOI_INFO[bk];
    var x = dd[khoa_(r[m["Họ và tên"]]) + "|" + b.buoi] || dd[em + "|" + b.buoi];
    var d = diem[b.test][em];
    var g = giu[id] || [false, false, ""];
    var thieu = [];
    if (!x) thieu.push("chưa điểm danh");
    else if (x.ht !== "Trực tuyến" && Utilities.formatDate(x.tg, TZ, "HH:mm") > b.muon) thieu.push("điểm danh muộn " + Utilities.formatDate(x.tg, TZ, "HH:mm"));
    if (d === undefined) thieu.push("chưa làm post-test");
    else if (d < NGUONG_DAT) thieu.push("post-test " + d + "/10");
    if (x && x.ht === "Trực tuyến" && g[0] !== true) thieu.push("cần xác nhận thời lượng online");
    return [bk, r[m["Họ và tên"]], r[m["Năm sinh"]], r[m["Chức danh"]], r[m["Trình độ"]], r[m["Đơn vị công tác"]], em,
            x ? Utilities.formatDate(x.tg, TZ, "HH:mm dd/MM") : "", x ? x.nguon : "", x ? x.ht : "",
            d === undefined ? "" : d + "/10", thieu.length ? "Chưa đủ: " + thieu.join("; ") : "Đủ điều kiện",
            g[0] === true, g[1] === true, g[2]];
  });

  // Đọc lại ô người duyệt vừa tick ngay trước khi ghi, để không mất thao tác trong lúc đang cập nhật
  if (sh && sh.getLastRow() > 1) {
    var moi = {};
    sh.getRange(2, 1, sh.getLastRow() - 1, hdr.length).getValues().forEach(function (r) {
      moi[String(r[6]).toLowerCase() + "|" + r[0]] = [r[12], r[13], r[14]];
    });
    out.forEach(function (row) {
      var g = moi[row[6] + "|" + row[0]]; if (!g) return;
      row[12] = g[0] === true; row[13] = g[1] === true; row[14] = g[2];
      if (row[9] === "Trực tuyến" && row[12] === true) row[11] = row[11].replace(/;? ?cần xác nhận thời lượng online/, "").replace(/^Chưa đủ: ?$/, "Đủ điều kiện");
    });
  }

  if (!sh) sh = ss.insertSheet("Xét CME", 2);
  var loc = sh.getFilter(); if (loc) loc.remove();
  sh.clear(); sh.setConditionalFormatRules([]);
  sh.getRange(1, 1, 1, hdr.length).setValues([hdr]).setFontWeight("bold").setBackground("#13233a").setFontColor("#ffffff").setWrap(true);
  if (out.length) {
    sh.getRange(2, 1, out.length, hdr.length).setValues(out);
    sh.getRange(2, 13, out.length, 2).insertCheckboxes();
    var kl = sh.getRange(2, 12, out.length, 1);
    sh.setConditionalFormatRules([
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Đủ điều kiện").setBackground("#d3f9d8").setFontColor("#1b5e20").setRanges([kl]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextStartsWith("Chưa đủ").setBackground("#fff4e6").setFontColor("#9c3d00").setRanges([kl]).build()
    ]);
    sh.getRange(1, 1, out.length + 1, hdr.length).createFilter();
  }
  sh.setFrozenRows(1); sh.setFrozenColumns(2);
  sh.setColumnWidth(1, 220); sh.setColumnWidth(2, 180); sh.setColumnWidth(6, 200); sh.setColumnWidth(7, 200); sh.setColumnWidth(12, 260);

  // Danh sách cấp CME: người đã được duyệt
  var ds = ss.getSheetByName("Danh sách cấp CME") || ss.insertSheet("Danh sách cấp CME", 3);
  if (ds.getRange("A1").getValue() === "") {
    ds.getRange(1, 1, 1, 11).setValues([hdr.slice(0, 11)])
      .setFontWeight("bold").setBackground("#13233a").setFontColor("#ffffff");
    ds.getRange("A2").setFormula(L_(ss, "=IFERROR(FILTER('Xét CME'!A2:K,'Xét CME'!N2:N=TRUE),\"\")"));
    ds.setFrozenRows(1);
  }
  Logger.log("Xét CME: " + out.length + " dòng (người × buổi).");
}
