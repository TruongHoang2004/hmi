export const variables: Record<string, string> = {
  ON: 'DB1,X0.0',
  OFF: 'DB1,X0.1',
  HT_ND: 'DB1,REAL2',         // Nhiệt độ hiện tại
  HT_DA: 'DB1,REAL6',         // Độ ẩm hiện tại
  KhoiDong: 'DB1,X10.0',      // khởi động
  Auto_Test: 'DB1,X10.1',     // Auto - Tese
  TG_Dao: 'DB1,X10.2',        // TG đảo
  DC_DaoTruoc: 'DB1,X10.3',   // DC dao truoc
  DC_DaoSau: 'DB1,X10.4',     // DC dao sau
  TG_XoayChieu: 'DB1,X10.5',  // TG xoay chieu
  ResetTimerDao: 'DB1,X10.6', // reset timer dao
  Test: 'DB1,X10.7',          // test
  TimeAp: 'DB1,DINT12',       // time ấp
  SetTimeDao: 'DB1,DINT16',   // set time đảo
  SetNgayAp: 'DB1,INT20',     // set ngày ấp
  GioSet: 'DB1,INT22',        // giờ set
  SoLanDaoTrung: 'DB1,INT24', // số lần đảo trứng
  Gio: 'DB1,INT26',           // giờ
  NgatTuDong: 'DB1,X28.0',    // ngắt tự động
  Set_ND: 'DB1,REAL30',       // set ND
  Set_DA: 'DB1,REAL34',       // set DA
  GiaNhiet: 'DB1,X38.0',      // Gia nhiệt
  QuatTanNhiet: 'DB1,X38.1',  // Quạt tản nhiệt
  TaoAm: 'DB1,X38.2',         // tạo ẩm
  QuatThongGio: 'DB1,X38.3',  // quạt thông gió
  ThoiGian: 'DB1,DINT40',     // thời gian
  ThoiGian1: 'DB1,DINT44',    // thoi gian 1
  ThoiGian2: 'DB1,DINT48',    // thi gian 2
  Giay: 'DB1,INT52',          // giây
  Phut: 'DB1,INT54',          // phút
  Ngay: 'DB1,INT56',          // ngày
  CB_Truoc: 'DB1,X58.0',      // CB trước
  CB_Sau: 'DB1,X58.1'         // CB sau
};
