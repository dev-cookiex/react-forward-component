import React, { useCallback, useMemo } from 'react'

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

interface ForwardComponentProps<T extends Allow> extends React.RefAttributes<GetComponentReference<T>> {
  as?: T
}

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

type NormalizeComponentProps<T extends Allow, P> =
  Omit<GetComponentProps<T>, keyof ForwardComponentProps<T> | keyof P>

type NormalizeNeutralProps<T extends Allow, P> = Omit<P, keyof ForwardComponentProps<T>>

type Props<T extends Allow, P> =
  & ForwardComponentProps<T>
  & NormalizeComponentProps<T, P>
  & NormalizeNeutralProps<T, P>
  & RestProperties<T, P>
namespace forwardComponent {
  export interface ForwardComponentExoticComponent<P> {
    <T extends Allow = 'div'>( props: Props<T, P> ): JSX.Element
    defaultProps?: AnyObject
    propTypes?: React.WeakValidationMap<P>
    displayName?: string
    defaultComponent?: Allow
  }
  export interface Render<P> {
    ( props: P, Component: React.FC<any> ): JSX.Element
  }
}

export = forwardComponent
