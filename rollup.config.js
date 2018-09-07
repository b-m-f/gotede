import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.js',
	output: {
    file: 'dist/bundle.js',
		format: 'iife', 
		sourcemap: true
	},
	plugins: [
		resolve(),
		commonjs(), 
	]
};
