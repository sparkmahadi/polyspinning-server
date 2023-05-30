const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());;
app.use(express.json());

// const uri = process.env.MONGO_URI;
const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    const dtyMachinesCollection = client.db("polyspinning").collection("dtyMachines");

    app.get("/dtyMachines", async(req, res)=>{
        const query = {};
        const machines = await dtyMachinesCollection.find(query).toArray();
        console.log(machines);
        res.send(machines);
    });

    app.get("/dtyMachines/:machineNo", async(req, res)=>{
        const machineNo = parseInt(req.params.machineNo);
        const query = { "mcInfo.machineNo": machineNo};
        console.log(query);
        const machine = await dtyMachinesCollection.findOne(query);
        console.log(machine);
        res.send(machine);
    });
}

run().catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Polyspinning server is running')
})

app.listen(port, ()=> {console.log(`polyspinning server is running on port ${port}`)})