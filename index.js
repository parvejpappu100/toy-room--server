const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// * Middleware:
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fdnsrak.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const carToysCollection = client.db("toyVroom").collection("carToys");

    // * Toy get all toys api:
    app.get("/toys" , async(req , res) => {
      const cursor = carToysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })


    app.get("/searchToys", async (req, res) => {
      const search = req.query.search;
      const query = {name: {$regex: search , $options: "i"}}

      const cursor = carToysCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // * To display added toy client side:
    app.get("/carToys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      
      const cursor = carToysCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // * To get newToy from client side and set server side:
    app.post("/carToys", async (req, res) => {
      const newToy = req.body;
      const result = await carToysCollection.insertOne(newToy);
      res.send(result);
    });

    // * For update toy:
    // * To get specific toy api:
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carToysCollection.findOne(query);
      res.send(result);
    });

    // * Update:
    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToy = req.body;
      const toy = {
        $set: {
           name: updatedToy.name, 
           seller: updatedToy.seller, 
           quantity: updatedToy.quantity, 
           price: updatedToy.price, 
           img: updatedToy.img, 
           description: updatedToy.description, 
           rating: updatedToy.rating, 
           category: updatedToy.category 
        }
      }
      const result = await carToysCollection.updateOne(filter , toy , options);
      res.send(result);
    });

    // * For delete my toy page toy:
    app.delete("/carToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carToysCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy marketplace server is running");
});

app.listen(port, () => {
  console.log(`Toy marketplace server is running on port: ${port}`);
});
