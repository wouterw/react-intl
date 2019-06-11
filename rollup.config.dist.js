import * as p from 'path';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import {uglify} from 'rollup-plugin-uglify';
import typescript from 'rollup-plugin-typescript';

const isProduction = process.env.NODE_ENV === 'production';

const copyright = `/*
 * Copyright ${new Date().getFullYear()}, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
`;

export default {
  input: p.resolve('src/index.js'),
  output: {
    file: p.resolve(`dist/react-intl.${isProduction ? 'min.js' : 'js'}`),
    format: 'umd',
    name: 'ReactIntl',
    banner: copyright,
    exports: 'named',
    sourcemap: true,
    globals: {
      react: 'React',
      'prop-types': 'PropTypes',
    },
  },
  external: ['react', 'prop-types'],
  plugins: [
    replace({
      replaces: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      },
    }),
    nodeResolve(),
    typescript({
      target: 'es5',
      module: 'commonjs',
      incremental: false,
      include: ['*.js+(|x)', '**/*.js+(|x)'],
    }),
    commonjs({
      sourcemap: true,
      namedExports: {'react-is': ['isValidElementType']},
    }),
    isProduction &&
      uglify({
        warnings: false,
      }),
  ].filter(Boolean),
};
