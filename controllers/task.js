const express = require("express");
const router = express.Router();
const prisma = require("../prisma/db");
const { hashPassword, jwtToken } = require("../utilities/utilities");
const jwt = require("jsonwebtoken");
const { UserType } = require("@prisma/client");
const secret = "bigsecret";


router.post("/api/seller/create-catalog", async (req, res) => {
    try {
        const token = req.headers.authorization.replace("Bearer ", "");
        const tokenToObject = jwt.verify(token, secret);
        const user = tokenToObject.data;
        if (!user) {
            return res.status(409).send("please register")
        }
        if (user && user.userType == "BUYER") {
            return res.status(409).send("you are not seller !!!")
        }
        if (user && user.userType == "SELLER") {
            //return res.status(200).send("hello seller")
            const catalogue = req.body;

            const addCatalogue=await prisma.catalog.create({
                data:{
                    username:user.username
                }
            })
            const addProduct = await prisma.product.create({
                data: {
                    name: catalogue.name,
                    price: Number(catalogue.price),
                    catalogId:addCatalogue.id
                }
            })
            return res.status(201).send(addProduct+addCatalogue)
        }

    } catch (error) {
        console.error(error)
        return res.status(500).send("something went wrong")

    }
})


router.get("/api/buyer/list-of-sellers", async (req, res) => {
    try {
        const token = req.headers.authorization.replace("Bearer ", "");
        const tokenToObject = jwt.verify(token, secret);
        const user = tokenToObject.data;
        if (!user) {
            return res.send(409).send("please register")
        }
        if (user && user.userType == "SELLER") {
            return res.status(409).send("please register as BUYER to get list of SELLERS")
        }
        if (user && user.userType == "BUYER") {
            const getAllSeller = await prisma.user.findMany({
                where: {
                    userType: "SELLER"
                },
                select: {
                    username: true,
                }
            })
            return res.status(200).json(getAllSeller)
        }

    } catch (error) {
        console.error(error)
        return res.status(500).send("something went wrong!!!")

    }
})

module.exports = router;