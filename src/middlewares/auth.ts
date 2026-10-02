import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: 'OWNER' | 'SUPERVISOR' | 'KASIR';
    outletId?: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'dimsum_intan_super_secure_jwt_secret_key_2026';

export const authenticateJwt = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token otentikasi tidak ditemukan' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Token otentikasi tidak valid atau telah kedaluwarsa' });
  }
};
