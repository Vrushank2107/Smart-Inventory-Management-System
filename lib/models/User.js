export class User {
  constructor(name, type) {
    if (new.target === User) {
      throw new Error("User is abstract and cannot be instantiated directly");
    }
    this.name = name;
    this.type = type;
  }

  getMembershipMultiplier() {
    return 0;
  }
}

export class NormalUser extends User {
  constructor(name = "Normal User") {
    super(name, "NORMAL");
  }
}

export class SilverUser extends User {
  constructor(name = "Silver User") {
    super(name, "SILVER");
  }

  getMembershipMultiplier() {
    return 0.6;
  }
}

export class GoldUser extends User {
  constructor(name = "Gold User") {
    super(name, "GOLD");
  }

  getMembershipMultiplier() {
    return 1;
  }
}

export function createUserByType(type) {
  if (type === "GOLD") return new GoldUser();
  if (type === "SILVER") return new SilverUser();
  return new NormalUser();
}
