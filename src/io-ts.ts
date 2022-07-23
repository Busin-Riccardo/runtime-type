import { Type, TypeOf } from './index'
import * as D from 'io-ts/Decoder'
import * as Record from 'fp-ts/Record'
import { pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/Either'


export const toDecoder = 
  <T extends Type>(t: T): D.Decoder<unknown, TypeOf<T>> => {
    switch (t._kind) {
    case 'string':
      // @ts-expect-error works
      return D.string 
    case 'number':
      // @ts-expect-error works
      return D.number 
    case 'boolean':
      // @ts-expect-error works
      return D.boolean
    case 'nullable':
      return D.nullable(toDecoder(t.inner))
    case 'struct':
      // @ts-expect-error works
      return D.struct(
        // @ts-expect-error works
        pipe(
          t.inner as {[k: string]: Type},
          Record.map(toDecoder),
          D.struct
        )
      )
    case 'partial':
      // @ts-expect-error works
      return D.partial(
      // @ts-expect-error works
        pipe(
          t.inner as {[k: string]: Type},
          Record.map(toDecoder),
          D.struct
        )
      )
    case 'array':
      // @ts-expect-error works
      return D.array(toDecoder(t.inner))
    case 'intersect':
      return pipe(toDecoder(t.a), D.intersect(toDecoder(t.b)))
    case 'union':
      // @ts-expect-error works
      return D.union(t.inner.map(toDecoder))
    case 'record':
      // @ts-expect-error works
      return D.record(toDecoder(t.inner))
    }
  }

export const guard = <T extends Type>(t: T) => (v: any): v is TypeOf<T> => {
  return E.isRight(toDecoder(t).decode(v))
}
