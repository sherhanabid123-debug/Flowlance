import { verifyToken } from './auth';
import dbConnect from './db';
import { User } from '@/models/User';
import { Workspace, WorkspaceRole } from '@/models/Workspace';

export interface UserSession {
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
}

export async function getServerSession(req: Request): Promise<UserSession | null> {
  const token = req.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (!token) return null;
  
  const decoded = verifyToken(token);
  if (!decoded?.userId) return null;

  await dbConnect();
  
  const user = await User.findById(decoded.userId).select('currentWorkspace');
  if (!user) return null;

  // If user has no workspace, return a basic session without workspace details
  if (!user.currentWorkspace) {
    return {
      userId: decoded.userId,
      workspaceId: '',
      role: 'member' // Dummy role
    };
  }
 
  const workspace = await Workspace.findById(user.currentWorkspace);
  // If workspace disappeared or user was removed from it, return basic session
  if (!workspace) {
     return {
      userId: decoded.userId,
      workspaceId: '',
      role: 'member'
    };
  }
 
  const member = workspace.members.find(m => m.userId.toString() === decoded.userId);
  if (!member) {
     return {
      userId: decoded.userId,
      workspaceId: '',
      role: 'member'
    };
  }
 
  return {
    userId: decoded.userId,
    workspaceId: user.currentWorkspace.toString(),
    role: member.role
  };
}

export function canPerformAction(role: WorkspaceRole, scope: 'client' | 'team', action: 'create' | 'edit' | 'delete' | 'manage'): boolean {
  if (role === 'owner') return true;

  if (role === 'member') {
    if (scope === 'client') {
      return action === 'create' || action === 'edit';
    }
  }

  return false;
}
