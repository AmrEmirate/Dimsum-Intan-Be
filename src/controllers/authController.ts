import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { AuthRequest } from '../middlewares/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'dimsum_intan_super_secure_jwt_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;

    let user;
    if (role && !username) {
      // Shortcut login by role for dev / quick role-switching in UI
      user = await prisma.user.findFirst({
        where: { role },
        include: { outlet: true },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { username },
        include: { outlet: true },
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Pengguna tidak ditemukan atau kredensial salah',
      });
    }

    // Check password if provided and not role-only shortcut
    if (password) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Password yang Anda masukkan salah',
        });
      }
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        outletId: user.outletId,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.json({
      success: true,
      message: `Selamat datang, ${user.name}`,
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        outletId: user.outletId,
        outletName: user.outlet ? user.outlet.name : (user.role === 'OWNER' ? 'Seluruh Outlet (Pusat)' : 'Supervisor Area'),
      },
    });
  } catch (error: any) {
    console.error('[Auth Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Terjadi kesalahan server' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Tidak terotentikasi' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { outlet: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        outletId: user.outletId,
        outletName: user.outlet ? user.outlet.name : (user.role === 'OWNER' ? 'Seluruh Outlet (Pusat)' : 'Supervisor Area'),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePin = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Tidak terotentikasi' });
    }

    const { newPin } = req.body;
    if (!newPin || String(newPin).length < 4) {
      return res.status(400).json({ success: false, message: 'PIN minimal 4 digit angka!' });
    }

    const pinHash = await bcrypt.hash(String(newPin), 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { pinHash },
    });

    res.json({ success: true, message: 'PIN otorisasi berhasil diperbarui' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal mengubah PIN' });
  }
};

