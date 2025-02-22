const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const port = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors(
    {
        origin: ['http://localhost:5173', 'https://task-track-99a49.web.app'], //replace with client address
        credentials: true,
    }
));


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.alvdp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        //apis
        const database = client.db("TaskTrack");
        const userCollection = database.collection('users');

        // endpoints
        app.post('/users', async (req, res) => {
            const user = req.body;
            //console.log(user);
            const query = { email: user.email };
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ insertedId: null, message: 'User already exists', status: existingUser.status });
            } else {
                const result = await userCollection.insertOne(user);
                res.send(result);
            }
        });

        app.patch('/users', async (req, res) => {
            const { email, ...updateData } = req.body;
            const query = { email: email };
            const update = { $set: updateData };
            const result = await userCollection.updateOne(query, update);
            if (result.matchedCount === 0) {
            return res.send({ message: 'User not found' });
            }
            res.send(result);
        });

        app.get('/tasks/:email',async(req,res)=>{
            const email = req.params.email;
            const query = {email: email}
            const data = await taskCollection.find(query).toArray();
            res.send(data)
        })
        app.delete('/deleteTask/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await taskCollection.deleteOne(query);
            res.send(result);
        })


    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello from my server')
})

app.listen(port, () => {
    console.log('My simple server is running at', port);
})
