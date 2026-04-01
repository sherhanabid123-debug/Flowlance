import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import { getServerSession } from '@/lib/permissions';

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (session.role !== 'owner') {
      return NextResponse.json({ error: 'Access denied. Only workspace owners can manage team roles.' }, { status: 403 });
    }

    const { role } = await req.json();
    if (!role || !['owner', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role provided.' }, { status: 400 });
    }

    await dbConnect();
    const db = mongoose.connection.db;
    if (!db) throw new Error('DB connection not found');

    // Use $set on the matched array element instead of save() to bypass legacy data validation
    const result = await db.collection('workspaces').updateOne(
      { 
        _id: new mongoose.Types.ObjectId(session.workspaceId),
        'members.userId': new mongoose.Types.ObjectId(params.id)
      },
      { $set: { 'members.$.role': role } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Member not found in this workspace.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Role updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Update Role Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
