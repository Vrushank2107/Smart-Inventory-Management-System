import { Discount } from "@/lib/discounts/Discount";

export class FestivalDiscount extends Discount {
  evaluate({ cart }) {
    const subtotal = cart.getSubtotal();
    const percentage = Number(this.rule.value) / 100;
    const amount = subtotal * percentage;

    return {
      amount,
      label: `${this.rule.name} (${Number(this.rule.value)}% festival offer)`
    };
  }
}
