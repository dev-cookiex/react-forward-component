import React, { forwardRef, useCallback, useMemo } from 'react'

type GetProps<E> = E extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[E]
  : E extends React.ComponentType<infer P>
    ? P
    : never

type GetRef<E> = E extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[E]['ref'] extends React.LegacyRef<infer A>
    ? A
    : never
  : E extends React.ComponentClass<any>
    ? E
    : E extends React.FunctionComponent<any>
      ? GetProps<E> extends React.RefAttributes<infer A>
        ? A
        : GetProps<E> extends React.HTMLAttributes<infer El>
          ? El
          : never
      : never

type Types = keyof JSX.IntrinsicElements | React.ComponentType<any>

type forwardComponent =
  <E extends Types, P>(
    initial: E,
    render: forwardComponent.RenderEl<E, P>
  ) => forwardComponent.ForwardedComponentExoticComponent<E, P>

const regexp = /^_/

const FORWARD_COMPONENT_SIGNAL = Symbol( 'component-signal' )

const forwardComponent: forwardComponent = ( initial, render ) => {

  const component = forwardRef<any, any>( ( { as, ...props }, ref ) => {

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

  return Object.assign( component, { [FORWARD_COMPONENT_SIGNAL]: true } )
}

namespace forwardComponent {
  export type RenderEl<E extends Types, P> = Render<GetProps<E> & P>
  export interface Render<P> {
    ( props: P, Component: React.ComponentType<any> ): React.ReactElement | null
  }

  export type DefaultProps<A extends Types> = { as?: A } & React.RefAttributes<GetRef<A>>

  export type UnderProps<A extends Types> = {
    [K in keyof Omit<GetProps<A>, 'ref'> as `_${string & K}`]+?: GetProps<A>[K]
  }

  export type Props<A extends Types, P> = CreateProps<A, P>

  export type ToExclude<P> = keyof P | 'as' | 'ref' | keyof DefaultProps<any>

  export type CreateProps<A extends Types, P> =
    & Omit<GetProps<A>, ToExclude<P>>
    & P
    & DefaultProps<A>
    & UnderProps<A>
  export interface ForwardedComponentExoticComponent<E extends Types, P> {
    <A extends Types = E>( props: Props<A, P> ): React.ReactElement
    defaultProps?: Partial<E extends React.ElementType<infer P> ? P : never>
    propTypes?: React.WeakValidationMap<P>
    displayName?: string
  }
}

export default forwardComponent
