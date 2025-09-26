const express = require("express");
const router = express.Router();
const prisma = require("../prisma/db");
const {verifyJwt}=require("../utilities/utilities")

const jwt = require("jsonwebtoken");
const { UserType } = require("@prisma/client");
const secret = "bigsecret";


router.post("/api/seller/create-catalog", async (req, res) => {
    try {
        // const token = req.headers.authorization.replace("Bearer ", "");
        // const tokenToObject = jwt.verify(token, secret);
        // const user = tokenToObject.data;
        const user=req.user;
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
                    //username: user.username,
                    userId: user.id
                }
            })


            if (!catalog) {
                const addNewCatalogue = await prisma.catalog.create({
                    data: {
                        username: user.username,
                        userId: user.id
                    }
                })
                for (let i = 0; i < productToAddList.length; i++) {
                    const product = productToAddList[i]
                    const addProduct = await prisma.product.createManyAndReturn({
                        data: [{
                            name: product.name,
                            price: Number(product.price),
                            catalogId: addNewCatalogue.id

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
                            catalogId: catalog.id

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
        // const token = req.headers.authorization.replace("Bearer ", "");
        // const tokenToObject = jwt.verify(token, secret);
        // const user = tokenToObject.data;
        const user=req.user;
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
                    id: true,
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

router.get("/api/buyer/seller-catalog/:seller_id", async (req, res) => {
    try {
        // const token = req.headers.authorization.replace("Bearer ", "");
        // const tokenToObject = jwt.verify(token, secret);
        // const user = tokenToObject.data;
        const user=req.user;
        if (!user) {
            return res.status(409).send("please register")
        }

        if (user && user.userType == "SELLER") {
            return res.status(409).send("please register as BUYER to get SELLER'S catalogue")
        }

        if (user && user.userType == "BUYER") {
            const sellerIdString = req.params.seller_id;
            //console.log(sellerIdString)
            const sellerIdNumber = Number(sellerIdString)
            const getSellerCatalog = await prisma.catalog.findUnique({
                where: {
                    userId: sellerIdNumber
                },
                select: {
                    id: true,
                    username: true
                }
            })
            const sellerProducts = await prisma.product.findMany({
                where: {
                    catalogId: getSellerCatalog.id
                },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    catalogId: true

                }

            })
            return res.status(200).send(sellerProducts)
        }

    } catch (error) {
        console.log(error)
        return res.status(500).send("something went wrong!")
    }

})


router.post("/api/buyer/create-order/:seller_id", async (req, res) => {
    try {
        // const token = req.headers.authorization.replace("Bearer ", "");
        // const tokenToObject = jwt.verify(token, secret);
        // const user = tokenToObject.data;
        const user=req.user;
        const productIdList = req.body.ids;
        if (!user) {
            return res.status(409).send("please register")
        }

        if (user && user.userType == "SELLER") {
            return res.status(409).send("please register as BUYER to get SELLER'S catalogue")
        }
        if (user && user.userType == "BUYER") {
            const sellerIdString = req.params.seller_id;
            const sellerIdNumber = Number(sellerIdString)
            const catalogOfSeller = await prisma.catalog.findUnique({
                where: {
                    userId: sellerIdNumber
                }
            })


            const productsOfSeller = await prisma.product.findMany({
                where: {
                    catalogId: catalogOfSeller.id
                },
                select: {
                    id: true,
                    name: true,
                    price: true
                }
            })
            for (let i = 0; i < productIdList.length; i++) {
                let j = 0
                for (; j < productsOfSeller.length; j++) {
                    const buyerProductId = productIdList[i]
                    const sellerProductId = productsOfSeller[j].id
                    if (buyerProductId == sellerProductId) {
                        break;
                    }
                }
                if (j == productsOfSeller.length) {
                    return res.status(401).send("unauthorized!!!")
                }

            }

            for (let i = 0; i < productIdList.length; i++) {
                const productId=productIdList[i]
                const product=productsOfSeller.find(p=>p.id==productId)
                const orderPlace = await prisma.order.create({
                    data: {
                        buyerId: user.id,
                        sellerCatalogId: catalogOfSeller.userId,
                        productId: productId,
                        productName: product.name,
                        productPrice: product.price

                    }
                })

            }



            return res.status(201).send("order added!!!")





        }

    } catch (error) {
        console.error(error)
        return res.status(500).send("something went wrong!!!")

    }

})


router.get("/api/seller/orders", async (req, res) => {
    try {
        // const token = req.headers.authorization.replace("Bearer ", "");
        // const tokenToObject = jwt.verify(token, secret);
        // const user = tokenToObject.data;
        const user=req.user;
        if (!user) {
            return res.status(409).send("please register")
        }

        if (user && user.userType == "BUYER") {
            return res.status(409).send("please register as SELLER to get orders")
        }
        if (user && user.userType == "SELLER") {
            const ordersToSeller=await prisma.order.findMany({
                where:{
                    sellerCatalogId:user.id
                },
                select:{
                    productId:true,
                    productName:true,
                    productPrice:true
                }
            })
            return res.status(201).send(ordersToSeller)

        }

    } catch (error) {
        console.error(error)
        return res.status(500).send("something wnet wrong!!!")

    }

})
module.exports = router;