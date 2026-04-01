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
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    // Multi-tenant check: ensure this client belongs to current user's workspace
    if (client.workspaceId.toString() !== session.workspaceId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Determine amount based on status
    let amount = 0;
    if (client.status === 'potential') amount = client.expectedBudget || 0;
    else if (client.status === 'confirmed') {
        // If confirmed, maybe pay the remaining balance? Let's check advance vs total
        amount = (client.totalAmount || 0) - (client.advanceAmount || 0);
    } else {
        amount = client.finalAmount || client.totalAmount || 0;
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Invoice amount must be greater than 0' }, { status: 400 });
    }

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Invoice for ${client.projectName}`,
              description: `Project: ${client.projectName} | Client: ${client.name}`,
            },
            unit_amount: amount * 100, // Stripe expects amount in cents/paisa
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/clients?payment=success&id=${client._id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/clients?payment=cancelled`,
      metadata: {
        clientId: client._id.toString(),
        workspaceId: session.workspaceId,
      },
    });

    // Save session ID for verification
    client.stripeSessionId = checkoutSession.id;
    client.paymentStatus = 'pending';
    await client.save();

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
