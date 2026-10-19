/* =====================================================================
   FILE NỘI DUNG HỘI NGHỊ — CHỈ CẦN SỬA FILE NÀY
   ---------------------------------------------------------------------
   - Giữ nguyên dấu ngoặc kép "..." , dấu phẩy , và ngoặc { } [ ].
   - Liên kết để "" (rỗng) thì nút sẽ hiện "Sắp mở" và không bấm được.
   - Ngày giờ viết theo dạng "YYYY-MM-DDTHH:MM:SS+07:00".
   - Nội dung hiện tại là DỮ LIỆU MẪU, cần thay bằng thông tin chính thức.
   ===================================================================== */

window.CONF = {
  /* ---------- Thông tin chung ---------- */
  hospital: "Bệnh viện Trưng Vương",
  hospitalShort: "BVTV",
  logo: "",                       // VD: "assets/logo.png" (để "" sẽ dùng logo chữ)
  bannerImage: "",                // VD: "assets/banner.jpg" — nếu có banner thiết kế sẵn
  title: "Hội nghị Khoa học Kỹ thuật thường niên",
  year: "2026",
  theme: "Đổi mới – Chính xác – Lấy người bệnh làm trung tâm",
  startDate: "2026-11-27T07:30:00+07:00",
  endDate: "2026-11-28T17:00:00+07:00",
  dateText: "27 – 28/11/2026",
  venueName: "Hội trường Bệnh viện Trưng Vương",
  venueAddress: "266 Lý Thường Kiệt, Phường Diên Hồng, TP. Hồ Chí Minh",
  mapQuery: "Bệnh viện Trưng Vương, 266 Lý Thường Kiệt, TP. Hồ Chí Minh",
  cme: "Cấp Giấy chứng nhận đào tạo liên tục (CME) cho người tham dự đủ thời gian",

  /* ---------- Các liên kết (dán link Google Form / Google Drive) ---------- */
  links: {
    register: "",        // Form đăng ký tham dự
    abstract: "",        // Form nộp bài tóm tắt
    checkinInternal: "", // Điểm danh nội viện
    checkinExternal: "", // Điểm danh ngoại viện
    checkoutCME: "",     // Check-out & đăng ký nhận CME
    question: "",        // Đặt câu hỏi cho báo cáo viên
    invitation: "",      // Thư mời (PDF)
    programPdf: "",      // Chương trình in (PDF)
    documents: ""        // Thư mục tài liệu tham khảo
  },

  /* ---------- Thư chào mừng ---------- */
  welcome: {
    author: "Ban Giám đốc Bệnh viện Trưng Vương",
    role: "Trưởng Ban Tổ chức",
    paragraphs: [
      "Kính gửi Quý đại biểu, Quý đồng nghiệp,",
      "Hội nghị Khoa học Kỹ thuật thường niên Bệnh viện Trưng Vương năm 2026 là diễn đàn để các bác sĩ, điều dưỡng, kỹ thuật viên và dược sĩ chia sẻ kết quả nghiên cứu, kinh nghiệm thực hành lâm sàng và những tiến bộ kỹ thuật mới.",
      "Ban Tổ chức trân trọng kính mời Quý đại biểu đến tham dự, đóng góp báo cáo và cùng thảo luận để nâng cao chất lượng khám chữa bệnh, hướng tới sự hài lòng của người bệnh."
    ]
  },

  /* ---------- Ban tổ chức ---------- */
  committee: [
    { role: "Trưởng ban", name: "(Họ tên) – Giám đốc Bệnh viện" },
    { role: "Phó trưởng ban", name: "(Họ tên) – Phó Giám đốc Bệnh viện" },
    { role: "Thường trực", name: "Phòng Chỉ đạo tuyến – Đào tạo – NCKH" },
    { role: "Ban Khoa học", name: "Hội đồng Khoa học Công nghệ Bệnh viện" },
    { role: "Ban Hậu cần", name: "Phòng Hành chính Quản trị" }
  ],

  /* ---------- Mốc thời gian quan trọng ---------- */
  milestones: [
    { date: "2026-10-01", label: "Mở cổng đăng ký & nhận bài tóm tắt" },
    { date: "2026-11-05", label: "Hạn chót nộp bài tóm tắt" },
    { date: "2026-11-15", label: "Thông báo kết quả duyệt bài" },
    { date: "2026-11-25", label: "Hạn chót đăng ký tham dự" },
    { date: "2026-11-27", label: "Khai mạc Hội nghị" }
  ],

  /* ---------- Tin tức & thông báo ---------- */
  news: [
    { date: "2026-10-01", title: "Thông báo số 1: Mời viết bài và tham dự Hội nghị", link: "" },
    { date: "2026-10-15", title: "Hướng dẫn trình bày bài tóm tắt và báo cáo poster", link: "" }
  ],

  /* ---------- Chương trình ---------- */
  program: [
    {
      day: "Ngày 1 – Thứ Sáu, 27/11/2026",
      sessions: [
        { time: "07:30 – 08:00", title: "Đón tiếp đại biểu – Điểm danh", speaker: "", room: "Sảnh chính" },
        { time: "08:00 – 08:30", title: "Khai mạc Hội nghị – Phát biểu chào mừng", speaker: "Ban Giám đốc", room: "Hội trường A" },
        { time: "08:30 – 09:00", title: "Báo cáo toàn thể: Định hướng phát triển chuyên môn kỹ thuật 2026 – 2030", speaker: "TS.BS. Nguyễn Văn A", room: "Hội trường A" },
        { time: "09:00 – 09:30", title: "Cập nhật điều trị suy tim theo khuyến cáo mới", speaker: "BS.CKII. Trần Thị B", room: "Hội trường A" },
        { time: "09:30 – 09:45", title: "Giải lao – Tham quan gian hàng", speaker: "", room: "Sảnh chính" },
        { time: "09:45 – 11:30", title: "Phiên Nội khoa: Tim mạch – Hô hấp – Nội tiết", speaker: "Chủ tọa: TS.BS. Nguyễn Văn A", room: "Hội trường A" },
        { time: "13:30 – 16:30", title: "Phiên Ngoại khoa – Gây mê hồi sức", speaker: "Chủ tọa: ThS.BS. Lê Văn C", room: "Hội trường B" }
      ]
    },
    {
      day: "Ngày 2 – Thứ Bảy, 28/11/2026",
      sessions: [
        { time: "08:00 – 10:00", title: "Phiên Sản – Nhi", speaker: "Chủ tọa: BS.CKII. Phạm Thị D", room: "Hội trường A" },
        { time: "08:00 – 10:00", title: "Phiên Điều dưỡng – Kiểm soát nhiễm khuẩn", speaker: "Chủ tọa: CN.ĐD. Hoàng Thị E", room: "Hội trường B" },
        { time: "10:15 – 11:30", title: "Phiên Dược lâm sàng – Cận lâm sàng", speaker: "Chủ tọa: DS.CKII. Võ Văn F", room: "Hội trường A" },
        { time: "13:30 – 15:30", title: "Phiên báo cáo Poster & Báo cáo viên trẻ", speaker: "Hội đồng chấm giải", room: "Khu Poster" },
        { time: "15:30 – 16:30", title: "Trao giải – Tổng kết – Bế mạc", speaker: "Ban Tổ chức", room: "Hội trường A" }
      ]
    }
  ],

  /* ---------- Báo cáo viên / chủ tọa ---------- */
  speakers: [
    { name: "TS.BS. Nguyễn Văn A", title: "Khoa Nội Tim mạch", photo: "" },
    { name: "BS.CKII. Trần Thị B", title: "Khoa Hồi sức tích cực", photo: "" },
    { name: "ThS.BS. Lê Văn C", title: "Khoa Ngoại Tổng quát", photo: "" },
    { name: "BS.CKII. Phạm Thị D", title: "Khoa Sản", photo: "" },
    { name: "CN.ĐD. Hoàng Thị E", title: "Phòng Điều dưỡng", photo: "" },
    { name: "DS.CKII. Võ Văn F", title: "Khoa Dược", photo: "" }
  ],

  /* ---------- Phí tham dự ---------- */
  fees: [
    { type: "Nhân viên Bệnh viện Trưng Vương", price: "Miễn phí" },
    { type: "Đại biểu ngoại viện", price: "Liên hệ Ban Tổ chức" },
    { type: "Sinh viên, học viên", price: "Miễn phí (có thẻ SV)" }
  ],

  /* ---------- Nhà tài trợ (logo đặt trong thư mục assets) ---------- */
  sponsors: [
    { tier: "Nhà tài trợ Kim cương", items: [{ name: "Nhà tài trợ 1", logo: "" }, { name: "Nhà tài trợ 2", logo: "" }] },
    { tier: "Nhà tài trợ Vàng", items: [{ name: "Nhà tài trợ 3", logo: "" }, { name: "Nhà tài trợ 4", logo: "" }, { name: "Nhà tài trợ 5", logo: "" }] }
  ],

  /* ---------- Liên hệ ---------- */
  contact: {
    unit: "Phòng Chỉ đạo tuyến – Đào tạo – NCKH, Bệnh viện Trưng Vương",
    person: "(Họ tên người phụ trách)",
    phone: "(028) xxxx xxxx",
    email: "hoinghi@example.com",
    fanpage: ""
  }
};
