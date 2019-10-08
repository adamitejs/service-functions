const FunctionsService = require("./src/FunctionsService");

module.exports = function(config) {
  const service = new FunctionsService(config);
  service.start();
  return service;
};

module.exports.InvokableFunction = require("./src/InvokableFunction");
module.exports.RuntimeFunction = require("./src/RuntimeFunction");
