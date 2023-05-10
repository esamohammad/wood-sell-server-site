const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config()



const app = express()
const port = process.env.PORT || 5000;





//!middlewear
app.use(cors())
app.use(express.json())



//!mongodb credentials
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ddkgs5g.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri)


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
   



  } 
  finally {
    
    


  }
}
run().catch(console.dir);



//! json file import
const categories = require("./categories.json");


app.get("/", (req, res) => {
  res.send("Wood Sell is running on Server")
});




//! data api get....(all Data api)
app.get('/categories', (req, res) => {
  res.send(categories)
})


//! data api get....(Single id --Data api)
app.get("/categories/:id", (req, res) => {
  const id = req.params.id;
  const single_category = categories.find(category => category._id === id) ||{};
  res.send(single_category)
})



//! cmd showed window--
app.listen(port, () => {
  console.log(`Wood Sell is running on port: ${port}`);
});
