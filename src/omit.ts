import getkeys from './getKeys'

const omit = <O, K extends keyof O>( object: O, ...args: K[] ) =>
  getkeys( object )
    .filter( key => !args.includes( key as K ) )
    .reduce( ( newProps, key ) => ( { ...newProps, [key]: object[key] } ), {} as Omit<O, K> )

export default omit
