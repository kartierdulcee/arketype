import { getStripe } from "../../lib/stripe";

async function fetchCustomer(stripe, customer) {
  if (!customer) return null;
  if (typeof customer === "string") {
    return stripe.customers.retrieve(customer);
  }
  return customer;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const sessionId = req.query.session_id;
  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ message: "Missing session_id parameter." });
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

    const paymentComplete =
      session.payment_status === "paid" || session.status === "complete";

    if (!paymentComplete) {
      return res.status(400).json({ message: "Checkout session incomplete." });
    }

    const customer = await fetchCustomer(stripe, session.customer);

    const email =
      session.customer_details?.email || customer?.email || session.customer_email || "";

    const accountExists = Boolean(customer?.metadata?.arketype_password_hash);

    const responsePayload = {
      id: session.id,
      mode: session.mode,
      customerEmail: email,
      customerId: customer?.id || null,
      subscriptionId:
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id,
      amountTotal: session.amount_total,
      currency: session.currency,
      accountExists,
    };

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error("Error retrieving checkout session", error);
    return res.status(500).json({ message: "Unable to verify checkout session." });
  }
}
