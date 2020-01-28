# nova-npm-executable

If your [Nova][nova] extension relies on an NPM package's executable, it's a good idea to provide a fallback or default installation.

Users of your extension might already have the package installed globally or as a dependency of a given project. If so, your extension can prefer those locations automatically. However, if the user doesn't have the package installed, providing a fallback instance is a helpful way of letting them get started without having to install tools on the command line.

**nova-npm-executable** provides a helper class to make offering this functionality easier:

- Install the fallback package inside the Nova extension bundle
- Instantiate a `Process` instance constructed with options that are ideal for running the executable in the user's environment

## Installation

```
npm install --save nova-npm-executable
```

> See [Using NPM Packages in Nova Extensions](https://www.notion.so/panic/Using-NPM-Packages-in-Nova-Extensions-325de853aba647839f1dc7a8d77bbac4) for information on structuring your project and using a module bundler to include the **nova-npm-executable** API in your extension.

## Defining Extension Dependencies

In addition to your project's top-level `package.json`, your extension bundle should also include its own `package.json` file. Use this to define the package or packages whose CLI executables you wish to install as a fallback.

For example, if you are building a JSONLint extension that relies on the [`jsonlint`](https://www.npmjs.com/package/jsonlint) executable:

```shell
cd nova-jsonlint/JSONLint.novaextension
npm install --save jsonlint
```

> ⚠️ `NPMExecutable.install` will only install packages defined in `dependencies`, not from `devDependencies`.

## Usage

```javascript
const {NPMExecutable} = require( "nova-npm-executable" );
```

### Examples

Check whether the fallback dependency has been installed inside the extension bundle, and install it if not:

```javascript
class JSONLint
{
	constructor()
	{
		this.jsonlint = new NPMDependency( "jsonlint" );
		if( !this.jsonlint.isInstalled )
		{
			this.jsonlint.install()
				.catch( error =>
				{
					console.error( error );
				});
		}
```

## API

### constructor(binName)

- `{string} binName` - The name of the executable found in `node_modules/.bin`

Example:
```javascript
let jsonlint = new NPMExecutable("jsonlint");
```

### install()

Install NPM dependencies defined in the `package.json` file located inside your extension bundle.

> See [Defining Extension Dependencies](#defining-extension-dependencies) for more information.

↩️ Returns `Promise`, which resolves or rejects depending on the success of installation


### isInstalled

Whether the package has already been installed inside the extension bundle.

↩️ Returns `boolean`

### process(options)

- `{Object} processOptions`
- `{[string]} [processOptions.args]`
- `{string} [processOptions.cwd]`
- `{Object} [processOptions.env]`
- `{string|boolean} [processOptions.shell]`
- `{[string]} [processOptions.stdio]`

Helper function for instantiating `Process` object with options needed to run the module executable using `npx`.

In addition to constructing `Process` arguments as `["npx","<binName>"]`, `process()` automatically augments the user's `$PATH` to create a preferential cascade of possible executable locations:

1. Current Workspace
1. Global Installation
1. Extension Bundle

> 💡 If the user is working in a project, for example, which defines a specific version of your extension's executable, that installation will be preferred, followed by any version they may have installed globally via `npm install -g`, followed finally by your extension's fallback.

Example:

```javascript
/**
 * Write a string to the JSONLint process's STDIN. Equivalent to running
 * `echo <string> | npx jsonlint -c` on the command line.
 *
 * @param {String} string
 * @param {String} fileURI
 * @return {Promise}
 */
async lint( string, fileURI )
{
	try
	{
		let process = await this.jsonlint.process( { args: ["-c"] } );

		let output = "";
		process.onStdout( line => output += line.trimRight() );
		process.onStderr( line => output += line.trimRight() );
		process.onDidExit( status =>
		{
			let results = status === 0 ? [] : this.parseOutput( output );
			this.report( results, fileURI );
		});

		process.start();

		let writer = process.stdin.getWriter();
		writer.write( string );
		writer.close();
```

↩️ Returns `Promise`, which resolves with an pre-instantiated `Process` object.


[api]: ./docs/README.md
[jsonlint]: https://www.npmjs.com/package/jsonlint
[nova]: https://panic.com/nova
