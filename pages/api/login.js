import bcrypt from "bcryptjs";
import { getStripe } from "../../lib/stripe";
import { createSessionToken, setSessionCookie } from "../../lib/session";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body || {};

  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Email is required." });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({ message: "Password is required." });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    console.error("Stripe configuration error", error);
    return res.status(500).json({ message: "Stripe configuration not ready." });
  }

  try {
    const customers = await stripe.customers.list({ email, limit: 5 });

    const customer = customers.data.find(
      (entry) => entry.metadata && entry.metadata.arketype_password_hash
    );

    if (!customer) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const passwordHash = customer.metadata.arketype_password_hash;

    const valid = await bcrypt.compare(password, passwordHash);

    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const subscriptionId = customer.metadata.arketype_subscription_id;

    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (subscription.status !== "active") {
        return res
          .status(403)
          .json({ message: "Your subscription is not active. Please update billing." });
      }
    }

    const token = createSessionToken({
      sub: customer.id,
      email: customer.email || email,
    });

    setSessionCookie(res, token);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Login error", error);
    return res.status(500).json({ message: "Unable to sign in right now." });
  }
}
