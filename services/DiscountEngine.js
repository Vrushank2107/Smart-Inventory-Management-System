import { Cart } from "@/lib/models/Cart";
import { createUserByType } from "@/lib/models/User";
import { FestivalDiscount } from "@/lib/discounts/FestivalDiscount";
import { MembershipDiscount } from "@/lib/discounts/MembershipDiscount";
import { MinimumPurchaseDiscount } from "@/lib/discounts/MinimumPurchaseDiscount";

export class DiscountEngine {
  constructor({ rules }) {
    this.rules = rules;
  }

  createDiscount(rule) {
    if (rule.type === "FESTIVAL") return new FestivalDiscount(rule);
    if (rule.type === "MEMBERSHIP") return new MembershipDiscount(rule);
    if (rule.type === "MIN_PURCHASE") return new MinimumPurchaseDiscount(rule);
    return null;
  }

  generateValidCombinations(rules) {
    const combinations = [];
    const count = 1 << rules.length;

    for (let mask = 1; mask < count; mask += 1) {
      const set = [];
      for (let i = 0; i < rules.length; i += 1) {
        if (mask & (1 << i)) set.push(rules[i]);
      }

      const nonCombinables = set.filter((rule) => !rule.combinable);
      if (set.length > 1 && nonCombinables.length > 0) continue;
      combinations.push(set);
    }

    return combinations;
  }

  evaluate({ cartItems, userType }) {
    const cart = new Cart(cartItems);
    const user = createUserByType(userType);
    const total = cart.getSubtotal();

    const activeRules = this.rules
      .map((rule) => ({ ...rule, discount: this.createDiscount(rule) }))
      .filter((rule) => rule.discount);

    if (!activeRules.length) {
      return {
        total: Number(total.toFixed(2)),
        discountApplied: 0,
        finalAmount: Number(total.toFixed(2)),
        explanation: ["No active discount rules available."]
      };
    }

    const combos = this.generateValidCombinations(activeRules);
    let best = {
      discount: 0,
      explanation: ["No combination yielded positive discount."]
    };

    for (const combo of combos) {
      let discount = 0;
      const explanation = [];

      for (const rule of combo) {
        const result = rule.discount.evaluate({ cart, user });
        discount += result.amount;
        explanation.push(result.label);
      }

      const boundedDiscount = Math.min(discount, total);
      if (boundedDiscount > best.discount) {
        best = {
          discount: boundedDiscount,
          explanation
        };
      }
    }

    const finalAmount = Math.max(total - best.discount, 0);

    return {
      total: Number(total.toFixed(2)),
      discountApplied: Number(best.discount.toFixed(2)),
      finalAmount: Number(finalAmount.toFixed(2)),
      explanation: [
        `Cart subtotal: ${total.toFixed(2)}`,
        ...best.explanation,
        `Best discount selected: ${best.discount.toFixed(2)}`
      ]
    };
  }
}
