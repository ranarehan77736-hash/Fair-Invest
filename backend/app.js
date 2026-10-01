// Entry point for cPanel Phusion Passenger / Node.js
// If executed directly by node (node app.js), it starts the server.
// If required by a passenger handler, it exports the Express app.
const app = require("./src/app");

if (require.main === module) {
  require("./src/server");
} else {
  module.exports = app;
}
