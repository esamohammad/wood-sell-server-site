const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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







//!=========================================
//!Jwt function for verifying
function verifyJWT(req, res, next) {

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('unauthorized access');
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'forbidden access' })
    }
    req.decoded = decoded;
    next();
  })

}








//!=========================================
//!main db worksPlace
async function run() {
  try {

    //!collection--DB
    const categoriesCollection = client.db('wood_sell').collection('categories');
    const productsCollection = client.db('wood_sell').collection('products');
    const itemsCollection = client.db('wood_sell').collection('items');
    const advertiseCollection = client.db('wood_sell').collection('advertise');
    const bookingsCollection = client.db('wood_sell').collection('bookings');
    const usersCollection = client.db('wood_sell').collection('users');





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
    //!GET Api -Bookings , Dashboard, My Orders
    app.get('/bookings', verifyJWT, async (req, res) => {
      const email = req.query.email;

      
      //!From JWT Function
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ message: 'forbidden access' });
      }


      const query = { clientEmail: email }
      // console.log(query)
      const bookings = await bookingsCollection.find(query).toArray();
      res.send(bookings);
    })




    //!=========================================
    //!Post Api -Bookings
    app.post('/bookings', async (req, res) => {
      const booking = req.body
      // console.log(booking);



      //!Limit Bookings
      //!Quary each email address is allow for one product.

      const query = {
        clientEmail: booking.clientEmail,
        productName: booking.productName
      }


      const alreadyBooked = await bookingsCollection.find(query).toArray();


      if (alreadyBooked.length) {
        const message = `You have already booked ${booking.productName}`
        return res.send({ acknowledged: false, message })
      }


      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    })







//!=========================================
// ! JWT for preventing multiple authorization  requests from one email address.
    app.get('/jwt', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
        return res.send({ accessToken: token });
      }
      console.log(user)
      res.status(403).send({ accessToken: 'Unauthorized Access' })
    });







    //!=========================================
    //!Get Api-Users.(NB: This is a open api, to be promoted by jwt and admin users.)
    app.get('/users', async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });






//!=========================================
    //!User admin investigation api , it is admin then it can make admin.
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === 'admin' });
    })



















    //!=========================================
    //!Post Api-Users.(data send from client to save users into DB)
    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })





    //!=========================================
    //! Admin api make
    app.put('/users/admin/:id', verifyJWT, async (req, res) => {

      //!verifyJWT
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);

      if (user?.role !== 'admin') {
        return res.status(403).send({ message: 'forbidden access' })
      }



      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await usersCollection.updateOne(filter, updatedDoc, options);
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
