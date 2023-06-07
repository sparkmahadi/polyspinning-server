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
    const poyMcDetailsFromPresentLot = client.db("polyspinning").collection("poyMcDetailsFromPresentLot");

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

    app.get("/poy-machine-details-from-present-lot", async (req, res) => {
        let existingArrWithoutId = [];
        const existingArr = await poyMcDetailsFromPresentLot.find().toArray();
        for (let elem of existingArr) {
            const { _id, ...rest } = elem;
            existingArrWithoutId.push(rest);
        }
        res.send(existingArrWithoutId);
    })

    app.post("/poy-machine-details-from-present-lot", async (req, res) => {
        const newWinderData = req.body;
        console.log(newWinderData);
        const result = await poyMcDetailsFromPresentLot.insertOne(newWinderData);
        console.log(result);
        res.send(result);
    })

    app.put("/poy-machine-details-from-present-lot", async (req, res) => {
        const { winderDetails, changedProps } = req.body;
        const changedPropsWithoutId = changedProps.filter(element => element !== '_id');
        // console.log(changedPropsWithoutId);
        const query = { WinderNo: winderDetails.WinderNo };
        const option = { upsert: true };

        let updatedMCDetails = {};
        if (winderDetails) {
            for (let key of changedPropsWithoutId) {
                // console.log(key);
                updatedMCDetails[key] = winderDetails[key];
            }
        }
        console.log("updatedWinderDetails", updatedMCDetails);
        const docToUpdate = { $set: updatedMCDetails }
        const result = await poyMcDetailsFromPresentLot.updateOne(query, docToUpdate, option);
        res.send(result);

    })

    app.get("/poy-winders/:WinderNo", async (req, res) => {
        const WinderNo = parseInt(req.params.WinderNo);
        const query = { WinderNo: WinderNo };
        const winderData = await poyMcDetailsFromPresentLot.findOne(query);
        res.send(winderData);
    })

    app.put("/poy-winders/:WinderNo", async (req, res) => {

    })

    app.post("/poy-winder-updates", async (req, res) => {

    })

    app.get("poy-winder-updates", async (req, res) => {

    })

    app.get("/dty-machine-details-from-present-lot/sortedAndMerged", async (req, res) => {
        let existingArrWithoutId = [];
        const existingArr = await dtyMcDetailsFromPresentLot.find().toArray();
        for (let elem of existingArr) {
            const { _id, ...rest } = elem;
            existingArrWithoutId.push(rest);
        }

        //  sorting the array
        const sortedMachines = existingArrWithoutId.sort((a, b) => {
            // Sort by DTYMCNo numerically
            const dtymcNoA = parseInt(a.DTYMCNo);
            const dtymcNoB = parseInt(b.DTYMCNo);
            if (dtymcNoA < dtymcNoB) {
                return -1;
            }
            if (dtymcNoA > dtymcNoB) {
                return 1;
            }

            // Sort by Side alphabetically
            const sideA = a.Side.toUpperCase();
            const sideB = b.Side.toUpperCase();
            if (sideA < sideB) {
                return -1;
            }
            if (sideA > sideB) {
                return 1;
            }

            return 0; // if both DTYMCNo and Side are equal
        });

        const mergedData = [];

        // Create a helper function to compare two objects excluding the "Side" property
        function compareObjects(obj1, obj2) {
            const { Side: side1, ...rest1 } = obj1;
            const { Side: side2, ...rest2 } = obj2;
            return JSON.stringify(rest1) === JSON.stringify(rest2);
        }

        sortedMachines.forEach((obj) => {
            const { DTYMCNo, Side, ...rest } = obj;
            const existingObj = mergedData.find((item) => item.DTYMCNo === DTYMCNo);

            if (existingObj && compareObjects(existingObj, obj)) {
                // If an existing object with the same DTYMCNo is found and all other properties are the same, merge the Side property
                existingObj.Side = [...existingObj.Side, Side];
            } else {
                // Otherwise, create a new object
                mergedData.push({ DTYMCNo, Side: [Side], ...rest });
            }
        });

        // console.log(mergedData);
        res.send(mergedData);
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

    })

}

run().catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Polyspinning server is running')
})

app.listen(port, () => { console.log(`polyspinning server is running on port ${port}`) })