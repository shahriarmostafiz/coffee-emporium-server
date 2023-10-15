const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vfiwhpa.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
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
    await client.connect();
    const coffeeCollection = client
      .db("coffee-database")
      .collection("all-cofee");

    const userCollection = client.db("users-database").collection("all-users");
    // const haiku = database.collection("haiku");
    // post api
    app.post("/allcoffee", async (req, res) => {
      const data = req.body;
      console.log("new coffee data", data);
      const result = await coffeeCollection.insertOne(data);
      res.send(result);
    });
    // get api
    app.get("/allcoffee", async (req, res) => {
      const result = coffeeCollection.find();
      const data = await result.toArray();
      res.send(data);
    });
    app.put("/allcoffee/update/:id", async (req, res) => {
      const id = req.params.id;
      const doc = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      // coffeeName, quantity, supplier, taste, category, details, img;
      const updateDoc = {
        $set: {
          coffeeName: doc.coffeeName,
          quantity: doc.quantity,
          supplier: doc.supplier,
          taste: doc.taste,
          category: doc.category,
          details: doc.details,
          img: doc.img,
        },
      };
      const result = await coffeeCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);

      // console.log(doc);
    });
    // Send a ping to confirm a successful connection
    //getting single item
    app.get("/allcoffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    });
    // delete
    app.delete("/allcoffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
      console.log("file deleted with id", id);
    });

    // user api
    // app.post("/users", async (req, res) => {
    //   const userData = req.body;
    //   console.log("user data", userData);
    //   const result = await userCollection.insertOne(userData);
    //   res.send(result);
    // });
    app.post("/users", async (req, res) => {
      const userData = req.body;
      console.log("user info", userData);
      const result = await userCollection.insertOne(userData);
      res.send(result);
    });
    // get api
    app.get("/users", async (req, res) => {
      const data = userCollection.find();
      const result = await data.toArray();
      res.send(result);
    });
    //patch a user
    app.patch("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = {
        $set: {
          lastLoggedAt: user.lastSignIn,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    //delete a user
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
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
  res.send("coffee server");
});
app.listen(port, () => {
  console.log("listening and drinking coffee on port", port);
});
