import React, { ElementType, WeakValidationMap, forwardRef, RefAttributes, ComponentType, createContext, useContext, PropsWithChildren } from 'react'

import omit from './omit'

const Context = createContext<forwardDynamicTag.Context>( { DefaultComponent: null } )

type GetProps<E> =
  E extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[E]
    : E extends ComponentType<infer P> ? P : never

type GetElement<E> =
  E extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[E]
    : E

type Types = keyof JSX.IntrinsicElements | ComponentType

const forwardDynamicTag = <E extends Types, P, T extends { [k: string]: any } = {}>(
  initial: E,
  getProps: ( props: GetProps<E> & P ) => GetProps<E> = props => props,
  RenderComponent: ComponentType<GetProps<E> & P> | null | undefined = null,
  assing: T = {} as any
) => {
  const component = forwardRef<any, any>( ( { as, ...props }, ref ) => {

    const { DefaultComponent } = useContext( Context )

    const Component = as ?? DefaultComponent ?? initial

    const defProps = getProps( props as GetProps<E> & P )

    if ( RenderComponent )
      return (
        <RenderComponent {...props}>
          <Component {...defProps} ref={ref}/>
        </RenderComponent>
      )

    return <Component
      {...defProps}
      ref={ref}/>

  } ) as any as forwardDynamicTag.DynamicTagExoticComponent<E, P>

  return Object.assign( component, assing )
}

forwardDynamicTag.onlyFilterPropKeys = <E, P>( ...keys: ( keyof GetProps<E> & P )[] ) =>
  ( props: GetProps<E> & P ) => omit( props, ...keys )

forwardDynamicTag.DefaultDynamicComponent = ( props: forwardDynamicTag.DefaultDynamicComponent ) => {
  return (
    <Context.Provider value={ { DefaultComponent: props.default } }>
      {props.children}
    </Context.Provider>
  )
}

namespace forwardDynamicTag {
  export interface DefaultDynamicComponent extends PropsWithChildren<{}> {
    default: Types
  }
  export interface Context {
    DefaultComponent?: Types | null
  }
  export interface DynamicTagExoticComponent<E extends Types, P> {
    <A extends Types = E>(
      props: ( GetProps<A> ) & P & { as?: A, ref?: RefAttributes<GetElement<A>> }
    ): React.ReactElement
    defaultProps?: Partial<E extends ElementType<infer P> ? P : never>
    propTypes?: WeakValidationMap<P>
    displayName?: string
  }
}

export default forwardDynamicTag
