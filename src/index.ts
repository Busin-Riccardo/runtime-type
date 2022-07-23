export interface StringT {
  _kind: 'string'
}

export interface NumberT {
  _kind: 'number'
}

export interface BooleanT {
  _kind: 'boolean'
}

export interface NullableT<T extends Type> {
  _kind: 'nullable',
  inner: T
}

export interface ArrayT<T extends Type> {
  _kind: 'array',
  inner: T
}

export interface RecordT<T extends Type> {
  _kind: 'record',
  inner: T
}

export interface StructT<T extends {[k: string]: Type}> {
  _kind: 'struct',
  inner: T
  omit: <K extends keyof T>(...keys: K[]) => StructT<Omit<T, K>>
}

export interface PartialT<T extends {[k: string]: Type}> {
  _kind: 'partial',
  inner: T
  omit: <K extends keyof T>(...keys: K[]) => PartialT<Omit<T, K>>
}

export interface IntersectT<A extends Type, B extends Type> { 
  _kind: 'intersect',
  a: A
  b: B
}

export interface UnionT<T extends Type[]> {
  _kind: 'union',
  inner: T
}

export type Type = 
  | StringT 
  | NumberT 
  | BooleanT 
  | NullableT<any>
  | ArrayT<any>
  | RecordT<any>
  | StructT<any>
  | PartialT<any>
  | IntersectT<any, any>
  | UnionT<any>

export type TypeOf<T extends Type> = 
  T extends StringT ? string
  : T extends NumberT ? number
  : T extends BooleanT ? boolean
  : T extends NullableT<infer I> ?  TypeOf<I> | null
  : T extends ArrayT<infer I> ? Array<TypeOf<I>>
  : T extends RecordT<infer I> ? Record<string, TypeOf<I>>
  : T extends StructT<infer I> ? {[k in keyof I]: TypeOf<I[k]>}
  : T extends PartialT<infer I> ? {[k in keyof I]?: TypeOf<I[k]>}
  : T extends IntersectT<infer A, infer B> ? TypeOf<A> & TypeOf<B>
  : T extends UnionT<infer I> ? TypeOf<I[number]> 
  : never


export const string: StringT = {
  _kind: 'string'
}

export const number: NumberT = {
  _kind: 'number'
}

export const boolean: BooleanT = {
  _kind: 'boolean'
}

export function nullable<T extends Type>(v: T): NullableT<T> {
  return {
    _kind: 'nullable',
    inner: v
  }
}

export function array<T extends Type>(v: T): ArrayT<T> {
  return {
    _kind: 'array',
    inner: v
  }
}

export function record<T extends Type>(v: T): RecordT<T> {
  return {
    _kind: 'record',
    inner: v
  }
}

class _structT<T extends {[k: string]: Type}> implements StructT<T> {
  public _kind = 'struct' as const

  constructor (
    public inner: T
  ) {}

  public omit <K extends keyof T>(...keys: K[]): StructT<Omit<T, K>> {
    const newInner = {...this.inner}

    for (const k of keys) {
      delete newInner[k]
    }
    
    return new _structT(newInner)
  }
}

export const struct = <T extends {[k: string]: Type}>(v: T): StructT<T> => 
  new _structT(v)


class _partialT<T extends {[k: string]: Type}> implements PartialT<T> {
  public _kind = 'partial' as const

  constructor (
    public inner: T
  ) {}

  public omit <K extends keyof T>(...keys: K[]): PartialT<Omit<T, K>> {
    const newInner = {...this.inner}

    for (const k of keys) {
      delete newInner[k]
    }
    
    return new _partialT(newInner)
  }
}

export const partial = <T extends {[k: string]: Type}>(v: T): PartialT<T> => 
  new _partialT(v)

export const intersect = 
  <A extends Type>(a: A) => 
  <B extends Type>(b: B): IntersectT<A,B> => ({
      _kind: 'intersect',
      a,
      b
    })

export function union<T extends Type[]>(...v: T): UnionT<T> {
  return {
    _kind: 'union',
    inner: v
  }
}

export * from './io-ts'
