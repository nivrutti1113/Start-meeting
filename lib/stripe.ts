/**
 * Stripe SaaS Billing Helper
 */

export interface PricingPlan {
  id: string;
  name: string;
  priceMonthly: number;
  features: string[];
  stripePriceId?: string;
}

export const SAAS_PLANS: PricingPlan[] = [
  {
    id: "FREE",
    name: "Starter",
    priceMonthly: 0,
    features: [
      "Up to 5 Meetings / month",
      "LiveKit HD Video Engine",
      "Basic AI Task Extraction",
      "Community Support"
    ],
  },
  {
    id: "PRO",
    name: "Professional",
    priceMonthly: 29,
    features: [
      "Unlimited HD Video Meetings",
      "Deepgram Speaker Diarization",
      "Anthropic Claude 3.5 Sonnet Tasks",
      "WhatsApp & Email Auto-Dispatch",
      "Attendance History & Analytics",
      "Priority 24/7 Support"
    ],
    stripePriceId: "price_pro_monthly",
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise Multi-Tenant",
    priceMonthly: 99,
    features: [
      "Multi-Company Organization Scoping",
      "Unlimited Workspaces & Employees",
      "Custom Webhooks & LiveKit Server",
      "Dedicated Account Manager",
      "SLA 99.99% Guarantee"
    ],
    stripePriceId: "price_enterprise_monthly",
  },
];

export async function createStripeCheckoutSession(
  companyId: string,
  planId: string,
  customerEmail: string
): Promise<{ checkoutUrl: string; isDevSimulated: boolean }> {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey || stripeSecretKey.trim() === "") {
    console.warn("[STRIPE SIMULATOR] Secret key missing. Returning simulated checkout URL.");
    return {
      checkoutUrl: `/dashboard/company?billing_success=true&plan=${planId}`,
      isDevSimulated: true,
    };
  }

  // Real Stripe Checkout API integration logic
  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        mode: "subscription",
        customer_email: customerEmail,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/company?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/company?canceled=true`,
        "line_items[0][price]": planId === "PRO" ? "price_12345" : "price_67890",
        "line_items[0][quantity]": "1",
        "metadata[companyId]": companyId,
      }),
    });

    const data = await res.json();
    return {
      checkoutUrl: data.url || "/dashboard/company",
      isDevSimulated: false,
    };
  } catch (err) {
    console.error("Stripe Checkout Error:", err);
    return {
      checkoutUrl: `/dashboard/company?billing_success=true&plan=${planId}`,
      isDevSimulated: true,
    };
  }
}
