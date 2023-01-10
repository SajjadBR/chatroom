"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const bcrypt_1 = require("bcrypt");
const sequelize_1 = require("sequelize");
console.log("sample--------------------------------");
exports.sequelize = new sequelize_1.Sequelize("rex2", "root", "", {
    host: "localhost",
    dialect: "mysql"
});
class User extends sequelize_1.Model {
}
class RefreshToken extends sequelize_1.Model {
}
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        set(val) {
            this.setDataValue("password", (0, bcrypt_1.hashSync)(val, 10));
        }
    },
    header: sequelize_1.DataTypes.STRING,
    profile: sequelize_1.DataTypes.STRING,
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    modelName: "User",
    sequelize: exports.sequelize // passing the `sequelize` instance is required
});
RefreshToken.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    token: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true
    },
    ip: sequelize_1.DataTypes.TEXT("tiny"),
    browser: sequelize_1.DataTypes.TEXT("tiny"),
    os: sequelize_1.DataTypes.TEXT("tiny"),
    device: sequelize_1.DataTypes.TEXT("tiny"),
    createdAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: exports.sequelize,
    modelName: 'RefreshToken',
    timestamps: true,
    createdAt: true,
    updatedAt: false
});
// Here we associate which actually populates out pre-declared `association` static and other methods.
User.hasMany(RefreshToken);
(async () => {
    await exports.sequelize.sync({ force: true });
})();
