/**
 * TẠO TRANG TÍNH "TỔNG HỢP" ĐẾM ĐIỂM DANH THEO TỪNG PHIÊN (chạy 1 lần)
 * ---------------------------------------------------------------
 * - Đổi tên các trang câu trả lời cho dễ đọc: "Điểm danh nội viện", "Điểm danh ngoại viện",
 *   "Check-out CME", "Đặt câu hỏi" (form vẫn ghi vào đúng trang sau khi đổi tên).
 * - Tạo trang "Tổng hợp" đứng đầu, toàn bộ là công thức nên số liệu tự cập nhật
 *   ngay khi có người điểm danh. Đếm theo NGƯỜI (không trùng): nội viện theo mã nhân viên,
 *   ngoại viện theo số điện thoại, CME theo email.
 * Chạy lại được: trang "Tổng hợp" cũ sẽ được tạo lại.
 */

var SHEET_ID = "135-FyUjbgtLuV6gf4-BXaYHu8u52D8oi9Gx8wHxe9vI";

var DS_BUOI = [
  "Buổi sáng – Phiên Nội khoa",
  "Buổi sáng – Phiên Ngoại khoa",
  "Buổi chiều – Hội nghị Khoa học Điều dưỡng"
];
var DS_PHIEN = [
  "Phiên sáng – Khai mạc (BHYT, AI trong bệnh viện)",
  "Phiên Nội khoa",
  "Phiên Ngoại khoa",
  "Phiên chiều – Hội nghị Khoa học Điều dưỡng"
];

// Tiêu đề form → tên trang tính mới
var TEN_TRANG = {
  "Điểm danh nội viện": "Điểm danh nội viện",
  "Điểm danh ngoại viện": "Điểm danh ngoại viện",
  "Check-out – Đăng ký nhận CME": "Check-out CME",
  "Đặt câu hỏi cho báo cáo viên": "Đặt câu hỏi"
};

