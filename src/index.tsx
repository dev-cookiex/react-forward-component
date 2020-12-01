import React, { ElementType, forwardRef, RefAttributes, ComponentType, ComponentClass, FunctionComponent, useCallback, useMemo, LegacyRef } from 'react'

type GetProps<E> = E extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[E]
  : E extends ComponentType<infer P> ?
    E extends forwardComponent.ForwardedComponentExoticComponent<infer E, infer P>
      ? forwardComponent.CreateProps<E, P>
      : P
  : never

type GetRef<E> = E extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[E]['ref'] extends LegacyRef<infer A>
    ? A
    : never
  : E extends ComponentClass<any>
    ? E
    : E extends FunctionComponent<any>
      ? GetProps<E> extends RefAttributes<infer A>
        ? A
        : GetProps<E> extends React.HTMLAttributes<infer El>
          ? El
          : never
      : never

type Types = keyof JSX.IntrinsicElements | ComponentType<any>

type forwardComponent =
  <E extends Types, P>(
    initial: E,
    render: forwardComponent.RenderEl<E, P>
  ) => forwardComponent.ForwardedComponentExoticComponent<E, P>

const regexp = /^_/

const forwardComponent: forwardComponent = ( initial, render ) => {
  // @ts-ignore
  return forwardRef<any, any>( ( { as, ...props }, ref ) => {

    const division = useMemo( () => {
      return Object.entries( props ).reduce( ( division, [ key, value ] ) => {
        if ( regexp.test( key ) ) division.under[key.replace( regexp, '' )] = value
        else division.direct[key] = value
        return division
      }, {
        under: {} as { [k: string]: any },
        direct: {} as any,
      } )
    }, [ props ] )

    const Component = useMemo( () => as ?? initial, [ as ] )

    const component = useCallback( ( props: any ) => {
      return <Component {...props} {...division.under} ref={ref}/>
    }, [ props, ref, division.under, Component ] )

    return render( division.direct, component )

  } ) as forwardComponent.ForwardedComponentExoticComponent<any, any>
}

namespace forwardComponent {
  export type RenderEl<E extends Types, P> = Render<GetProps<E> & P>
  export interface Render<P> {
    ( props: P, Component: ComponentType<any> ): React.ReactElement | null
  }

  type DefaultProps<A extends Types> = { as?: A } & RefAttributes<GetRef<A>>

  type UnderProps<A extends Types> = {
    [K in keyof Omit<GetProps<A>, 'ref'> as `_${string & K}`]+?: GetProps<A>[K]
  }

  type Props<A extends Types, P> = CreateProps<A, P>

  export type CreateProps<A extends Types, P> =
    & Omit<GetProps<A>, keyof P | 'as' | 'ref'>
    & P
    & DefaultProps<A>
    & UnderProps<A>
  export interface ForwardedComponentExoticComponent<E extends Types, P> {
    // @ts-ignore
    <A extends Types = E>( props: Props<A, P> ): React.ReactElement
    defaultProps?: Partial<E extends ElementType<infer P> ? P : never>
    propTypes?: React.WeakValidationMap<P>
    displayName?: string
  }
}

export default forwardComponent
