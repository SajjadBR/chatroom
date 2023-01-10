import { hashSync } from 'bcrypt';
import { Sequelize, DataTypes, Model, ForeignKey, InferAttributes, InferCreationAttributes, CreationOptional, HasManyGetAssociationsMixin, HasManyAddAssociationMixin, HasManyAddAssociationsMixin, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin, HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManyRemoveAssociationMixin, HasManyRemoveAssociationsMixin, HasManySetAssociationsMixin, NonAttribute, Association, ModelDefined, Optional } from 'sequelize';

console.log("sample--------------------------------");

export const sequelize = new Sequelize("rex2","root","",{
  host: "localhost",
  dialect: "mysql"
});

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare email: CreationOptional<string>;
  declare name: string;
  declare password: string;

  declare profile: CreationOptional<string>;
  declare header: CreationOptional<string>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

class RefreshToken extends Model<
  InferAttributes<RefreshToken>,
  InferCreationAttributes<RefreshToken>
> {
  declare id: CreationOptional<number>;
  declare UserId: ForeignKey<User["id"]>;
  declare token: string

  declare ip:string
  declare browser:string
  declare os:string
  declare device:string

  declare createdAt: CreationOptional<Date>;
}


User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
    },
    username: {
      type: DataTypes.STRING,
    },
    name: {
      type:  DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(val:string) {
        this.setDataValue("password", hashSync(val, 10));
      }
    },
    header: DataTypes.STRING,
    profile: DataTypes.STRING,

    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    modelName: "User",
    sequelize // passing the `sequelize` instance is required
  }
);


RefreshToken.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    token:{
      type: DataTypes.STRING,
      primaryKey: true
    },

    ip: DataTypes.TEXT("tiny"),
    browser: DataTypes.TEXT("tiny"),
    os: DataTypes.TEXT("tiny"),
    device: DataTypes.TEXT("tiny"),

    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'RefreshToken',
    timestamps: true,
    createdAt: true,
    updatedAt: false
  }
);

// Here we associate which actually populates out pre-declared `association` static and other methods.
User.hasMany(RefreshToken);

(async () => {
  await sequelize.sync({force: true});
})();