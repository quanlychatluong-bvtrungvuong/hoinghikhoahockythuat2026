/**
 * TỰ ĐỘNG TẠO 6 GOOGLE FORM CHO HỘI NGHỊ (chạy 1 lần)
 * ---------------------------------------------------------------
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
 * Kết quả: 6 form + 1 file Google Sheets "Hội nghị BVTV 2026 – Dữ liệu"
 * (mỗi form một trang tính) nằm trong Google Drive của bạn.
 */

var TEN_HOI_NGHI = "Hội nghị KHKT thường niên Bệnh viện Trưng Vương 2026";

// Danh sách phiên để người dự chọn khi đặt câu hỏi — sửa theo chương trình chính thức
var DS_PHIEN = [
  "Báo cáo toàn thể",
  "Phiên Nội khoa: Tim mạch – Hô hấp – Nội tiết",
  "Phiên Ngoại khoa – Gây mê hồi sức",
  "Phiên Sản – Nhi",
  "Phiên Điều dưỡng – Kiểm soát nhiễm khuẩn",
  "Phiên Dược lâm sàng – Cận lâm sàng",
  "Phiên Poster & Báo cáo viên trẻ"
];

function taoTatCaForm() {
  var ss = SpreadsheetApp.create("Hội nghị BVTV 2026 – Dữ liệu");
  var links = {};

  links.register = taoForm_(ss, "Đăng ký tham dự", "Vui lòng điền thông tin để Ban Tổ chức chuẩn bị tài liệu và giấy chứng nhận.", function (f) {
    hoTen_(f); f.addTextItem().setTitle("Học hàm, học vị (BS, ThS, TS, CKI, CKII, ĐD, KTV, DS…)");
    f.addTextItem().setTitle("Đơn vị công tác").setRequired(true);
    f.addTextItem().setTitle("Khoa / Phòng – Chức danh");
    f.addTextItem().setTitle("Số chứng chỉ hành nghề (để cấp CME)");
    dienThoai_(f); email_(f);
    f.addMultipleChoiceItem().setTitle("Đối tượng").setChoiceValues(["Nhân viên Bệnh viện Trưng Vương", "Đại biểu ngoại viện", "Sinh viên / học viên"]).setRequired(true);
    f.addCheckboxItem().setTitle("Ngày tham dự").setChoiceValues(["Ngày 1", "Ngày 2"]).setRequired(true);
  });

  links.abstract = taoForm_(ss, "Nộp bài tóm tắt", "Bài tóm tắt tối đa 300 từ, gồm: Đặt vấn đề – Mục tiêu – Phương pháp – Kết quả – Kết luận.", function (f) {
    f.addTextItem().setTitle("Họ tên tác giả chính").setRequired(true);
    f.addTextItem().setTitle("Các đồng tác giả");
    f.addTextItem().setTitle("Đơn vị công tác").setRequired(true);
    dienThoai_(f); email_(f);
    f.addTextItem().setTitle("Tên bài báo cáo").setRequired(true);
    f.addListItem().setTitle("Chuyên ngành").setChoiceValues(["Nội khoa", "Ngoại khoa – Gây mê hồi sức", "Sản – Nhi", "Điều dưỡng – KSNK", "Dược – Cận lâm sàng", "Quản lý bệnh viện", "Khác"]).setRequired(true);
    f.addMultipleChoiceItem().setTitle("Hình thức đăng ký").setChoiceValues(["Báo cáo miệng", "Poster", "Theo đề xuất của Ban Khoa học"]).setRequired(true);
    f.addParagraphTextItem().setTitle("Nội dung bài tóm tắt (≤ 300 từ)").setRequired(true);
    f.addTextItem().setTitle("Link toàn văn / file đính kèm (Google Drive, nếu có)");
  });

  links.checkinInternal = taoForm_(ss, "Điểm danh nội viện", "Dành cho nhân viên Bệnh viện Trưng Vương. Thời gian điểm danh được ghi tự động.", function (f) {
    f.addTextItem().setTitle("Mã nhân viên").setRequired(true);
    hoTen_(f);
    f.addTextItem().setTitle("Khoa / Phòng").setRequired(true);
    f.addMultipleChoiceItem().setTitle("Buổi").setChoiceValues(["Sáng ngày 1", "Chiều ngày 1", "Sáng ngày 2", "Chiều ngày 2"]).setRequired(true);
  });

  links.checkinExternal = taoForm_(ss, "Điểm danh ngoại viện", "Dành cho đại biểu ngoài Bệnh viện Trưng Vương. Thời gian điểm danh được ghi tự động.", function (f) {
    hoTen_(f);
    f.addTextItem().setTitle("Đơn vị công tác").setRequired(true);
    f.addTextItem().setTitle("Số chứng chỉ hành nghề");
    dienThoai_(f);
    f.addMultipleChoiceItem().setTitle("Buổi").setChoiceValues(["Sáng ngày 1", "Chiều ngày 1", "Sáng ngày 2", "Chiều ngày 2"]).setRequired(true);
  });

  links.checkoutCME = taoForm_(ss, "Check-out – Đăng ký nhận CME", "Điền khi kết thúc buổi để được cấp Giấy chứng nhận đào tạo liên tục (CME).", function (f) {
    hoTen_(f);
    f.addDateItem().setTitle("Ngày sinh").setRequired(true);
    f.addTextItem().setTitle("Đơn vị công tác").setRequired(true);
    f.addTextItem().setTitle("Số chứng chỉ hành nghề").setRequired(true);
    email_(f);
    f.addScaleItem().setTitle("Mức độ hài lòng với Hội nghị").setBounds(1, 5).setLabels("Không hài lòng", "Rất hài lòng");
    f.addParagraphTextItem().setTitle("Góp ý cho Ban Tổ chức");
  });

  links.question = taoForm_(ss, "Đặt câu hỏi cho báo cáo viên", "Câu hỏi sẽ được chủ tọa chọn lọc và chuyển đến báo cáo viên.", function (f) {
    f.addListItem().setTitle("Phiên / Báo cáo").setChoiceValues(DS_PHIEN).setRequired(true);
    f.addParagraphTextItem().setTitle("Nội dung câu hỏi").setRequired(true);
    f.addTextItem().setTitle("Họ tên, đơn vị (không bắt buộc)");
  });

  // Xóa trang tính trống mặc định
  var trang1 = ss.getSheetByName("Sheet1") || ss.getSheetByName("Trang tính1");
  if (trang1 && ss.getSheets().length > 1) ss.deleteSheet(trang1);

  var out = "links: {\n" +
    '    register: "' + links.register + '",\n' +
    '    abstract: "' + links.abstract + '",\n' +
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
