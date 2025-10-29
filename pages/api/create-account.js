import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { getStripe } from "../../lib/stripe";
import { createSessionToken, setSessionCookie } from "../../lib/session";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { sessionId, password } = req.body || {};

  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ message: "Missing checkout session reference." });
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    return res
      .status(400)
      .json({ message: "Please choose a password with at least 8 characters." });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    console.error("Stripe configuration error", error);
    return res.status(500).json({ message: "Stripe configuration not ready." });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (!session) {
      return res.status(404).json({ message: "Checkout session not found." });
    }

    if (session.mode !== "subscription") {
      return res.status(400).json({ message: "Account creation only applies to subscriptions." });
    }

    const paymentComplete =
      session.payment_status === "paid" || session.status === "complete";

    if (!paymentComplete) {
      return res.status(400).json({ message: "Subscription is not active yet." });
    }

    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id;

    if (!customerId) {
      return res
        .status(400)
        .json({ message: "Missing customer information for this subscription." });
    }

    const customer = await stripe.customers.retrieve(customerId);

    const email =
      session.customer_details?.email || customer?.email || session.customer_email;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Unable to determine subscriber email for account creation." });
    }

    if (customer?.metadata?.arketype_password_hash) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    const metadata = {
      ...customer.metadata,
      arketype_password_hash: passwordHash,
      arketype_user_id: customer.metadata?.arketype_user_id || nanoid(),
    };

    if (subscriptionId) {
      metadata.arketype_subscription_id = subscriptionId;
    }

    await stripe.customers.update(customerId, {
      metadata,
    });

    const token = createSessionToken({
      sub: customerId,
      email,
    });

    setSessionCookie(res, token);

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error("Account creation error", error);
    return res.status(500).json({ message: "Unable to complete account setup." });
  }
}
