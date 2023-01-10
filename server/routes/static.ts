import express from 'express'
import path from 'path'
import {User as UserModel} from '../DB'
const router = express.Router() // router for static files
const img = express.Router() // router for images

const FPublic = path.join(__dirname,"../public")
const FImg = path.join(FPublic,"img")

router.use("/img", img)


img.get("/profile/:userId", (req,res) => {
    const id = Number.parseInt(req.params.userId);
    if(!id) return res.status(400).send("0")

    UserModel.findByPk(id,{
        attributes: ["profile"]            
    }).then(value => {
        if(value) return res.sendFile(`${FImg}/profile/${value.profile}`)
        return res.sendStatus(404);
    })
})

img.get("/header/:userId", (req,res) => {
    const id = Number.parseInt(req.params.userId);
    if(!id) return res.status(400).send("0")

    UserModel.findByPk(id, {
        attributes: ['header']
    }).then(value =>{
        if(value) return res.sendFile(`${FImg}/header/${value.header}`)
        return res.status(404);
    })
})





module.exports = router;