const jwt = require("jsonwebtoken");
const secret = "mysecret";

function verifyUserToken(req,res,next){
    try {

        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).send("Unauthorized user!");
        }

        const tokenToObject = jwt.verify(token, secret);
        const user = tokenToObject.data;
        if (!user) {
            return res.status(401).send("Unauthorized user!");
        }
        else{
            // Attach user to request object for further use in the route handlers
            req.user = user;
            next();  // Call next middleware or route handler
        }
        
    } catch (error) {
        console.error("Error in verifyUserToken middleware:", error);
        return res.status(500).send("Internal Server Error");
        
    }
   

}

module.exports=verifyUserToken;