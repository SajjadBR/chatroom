# chatroom

A simple chat application.

right now there are some security vulnerabilities such as sql injection and many bugs.

currently this project contains two parts

### server

express.js + socket.io + sequelize server.

### client

react + bootstrap website

## how to start?

first, you need to change the server/DB.ts file(line 11) to match your database.
then compile the typescript code with npm run compile and run it with npm start(in server directory).
finally in the client directory run npm start to run the client app(react) in development mode.
