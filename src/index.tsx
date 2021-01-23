import useRefs from '@cookiex-react/use-refs'

import React, { useCallback, useMemo, useRef } from 'react'

import { createJumpProps, createRepassProps } from './tools'
type Allow = React.ComponentType<any> | keyof JSX.IntrinsicElements

type InternalProps<P> = { as?: Allow } & P

type GetComponentReference<T> =
  T extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[T]['ref'] extends React.LegacyRef<infer T>
      ? T
      : never
    : T extends React.ComponentClass<any>
      ? T
      : T extends React.FunctionComponent<infer P>
        ? P extends React.RefAttributes<infer T>
          ? T
          : never
        : never

type GetComponentProps<T> = 
  T extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[T]
    : T extends React.ComponentType<infer P>
      ? P
      : never

type AnyObject = { [K in keyof any]: any }

interface InternalForwardRef extends React.ForwardRefExoticComponent<any> {
  defaultComponent?: Allow
}

const forwardComponent = <P extends AnyObject>( render: forwardComponent.Render<P> ) => {
  const component: InternalForwardRef = React.forwardRef<any, InternalProps<P>>( ( { as, ...props }, ref ) => {
    const ToCreate = useMemo( () => as ?? component.defaultComponent ?? 'div', [ as ] )

    const repassProps = useMemo( () => createRepassProps<P>( props ), [ props ] )

    const jumpProps = useMemo( () => createJumpProps( props ), [ props ] )

    const Component = useCallback(
      ( props: any ) => <ToCreate {...props} { ...jumpProps } ref={ref}/>,
      [ jumpProps ]
    )

    return render( repassProps, Component )
  } )

  return component as forwardComponent.ForwardComponentExoticComponent<P>
}

forwardComponent.withRef = <P extends AnyObject, R = undefined>( render: forwardComponent.RenderWithRef<P, R> ) => {
  const component: InternalForwardRef = React.forwardRef<any, InternalProps<P>>( ( { as, ...props }, ref ) => {

    const reference = useRef( null )

    const references = useRefs( reference, ref )

    const ToCreate = useMemo( () => as ?? component.defaultComponent ?? 'div', [ as ] )

    const repassProps = useMemo( () => createRepassProps<P>( props ), [ props ] )

    const jumpProps = useMemo( () => createJumpProps( props ), [ props ] )

    const Component = useCallback(
      ( props: any ) => <ToCreate {...props} { ...jumpProps } ref={references}/>,
      [ jumpProps ]
    )

    return render( repassProps, Component, reference )
  } )

  return component as forwardComponent.ForwardComponentExoticComponent<P, R>
}

interface ForwardComponentProps<T extends Allow, R = undefined>
  extends React.RefAttributes<R extends undefined ? GetComponentReference<T> : R>
    { as?: T }

type RestPropertiesKeys<T extends Allow, P> =
  Exclude<
    Extract<
      keyof GetComponentProps<T>,
      keyof P | 'as'
    >,
    'key' | 'ref'
  >

type RestProperties<T extends Allow, P> = {
  [K in RestPropertiesKeys<T, P> as `_${string & K}`]?: GetComponentProps<T>[K]
}

type NormalizeComponentProps<T extends Allow, P, R = GetComponentReference<T>> =
  Omit<GetComponentProps<T>, keyof ForwardComponentProps<T, R> | keyof P>

type NormalizeNeutralProps<T extends Allow, P, R = GetComponentReference<T>> =
  Omit<P, keyof ForwardComponentProps<T, R>>

type Props<T extends Allow, P, R = undefined> =
  & ForwardComponentProps<T, R>
  & NormalizeComponentProps<T, P>
  & NormalizeNeutralProps<T, P>
  & RestProperties<T, P>
namespace forwardComponent {
  export interface ForwardComponentExoticComponent<P, R = undefined> {
    <T extends Allow = 'div'>( props: Props<T, P, R> ): JSX.Element
    defaultProps?: AnyObject
    propTypes?: React.WeakValidationMap<P>
    displayName?: string
    defaultComponent?: Allow
  }
  export interface Render<P> {
    ( props: P, Component: React.FC<any> ): JSX.Element
  }

  export interface RenderWithRef<P, R = undefined> {
    ( props: P, Component: React.FC<any>, ref: React.MutableRefObject<R extends undefined ? any : R> ): JSX.Element 
  }
}

export = forwardComponent
