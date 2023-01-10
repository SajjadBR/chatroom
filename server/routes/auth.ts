import express,{Request,Response,NextFunction} from 'express';
const router = express.Router();
import {RefreshToken, User as UserModel} from '../DB';
import UAParser from 'ua-parser-js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../types';

function genAccess(user:User){
  return jwt.sign(user, process.env.TOKEN_SECRET as string, {expiresIn: process.env.EXPIRES_IN});
}
function genRefresh(user:User){
  return jwt.sign(user, process.env.REFRESH_SECRET as string);
}

async function uniqueUsername(username:string){
  const data = await UserModel.findOne({
    attributes:['id'],
    where:{username}
  })
  if(data) return false;
  return true;
}
async function uniqueEmail(email:string){
  const data = await UserModel.findOne({
    attributes:['id'],
    where:{email}
  });

  if(data) return false;
  return true;
}

async function tokensMiddleware(req:Request, res:Response, next:NextFunction){
  const agent = new UAParser(req.headers['user-agent']).getResult();
  const uaBr = agent.browser.name + ": " + agent.browser.version;
  const uaOs = agent.os.name + ": " + agent.os.version;
  const uaDv = agent.device.vendor ? (agent.device.vendor + ": " + agent.device.model) : ("desktop: " + agent.cpu.architecture);
  
  if(!req.user)return res.status(500).send("no user");

  const user:User = { id:req.user.id, username:req.user.username, email:req.user.email, name:req.user.name};

  const refreshToken = genRefresh(user);

  req.user.createRefreshToken({
    token: refreshToken,    
    ip:req.ip, browser:uaBr, os:uaOs, device:uaDv
  });

  const accessToken = genAccess(user);
  res.json({accessToken, refreshToken});
}

  /*
  const emailCheck = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if(!emailCheck.test(email)) return res.status(403).send("invalid email");
  */

router.post('/uniqueUsername', async (req, res) => {
  if(!req.body.username) return res.status(403).send("no username")
  if(await uniqueUsername(req.body.username)) return res.send("unique")
  res.status(400).send("username is not unique");
})

router.post('/uniqueEmail', async (req, res) =>{
  if(!req.body.email) return res.status(403).send("no email");
  if(await uniqueEmail(req.body.email)) return res.send("unique");
  res.status(400).send("email is not unique");
});

router.post('/token', async (req, res) => {
  const refreshToken = req.body.token as string;
  if(!refreshToken) return res.status(401).send("no token");

  const data = await RefreshToken.findOne({
    where:{
      token:refreshToken
    }
  });
  if(!data) return res.status(403).send("invalid token");
  jwt.verify(refreshToken, process.env.REFRESH_SECRET as string, (err,value) => {
    if(err) return res.status(500).send(err.message);
    value = value as User;
    res.json({accessToken: genAccess({id: value.id, username: value.username, name: value.name, email: value.email})})
  });
});

router.post('/signup', async (req, res, next) => {
  if(!req.body.username || !req.body.password) res.status(403).send("incorrect data");
  if(!await uniqueUsername(req.body.username)) return res.status(400).send("username is not unique");

  // const hashedPass = await bcrypt.hash(req.body.password, 10);
  req.user = await UserModel.create({
    username:req.body.username,
    name:req.body.username,
    password:req.body.password,
  });
  
  next();
}, tokensMiddleware);

router.post('/login', async (req, res, next) => {
  let wh = {}
  if(req.body.username) wh = {username: req.body.username};
  else if(req.body.email) wh = {email: req.body.email};
  else return res.status(400).send("no username or email");

  if(!req.body.password) return res.status(400).send("no password");

  const user = await UserModel.findOne({
    where: wh
  });
  if(!user) return res.status(400).send("cannot find user")
  const result = await bcrypt.compare(req.body.password as string, user.password);
  if(!result) return res.status(400).send("wrong password");
  req.user = user;
  next();

}, tokensMiddleware);


router.delete('/logout', (req, res, next) => {
  const refreshToken = req.body.logout
  if(refreshToken == null) return res.status(401).send("no token");

  RefreshToken.destroy({
    where:{
      token: refreshToken
    }
  }).then(() => res.sendStatus(204));
});

module.exports = router;