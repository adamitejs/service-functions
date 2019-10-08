const adamite = require("@adamite/sdk").default;
const { DatabasePlugin, AuthPlugin } = require("@adamite/sdk");
const server = require("@adamite/relay-server").default;

class FunctionsService {
  constructor(config) {
    this.config = config;
    this.server = server({ apiUrl: "http://localhost:9000", port: 9003 }, this.config);
    this.initializeAdamite();
    this.registerCommands();
  }

  initializeAdamite() {
    adamite()
      .use(DatabasePlugin)
      .use(AuthPlugin)
      .initializeApp(this.config.functions.sdk);
  }

  registerCommands() {
    const commands = this.config.functions.root;

    const allFunctions = Object.keys(commands).map(commandName => ({
      name: commandName,
      type: commands[commandName].constructor.name,
      command: commands[commandName]
    }));

    const invokableFunctions = allFunctions.filter(fn => fn.type === "InvokableFunction");
    const runtimeFunctions = allFunctions.filter(fn => fn.type === "RuntimeFunction");

    this.handleInvokableFunctions(invokableFunctions);
    this.handleRuntimeFunctions(runtimeFunctions);
  }

  handleInvokableFunctions(functions) {
    this.server.command("functions.invoke", async (client, args, callback) => {
      const matchingFunction = functions.find(fn => fn.name === args.name);

      if (matchingFunction) {
        try {
          const returnValue = await matchingFunction.command.handler(args.args, { client, service: this });
          callback({ error: false, returnValue });
        } catch (err) {
          console.error(err);
          callback({ error: err.message });
        }
      } else {
        callback({ error: `Function ${args.name} does not exist.` });
      }
    });
  }

  handleRuntimeFunctions(functions) {
    functions.forEach(fn => fn.command.handler({ service: this }));
  }

  start() {
    this.server.start();
  }
}

module.exports = FunctionsService;
