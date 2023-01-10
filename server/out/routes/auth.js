"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const DB_1 = require("../DB");
const ua_parser_js_1 = __importDefault(require("ua-parser-js"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function genAccess(user) {
    return jsonwebtoken_1.default.sign(user, process.env.TOKEN_SECRET, { expiresIn: process.env.EXPIRES_IN });
}
function genRefresh(user) {
    return jsonwebtoken_1.default.sign(user, process.env.REFRESH_SECRET);
}
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
async function tokensMiddleware(req, res, next) {
    const agent = new ua_parser_js_1.default(req.headers['user-agent']).getResult();
    const uaBr = agent.browser.name + ": " + agent.browser.version;
    const uaOs = agent.os.name + ": " + agent.os.version;
    const uaDv = agent.device.vendor ? (agent.device.vendor + ": " + agent.device.model) : ("desktop: " + agent.cpu.architecture);
    if (!req.user)
        return res.status(500).send("no user");
    const user = { id: req.user.id, username: req.user.username, email: req.user.email, name: req.user.name };
    const refreshToken = genRefresh(user);
    req.user.createRefreshToken({
        token: refreshToken,
        ip: req.ip, browser: uaBr, os: uaOs, device: uaDv
    });
    const accessToken = genAccess(user);
    res.json({ accessToken, refreshToken });
}
/*
const emailCheck = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
if(!emailCheck.test(email)) return res.status(403).send("invalid email");
*/
router.post('/uniqueUsername', async (req, res) => {
    if (!req.body.username)
        return res.status(403).send("no username");
    if (await uniqueUsername(req.body.username))
        return res.send("unique");
    res.status(400).send("username is not unique");
});
router.post('/uniqueEmail', async (req, res) => {
    if (!req.body.email)
        return res.status(403).send("no email");
    if (await uniqueEmail(req.body.email))
        return res.send("unique");
    res.status(400).send("email is not unique");
});
router.post('/token', async (req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken)
        return res.status(401).send("no token");
    const data = await DB_1.RefreshToken.findOne({
        where: {
            token: refreshToken
        }
    });
    if (!data)
        return res.status(403).send("invalid token");
    jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_SECRET, (err, value) => {
        if (err)
            return res.status(500).send(err.message);
        value = value;
        res.json({ accessToken: genAccess({ id: value.id, username: value.username, name: value.name, email: value.email }) });
    });
});
router.post('/signup', async (req, res, next) => {
    if (!req.body.username || !req.body.password)
        res.status(403).send("incorrect data");
    if (!await uniqueUsername(req.body.username))
        return res.status(400).send("username is not unique");
    // const hashedPass = await bcrypt.hash(req.body.password, 10);
    req.user = await DB_1.User.create({
        username: req.body.username,
        name: req.body.username,
        password: req.body.password,
    });
    next();
}, tokensMiddleware);
router.post('/login', async (req, res, next) => {
    let wh = {};
    if (req.body.username)
        wh = { username: req.body.username };
    else if (req.body.email)
        wh = { email: req.body.email };
    else
        return res.status(400).send("no username or email");
    if (!req.body.password)
        return res.status(400).send("no password");
    const user = await DB_1.User.findOne({
        where: wh
    });
    if (!user)
        return res.status(400).send("cannot find user");
    const result = await bcrypt_1.default.compare(req.body.password, user.password);
    if (!result)
        return res.status(400).send("wrong password");
    req.user = user;
    next();
}, tokensMiddleware);
router.delete('/logout', (req, res, next) => {
    const refreshToken = req.body.logout;
    if (refreshToken == null)
        return res.status(401).send("no token");
    DB_1.RefreshToken.destroy({
        where: {
            token: refreshToken
        }
    }).then(() => res.sendStatus(204));
});
module.exports = router;
