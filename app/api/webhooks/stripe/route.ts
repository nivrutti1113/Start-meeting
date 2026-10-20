import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature");
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: any;

    // Parse event safely
    try {
      event = JSON.parse(rawBody);
    } catch (err: any) {
      return NextResponse.json({ error: "Invalid payload JSON" }, { status: 400 });
    }

    const eventType = event.type;
    console.log(`[STRIPE WEBHOOK] Received event: ${eventType}`);

    // Handle checkout.session.completed
    if (eventType === "checkout.session.completed") {
      const session = event.data?.object;
      const companyId = session?.metadata?.companyId;
      const customerId = session?.customer;
      const subscriptionId = session?.subscription;

      if (companyId) {
        // Upgrade company plan
        await prisma.company.update({
          where: { id: companyId },
          data: {
            subscriptionPlan: "PRO",
          },
        });

        // Upsert subscription record
        await prisma.subscription.create({
          data: {
            companyId,
            stripeCustomerId: customerId || null,
            stripeSubscriptionId: subscriptionId || null,
            plan: "PRO",
            status: "ACTIVE",
          },
        });
      }
    }

    // Handle customer.subscription.updated / deleted
    else if (eventType === "customer.subscription.updated") {
      const sub = event.data?.object;
      const subscriptionId = sub?.id;
      const status = sub?.status === "active" ? "ACTIVE" : "PAST_DUE";

      const existing = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
      });

      if (existing) {
        await prisma.subscription.update({
          where: { id: existing.id },
          data: { status },
        });
      }
    } else if (eventType === "customer.subscription.deleted") {
      const sub = event.data?.object;
      const subscriptionId = sub?.id;

      const existing = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
      });

      if (existing) {
        await prisma.subscription.update({
          where: { id: existing.id },
          data: { status: "CANCELED" },
        });

        await prisma.company.update({
          where: { id: existing.companyId },
          data: { subscriptionPlan: "FREE" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
