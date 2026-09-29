// Single source of truth for plan limits and prices.
// Prices are informational only (no payment gateway is wired up yet) —
// they're shown in the 429 message and README so customers know what to pay.
export const PLANS = {
  free:    { limit: 50,   price: 0  },
  starter: { limit: 500,  price: 5  },
  growth:  { limit: 1000, price: 15 },
  pro:     { limit: 5000, price: 25 },
};