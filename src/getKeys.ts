const getkeys = <O>( object: O ): ( keyof O )[] => Object.keys( object ) as any

export default getkeys
