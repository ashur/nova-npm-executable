/** Class for managing external NPM module executables in Nova extensions */
module.exports.NPMExecutable = class NPMExecutable
{
	/**
	 * @param {string} binName - The name of the executable found in `node_modules/.bin`
	 */
	constructor( binName )
	{
		this.binName = binName;
		this.PATH = null;
	}

	/**
	 * Install NPM dependencies inside the extension bundle.
	 *
	 * @return {Promise}
	 */
	install()
	{
		let pathPackage = nova.path.join( nova.extension.path, "package.json" );
		if( !nova.fs.access( pathPackage, nova.fs.F_OK ) )
		{
			return Promise.reject( `No such file "${pathPackage}"` );
		}

		return new Promise( (resolve, reject) =>
		{
			let options = {
				args: ["npm", "install", "--only=prod"],
				cwd: nova.extension.path,
			};

			let npm = new Process( "/usr/bin/env", options );
			let errorLines = [];
			npm.onStderr( line => errorLines.push( line.trimRight() ) );
			npm.onDidExit( status =>
			{
				status === 0 ? resolve() : reject( new Error( errorLines.join( "\n" ) ) )
			});

			npm.start();
		})
	}

	/**
	 * Whether the module has been installed inside the extension bundle.
	 *
	 * NOTE: This is unrelated to whether the module has been installed globally
	 * or locally to a given project.
	 *
	 * @return {Boolean}
	 */
	get isInstalled()
	{
		let pathBin = nova.path.join( nova.extension.path, "node_modules/.bin/", this.binName );
		return nova.fs.access( pathBin, nova.fs.F_OK );
	}

	/**
	 * Helper function for instantiating Process object with options needed to
	 * run the module executable using `npx`.
	 *
	 * @param {Object} processOptions
	 * @param {[string]} [processOptions.args]
	 * @param {string} [processOptions.cwd]
	 * @param {Object} [processOptions.env]
	 * @param {string|boolean} [processOptions.shell]
	 * @param {[string]} [processOptions.stdio]
	 * @see {@link https://novadocs.panic.com/api-reference/process}
	 * @return {Promise<Process>}
	 */
	async process( { args=[], cwd, env={}, shell=true, stdio } )
	{
		let options = {
			args: ["npx", this.binName].concat( args ),
			cwd: cwd || nova.extension.path,
			env: env,
			shell: shell,
		};

		if( stdio )
		{
			options.stdio = stdio;
		}

		if( this.PATH === null )
		{
			this.PATH = await getEnv( "PATH" );
		}

		/* The current workspace path (if any) and the extension's path are
		 * added to the user's $PATH, creating a preferential cascade of
		 * possible executable locations:
		 *
		 *   Current Workspace > Global Installation > Extension Fallback
		 */
		let paths = [];
		if( nova.workspace.path )
		{
			paths.push( nova.workspace.path );
		}
		paths.push( this.PATH );
		paths.push( nova.extension.path );

		options.env.PATH = paths.join( ":" );

		return new Process( "/usr/bin/env", options );
	}
}

/**
 * Helper function for fetching variables from the user's environment
 *
 * @param {string} key
 * @return {Promise<string>}
 */
function getEnv( key )
{
	return new Promise( resolve =>
	{
		let env = new Process( "/usr/bin/env", { shell: true } );

		env.onStdout( line =>
		{
			if( line.indexOf( key ) === 0 )
			{
				resolve( line.trimRight().split( "=" )[1] );
			}
		});

		env.onDidExit( () => resolve() );

		env.start();
	});
}
