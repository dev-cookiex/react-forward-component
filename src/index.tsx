import React, { ElementType, forwardRef, RefAttributes, ComponentType } from 'react'

type GetProps<E> = E extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[E] : E extends ComponentType<infer P> ? P : never

type GetElement<E> = E extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[E] : E

type Types = keyof JSX.IntrinsicElements | ComponentType

type forwardComponent =
  <E extends Types, P>(
    initial: E,
    render: forwardComponent.RenderEl<E, P>
  ) => forwardComponent.ForwardedComponentExoticComponent<E, P>

const forwardComponent: forwardComponent = ( initial, render ) => {
  return forwardRef<any, any>( ( { as, ...props }, ref ) => {

    return render( props, as ?? initial, ref )

  } ) as forwardComponent.ForwardedComponentExoticComponent<any, any>
}

namespace forwardComponent {
  export type RenderEl<E extends Types, P> = Render<GetProps<E> & P>
  export interface Render<P> {
    ( props: P, Component: ComponentType<any>, ref: React.ForwardedRef<any> ): React.ReactElement | null
  }
  export interface ForwardedComponentExoticComponent<E extends Types, P> {
    <A extends Types = E>(
      props: ( GetProps<A> ) & P & { as?: A, ref?: RefAttributes<GetElement<A>> }
    ): React.ReactElement
    defaultProps?: Partial<E extends ElementType<infer P> ? P : never>
    propTypes?: React.WeakValidationMap<P>
    displayName?: string
  }
}

forwardComponent( 'div', ( props, Component, ref ) => {
  return <Component ref={ref} {...props}></Component>
} )

export default forwardComponent
