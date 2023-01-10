require('dotenv').config()
import express from 'express';
import { createServer } from 'http';
import {Server} from 'socket.io';
import socket from './Socket';
import fileUpload from 'express-fileupload';

const app = express();
const port = process.env.PORT || '3001';
configureApp()


const server = createServer(app);
const io = new Server(server,{
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
socket(io)


server.listen(port);




function configureApp() {
  app.set('port', port);

  app.use(require('morgan')('dev')); // logger
  
  app.use(fileUpload({createParentPath: true}))
  app.use(require('cors')({
    origin: "*"
  })); // cross origin resource sharing
  app.use(express.urlencoded({ extended: false })); // adds the "body" object to req
  app.use(express.json()); // accept json request
  app.use(require('cookie-parser')());
  // app.use(express.static(path.join(__dirname, 'public'))); // static resources

  app.use('/auth', require('./routes/auth'));
  app.use('/user', require('./routes/user'));
  app.use('/', require('./routes/static'));
}
