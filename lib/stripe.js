import Stripe from "stripe";

let stripeClient;

export function getStripe() {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error(
        "Stripe secret key not configured. Set STRIPE_SECRET_KEY in your environment."
      );
    }

    stripeClient = new Stripe(secretKey, {
      apiVersion: "2023-10-16",
    });
  }

  return stripeClient;
}
