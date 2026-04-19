import { Discount } from "@/lib/discounts/Discount";

export class MembershipDiscount extends Discount {
  evaluate({ cart, user }) {
    const subtotal = cart.getSubtotal();
    const baseRate = Number(this.rule.value) / 100;
    const actualRate = baseRate * user.getMembershipMultiplier();
    const amount = subtotal * actualRate;

    return {
      amount,
      label: `${this.rule.name} (membership multiplier ${user.getMembershipMultiplier()})`
    };
  }
}
