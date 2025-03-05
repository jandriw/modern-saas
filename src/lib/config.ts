export const lookupKeys = ["plus_monthly", "plus_yearly", "pro_monthly", "pro_yearly"] as const;

export const productNames = ["Free", "Plus", "Pro"] as const;
type ProductNames = (typeof productNames)[number];

type ProductConfig = Record<ProductNames, { features: string[]; call_to_action: string }>;

export const productConfig: ProductConfig = {
  Free: {
    features: [
      "✅ Up to 1 Goal",
      "❌ Data History",
      "❌ Devs Support",
      "❌ Stats & Reports",
      "❌ Automatic Backups",
    ],
    call_to_action: "Get Started",
  },
  Plus: {
    features: [
      "✅ Up to 3 Goals",
      "✅ Data History",
      "✅ Devs Support",
      "❌ Stats & Reports",
      "❌ Automatic Backups",
    ],
    call_to_action: "Get Started",
  },
  Pro: {
    features: [
      "✅ Unlimited Goals",
      "✅ Data History",
      "✅ Devs Support",
      "✅ Stats & Reports",
      "✅ Automatic Backups",
    ],
    call_to_action: "Get Started",
  },
};

export const freePrice = {
  id: "",
  unit_amount: 0,
  interval: "forever",
  product: {
    name: "Free",
    description: "For limited personal use",
    features: productConfig.Free.features,
    call_to_action: productConfig.Free.call_to_action,
  },
};