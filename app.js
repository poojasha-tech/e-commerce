const express=require("express");
const app=express();
app.use(express.json()); // middleware

const { PrismaClient, UserType } = require('@prisma/client');
const prisma = new PrismaClient();

const port=3000;

const jwt = require("jsonwebtoken");
const secret = "mysecret";

const crypto = require('crypto');

app.get("/",(req,res)=>{
    return res.send("Hello from home page")
    //console.log("Hello from home page")
})


app.post("/register",async(req,res)=>{
    try {
        const data=req.body;
        const dataInDb=await prisma.user.findFirst({where:{username:data.username,userType:data.userType}})
        if(dataInDb){
            return res.status(409).send("username already exists!")
        }
        else{
            const newUser=await prisma.user.create({
                data:{
                    username:data.username,
                    password:hashPassword(data.password),
                    userType:data.userType
                }
            })
            // console.log(newUser)
            // return res.status(201).send("welcome to e-commerce market place")
            newUser.password=null;
            const token=jwtToken(newUser);
            console.log(token)
            return res.status(201).send({token:token})
        }
        
    } catch (error) {
        console.log(error)
        return res.status(500).send("something went wrong!")

        
    }

})








function hashPassword(password) {
    const hash = crypto.createHash('md5');
    hash.update(password + 'mysecret');
    return hash.digest('hex');
}


function jwtToken(user) {
    var token = jwt.sign({

        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
        data: user
    }, secret);
    return token;
}


// function verifyUser(token) {
//     try {
//         const payload = jwt.verify(token, secret)
//         return payload.data

//     } catch (error) {
//         console.log(error)
//         return null

//     }


// }

app.listen(port,()=>{
    console.log(`listening on ${port}`)
})
