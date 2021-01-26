import React, { ComponentType, forwardRef, RefAttributes } from 'react'

const forwardComponent = <P extends any, R = undefined, D extends forwardComponent.AnyElement = 'div'>(
  render: forwardComponent.Render<P>,
  defaultElement: D = 'div' as D
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

  type GetRef<E extends AnyElement> = E extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[E] extends React.DetailedHTMLProps<unknown, infer B>
      ? B
      : JSX.IntrinsicElements[E] extends React.SVGProps<infer Element>
        ? Element
        : never
    : E extends React.ComponentClass<any, any>
      ? E
      : E extends React.FunctionComponent<infer P>
        ? P extends RefAttributes<infer R>
          ? R
          : never
        : never

  type Ref<E extends AnyElement, R> = R extends undefined ? RefAttributes<GetRef<E>> : RefAttributes<R>

  export type Props<P extends AnyProps, E extends AnyElement, R> =
    Omit<GetAnyElementProp<E>, keyof StandardProp<P, E, R>> & StandardProp<P, E, R>

  export interface ExoticComponent<P extends AnyProps, R, D extends AnyElement> {
    <E extends AnyElement = D>( props: Props<P, E, R> ): JSX.Element
  }
}

export = forwardComponent
