const path = require("path");

class Scope {
  constructor() {
    this.internalScope = {};
  }

  set(key, value) {
    if (!key) throw new Error("Value supplied to add cannot be undefined");
    this.internalScope[key] = value;
  }

  get(key) {
    if (this.hasKey(key)) return this.internalScope[key];
    else throw new Error("Key not found in scope");
  }

  remove(key) {
    if (this.hasKey(key)) delete this.internalScope[key];
    else throw new Error("Key not found in scope");
  }

  hasKey(key) {
    return Object.keys(this.internalScope).filter(k => k === key).length === 1;
  }

  purge() {
    for (value in this.internalScope) {
      /* Makes sure they are effectively garbage-collected */
      delete internalScope[value];
    }
    this.internalScope = Object.create(null);
  }

  getAsObject() {
    return this.internalScope;
  }
}

module.exports = Scope;
