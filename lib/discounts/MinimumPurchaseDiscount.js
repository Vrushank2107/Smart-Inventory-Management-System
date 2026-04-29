import { Discount } from "@/lib/discounts/Discount";

export class MinimumPurchaseDiscount extends Discount {
  evaluate({ cart }) {
    const subtotal = cart.getSubtotal();
    const threshold = Number(this.rule.value);

    if (subtotal < threshold) {
      return {
        amount: 0,
        label: `${this.rule.name} skipped (requires minimum ${threshold.toFixed(2)})`
      };
    }

    // Apply 12% discount up to 300 when threshold is met
    const discountPercent = 0.12;
    const maxDiscount = 300;
    const amount = Math.min(subtotal * discountPercent, maxDiscount);
    return {
      amount,
      label: `${this.rule.name} applied (12% up to 300 after crossing ${threshold.toFixed(2)})`
    };
  }
}
