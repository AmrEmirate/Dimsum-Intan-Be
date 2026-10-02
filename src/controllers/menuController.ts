import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getMenus = async (_req: Request, res: Response) => {
  try {
    const menus = await prisma.menuItem.findMany({
      where: { isDeleted: false },
      orderBy: { code: 'asc' },
    });

    const formatted = menus.map((m) => ({
      id: m.id,
      code: m.code,
      name: m.name,
      category: m.category,
      price: Number(m.price),
      costPrice: Number(m.costPrice),
      stock: m.stock,
      description: m.description || '',
      image: m.image || '',
      isAvailable: m.isAvailable,
      isBestSeller: m.stock > 30,
    }));

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('[Menu Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Gagal memuat katalog menu' });
  }
};

export const createMenu = async (req: Request, res: Response) => {
  try {
    const { name, category, price, costPrice, stock, description, image } = req.body;

    const prefix = category.substring(0, 3).toUpperCase();
    const count = await prisma.menuItem.count({ where: { category } });
    const code = `${prefix}-${String(count + 1).padStart(3, '0')}`;

    const newMenu = await prisma.menuItem.create({
      data: {
        code,
        name,
        category,
        price,
        costPrice,
        stock: parseInt(stock, 10) || 0,
        description: description || '',
        image: image || 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=500&auto=format&fit=crop&q=80',
        isAvailable: true,
      },
    });

    res.status(201).json({
      success: true,
      message: `Menu ${newMenu.name} (${newMenu.code}) berhasil didaftarkan`,
      data: {
        ...newMenu,
        price: Number(newMenu.price),
        costPrice: Number(newMenu.costPrice),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal menambahkan menu' });
  }
};

export const updateMenu = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, category, price, costPrice, stock, description, image, isAvailable } = req.body;

    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(price !== undefined && { price }),
        ...(costPrice !== undefined && { costPrice }),
        ...(stock !== undefined && { stock: parseInt(stock, 10) }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
    });

    res.json({
      success: true,
      message: `Menu ${updated.name} berhasil diperbarui`,
      data: {
        ...updated,
        price: Number(updated.price),
        costPrice: Number(updated.costPrice),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal memperbarui menu' });
  }
};

export const toggleAvailability = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const menu = await prisma.menuItem.findUnique({ where: { id } });
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: !menu.isAvailable },
    });

    res.json({
      success: true,
      message: `Status ketersediaan ${updated.name} diubah menjadi: ${updated.isAvailable ? 'Tersedia' : 'Habis'}`,
      data: {
        ...updated,
        price: Number(updated.price),
        costPrice: Number(updated.costPrice),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal mengubah status menu' });
  }
};

export const deleteMenu = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.menuItem.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.json({ success: true, message: 'Menu berhasil dihapus (soft delete)' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal menghapus menu' });
  }
};
