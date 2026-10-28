/**
 * CHUẨN BỊ NGÀY HỘI NGHỊ 30/10/2026 — chạy hàm chayChuanBi() (1 lần)
 * ---------------------------------------------------------------
 * Cần thêm trong cùng dự án Apps Script (KHÔNG đưa lên GitHub vì là dữ liệu riêng):
 *   - POST_TESTS: câu hỏi 3 bài post-test (Nội khoa, Ngoại khoa, Điều dưỡng) kèm đáp án
 *   - MOI_DATA: danh sách mời [nhóm, họ tên/đơn vị, chức vụ–đơn vị, vai trò, 1=người/0=đơn vị]
 *   - tao-trang-tong-hop.gs (SHEET_ID, taoTongHop)
 *
 * 1. taoPostTest(): 3 form bài kiểm tra tự chấm, mỗi câu 1 điểm, đạt khi đúng từ 70%.
 *    Câu trả lời ghi vào cùng file Sheets điểm danh; không tạo trùng nếu chạy lại.
 * 2. taoDanhSachMoi(): tab "Danh sách mời" tự đối chiếu với 2 form điểm danh theo họ tên
 *    (bỏ học hàm/học vị, không phân biệt hoa thường), ghi giờ đến và form đã dùng.
 * 3. taoTongHop(): dựng lại trang Tổng hợp.
 */

var TITLE_RE = "^(?:(?:ttưt|pgs|gs|ts|ths|bs|ds|dscđ|cn|đd|ytcc|ktv|nhs|ckii|cki|ck2|ck1|ck|bà|ông|nhà báo)[\\s.]+)+";

function chayChuanBi() {
  taoPostTest();
  taoDanhSachMoi();
  taoTongHop();
}

/* ---------- 1. Post-test ---------- */
function taoPostTest() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  POST_TESTS.forEach(function (t) {
    if (ss.getSheetByName(t.sheet)) { Logger.log("Đã có: " + t.sheet + " – bỏ qua"); return; }
    var can = Math.ceil(t.qs.length * 0.7);
    var f = FormApp.create(t.sheet + " – Hội nghị KHKT BV Trưng Vương 2026");
    f.setTitle(t.sheet + " – " + t.phien)
     .setDescription("Hội nghị KHKT thường niên Bệnh viện Trưng Vương – 30/10/2026.\n" +
       "Bài kiểm tra cuối chương trình để xét cấp chứng nhận CME: đạt khi đúng từ " + can + "/" + t.qs.length + " câu (70%).\n" +
       "Vui lòng dùng CÙNG EMAIL với form Check-out nhận CME.")
     .setIsQuiz(true)
     .setConfirmationMessage("Cảm ơn Quý đại biểu! Sau khi nộp bài, vui lòng làm form Check-out nhận CME.");
    try { f.setRequireLogin(false); } catch (e) {}
    f.addTextItem().setTitle("Họ và tên").setRequired(true);
    f.addTextItem().setTitle("Email").setRequired(true)
      .setValidation(FormApp.createTextValidation().requireTextIsEmail().build());
    f.addTextItem().setTitle("Đơn vị công tác").setRequired(true);
    f.addPageBreakItem().setTitle("Bài kiểm tra (" + t.qs.length + " câu)");
    t.qs.forEach(function (x, i) {
      var it = f.addMultipleChoiceItem();
      it.setTitle("Câu " + (i + 1) + ". " + x.q)
        .setChoices(x.opts.map(function (o) { return it.createChoice(o, o === x.ans); }))
        .setPoints(1).setRequired(true);
      if (x.topic) it.setHelpText(x.topic);
    });
    f.setDestination(FormApp.DestinationType.SPREADSHEET, SHEET_ID);
    SpreadsheetApp.flush();
    Utilities.sleep(2000);
    SpreadsheetApp.openById(SHEET_ID).getSheets().forEach(function (sh) {
      var fu = sh.getFormUrl();
      if (fu && fu.indexOf(f.getId()) > -1) sh.setName(t.sheet);
    });
    var link = f.getPublishedUrl();
    try { link = f.shortenFormUrl(link); } catch (e) {}
    Logger.log("POST-TEST | " + t.sheet + " | " + link);
  });
}

