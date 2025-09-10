const express=require("express");
const router=express.Router();
const prisma=require("../prisma/db")
const {hashPassword,jwtToken}=require("../utilities/utilities");
const jwt=require("jsonwebtoken")



router.get("/",(req,res)=>{
    return res.send("Hello from home page")
    //console.log("Hello from home page")
})



router.post("/register",async(req,res)=>{
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
