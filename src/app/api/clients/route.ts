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

export async function GET(req: Request) {
  try {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const clients = await Client.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json({ clients }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
      userId,
      lastFollowUp: isCompleted ? undefined : lastDate,
      nextFollowUp: isCompleted ? undefined : nextFollowUp,
      followUpInterval: interval
    });
    return NextResponse.json({ client: newClient }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
