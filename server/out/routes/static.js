"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const DB_1 = require("../DB");
const router = express_1.default.Router(); // router for static files
const img = express_1.default.Router(); // router for images
const FPublic = path_1.default.join(__dirname, "../public");
const FImg = path_1.default.join(FPublic, "img");
router.use("/img", img);
img.get("/profile/:userId", (req, res) => {
    const id = Number.parseInt(req.params.userId);
    if (!id)
        return res.status(400).send("0");
    DB_1.User.findByPk(id, {
        attributes: ["profile"]
    }).then(value => {
        if (value)
            return res.sendFile(`${FImg}/profile/${value.profile}`);
        return res.sendStatus(404);
    });
});
img.get("/header/:userId", (req, res) => {
    const id = Number.parseInt(req.params.userId);
    if (!id)
        return res.status(400).send("0");
    DB_1.User.findByPk(id, {
        attributes: ['header']
    }).then(value => {
        if (value)
            return res.sendFile(`${FImg}/header/${value.header}`);
        return res.status(404);
    });
});
module.exports = router;
