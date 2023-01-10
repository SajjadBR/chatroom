"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const DB_1 = require("../DB");
const sharp_1 = __importDefault(require("sharp"));
const router = express_1.default.Router();
const emailCheck = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
async function uniqueUsername(username) {
    const data = await DB_1.User.findOne({
        attributes: ['id'],
        where: { username }
    });
    if (data)
        return false;
    return true;
}
async function uniqueEmail(email) {
    const data = await DB_1.User.findOne({
        attributes: ['id'],
        where: { email }
    });
    if (data)
        return false;
    return true;
}
const validateUser = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token)
        return res.status(401).send("no token");
    jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET, async (err, value) => {
        if (err)
            return res.status(403).send(err.message);
        const user = await DB_1.User.findByPk(value.id);
        if (!user)
            return res.status(403).send("no user");
        req.user = user;
        next();
    });
};
router.use(validateUser);
router.post("/", (req, res) => {
    const user = req.user;
    res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email || ""
    });
});
router.post('/sessions', (req, res) => {
    req.user?.getRefreshTokens().then(value => {
        res.json({
            err: null,
            sessions: value
        });
    });
});
router.post('/profile', async (req, res) => {
    if (!req.files)
        return res.status(400).send("no files");
    const file = (req.files["file"] instanceof Array) ? undefined : req.files["file"];
    if (!file)
        return res.status(400).send("no file");
    const img = (0, sharp_1.default)(file.data);
    try {
        const md = await img.metadata();
        res.sendStatus(201);
        img.resize(320, 320).webp()
            .toFile(`./out/public/img/profile/${req.user?.id}.webp`).then(value => {
            req.user?.update({ profile: req.user.id + ".webp" });
        }).catch(reason => {
            console.error(reason);
        });
    }
    catch (err) {
        res.status(400).send(err.message);
        console.log(err);
    }
});
router.post('/header', async (req, res) => {
    if (!req.files)
        return res.status(400).send("no files");
    const file = (req.files["file"] instanceof Array) ? undefined : req.files["file"];
    if (!file)
        return res.status(400).send("no file");
    const img = (0, sharp_1.default)(file.data);
    try {
        const md = await img.metadata();
        res.sendStatus(201);
        img.resize(1500, 500).webp()
            .toFile(`./out/public/img/header/${req.user?.id}.webp`).then(value => {
            req.user?.update({ header: req.user.id + ".webp" });
        }).catch(reason => {
            console.error(reason);
        });
    }
    catch (err) {
        res.status(400).send(err.message);
        console.log(err);
    }
});
router.post('/edit', async (req, res) => {
    const { username, email, name } = req.body;
    if (username && !await uniqueUsername(username))
        return res.status(400).send("username is not unique");
    if (email && !emailCheck.test(email))
        return res.status(400).send("invalid email");
    if (email && !await uniqueEmail(email))
        return res.status(400).send("email is not unique");
    let data = {};
    if (name)
        data.name = name;
    if (username)
        data.username = username;
    if (email)
        data.email = email;
    const result = await req.user.update(data);
    console.log(result);
    res.json({
        id: result.id,
        name: result.name,
        username: result.username,
        email: result.email || ""
    });
});
router.post('/password', async (req, res) => {
    if (!req.body.currentPassword || !req.body.newPassword)
        res.status(403).send("incorrect data");
    const result = await bcrypt_1.default.compare(req.body.currentPassword, req.user.password);
    if (!result)
        return res.status(400).send("wrong password");
    req.user?.update({
        password: req.body.newPassword
    }).then(value => {
        res.sendStatus(201);
    });
});
module.exports = router;
