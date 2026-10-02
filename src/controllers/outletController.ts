import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getOutlets = async (_req: Request, res: Response) => {
  try {
    const outlets = await prisma.outlet.findMany({
      orderBy: { code: 'asc' },
    });

    const formatted = outlets.map((o) => ({
      id: o.id,
      code: o.code,
      name: o.name,
      city: o.city,
      address: o.address,
      phone: o.phone,
      targetDailySales: Number(o.targetDailySales),
    }));

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('[Outlet Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Gagal mengambil data outlet' });
  }
};
