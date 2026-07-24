import jwt from 'jsonwebtoken';
import dbConnect from './db';
import { User } from '@/models/User';


if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}
const JWT_SECRET = process.env.JWT_SECRET;

export const signToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
};

export const getWorkspaceId = async (req: Request) => {
  const token = req.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (!token) return null;
  
  const decoded = verifyToken(token);
  if (!decoded?.userId) return null;

  await dbConnect();
  const user = await User.findById(decoded.userId).select('currentWorkspace');
  return user?.currentWorkspace || null;
};
