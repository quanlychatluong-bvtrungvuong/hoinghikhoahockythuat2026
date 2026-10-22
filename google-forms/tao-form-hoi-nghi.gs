/**
 * TỰ ĐỘNG TẠO 4 GOOGLE FORM CHO NGÀY HỘI NGHỊ 30/10/2026 (chạy 1 lần)
 * ---------------------------------------------------------------
 * Form đăng ký tham dự đã có sẵn (forms.gle/CkFVbxHfDMbb6w4z6) nên không tạo lại.
 * Script tạo: Điểm danh nội viện, Điểm danh ngoại viện, Check-out nhận CME, Đặt câu hỏi.
 *
 * Cách dùng:
 *  1. Vào https://script.google.com  →  "Dự án mới" (New project).
 *  2. Xóa hết nội dung có sẵn, dán toàn bộ file này vào, bấm Lưu (Ctrl+S).
 *  3. Chọn hàm "taoTatCaForm" ở thanh trên  →  bấm "Chạy" (Run).
 *  4. Lần đầu Google hỏi quyền: Xem xét quyền → chọn tài khoản →
 *     "Nâng cao" → "Đi tới dự án (không an toàn)" → Cho phép.
 *     (Đây là script của chính bạn nên Google cảnh báo như vậy.)
 *  5. Khi chạy xong, mở "Nhật ký thực thi" (Execution log) ở dưới,
 *     sao chép đoạn "links: { ... }" gửi cho Claude (hoặc dán vào js/data.js).
 *
 * Kết quả: 4 form + 1 file Google Sheets "Hội nghị BVTV 2026 – Điểm danh & CME"
 * (mỗi form một trang tính) nằm trong Google Drive của bạn.
 */

var TEN_HOI_NGHI = "Hội nghị KHKT thường niên Bệnh viện Trưng Vương 2026 – Ngày 30/10/2026";

// Các buổi / phiên theo chương trình chính thức
var DS_BUOI = [
  "Buổi sáng – Phiên Nội khoa",
  "Buổi sáng – Phiên Ngoại khoa",
  "Buổi chiều – Hội nghị Khoa học Điều dưỡng"
];

// Danh sách phiên để người dự chọn khi đặt câu hỏi
var DS_PHIEN = [
  "Phiên sáng – Khai mạc (BHYT, AI trong bệnh viện)",
  "Phiên Nội khoa",
  "Phiên Ngoại khoa",
  "Phiên chiều – Hội nghị Khoa học Điều dưỡng"
];

