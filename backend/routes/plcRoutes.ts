import { Router, Request, Response } from 'express';
import plcService from '../services/plcService';
import { plcAddressMap, PlcDataBlock } from '../config/plcVariables';

const router = Router();

// GET /api/plc/status - Lấy trạng thái kết nối và toàn bộ data PLC
router.get('/status', (req: Request, res: Response) => {
  res.json(plcService.getStatus());
});

// GET /api/plc/tags - Lấy danh sách tất cả các tag hỗ trợ
router.get('/tags', (req: Request, res: Response) => {
  const tags = Object.keys(plcAddressMap).map(key => ({
    name: key,
    address: plcAddressMap[key as keyof PlcDataBlock],
  }));
  res.json({ tags });
});

// GET /api/plc/tag/:name - Đọc giá trị 1 tag cụ thể
router.get('/tag/:name', (req: Request, res: Response): void => {
  const name = req.params.name as string;
  const data = plcService.getData();
  
  if (!(name in data)) {
    res.status(404).json({ error: `Tag "${name}" không tồn tại` });
    return;
  }

  res.json({ tag: name, value: data[name as keyof PlcDataBlock] });
});

// POST /api/plc/write - Ghi giá trị xuống 1 tag
router.post('/write', async (req: Request, res: Response): Promise<void> => {
  const { tag, value } = req.body;
  
  try {
    await plcService.writeTag(tag, value);
    res.json({ success: true, tag, value });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/plc/write-multiple - Ghi giá trị xuống nhiều tag cùng lúc
router.post('/write-multiple', async (req: Request, res: Response): Promise<void> => {
  const { items } = req.body; // items: [{ tag: string, value: any }]

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "Cần truyền mảng items: [{ tag, value }]" });
    return;
  }

  const tags = items.map((i: any) => i.tag);
  const values = items.map((i: any) => i.value);

  try {
    await plcService.writeMultipleTags(tags, values);
    res.json({ success: true, items });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
