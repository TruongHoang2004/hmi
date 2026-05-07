// ====================================
// Data_block_1 (DB1) - Bảng biến PLC
// ====================================
// Đây là bản sao y hệt cấu trúc Data Block 1 trong TIA Portal
// Dùng cho cả việc đọc/ghi PLC thật (qua nodes7) và mô phỏng nội bộ

export interface PlcDataBlock {
  // --- Bool ---
  ON: boolean;               // DB1.DBX0.0   - Nút nhấn ON
  OFF: boolean;              // DB1.DBX0.1   - Nút nhấn OFF

  // --- Real (Sensor) ---
  HT_ND: number;             // DB1.DBD2     - Nhiệt độ hiện tại (Real)
  HT_DA: number;             // DB1.DBD6     - Độ ẩm hiện tại (Real)

  // --- Bool (Control) ---
  KhoiDong: boolean;         // DB1.DBX10.0  - khởi động
  Auto_Test: boolean;        // DB1.DBX10.1  - Auto - Tese (false=Auto, true=Test)
  TG_Dao: boolean;           // DB1.DBX10.2  - TG đảo (tín hiệu đảo trứng)
  DC_DaoTruoc: boolean;      // DB1.DBX10.3  - DC dao truoc (động cơ đảo trước)
  DC_DaoSau: boolean;        // DB1.DBX10.4  - DC dao sau (động cơ đảo sau)
  TG_XoayChieu: boolean;     // DB1.DBX10.5  - TG xoay chieu (trạng thái xoay chiều)
  ResetTimerDao: boolean;    // DB1.DBX10.6  - reset timer dao
  Test: boolean;             // DB1.DBX10.7  - test (cờ chế độ test)

  // --- DInt ---
  TimeAp: number;            // DB1.DBD12    - time ấp (ms -> đã chia, đơn vị phút hoặc giờ)
  SetTimeDao: number;        // DB1.DBD16    - set time đảo (ms)

  // --- Int ---
  SetNgayAp: number;         // DB1.DBW20    - set ngày ấp
  GioSet: number;            // DB1.DBW22    - giờ set
  SoLanDaoTrung: number;     // DB1.DBW24    - số lần đảo trứng
  Gio: number;               // DB1.DBW26    - giờ

  // --- Bool ---
  NgatTuDong: boolean;       // DB1.DBX28.0  - ngắt tự động

  // --- Real (Setpoint) ---
  Set_ND: number;            // DB1.DBD30    - set ND (nhiệt độ cài đặt)
  Set_DA: number;            // DB1.DBD34    - set DA (độ ẩm cài đặt)

  // --- Bool (Actuators) ---
  GiaNhiet: boolean;         // DB1.DBX38.0  - Gia nhiệt
  QuatTanNhiet: boolean;     // DB1.DBX38.1  - Quạt tản nhiệt
  TaoAm: boolean;            // DB1.DBX38.2  - tạo ẩm
  QuatThongGio: boolean;     // DB1.DBX38.3  - quạt thông gió

  // --- Time (được lưu dạng DInt ms) ---
  ThoiGian: number;          // DB1.DBD40    - thời gian (timer chính, ET ms)
  ThoiGian1: number;         // DB1.DBD44    - thoi gian 1 (timer phụ, ET ms)
  ThoiGian2: number;         // DB1.DBD48    - thi gian 2

  // --- Int (đã quy đổi) ---
  Giay: number;              // DB1.DBW52    - giây
  Phut: number;              // DB1.DBW54    - phút
  Ngay: number;              // DB1.DBW56    - ngày

  // --- Bool (Cảm biến) ---
  CB_Truoc: boolean;         // DB1.DBX58.0  - CB trước (cảm biến hành trình trước)
  CB_Sau: boolean;           // DB1.DBX58.1  - CB sau (cảm biến hành trình sau)
}

// Giá trị mặc định (khởi tạo)
export const defaultPlcData: PlcDataBlock = {
  ON: false,
  OFF: false,
  HT_ND: 0.0,
  HT_DA: 0.0,
  KhoiDong: false,
  Auto_Test: false,       // false = Auto mode
  TG_Dao: false,
  DC_DaoTruoc: false,
  DC_DaoSau: false,
  TG_XoayChieu: false,
  ResetTimerDao: false,
  Test: false,
  TimeAp: 0,
  SetTimeDao: 0,
  SetNgayAp: 0,
  GioSet: 0,
  SoLanDaoTrung: 0,
  Gio: 0,
  NgatTuDong: false,
  Set_ND: 0.0,
  Set_DA: 0.0,
  GiaNhiet: false,
  QuatTanNhiet: false,
  TaoAm: false,
  QuatThongGio: false,
  ThoiGian: 0,
  ThoiGian1: 0,
  ThoiGian2: 0,
  Giay: 0,
  Phut: 0,
  Ngay: 0,
  CB_Truoc: false,
  CB_Sau: false,
};

// ====================================
// Mapping tag name -> nodes7 address
// Dùng cho kết nối PLC thật qua NetToPLCSim
// ====================================
export const plcAddressMap: Record<keyof PlcDataBlock, string> = {
  ON: 'DB1,X0.0',
  OFF: 'DB1,X0.1',
  HT_ND: 'DB1,REAL2',
  HT_DA: 'DB1,REAL6',
  KhoiDong: 'DB1,X10.0',
  Auto_Test: 'DB1,X10.1',
  TG_Dao: 'DB1,X10.2',
  DC_DaoTruoc: 'DB1,X10.3',
  DC_DaoSau: 'DB1,X10.4',
  TG_XoayChieu: 'DB1,X10.5',
  ResetTimerDao: 'DB1,X10.6',
  Test: 'DB1,X10.7',
  TimeAp: 'DB1,DINT12',
  SetTimeDao: 'DB1,DINT16',
  SetNgayAp: 'DB1,INT20',
  GioSet: 'DB1,INT22',
  SoLanDaoTrung: 'DB1,INT24',
  Gio: 'DB1,INT26',
  NgatTuDong: 'DB1,X28.0',
  Set_ND: 'DB1,REAL30',
  Set_DA: 'DB1,REAL34',
  GiaNhiet: 'DB1,X38.0',
  QuatTanNhiet: 'DB1,X38.1',
  TaoAm: 'DB1,X38.2',
  QuatThongGio: 'DB1,X38.3',
  ThoiGian: 'DB1,DINT40',
  ThoiGian1: 'DB1,DINT44',
  ThoiGian2: 'DB1,DINT48',
  Giay: 'DB1,INT52',
  Phut: 'DB1,INT54',
  Ngay: 'DB1,INT56',
  CB_Truoc: 'DB1,X58.0',
  CB_Sau: 'DB1,X58.1',
};
