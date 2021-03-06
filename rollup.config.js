import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.js',
  external: [
    'fs',
    'prompt',
    'handlebars'
  ],
	output: {
    file: 'bin/gotede.js',
		format: 'cjs', 
	},
	plugins: [
		resolve(),
		commonjs(), 
  ],
};
