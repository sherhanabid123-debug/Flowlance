import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Client } from '@/models/Client';
import { stripe } from '@/lib/stripe';
import { getServerSession } from '@/lib/permissions';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { clientId } = await req.json();
    if (!clientId) return NextResponse.json({ error: 'Client ID required' }, { status: 400 });

    await dbConnect();
    const client = await Client.findById(clientId);
    if (!client || client.workspaceId.toString() !== session.workspaceId) {
      return NextResponse.json({ error: 'Client not found or access denied' }, { status: 404 });
    }

    if (!client.stripeSessionId) {
      return NextResponse.json({ error: 'No checkout session found' }, { status: 400 });
    }

    // Fetch latest session status from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(client.stripeSessionId);

    if (checkoutSession.payment_status === 'paid') {
      client.paymentStatus = 'paid';
      // Optionally transition status if first payment
      if (client.status === 'potential') client.status = 'confirmed';
      await client.save();
      return NextResponse.json({ success: true, message: 'Payment confirmed' });
    }

    return NextResponse.json({ success: false, message: 'Payment not completed' });
  } catch (error: any) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
