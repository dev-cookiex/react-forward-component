import React, { ElementType, WeakValidationMap, forwardRef, RefAttributes, ComponentType, createContext, useContext, useRef, useMemo, createRef } from 'react'

import multipleRefs from './multipleRefs'

const Context = createContext<React.MutableRefObject<any>>( createRef() )

type GetProps<E> =
  E extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[E]
    : E extends ComponentType<infer P> ? P : never

type GetElement<E> =
  E extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[E]
    : E

type Types = keyof JSX.IntrinsicElements | ComponentType

const forwardComponent = <E extends Types, P, T extends { [k: string]: any } = {}>(
  initial: E,
  getProps: ( props: GetProps<E> & P ) => GetProps<E> = props => props,
  RenderComponent: ComponentType<GetProps<E> & P> | null | undefined = null,
  assing: T = {} as any
) => {
  const component = forwardRef<any, any>( ( { as, ...props }, ref ) => {

    const internalRef = useRef( null )

    const reference = useMemo( () => {
      multipleRefs( ref, internalRef )
    }, [] )

    const Component = as ?? initial

    const defProps = getProps( props as GetProps<E> & P )

    if ( RenderComponent )
      return (
        <Context.Provider value={internalRef}>
          <RenderComponent {...props}>
            <Component {...defProps} ref={ref}/>
          </RenderComponent>
        </Context.Provider>
      )

    return (
      <Context.Provider value={internalRef}>
        <Component {...defProps} ref={reference} />
      </Context.Provider>
    )

  } ) as any as forwardComponent.ForwardedComponentExoticComponent<E, P>

  return Object.assign( component, assing )
}

forwardComponent.useForwardedComponentRef = () => useContext( Context )

namespace forwardComponent {
  export interface ForwardedComponentExoticComponent<E extends Types, P> {
    <A extends Types = E>(
      props: ( GetProps<A> ) & P & { as?: A, ref?: RefAttributes<GetElement<A>> }
    ): React.ReactElement
    defaultProps?: Partial<E extends ElementType<infer P> ? P : never>
    propTypes?: WeakValidationMap<P>
    displayName?: string
  }
}

export default forwardComponent
