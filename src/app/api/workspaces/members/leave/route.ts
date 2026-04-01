import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Workspace } from '@/models/Workspace';
import { User } from '@/models/User';
import { getServerSession } from '@/lib/permissions';

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    
    const workspace = await Workspace.findById(session.workspaceId);
    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

    // Important: Owners cannot leave their only workspace. 
    // They must promote someone first or delete it.
    if (session.role === 'owner') {
      return NextResponse.json({ 
        error: 'As the Workspace Owner, you cannot leave. Please promote another member to Owner or delete the workspace.' 
      }, { status: 403 });
    }

    // 1. Remove from workspace array
    workspace.members = workspace.members.filter(m => m.userId.toString() !== session.userId);
    await workspace.save();

    // 2. Clear user currentWorkspace
    await User.findByIdAndUpdate(session.userId, { 
      $unset: { currentWorkspace: "" } 
    });

    console.log(`--- User ${session.userId} left workspace ${session.workspaceId} ---`);

    return NextResponse.json({ message: 'Left workspace successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Leave Workspace Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
