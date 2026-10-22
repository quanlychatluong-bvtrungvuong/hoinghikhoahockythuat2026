/**
 * SỬA FORM "CHECK-OUT – ĐĂNG KÝ NHẬN CME" (chạy 1 lần, khi form CHƯA có câu trả lời)
 * ---------------------------------------------------------------
 * Câu hỏi mới: Họ và tên · Năm sinh · Chức danh (BS, ĐD, KTV, Khác) ·
 * Trình độ (TS, ThS, CK2, CK1, Đại học, Cao đẳng, Khác) · Đơn vị · Số CCHN · Email ·
 * Buổi/Phiên đã tham dự · Mức độ hài lòng · Góp ý.  Mục "Khác" cho người điền tự ghi.
 *
 * Link form (forms.gle/…) giữ nguyên. Trang câu trả lời được tạo lại cho cột đúng thứ tự,
 * sau đó gọi taoTongHop() (file tao-trang-tong-hop.gs, cùng dự án) để dựng lại trang Tổng hợp.
 * Nếu form đã có câu trả lời, script dừng lại để không làm mất dữ liệu.
 */

function suaFormCME() {
  var ss = SpreadsheetApp.openById(SHEET_ID);           // SHEET_ID, DS_BUOI: khai báo trong tao-trang-tong-hop.gs
  var sh = ss.getSheetByName("Check-out CME");
  if (!sh || !sh.getFormUrl()) throw new Error('Không tìm thấy trang "Check-out CME" gắn với form.');
  var form = FormApp.openByUrl(sh.getFormUrl());

  var n = form.getResponses().length;
  if (n > 0) throw new Error("Form đã có " + n + " câu trả lời — dừng lại để không làm mất dữ liệu.");

  // 1. Xóa câu hỏi cũ, tạo lại theo thứ tự mới
  form.getItems().forEach(function (it) { form.deleteItem(it); });

  form.addTextItem().setTitle("Họ và tên").setRequired(true);
  form.addTextItem().setTitle("Năm sinh").setHelpText("VD: 1985").setRequired(true)
    .setValidation(FormApp.createTextValidation().requireNumberBetween(1930, 2010)
      .setHelpText("Nhập năm sinh gồm 4 chữ số, VD: 1985").build());
  form.addMultipleChoiceItem().setTitle("Chức danh")
    .setChoiceValues(["BS", "ĐD", "KTV"]).showOtherOption(true).setRequired(true);
  form.addMultipleChoiceItem().setTitle("Trình độ")
    .setChoiceValues(["TS", "ThS", "CK2", "CK1", "Đại học", "Cao đẳng"]).showOtherOption(true).setRequired(true);
  form.addTextItem().setTitle("Đơn vị công tác").setRequired(true);
  form.addTextItem().setTitle("Số chứng chỉ hành nghề").setRequired(true);
  form.addTextItem().setTitle("Email").setRequired(true)
    .setValidation(FormApp.createTextValidation().requireTextIsEmail().build());
  form.addCheckboxItem().setTitle("Buổi / Phiên đã tham dự").setChoiceValues(DS_BUOI).setRequired(true);
  form.addScaleItem().setTitle("Mức độ hài lòng với Hội nghị").setBounds(1, 5).setLabels("Không hài lòng", "Rất hài lòng");
  form.addParagraphTextItem().setTitle("Góp ý cho Ban Tổ chức");

  // 2. Tạo lại trang câu trả lời để cột khớp thứ tự câu hỏi mới
  form.removeDestination();
  ss.deleteSheet(sh);
  form.setDestination(FormApp.DestinationType.SPREADSHEET, SHEET_ID);
  SpreadsheetApp.flush();
  Utilities.sleep(3000);

  // 3. Đổi tên trang mới thành "Check-out CME" và dựng lại trang Tổng hợp
  taoTongHop();
  Logger.log("XONG! Đã sửa form CME: " + form.getPublishedUrl());
}
