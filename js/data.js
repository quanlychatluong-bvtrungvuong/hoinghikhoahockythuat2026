/* =====================================================================
   FILE NỘI DUNG HỘI NGHỊ — CHỈ CẦN SỬA FILE NÀY
   ---------------------------------------------------------------------
   - Giữ nguyên dấu ngoặc kép "..." , dấu phẩy , và ngoặc { } [ ].
   - Liên kết để "" (rỗng) thì nút sẽ hiện "Sắp mở" (hoặc được ẩn đi).
   - Mục để trống "" hoặc danh sách rỗng [] sẽ tự ẩn khỏi trang.
   - Ngày giờ viết theo dạng "YYYY-MM-DDTHH:MM:SS+07:00".
   - Nguồn: Chương trình Hội nghị KHKT thường niên BV Trưng Vương 2026 (ngày 30/10/2026).
   ===================================================================== */

window.CONF = {
  /* ---------- Thông tin chung ---------- */
  hospital: "Bệnh viện Trưng Vương",
  hospitalShort: "BVTV",
  logo: "assets/logo-bvtv.jpg",   // Logo bệnh viện (để "" sẽ dùng logo chữ)
  bannerImage: "",                // VD: "assets/banner.jpg" — nếu có banner thiết kế sẵn
  title: "Hội nghị Khoa học Kỹ thuật thường niên",
  year: "2026",
  theme: "Phiên sáng: Hội nghị Khoa học Kỹ thuật · Phiên chiều: Hội nghị Khoa học Điều dưỡng",
  startDate: "2026-10-30T07:00:00+07:00",
  endDate: "2026-10-30T16:30:00+07:00",
  dateText: "Thứ Sáu, 30/10/2026",
  venueName: "Bệnh viện Trưng Vương",
  venueAddress: "266 Lý Thường Kiệt, Phường Diên Hồng, TP. Hồ Chí Minh",
  mapQuery: "Bệnh viện Trưng Vương, 266 Lý Thường Kiệt, TP. Hồ Chí Minh",
  onlineNote: "Link tham dự trực tuyến sẽ được cập nhật trước ngày Hội nghị.", // hiện khi onlineLink còn trống
  onlineName: "Phòng trực tuyến OneZoom",
  onlinePass: "1111",             // mật khẩu phòng trực tuyến (để "" nếu không có)
  audience: "Bác sĩ, điều dưỡng và nhân viên y tế. Tham dự trực tiếp hoặc trực tuyến.",
  cme: "Cấp chứng nhận CME khi tham dự từ 80% thời lượng của chương trình và hoàn tất chính xác từ đủ 70% bài kiểm tra cuối chương trình.",

  /* ---------- Các liên kết (dán link Google Form / Google Drive) ---------- */
  links: {
    register: "https://forms.gle/CkFVbxHfDMbb6w4z6", // Form đăng ký tham dự
    abstract: "",        // Form nộp bài tóm tắt (để trống: nút được ẩn)
    checkinInternal: "https://forms.gle/BrBJobRjttwwrqU27", // Điểm danh nội viện
    checkinExternal: "https://forms.gle/3kgsHSp24hAN1Vx66", // Điểm danh ngoại viện
    postTestNoi: "https://forms.gle/LAu2sLrXGaj5YPQ89",   // Post-test phiên Nội khoa
    postTestNgoai: "https://forms.gle/U3i5uB8EaRgYtDgMA", // Post-test phiên Ngoại khoa
    postTestDD: "https://forms.gle/Hi1QiLRfinwEDEfJ7",    // Post-test phiên Điều dưỡng
    checkoutCME: "https://forms.gle/vo9gY3qZYCkUaPyL6",     // Check-out & đăng ký nhận CME
    question: "https://forms.gle/oVgCAYYbm66811K1A",        // Đặt câu hỏi cho báo cáo viên
    onlineLink: "https://onezoom.vn/meet/92410142951", // Link tham dự trực tuyến
    invitation: "",      // Thư mời (PDF)
    programPdf: "https://drive.google.com/file/d/11DHsOp2zAq5QatKaUzIZDLgZx3Xc3zGg/view", // Chương trình in (PDF) – lưu trên Google Drive của quanlychatluong
    documents: ""        // Thư mục tài liệu tham khảo
  },

  /* ---------- Giờ mở / đóng các form (khớp lịch tự động trong Google Forms) ---------- */
  schedule: {
    checkinInternal: ["2026-10-30T07:00:00+07:00", "2026-10-30T17:00:00+07:00"],
    checkinExternal: ["2026-10-30T07:00:00+07:00", "2026-10-30T17:00:00+07:00"],
    question:        ["2026-10-30T07:00:00+07:00", "2026-10-30T17:00:00+07:00"],
    postTestNoi:     ["2026-10-30T11:00:00+07:00", "2026-11-04T23:59:00+07:00"],
    postTestNgoai:   ["2026-10-30T11:00:00+07:00", "2026-11-04T23:59:00+07:00"],
    postTestDD:      ["2026-10-30T16:00:00+07:00", "2026-11-04T23:59:00+07:00"],
    checkoutCME:     ["2026-10-30T11:00:00+07:00", "2026-11-04T23:59:00+07:00"],
    onlineLink:      ["2026-10-30T07:00:00+07:00", "2026-10-30T17:00:00+07:00"]  // phòng trực tuyến
  },

  /* ---------- Thư chào mừng ---------- */
  welcome: {
    author: "Ban Tổ chức Hội nghị",
    role: "Bệnh viện Trưng Vương",
    paragraphs: [
      "Kính gửi Quý đại biểu, Quý đồng nghiệp,",
      "Hội nghị Khoa học Kỹ thuật thường niên Bệnh viện Trưng Vương năm 2026 diễn ra ngày 30/10/2026, gồm phiên toàn thể, hai phiên chuyên đề Nội khoa và Ngoại khoa diễn ra song song, cùng Hội nghị Khoa học Điều dưỡng vào buổi chiều.",
      "Ban Tổ chức trân trọng kính mời Quý đại biểu đến tham dự, chia sẻ kinh nghiệm và cùng thảo luận để nâng cao chất lượng khám chữa bệnh, hướng tới sự hài lòng của người bệnh."
    ]
  },

  /* ---------- Ban Giám đốc / Ban tổ chức ---------- */
  committeeTitle: "Ban Giám đốc Bệnh viện",
  committee: [
    { role: "Giám đốc", name: "BS.CKII. Huỳnh Ngọc Hớn" },
    { role: "Phó Giám đốc", name: "BS.CKII. Nguyễn Trí Dũng" },
    { role: "Phó Giám đốc", name: "TS.BS. Lê Nguyễn Quyền" }
  ],

  /* ---------- Mốc thời gian quan trọng ---------- */
  milestones: [
    { date: "2026-10-30", label: "Khai mạc Hội nghị (07:30) – Phiên chiều Điều dưỡng (13:15)" }
  ],

  /* ---------- Tin tức & thông báo ---------- */
  news: [
    { date: "2026-10-19", title: "Công bố chương trình chính thức Hội nghị ngày 30/10/2026", link: "https://drive.google.com/file/d/11DHsOp2zAq5QatKaUzIZDLgZx3Xc3zGg/view" },
    { date: "2026-10-22", title: "Cập nhật chương trình và quy định cấp CME (thêm bài kiểm tra cuối chương trình)", link: "https://drive.google.com/file/d/11DHsOp2zAq5QatKaUzIZDLgZx3Xc3zGg/view" }
  ],

  /* ---------- Chương trình: mỗi phiên là một tab ---------- */
  program: [
    {
      label: "Phiên sáng – Khai mạc",
      time: "07:00 – 08:15 · Hội nghị Khoa học Kỹ thuật",
      room: "",                     // Hội trường / phòng (VD: "Hội trường A, lầu 5")
      chairs: [],
      sessions: [
        { time: "07:00 – 07:30", title: "Đón tiếp đại biểu, khách mời" },
        { time: "07:30 – 07:45", title: "Khai mạc Hội nghị" },
        { time: "07:45 – 08:00", title: "Xuất toán bảo hiểm y tế năm 2024 – 2025: Hiệu quả và các biện pháp khắc phục", speaker: "BS.CKII. Phan Thanh Hằng", role: "Trưởng phòng Kế hoạch tổng hợp" },
        { time: "08:00 – 08:15", title: "Sử dụng AI trong bệnh viện an toàn, hiệu quả và trách nhiệm", speaker: "ThS. Đặng Thanh Hùng", role: "Trưởng phòng Công nghệ thông tin, Bệnh viện Nhi đồng 1" }
      ]
    },
    {
      label: "Phiên Nội khoa",
      time: "08:15 – 11:30 · Song song với Phiên Ngoại khoa",
      room: "Hội trường số 3",                     // Hội trường / phòng (VD: "Hội trường A, lầu 5")
      chairs: [
        { name: "BS.CKII. Huỳnh Ngọc Hớn", title: "Giám đốc, BV Trưng Vương" },
        { name: "BS.CKII. Nguyễn Trí Dũng", title: "Phó Giám đốc, BV Trưng Vương" },
        { name: "TS.BS. Phạm Ngọc Huy Tuấn", title: "Trưởng khoa Tiêu hóa – Tiết niệu, BV Trưng Vương" },
        { name: "TS.BS. Lê Cao Phương Duy", title: "Phó Giám đốc, BV Nguyễn Tri Phương" }
      ],
      sessions: [
        { time: "08:15 – 08:30", title: "Vai trò của sự tuân thủ trong điều trị loãng xương", speaker: "BS.CKII. Huỳnh Đặng Bảo Cương", role: "Trưởng khoa Điều trị đau – Vật lý trị liệu – Y học cổ truyền" },
        { time: "08:30 – 08:45", title: "Tỷ lệ, một số yếu tố liên quan và đánh giá kết quả điều trị rối loạn chức năng cầu nối thông động – tĩnh mạch ở bệnh nhân bệnh thận mạn giai đoạn cuối lọc máu chu kỳ tại khoa Thận – Thận nhân tạo, Bệnh viện Trưng Vương", speaker: "BS.CKII. Võ Ngọc Tình", role: "Phó Trưởng khoa, Phụ trách khoa Thận – Thận nhân tạo" },
        { time: "08:45 – 09:00", title: "Khảo sát tình trạng tăng huyết áp lúc lọc máu ở bệnh nhân bệnh thận mạn giai đoạn cuối lọc máu chu kỳ tại khoa Thận – Thận nhân tạo, Bệnh viện Trưng Vương", speaker: "BS.CKI. Trần Thị Anh Thư", role: "Khoa Thận – Thận nhân tạo" },
        { time: "09:00 – 09:15", title: "Quản lý bệnh phổi tắc nghẽn mạn tính toàn diện theo Hướng dẫn của Bộ Y tế năm 2026", speaker: "BS.CKII. Lê Như Thụy Khanh", role: "Phó Trưởng khoa, Phụ trách khoa Hô hấp" },
        { time: "09:15 – 09:30", title: "Giải lao" },
        { time: "09:30 – 09:45", title: "Vượt qua rào cản tăng kali máu: Tối ưu hóa điều trị cho bệnh nhân suy tim kèm bệnh thận mạn qua case lâm sàng", speaker: "ThS.BS. Nguyễn Trường Duy", role: "Bộ môn Nội – Đại học Y Dược TP.HCM; Trung tâm Tim mạch – BV Chợ Rẫy; Trưởng Phòng khám Tim mạch – BV Đại học Y Dược CS2" },
        { time: "09:45 – 10:00", title: "Khi nào nên khởi trị thuốc hạ huyết áp?", speaker: "BS.CKII. Nguyễn Thiên Hào", role: "Trưởng khoa Tim mạch" },
        { time: "10:00 – 10:15", title: "Lợi tiểu và những lo ngại về rối loạn điện giải trên bệnh nhân đồng mắc đái tháo đường và tăng huyết áp", speaker: "TS.BS. Bùi Thị Thanh Hiền", role: "Trưởng khoa Nội tiết – Tổng hợp" },
        { time: "10:15 – 10:30", title: "Bất tương hợp huyết động và chuyển dịch mô hình hồi sức sốc nhiễm trùng", speaker: "BS.CKII. Nguyễn Thiên Bình", role: "Trưởng khoa Hồi sức tích cực – Chống độc" },
        { time: "10:30 – 10:45", title: "Giá trị giảm tiểu cầu trong dự đoán tử vong nội viện ở bệnh nhân sốc nhiễm khuẩn", speaker: "BS.CKII. Nguyễn Hoàng Huy", role: "Khoa Hồi sức tích cực – Chống độc" },
        { time: "10:45 – 11:00", title: "Thực tế tình hình điều trị suy tim theo hướng dẫn của Bộ Y tế tại Bệnh viện Trưng Vương", speaker: "BS.CKII. Trần Thanh Tuấn", role: "Phó Trưởng khoa Tim mạch" },
        { time: "11:00 – 11:15", title: "Cập nhật tầm soát và quản lý bệnh nhân có tổn thương tiền ung thư dạ dày", speaker: "BS.CKII. Trần Phạm Phương Thư · TS.BS. Phạm Ngọc Huy Tuấn", role: "Trường ĐHYK Phạm Ngọc Thạch; Trưởng khoa Tiêu hóa – Tiết niệu" },
        { time: "11:15 – 11:30", title: "Phần thảo luận · Tổng kết – Bế mạc phiên Nội khoa" }
      ]
    },
    {
      label: "Phiên Ngoại khoa",
      time: "08:15 – 11:30 · Song song với Phiên Nội khoa",
      room: "Hội trường Bệnh viện",                     // Hội trường / phòng (VD: "Hội trường A, lầu 5")
      chairs: [
        { name: "TS.BS. Lê Nguyễn Quyền", title: "Phó Giám đốc, BV Trưng Vương" },
        { name: "GS.TS.BS. Nguyễn Công Minh", title: "Trường ĐH Y khoa Phạm Ngọc Thạch" },
        { name: "PGS.TS.BS. Phạm Trịnh Quốc Khanh", title: "Trường ĐH Y Dược Cần Thơ" },
        { name: "TS.BS. Lê Nguyên Khôi", title: "Trường ĐH Y khoa Phạm Ngọc Thạch" }
      ],
      sessions: [
        { time: "08:15 – 08:30", title: "Đánh giá sự tuân thủ quy trình vệ sinh tay ngoại khoa của phẫu thuật viên và một số yếu tố ảnh hưởng tại Bệnh viện Đa khoa Tâm Anh TP.HCM năm 2025", speaker: "BS.CKII. Huỳnh Thị Thanh Trang", role: "Phó Trưởng khoa Kiểm soát nhiễm khuẩn – BV Đa khoa Tâm Anh TP.HCM" },
        { time: "08:30 – 08:45", title: "Ca lâm sàng: Loét tỳ đè", speaker: "ThS.BS. Nguyễn Xuân Thiện", role: "Khoa Bỏng – Tạo hình thẩm mỹ" },
        { time: "08:45 – 09:00", title: "Biến chứng nặng sau tiêm chất làm đầy: Nhân các trường hợp lâm sàng", speaker: "BS.CKI. Võ Kế Đạt", role: "Khoa Bỏng – Tạo hình thẩm mỹ" },
        { time: "09:00 – 09:15", title: "Ứng dụng vạt đùi trước ngoài tự do trong phẫu thuật tái tạo di chứng sẹo bỏng vùng cổ bàn chân", speaker: "BS.CKI. Lê Văn Minh Tuệ", role: "Khoa Bỏng – Tạo hình thẩm mỹ" },
        { time: "09:15 – 09:30", title: "Giải lao" },
        { time: "09:30 – 09:45", title: "Tán sỏi thận qua da đường hầm nhỏ (mini PCNL) trên bệnh nhân có hệ thống đài bể thận đôi: Báo cáo một trường hợp", speaker: "BS. Nguyễn Hoàng Vĩ", role: "Khoa Ngoại thận – Tiết niệu" },
        { time: "09:45 – 10:00", title: "Quan điểm hiện nay về điều trị bảo tồn trong viêm ruột thừa không biến chứng", speaker: "ThS.BS. Nguyễn Tuấn Ngọc", role: "Khoa Ngoại Tổng hợp" },
        { time: "10:00 – 10:15", title: "Nhận xét về đáp ứng lâm sàng của u đại trực tràng sau hóa trị tân bổ trợ dưới góc nhìn ngoại khoa", speaker: "BS. Đỗ Khôi Nguyên", role: "Khoa Ngoại Tổng hợp" },
        { time: "10:15 – 10:30", title: "Điều trị phẫu thuật biến dạng cột sống thắt lưng có chèn ép rễ thần kinh ở bệnh nhân cao tuổi thoái hóa cột sống thắt lưng nhiều tầng tại Đơn vị Cột sống, Bệnh viện Trưng Vương", speaker: "BS.CKII. Hồ Nhựt Tâm · BS. Nguyễn Thành Đạt", role: "Đơn vị Cột sống – Khoa Chấn thương chỉnh hình" },
        { time: "10:30 – 10:45", title: "Nội soi cột sống qua lỗ liên hợp – kỹ thuật", speaker: "BS.CKI. Phan Thanh Trọng", role: "Đơn vị Cột sống – Khoa Chấn thương chỉnh hình" },
        { time: "10:45 – 11:00", title: "Nghiên cứu và ứng dụng điều trị tổn thương tủy sống theo Trung tâm Chấn thương Tủy sống Hokkaido tại Bệnh viện Trưng Vương", speaker: "BS. Huỳnh Minh Tâm", role: "Đơn vị Cột sống – Khoa Chấn thương chỉnh hình" },
        { time: "11:00 – 11:30", title: "Phần thảo luận · Tổng kết – Bế mạc phiên Ngoại khoa" }
      ]
    },
    {
      label: "Phiên chiều – Điều dưỡng",
      time: "13:15 – 16:30 · Hội nghị Khoa học Điều dưỡng",
      room: "Hội trường Bệnh viện",                     // Hội trường / phòng (VD: "Hội trường A, lầu 5")
      chairs: [
        { name: "BS.CKII. Nguyễn Trí Dũng", title: "Phó Giám đốc, BV Trưng Vương" },
        { name: "ĐD.CKI. Đào Thị Bích Trâm", title: "Trưởng phòng Điều dưỡng, BV Trưng Vương" },
        { name: "TS.ĐD. Lữ Mộng Thùy Linh", title: "Phó Trưởng phòng Nghiệp vụ Y, Sở Y tế TP.HCM" }
      ],
      sessions: [
        { time: "13:15 – 14:00", title: "Đón tiếp đại biểu, khách mời · Khai mạc Hội nghị" },
        { time: "14:00 – 14:15", title: "Văn hóa sức khỏe và hành vi tìm kiếm thông tin y học của người bệnh tại Bệnh viện Trưng Vương năm 2026", speaker: "ThS. Nguyễn Mạnh Tuân", role: "Trưởng phòng Quản lý chất lượng" },
        { time: "14:15 – 14:30", title: "Khảo sát kiến thức, nhu cầu giáo dục sức khỏe của người chăm sóc chính người bệnh đột quỵ tại Đơn vị Đột quỵ, khoa Thần kinh, Bệnh viện Trưng Vương năm 2025", speaker: "ThS.ĐD. Nguyễn Thị Kim Huệ", role: "Điều dưỡng trưởng khoa Thần kinh" },
        { time: "14:30 – 14:45", title: "Thực trạng chất lượng tài liệu truyền thông giáo dục sức khỏe theo PEMAT tại Bệnh viện Trưng Vương giai đoạn 2019 – 2024", speaker: "ĐD.CKI. Hứa Thị Trinh", role: "Phó Trưởng phòng Điều dưỡng" },
        { time: "14:45 – 15:00", title: "Giải lao" },
        { time: "15:00 – 15:15", title: "Khuynh hướng và các yếu tố ảnh hưởng đến cách giải quyết mâu thuẫn của điều dưỡng quản lý tại Bệnh viện Trưng Vương năm 2026", speaker: "ĐD.CKI. Đào Thị Bích Trâm", role: "Trưởng phòng Điều dưỡng" },
        { time: "15:15 – 15:30", title: "Vết thương mạn tính: Từ đánh giá toàn diện đến chăm sóc hiệu quả", speaker: "BS.CKII. Đinh Phương Đông", role: "Trưởng khoa Bỏng – Tạo hình thẩm mỹ" },
        { time: "15:30 – 15:45", title: "Nâng cao chất lượng chăm sóc toàn diện người bệnh đái tháo đường", speaker: "CN.ĐD. Võ Thị Cẩm Loan", role: "Phụ trách điều dưỡng, khoa Nội tiết – Tổng hợp" },
        { time: "15:45 – 16:00", title: "Cải tiến vận hành đơn vị tiệt khuẩn trung tâm: Từ những thay đổi nhỏ đến những giá trị lớn", speaker: "CN. Ngô Phương Trinh", role: "Khoa Kiểm soát nhiễm khuẩn" },
        { time: "16:00 – 16:20", title: "Phần thảo luận" },
        { time: "16:20 – 16:30", title: "Tổng kết – Bế mạc Hội nghị" }
      ]
    }
  ],

  /* ---------- Nhà tài trợ (để [] sẽ ẩn mục này) ---------- */
  sponsors: [],

  /* ---------- Liên hệ (mục để trống sẽ được ẩn) ---------- */
  contact: {
    unit: "Phòng Quản lý chất lượng, Bệnh viện Trưng Vương",
    person: "ThS. Nguyễn Mạnh Tuân",
    phone: "0969 019 051",
    email: "",
    fanpage: ""
  }
};
