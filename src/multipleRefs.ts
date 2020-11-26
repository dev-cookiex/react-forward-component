import { Ref } from 'react'

const multipleRefs = <T>( ...refs: Ref<T>[] ): Ref<T> => {
  return ( reference: T ) => {
    refs.forEach( ref => {
      if ( typeof ref === 'function' ) ref( reference )
      else if ( ref ) Object.assign( ref, { current: reference } )
    } )
  }
}

export default multipleRefs
