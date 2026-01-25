/* eslint-disable import/no-extraneous-dependencies */
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { dts } from 'rollup-plugin-dts'
import copy from 'rollup-plugin-copy'
/* eslint-enable import/no-extraneous-dependencies */

import pkg from './package.json'

export default [
  {
    input: 'src/index.ts',
    output: [
      { file: pkg.main, format: 'cjs', sourcemap: true },
      { file: pkg.module, format: 'esm', sourcemap: true },
    ],
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      typescript({ tsconfig: './tsconfig.json', noEmitOnError: true }),
      copy({
        targets: [{ src: 'src/assets/*', dest: 'dist/assets' }],
      }),
    ],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  },
  {
    input: 'dist/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [nodeResolve({ preferBuiltins: true }), dts()],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  },
]
