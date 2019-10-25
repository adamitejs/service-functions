const FunctionsService = require("./src/FunctionsService");

module.exports = function(config, rootConfig) {
  const service = new FunctionsService(config, rootConfig);
  service.start();
  return service;
};

module.exports.InvokableFunction = require("./src/InvokableFunction");
module.exports.RuntimeFunction = require("./src/RuntimeFunction");
module.exports.ScheduledFunction = require("./src/ScheduledFunction");
