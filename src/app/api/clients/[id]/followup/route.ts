import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Client } from '@/models/Client';
import { getWorkspaceId } from '@/lib/auth';
import { addDays } from 'date-fns';

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const workspaceId = await getWorkspaceId(req);
    if (!workspaceId) return NextResponse.json({ error: 'Unauthorized: No assigned workspace' }, { status: 401 });

    await dbConnect();
    
    const client = await Client.findOne({ _id: params.id, workspaceId });
    if (!client) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    
    // Calculate new dates
    const now = new Date();
    const interval = client.followUpInterval || 3;
    const nextDate = addDays(now, interval);
    
    client.lastFollowUp = now;
    client.nextFollowUp = nextDate;
    
    await client.save();
    
    return NextResponse.json({ client }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
