# nova-npm-executable

If your [Nova][nova] extension relies on an NPM module's executable, it's a good idea to provide a fallback or default installation.

Users of your extension might already have the module installed globally or as a dependency of a given project. If so, your extension can prefer those locations automatically. However, if the user doesn't have the module installed, providing a fallback instance is a helpful way of letting them get started without having to install tools on the command line.

**nova-npm-executable** provides a helper class to make offering this functionality easier:

- Install the fallback module inside the Nova extension bundle
- Instantiate a `Process` instance constructed with options that are ideal for running the executable in the user's environment

## Bundling NPM Packages in Nova

> See [Using NPM Packages in Nova Extensions](https://www.notion.so/panic/Using-NPM-Packages-in-Nova-Extensions-325de853aba647839f1dc7a8d77bbac4) for information on structuring your project and using a module bundler to include **nova-npm-executable** in your extension.

## Install

```
npm install --save nova-npm-executable
```

## Usage

```javascript
const {NPMExecutable} = require( "nova-npm-executable" );
let jsonlint = new NPMExecutable( "jsonlint" );
```

## API

### constructor(binName)


### install()


### isInstalled


### process(options)



[api]: ./docs/README.md
[jsonlint]: https://www.npmjs.com/package/jsonlint
[nova]: https://panic.com/nova
