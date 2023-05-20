const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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


//!main
async function run() {
  try {

    //!collection--DB
    const categoriesCollection = client.db('wood_sell').collection('categories');
    const productsCollection = client.db('wood_sell').collection('products');
    const itemsCollection = client.db('wood_sell').collection('items');
    const advertiseCollection = client.db('wood_sell').collection('advertise');
    const bookingsCollection = client.db('wood_sell').collection('bookings');

    //!***
    //!=========================================
    //!All Categories
    app.get('/categories', async (req, res) => {
      const query = {};
      const cursor = categoriesCollection.find(query);
      const categories = await cursor.toArray();
      res.send(categories);
    })


    //!=========================================
    //!Single category
    app.get('/categories/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const result = await categoriesCollection.findOne(filter)
      res.send(result)
    })

    //!=========================================
    //!All products
    app.get('/products', async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    })


    //!=========================================
    //!Single product by id
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const product = await productsCollection.findOne(query);
      res.send(product)
    })


    //!***
    //!=========================================
    //! product filter by category. 01,02,03,04 .
    app.get('/items/:id', async (req, res) => {
      const id = req.params.id;
      const query = { category_id: id }
      const category = await itemsCollection.find(query).toArray();
      res.send(category);
    })


    //!=========================================
    //!All advertise
    app.get('/advertise', async (req, res) => {
      const query = {};
      const cursor = advertiseCollection.find(query);
      const advertise = await cursor.toArray();
      res.send(advertise);
    })













    //!=========================================
    //!Single advertise by id
    app.get('/advertise/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const advertise = await advertiseCollection.findOne(query);
      res.send(advertise)
    })



    //!=========================================
    //!Post Api -Bookings
    app.post('/bookings', async (req, res) => {
      const booking = req.body
      console.log(booking);
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    })











  }

  finally {

  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Wood Sell is running on Server")
});


//! cmd showed window--
app.listen(port, () => {
  console.log(`Wood Sell is running on port: ${port}`);
});
