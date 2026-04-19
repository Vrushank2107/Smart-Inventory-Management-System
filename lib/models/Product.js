export class Product {
  #id;
  #name;
  #price;
  #category;

  constructor({ id, name, price, category }) {
    this.#id = id;
    this.#name = name;
    this.#price = Number(price);
    this.#category = category;
  }

  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  get price() {
    return this.#price;
  }

  get category() {
    return this.#category;
  }
}
