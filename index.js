const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yib2rqv.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const carCollection = client.db("carDb").collection("car");
        const cartCollection = client.db("carDb").collection("cart");

        app.get('/cardata', async (req, res) => {
            const cursor = carCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/cardata/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await carCollection.findOne(query);
            res.send(result);
        })

        app.post('/cardata', async (req, res) => {
            const newCarData = req.body;
            console.log(newCarData);

            const result = await carCollection.insertOne(newCarData);
            res.send(result);
        })

        app.put('/cardata/:id', async (req, res) => {
            const id = req.params.id;
            const carData = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateData = {
                $set: {
                    name: carData.name,
                    brand: carData.brand,
                    type: carData.type,
                    price: carData.price,
                    rating: carData.rating,
                    photo: carData.photo,
                    details: carData.details
                }
            }
            const result = await carCollection.updateOne(filter, updateData, options);
            res.send(result);
        })

        // userCart
        app.get('/cartdata', async (req, res) => {
            const cursor = cartCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/cartdata', async (req, res) => {
            const cartItem = req.body;
            const result = await cartCollection.insertOne(cartItem);
            res.send(result)
        })

        app.delete('/cartdata/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('GrandCar server is running')
})

app.listen(port, () => {
    console.log(`GrandCar server is running on port: ${port}`);
})