/* ---------- 2. Danh sách mời + đối chiếu điểm danh ---------- */
// Bảng tính định dạng Việt Nam dùng ";" ngăn cách đối số công thức
function L_(ss, f) { return ss.getSpreadsheetLocale().indexOf("en") === 0 ? f : f.replace(/,/g, ";"); }

function taoDanhSachMoi() {
  var MOI = (typeof MOI_DATA !== "undefined") ? MOI_DATA : [];
  if (!MOI.length) throw new Error("Chưa có MOI_DATA (danh sách mời) trong dự án.");
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var NV = ss.getSheetByName("Điểm danh nội viện"), NGV = ss.getSheetByName("Điểm danh ngoại viện");
  function col(sh, tieuDe) {
    var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    var i = head.indexOf(tieuDe); if (i < 0) throw new Error(sh.getName() + " thiếu cột " + tieuDe);
    var c = sh.getRange(1, i + 1).getA1Notation().replace(/\d+/g, "");
    return "'" + sh.getName() + "'!" + c + "2:" + c;
  }
  // Chuẩn hóa họ tên: chữ thường, bỏ học hàm/học vị ở đầu, gộp khoảng trắng
  var key = function (rng) { return 'TRIM(REGEXREPLACE(REGEXREPLACE(LOWER(' + rng + '),"' + TITLE_RE + '",""),"\\s+"," "))'; };

  // Dùng lại tab cũ (chỉ xóa nội dung) thay vì xóa rồi tạo lại cùng tên — tránh lỗi "Dịch vụ Bảng tính"
  function tabSach(ten, viTri) {
    var t = ss.getSheetByName(ten);
    if (!t) return ss.insertSheet(ten, viTri);
    var loc = t.getFilter(); if (loc) loc.remove();
    t.setConditionalFormatRules([]);
    t.showColumns(1, t.getMaxColumns());
    t.clear();
    return t;
  }

  // Tab phụ (ẩn): họ tên chuẩn hóa + giờ điểm danh của 2 form
  var dd = tabSach("_DiemDanh");
  dd.getRange("A1:E1").setValues([["Khóa (nội viện)", "Giờ (nội viện)", "", "Khóa (ngoại viện)", "Giờ (ngoại viện)"]]);
  var nvTen = col(NV, "Họ và tên"), ngTen = col(NGV, "Họ và tên");
  dd.getRange("A2").setFormula(L_(ss, '=ARRAYFORMULA(IF(LEN(' + nvTen + ')=0,"",' + key(nvTen) + '))'));
  dd.getRange("B2").setFormula(L_(ss, "=ARRAYFORMULA('Điểm danh nội viện'!A2:A)"));
  dd.getRange("D2").setFormula(L_(ss, '=ARRAYFORMULA(IF(LEN(' + ngTen + ')=0,"",' + key(ngTen) + '))'));
  dd.getRange("E2").setFormula(L_(ss, "=ARRAYFORMULA('Điểm danh ngoại viện'!A2:A)"));
  // Nguồn thứ 3: lễ tân điểm danh hộ (nếu đã tạo form lễ tân)
  var LT = ss.getSheetByName("Điểm danh lễ tân");
  if (LT) {
    var ltTen = col(LT, "Họ và tên");
    dd.getRange("G1:H1").setValues([["Khóa (lễ tân)", "Giờ (lễ tân)"]]);
    dd.getRange("G2").setFormula(L_(ss, '=ARRAYFORMULA(IF(LEN(' + ltTen + ')=0,"",' + key(ltTen) + '))'));
    dd.getRange("H2").setFormula(L_(ss, "=ARRAYFORMULA('Điểm danh lễ tân'!A2:A)"));
  }
  // Nguồn thứ 4: Trang lễ tân – điểm danh + phát quà (cột D = họ tên theo danh sách mời)
  if (ss.getSheetByName("Phát quà")) {
    dd.getRange("J1:K1").setValues([["Khóa (bàn lễ tân)", "Giờ (bàn lễ tân)"]]);
    var pqTen = "'Phát quà'!D2:D";
    dd.getRange("J2").setFormula(L_(ss, '=ARRAYFORMULA(IF(LEN(' + pqTen + ')=0,"",' + key(pqTen) + '))'));
    dd.getRange("K2").setFormula(L_(ss, "=ARRAYFORMULA('Phát quà'!A2:A)"));
  }
  dd.hideSheet();

  SpreadsheetApp.flush();
  var sh = tabSach("Danh sách mời", 1);
  var hdr = ["Nhóm", "Họ tên / Đơn vị", "Chức vụ – Đơn vị", "Vai trò", "Trạng thái", "Giờ đến", "Điểm danh qua", "Khóa"];
  sh.getRange(1, 1, 1, hdr.length).setValues([hdr]);
  sh.getRange(2, 1, MOI.length, 4).setValues(MOI.map(function (r) { return [r[0], r[1], r[2], r[3]]; }));
  var D = "'_DiemDanh'!";
  var fx = MOI.map(function (r, i) {
    var n = i + 2, h = "$H" + n, e = "$E" + n;
    if (!r[4]) return ['="Theo đơn vị – kiểm tra thủ công"', '=""', '=""', '=""'];
    return [
      L_(ss, '=IF(' + h + '="","",IF(COUNTIF(' + D + 'A:A,' + h + ')+COUNTIF(' + D + 'D:D,' + h + ')+COUNTIF(' + D + 'G:G,' + h + ')+COUNTIF(' + D + 'J:J,' + h + ')>0,"Đã đến","Chưa đến"))'),
      L_(ss, '=IF(' + e + '<>"Đã đến","",MIN(IF(COUNTIF(' + D + 'A:A,' + h + '),MINIFS(' + D + 'B:B,' + D + 'A:A,' + h + '),9E9),IF(COUNTIF(' + D + 'D:D,' + h + '),MINIFS(' + D + 'E:E,' + D + 'D:D,' + h + '),9E9),IF(COUNTIF(' + D + 'G:G,' + h + '),MINIFS(' + D + 'H:H,' + D + 'G:G,' + h + '),9E9),IF(COUNTIF(' + D + 'J:J,' + h + '),MINIFS(' + D + 'K:K,' + D + 'J:J,' + h + '),9E9)))'),
      L_(ss, '=IF(' + e + '<>"Đã đến","",IF(COUNTIF(' + D + 'A:A,' + h + '),"Nội viện",IF(COUNTIF(' + D + 'D:D,' + h + '),"Ngoại viện",IF(COUNTIF(' + D + 'J:J,' + h + '),"Bàn lễ tân","Lễ tân (form)"))))'),
      L_(ss, '=' + key("$B" + n))
    ];
  });
  sh.getRange(2, 5, fx.length, 4).setFormulas(fx);

  sh.getRange(1, 1, 1, hdr.length).setFontWeight("bold").setBackground("#13233a").setFontColor("#ffffff");
  sh.getRange(2, 6, fx.length, 1).setNumberFormat("HH:mm");
  sh.setFrozenRows(1);
  sh.setColumnWidth(1, 190); sh.setColumnWidth(2, 260); sh.setColumnWidth(3, 300); sh.setColumnWidth(4, 150);
  sh.setColumnWidths(5, 3, 110);
  sh.hideColumns(8);
  var rg = sh.getRange(2, 5, fx.length, 1);
  sh.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Đã đến").setBackground("#d3f9d8").setFontColor("#1b5e20").setRanges([rg]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Chưa đến").setBackground("#fff4e6").setFontColor("#9c3d00").setRanges([rg]).build()
  ]);
  sh.getRange(1, 1, fx.length + 1, hdr.length).createFilter();
  Logger.log("Đã tạo tab Danh sách mời: " + MOI.length + " dòng");
}
