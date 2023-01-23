import { Socket,Server } from 'socket.io';
import { DisconnectReason } from 'socket.io/dist/socket';
import {Chat, User as UserModel} from './DB';
import jwt from 'jsonwebtoken';
import { User } from './types';
import { Op } from 'sequelize';


function validateUser(token:string,cb:jwt.VerifyCallback) {
  jwt.verify(token, process.env.TOKEN_SECRET as string, cb);
}


class SocketConnection {
  private socket:Socket;
  private io:Server;

  constructor(io:Server, socket:Socket) {
    console.log("new connection")

    this.socket = socket;
    this.io = io;

    this.disconnect = this.disconnect.bind(this);
    socket.on("getStatus", this.handleGetStatus.bind(this))

    socket.on("getChats", this.handleGetChats.bind(this))
    socket.on("getChat", this.handleGetChat.bind(this))
    socket.on("searchChats", this.handleSearchChats.bind(this))
    socket.on("startChat", this.handleStartChat.bind(this))
    socket.on("deleteChat", this.handleDeleteChat.bind(this))
    
    socket.on("sendMessage", this.handleSendMessage.bind(this))
    socket.on("getMessages", this.handleGetMessages.bind(this))
    
    socket.on('disconnect', this.disconnect);
    socket.on('connect_error', (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  }

  async handleGetStatus(id:number,cb:((arg:any)=>void)){
    const sockets = await this.io.in("uid"+id).fetchSockets();
    if(sockets.length) return cb({error:null,status:"online"});

    const c = await UserModel.findByPk(id);
    if(!c) return;
    console.log(c);
    cb({error:null,status:c.lastOnline});
  }


  async handleSearchChats(text:string, cb:((arg:any) => void)) {
    const user:UserModel = this.socket.data.user;
    const result = await UserModel.findAll({
      attributes:["id","username","name"],
      where:{
        [Op.and]:[
          {id: {
            [Op.ne]: user.id
          }},
          {
            [Op.or]: [
              {
                username: {
                  [Op.substring]: text
                }
              },
              {
                name: {
                  [Op.substring]: text
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
    })
  }
  async handleDeleteChat(id:number, cb:((arg:any) => void)) {
    const user:UserModel = this.socket.data.user;
    
    const chats = await user.getChats({where:{id}});
    if(chats.length === 0) return cb({error:null});
    
    await chats[0].destroy();
    cb({error:null});
  }

  async handleStartChat(id:number, cb:((arg:any) => void)) {
    const user:UserModel = this.socket.data.user;
    
    const contact = await UserModel.findByPk(id);
    if(!contact) return cb({error:"404"});
    Chat.create({type:'private',link:null,name:null}).then(async chat => {

      await chat.addUser(user);
      await chat.addUser(contact);
            
      cb({
        error: null,
        chat:{
          id:chat.id,
          name:contact.name,
          username:contact.username,
          contactId:contact.id,
          type:"private"
        }
      });
      
      this.io.in("uid"+contact.id).emit("newChat", {
          id:chat.id,
          name:user.name,
          username:user.username,
          contactId:user.id,
          type:"private"
        })
    });    
  }
  handleGetChat(username:string, cb:((arg:any) => void)) {
    UserModel.findOne({
      where:{username},
      attributes: ["id","name","username"]
    }).then(user => {
      if(!user) return cb({error:"404",chat:null});

      const chat = {
        id:0,
        name:user.name,
        username:user.username,
        type:"private",
        contactId:user.id
      }

      cb({
        error:null,
        chat:chat
      })
    });
  }

  async handleGetChats(cb:((arg:any) => void)) {
    const user:UserModel = this.socket.data.user;
    const chats = await user.getChats({
      include: [{
          model:UserModel,
          where:{id:{[Op.ne]:user.id}},
          attributes: ["id", "name", "username"],
          through:{
            attributes: []
          }
      }],
    });

    
    const result = chats.map(c => {
      const u = c.Users![0];
      
      return {id:c.id,name:u.name,username:u.username,contactId:u.id,type:"private",}
    });
    
    cb({
      error: null,
      chats: result
    })
  }
  
  async handleGetMessages(chatId:number, cb:((arg:any) => void)) {
    if(!chatId) return cb({
      error: "no Id",
      messages: null
    });
    const user:UserModel = this.socket.data.user;

    const chats = await user.getChats({where:{id:chatId}});
    if(chats.length === 0) return cb({error: "no chat", messages: null});
    const chat = chats[0];
    const messages = await chat.getMessages();
    
    cb({
      error:null,
      messages
      // messages:messages.map(message => message.toJSON())
      })
  }
  
  async handleSendMessage(chatId:number, text: string, cb:((args:any) => void)) {
    if(!chatId) return cb({error:"no id"});
    const user:UserModel = this.socket.data.user;

    const chats = await user.getChats({
      include:[
        {
          model:UserModel,
          where:{id:{[Op.ne]:user.id}},
          attributes:["id"]
        }
      ],
      where:{id:chatId}
    });
    if(chats.length === 0) return cb({error:"no chat"});
    const chat = chats[0];
    console.log(chat);
    
    const message = await chat.createMessage({
      text,
      UserId:user.id
    });
    console.log(message.toJSON());
    
    this.io.in(["uid"+chat.Users![0].id]).emit("newMessage",message.toJSON())

  }
  
  disconnect(reason:DisconnectReason) {
    const user:UserModel = this.socket.data.user
    user.update({lastOnline:new Date()});
    console.log("disconnected " + reason)
  }
}



export default (io:Server ) => {
  io.use((socket, next) => {
    const {token} = socket.handshake.auth;
    
    if(!token) return next(new Error("no token"))

    validateUser(token,async (err,value) => {
      if(err) return next(err);
      const user = await UserModel.findByPk((value! as User).id);
      if(!user) return next(new Error("no user"));
      
      socket.data = {user};
      socket.join("uid"+user.id)
      return next();
    });
  })
  
  io.on('connection', (socket) => {
    // socket.rooms.forEach(room => console.log("\t"+room))
    new SocketConnection(io, socket);   
  });
};
