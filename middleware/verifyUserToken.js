const { verifyJwt } = require("../utilities/utilities");


function verifyUserToken(req, res, next) {
    try{

        const token = req.headers?.authorization?.replace("Bearer ", "");
        const user = verifyJwt(token);
        if (!user)
            return res.status(401).send("unauthorised!")
    
        else {
            req.user = user
            next()
        }
    }
    catch(e){
        console.error("Error while authenticating the user from token", e)
        return res.status(401).send("unauthorised")
    }
}

module.exports = verifyUserToken