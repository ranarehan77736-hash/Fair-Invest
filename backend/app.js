// Entry point for cPanel Phusion Passenger / LiteSpeed / Node.js
// Always initialize the HTTP server, WebSockets, and background profit engine
const { server, app } = require("./src/server");

app.server = server;
module.exports = app;

