"use strict";
const express = require('express');
const router = express.Router();
const DB = require('../DB');
/* GET api. */
// router.get('/', function(req, res, next) {
//   res.send();
// });
router.post('/users', function (req, res, next) {
    DB.query(`INSERT INTO users (username, password, email) VALUES ('test', '1234', 'test@gmail.com')`, (err, rows, fields) => {
        if (err) {
            res.status(500);
        }
        else {
            res.status(201);
        }
        res.send();
    });
});
router.get('/users', function (req, res, next) {
    DB.query(`Select * FROM users`, (err, rows, fields) => {
        if (err) {
            res.status(500);
        }
        res.json({ users: rows });
    });
});
router.post('/message', function (req, res, next) {
    const message = req.body.message;
    const user = req.body.user;
    DB.query(`INSERT INTO messages (user, text) VALUES (${user}, '${message}')`, (err, rows, fields) => {
        if (err) {
            res.status(500);
        }
        else {
            res.status(201);
        }
        res.send();
    });
});
router.get('/message', function (req, res, next) {
    console.log(req.body);
    DB.query(`SELECT * FROM messages WHERE user = 1`, (err, rows, fields) => {
        if (err) {
            res.status(500);
        }
        res.json({ messages: rows });
    });
});
module.exports = router;
