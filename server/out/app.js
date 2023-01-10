"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const Socket_1 = __importDefault(require("./Socket"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const app = (0, express_1.default)();
const port = process.env.PORT || '3001';
configureApp();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
(0, Socket_1.default)(io);
server.listen(port);
function configureApp() {
    app.set('port', port);
    app.use(require('morgan')('dev')); // logger
    app.use((0, express_fileupload_1.default)({ createParentPath: true }));
    app.use(require('cors')({
        origin: "*"
    })); // cross origin resource sharing
    app.use(express_1.default.urlencoded({ extended: false })); // adds the "body" object to req
    app.use(express_1.default.json()); // accept json request
    app.use(require('cookie-parser')());
    // app.use(express.static(path.join(__dirname, 'public'))); // static resources
    app.use('/auth', require('./routes/auth'));
    app.use('/user', require('./routes/user'));
    app.use('/', require('./routes/static'));
}
