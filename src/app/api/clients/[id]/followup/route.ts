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
    
    const { outcome, notes, customNextDate } = await req.json();
    
    // Calculate new dates
    const now = new Date();
    let nextDate = addDays(now, client.followUpInterval || 3);
    
    // Outcome Logic
    if (outcome === 'Call not answered') {
      nextDate = addDays(now, 1);
    } else if (outcome === 'Interested') {
      nextDate = addDays(now, 2);
    } else if (outcome === 'Not interested') {
      client.isActive = false;
      nextDate = undefined as any;
    } else if (outcome === 'Call later' && customNextDate) {
      nextDate = new Date(customNextDate);
    } else if (outcome === 'Converted') {
      if (client.status === 'potential') client.status = 'confirmed';
      else if (client.status === 'confirmed') client.status = 'completed';
      nextDate = undefined as any;
    }
    
    client.lastFollowUp = now;
    client.nextFollowUp = nextDate;
    client.lastFollowUpOutcome = outcome;
    
    // Update history
    if (!client.followUpHistory) client.followUpHistory = [];
    client.followUpHistory.push({
      outcome,
      date: now,
      notes,
    });
    
    await client.save();
    
    return NextResponse.json({ client }, { status: 200 });
  } catch (error: any) {
    console.error('Follow-up Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
