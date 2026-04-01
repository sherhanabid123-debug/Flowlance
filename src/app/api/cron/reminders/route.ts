import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { Client } from '@/models/Client';
import { sendDailyReminderEmail } from '@/lib/mail';
import { startOfDay, endOfDay } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // 1. Security Check (Only allow in local or if Vercel Cron header is present)
  const authHeader = req.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    // 2. Find all users who want email reminders
    const users = await User.find({ emailReminders: { $ne: false } }).populate('currentWorkspace');
    let emailsSent = 0;

    const today = new Date();
    const rangeStart = startOfDay(today);
    const rangeEnd = endOfDay(today);

    for (const user of users) {
      if (!user.currentWorkspace || !user.email) continue;

      // 3. Find clients due today or overdue for this user's workspace
      const dueClients = await Client.find({
        workspaceId: user.currentWorkspace,
        status: { $ne: 'completed' },
        nextFollowUp: { $lte: rangeEnd }
      });

      if (dueClients.length > 0) {
        // 4. Send the summary email
        const success = await sendDailyReminderEmail(user.email, dueClients);
        if (success) emailsSent++;
      }
    }

    return NextResponse.json({ 
      message: 'Cron job completed', 
      usersProcessed: users.length,
      emailsSent 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Reminder Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
