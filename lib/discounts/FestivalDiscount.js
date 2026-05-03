import { Discount } from "@/lib/discounts/Discount";

export class FestivalDiscount extends Discount {
  evaluate({ cart }) {
    const subtotal = cart.getSubtotal();
    const percentage = Number(this.rule.value) / 100;
    const amount = subtotal * percentage;

    // Generate specific labels based on the festival name
    let festivalLabel = "festival offer";
    if (this.rule.name.toLowerCase().includes("new year")) {
      festivalLabel = "New Year celebration offer";
    } else if (this.rule.name.toLowerCase().includes("diwali")) {
      festivalLabel = "Diwali festival offer";
    } else if (this.rule.name.toLowerCase().includes("weekend")) {
      festivalLabel = "Weekend special offer";
    }

    return {
      amount,
      label: `${this.rule.name} (${Number(this.rule.value)}% ${festivalLabel})`
    };
  }
}
