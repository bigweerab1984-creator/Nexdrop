import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';

export const stripe = new Stripe(secretKey, {
  apiVersion: "2024-06-20",
});
