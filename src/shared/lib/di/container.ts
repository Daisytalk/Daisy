// Simple DI Container implementation
type Constructor<T = {}> = new (...args: any[]) => T
type ServiceIdentifier<T = any> = Constructor<T> | string | symbol

class DIContainer {
  private services = new Map<ServiceIdentifier, any>()
  private singletons = new Map<ServiceIdentifier, any>()

  bind<T>(identifier: ServiceIdentifier<T>, implementation: Constructor<T> | T): this {
    this.services.set(identifier, implementation)
    return this
  }

  bindSingleton<T>(identifier: ServiceIdentifier<T>, implementation: Constructor<T> | T): this {
    this.services.set(identifier, implementation)
    this.singletons.set(identifier, null) // Mark as singleton
    return this
  }

  get<T>(identifier: ServiceIdentifier<T>): T {
    // Check if it's a singleton and already instantiated
    if (this.singletons.has(identifier)) {
      const existing = this.singletons.get(identifier)
      if (existing) return existing
    }

    const service = this.services.get(identifier)
    if (!service) {
      throw new Error(`Service ${String(identifier)} not found`)
    }

    // If it's a constructor, instantiate it
    const instance = typeof service === 'function' ? new service() : service

    // Store singleton instance
    if (this.singletons.has(identifier)) {
      this.singletons.set(identifier, instance)
    }

    return instance
  }

  has(identifier: ServiceIdentifier): boolean {
    return this.services.has(identifier)
  }
}

export const container = new DIContainer()
export type { ServiceIdentifier }