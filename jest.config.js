const { pathsToModuleNameMapper } = require( 'ts-jest/utils' )

const { compilerOptions: { paths } } = require( './tsconfig' )

module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: pathsToModuleNameMapper( paths )
}
