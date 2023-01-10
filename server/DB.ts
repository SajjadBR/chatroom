import {
   Sequelize, DataTypes, Model, ForeignKey, InferAttributes, InferCreationAttributes, CreationOptional,
   HasManyGetAssociationsMixin, HasManyCreateAssociationMixin,  HasManyRemoveAssociationMixin,
   BelongsToManyCreateAssociationMixin, BelongsToManyRemoveAssociationMixin, BelongsToManyGetAssociationsMixin,
   BelongsToManyAddAssociationMixin,
 } from 'sequelize';
import {hashSync} from 'bcrypt'
// require('./sample')

export const sequelize = new Sequelize("rex","root","",{
  host: "localhost",
  dialect: "mysql",
  logging: false
});


export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>
  declare username: string
  declare email: CreationOptional<string>
  declare name: string
  declare password: string
  declare profile: CreationOptional<string>
  declare header: CreationOptional<string>

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  
  declare removeRefreshToken: HasManyRemoveAssociationMixin<RefreshToken, number>
  declare createRefreshToken: HasManyCreateAssociationMixin<RefreshToken>
  declare getRefreshTokens: HasManyGetAssociationsMixin<RefreshToken>;

  
  declare createChat: BelongsToManyCreateAssociationMixin<Chat>;
  declare getChats: BelongsToManyGetAssociationsMixin<Chat>;
  declare removeChat: BelongsToManyRemoveAssociationMixin<Chat, number>;
  
  declare createMessage: HasManyCreateAssociationMixin<Message>
  declare getMessages: HasManyGetAssociationsMixin<Message>;  
}
export class RefreshToken extends Model<InferAttributes<RefreshToken>, InferCreationAttributes<RefreshToken>> {
  declare id: CreationOptional<number>;
  declare UserId: ForeignKey<User["id"]>;
  declare token: string

  declare ip:string
  declare browser:string
  declare os:string
  declare device:string

  declare createdAt: CreationOptional<Date>;
}
export class Chat extends Model<InferAttributes<Chat>, InferCreationAttributes<Chat>> {
  declare id: CreationOptional<number>

  declare createdAt: CreationOptional<Date>;
  
  declare getMessages: HasManyGetAssociationsMixin<Message>;
  declare createMessage: HasManyCreateAssociationMixin<Message>;

  declare getUsers: BelongsToManyGetAssociationsMixin<User>;
  declare removeUser: BelongsToManyRemoveAssociationMixin<User, number>;
  declare addUser: BelongsToManyAddAssociationMixin<User, number>;
}
export class Message extends Model<InferAttributes<Message>, InferCreationAttributes<Message>> {
  declare id: CreationOptional<number>
  declare UserId: ForeignKey<User['id']>
  declare ChatId: ForeignKey<Chat['id']>
  declare text: string

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}


User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  "name": {
    type: DataTypes.TEXT("tiny"),
    allowNull: false
  },
  password: {
    type: DataTypes.TEXT("tiny"),
    allowNull: false,
    set(val:string) {
        this.setDataValue("password", hashSync(val, 10));
    },
  },
  profile: {
    type: DataTypes.TEXT("tiny"),
    defaultValue: "0.webp",
    allowNull: false
  },
  header: {
    type: DataTypes.TEXT("tiny"),
    defaultValue: "0.webp",
    allowNull: false
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
}, {
  sequelize,
  modelName: "User"
});
RefreshToken.init({
  id:{
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  token:{
    type: DataTypes.STRING,
    primaryKey: true
  },

  ip: DataTypes.STRING,
  browser: DataTypes.STRING,
  os: DataTypes.STRING,
  device: DataTypes.STRING,

  createdAt: DataTypes.DATE,
},{
  sequelize,
  modelName: "RefreshToken",
  timestamps:true,
  createdAt:true,
  updatedAt:false
});
Chat.init({
  id:{
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  createdAt: DataTypes.DATE,
},{
  sequelize,
  modelName: "Chat",
  timestamps:true,
  createdAt:true,
  updatedAt:false
});
Message.init({
  id:{
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  text: {
    type: DataTypes.TEXT
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
},{
  sequelize,
  modelName: "Message"
});




User.hasMany(RefreshToken);
RefreshToken.belongsTo(User);

User.belongsToMany(Chat, {through:"UserChats",onDelete:"CASCADE"});
Chat.belongsToMany(User, {through:"UserChats"});

Chat.hasMany(Message);
User.hasMany(Message);

(async () => {
  await sequelize.sync();
})();