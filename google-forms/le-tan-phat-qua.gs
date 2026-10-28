/**
 * TRANG LỄ TÂN – ĐIỂM DANH VÀ PHÁT QUÀ (ứng dụng web Apps Script)
 * ---------------------------------------------------------------
 * - Lễ tân gõ vài chữ của tên (không dấu cũng được) → thấy ngay: có thư mời không, đã nhận quà chưa.
 * - Một chạm "Xác nhận + phát quà": ghi điểm danh + phát quà vào tab "Phát quà" (giờ, người phát).
 * - Mỗi suất quà chỉ phát 1 lần (khóa LockService chống trùng khi 2–3 máy bấm cùng lúc).
 * - Đơn vị: 1 đại diện; dự thay: nhận đúng suất của người được mời; không có thư mời: chỉ điểm danh.
 * - Vào trang phải nhập mã PIN (lưu trong Thuộc tính tập lệnh, không ghi trong code GitHub).
 *
 * Cần trong cùng dự án: MOI_DATA, PIN_LE_TAN (dữ liệu riêng), SHEET_ID, DS_BUOI, khoa_() .
 * Cài đặt: chạy caiDatPhatQua() 1 lần, rồi Triển khai → Ứng dụng web (Thực thi: Tôi; Truy cập: Bất kỳ ai).
 */

var QUA_TONG = 350;   // số suất quà dự trù
// Nhóm trong danh sách mời được nhận quà (2 nhóm "ĐD – Đăng ký dự …" là đăng ký, không phải thư mời)
var QUA_NHOM = ["Khách mời", "Chủ tọa – Báo cáo viên", "Đại biểu BV Trưng Vương", "Công ty tài trợ",
  "Bệnh viện – Trường – Trạm y tế", "ĐD – Khách mời ngoại viện", "ĐD – Chủ tọa, thư ký, báo cáo viên"];
var PQ_TAB = "Phát quà";
var PQ_HDR = ["Thời gian", "Buổi / Phiên tham dự", "Mã", "Họ tên (theo danh sách)", "Đơn vị / Chức vụ", "Nhóm",
  "Người đến thực tế", "Phát quà", "Trường hợp", "Người phát", "Ghi chú"];

function caiDatPhatQua() {
  var props = PropertiesService.getScriptProperties();
  if (typeof PIN_LE_TAN !== "undefined" && PIN_LE_TAN) props.setProperty("PIN_LE_TAN", String(PIN_LE_TAN));
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(PQ_TAB) || ss.insertSheet(PQ_TAB, 2);
  if (sh.getRange("A1").getValue() === "") {
    sh.getRange(1, 1, 1, PQ_HDR.length).setValues([PQ_HDR]).setFontWeight("bold").setBackground("#13233a").setFontColor("#ffffff");
    sh.setFrozenRows(1);
    sh.getRange("A:A").setNumberFormat("HH:mm:ss dd/MM/yyyy");
  }
  var ds = danhSachQua_(), co = ds.filter(function (x) { return x.q; }).length;
  Logger.log("Phát quà: " + co + " suất có quyền nhận / dự trù " + QUA_TONG + ". PIN đã lưu: " + (props.getProperty("PIN_LE_TAN") ? "có" : "CHƯA"));
}

function doGet() {
  return HtmlService.createHtmlOutput(LE_TAN_HTML)
    .setTitle("Lễ tân – Hội nghị KHKT BV Trưng Vương 2026")
    .addMetaTag("viewport", "width=device-width, initial-scale=1, maximum-scale=1");
}

