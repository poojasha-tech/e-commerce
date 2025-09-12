const express = require("express");
const router = express.Router();
const prisma = require("../prisma/db");
const { hashPassword, jwtToken } = require("../utilities/utilities");
const jwt = require("jsonwebtoken");
const { UserType } = require("@prisma/client");
const secret = "bigsecret";


router.post("/add-catalogue", async (req, res) => {
    try {
        const token = req.headers.authorization.replace("Bearer ", "");;
        const tokenToObject = jwt.verify(token, secret);
        const user = tokenToObject.data;
        if(!user){
            return res.status(409).send("please register")
        }
        if(user && user.userType=="BUYER"){
            return res.status(409).send("you are not seller !!!")
        }
        if(user && user.userType=="SELLER"){
            return res.status(200).send("hello seller")
        }

    } catch (error) {
        return res.status(500).send("something went wrong")

    }
})


module.exports = router;