import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Client } from '@/models/Client';
import { getServerSession } from '@/lib/permissions';
import { addDays } from 'date-fns';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const clients = await Client.find({ workspaceId: session.workspaceId }).sort({ createdAt: -1 });
    return NextResponse.json({ clients }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // RBAC: Both owners and members can create clients
    // (We previously restricted it to owner, but have loosened it based on user feedback)
    
    await dbConnect();
    const data = await req.json();
    
    // Initialize follow-up dates
    const interval = data.followUpInterval || 3;
    const lastDate = data.lastFollowUp ? new Date(data.lastFollowUp) : new Date();
    const nextFollowUp = addDays(lastDate, interval);
    
    // Only set follow-up dates if not completed
    const isCompleted = data.status === 'completed';
    
    const newClient = await Client.create({ 
      ...data, 
      workspaceId: session.workspaceId,
      createdBy: session.userId,
      lastFollowUp: isCompleted ? undefined : lastDate,
      nextFollowUp: isCompleted ? undefined : nextFollowUp,
      followUpInterval: interval,
      shares: data.shares || []
    });
    return NextResponse.json({ client: newClient }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
