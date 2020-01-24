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
	},
	"plugins": [
		"nova",
	],
};
