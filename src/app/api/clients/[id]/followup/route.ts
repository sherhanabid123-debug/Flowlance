import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Client } from '@/models/Client';
import { verifyToken } from '@/lib/auth';
import { addDays } from 'date-fns';

const getUserId = (req: Request) => {
  const token = req.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded?.userId || null;
};

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    
    const client = await Client.findOne({ _id: params.id, userId });
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
