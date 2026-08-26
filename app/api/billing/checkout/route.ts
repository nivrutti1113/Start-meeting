import { NextRequest, NextResponse } from "next/server";
import { createStripeCheckoutSession } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, email, companyId } = body;

    if (!planId) {
      return NextResponse.json({ error: "Missing planId" }, { status: 400 });
    }

    const { checkoutUrl, isDevSimulated } = await createStripeCheckoutSession(
      companyId || "company_demo",
      planId,
      email || "billing@company.com"
    );

    return NextResponse.json({
      checkoutUrl,
      isDevSimulated,
    });
  } catch (error: any) {
    console.error("Billing checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
