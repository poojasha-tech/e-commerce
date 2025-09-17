const express=require("express");
const app=express();

const port=3000;

const cors = require('cors');
app.use(cors());

const verifyUserToken=require("./middleware/verifyUserToken")

app.use(express.json()); // middleware


const authRouter=require("./controllers/auth");
app.use(authRouter);

//app.use(verifyUserToken);

const taskRouter=require("./controllers/task");
app.use(taskRouter); 


app.listen(port,()=>{
    console.log(`listening on ${port}`)
})
