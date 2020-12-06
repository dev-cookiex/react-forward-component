export const underPropRegExp = /^_/

export const underPropRegExpTest = ( [ key ]: [ string, any ] ) =>
  underPropRegExp.test( key )

export const underPropRegExpTestNegate = ( [ key ]: [ string, any ] ) =>
  !underPropRegExp.test( key )

export const underPropRegExpParse = ( [ key, value ]: [ string, any ] ) =>
  [ key.replace( underPropRegExp, '' ), value ]

export const createRepassProps = <P extends any>( props: any ): P =>
  Object.fromEntries( Object.entries( props ).filter( underPropRegExpTestNegate ) ) as P

export const createJumpProps = ( props: any ) =>
  Object.fromEntries(
    Object.entries( props ).filter( underPropRegExpTest ).map( underPropRegExpParse )
  )
