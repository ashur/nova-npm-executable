module.exports = {
	"env": {
		"commonjs": true,
		"es6": true,
		"nova/nova": true,
	},
	"extends": "eslint:recommended",
	"globals": {
		"Atomics": "readonly",
		"SharedArrayBuffer": "readonly",
	},
	"parserOptions": {
		"ecmaVersion": 2018
	},
	"rules": {
		"no-console": "error",
		"no-template-curly-in-string": "error",
		"require-await": "error",
	},
	"plugins": [
		"nova",
	],
};