// Cổng dữ liệu cho trang /le-tan.html trên website (không cần đăng nhập Google; PIN gửi trong nội dung POST)
function doPost(e) {
  var out;
  try {
    var b = JSON.parse(e.postData.contents || "{}");
    var fn = { apiTaiDuLieu: apiTaiDuLieu, apiNhatKy: apiNhatKy, apiXacNhan: apiXacNhan, apiHoanTac: apiHoanTac }[b.fn];
    if (!fn) throw new Error("Yêu cầu không hợp lệ");
    out = { ok: true, data: fn(b.pin, b.req) };
  } catch (err) {
    out = { ok: false, error: String(err && err.message || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- dữ liệu ---------- */
function kiemPin_(pin) {
  var p = PropertiesService.getScriptProperties().getProperty("PIN_LE_TAN");
  if (!p || String(pin).trim() !== p) throw new Error("Sai mã PIN");
}
function maMoi_(r) { return r[4] ? khoa_(r[1]) : "dv:" + String(r[1]).toLowerCase().trim(); }
// Phiên đăng ký: N = Nội khoa, G = Ngoại khoa, D = Điều dưỡng (chiều). Khách buổi sáng không ghi phiên = "NG".
function phienDK_(r) {
  var g = String(r[0]), v = String(r[3] || ""), p = "";
  if (g.indexOf("ĐD") === 0) p = "D";
  else if (g === "Chủ tọa – Báo cáo viên") {
    var b = v.split(";")[0].toLowerCase();
    if (/nội\s*-\s*ngoại/.test(b)) p = "NG";
    else if (/nội khoa/.test(b)) p = "N";
    else if (/ngoại khoa/.test(b)) p = "G";
    else if (/điều\s+dưỡng/.test(b)) p = "D";
    else p = "NG";
  } else p = "NG";
  if (v.indexOf("ĐD:") > -1 && p.indexOf("D") < 0) p += "D";   // có cả trong danh sách Điều dưỡng
  return p;
}
function danhSachQua_() {
  var seen = {};
  return MOI_DATA.map(function (r) {
    var k = maMoi_(r); if (seen[k]) return null; seen[k] = 1;
    return { k: k, t: r[1], d: r[2], g: r[0], v: r[3], u: r[4] ? 0 : 1, q: QUA_NHOM.indexOf(r[0]) > -1 ? 1 : 0, p: phienDK_(r) };
  }).filter(Boolean);
}
function nhatKy_() {
  var sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(PQ_TAB);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, PQ_HDR.length).getValues().map(function (r, i) {
    if (r[7] === "Đã hủy") return null;   // lượt đã hoàn tác: không tính điểm danh, không tính quà
    return { id: i + 2, tg: Utilities.formatDate(new Date(r[0]), "Asia/Ho_Chi_Minh", "HH:mm"), b: r[1], k: r[2], n: r[6],
             q: r[7] === "Có" ? 1 : 0, th: r[8], nv: r[9] };
  }).filter(Boolean);
}

/* ---------- API cho trang ---------- */
function apiTaiDuLieu(pin) {
  kiemPin_(pin);
  return { ds: danhSachQua_(), log: nhatKy_(), tong: QUA_TONG, buoi: DS_BUOI };
}
function apiNhatKy(pin) { kiemPin_(pin); return nhatKy_(); }

// req: { k (mã người trong danh sách, rỗng nếu không có thư mời), ten, dv, buoi, nguoi (người đến thực tế), thay (1 = dự thay), nv, ghiChu }
function apiXacNhan(pin, req) {
  kiemPin_(pin);
  if (DS_BUOI.indexOf(req.buoi) < 0) throw new Error("Chưa chọn buổi");
  if (!String(req.nv || "").trim()) throw new Error("Chưa nhập tên lễ tân");
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var log = nhatKy_(), ds = danhSachQua_(), x = null;
    if (req.k) { x = ds.filter(function (d) { return d.k === req.k; })[0]; if (!x) throw new Error("Không tìm thấy người trong danh sách"); }
    var nguoi = String(req.nguoi || (x ? x.t : req.ten) || "").trim();
    if (!nguoi) throw new Error("Chưa nhập họ tên người đến");
    var buoiLoai = function (b) { return String(b).indexOf("Buổi sáng") === 0 ? "sáng" : "chiều"; };
    var maDD = x ? x.k : "ngoai:" + khoa_(nguoi);
    if (log.some(function (l) { return l.k === maDD && buoiLoai(l.b) === buoiLoai(req.buoi); }))
      return { ok: false, msg: nguoi + " đã được điểm danh " + buoiLoai(req.buoi) + " nay rồi.", log: log };
    var daNhan = x && log.some(function (l) { return l.k === x.k && l.q; });
    var daPhat = log.filter(function (l) { return l.q; }).length;
    var qua = "Không", th;
    if (!x) th = "Không có thư mời – không phát quà";
    else if (!x.q) th = "Có trong danh sách đăng ký – không thuộc nhóm nhận quà";
    else if (daNhan) th = "Điểm danh thêm buổi – đã nhận quà trước đó";
    else if (daPhat >= QUA_TONG) th = "HẾT QUÀ – chưa phát";
    else { qua = "Có"; th = x.u ? "Đại diện đơn vị" : (req.thay ? "Dự thay" : "Có thư mời"); }
    SpreadsheetApp.openById(SHEET_ID).getSheetByName(PQ_TAB).appendRow([
      new Date(), req.buoi, maDD, x ? x.t : nguoi, x ? (x.d || x.v) : String(req.dv || ""), x ? x.g : "Không có thư mời",
      nguoi, qua, th, String(req.nv).trim(),
      [req.lech ? "Khác phiên đăng ký (" + req.lech + ") – lễ tân đã xác nhận" : "", String(req.ghiChu || "")].filter(String).join(" | ")]);
    SpreadsheetApp.flush();
    var id = SpreadsheetApp.openById(SHEET_ID).getSheetByName(PQ_TAB).getLastRow();
    return { ok: true, id: id, qua: qua === "Có", msg: (qua === "Có" ? "✔ Đã điểm danh + PHÁT QUÀ: " : "✔ Đã điểm danh (không phát quà): ") + nguoi + " – " + th, log: nhatKy_() };
  } finally { lock.releaseLock(); }
}

// Hoàn tác một lượt vừa bấm (trong 10 phút): không xóa dòng, chỉ đánh dấu "Đã hủy" để còn dấu vết
function apiHoanTac(pin, req) {
  kiemPin_(pin);
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(PQ_TAB), id = parseInt(req.id, 10);
    if (!id || id < 2 || id > sh.getLastRow()) throw new Error("Không tìm thấy lượt cần hoàn tác");
    var r = sh.getRange(id, 1, 1, PQ_HDR.length).getValues()[0];
    if (r[7] === "Đã hủy") return { ok: true, msg: "Lượt này đã được hoàn tác trước đó.", log: nhatKy_() };
    if (new Date() - new Date(r[0]) > 10 * 60 * 1000) throw new Error("Quá 10 phút – báo Ban Tổ chức sửa trong file Sheets");
    var gio = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "HH:mm");
    sh.getRange(id, 8, 1, 4).setValues([["Đã hủy", "ĐÃ HỦY – " + r[8], r[9],
      [r[10], "Hoàn tác bởi " + String(req.nv || "").trim() + " lúc " + gio].filter(String).join(" | ")]]);
    SpreadsheetApp.flush();
    return { ok: true, msg: "↩ Đã hoàn tác lượt của " + r[6] + (r[7] === "Có" ? " – suất quà được trả lại" : ""), log: nhatKy_() };
  } finally { lock.releaseLock(); }
}

