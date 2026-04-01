import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Workspace } from '@/models/Workspace';
import { User } from '@/models/User';
import { getServerSession } from '@/lib/permissions';

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // RBAC: Only owners can change roles
    if (session.role !== 'owner') {
      return NextResponse.json({ error: 'Access denied. Only workspace owners can manage team roles.' }, { status: 403 });
    }

    const { role } = await req.json();
    if (!role || !['owner', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role provided.' }, { status: 400 });
    }

    await dbConnect();
    
    // Target the specific workspace ID and ensure user is owner
    const workspace = await Workspace.findOne({ 
      _id: session.workspaceId, 
      ownerId: session.userId 
    });

    if (!workspace) return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });

    const member = workspace.members.find(m => m.userId.toString() === params.id);
    if (!member) return NextResponse.json({ error: 'Member not found in this workspace.' }, { status: 404 });

    member.role = role;
    await workspace.save();

    return NextResponse.json({ message: 'Role updated successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
