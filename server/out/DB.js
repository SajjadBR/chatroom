"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = exports.Chat = exports.RefreshToken = exports.User = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const bcrypt_1 = require("bcrypt");
// require('./sample')
exports.sequelize = new sequelize_1.Sequelize("rex2", "root", "", {
    host: "localhost",
    dialect: "mysql",
    logging: false
});
class User extends sequelize_1.Model {
}
exports.User = User;
class RefreshToken extends sequelize_1.Model {
}
exports.RefreshToken = RefreshToken;
class Chat extends sequelize_1.Model {
}
exports.Chat = Chat;
class Message extends sequelize_1.Model {
}
exports.Message = Message;
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    "name": {
        type: sequelize_1.DataTypes.TEXT("tiny"),
        allowNull: false
    },
    password: {
        type: sequelize_1.DataTypes.TEXT("tiny"),
        allowNull: false,
        set(val) {
            this.setDataValue("password", (0, bcrypt_1.hashSync)(val, 10));
        },
    },
    profile: {
        type: sequelize_1.DataTypes.TEXT("tiny"),
        defaultValue: "0.webp",
        allowNull: false
    },
    header: {
        type: sequelize_1.DataTypes.TEXT("tiny"),
        defaultValue: "0.webp",
        allowNull: false
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    lastOnline: sequelize_1.DataTypes.DATE
}, {
    sequelize: exports.sequelize,
    modelName: "User"
});
RefreshToken.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    token: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true
    },
    ip: sequelize_1.DataTypes.STRING,
    browser: sequelize_1.DataTypes.STRING,
    os: sequelize_1.DataTypes.STRING,
    device: sequelize_1.DataTypes.STRING,
    createdAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: exports.sequelize,
    modelName: "RefreshToken",
    timestamps: true,
    createdAt: true,
    updatedAt: false
});
Chat.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    link: {
        type: sequelize_1.DataTypes.STRING,
        unique: true
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
    },
    type: {
        type: sequelize_1.DataTypes.ENUM("private", "channel", "group"),
        allowNull: false
    },
    createdAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: exports.sequelize,
    modelName: "Chat",
    indexes: [
        { fields: ["name"] }
    ],
    timestamps: true,
    createdAt: true,
    updatedAt: false
});
Message.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    text: {
        type: sequelize_1.DataTypes.TEXT
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE
}, {
    sequelize: exports.sequelize,
    modelName: "Message"
});
User.hasMany(RefreshToken);
RefreshToken.belongsTo(User);
User.belongsToMany(Chat, { through: "UserChats", onDelete: "CASCADE" });
Chat.belongsToMany(User, { through: "UserChats" });
Chat.hasMany(Message);
User.hasMany(Message);
(async () => {
    await exports.sequelize.sync();
})();
