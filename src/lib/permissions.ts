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
  if (!user || !user.currentWorkspace) return null;

  const workspace = await Workspace.findById(user.currentWorkspace);
  if (!workspace) return null;

  // Find the user's role in this workspace
  const member = workspace.members.find(m => m.userId.toString() === decoded.userId);
  if (!member) return null;

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
      return action === 'edit'; // Members can only edit (follow-ups/notes handled separately in route)
    }
  }

  return false;
}
