
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model OnboardingData
 * 
 */
export type OnboardingData = $Result.DefaultSelection<Prisma.$OnboardingDataPayload>
/**
 * Model AiSession
 * 
 */
export type AiSession = $Result.DefaultSelection<Prisma.$AiSessionPayload>
/**
 * Model Newsletter
 * 
 */
export type Newsletter = $Result.DefaultSelection<Prisma.$NewsletterPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.onboardingData`: Exposes CRUD operations for the **OnboardingData** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OnboardingData
    * const onboardingData = await prisma.onboardingData.findMany()
    * ```
    */
  get onboardingData(): Prisma.OnboardingDataDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.aiSession`: Exposes CRUD operations for the **AiSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AiSessions
    * const aiSessions = await prisma.aiSession.findMany()
    * ```
    */
  get aiSession(): Prisma.AiSessionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.newsletter`: Exposes CRUD operations for the **Newsletter** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Newsletters
    * const newsletters = await prisma.newsletter.findMany()
    * ```
    */
  get newsletter(): Prisma.NewsletterDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.16.2
   * Query Engine version: 1c57fdcd7e44b29b9313256c76699e91c3ac3c43
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    OnboardingData: 'OnboardingData',
    AiSession: 'AiSession',
    Newsletter: 'Newsletter'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "onboardingData" | "aiSession" | "newsletter"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      OnboardingData: {
        payload: Prisma.$OnboardingDataPayload<ExtArgs>
        fields: Prisma.OnboardingDataFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OnboardingDataFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDataPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OnboardingDataFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDataPayload>
          }
          findFirst: {
            args: Prisma.OnboardingDataFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDataPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OnboardingDataFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDataPayload>
          }
          findMany: {
            args: Prisma.OnboardingDataFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDataPayload>[]
          }
          create: {
            args: Prisma.OnboardingDataCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDataPayload>
          }
          createMany: {
            args: Prisma.OnboardingDataCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OnboardingDataCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDataPayload>[]
          }
          delete: {
            args: Prisma.OnboardingDataDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDataPayload>
          }
          update: {
            args: Prisma.OnboardingDataUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDataPayload>
          }
          deleteMany: {
            args: Prisma.OnboardingDataDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OnboardingDataUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OnboardingDataUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDataPayload>[]
          }
          upsert: {
            args: Prisma.OnboardingDataUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDataPayload>
          }
          aggregate: {
            args: Prisma.OnboardingDataAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOnboardingData>
          }
          groupBy: {
            args: Prisma.OnboardingDataGroupByArgs<ExtArgs>
            result: $Utils.Optional<OnboardingDataGroupByOutputType>[]
          }
          count: {
            args: Prisma.OnboardingDataCountArgs<ExtArgs>
            result: $Utils.Optional<OnboardingDataCountAggregateOutputType> | number
          }
        }
      }
      AiSession: {
        payload: Prisma.$AiSessionPayload<ExtArgs>
        fields: Prisma.AiSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AiSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AiSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiSessionPayload>
          }
          findFirst: {
            args: Prisma.AiSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AiSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiSessionPayload>
          }
          findMany: {
            args: Prisma.AiSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiSessionPayload>[]
          }
          create: {
            args: Prisma.AiSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiSessionPayload>
          }
          createMany: {
            args: Prisma.AiSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AiSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiSessionPayload>[]
          }
          delete: {
            args: Prisma.AiSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiSessionPayload>
          }
          update: {
            args: Prisma.AiSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiSessionPayload>
          }
          deleteMany: {
            args: Prisma.AiSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AiSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AiSessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiSessionPayload>[]
          }
          upsert: {
            args: Prisma.AiSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiSessionPayload>
          }
          aggregate: {
            args: Prisma.AiSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAiSession>
          }
          groupBy: {
            args: Prisma.AiSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<AiSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.AiSessionCountArgs<ExtArgs>
            result: $Utils.Optional<AiSessionCountAggregateOutputType> | number
          }
        }
      }
      Newsletter: {
        payload: Prisma.$NewsletterPayload<ExtArgs>
        fields: Prisma.NewsletterFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NewsletterFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsletterPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NewsletterFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsletterPayload>
          }
          findFirst: {
            args: Prisma.NewsletterFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsletterPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NewsletterFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsletterPayload>
          }
          findMany: {
            args: Prisma.NewsletterFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsletterPayload>[]
          }
          create: {
            args: Prisma.NewsletterCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsletterPayload>
          }
          createMany: {
            args: Prisma.NewsletterCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NewsletterCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsletterPayload>[]
          }
          delete: {
            args: Prisma.NewsletterDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsletterPayload>
          }
          update: {
            args: Prisma.NewsletterUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsletterPayload>
          }
          deleteMany: {
            args: Prisma.NewsletterDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NewsletterUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.NewsletterUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsletterPayload>[]
          }
          upsert: {
            args: Prisma.NewsletterUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NewsletterPayload>
          }
          aggregate: {
            args: Prisma.NewsletterAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNewsletter>
          }
          groupBy: {
            args: Prisma.NewsletterGroupByArgs<ExtArgs>
            result: $Utils.Optional<NewsletterGroupByOutputType>[]
          }
          count: {
            args: Prisma.NewsletterCountArgs<ExtArgs>
            result: $Utils.Optional<NewsletterCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    onboardingData?: OnboardingDataOmit
    aiSession?: AiSessionOmit
    newsletter?: NewsletterOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    aiSessions: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    aiSessions?: boolean | UserCountOutputTypeCountAiSessionsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAiSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AiSessionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    name: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    name: string | null
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    onboarding?: boolean | User$onboardingArgs<ExtArgs>
    aiSessions?: boolean | User$aiSessionsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "name" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    onboarding?: boolean | User$onboardingArgs<ExtArgs>
    aiSessions?: boolean | User$aiSessionsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      onboarding: Prisma.$OnboardingDataPayload<ExtArgs> | null
      aiSessions: Prisma.$AiSessionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      name: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    onboarding<T extends User$onboardingArgs<ExtArgs> = {}>(args?: Subset<T, User$onboardingArgs<ExtArgs>>): Prisma__OnboardingDataClient<$Result.GetResult<Prisma.$OnboardingDataPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    aiSessions<T extends User$aiSessionsArgs<ExtArgs> = {}>(args?: Subset<T, User$aiSessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AiSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.onboarding
   */
  export type User$onboardingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingData
     */
    select?: OnboardingDataSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingData
     */
    omit?: OnboardingDataOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDataInclude<ExtArgs> | null
    where?: OnboardingDataWhereInput
  }

  /**
   * User.aiSessions
   */
  export type User$aiSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiSession
     */
    select?: AiSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiSession
     */
    omit?: AiSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiSessionInclude<ExtArgs> | null
    where?: AiSessionWhereInput
    orderBy?: AiSessionOrderByWithRelationInput | AiSessionOrderByWithRelationInput[]
    cursor?: AiSessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AiSessionScalarFieldEnum | AiSessionScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model OnboardingData
   */

  export type AggregateOnboardingData = {
    _count: OnboardingDataCountAggregateOutputType | null
    _min: OnboardingDataMinAggregateOutputType | null
    _max: OnboardingDataMaxAggregateOutputType | null
  }

  export type OnboardingDataMinAggregateOutputType = {
    id: string | null
    userId: string | null
    completed: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OnboardingDataMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    completed: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OnboardingDataCountAggregateOutputType = {
    id: number
    userId: number
    responses: number
    completed: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OnboardingDataMinAggregateInputType = {
    id?: true
    userId?: true
    completed?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OnboardingDataMaxAggregateInputType = {
    id?: true
    userId?: true
    completed?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OnboardingDataCountAggregateInputType = {
    id?: true
    userId?: true
    responses?: true
    completed?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OnboardingDataAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OnboardingData to aggregate.
     */
    where?: OnboardingDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingData to fetch.
     */
    orderBy?: OnboardingDataOrderByWithRelationInput | OnboardingDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OnboardingDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingData.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OnboardingData
    **/
    _count?: true | OnboardingDataCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OnboardingDataMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OnboardingDataMaxAggregateInputType
  }

  export type GetOnboardingDataAggregateType<T extends OnboardingDataAggregateArgs> = {
        [P in keyof T & keyof AggregateOnboardingData]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOnboardingData[P]>
      : GetScalarType<T[P], AggregateOnboardingData[P]>
  }




  export type OnboardingDataGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OnboardingDataWhereInput
    orderBy?: OnboardingDataOrderByWithAggregationInput | OnboardingDataOrderByWithAggregationInput[]
    by: OnboardingDataScalarFieldEnum[] | OnboardingDataScalarFieldEnum
    having?: OnboardingDataScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OnboardingDataCountAggregateInputType | true
    _min?: OnboardingDataMinAggregateInputType
    _max?: OnboardingDataMaxAggregateInputType
  }

  export type OnboardingDataGroupByOutputType = {
    id: string
    userId: string
    responses: JsonValue
    completed: boolean
    createdAt: Date
    updatedAt: Date
    _count: OnboardingDataCountAggregateOutputType | null
    _min: OnboardingDataMinAggregateOutputType | null
    _max: OnboardingDataMaxAggregateOutputType | null
  }

  type GetOnboardingDataGroupByPayload<T extends OnboardingDataGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OnboardingDataGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OnboardingDataGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OnboardingDataGroupByOutputType[P]>
            : GetScalarType<T[P], OnboardingDataGroupByOutputType[P]>
        }
      >
    >


  export type OnboardingDataSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    responses?: boolean
    completed?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingData"]>

  export type OnboardingDataSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    responses?: boolean
    completed?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingData"]>

  export type OnboardingDataSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    responses?: boolean
    completed?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingData"]>

  export type OnboardingDataSelectScalar = {
    id?: boolean
    userId?: boolean
    responses?: boolean
    completed?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OnboardingDataOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "responses" | "completed" | "createdAt" | "updatedAt", ExtArgs["result"]["onboardingData"]>
  export type OnboardingDataInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type OnboardingDataIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type OnboardingDataIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $OnboardingDataPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OnboardingData"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      responses: Prisma.JsonValue
      completed: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["onboardingData"]>
    composites: {}
  }

  type OnboardingDataGetPayload<S extends boolean | null | undefined | OnboardingDataDefaultArgs> = $Result.GetResult<Prisma.$OnboardingDataPayload, S>

  type OnboardingDataCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OnboardingDataFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OnboardingDataCountAggregateInputType | true
    }

  export interface OnboardingDataDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OnboardingData'], meta: { name: 'OnboardingData' } }
    /**
     * Find zero or one OnboardingData that matches the filter.
     * @param {OnboardingDataFindUniqueArgs} args - Arguments to find a OnboardingData
     * @example
     * // Get one OnboardingData
     * const onboardingData = await prisma.onboardingData.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OnboardingDataFindUniqueArgs>(args: SelectSubset<T, OnboardingDataFindUniqueArgs<ExtArgs>>): Prisma__OnboardingDataClient<$Result.GetResult<Prisma.$OnboardingDataPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OnboardingData that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OnboardingDataFindUniqueOrThrowArgs} args - Arguments to find a OnboardingData
     * @example
     * // Get one OnboardingData
     * const onboardingData = await prisma.onboardingData.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OnboardingDataFindUniqueOrThrowArgs>(args: SelectSubset<T, OnboardingDataFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OnboardingDataClient<$Result.GetResult<Prisma.$OnboardingDataPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OnboardingData that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingDataFindFirstArgs} args - Arguments to find a OnboardingData
     * @example
     * // Get one OnboardingData
     * const onboardingData = await prisma.onboardingData.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OnboardingDataFindFirstArgs>(args?: SelectSubset<T, OnboardingDataFindFirstArgs<ExtArgs>>): Prisma__OnboardingDataClient<$Result.GetResult<Prisma.$OnboardingDataPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OnboardingData that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingDataFindFirstOrThrowArgs} args - Arguments to find a OnboardingData
     * @example
     * // Get one OnboardingData
     * const onboardingData = await prisma.onboardingData.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OnboardingDataFindFirstOrThrowArgs>(args?: SelectSubset<T, OnboardingDataFindFirstOrThrowArgs<ExtArgs>>): Prisma__OnboardingDataClient<$Result.GetResult<Prisma.$OnboardingDataPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OnboardingData that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingDataFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OnboardingData
     * const onboardingData = await prisma.onboardingData.findMany()
     * 
     * // Get first 10 OnboardingData
     * const onboardingData = await prisma.onboardingData.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const onboardingDataWithIdOnly = await prisma.onboardingData.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OnboardingDataFindManyArgs>(args?: SelectSubset<T, OnboardingDataFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingDataPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OnboardingData.
     * @param {OnboardingDataCreateArgs} args - Arguments to create a OnboardingData.
     * @example
     * // Create one OnboardingData
     * const OnboardingData = await prisma.onboardingData.create({
     *   data: {
     *     // ... data to create a OnboardingData
     *   }
     * })
     * 
     */
    create<T extends OnboardingDataCreateArgs>(args: SelectSubset<T, OnboardingDataCreateArgs<ExtArgs>>): Prisma__OnboardingDataClient<$Result.GetResult<Prisma.$OnboardingDataPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OnboardingData.
     * @param {OnboardingDataCreateManyArgs} args - Arguments to create many OnboardingData.
     * @example
     * // Create many OnboardingData
     * const onboardingData = await prisma.onboardingData.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OnboardingDataCreateManyArgs>(args?: SelectSubset<T, OnboardingDataCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OnboardingData and returns the data saved in the database.
     * @param {OnboardingDataCreateManyAndReturnArgs} args - Arguments to create many OnboardingData.
     * @example
     * // Create many OnboardingData
     * const onboardingData = await prisma.onboardingData.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OnboardingData and only return the `id`
     * const onboardingDataWithIdOnly = await prisma.onboardingData.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OnboardingDataCreateManyAndReturnArgs>(args?: SelectSubset<T, OnboardingDataCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingDataPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OnboardingData.
     * @param {OnboardingDataDeleteArgs} args - Arguments to delete one OnboardingData.
     * @example
     * // Delete one OnboardingData
     * const OnboardingData = await prisma.onboardingData.delete({
     *   where: {
     *     // ... filter to delete one OnboardingData
     *   }
     * })
     * 
     */
    delete<T extends OnboardingDataDeleteArgs>(args: SelectSubset<T, OnboardingDataDeleteArgs<ExtArgs>>): Prisma__OnboardingDataClient<$Result.GetResult<Prisma.$OnboardingDataPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OnboardingData.
     * @param {OnboardingDataUpdateArgs} args - Arguments to update one OnboardingData.
     * @example
     * // Update one OnboardingData
     * const onboardingData = await prisma.onboardingData.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OnboardingDataUpdateArgs>(args: SelectSubset<T, OnboardingDataUpdateArgs<ExtArgs>>): Prisma__OnboardingDataClient<$Result.GetResult<Prisma.$OnboardingDataPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OnboardingData.
     * @param {OnboardingDataDeleteManyArgs} args - Arguments to filter OnboardingData to delete.
     * @example
     * // Delete a few OnboardingData
     * const { count } = await prisma.onboardingData.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OnboardingDataDeleteManyArgs>(args?: SelectSubset<T, OnboardingDataDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OnboardingData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingDataUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OnboardingData
     * const onboardingData = await prisma.onboardingData.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OnboardingDataUpdateManyArgs>(args: SelectSubset<T, OnboardingDataUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OnboardingData and returns the data updated in the database.
     * @param {OnboardingDataUpdateManyAndReturnArgs} args - Arguments to update many OnboardingData.
     * @example
     * // Update many OnboardingData
     * const onboardingData = await prisma.onboardingData.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OnboardingData and only return the `id`
     * const onboardingDataWithIdOnly = await prisma.onboardingData.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OnboardingDataUpdateManyAndReturnArgs>(args: SelectSubset<T, OnboardingDataUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingDataPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OnboardingData.
     * @param {OnboardingDataUpsertArgs} args - Arguments to update or create a OnboardingData.
     * @example
     * // Update or create a OnboardingData
     * const onboardingData = await prisma.onboardingData.upsert({
     *   create: {
     *     // ... data to create a OnboardingData
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OnboardingData we want to update
     *   }
     * })
     */
    upsert<T extends OnboardingDataUpsertArgs>(args: SelectSubset<T, OnboardingDataUpsertArgs<ExtArgs>>): Prisma__OnboardingDataClient<$Result.GetResult<Prisma.$OnboardingDataPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OnboardingData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingDataCountArgs} args - Arguments to filter OnboardingData to count.
     * @example
     * // Count the number of OnboardingData
     * const count = await prisma.onboardingData.count({
     *   where: {
     *     // ... the filter for the OnboardingData we want to count
     *   }
     * })
    **/
    count<T extends OnboardingDataCountArgs>(
      args?: Subset<T, OnboardingDataCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OnboardingDataCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OnboardingData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingDataAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OnboardingDataAggregateArgs>(args: Subset<T, OnboardingDataAggregateArgs>): Prisma.PrismaPromise<GetOnboardingDataAggregateType<T>>

    /**
     * Group by OnboardingData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingDataGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OnboardingDataGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OnboardingDataGroupByArgs['orderBy'] }
        : { orderBy?: OnboardingDataGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OnboardingDataGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOnboardingDataGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OnboardingData model
   */
  readonly fields: OnboardingDataFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OnboardingData.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OnboardingDataClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OnboardingData model
   */
  interface OnboardingDataFieldRefs {
    readonly id: FieldRef<"OnboardingData", 'String'>
    readonly userId: FieldRef<"OnboardingData", 'String'>
    readonly responses: FieldRef<"OnboardingData", 'Json'>
    readonly completed: FieldRef<"OnboardingData", 'Boolean'>
    readonly createdAt: FieldRef<"OnboardingData", 'DateTime'>
    readonly updatedAt: FieldRef<"OnboardingData", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OnboardingData findUnique
   */
  export type OnboardingDataFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingData
     */
    select?: OnboardingDataSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingData
     */
    omit?: OnboardingDataOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDataInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingData to fetch.
     */
    where: OnboardingDataWhereUniqueInput
  }

  /**
   * OnboardingData findUniqueOrThrow
   */
  export type OnboardingDataFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingData
     */
    select?: OnboardingDataSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingData
     */
    omit?: OnboardingDataOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDataInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingData to fetch.
     */
    where: OnboardingDataWhereUniqueInput
  }

  /**
   * OnboardingData findFirst
   */
  export type OnboardingDataFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingData
     */
    select?: OnboardingDataSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingData
     */
    omit?: OnboardingDataOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDataInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingData to fetch.
     */
    where?: OnboardingDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingData to fetch.
     */
    orderBy?: OnboardingDataOrderByWithRelationInput | OnboardingDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OnboardingData.
     */
    cursor?: OnboardingDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingData.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OnboardingData.
     */
    distinct?: OnboardingDataScalarFieldEnum | OnboardingDataScalarFieldEnum[]
  }

  /**
   * OnboardingData findFirstOrThrow
   */
  export type OnboardingDataFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingData
     */
    select?: OnboardingDataSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingData
     */
    omit?: OnboardingDataOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDataInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingData to fetch.
     */
    where?: OnboardingDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingData to fetch.
     */
    orderBy?: OnboardingDataOrderByWithRelationInput | OnboardingDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OnboardingData.
     */
    cursor?: OnboardingDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingData.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OnboardingData.
     */
    distinct?: OnboardingDataScalarFieldEnum | OnboardingDataScalarFieldEnum[]
  }

  /**
   * OnboardingData findMany
   */
  export type OnboardingDataFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingData
     */
    select?: OnboardingDataSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingData
     */
    omit?: OnboardingDataOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDataInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingData to fetch.
     */
    where?: OnboardingDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingData to fetch.
     */
    orderBy?: OnboardingDataOrderByWithRelationInput | OnboardingDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OnboardingData.
     */
    cursor?: OnboardingDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingData.
     */
    skip?: number
    distinct?: OnboardingDataScalarFieldEnum | OnboardingDataScalarFieldEnum[]
  }

  /**
   * OnboardingData create
   */
  export type OnboardingDataCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingData
     */
    select?: OnboardingDataSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingData
     */
    omit?: OnboardingDataOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDataInclude<ExtArgs> | null
    /**
     * The data needed to create a OnboardingData.
     */
    data: XOR<OnboardingDataCreateInput, OnboardingDataUncheckedCreateInput>
  }

  /**
   * OnboardingData createMany
   */
  export type OnboardingDataCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OnboardingData.
     */
    data: OnboardingDataCreateManyInput | OnboardingDataCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OnboardingData createManyAndReturn
   */
  export type OnboardingDataCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingData
     */
    select?: OnboardingDataSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingData
     */
    omit?: OnboardingDataOmit<ExtArgs> | null
    /**
     * The data used to create many OnboardingData.
     */
    data: OnboardingDataCreateManyInput | OnboardingDataCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDataIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OnboardingData update
   */
  export type OnboardingDataUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingData
     */
    select?: OnboardingDataSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingData
     */
    omit?: OnboardingDataOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDataInclude<ExtArgs> | null
    /**
     * The data needed to update a OnboardingData.
     */
    data: XOR<OnboardingDataUpdateInput, OnboardingDataUncheckedUpdateInput>
    /**
     * Choose, which OnboardingData to update.
     */
    where: OnboardingDataWhereUniqueInput
  }

  /**
   * OnboardingData updateMany
   */
  export type OnboardingDataUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OnboardingData.
     */
    data: XOR<OnboardingDataUpdateManyMutationInput, OnboardingDataUncheckedUpdateManyInput>
    /**
     * Filter which OnboardingData to update
     */
    where?: OnboardingDataWhereInput
    /**
     * Limit how many OnboardingData to update.
     */
    limit?: number
  }

  /**
   * OnboardingData updateManyAndReturn
   */
  export type OnboardingDataUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingData
     */
    select?: OnboardingDataSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingData
     */
    omit?: OnboardingDataOmit<ExtArgs> | null
    /**
     * The data used to update OnboardingData.
     */
    data: XOR<OnboardingDataUpdateManyMutationInput, OnboardingDataUncheckedUpdateManyInput>
    /**
     * Filter which OnboardingData to update
     */
    where?: OnboardingDataWhereInput
    /**
     * Limit how many OnboardingData to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDataIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OnboardingData upsert
   */
  export type OnboardingDataUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingData
     */
    select?: OnboardingDataSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingData
     */
    omit?: OnboardingDataOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDataInclude<ExtArgs> | null
    /**
     * The filter to search for the OnboardingData to update in case it exists.
     */
    where: OnboardingDataWhereUniqueInput
    /**
     * In case the OnboardingData found by the `where` argument doesn't exist, create a new OnboardingData with this data.
     */
    create: XOR<OnboardingDataCreateInput, OnboardingDataUncheckedCreateInput>
    /**
     * In case the OnboardingData was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OnboardingDataUpdateInput, OnboardingDataUncheckedUpdateInput>
  }

  /**
   * OnboardingData delete
   */
  export type OnboardingDataDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingData
     */
    select?: OnboardingDataSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingData
     */
    omit?: OnboardingDataOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDataInclude<ExtArgs> | null
    /**
     * Filter which OnboardingData to delete.
     */
    where: OnboardingDataWhereUniqueInput
  }

  /**
   * OnboardingData deleteMany
   */
  export type OnboardingDataDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OnboardingData to delete
     */
    where?: OnboardingDataWhereInput
    /**
     * Limit how many OnboardingData to delete.
     */
    limit?: number
  }

  /**
   * OnboardingData without action
   */
  export type OnboardingDataDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingData
     */
    select?: OnboardingDataSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingData
     */
    omit?: OnboardingDataOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDataInclude<ExtArgs> | null
  }


  /**
   * Model AiSession
   */

  export type AggregateAiSession = {
    _count: AiSessionCountAggregateOutputType | null
    _min: AiSessionMinAggregateOutputType | null
    _max: AiSessionMaxAggregateOutputType | null
  }

  export type AiSessionMinAggregateOutputType = {
    id: string | null
    userId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AiSessionMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AiSessionCountAggregateOutputType = {
    id: number
    userId: number
    messages: number
    context: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AiSessionMinAggregateInputType = {
    id?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AiSessionMaxAggregateInputType = {
    id?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AiSessionCountAggregateInputType = {
    id?: true
    userId?: true
    messages?: true
    context?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AiSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AiSession to aggregate.
     */
    where?: AiSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AiSessions to fetch.
     */
    orderBy?: AiSessionOrderByWithRelationInput | AiSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AiSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AiSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AiSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AiSessions
    **/
    _count?: true | AiSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AiSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AiSessionMaxAggregateInputType
  }

  export type GetAiSessionAggregateType<T extends AiSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateAiSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAiSession[P]>
      : GetScalarType<T[P], AggregateAiSession[P]>
  }




  export type AiSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AiSessionWhereInput
    orderBy?: AiSessionOrderByWithAggregationInput | AiSessionOrderByWithAggregationInput[]
    by: AiSessionScalarFieldEnum[] | AiSessionScalarFieldEnum
    having?: AiSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AiSessionCountAggregateInputType | true
    _min?: AiSessionMinAggregateInputType
    _max?: AiSessionMaxAggregateInputType
  }

  export type AiSessionGroupByOutputType = {
    id: string
    userId: string
    messages: JsonValue
    context: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: AiSessionCountAggregateOutputType | null
    _min: AiSessionMinAggregateOutputType | null
    _max: AiSessionMaxAggregateOutputType | null
  }

  type GetAiSessionGroupByPayload<T extends AiSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AiSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AiSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AiSessionGroupByOutputType[P]>
            : GetScalarType<T[P], AiSessionGroupByOutputType[P]>
        }
      >
    >


  export type AiSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    messages?: boolean
    context?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["aiSession"]>

  export type AiSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    messages?: boolean
    context?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["aiSession"]>

  export type AiSessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    messages?: boolean
    context?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["aiSession"]>

  export type AiSessionSelectScalar = {
    id?: boolean
    userId?: boolean
    messages?: boolean
    context?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AiSessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "messages" | "context" | "createdAt" | "updatedAt", ExtArgs["result"]["aiSession"]>
  export type AiSessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AiSessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AiSessionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $AiSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AiSession"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      messages: Prisma.JsonValue
      context: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["aiSession"]>
    composites: {}
  }

  type AiSessionGetPayload<S extends boolean | null | undefined | AiSessionDefaultArgs> = $Result.GetResult<Prisma.$AiSessionPayload, S>

  type AiSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AiSessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AiSessionCountAggregateInputType | true
    }

  export interface AiSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AiSession'], meta: { name: 'AiSession' } }
    /**
     * Find zero or one AiSession that matches the filter.
     * @param {AiSessionFindUniqueArgs} args - Arguments to find a AiSession
     * @example
     * // Get one AiSession
     * const aiSession = await prisma.aiSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AiSessionFindUniqueArgs>(args: SelectSubset<T, AiSessionFindUniqueArgs<ExtArgs>>): Prisma__AiSessionClient<$Result.GetResult<Prisma.$AiSessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AiSession that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AiSessionFindUniqueOrThrowArgs} args - Arguments to find a AiSession
     * @example
     * // Get one AiSession
     * const aiSession = await prisma.aiSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AiSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, AiSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AiSessionClient<$Result.GetResult<Prisma.$AiSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AiSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiSessionFindFirstArgs} args - Arguments to find a AiSession
     * @example
     * // Get one AiSession
     * const aiSession = await prisma.aiSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AiSessionFindFirstArgs>(args?: SelectSubset<T, AiSessionFindFirstArgs<ExtArgs>>): Prisma__AiSessionClient<$Result.GetResult<Prisma.$AiSessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AiSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiSessionFindFirstOrThrowArgs} args - Arguments to find a AiSession
     * @example
     * // Get one AiSession
     * const aiSession = await prisma.aiSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AiSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, AiSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__AiSessionClient<$Result.GetResult<Prisma.$AiSessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AiSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AiSessions
     * const aiSessions = await prisma.aiSession.findMany()
     * 
     * // Get first 10 AiSessions
     * const aiSessions = await prisma.aiSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const aiSessionWithIdOnly = await prisma.aiSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AiSessionFindManyArgs>(args?: SelectSubset<T, AiSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AiSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AiSession.
     * @param {AiSessionCreateArgs} args - Arguments to create a AiSession.
     * @example
     * // Create one AiSession
     * const AiSession = await prisma.aiSession.create({
     *   data: {
     *     // ... data to create a AiSession
     *   }
     * })
     * 
     */
    create<T extends AiSessionCreateArgs>(args: SelectSubset<T, AiSessionCreateArgs<ExtArgs>>): Prisma__AiSessionClient<$Result.GetResult<Prisma.$AiSessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AiSessions.
     * @param {AiSessionCreateManyArgs} args - Arguments to create many AiSessions.
     * @example
     * // Create many AiSessions
     * const aiSession = await prisma.aiSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AiSessionCreateManyArgs>(args?: SelectSubset<T, AiSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AiSessions and returns the data saved in the database.
     * @param {AiSessionCreateManyAndReturnArgs} args - Arguments to create many AiSessions.
     * @example
     * // Create many AiSessions
     * const aiSession = await prisma.aiSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AiSessions and only return the `id`
     * const aiSessionWithIdOnly = await prisma.aiSession.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AiSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, AiSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AiSessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AiSession.
     * @param {AiSessionDeleteArgs} args - Arguments to delete one AiSession.
     * @example
     * // Delete one AiSession
     * const AiSession = await prisma.aiSession.delete({
     *   where: {
     *     // ... filter to delete one AiSession
     *   }
     * })
     * 
     */
    delete<T extends AiSessionDeleteArgs>(args: SelectSubset<T, AiSessionDeleteArgs<ExtArgs>>): Prisma__AiSessionClient<$Result.GetResult<Prisma.$AiSessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AiSession.
     * @param {AiSessionUpdateArgs} args - Arguments to update one AiSession.
     * @example
     * // Update one AiSession
     * const aiSession = await prisma.aiSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AiSessionUpdateArgs>(args: SelectSubset<T, AiSessionUpdateArgs<ExtArgs>>): Prisma__AiSessionClient<$Result.GetResult<Prisma.$AiSessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AiSessions.
     * @param {AiSessionDeleteManyArgs} args - Arguments to filter AiSessions to delete.
     * @example
     * // Delete a few AiSessions
     * const { count } = await prisma.aiSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AiSessionDeleteManyArgs>(args?: SelectSubset<T, AiSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AiSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AiSessions
     * const aiSession = await prisma.aiSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AiSessionUpdateManyArgs>(args: SelectSubset<T, AiSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AiSessions and returns the data updated in the database.
     * @param {AiSessionUpdateManyAndReturnArgs} args - Arguments to update many AiSessions.
     * @example
     * // Update many AiSessions
     * const aiSession = await prisma.aiSession.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AiSessions and only return the `id`
     * const aiSessionWithIdOnly = await prisma.aiSession.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AiSessionUpdateManyAndReturnArgs>(args: SelectSubset<T, AiSessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AiSessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AiSession.
     * @param {AiSessionUpsertArgs} args - Arguments to update or create a AiSession.
     * @example
     * // Update or create a AiSession
     * const aiSession = await prisma.aiSession.upsert({
     *   create: {
     *     // ... data to create a AiSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AiSession we want to update
     *   }
     * })
     */
    upsert<T extends AiSessionUpsertArgs>(args: SelectSubset<T, AiSessionUpsertArgs<ExtArgs>>): Prisma__AiSessionClient<$Result.GetResult<Prisma.$AiSessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AiSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiSessionCountArgs} args - Arguments to filter AiSessions to count.
     * @example
     * // Count the number of AiSessions
     * const count = await prisma.aiSession.count({
     *   where: {
     *     // ... the filter for the AiSessions we want to count
     *   }
     * })
    **/
    count<T extends AiSessionCountArgs>(
      args?: Subset<T, AiSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AiSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AiSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AiSessionAggregateArgs>(args: Subset<T, AiSessionAggregateArgs>): Prisma.PrismaPromise<GetAiSessionAggregateType<T>>

    /**
     * Group by AiSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiSessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AiSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AiSessionGroupByArgs['orderBy'] }
        : { orderBy?: AiSessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AiSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAiSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AiSession model
   */
  readonly fields: AiSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AiSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AiSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AiSession model
   */
  interface AiSessionFieldRefs {
    readonly id: FieldRef<"AiSession", 'String'>
    readonly userId: FieldRef<"AiSession", 'String'>
    readonly messages: FieldRef<"AiSession", 'Json'>
    readonly context: FieldRef<"AiSession", 'Json'>
    readonly createdAt: FieldRef<"AiSession", 'DateTime'>
    readonly updatedAt: FieldRef<"AiSession", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AiSession findUnique
   */
  export type AiSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiSession
     */
    select?: AiSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiSession
     */
    omit?: AiSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiSessionInclude<ExtArgs> | null
    /**
     * Filter, which AiSession to fetch.
     */
    where: AiSessionWhereUniqueInput
  }

  /**
   * AiSession findUniqueOrThrow
   */
  export type AiSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiSession
     */
    select?: AiSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiSession
     */
    omit?: AiSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiSessionInclude<ExtArgs> | null
    /**
     * Filter, which AiSession to fetch.
     */
    where: AiSessionWhereUniqueInput
  }

  /**
   * AiSession findFirst
   */
  export type AiSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiSession
     */
    select?: AiSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiSession
     */
    omit?: AiSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiSessionInclude<ExtArgs> | null
    /**
     * Filter, which AiSession to fetch.
     */
    where?: AiSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AiSessions to fetch.
     */
    orderBy?: AiSessionOrderByWithRelationInput | AiSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AiSessions.
     */
    cursor?: AiSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AiSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AiSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AiSessions.
     */
    distinct?: AiSessionScalarFieldEnum | AiSessionScalarFieldEnum[]
  }

  /**
   * AiSession findFirstOrThrow
   */
  export type AiSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiSession
     */
    select?: AiSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiSession
     */
    omit?: AiSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiSessionInclude<ExtArgs> | null
    /**
     * Filter, which AiSession to fetch.
     */
    where?: AiSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AiSessions to fetch.
     */
    orderBy?: AiSessionOrderByWithRelationInput | AiSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AiSessions.
     */
    cursor?: AiSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AiSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AiSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AiSessions.
     */
    distinct?: AiSessionScalarFieldEnum | AiSessionScalarFieldEnum[]
  }

  /**
   * AiSession findMany
   */
  export type AiSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiSession
     */
    select?: AiSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiSession
     */
    omit?: AiSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiSessionInclude<ExtArgs> | null
    /**
     * Filter, which AiSessions to fetch.
     */
    where?: AiSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AiSessions to fetch.
     */
    orderBy?: AiSessionOrderByWithRelationInput | AiSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AiSessions.
     */
    cursor?: AiSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AiSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AiSessions.
     */
    skip?: number
    distinct?: AiSessionScalarFieldEnum | AiSessionScalarFieldEnum[]
  }

  /**
   * AiSession create
   */
  export type AiSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiSession
     */
    select?: AiSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiSession
     */
    omit?: AiSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiSessionInclude<ExtArgs> | null
    /**
     * The data needed to create a AiSession.
     */
    data: XOR<AiSessionCreateInput, AiSessionUncheckedCreateInput>
  }

  /**
   * AiSession createMany
   */
  export type AiSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AiSessions.
     */
    data: AiSessionCreateManyInput | AiSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AiSession createManyAndReturn
   */
  export type AiSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiSession
     */
    select?: AiSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AiSession
     */
    omit?: AiSessionOmit<ExtArgs> | null
    /**
     * The data used to create many AiSessions.
     */
    data: AiSessionCreateManyInput | AiSessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiSessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AiSession update
   */
  export type AiSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiSession
     */
    select?: AiSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiSession
     */
    omit?: AiSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiSessionInclude<ExtArgs> | null
    /**
     * The data needed to update a AiSession.
     */
    data: XOR<AiSessionUpdateInput, AiSessionUncheckedUpdateInput>
    /**
     * Choose, which AiSession to update.
     */
    where: AiSessionWhereUniqueInput
  }

  /**
   * AiSession updateMany
   */
  export type AiSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AiSessions.
     */
    data: XOR<AiSessionUpdateManyMutationInput, AiSessionUncheckedUpdateManyInput>
    /**
     * Filter which AiSessions to update
     */
    where?: AiSessionWhereInput
    /**
     * Limit how many AiSessions to update.
     */
    limit?: number
  }

  /**
   * AiSession updateManyAndReturn
   */
  export type AiSessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiSession
     */
    select?: AiSessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AiSession
     */
    omit?: AiSessionOmit<ExtArgs> | null
    /**
     * The data used to update AiSessions.
     */
    data: XOR<AiSessionUpdateManyMutationInput, AiSessionUncheckedUpdateManyInput>
    /**
     * Filter which AiSessions to update
     */
    where?: AiSessionWhereInput
    /**
     * Limit how many AiSessions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiSessionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AiSession upsert
   */
  export type AiSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiSession
     */
    select?: AiSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiSession
     */
    omit?: AiSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiSessionInclude<ExtArgs> | null
    /**
     * The filter to search for the AiSession to update in case it exists.
     */
    where: AiSessionWhereUniqueInput
    /**
     * In case the AiSession found by the `where` argument doesn't exist, create a new AiSession with this data.
     */
    create: XOR<AiSessionCreateInput, AiSessionUncheckedCreateInput>
    /**
     * In case the AiSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AiSessionUpdateInput, AiSessionUncheckedUpdateInput>
  }

  /**
   * AiSession delete
   */
  export type AiSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiSession
     */
    select?: AiSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiSession
     */
    omit?: AiSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiSessionInclude<ExtArgs> | null
    /**
     * Filter which AiSession to delete.
     */
    where: AiSessionWhereUniqueInput
  }

  /**
   * AiSession deleteMany
   */
  export type AiSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AiSessions to delete
     */
    where?: AiSessionWhereInput
    /**
     * Limit how many AiSessions to delete.
     */
    limit?: number
  }

  /**
   * AiSession without action
   */
  export type AiSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiSession
     */
    select?: AiSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiSession
     */
    omit?: AiSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiSessionInclude<ExtArgs> | null
  }


  /**
   * Model Newsletter
   */

  export type AggregateNewsletter = {
    _count: NewsletterCountAggregateOutputType | null
    _min: NewsletterMinAggregateOutputType | null
    _max: NewsletterMaxAggregateOutputType | null
  }

  export type NewsletterMinAggregateOutputType = {
    id: string | null
    email: string | null
    createdAt: Date | null
  }

  export type NewsletterMaxAggregateOutputType = {
    id: string | null
    email: string | null
    createdAt: Date | null
  }

  export type NewsletterCountAggregateOutputType = {
    id: number
    email: number
    createdAt: number
    _all: number
  }


  export type NewsletterMinAggregateInputType = {
    id?: true
    email?: true
    createdAt?: true
  }

  export type NewsletterMaxAggregateInputType = {
    id?: true
    email?: true
    createdAt?: true
  }

  export type NewsletterCountAggregateInputType = {
    id?: true
    email?: true
    createdAt?: true
    _all?: true
  }

  export type NewsletterAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Newsletter to aggregate.
     */
    where?: NewsletterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Newsletters to fetch.
     */
    orderBy?: NewsletterOrderByWithRelationInput | NewsletterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NewsletterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Newsletters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Newsletters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Newsletters
    **/
    _count?: true | NewsletterCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NewsletterMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NewsletterMaxAggregateInputType
  }

  export type GetNewsletterAggregateType<T extends NewsletterAggregateArgs> = {
        [P in keyof T & keyof AggregateNewsletter]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNewsletter[P]>
      : GetScalarType<T[P], AggregateNewsletter[P]>
  }




  export type NewsletterGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NewsletterWhereInput
    orderBy?: NewsletterOrderByWithAggregationInput | NewsletterOrderByWithAggregationInput[]
    by: NewsletterScalarFieldEnum[] | NewsletterScalarFieldEnum
    having?: NewsletterScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NewsletterCountAggregateInputType | true
    _min?: NewsletterMinAggregateInputType
    _max?: NewsletterMaxAggregateInputType
  }

  export type NewsletterGroupByOutputType = {
    id: string
    email: string
    createdAt: Date
    _count: NewsletterCountAggregateOutputType | null
    _min: NewsletterMinAggregateOutputType | null
    _max: NewsletterMaxAggregateOutputType | null
  }

  type GetNewsletterGroupByPayload<T extends NewsletterGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NewsletterGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NewsletterGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NewsletterGroupByOutputType[P]>
            : GetScalarType<T[P], NewsletterGroupByOutputType[P]>
        }
      >
    >


  export type NewsletterSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["newsletter"]>

  export type NewsletterSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["newsletter"]>

  export type NewsletterSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["newsletter"]>

  export type NewsletterSelectScalar = {
    id?: boolean
    email?: boolean
    createdAt?: boolean
  }

  export type NewsletterOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "createdAt", ExtArgs["result"]["newsletter"]>

  export type $NewsletterPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Newsletter"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      createdAt: Date
    }, ExtArgs["result"]["newsletter"]>
    composites: {}
  }

  type NewsletterGetPayload<S extends boolean | null | undefined | NewsletterDefaultArgs> = $Result.GetResult<Prisma.$NewsletterPayload, S>

  type NewsletterCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<NewsletterFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NewsletterCountAggregateInputType | true
    }

  export interface NewsletterDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Newsletter'], meta: { name: 'Newsletter' } }
    /**
     * Find zero or one Newsletter that matches the filter.
     * @param {NewsletterFindUniqueArgs} args - Arguments to find a Newsletter
     * @example
     * // Get one Newsletter
     * const newsletter = await prisma.newsletter.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NewsletterFindUniqueArgs>(args: SelectSubset<T, NewsletterFindUniqueArgs<ExtArgs>>): Prisma__NewsletterClient<$Result.GetResult<Prisma.$NewsletterPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Newsletter that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {NewsletterFindUniqueOrThrowArgs} args - Arguments to find a Newsletter
     * @example
     * // Get one Newsletter
     * const newsletter = await prisma.newsletter.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NewsletterFindUniqueOrThrowArgs>(args: SelectSubset<T, NewsletterFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NewsletterClient<$Result.GetResult<Prisma.$NewsletterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Newsletter that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NewsletterFindFirstArgs} args - Arguments to find a Newsletter
     * @example
     * // Get one Newsletter
     * const newsletter = await prisma.newsletter.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NewsletterFindFirstArgs>(args?: SelectSubset<T, NewsletterFindFirstArgs<ExtArgs>>): Prisma__NewsletterClient<$Result.GetResult<Prisma.$NewsletterPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Newsletter that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NewsletterFindFirstOrThrowArgs} args - Arguments to find a Newsletter
     * @example
     * // Get one Newsletter
     * const newsletter = await prisma.newsletter.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NewsletterFindFirstOrThrowArgs>(args?: SelectSubset<T, NewsletterFindFirstOrThrowArgs<ExtArgs>>): Prisma__NewsletterClient<$Result.GetResult<Prisma.$NewsletterPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Newsletters that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NewsletterFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Newsletters
     * const newsletters = await prisma.newsletter.findMany()
     * 
     * // Get first 10 Newsletters
     * const newsletters = await prisma.newsletter.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const newsletterWithIdOnly = await prisma.newsletter.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NewsletterFindManyArgs>(args?: SelectSubset<T, NewsletterFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NewsletterPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Newsletter.
     * @param {NewsletterCreateArgs} args - Arguments to create a Newsletter.
     * @example
     * // Create one Newsletter
     * const Newsletter = await prisma.newsletter.create({
     *   data: {
     *     // ... data to create a Newsletter
     *   }
     * })
     * 
     */
    create<T extends NewsletterCreateArgs>(args: SelectSubset<T, NewsletterCreateArgs<ExtArgs>>): Prisma__NewsletterClient<$Result.GetResult<Prisma.$NewsletterPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Newsletters.
     * @param {NewsletterCreateManyArgs} args - Arguments to create many Newsletters.
     * @example
     * // Create many Newsletters
     * const newsletter = await prisma.newsletter.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NewsletterCreateManyArgs>(args?: SelectSubset<T, NewsletterCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Newsletters and returns the data saved in the database.
     * @param {NewsletterCreateManyAndReturnArgs} args - Arguments to create many Newsletters.
     * @example
     * // Create many Newsletters
     * const newsletter = await prisma.newsletter.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Newsletters and only return the `id`
     * const newsletterWithIdOnly = await prisma.newsletter.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NewsletterCreateManyAndReturnArgs>(args?: SelectSubset<T, NewsletterCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NewsletterPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Newsletter.
     * @param {NewsletterDeleteArgs} args - Arguments to delete one Newsletter.
     * @example
     * // Delete one Newsletter
     * const Newsletter = await prisma.newsletter.delete({
     *   where: {
     *     // ... filter to delete one Newsletter
     *   }
     * })
     * 
     */
    delete<T extends NewsletterDeleteArgs>(args: SelectSubset<T, NewsletterDeleteArgs<ExtArgs>>): Prisma__NewsletterClient<$Result.GetResult<Prisma.$NewsletterPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Newsletter.
     * @param {NewsletterUpdateArgs} args - Arguments to update one Newsletter.
     * @example
     * // Update one Newsletter
     * const newsletter = await prisma.newsletter.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NewsletterUpdateArgs>(args: SelectSubset<T, NewsletterUpdateArgs<ExtArgs>>): Prisma__NewsletterClient<$Result.GetResult<Prisma.$NewsletterPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Newsletters.
     * @param {NewsletterDeleteManyArgs} args - Arguments to filter Newsletters to delete.
     * @example
     * // Delete a few Newsletters
     * const { count } = await prisma.newsletter.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NewsletterDeleteManyArgs>(args?: SelectSubset<T, NewsletterDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Newsletters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NewsletterUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Newsletters
     * const newsletter = await prisma.newsletter.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NewsletterUpdateManyArgs>(args: SelectSubset<T, NewsletterUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Newsletters and returns the data updated in the database.
     * @param {NewsletterUpdateManyAndReturnArgs} args - Arguments to update many Newsletters.
     * @example
     * // Update many Newsletters
     * const newsletter = await prisma.newsletter.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Newsletters and only return the `id`
     * const newsletterWithIdOnly = await prisma.newsletter.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends NewsletterUpdateManyAndReturnArgs>(args: SelectSubset<T, NewsletterUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NewsletterPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Newsletter.
     * @param {NewsletterUpsertArgs} args - Arguments to update or create a Newsletter.
     * @example
     * // Update or create a Newsletter
     * const newsletter = await prisma.newsletter.upsert({
     *   create: {
     *     // ... data to create a Newsletter
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Newsletter we want to update
     *   }
     * })
     */
    upsert<T extends NewsletterUpsertArgs>(args: SelectSubset<T, NewsletterUpsertArgs<ExtArgs>>): Prisma__NewsletterClient<$Result.GetResult<Prisma.$NewsletterPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Newsletters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NewsletterCountArgs} args - Arguments to filter Newsletters to count.
     * @example
     * // Count the number of Newsletters
     * const count = await prisma.newsletter.count({
     *   where: {
     *     // ... the filter for the Newsletters we want to count
     *   }
     * })
    **/
    count<T extends NewsletterCountArgs>(
      args?: Subset<T, NewsletterCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NewsletterCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Newsletter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NewsletterAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NewsletterAggregateArgs>(args: Subset<T, NewsletterAggregateArgs>): Prisma.PrismaPromise<GetNewsletterAggregateType<T>>

    /**
     * Group by Newsletter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NewsletterGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NewsletterGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NewsletterGroupByArgs['orderBy'] }
        : { orderBy?: NewsletterGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NewsletterGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNewsletterGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Newsletter model
   */
  readonly fields: NewsletterFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Newsletter.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NewsletterClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Newsletter model
   */
  interface NewsletterFieldRefs {
    readonly id: FieldRef<"Newsletter", 'String'>
    readonly email: FieldRef<"Newsletter", 'String'>
    readonly createdAt: FieldRef<"Newsletter", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Newsletter findUnique
   */
  export type NewsletterFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Newsletter
     */
    select?: NewsletterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Newsletter
     */
    omit?: NewsletterOmit<ExtArgs> | null
    /**
     * Filter, which Newsletter to fetch.
     */
    where: NewsletterWhereUniqueInput
  }

  /**
   * Newsletter findUniqueOrThrow
   */
  export type NewsletterFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Newsletter
     */
    select?: NewsletterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Newsletter
     */
    omit?: NewsletterOmit<ExtArgs> | null
    /**
     * Filter, which Newsletter to fetch.
     */
    where: NewsletterWhereUniqueInput
  }

  /**
   * Newsletter findFirst
   */
  export type NewsletterFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Newsletter
     */
    select?: NewsletterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Newsletter
     */
    omit?: NewsletterOmit<ExtArgs> | null
    /**
     * Filter, which Newsletter to fetch.
     */
    where?: NewsletterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Newsletters to fetch.
     */
    orderBy?: NewsletterOrderByWithRelationInput | NewsletterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Newsletters.
     */
    cursor?: NewsletterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Newsletters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Newsletters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Newsletters.
     */
    distinct?: NewsletterScalarFieldEnum | NewsletterScalarFieldEnum[]
  }

  /**
   * Newsletter findFirstOrThrow
   */
  export type NewsletterFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Newsletter
     */
    select?: NewsletterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Newsletter
     */
    omit?: NewsletterOmit<ExtArgs> | null
    /**
     * Filter, which Newsletter to fetch.
     */
    where?: NewsletterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Newsletters to fetch.
     */
    orderBy?: NewsletterOrderByWithRelationInput | NewsletterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Newsletters.
     */
    cursor?: NewsletterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Newsletters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Newsletters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Newsletters.
     */
    distinct?: NewsletterScalarFieldEnum | NewsletterScalarFieldEnum[]
  }

  /**
   * Newsletter findMany
   */
  export type NewsletterFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Newsletter
     */
    select?: NewsletterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Newsletter
     */
    omit?: NewsletterOmit<ExtArgs> | null
    /**
     * Filter, which Newsletters to fetch.
     */
    where?: NewsletterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Newsletters to fetch.
     */
    orderBy?: NewsletterOrderByWithRelationInput | NewsletterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Newsletters.
     */
    cursor?: NewsletterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Newsletters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Newsletters.
     */
    skip?: number
    distinct?: NewsletterScalarFieldEnum | NewsletterScalarFieldEnum[]
  }

  /**
   * Newsletter create
   */
  export type NewsletterCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Newsletter
     */
    select?: NewsletterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Newsletter
     */
    omit?: NewsletterOmit<ExtArgs> | null
    /**
     * The data needed to create a Newsletter.
     */
    data: XOR<NewsletterCreateInput, NewsletterUncheckedCreateInput>
  }

  /**
   * Newsletter createMany
   */
  export type NewsletterCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Newsletters.
     */
    data: NewsletterCreateManyInput | NewsletterCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Newsletter createManyAndReturn
   */
  export type NewsletterCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Newsletter
     */
    select?: NewsletterSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Newsletter
     */
    omit?: NewsletterOmit<ExtArgs> | null
    /**
     * The data used to create many Newsletters.
     */
    data: NewsletterCreateManyInput | NewsletterCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Newsletter update
   */
  export type NewsletterUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Newsletter
     */
    select?: NewsletterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Newsletter
     */
    omit?: NewsletterOmit<ExtArgs> | null
    /**
     * The data needed to update a Newsletter.
     */
    data: XOR<NewsletterUpdateInput, NewsletterUncheckedUpdateInput>
    /**
     * Choose, which Newsletter to update.
     */
    where: NewsletterWhereUniqueInput
  }

  /**
   * Newsletter updateMany
   */
  export type NewsletterUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Newsletters.
     */
    data: XOR<NewsletterUpdateManyMutationInput, NewsletterUncheckedUpdateManyInput>
    /**
     * Filter which Newsletters to update
     */
    where?: NewsletterWhereInput
    /**
     * Limit how many Newsletters to update.
     */
    limit?: number
  }

  /**
   * Newsletter updateManyAndReturn
   */
  export type NewsletterUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Newsletter
     */
    select?: NewsletterSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Newsletter
     */
    omit?: NewsletterOmit<ExtArgs> | null
    /**
     * The data used to update Newsletters.
     */
    data: XOR<NewsletterUpdateManyMutationInput, NewsletterUncheckedUpdateManyInput>
    /**
     * Filter which Newsletters to update
     */
    where?: NewsletterWhereInput
    /**
     * Limit how many Newsletters to update.
     */
    limit?: number
  }

  /**
   * Newsletter upsert
   */
  export type NewsletterUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Newsletter
     */
    select?: NewsletterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Newsletter
     */
    omit?: NewsletterOmit<ExtArgs> | null
    /**
     * The filter to search for the Newsletter to update in case it exists.
     */
    where: NewsletterWhereUniqueInput
    /**
     * In case the Newsletter found by the `where` argument doesn't exist, create a new Newsletter with this data.
     */
    create: XOR<NewsletterCreateInput, NewsletterUncheckedCreateInput>
    /**
     * In case the Newsletter was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NewsletterUpdateInput, NewsletterUncheckedUpdateInput>
  }

  /**
   * Newsletter delete
   */
  export type NewsletterDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Newsletter
     */
    select?: NewsletterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Newsletter
     */
    omit?: NewsletterOmit<ExtArgs> | null
    /**
     * Filter which Newsletter to delete.
     */
    where: NewsletterWhereUniqueInput
  }

  /**
   * Newsletter deleteMany
   */
  export type NewsletterDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Newsletters to delete
     */
    where?: NewsletterWhereInput
    /**
     * Limit how many Newsletters to delete.
     */
    limit?: number
  }

  /**
   * Newsletter without action
   */
  export type NewsletterDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Newsletter
     */
    select?: NewsletterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Newsletter
     */
    omit?: NewsletterOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const OnboardingDataScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    responses: 'responses',
    completed: 'completed',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OnboardingDataScalarFieldEnum = (typeof OnboardingDataScalarFieldEnum)[keyof typeof OnboardingDataScalarFieldEnum]


  export const AiSessionScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    messages: 'messages',
    context: 'context',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AiSessionScalarFieldEnum = (typeof AiSessionScalarFieldEnum)[keyof typeof AiSessionScalarFieldEnum]


  export const NewsletterScalarFieldEnum: {
    id: 'id',
    email: 'email',
    createdAt: 'createdAt'
  };

  export type NewsletterScalarFieldEnum = (typeof NewsletterScalarFieldEnum)[keyof typeof NewsletterScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    onboarding?: XOR<OnboardingDataNullableScalarRelationFilter, OnboardingDataWhereInput> | null
    aiSessions?: AiSessionListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    onboarding?: OnboardingDataOrderByWithRelationInput
    aiSessions?: AiSessionOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    onboarding?: XOR<OnboardingDataNullableScalarRelationFilter, OnboardingDataWhereInput> | null
    aiSessions?: AiSessionListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type OnboardingDataWhereInput = {
    AND?: OnboardingDataWhereInput | OnboardingDataWhereInput[]
    OR?: OnboardingDataWhereInput[]
    NOT?: OnboardingDataWhereInput | OnboardingDataWhereInput[]
    id?: StringFilter<"OnboardingData"> | string
    userId?: StringFilter<"OnboardingData"> | string
    responses?: JsonFilter<"OnboardingData">
    completed?: BoolFilter<"OnboardingData"> | boolean
    createdAt?: DateTimeFilter<"OnboardingData"> | Date | string
    updatedAt?: DateTimeFilter<"OnboardingData"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type OnboardingDataOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    responses?: SortOrder
    completed?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type OnboardingDataWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: OnboardingDataWhereInput | OnboardingDataWhereInput[]
    OR?: OnboardingDataWhereInput[]
    NOT?: OnboardingDataWhereInput | OnboardingDataWhereInput[]
    responses?: JsonFilter<"OnboardingData">
    completed?: BoolFilter<"OnboardingData"> | boolean
    createdAt?: DateTimeFilter<"OnboardingData"> | Date | string
    updatedAt?: DateTimeFilter<"OnboardingData"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId">

  export type OnboardingDataOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    responses?: SortOrder
    completed?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OnboardingDataCountOrderByAggregateInput
    _max?: OnboardingDataMaxOrderByAggregateInput
    _min?: OnboardingDataMinOrderByAggregateInput
  }

  export type OnboardingDataScalarWhereWithAggregatesInput = {
    AND?: OnboardingDataScalarWhereWithAggregatesInput | OnboardingDataScalarWhereWithAggregatesInput[]
    OR?: OnboardingDataScalarWhereWithAggregatesInput[]
    NOT?: OnboardingDataScalarWhereWithAggregatesInput | OnboardingDataScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OnboardingData"> | string
    userId?: StringWithAggregatesFilter<"OnboardingData"> | string
    responses?: JsonWithAggregatesFilter<"OnboardingData">
    completed?: BoolWithAggregatesFilter<"OnboardingData"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"OnboardingData"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"OnboardingData"> | Date | string
  }

  export type AiSessionWhereInput = {
    AND?: AiSessionWhereInput | AiSessionWhereInput[]
    OR?: AiSessionWhereInput[]
    NOT?: AiSessionWhereInput | AiSessionWhereInput[]
    id?: StringFilter<"AiSession"> | string
    userId?: StringFilter<"AiSession"> | string
    messages?: JsonFilter<"AiSession">
    context?: JsonNullableFilter<"AiSession">
    createdAt?: DateTimeFilter<"AiSession"> | Date | string
    updatedAt?: DateTimeFilter<"AiSession"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type AiSessionOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    messages?: SortOrder
    context?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type AiSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AiSessionWhereInput | AiSessionWhereInput[]
    OR?: AiSessionWhereInput[]
    NOT?: AiSessionWhereInput | AiSessionWhereInput[]
    userId?: StringFilter<"AiSession"> | string
    messages?: JsonFilter<"AiSession">
    context?: JsonNullableFilter<"AiSession">
    createdAt?: DateTimeFilter<"AiSession"> | Date | string
    updatedAt?: DateTimeFilter<"AiSession"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type AiSessionOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    messages?: SortOrder
    context?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AiSessionCountOrderByAggregateInput
    _max?: AiSessionMaxOrderByAggregateInput
    _min?: AiSessionMinOrderByAggregateInput
  }

  export type AiSessionScalarWhereWithAggregatesInput = {
    AND?: AiSessionScalarWhereWithAggregatesInput | AiSessionScalarWhereWithAggregatesInput[]
    OR?: AiSessionScalarWhereWithAggregatesInput[]
    NOT?: AiSessionScalarWhereWithAggregatesInput | AiSessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AiSession"> | string
    userId?: StringWithAggregatesFilter<"AiSession"> | string
    messages?: JsonWithAggregatesFilter<"AiSession">
    context?: JsonNullableWithAggregatesFilter<"AiSession">
    createdAt?: DateTimeWithAggregatesFilter<"AiSession"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AiSession"> | Date | string
  }

  export type NewsletterWhereInput = {
    AND?: NewsletterWhereInput | NewsletterWhereInput[]
    OR?: NewsletterWhereInput[]
    NOT?: NewsletterWhereInput | NewsletterWhereInput[]
    id?: StringFilter<"Newsletter"> | string
    email?: StringFilter<"Newsletter"> | string
    createdAt?: DateTimeFilter<"Newsletter"> | Date | string
  }

  export type NewsletterOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
  }

  export type NewsletterWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: NewsletterWhereInput | NewsletterWhereInput[]
    OR?: NewsletterWhereInput[]
    NOT?: NewsletterWhereInput | NewsletterWhereInput[]
    createdAt?: DateTimeFilter<"Newsletter"> | Date | string
  }, "id" | "email">

  export type NewsletterOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
    _count?: NewsletterCountOrderByAggregateInput
    _max?: NewsletterMaxOrderByAggregateInput
    _min?: NewsletterMinOrderByAggregateInput
  }

  export type NewsletterScalarWhereWithAggregatesInput = {
    AND?: NewsletterScalarWhereWithAggregatesInput | NewsletterScalarWhereWithAggregatesInput[]
    OR?: NewsletterScalarWhereWithAggregatesInput[]
    NOT?: NewsletterScalarWhereWithAggregatesInput | NewsletterScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Newsletter"> | string
    email?: StringWithAggregatesFilter<"Newsletter"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Newsletter"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    onboarding?: OnboardingDataCreateNestedOneWithoutUserInput
    aiSessions?: AiSessionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    onboarding?: OnboardingDataUncheckedCreateNestedOneWithoutUserInput
    aiSessions?: AiSessionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    onboarding?: OnboardingDataUpdateOneWithoutUserNestedInput
    aiSessions?: AiSessionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    onboarding?: OnboardingDataUncheckedUpdateOneWithoutUserNestedInput
    aiSessions?: AiSessionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingDataCreateInput = {
    id?: string
    responses: JsonNullValueInput | InputJsonValue
    completed?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutOnboardingInput
  }

  export type OnboardingDataUncheckedCreateInput = {
    id?: string
    userId: string
    responses: JsonNullValueInput | InputJsonValue
    completed?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OnboardingDataUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    responses?: JsonNullValueInput | InputJsonValue
    completed?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutOnboardingNestedInput
  }

  export type OnboardingDataUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    responses?: JsonNullValueInput | InputJsonValue
    completed?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingDataCreateManyInput = {
    id?: string
    userId: string
    responses: JsonNullValueInput | InputJsonValue
    completed?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OnboardingDataUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    responses?: JsonNullValueInput | InputJsonValue
    completed?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingDataUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    responses?: JsonNullValueInput | InputJsonValue
    completed?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AiSessionCreateInput = {
    id?: string
    messages: JsonNullValueInput | InputJsonValue
    context?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutAiSessionsInput
  }

  export type AiSessionUncheckedCreateInput = {
    id?: string
    userId: string
    messages: JsonNullValueInput | InputJsonValue
    context?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AiSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    messages?: JsonNullValueInput | InputJsonValue
    context?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutAiSessionsNestedInput
  }

  export type AiSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    messages?: JsonNullValueInput | InputJsonValue
    context?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AiSessionCreateManyInput = {
    id?: string
    userId: string
    messages: JsonNullValueInput | InputJsonValue
    context?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AiSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    messages?: JsonNullValueInput | InputJsonValue
    context?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AiSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    messages?: JsonNullValueInput | InputJsonValue
    context?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NewsletterCreateInput = {
    id?: string
    email: string
    createdAt?: Date | string
  }

  export type NewsletterUncheckedCreateInput = {
    id?: string
    email: string
    createdAt?: Date | string
  }

  export type NewsletterUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NewsletterUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NewsletterCreateManyInput = {
    id?: string
    email: string
    createdAt?: Date | string
  }

  export type NewsletterUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NewsletterUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type OnboardingDataNullableScalarRelationFilter = {
    is?: OnboardingDataWhereInput | null
    isNot?: OnboardingDataWhereInput | null
  }

  export type AiSessionListRelationFilter = {
    every?: AiSessionWhereInput
    some?: AiSessionWhereInput
    none?: AiSessionWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AiSessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type OnboardingDataCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    responses?: SortOrder
    completed?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OnboardingDataMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    completed?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OnboardingDataMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    completed?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type AiSessionCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    messages?: SortOrder
    context?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AiSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AiSessionMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type NewsletterCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
  }

  export type NewsletterMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
  }

  export type NewsletterMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
  }

  export type OnboardingDataCreateNestedOneWithoutUserInput = {
    create?: XOR<OnboardingDataCreateWithoutUserInput, OnboardingDataUncheckedCreateWithoutUserInput>
    connectOrCreate?: OnboardingDataCreateOrConnectWithoutUserInput
    connect?: OnboardingDataWhereUniqueInput
  }

  export type AiSessionCreateNestedManyWithoutUserInput = {
    create?: XOR<AiSessionCreateWithoutUserInput, AiSessionUncheckedCreateWithoutUserInput> | AiSessionCreateWithoutUserInput[] | AiSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AiSessionCreateOrConnectWithoutUserInput | AiSessionCreateOrConnectWithoutUserInput[]
    createMany?: AiSessionCreateManyUserInputEnvelope
    connect?: AiSessionWhereUniqueInput | AiSessionWhereUniqueInput[]
  }

  export type OnboardingDataUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<OnboardingDataCreateWithoutUserInput, OnboardingDataUncheckedCreateWithoutUserInput>
    connectOrCreate?: OnboardingDataCreateOrConnectWithoutUserInput
    connect?: OnboardingDataWhereUniqueInput
  }

  export type AiSessionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AiSessionCreateWithoutUserInput, AiSessionUncheckedCreateWithoutUserInput> | AiSessionCreateWithoutUserInput[] | AiSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AiSessionCreateOrConnectWithoutUserInput | AiSessionCreateOrConnectWithoutUserInput[]
    createMany?: AiSessionCreateManyUserInputEnvelope
    connect?: AiSessionWhereUniqueInput | AiSessionWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type OnboardingDataUpdateOneWithoutUserNestedInput = {
    create?: XOR<OnboardingDataCreateWithoutUserInput, OnboardingDataUncheckedCreateWithoutUserInput>
    connectOrCreate?: OnboardingDataCreateOrConnectWithoutUserInput
    upsert?: OnboardingDataUpsertWithoutUserInput
    disconnect?: OnboardingDataWhereInput | boolean
    delete?: OnboardingDataWhereInput | boolean
    connect?: OnboardingDataWhereUniqueInput
    update?: XOR<XOR<OnboardingDataUpdateToOneWithWhereWithoutUserInput, OnboardingDataUpdateWithoutUserInput>, OnboardingDataUncheckedUpdateWithoutUserInput>
  }

  export type AiSessionUpdateManyWithoutUserNestedInput = {
    create?: XOR<AiSessionCreateWithoutUserInput, AiSessionUncheckedCreateWithoutUserInput> | AiSessionCreateWithoutUserInput[] | AiSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AiSessionCreateOrConnectWithoutUserInput | AiSessionCreateOrConnectWithoutUserInput[]
    upsert?: AiSessionUpsertWithWhereUniqueWithoutUserInput | AiSessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AiSessionCreateManyUserInputEnvelope
    set?: AiSessionWhereUniqueInput | AiSessionWhereUniqueInput[]
    disconnect?: AiSessionWhereUniqueInput | AiSessionWhereUniqueInput[]
    delete?: AiSessionWhereUniqueInput | AiSessionWhereUniqueInput[]
    connect?: AiSessionWhereUniqueInput | AiSessionWhereUniqueInput[]
    update?: AiSessionUpdateWithWhereUniqueWithoutUserInput | AiSessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AiSessionUpdateManyWithWhereWithoutUserInput | AiSessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AiSessionScalarWhereInput | AiSessionScalarWhereInput[]
  }

  export type OnboardingDataUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<OnboardingDataCreateWithoutUserInput, OnboardingDataUncheckedCreateWithoutUserInput>
    connectOrCreate?: OnboardingDataCreateOrConnectWithoutUserInput
    upsert?: OnboardingDataUpsertWithoutUserInput
    disconnect?: OnboardingDataWhereInput | boolean
    delete?: OnboardingDataWhereInput | boolean
    connect?: OnboardingDataWhereUniqueInput
    update?: XOR<XOR<OnboardingDataUpdateToOneWithWhereWithoutUserInput, OnboardingDataUpdateWithoutUserInput>, OnboardingDataUncheckedUpdateWithoutUserInput>
  }

  export type AiSessionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AiSessionCreateWithoutUserInput, AiSessionUncheckedCreateWithoutUserInput> | AiSessionCreateWithoutUserInput[] | AiSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AiSessionCreateOrConnectWithoutUserInput | AiSessionCreateOrConnectWithoutUserInput[]
    upsert?: AiSessionUpsertWithWhereUniqueWithoutUserInput | AiSessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AiSessionCreateManyUserInputEnvelope
    set?: AiSessionWhereUniqueInput | AiSessionWhereUniqueInput[]
    disconnect?: AiSessionWhereUniqueInput | AiSessionWhereUniqueInput[]
    delete?: AiSessionWhereUniqueInput | AiSessionWhereUniqueInput[]
    connect?: AiSessionWhereUniqueInput | AiSessionWhereUniqueInput[]
    update?: AiSessionUpdateWithWhereUniqueWithoutUserInput | AiSessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AiSessionUpdateManyWithWhereWithoutUserInput | AiSessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AiSessionScalarWhereInput | AiSessionScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutOnboardingInput = {
    create?: XOR<UserCreateWithoutOnboardingInput, UserUncheckedCreateWithoutOnboardingInput>
    connectOrCreate?: UserCreateOrConnectWithoutOnboardingInput
    connect?: UserWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UserUpdateOneRequiredWithoutOnboardingNestedInput = {
    create?: XOR<UserCreateWithoutOnboardingInput, UserUncheckedCreateWithoutOnboardingInput>
    connectOrCreate?: UserCreateOrConnectWithoutOnboardingInput
    upsert?: UserUpsertWithoutOnboardingInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutOnboardingInput, UserUpdateWithoutOnboardingInput>, UserUncheckedUpdateWithoutOnboardingInput>
  }

  export type UserCreateNestedOneWithoutAiSessionsInput = {
    create?: XOR<UserCreateWithoutAiSessionsInput, UserUncheckedCreateWithoutAiSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAiSessionsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutAiSessionsNestedInput = {
    create?: XOR<UserCreateWithoutAiSessionsInput, UserUncheckedCreateWithoutAiSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAiSessionsInput
    upsert?: UserUpsertWithoutAiSessionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAiSessionsInput, UserUpdateWithoutAiSessionsInput>, UserUncheckedUpdateWithoutAiSessionsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type OnboardingDataCreateWithoutUserInput = {
    id?: string
    responses: JsonNullValueInput | InputJsonValue
    completed?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OnboardingDataUncheckedCreateWithoutUserInput = {
    id?: string
    responses: JsonNullValueInput | InputJsonValue
    completed?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OnboardingDataCreateOrConnectWithoutUserInput = {
    where: OnboardingDataWhereUniqueInput
    create: XOR<OnboardingDataCreateWithoutUserInput, OnboardingDataUncheckedCreateWithoutUserInput>
  }

  export type AiSessionCreateWithoutUserInput = {
    id?: string
    messages: JsonNullValueInput | InputJsonValue
    context?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AiSessionUncheckedCreateWithoutUserInput = {
    id?: string
    messages: JsonNullValueInput | InputJsonValue
    context?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AiSessionCreateOrConnectWithoutUserInput = {
    where: AiSessionWhereUniqueInput
    create: XOR<AiSessionCreateWithoutUserInput, AiSessionUncheckedCreateWithoutUserInput>
  }

  export type AiSessionCreateManyUserInputEnvelope = {
    data: AiSessionCreateManyUserInput | AiSessionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type OnboardingDataUpsertWithoutUserInput = {
    update: XOR<OnboardingDataUpdateWithoutUserInput, OnboardingDataUncheckedUpdateWithoutUserInput>
    create: XOR<OnboardingDataCreateWithoutUserInput, OnboardingDataUncheckedCreateWithoutUserInput>
    where?: OnboardingDataWhereInput
  }

  export type OnboardingDataUpdateToOneWithWhereWithoutUserInput = {
    where?: OnboardingDataWhereInput
    data: XOR<OnboardingDataUpdateWithoutUserInput, OnboardingDataUncheckedUpdateWithoutUserInput>
  }

  export type OnboardingDataUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    responses?: JsonNullValueInput | InputJsonValue
    completed?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingDataUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    responses?: JsonNullValueInput | InputJsonValue
    completed?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AiSessionUpsertWithWhereUniqueWithoutUserInput = {
    where: AiSessionWhereUniqueInput
    update: XOR<AiSessionUpdateWithoutUserInput, AiSessionUncheckedUpdateWithoutUserInput>
    create: XOR<AiSessionCreateWithoutUserInput, AiSessionUncheckedCreateWithoutUserInput>
  }

  export type AiSessionUpdateWithWhereUniqueWithoutUserInput = {
    where: AiSessionWhereUniqueInput
    data: XOR<AiSessionUpdateWithoutUserInput, AiSessionUncheckedUpdateWithoutUserInput>
  }

  export type AiSessionUpdateManyWithWhereWithoutUserInput = {
    where: AiSessionScalarWhereInput
    data: XOR<AiSessionUpdateManyMutationInput, AiSessionUncheckedUpdateManyWithoutUserInput>
  }

  export type AiSessionScalarWhereInput = {
    AND?: AiSessionScalarWhereInput | AiSessionScalarWhereInput[]
    OR?: AiSessionScalarWhereInput[]
    NOT?: AiSessionScalarWhereInput | AiSessionScalarWhereInput[]
    id?: StringFilter<"AiSession"> | string
    userId?: StringFilter<"AiSession"> | string
    messages?: JsonFilter<"AiSession">
    context?: JsonNullableFilter<"AiSession">
    createdAt?: DateTimeFilter<"AiSession"> | Date | string
    updatedAt?: DateTimeFilter<"AiSession"> | Date | string
  }

  export type UserCreateWithoutOnboardingInput = {
    id?: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    aiSessions?: AiSessionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutOnboardingInput = {
    id?: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    aiSessions?: AiSessionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutOnboardingInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOnboardingInput, UserUncheckedCreateWithoutOnboardingInput>
  }

  export type UserUpsertWithoutOnboardingInput = {
    update: XOR<UserUpdateWithoutOnboardingInput, UserUncheckedUpdateWithoutOnboardingInput>
    create: XOR<UserCreateWithoutOnboardingInput, UserUncheckedCreateWithoutOnboardingInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutOnboardingInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutOnboardingInput, UserUncheckedUpdateWithoutOnboardingInput>
  }

  export type UserUpdateWithoutOnboardingInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aiSessions?: AiSessionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutOnboardingInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aiSessions?: AiSessionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutAiSessionsInput = {
    id?: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    onboarding?: OnboardingDataCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutAiSessionsInput = {
    id?: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    onboarding?: OnboardingDataUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutAiSessionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAiSessionsInput, UserUncheckedCreateWithoutAiSessionsInput>
  }

  export type UserUpsertWithoutAiSessionsInput = {
    update: XOR<UserUpdateWithoutAiSessionsInput, UserUncheckedUpdateWithoutAiSessionsInput>
    create: XOR<UserCreateWithoutAiSessionsInput, UserUncheckedCreateWithoutAiSessionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAiSessionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAiSessionsInput, UserUncheckedUpdateWithoutAiSessionsInput>
  }

  export type UserUpdateWithoutAiSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    onboarding?: OnboardingDataUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAiSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    onboarding?: OnboardingDataUncheckedUpdateOneWithoutUserNestedInput
  }

  export type AiSessionCreateManyUserInput = {
    id?: string
    messages: JsonNullValueInput | InputJsonValue
    context?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AiSessionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    messages?: JsonNullValueInput | InputJsonValue
    context?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AiSessionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    messages?: JsonNullValueInput | InputJsonValue
    context?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AiSessionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    messages?: JsonNullValueInput | InputJsonValue
    context?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}