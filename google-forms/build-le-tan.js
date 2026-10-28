// Tạo trang /le-tan.html cho website từ giao diện trong le-tan-phat-qua.gs.
// Chạy: node google-forms/build-le-tan.js   (từ thư mục gốc website)
// Trang gọi Apps Script qua POST (không cần đăng nhập Google) bằng một lớp giả lập google.script.run.
const fs = require("fs");
const path = require("path");
const src = fs.readFileSync(path.join(__dirname, "le-tan-phat-qua.gs"), "utf8");
let html = src.slice(src.indexOf("String.raw`") + 11, src.lastIndexOf("`;"));
const API = "https://script.google.com/macros/s/AKfycbw7Fk1B6EfAQmH2wEHGcpNEXZPFEGK_mBrKNpuYo8oShcsPF_Xzhb_6ywL5naUabVwIxg/exec";
const head = `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Lễ tân – Hội nghị KHKT BV Trưng Vương 2026</title>
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<script>
/* Trang này nằm trên website hội nghị và gọi Apps Script qua POST (không cần đăng nhập Google).
   Giả lập google.script.run để dùng chung giao diện với bản chạy trong Apps Script. */
var LE_TAN_API = "${API}";
window.google = { script: { run: (function () {
  function R(ok, fail) { this.ok = ok; this.fail = fail; }
  R.prototype.withSuccessHandler = function (f) { return new R(f, this.fail); };
  R.prototype.withFailureHandler = function (f) { return new R(this.ok, f); };
  ["apiTaiDuLieu", "apiNhatKy", "apiXacNhan", "apiHoanTac"].forEach(function (fn) {
    R.prototype[fn] = function (pin, req) {
      var me = this;
      fetch(LE_TAN_API, { method: "POST", body: JSON.stringify({ fn: fn, pin: pin, req: req }) })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d.ok) { me.ok && me.ok(d.data); } else { me.fail && me.fail(new Error(d.error)); } })
        .catch(function () { me.fail && me.fail(new Error("Mất kết nối – kiểm tra mạng rồi thử lại")); });
    };
  });
  return new R();
})() } };
</script>`;
html = html.replace('<head><meta charset="utf-8">', '<head><meta charset="utf-8">\n' + head);
if (!html.includes("LE_TAN_API")) throw new Error("Không chèn được lớp giả lập");
fs.writeFileSync(path.join(__dirname, "..", "le-tan.html"), html);
console.log("Đã tạo le-tan.html (" + html.length + " ký tự)");
