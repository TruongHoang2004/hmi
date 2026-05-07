const nodes7 = require('nodes7');
const conn = new nodes7();

// --- 1. CẤU HÌNH BIẾN (Tags) ---
// Định nghĩa các vùng nhớ muốn đọc từ PLC
const variables = {
  MOTOR_STATUS: 'M0.0',          // Đọc một bit (Memory)
  TEMPERATURE: 'DB1,REAL0',      // Đọc số thực từ Data Block 1, byte offset 0
  COUNTER_VAL: 'DB1,INT4'        // Đọc số nguyên từ Data Block 1, byte offset 4
};

// --- 2. THIẾT LẬP KẾT NỐI ---
const plcConfig = {
  port: 102,               // Port mặc định của S7 Protocol (NetToPLCSim dùng port này)
  host: '127.0.0.1',       // IP của máy chạy NetToPLCSim (thay bằng IP LAN nếu chạy khác máy)
  rack: 0,                 // S7-300 thường là 0
  slot: 1,                 // S7-300 thường là 2 (S7-1200/1500 thường là 1)
};

console.log(`Đang kết nối tới NetToPLCSim tại ${plcConfig.host}:${plcConfig.port}...`);

conn.initiateConnection(plcConfig, (err) => {
  if (typeof (err) !== "undefined") {
    console.error("Lỗi kết nối tới PLC:", err);
    process.exit();
  }

  console.log("✅ Kết nối thành công!");

  // Gắn danh sách biến vào kết nối
  conn.setTranslationCB((tag) => variables[tag]);
  conn.addItems(['MOTOR_STATUS', 'TEMPERATURE', 'COUNTER_VAL']);

  // Bắt đầu vòng lặp đọc dữ liệu mỗi 1 giây
  setInterval(readData, 1000);
});

// --- 3. HÀM ĐỌC DỮ LIỆU ---
function readData() {
  conn.readAllItems((err, values) => {
    if (err) {
      console.error("Lỗi đọc dữ liệu:", err);
      return;
    }

    console.log("-----------------------");
    console.log(`Trạng thái Motor (M0.0): ${values.MOTOR_STATUS}`);
    console.log(`Nhiệt độ (DB1.DBD0): ${values.TEMPERATURE}`);
    console.log(`Giá trị đếm (DB1.DBW4): ${values.COUNTER_VAL}`);
  });
}
