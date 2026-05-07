import { Router, Request, Response } from 'express';
import plcService from '../services/plcService';

const router = Router();

// GET: Lấy trạng thái hiện tại của PLC
router.get('/status', (req: Request, res: Response) => {
  res.json(plcService.getStatus());
});

// POST: Ghi giá trị xuống 1 tag của PLC
router.post('/write', async (req: Request, res: Response): Promise<void> => {
  const { tag, value } = req.body;
  
  try {
    await plcService.writeTag(tag, value);
    res.json({ success: true, tag, value });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
