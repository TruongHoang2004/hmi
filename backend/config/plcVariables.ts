// ====================================
// Data_block_1 (DB1) - Bảng biến PLC
// ====================================
// Đây là bản sao y hệt cấu trúc Data Block 1 trong TIA Portal sau khi cập nhật
// Dùng cho cả việc đọc/ghi PLC thật (qua nodes7) và mô phỏng nội bộ

export interface PlcDataBlock {
  // --- Bool ---
  ON: boolean;               // DB1.DBX0.0   - Nút nhấn ON
  OFF: boolean;              // DB1.DBX0.1   - Nút nhấn OFF

  // --- DInt (Sensor) ---
  HT_ND: number;             // DB1.DBD2     - HT-ND (Nhiệt độ hiện tại, DInt)
  HT_DA: number;             // DB1.DBD6     - HT-DA (Độ ẩm hiện tại, DInt)

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
  SoLanDaoTrung: number;     // DB1.DBW22    - số lần đảo trứng (Dịch chuyển từ DBW24 sang DBW22 do xóa GioSet)
  Gio: number;               // DB1.DBW24    - giờ (Dịch chuyển từ DBW26 sang DBW24 do xóa GioSet)

  // --- Bool ---
  NgatTuDong: boolean;       // DB1.DBX26.0  - ngắt tự động (Dịch chuyển từ DBX28.0 sang DBX26.0)

  // --- DInt (Setpoint) ---
  Set_ND: number;            // DB1.DBD28    - set ND (nhiệt độ cài đặt, DInt - Dịch chuyển từ REAL30)
  Set_DA: number;            // DB1.DBD32    - set DA (độ ẩm cài đặt, DInt - Dịch chuyển từ REAL34)

  // --- Bool (Actuators) ---
  GiaNhiet: boolean;         // DB1.DBX36.0  - Gia nhiệt (Dịch chuyển từ DBX38.0)
  QuatTanNhiet: boolean;     // DB1.DBX36.1  - Quạt tản nhiệt (Dịch chuyển từ DBX38.1)
  TaoAm: boolean;            // DB1.DBX36.2  - tạo ẩm (Dịch chuyển từ DBX38.2)
  QuatThongGio: boolean;     // DB1.DBX36.3  - quạt thông gió (Dịch chuyển từ DBX38.3)

  // --- Time (được lưu dạng DInt ms) ---
  ThoiGian: number;          // DB1.DBD38    - thời gian (timer chính, ET ms - Dịch chuyển từ DBD40)
  ThoiGian1: number;         // DB1.DBD42    - thoi gian 1 (timer phụ, ET ms - Dịch chuyển từ DBD44)
  ThoiGian2: number;         // DB1.DBD46    - thi gian 2 (Dịch chuyển từ DBD48)

  // --- Int (đã quy đổi) ---
  Giay: number;              // DB1.DBW50    - giây (Dịch chuyển từ DBW52)
  Phut: number;              // DB1.DBW52    - phút (Dịch chuyển từ DBW54)
  Ngay: number;              // DB1.DBW54    - ngày (Dịch chuyển từ DBW56)

  // --- Bool (Cảm biến & Cảnh báo mới bổ sung) ---
  CB_Truoc: boolean;         // DB1.DBX56.0  - CB trước (cảm biến hành trình trước - Dịch chuyển từ DBX58.0)
  CB_Sau: boolean;           // DB1.DBX56.1  - CB sau (cảm biến hành trình sau - Dịch chuyển từ DBX58.1)
  Reset: boolean;            // DB1.DBX56.2  - reset (MỚI)
  CanhBaoND: boolean;        // DB1.DBX56.3  - cảnh báo ND (MỚI)
  CanhBaoDA: boolean;        // DB1.DBX56.4  - cảnh báo ĐA (MỚI)
  CanhBaoTanNhiet: boolean;  // DB1.DBX56.5  - cảnh báo tản nhiệt (MỚI)
  CanhBaoThongGio: boolean;  // DB1.DBX56.6  - cảnh báo thông gió (MỚI)
  Loi: boolean;              // DB1.DBX56.7  - lỗi (MỚI)
  DenBaoLoi: boolean;        // DB1.DBX57.0  - đèn báo lỗi (MỚI)
  CoiBaoLoi: boolean;        // DB1.DBX57.1  - còi báo lỗi (MỚI)
  Dung: boolean;             // DB1.DBX57.2  - dừng (MỚI)
  DkNhiet: boolean;          // DB1.DBX57.3  - đk nhiệt (MỚI)
  DkAm: boolean;             // DB1.DBX57.4  - đk ẩm (MỚI)
  DkGio: boolean;            // DB1.DBX57.5  - đk gió (MỚI)
  DkTanNhiet: boolean;       // DB1.DBX57.6  - đk tản nhiệt (MỚI)
}

// Giá trị mặc định (khởi tạo)
export const defaultPlcData: PlcDataBlock = {
  ON: false,
  OFF: false,
  HT_ND: 0,
  HT_DA: 0,
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
  SoLanDaoTrung: 0,
  Gio: 0,
  NgatTuDong: false,
  Set_ND: 0,
  Set_DA: 0,
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
  Reset: false,
  CanhBaoND: false,
  CanhBaoDA: false,
  CanhBaoTanNhiet: false,
  CanhBaoThongGio: false,
  Loi: false,
  DenBaoLoi: false,
  CoiBaoLoi: false,
  Dung: false,
  DkNhiet: false,
  DkAm: false,
  DkGio: false,
  DkTanNhiet: false,
};

// ====================================
// Mapping tag name -> nodes7 address
// Dùng cho kết nối PLC thật qua NetToPLCSim
// ====================================
export const plcAddressMap: Record<keyof PlcDataBlock, string> = {
  ON: 'DB1,X0.0',
  OFF: 'DB1,X0.1',
  HT_ND: 'DB1,DINT2',
  HT_DA: 'DB1,DINT6',
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
  SoLanDaoTrung: 'DB1,INT22',
  Gio: 'DB1,INT24',
  NgatTuDong: 'DB1,X26.0',
  Set_ND: 'DB1,DINT28',
  Set_DA: 'DB1,DINT32',
  GiaNhiet: 'DB1,X36.0',
  QuatTanNhiet: 'DB1,X36.1',
  TaoAm: 'DB1,X36.2',
  QuatThongGio: 'DB1,X36.3',
  ThoiGian: 'DB1,DINT38',
  ThoiGian1: 'DB1,DINT42',
  ThoiGian2: 'DB1,DINT46',
  Giay: 'DB1,INT50',
  Phut: 'DB1,INT52',
  Ngay: 'DB1,INT54',
  CB_Truoc: 'DB1,X56.0',
  CB_Sau: 'DB1,X56.1',
  Reset: 'DB1,X56.2',
  CanhBaoND: 'DB1,X56.3',
  CanhBaoDA: 'DB1,X56.4',
  CanhBaoTanNhiet: 'DB1,X56.5',
  CanhBaoThongGio: 'DB1,X56.6',
  Loi: 'DB1,X56.7',
  DenBaoLoi: 'DB1,X57.0',
  CoiBaoLoi: 'DB1,X57.1',
  Dung: 'DB1,X57.2',
  DkNhiet: 'DB1,X57.3',
  DkAm: 'DB1,X57.4',
  DkGio: 'DB1,X57.5',
  DkTanNhiet: 'DB1,X57.6',
};
