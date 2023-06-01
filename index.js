const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());;
app.use(express.json());

const uri = process.env.MONGO_URI;
// const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    const dtyMachinesCollection = client.db("polyspinning").collection("dtyMachines");
    const dtyPresentLotAndTransfer = client.db("polyspinning").collection("presentLotAndTransfer");
    const dtyMcDetailsFromPresentLot = client.db("polyspinning").collection("dtyMcDetailsFromPresentLot");

    app.get("/dtyMachines", async (req, res) => {
        const query = {};
        const machines = await dtyMachinesCollection.find(query).toArray();
        console.log(machines);
        res.send(machines);
    });

    app.get("/dtyMachines/:machineNo", async (req, res) => {
        const machineNo = parseInt(req.params.machineNo);
        const query = { "mcInfo.machineNo": machineNo };
        // console.log(query);
        const machine = await dtyMachinesCollection.findOne(query);
        // console.log(machine);
        res.send(machine);
    });

    app.get("/present-lot-and-transfer-area", async (req, res) => {
        // const query = {uploadedAt: }
        const result = await dtyPresentLotAndTransfer.findOne({}, { sort: { uploadedAt: -1 } });
        res.send(result);
    })

    app.post("/present-lot-and-transfer-area", async (req, res) => {
        const excelData = req.body;
        const result = await dtyPresentLotAndTransfer.insertOne(excelData);
        // console.log(result);
        res.send(result);
    })
    app.get("/dty-machine-details-from-present-lot", async (req, res) => {
        let existingArrWithoutId = [];
        const existingArr = await dtyMcDetailsFromPresentLot.find().toArray();
        for (let elem of existingArr) {
            const { _id, ...rest } = elem;
            existingArrWithoutId.push(rest);
        }
        res.send(existingArrWithoutId);
    })

    app.post("/dty-machine-details-from-present-lot", async (req, res) => {
        const newMCDetails = req.body;
        console.log(newMCDetails);
        const result = await dtyMcDetailsFromPresentLot.insertOne(newMCDetails);
        // console.log(result);
        res.send(result);
    })

    app.put("/dty-machine-details-from-present-lot", async (req, res) => {
        const { oneMCDetails, changedProps } = req.body;
        const changedPropsWithoutId = changedProps.filter(element => element !== '_id');
        // console.log(changedPropsWithoutId);
        const query = { DTYMCNo: oneMCDetails.DTYMCNo, Side: oneMCDetails.Side };
        const option = { upsert: true };

        let updatedMCDetails = {};
        if (oneMCDetails) {
            for (let key of changedPropsWithoutId) {
                // console.log(key);
                updatedMCDetails[key] = oneMCDetails[key];
            }
        }
        console.log("updatedMCDetails", updatedMCDetails);
        const docToUpdate = { $set: updatedMCDetails }
        const result = await dtyMcDetailsFromPresentLot.updateOne(query, docToUpdate, option);
        res.send(result);

        // res.send("hit")
    })

}

run().catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Polyspinning server is running')
})

app.listen(port, () => { console.log(`polyspinning server is running on port ${port}`) })