import React, { ComponentType, forwardRef, RefAttributes } from 'react'

const forwardComponent = <P extends any, R = undefined, D extends forwardComponent.AnyElement = 'div'>(
  render: forwardComponent.Render<P>,
  defaultElement?: D
): forwardComponent.ExoticComponent<P, R, D> =>
  forwardRef<any, any>(
    ( { as: Component = defaultElement, ...props }, ref ) => render( Component, props, ref )
  ) as any

namespace forwardComponent {
  export type AnyProps = { [key: string]: any }

  export type Render<P extends AnyProps, R = any> =
    ( Component: AnyElement, props: AnyProps & P, ref: React.Ref<R> ) => JSX.Element

  export type AnyElement = ComponentType<any> | keyof JSX.IntrinsicElements

  type GetAnyElementProp<E extends AnyElement> =
    E extends ComponentType<infer P>
      ? P
      : E extends keyof JSX.IntrinsicElements
       ? JSX.IntrinsicElements[E]
       : {}

  type AsProp<E extends AnyElement> = { as?: E }
  type StandardProp<P, E extends AnyElement, R> = P & AsProp<E> & Ref<E, R>

  type Ref<E extends AnyElement, R> = R extends undefined ? RefAttributes<E> : RefAttributes<R>

  export type Props<P extends AnyProps, E extends AnyElement, R> =
    Omit<GetAnyElementProp<E>, keyof StandardProp<P, E, R>> & StandardProp<P, E, R>

  export interface ExoticComponent<P extends AnyProps, R, D extends AnyElement> {
    <E extends AnyElement = D>( props: Props<P, E, R> ): JSX.Element
  }
}

export = forwardComponent
