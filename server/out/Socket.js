"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DB_1 = require("./DB");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sequelize_1 = require("sequelize");
function validateUser(token, cb) {
    jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET, cb);
}
class SocketConnection {
    socket;
    io;
    constructor(io, socket) {
        console.log("new connection");
        this.socket = socket;
        this.io = io;
        this.disconnect = this.disconnect.bind(this);
        socket.on("getStatus", this.handleGetStatus.bind(this));
        socket.on("getChats", this.handleGetChats.bind(this));
        socket.on("getChat", this.handleGetChat.bind(this));
        socket.on("searchChats", this.handleSearchChats.bind(this));
        socket.on("startChat", this.handleStartChat.bind(this));
        socket.on("deleteChat", this.handleDeleteChat.bind(this));
        socket.on("sendMessage", this.handleSendMessage.bind(this));
        socket.on("getMessages", this.handleGetMessages.bind(this));
        socket.on('disconnect', this.disconnect);
        socket.on('connect_error', (err) => {
            console.log(`connect_error due to ${err.message}`);
        });
    }
    async handleGetStatus(id, cb) {
        const sockets = await this.io.in("uid" + id).fetchSockets();
        if (sockets.length)
            return cb({ error: null, status: "online" });
        const c = await DB_1.User.findByPk(id);
        if (!c)
            return;
        console.log(c);
        cb({ error: null, status: c.lastOnline });
    }
    async handleSearchChats(text, cb) {
        const user = this.socket.data.user;
        const result = await DB_1.User.findAll({
            attributes: ["id", "username", "name"],
            where: {
                [sequelize_1.Op.and]: [
                    { id: {
                            [sequelize_1.Op.ne]: user.id
                        } },
                    {
                        [sequelize_1.Op.or]: [
                            {
                                username: {
                                    [sequelize_1.Op.substring]: text
                                }
                            },
                            {
                                name: {
                                    [sequelize_1.Op.substring]: text
                                }
                            }
                        ]
                    }
                ]
            }
        });
        cb({
            error: null,
            chats: result
        });
    }
    async handleDeleteChat(id, cb) {
        const user = this.socket.data.user;
        const chats = await user.getChats({ where: { id } });
        if (chats.length === 0)
            return cb({ error: null });
        await chats[0].destroy();
        cb({ error: null });
    }
    async handleStartChat(id, cb) {
        const user = this.socket.data.user;
        const contact = await DB_1.User.findByPk(id);
        if (!contact)
            return cb({ error: "404" });
        DB_1.Chat.create({ type: 'private', link: null, name: null }).then(async (chat) => {
            await chat.addUser(user);
            await chat.addUser(contact);
            cb({
                error: null,
                chat: {
                    id: chat.id,
                    name: contact.name,
                    username: contact.username,
                    contactId: contact.id,
                    type: "private"
                }
            });
            this.io.in("uid" + contact.id).emit("newChat", {
                id: chat.id,
                name: user.name,
                username: user.username,
                contactId: user.id,
                type: "private"
            });
        });
    }
    handleGetChat(username, cb) {
        DB_1.User.findOne({
            where: { username },
            attributes: ["id", "name", "username"]
        }).then(user => {
            if (!user)
                return cb({ error: "404", chat: null });
            const chat = {
                id: 0,
                name: user.name,
                username: user.username,
                type: "private",
                contactId: user.id
            };
            cb({
                error: null,
                chat: chat
            });
        });
    }
    async handleGetChats(cb) {
        const user = this.socket.data.user;
        const chats = await user.getChats({
            include: [{
                    model: DB_1.User,
                    where: { id: { [sequelize_1.Op.ne]: user.id } },
                    attributes: ["id", "name", "username"],
                    through: {
                        attributes: []
                    }
                }],
        });
        const result = chats.map(c => {
            const u = c.Users[0];
            return { id: c.id, name: u.name, username: u.username, contactId: u.id, type: "private", };
        });
        cb({
            error: null,
            chats: result
        });
    }
    async handleGetMessages(chatId, cb) {
        if (!chatId)
            return cb({
                error: "no Id",
                messages: null
            });
        const user = this.socket.data.user;
        const chats = await user.getChats({ where: { id: chatId } });
        if (chats.length === 0)
            return cb({ error: "no chat", messages: null });
        const chat = chats[0];
        const messages = await chat.getMessages();
        cb({
            error: null,
            messages
            // messages:messages.map(message => message.toJSON())
        });
    }
    async handleSendMessage(chatId, text, cb) {
        if (!chatId)
            return cb({ error: "no id" });
        const user = this.socket.data.user;
        const chats = await user.getChats({
            include: [
                {
                    model: DB_1.User,
                    where: { id: { [sequelize_1.Op.ne]: user.id } },
                    attributes: ["id"]
                }
            ],
            where: { id: chatId }
        });
        if (chats.length === 0)
            return cb({ error: "no chat" });
        const chat = chats[0];
        console.log(chat);
        const message = await chat.createMessage({
            text,
            UserId: user.id
        });
        console.log(message.toJSON());
        this.io.in(["uid" + chat.Users[0].id, "uid" + user.id]).emit("newMessage", message.toJSON());
    }
    disconnect(reason) {
        const user = this.socket.data.user;
        user.update({ lastOnline: new Date() });
        console.log("disconnected " + reason);
    }
}
exports.default = (io) => {
    io.use((socket, next) => {
        const { token } = socket.handshake.auth;
        if (!token)
            return next(new Error("no token"));
        validateUser(token, async (err, value) => {
            if (err)
                return next(err);
            const user = await DB_1.User.findByPk(value.id);
            if (!user)
                return next(new Error("no user"));
            socket.data = { user };
            socket.join("uid" + user.id);
            return next();
        });
    });
    io.on('connection', (socket) => {
        // socket.rooms.forEach(room => console.log("\t"+room))
        new SocketConnection(io, socket);
    });
};