/* ---------- giao diện ---------- */
var LE_TAN_HTML = String.raw`<!doctype html><html lang="vi"><head><meta charset="utf-8">
<style>
:root{--ink:#13233a;--coral:#d9480f;--ok:#2b8a3e;--warn:#e67700;--line:#e3e8ef;--muted:#64748b}
*{box-sizing:border-box}body{margin:0;font:16px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#1f2a37;background:#f6f7f9}
header{position:sticky;top:0;z-index:5;background:var(--ink);color:#fff;padding:10px 14px}
h1{font-size:16px;margin:0 0 6px}.stats{display:flex;gap:6px;flex-wrap:wrap;font-size:13px}
.stat{background:rgba(255,255,255,.12);border-radius:8px;padding:4px 9px}.stat b{font-size:15px}.stat.bad{background:#c92a2a}
.buoi{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}.buoi button{flex:1 1 30%;font:inherit;font-size:13px;padding:8px 6px;border:1px solid rgba(255,255,255,.4);background:transparent;color:#fff;border-radius:8px}
.buoi button.on{background:#fff;color:var(--ink);font-weight:700}
main{padding:12px 14px 80px;max-width:720px;margin:auto}
#q{width:100%;font-size:20px;padding:14px 16px;border:2px solid var(--ink);border-radius:12px}
.card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin-top:10px}
.name{font-weight:700;font-size:17px}.meta{color:var(--muted);font-size:13px}
.badge{display:inline-block;font-size:12px;font-weight:700;padding:2px 8px;border-radius:6px;margin:6px 6px 0 0}
.b-ok{background:#d3f9d8;color:#1b5e20}.b-done{background:#e7f5ff;color:#1864ab}.b-no{background:#fff4e6;color:#9c3d00}
.row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.btn{font:inherit;font-weight:700;border:0;border-radius:10px;padding:12px 14px;cursor:pointer}
.go{background:var(--ok);color:#fff;flex:1 1 100%;font-size:17px}.sub{background:#eef1f5;color:var(--ink);font-size:14px}
.btn:disabled{opacity:.5}
#toast{position:fixed;left:12px;right:12px;bottom:14px;padding:14px 16px;border-radius:12px;color:#fff;font-weight:700;display:none;z-index:9}
#toast button{margin-top:8px;font:inherit;font-weight:700;border:2px solid #fff;background:transparent;color:#fff;border-radius:8px;padding:8px 14px}
.card.lech{border:2px solid var(--warn);background:#fff9f0}.b-lech{background:#ffe8cc;color:#9c3d00}
.warn{background:var(--warn);color:#fff;flex:1 1 100%;font-size:16px}
.opt{display:flex;align-items:center;gap:8px;margin:10px 2px 0;font-size:14px;color:var(--muted)}.opt input{width:20px;height:20px}
.pin{max-width:360px;margin:60px auto;background:#fff;padding:22px;border-radius:14px;border:1px solid var(--line)}
.pin input{width:100%;font-size:18px;padding:12px;margin:6px 0 12px;border:1px solid #cbd5e1;border-radius:10px}
.muted{color:var(--muted);font-size:13px}.new{border-style:dashed}
.new input{width:100%;font-size:16px;padding:10px;margin-top:6px;border:1px solid #cbd5e1;border-radius:8px}
</style></head><body>
<div id="login" class="pin">
  <h2 style="margin:0 0 6px">Lễ tân – Hội nghị KHKT 2026</h2>
  <div class="muted">Bệnh viện Trưng Vương · 30/10/2026</div><br>
  <label>Mã PIN<input id="pin" type="password" inputmode="numeric" autocomplete="off"></label>
  <label>Tên lễ tân<input id="nv" placeholder="VD: Lan"></label>
  <button class="btn go" onclick="dangNhap()">Vào trang</button>
  <p id="err" style="color:#c92a2a"></p>
</div>
<div id="app" style="display:none">
<header>
  <h1>Điểm danh & phát quà · <span id="nvTen"></span></h1>
  <div class="stats" id="stats"></div>
  <div class="buoi" id="buoi"></div>
</header>
<main>
  <input id="q" placeholder="Gõ tên hoặc đơn vị… (không dấu cũng được)" autocomplete="off" oninput="ve()">
  <label class="opt"><input type="checkbox" id="tatca" onchange="ve()"> Tìm cả người đăng ký buổi khác</label>
  <div id="kq"></div>
  <div class="card new" id="moi" style="display:none">
    <div class="name">Không có trong danh sách mời</div>
    <div class="meta">Chỉ điểm danh, KHÔNG phát quà.</div>
    <input id="nTen" placeholder="Họ và tên"><input id="nDv" placeholder="Đơn vị công tác">
    <div class="row"><button class="btn sub" onclick="ngoaiDS()">Điểm danh người không có thư mời</button></div>
  </div>
</main>
</div>
<div id="toast"></div>
<script>
var PIN="", NV="", DS=[], LOG=[], TONG=350, BUOI=[], CHON="", dang=false;
function bo(s){return String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D").toLowerCase();}
function e(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function toast(m,ok){var t=document.getElementById("toast");t.textContent=m;t.style.background=ok?"#2b8a3e":"#c92a2a";t.style.display="block";clearTimeout(t._h);t._h=setTimeout(function(){t.style.display="none";},ok?2500:5000);}
try{document.getElementById("nv").value=localStorage.getItem("ltNV")||"";}catch(x){}
function dangNhap(){
  PIN=document.getElementById("pin").value.trim();NV=document.getElementById("nv").value.trim();
  if(!NV){document.getElementById("err").textContent="Nhập tên lễ tân";return;}
  google.script.run.withSuccessHandler(function(d){
    try{localStorage.setItem("ltNV",NV);}catch(x){}
    DS=d.ds;LOG=d.log;TONG=d.tong;BUOI=d.buoi;
    DS.forEach(function(x){x.s=bo(x.t+" "+x.d+" "+x.v+" "+x.g);});
    var h=new Date().getHours(); CHON=h<12?BUOI[0]:BUOI[2];
    document.getElementById("login").style.display="none";document.getElementById("app").style.display="block";
    document.getElementById("nvTen").textContent=NV; veBuoi(); ve(); document.getElementById("q").focus();
    setInterval(lamMoi,10000);
  }).withFailureHandler(function(er){document.getElementById("err").textContent=er.message;}).apiTaiDuLieu(PIN);
}
function lamMoi(){google.script.run.withSuccessHandler(function(l){LOG=l;ve();}).apiNhatKy(PIN);}
function veBuoi(){
  var nhan=["Sáng · Nội khoa","Sáng · Ngoại khoa","Chiều · Điều dưỡng"];
  document.getElementById("buoi").innerHTML=BUOI.map(function(b,i){return '<button class="'+(b===CHON?"on":"")+'" onclick="CHON=BUOI['+i+'];veBuoi();ve()">'+nhan[i]+"</button>";}).join("");
}
function loai(b){return String(b).indexOf("Buổi sáng")===0?"sáng":"chiều";}
var TEN_P={N:"Nội khoa",G:"Ngoại khoa",D:"Điều dưỡng"};
function maP(){return ["N","G","D"][BUOI.indexOf(CHON)]||"";}
function tenP(p){return p.split("").map(function(c){return TEN_P[c];}).join(" / ");}
function ve(){
  var daPhat=LOG.filter(function(l){return l.q;}).length, nhan={}, dd={};
  LOG.forEach(function(l){if(l.q)nhan[l.k]=l; dd[l.k+"|"+loai(l.b)]=l;});
  var chua=DS.filter(function(x){return x.q&&!nhan[x.k];}).length, con=TONG-daPhat;
  document.getElementById("stats").innerHTML='<span class="stat">Đã phát <b>'+daPhat+"</b>/"+TONG+'</span><span class="stat">Còn <b>'+con+'</b></span><span class="stat'+(chua>con?" bad":"")+'">Khách mời chưa nhận <b>'+chua+"</b>"+(chua>con?" · THIẾU "+(chua-con):"")+"</span>";
  var q=bo(document.getElementById("q").value.trim()), kq=document.getElementById("kq");
  document.getElementById("moi").style.display=q.length>=2?"block":"none";
  if(q.length<2){kq.innerHTML='<p class="muted">Gõ ít nhất 2 chữ. Buổi đang chọn: <b>'+e(CHON)+"</b></p>";return;}
  var tu=q.split(/\s+/), mp=maP(), buoiMa=loai(CHON)==="sáng"?"NG":"D", tatca=document.getElementById("tatca").checked;
  var ds=DS.filter(function(x){return tu.every(function(w){return x.s.indexOf(w)>-1;}) && (tatca || x.p.split("").some(function(c){return buoiMa.indexOf(c)>-1;}));});
  ds.sort(function(a,b){return (b.p.indexOf(mp)>-1)-(a.p.indexOf(mp)>-1);}); ds=ds.slice(0,15);
  kq.innerHTML=ds.length?ds.map(function(x,i){
    var n=nhan[x.k], d=dd[x.k+"|"+loai(CHON)], h="";
    var lech=x.p.indexOf(mp)<0;
    h+='<div class="card'+(lech&&!d?" lech":"")+'"><div class="name">'+e(x.t)+'</div><div class="meta">'+e(x.g)+(x.d?" · "+e(x.d):"")+(x.v?" · "+e(x.v):"")+"</div>";
    if(!x.q) h+='<span class="badge b-no">Đăng ký – không thuộc nhóm nhận quà</span>';
    else if(n) h+='<span class="badge b-done">Đã nhận quà '+e(n.tg)+" · "+e(n.nv)+(n.n&&bo(n.n)!==bo(x.t)?" · người nhận: "+e(n.n):"")+"</span>";
    else h+='<span class="badge b-ok">Có thư mời – chưa nhận quà</span>';
    if(d) h+='<span class="badge b-done">Đã điểm danh '+loai(CHON)+" "+e(d.tg)+"</span>";
    if(lech&&!d) h+='<span class="badge b-lech">⚠ Đăng ký: '+e(tenP(x.p))+" – đang chọn "+e(TEN_P[mp])+"</span>";
    h+='<div class="row">';
    if(d){}
    else if(x.q&&!n&&x.u) h+='<button class="btn '+(lech?"warn":"go")+'" onclick="xacNhan('+i+',2)">'+(lech?"⚠ ":"")+'Phát cho người đại diện đơn vị…</button>';
    else if(x.q&&!n) h+='<button class="btn '+(lech?"warn":"go")+'" onclick="xacNhan('+i+',0)">'+(lech?"⚠ Khác phiên đăng ký – xác nhận…":"✔ Xác nhận + phát quà")+'</button><button class="btn sub" onclick="xacNhan('+i+',1)">Người khác dự thay…</button>';
    else h+='<button class="btn sub" onclick="xacNhan('+i+',0)">Điểm danh '+loai(CHON)+" (không phát quà)</button>";
    h+="</div></div>"; x._i=i; window["_r"+i]=x; return h;
  }).join(""):'<p class="muted">Không tìm thấy trong danh sách mời'+(tatca?"":" ở buổi này – thử tick ô <b>Tìm cả người đăng ký buổi khác</b>")+'.</p>';
}
function toastHT(m,id){
  var t=document.getElementById("toast");t.innerHTML=e(m)+'<br><button onclick="hoanTac('+id+')">↩ Hoàn tác (15 giây)</button>';
  t.style.background="#2b8a3e";t.style.display="block";clearTimeout(t._h);t._h=setTimeout(function(){t.style.display="none";},15000);
}
function hoanTac(id){
  var t=document.getElementById("toast");t.style.display="none";
  google.script.run.withSuccessHandler(function(r){LOG=r.log||LOG;toast(r.msg,true);ve();})
  .withFailureHandler(function(er){toast(er.message,false);}).apiHoanTac(PIN,{id:id,nv:NV});
}
function gui(req){
  if(dang)return; dang=true; req.buoi=CHON; req.nv=NV;
  google.script.run.withSuccessHandler(function(r){dang=false;LOG=r.log||LOG;if(r.ok&&r.id){toastHT(r.msg,r.id);}else{toast(r.msg,r.ok);}if(r.ok){document.getElementById("q").value="";document.getElementById("nTen").value="";document.getElementById("nDv").value="";}ve();document.getElementById("q").focus();})
  .withFailureHandler(function(er){dang=false;toast(er.message,false);}).apiXacNhan(PIN,req);
}
function xacNhan(i,kieu){
  var x=window["_r"+i], req={k:x.k}, mp=maP();
  if(x.p.indexOf(mp)<0){
    if(!confirm("⚠ "+x.t+" đăng ký phiên "+tenP(x.p)+",\nnhưng đang điểm danh: "+CHON+".\n\nĐã kiểm tra lại với đại biểu và vẫn xác nhận?"))return;
    req.lech=tenP(x.p);
  }
  if(kieu===1){var t=prompt("Họ tên người đến dự thay cho "+x.t+":");if(!t)return;req.nguoi=t;req.thay=1;req.ghiChu="Dự thay cho "+x.t;}
  if(kieu===2){var t2=prompt("Họ tên người đại diện "+x.t+":");if(!t2)return;req.nguoi=t2;}
  gui(req);
}
function ngoaiDS(){
  var t=document.getElementById("nTen").value.trim(), d=document.getElementById("nDv").value.trim();
  if(!t||!d){toast("Nhập họ tên và đơn vị",false);return;}
  gui({k:"",ten:t,dv:d,nguoi:t});
}
document.getElementById("pin").addEventListener("keydown",function(ev){if(ev.key==="Enter")dangNhap();});
</script></body></html>`;