function taoTongHop() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // 1. Đổi tên các trang câu trả lời theo tiêu đề form
  ss.getSheets().forEach(function (sh) {
    var url = sh.getFormUrl();
    if (!url) return;
    var ten = TEN_TRANG[FormApp.openByUrl(url).getTitle()];
    if (ten && sh.getName() !== ten) sh.setName(ten);
  });

  var NV = ss.getSheetByName("Điểm danh nội viện");
  var NGV = ss.getSheetByName("Điểm danh ngoại viện");
  var CME = ss.getSheetByName("Check-out CME");
  var CH = ss.getSheetByName("Đặt câu hỏi");
  if (!NV || !NGV || !CME || !CH) throw new Error("Không tìm thấy đủ 4 trang câu trả lời.");

  // Cột theo tiêu đề câu hỏi, VD: 'Điểm danh nội viện'!B2:B
  function cot(sh, tieuDe) {
    var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    var i = head.indexOf(tieuDe);
    if (i < 0) throw new Error('Trang "' + sh.getName() + '" không có cột "' + tieuDe + '"');
    var chu = sh.getRange(1, i + 1).getA1Notation().replace(/\d+/g, "");
    return "'" + sh.getName() + "'!" + chu + "2:" + chu;
  }
  var nvMa = cot(NV, "Mã nhân viên"), nvBuoi = cot(NV, "Buổi / Phiên tham dự");
  var ngSdt = cot(NGV, "Số điện thoại"), ngBuoi = cot(NGV, "Buổi / Phiên tham dự"), ngHt = cot(NGV, "Hình thức tham dự");
  var cmeCc = cot(CME, "Email"), cmeBuoi = cot(CME, "Buổi / Phiên đã tham dự");
  var chPhien = cot(CH, "Phiên");

  // 2. Tạo lại trang "Tổng hợp"
  var old = ss.getSheetByName("Tổng hợp");
  if (old) ss.deleteSheet(old);
  var th = ss.insertSheet("Tổng hợp", 0);

  th.getRange("A1").setValue("TỔNG HỢP ĐIỂM DANH – HỘI NGHỊ KHKT BỆNH VIỆN TRƯNG VƯƠNG 30/10/2026");
  th.getRange("A2").setFormula('="Số liệu tự cập nhật · xem lúc "&TEXT(NOW(),"HH:mm dd/MM/yyyy")');

  var hdr = ["Buổi / Phiên", "Nội viện", "Ngoại viện – trực tiếp", "Ngoại viện – trực tuyến", "Tổng người điểm danh", "Đã check-out CME"];
  th.getRange(4, 1, 1, hdr.length).setValues([hdr]);
  DS_BUOI.forEach(function (b, k) {
    var r = 5 + k, a = "$A" + r;
    th.getRange(r, 1).setValue(b);
    th.getRange(r, 2).setFormula("=IFERROR(ROWS(UNIQUE(FILTER(" + nvMa + "," + nvBuoi + "=" + a + "))),0)");
    th.getRange(r, 3).setFormula("=IFERROR(ROWS(UNIQUE(FILTER(" + ngSdt + "," + ngBuoi + "=" + a + "," + ngHt + '="Trực tiếp"))),0)');
    th.getRange(r, 4).setFormula("=IFERROR(ROWS(UNIQUE(FILTER(" + ngSdt + "," + ngBuoi + "=" + a + "," + ngHt + '="Trực tuyến"))),0)');
    th.getRange(r, 5).setFormula("=SUM(B" + r + ":D" + r + ")");
    th.getRange(r, 6).setFormula("=IFERROR(ROWS(UNIQUE(FILTER(" + cmeCc + ",ISNUMBER(SEARCH(" + a + "," + cmeBuoi + "))))),0)");
  });
  var rT = 5 + DS_BUOI.length;
  th.getRange(rT, 1).setValue("Tổng lượt theo phiên");
  ["B", "C", "D", "E", "F"].forEach(function (c, j) {
    th.getRange(rT, 2 + j).setFormula("=SUM(" + c + "5:" + c + (rT - 1) + ")");
  });

  var rQ = rT + 2;
  th.getRange(rQ, 1, 1, 2).setValues([["Câu hỏi theo phiên", "Số câu hỏi"]]);
  DS_PHIEN.forEach(function (p, k) {
    var r = rQ + 1 + k;
    th.getRange(r, 1).setValue(p);
    th.getRange(r, 2).setFormula("=COUNTIF(" + chPhien + ",$A" + r + ")");
  });
  var rQT = rQ + 1 + DS_PHIEN.length;
  th.getRange(rQT, 1).setValue("Tổng số câu hỏi");
  th.getRange(rQT, 2).setFormula("=SUM(B" + (rQ + 1) + ":B" + (rQT - 1) + ")");

  var rNext = rQT + 2, headRows = [rQ], totalRows = [rQT];

  // Kết quả post-test (nếu đã tạo form): số người làm bài và số người đạt từ 70%, đếm theo email
  var PT = ["Post-test Nội khoa", "Post-test Ngoại khoa", "Post-test Điều dưỡng"].filter(function (n) { return ss.getSheetByName(n); });
  if (PT.length) {
    th.getRange(rNext, 1, 1, 4).setValues([["Post-test", "Số người làm bài", "Đạt từ 70%", "Tỷ lệ đạt"]]);
    headRows.push(rNext);
    PT.forEach(function (n, k) {
      var s = ss.getSheetByName(n), r = rNext + 1 + k;
      var head = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0];
      var iDiem = -1;
      ["Điểm số", "Điểm", "Score"].some(function (t) { iDiem = head.indexOf(t); return iDiem > -1; });
      var em = cot(s, "Email");
      var diem = iDiem > -1 ? "'" + n + "'!" + s.getRange(1, iDiem + 1).getA1Notation().replace(/\d+/g, "") + "2:" + s.getRange(1, iDiem + 1).getA1Notation().replace(/\d+/g, "") : null;
      var nCau = head.filter(function (h) { return /^Câu \d+\./.test(h); }).length || 10;
      var can = Math.ceil(nCau * 0.7);
      th.getRange(r, 1).setValue(n.replace("Post-test ", "Phiên ") + " (đạt: từ " + can + "/" + nCau + " câu)");
      th.getRange(r, 2).setFormula("=IFERROR(ROWS(UNIQUE(FILTER(" + em + "," + em + "<>\"\"))),0)");
      if (diem) th.getRange(r, 3).setFormula("=IFERROR(ROWS(UNIQUE(FILTER(" + em + ",ARRAYFORMULA(IFERROR(VALUE(REGEXEXTRACT(" + diem + "&\"\",\"^\\d+\")),0))>=" + can + "))),0)");
      th.getRange(r, 4).setFormula("=IF(B" + r + "=0,\"\",C" + r + "/B" + r + ")");
      th.getRange(r, 4).setNumberFormat("0%");
    });
    rNext = rNext + PT.length + 2;
  }

  // Khách mời theo danh sách (nếu đã tạo tab "Danh sách mời")
  if (ss.getSheetByName("Danh sách mời") && ss.getSheetByName("_DiemDanh")) {
    var M = "'Danh sách mời'!", D = "'_DiemDanh'!";
    th.getRange(rNext, 1, 1, 2).setValues([["Khách mời theo danh sách", "Số người"]]);
    headRows.push(rNext);
    var rows = [
      ["Khách mời có tên trong danh sách", "=COUNTIF(" + M + "E:E,\"Đã đến\")+COUNTIF(" + M + "E:E,\"Chưa đến\")"],
      ["  – Đã đến", "=COUNTIF(" + M + "E:E,\"Đã đến\")"],
      ["  – Chưa đến", "=COUNTIF(" + M + "E:E,\"Chưa đến\")"],
      ["Lượt điểm danh không có tên trong danh sách mời", "=SUMPRODUCT((" + D + "A2:A<>\"\")*(COUNTIF(" + M + "H:H," + D + "A2:A)=0))+SUMPRODUCT((" + D + "D2:D<>\"\")*(COUNTIF(" + M + "H:H," + D + "D2:D)=0))"]
    ];
    rows.forEach(function (x, k) {
      th.getRange(rNext + 1 + k, 1).setValue(x[0]);
      th.getRange(rNext + 1 + k, 2).setFormula(x[1]);
    });
    rNext = rNext + rows.length + 2;

    // Theo từng nhóm trong danh sách mời
    var nhom = ss.getSheetByName("Danh sách mời").getRange("A2:A").getValues().map(function (r) { return r[0]; })
      .filter(function (g, i, a) { return g && a.indexOf(g) === i; });
    th.getRange(rNext, 1, 1, 4).setValues([["Khách mời theo nhóm", "Có tên trong danh sách", "Đã đến", "Tỷ lệ"]]);
    headRows.push(rNext);
    nhom.forEach(function (g, k) {
      var r = rNext + 1 + k, a = "$A" + r;
      th.getRange(r, 1).setValue(g);
      th.getRange(r, 2).setFormula("=COUNTIFS(" + M + "A:A," + a + "," + M + "E:E,\"Đã đến\")+COUNTIFS(" + M + "A:A," + a + "," + M + "E:E,\"Chưa đến\")");
      th.getRange(r, 3).setFormula("=COUNTIFS(" + M + "A:A," + a + "," + M + "E:E,\"Đã đến\")");
      th.getRange(r, 4).setFormula("=IF(B" + r + "=0,\"\",C" + r + "/B" + r + ")");
      th.getRange(r, 4).setNumberFormat("0%");
    });
    rNext = rNext + nhom.length + 2;
  }

  th.getRange(rNext, 1).setValue("Ghi chú: đếm theo người không trùng (nội viện: mã nhân viên; ngoại viện: số điện thoại; CME, post-test: email). Một người dự nhiều phiên được tính ở từng phiên. Khách mời đối chiếu theo họ tên (bỏ học hàm, không phân biệt hoa thường).");

  // Bảng tính định dạng Việt Nam dùng dấu ";" ngăn cách đối số công thức thay cho ","
  if (ss.getSpreadsheetLocale().indexOf("en") !== 0) {
    var rg = th.getDataRange(), fs = rg.getFormulas();
    fs.forEach(function (row, i) {
      row.forEach(function (f, j) {
        if (f) rg.getCell(i + 1, j + 1).setFormula(f.replace(/,/g, ";"));
      });
    });
  }

  // 3. Định dạng
  th.getRange("A1").setFontSize(14).setFontWeight("bold").setFontColor("#13233a");
  th.getRange("A2").setFontColor("#637083").setFontStyle("italic");
  th.getRange(4, 1, 1, hdr.length).setFontWeight("bold").setBackground("#13233a").setFontColor("#ffffff").setWrap(true).setVerticalAlignment("middle");
  headRows.forEach(function (r) {
    th.getRange(r, 1, 1, r === rQ ? 2 : th.getRange(r, 1, 1, 6).getValues()[0].filter(String).length)
      .setFontWeight("bold").setBackground("#13233a").setFontColor("#ffffff").setWrap(true).setVerticalAlignment("middle");
  });
  [th.getRange(rT, 1, 1, hdr.length)].concat(totalRows.map(function (r) { return th.getRange(r, 1, 1, 2); })).forEach(function (g) {
    g.setFontWeight("bold").setBackground("#f3ece1");
  });
  th.getRange(5, 5, DS_BUOI.length, 1).setFontWeight("bold").setFontColor("#d9480f");
  th.getRange(4, 2, rNext - 4, 5).setHorizontalAlignment("center");
  th.getRange(rNext, 1).setFontColor("#637083").setFontStyle("italic");
  th.setColumnWidth(1, 330);
  th.setColumnWidths(2, 5, 140);
  th.setRowHeight(4, 42);
  th.setFrozenRows(4);
  ss.setActiveSheet(th);

  Logger.log("XONG! Đã tạo trang Tổng hợp: " + ss.getUrl());
}
