import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Client } from '@/models/Client';
import { getWorkspaceId } from '@/lib/auth';
import { addDays } from 'date-fns';

export async function GET(req: Request) {
  try {
    const workspaceId = await getWorkspaceId(req);
    if (!workspaceId) return NextResponse.json({ error: 'Unauthorized: No assigned workspace' }, { status: 401 });

    await dbConnect();
    const clients = await Client.find({ workspaceId }).sort({ createdAt: -1 });
    return NextResponse.json({ clients }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const workspaceId = await getWorkspaceId(req);
    if (!workspaceId) return NextResponse.json({ error: 'Unauthorized: No assigned workspace' }, { status: 401 });

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
      workspaceId,
      lastFollowUp: isCompleted ? undefined : lastDate,
      nextFollowUp: isCompleted ? undefined : nextFollowUp,
      followUpInterval: interval
    });
    return NextResponse.json({ client: newClient }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
