import { getStripe } from "../../lib/stripe";

const ALLOWED_MODES = new Set(["payment", "subscription"]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { priceId, mode } = req.body;

  if (!priceId || typeof priceId !== "string") {
    return res.status(400).json({ message: "Missing priceId parameter." });
  }

  if (!mode || typeof mode !== "string" || !ALLOWED_MODES.has(mode)) {
    return res.status(400).json({ message: "Invalid Stripe Checkout mode." });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    console.error("Stripe configuration error", error);
    return res.status(500).json({ message: "Stripe configuration not ready." });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/products`,
      allow_promotion_codes: true,
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error("Stripe checkout session error", error);
    return res.status(500).json({ message: "Unable to create checkout session." });
  }
}
