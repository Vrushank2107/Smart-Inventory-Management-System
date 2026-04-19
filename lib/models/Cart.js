export class Cart {
  #items;

  constructor(items = []) {
    this.#items = items.map((item) => ({
      product: item.product,
      quantity: Number(item.quantity)
    }));
  }

  get items() {
    return this.#items;
  }

  getSubtotal() {
    return this.#items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  getTotalQuantity() {
    return this.#items.reduce((sum, item) => sum + item.quantity, 0);
  }
}