function taoTatCaForm() {
  var ss = SpreadsheetApp.create("Hội nghị BVTV 2026 – Điểm danh & CME");
  var links = {};

  links.checkinInternal = taoForm_(ss, "Điểm danh nội viện", "Dành cho nhân viên Bệnh viện Trưng Vương. Thời gian điểm danh được ghi tự động.", function (f) {
    f.addTextItem().setTitle("Mã nhân viên").setRequired(true);
    hoTen_(f);
    f.addTextItem().setTitle("Khoa / Phòng").setRequired(true);
    f.addMultipleChoiceItem().setTitle("Buổi / Phiên tham dự").setChoiceValues(DS_BUOI).setRequired(true);
  });

  links.checkinExternal = taoForm_(ss, "Điểm danh ngoại viện", "Dành cho đại biểu ngoài Bệnh viện Trưng Vương. Thời gian điểm danh được ghi tự động.", function (f) {
    hoTen_(f);
    f.addTextItem().setTitle("Đơn vị công tác").setRequired(true);
    f.addTextItem().setTitle("Số chứng chỉ hành nghề");
    dienThoai_(f);
    f.addMultipleChoiceItem().setTitle("Hình thức tham dự").setChoiceValues(["Trực tiếp", "Trực tuyến"]).setRequired(true);
    f.addMultipleChoiceItem().setTitle("Buổi / Phiên tham dự").setChoiceValues(DS_BUOI).setRequired(true);
  });

  links.checkoutCME = taoForm_(ss, "Check-out – Đăng ký nhận CME", "Điền khi kết thúc buổi. Chứng nhận CME cấp cho đại biểu tham dự từ 80% thời lượng chương trình.", function (f) {
    hoTen_(f);
    f.addTextItem().setTitle("Năm sinh").setHelpText("VD: 1985").setRequired(true)
      .setValidation(FormApp.createTextValidation().requireNumberBetween(1930, 2010)
        .setHelpText("Nhập năm sinh gồm 4 chữ số, VD: 1985").build());
    f.addMultipleChoiceItem().setTitle("Chức danh").setChoiceValues(["BS", "ĐD", "KTV"]).showOtherOption(true).setRequired(true);
    f.addMultipleChoiceItem().setTitle("Trình độ").setChoiceValues(["TS", "ThS", "CK2", "CK1", "Đại học", "Cao đẳng"]).showOtherOption(true).setRequired(true);
    f.addTextItem().setTitle("Đơn vị công tác").setRequired(true);
    email_(f);
    f.addCheckboxItem().setTitle("Buổi / Phiên đã tham dự").setChoiceValues(DS_BUOI).setRequired(true);
    f.addScaleItem().setTitle("Mức độ hài lòng với Hội nghị").setBounds(1, 5).setLabels("Không hài lòng", "Rất hài lòng");
    f.addParagraphTextItem().setTitle("Góp ý cho Ban Tổ chức");
  });

  links.question = taoForm_(ss, "Đặt câu hỏi cho báo cáo viên", "Câu hỏi sẽ được chủ tọa chọn lọc và chuyển đến báo cáo viên.", function (f) {
    f.addListItem().setTitle("Phiên").setChoiceValues(DS_PHIEN).setRequired(true);
    f.addTextItem().setTitle("Gửi đến báo cáo viên (nếu có)");
    f.addParagraphTextItem().setTitle("Nội dung câu hỏi").setRequired(true);
    f.addTextItem().setTitle("Họ tên, đơn vị (không bắt buộc)");
  });

  // Xóa trang tính trống mặc định
  var trang1 = ss.getSheetByName("Sheet1") || ss.getSheetByName("Trang tính1");
  if (trang1 && ss.getSheets().length > 1) ss.deleteSheet(trang1);

  var out = "links: {\n" +
    '    checkinInternal: "' + links.checkinInternal + '",\n' +
    '    checkinExternal: "' + links.checkinExternal + '",\n' +
    '    checkoutCME: "' + links.checkoutCME + '",\n' +
    '    question: "' + links.question + '",\n' +
    "}";
  Logger.log("XONG! Sao chép đoạn dưới đây gửi cho Claude:\n\n" + out + "\n\nFile dữ liệu: " + ss.getUrl());
}

/* ---------- hàm phụ ---------- */
function taoForm_(ss, ten, moTa, themCauHoi) {
  var f = FormApp.create(ten + " – " + TEN_HOI_NGHI);
  f.setTitle(ten).setDescription(TEN_HOI_NGHI + "\n\n" + moTa);
  try { f.setRequireLogin(false); } catch (e) {}       // cho phép khách ngoại viện điền
  f.setConfirmationMessage("Cảm ơn Quý đại biểu! Thông tin đã được ghi nhận.");
  themCauHoi(f);
  f.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  var url = f.getPublishedUrl();
  try { url = f.shortenFormUrl(url); } catch (e) {}
  return url;
}
function hoTen_(f) { f.addTextItem().setTitle("Họ và tên").setRequired(true); }
function dienThoai_(f) { f.addTextItem().setTitle("Số điện thoại").setRequired(true); }
function email_(f) {
  f.addTextItem().setTitle("Email").setRequired(true)
    .setValidation(FormApp.createTextValidation().requireTextIsEmail().build());
}
