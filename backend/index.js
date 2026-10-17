import express from 'express'
import dotenv from 'dotenv'

dotenv.config()
const app = express();


const port = process.env.PORT || 4000;
app.listen(4000 , () =>{
  console.log(`Server is running on port  ${port}`)
})