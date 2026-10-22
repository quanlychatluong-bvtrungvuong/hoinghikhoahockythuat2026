/**
 * LƯU FILE PDF CHƯƠNG TRÌNH VÀO GOOGLE DRIVE (chạy 1 lần)
 * ---------------------------------------------------------------
 * Lấy file PDF từ repo GitHub, lưu vào thư mục "Hội nghị BVTV 2026" trong Drive,
 * bật chia sẻ "Bất kỳ ai có đường liên kết – Người xem", rồi ghi link ra Nhật ký thực thi.
 * Dùng để file PDF (có thông tin chuyển khoản) không nằm trên Vercel.
 * Đã chạy ngày 22/10/2026: https://drive.google.com/file/d/11DHsOp2zAq5QatKaUzIZDLgZx3Xc3zGg/view
 * Sau đó file PDF đã được gỡ khỏi repo; muốn chạy lại cho bản PDF mới thì sửa PDF_URL.
 */

var PDF_URL = "https://raw.githubusercontent.com/quanlychatluong-bvtrungvuong/hoinghikhoahockythuat2026/main/assets/chuong-trinh-hoi-nghi-2026.pdf";
var PDF_TEN = "Chương trình Hội nghị KHKT BV Trưng Vương 2026 (30-10-2026).pdf";
var TEN_THU_MUC = "Hội nghị BVTV 2026";

function luuPdfLenDrive() {
  var res = UrlFetchApp.fetch(PDF_URL);
  if (res.getResponseCode() !== 200) throw new Error("Không tải được PDF: HTTP " + res.getResponseCode());
  var blob = res.getBlob().setName(PDF_TEN).setContentType("application/pdf");

  var it = DriveApp.getFoldersByName(TEN_THU_MUC);
  var folder = it.hasNext() ? it.next() : DriveApp.createFolder(TEN_THU_MUC);

  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  Logger.log("XONG! Link xem PDF: https://drive.google.com/file/d/" + file.getId() + "/view  (" + blob.getBytes().length + " bytes)");
}
