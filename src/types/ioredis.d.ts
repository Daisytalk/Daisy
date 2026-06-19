declare module 'ioredis' {
  export default class Redis {
    constructor(url: string)
    incrby(key: string, increment: number): Promise<number>
    pexpire(key: string, ms: number): Promise<number>
    pttl(key: string): Promise<number>
  }
}
