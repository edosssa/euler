const injectors = []

class Scope {
  constructor() {
    this.internalScope = {};
    Scope.applyInjectors(this);
  }

  static registerInjector(injector) {
    injectors.push(injector);
  }

  static applyInjectors(scope) {
    injectors.forEach(injector => injector(scope));
  }

  set(key, value, isInternal = false) {
    if (!key) throw new Error("Value supplied to add cannot be undefined");
    this.internalScope[key] = { isInternal, value: value }
  }

  get(key, isInternal = false) {
    const hasKey =
      this.internalScope[key] &&
      this.internalScope[key].isInternal === isInternal

    if (!hasKey) throw new Error(`${key} not found in scope`);
    else return this.internalScope[key].value;
  }

  getAsObject() {
    return this.internalScope;
  }
}

module.exports = Scope;