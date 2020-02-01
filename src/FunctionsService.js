const adamite = require("@adamite/sdk").default;
const { DatabasePlugin, AuthPlugin } = require("@adamite/sdk");
const cron = require("node-cron");
const chalk = require("chalk");

class FunctionsService {
  constructor(server, config, rootConfig) {
    this.config = config;
    this.rootConfig = rootConfig;
    this.server = server;
    // this.initializeAdamite();
    this.registerCommands();
  }

  initializeAdamite() {
    if (!this.config.sdk || Object.keys(this.config.sdk).length === 0) {
      console.warn(
        chalk.yellow(
          "Warning: The SDK configuration is missing or empty. You will not be able to access your Adamite database within functions."
        )
      );
      return;
    }

    adamite()
      .use(DatabasePlugin)
      .use(AuthPlugin)
      .initializeApp(this.config.sdk);
  }

  registerCommands() {
    const commands = this.config.root;

    const allFunctions = Object.keys(commands).map(commandName => ({
      name: commandName,
      type: commands[commandName].constructor.name,
      command: commands[commandName]
    }));

    const invokableFunctions = allFunctions.filter(fn => fn.type === "InvokableFunction");
    const runtimeFunctions = allFunctions.filter(fn => fn.type === "RuntimeFunction");
    const scheduledFunctions = allFunctions.filter(fn => fn.type === "ScheduledFunction");

    this.handleInvokableFunctions(invokableFunctions);
    this.handleRuntimeFunctions(runtimeFunctions);
    this.handleScheduledFunctions(scheduledFunctions);
  }

  handleInvokableFunctions(functions) {
    this.server.command("functions.invoke", async (client, args) => {
      const matchingFunction = functions.find(fn => fn.name === args.name);

      if (matchingFunction) {
        const returnValue = await matchingFunction.command.handler(args.args, { client, service: this });
        return returnValue;
      } else {
        throw new Error(`Function ${args.name} does not exist.`);
      }
    });
  }

  handleRuntimeFunctions(functions) {
    functions.forEach(fn => fn.command.handler({ service: this }));
  }

  handleScheduledFunctions(functions) {
    functions.forEach(fn =>
      cron.schedule(fn.command.schedule, () => {
        fn.command.handler({ service: this });
      })
    );
  }
}

module.exports = FunctionsService;
