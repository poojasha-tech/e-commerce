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
            const productToAddList = req.body;

            const catalog = await prisma.catalog.findUnique({
                where: {
                    username: user.username,
                    catalogId:user.id
                }
            })


            if (!catalog) {
                const addNewCatalogue = await prisma.catalog.create({
                    data: {
                        username: user.username,
                        catalogId:user.id
                    }
                })
                for (let i = 0; i < productToAddList.length; i++) {
                    const product = productToAddList[i]
                    const addProduct = await prisma.product.createManyAndReturn({
                        data: [{
                            name: product.name,
                            price: Number(product.price),
                            productId: addNewCatalogue.catalogId

                        }],

                    })
                }

                return res.status(201).send("product added")
            }

            else {
                for (let i = 0; i < productToAddList.length; i++) {
                    const product = productToAddList[i]
                    const addProduct = await prisma.product.createManyAndReturn({
                        data: [{
                            name: product.name,
                            price: Number(product.price),
                            productId: catalog.catalogId

                        }],

                    })
                }
                return res.status(201).send("product added")

            }



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
                    id:true,
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

router.get("/api/buyer/seller-catalog/:seller_id" , async(req,res)=>{
    try {
        const token = req.headers.authorization.replace("Bearer ", "");
        const tokenToObject = jwt.verify(token, secret);
        const user = tokenToObject.data;
        if(!user){
            return res.status(409).send("please register")
        }

        if(user && user.userType=="SELLER"){
            return res.status(409).send("please register as BUYER to get SELLER'S catalogue")
        }

        if(user && user.userType=="BUYER"){
            const sellerIdString=req.params.seller_id;
            console.log(sellerIdString)
            const sellerIdNumber=Number(sellerIdString)
            const getSellerCatalog=await prisma.catalog.findMany({
                where:{
                    catalogId:sellerIdNumber
                },
                select:{
                    id:true,
                    username:true
                }
            })
            return res.status(200).send(getSellerCatalog)
        }
        
    } catch (error) {
        console.log(error)
        return res.status(500).send("something went wrong!")
    }

})

module.exports = router;