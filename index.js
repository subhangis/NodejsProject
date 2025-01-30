const express = require('express')
const mongoose=require ('mongoose')
const nodemon = require('nodemon')
const bodyParser= require('body-parser')
const  dotenv  = require('dotenv')
const  Fetchroutes = require('./routes/userRoutes.js')


const app = express();

app.use(bodyParser.json());

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGOURL = process.env.MONGO_URL;

mongoose.connect(MONGOURL).then(()=>{
      console.log("Database connected successful.")
      app.listen(PORT,()=>{
              console.log(`server is running on port ${PORT}`)
      })
}). catch((error)=>console.log(error))

app.use('/',Fetchroutes)

