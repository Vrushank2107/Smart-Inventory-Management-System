export class Discount {
  constructor(rule) {
    if (new.target === Discount) {
      throw new Error("Discount is abstract and must be extended");
    }
    this.rule = rule;
  }

  evaluate(_context) {
    throw new Error("evaluate must be implemented in child class");
  }
}
