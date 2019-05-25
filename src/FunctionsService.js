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

    this.server.command("functions.invoke", async (client, args, callback) => {
      if (commands[args.name]) {
        try {
          const returnValue = await commands[args.name](client, args);
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

  start() {
    this.server.start();
  }
}

module.exports = FunctionsService;
