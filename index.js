const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const { format } = require('date-fns');

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
    const dtyMachineUpdates = client.db("polyspinning").collection("dtyMachineUpdates");
    const poyWinderUpdates = client.db("polyspinning").collection("poyWinderUpdates");
    const dtyProcessParams = client.db("polyspinning").collection("dtyProcessParams");

    app.get("/dty-machines", async (req, res) => {
        const query = {};
        const machines = await dtyMachinesCollection.find(query).toArray();
        // const machines = await dtyMachinesCollection.find(query, { sort: { "mcInfo.DTYMCNo": 1 }}).toArray();
        // console.log(machines);
        res.send(machines);
    });

    // api for getting details of a dty mc. if no side is mentioned in query then it will give resp for both side. else one side as expected.
    app.get("/dty-machines/machine-details", async (req, res) => {
        const { machine } = req.query;
        console.log(machine);
        const nonDigitRegex = /\D/;
        const containsOnlyNumbers = !nonDigitRegex.test(machine);

        const machineNo = parseInt(machine).toString();

        if (containsOnlyNumbers) {
            // its full machine
            let fullMC = [];
            const Side = ["A", "B"];
            for (let elem of Side) {
                const query = { "mcInfo.DTYMCNo": machineNo, "mcInfo.Side": elem };
                const machineData = await dtyMachinesCollection.findOne(query);

                if (machineData) { fullMC.push(machineData); }
                else {
                    fullMC.push({ message: `No parameters found for M/C #${machineNo}/${elem}` })
                }
            }
            res.send(fullMC)
        } else {
            // its half machine. if data for half MC is found then send it, otherwise look for params with full MC.
            const Side = machine.charAt(machine.length - 1);
            const query = { "mcInfo.DTYMCNo": machineNo, "mcInfo.Side": Side };
            const machineData = await dtyMachinesCollection.findOne(query);

            if (machineData) { res.send(machineData) }
            else {
                res.send({ message: `No parameters found for M/C #${machineNo}/${Side}` })
            }
        }
    });

    app.put("/dty-machines/", async (req, res) => {
        const newParameter = req.body;
        const machine = newParameter.DTYMCNo;
        const machineNo = parseInt(machine).toString();
        let Side = [];
        let query = {};
        const option = { upsert: true };
        const docToUpdate = {
            $set: {
                "params.MCSpeed": newParameter.MCSpeed,
                "params.SOF": newParameter.SOF,
                "params.TOF": newParameter.TOF,
                "params.DY": newParameter.DY,
                "params.Shaft2B": newParameter.Shaft2B,
                "params.CPM": newParameter.CPM,
                "params.DEV": newParameter.DEV,
                "params.PH": newParameter.PH,
                "params.SH": newParameter.SH,
                "params.EDraw": newParameter.EDraw,
                "params.DR": newParameter.DR,
                "params.OilerRpm": newParameter.OilerRpm,
                "params.OilType": newParameter.OilType,
                "params.Axial": newParameter.Axial,
                "params.Stroke": newParameter.Stroke,
                "params.AirPressure": newParameter.AirPressure,
                "params.IntJetType": newParameter.IntJetType,

                "DTYInfo.DTYType": newParameter.DTYType,
                "DTYInfo.DTYColor": newParameter.DTYColor,
                "DTYInfo.DTYTubeColor": newParameter.DTYTubeColor,
                "DTYInfo.LotNo": newParameter.LotNo,
                "DTYInfo.CustomerName": newParameter.CustomerName,

                "POYInfo.POYType": newParameter.POYType,
                "POYInfo.ChipsName": newParameter.ChipsName,
                "POYInfo.POYLine": newParameter.POYLine,


                // props to be updated mathematically
                "DTYInfo.DTYDenier": newParameter.DTYType.split("/")[0],
                "DTYInfo.Filaments": newParameter.DTYType.split("/")[1],
                "POYInfo.POYDenier": newParameter.POYType.split("/")[0],
                "POYInfo.Filaments": newParameter.POYType.split("/")[1],
                "params.T1": parseInt(newParameter.POYType.split("/")[0] / 4),
                "params.T2": parseInt(newParameter.DTYType.split("/")[0] / 4),
                "params.T3": "",
                "params.IntType": newParameter.DTYType.split("/")[2],

                "updatedAt.parameters": format(new Date(), "Pp"),

                // not updated props
                // "mcInfo.DTYMCNo" : newParameter.DTYMCNo,
                // "mcInfo.Brand" : newParameter.Brand,
                // "mcInfo.Side" : newParameter.Side,
                // "mcInfo.TotalSpindles" : newParameter.TotalSpindles,
                // "params.IntJetOrifice" : newParameter.IntJetOrifice,
                // "DTYInfo.Spandex" : newParameter.Spandex,
                // "DTYInfo.POYShortPositions" : newParameter.POYShortPositions,
                // "DTYInfo.doubling" : newParameter.doubling,
                // "POYInfo.POYColor" : newParameter.POYColor,
                // "POYInfo.StdDrawForce" : newParameter.StdDrawForce,
                // "POYInfo.TotalWinder" : newParameter.TotalWinder,
                // "POYInfo.EndsPerWinder" : newParameter.EndsPerWinder,
                // "POYInfo.POYProcessSpeed" : newParameter.POYProcessSpeed,
                // "POYInfo.POYBobbin" : newParameter.POYBobbin,

                // to be updated from present lot
                // "mcInfo.Status" : newParameter.Status,
                // "DTYInfo.DTYType" : newParameter.DTYType,
                // "DTYInfo.LotNo" : newParameter.LotNo,
                // "DTYInfo.InspectionArea": ""
                // "POYInfo.POYLine" : newParameter.POYLine,
                // "params.AirPressure" : newParameter.AirPressure,
                // "params.IntJetType" : newParameter.IntJetType,
            }
        };

        const nonDigitRegex = /\D/;
        const containsOnlyNumbers = !nonDigitRegex.test(machine);

        if (containsOnlyNumbers) {
            Side = ["A", "B"];
            const response = [];
            for (let elem of Side) {
                query = { "mcInfo.DTYMCNo": machineNo, "mcInfo.Side": elem };
                const result = await dtyMachinesCollection.updateOne(query, docToUpdate, option);
                console.log("result", result);
                response.push(result);
            }
            res.send(response);
        } else {
            if (machine.endsWith("A")) {
                Side.push("A");
                query = { "mcInfo.DTYMCNo": machineNo, "mcInfo.Side": "A" };
                const result = await dtyMachinesCollection.updateOne(query, docToUpdate, option);
                console.log("result", result);
                res.send(result);
            }
            if (machine.endsWith("B")) {
                Side.push("B");
                query = { "mcInfo.DTYMCNo": machineNo, "mcInfo.Side": "B" };
                const result = await dtyMachinesCollection.updateOne(query, docToUpdate, option);
                console.log("result", result);
                res.send(result);
            }
        }
        console.log(newParameter);
        // res.send("machine");
    });

    app.get("/present-lot-and-transfer-area", async (req, res) => {
        const result = await dtyPresentLotAndTransfer.findOne({}, { sort: { uploadedAt: -1 } });
        console.log(result);
        res.send(result);
    })

    app.post("/present-lot-and-transfer-area", async (req, res) => {
        const excelData = req.body;
        const result = await dtyPresentLotAndTransfer.insertOne(excelData);
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

    app.post("/dty-machine-updates", async (req, res) => {
        console.log(req.body);
        const { newMCDetails, changedProps } = req.body;
        newMCDetails.uploadedAt = format(new Date(), "Pp");
        newMCDetails.changedProps = changedProps;
        console.log(newMCDetails);
        const result = await dtyMachineUpdates.insertOne(newMCDetails);
        console.log(result);
        res.send(result);
    })

    app.get("/dty-machine-updates", async (req, res) => {

    });



    app.get("/dty-process-parameters", async (req, res) => {
        const needQuery = req.query.need;
        let existingParamsWithoutId = [];
        console.log(needQuery);
        if (needQuery === "withoutIdAndTime") {
            const existingParams = await dtyProcessParams.find({}, { sort: { uploadedAt: -1 } }).toArray();
            for (let elem of existingParams) {
                const { _id, uploadedAt, ...rest } = elem;
                existingParamsWithoutId.push(rest);
            }
            res.send(existingParamsWithoutId);
        }
        else {
            const existingParams = await dtyProcessParams.find({}, { sort: { uploadedAt: -1 } }).toArray();
            for (let elem of existingParams) {
                const { _id, ...rest } = elem;
                existingParamsWithoutId.push(rest);
            }
            res.send(existingParamsWithoutId);
        }
    });

    app.get("/dty-process-parameters-by-query", async (req, res) => {
        const machineNo = req.query.machineNo;
        const machinesString = req.query.machines;
        console.log(machineNo);
        console.log(machinesString);

        const getData = async (machineNo) => {
            const nonDigitRegex = /\D/;
            const containsOnlyNumbers = !nonDigitRegex.test(machineNo);
            if (containsOnlyNumbers) {
                // its full machine
                const paramOfFullMC = await dtyProcessParams.findOne({ DTYMCNo: machineNo }, { sort: { uploadedAt: -1 } });
                if (paramOfFullMC) { return (paramOfFullMC); }
                else { return { message: `No parameters found for M/C #${machineNo}` } }
            } else {
                // its half machine. if data for half MC is found then send it, otherwise look for params with full MC.
                const existingParams = await dtyProcessParams.findOne({ DTYMCNo: machineNo }, { sort: { uploadedAt: -1 } });
                if (!existingParams) {
                    const fullMC = (parseInt(machineNo)).toString();
                    const paramOfFullMC = await dtyProcessParams.findOne({ DTYMCNo: fullMC }, { sort: { uploadedAt: -1 } });
                    if (paramOfFullMC) {
                        // overwriting the machine no with one side only for frontend
                        paramOfFullMC.DTYMCNo = machineNo;
                        return (paramOfFullMC);
                    }
                    else { return { message: `No parameters found for M/C #${machineNo}` } }
                } else {
                    return (existingParams);
                }
            }
        };

        if (machineNo) {
            const response = await getData(machineNo);
            res.send(response);
        } else if (machinesString) {
            const machinesArr = machinesString.split(",");
            const data = [];
            for (let machineNo of machinesArr) {
                const response = await getData(machineNo);
                data.push(response);
            }
            res.send(data);
        } else {
            res.send({ message: "machine query is not found" });
        }

    });


    app.post("/dty-process-parameters", async (req, res) => {
        // console.log(req.body);
        const paramDetails = req.body;
        paramDetails.uploadedAt = format(new Date(), "Pp");
        console.log(paramDetails);
        const result = await dtyProcessParams.insertOne(paramDetails);
        console.log(result);
        res.send(result);
    })


    // poyyyyyyyy
    // starts here
    app.get("/poy-machine-details-from-present-lot", async (req, res) => {
        let existingArrWithoutId = [];
        const existingArr = await poyMcDetailsFromPresentLot.find().toArray();
        const sortedExistingArr = existingArr.sort((a, b) => a.WinderNo - b.WinderNo)
        for (let elem of sortedExistingArr) {
            const { _id, uploadedAt, ...rest } = elem;
            existingArrWithoutId.push(rest);
        }
        res.send(existingArrWithoutId);
    })

    app.post("/poy-machine-details-from-present-lot", async (req, res) => {
        const newWinderData = req.body;
        newWinderData.uploadedAt = format(new Date(), "Pp");
        newWinderData.updatedAt = "-";
        console.log(newWinderData);
        const result = await poyMcDetailsFromPresentLot.insertOne(newWinderData);
        console.log(result);
        res.send(result);
    })

    app.put("/poy-machine-details-from-present-lot", async (req, res) => {
        const { winderDetails, changedProps } = req.body;
        const changedPropsWithoutId = changedProps.filter(element => element !== '_id');
        console.log(changedPropsWithoutId);
        const query = { WinderNo: winderDetails.WinderNo };
        const option = { upsert: true };

        let updatedMCDetails = {};
        if (winderDetails) {
            for (let key of changedPropsWithoutId) {
                // console.log(key);
                updatedMCDetails[key] = winderDetails[key];
            }
            updatedMCDetails.updatedAt = format(new Date(), "Pp");
        }
        console.log("updatedWinderDetails", updatedMCDetails);
        const docToUpdate = { $set: updatedMCDetails }
        console.log(query);
        const result = await poyMcDetailsFromPresentLot.updateOne(query, docToUpdate, option);
        res.send(result);

    })

    app.get("/poy-winders/:WinderNo", async (req, res) => {
        const WinderNo = req.params.WinderNo;
        const query = { WinderNo: WinderNo };
        const winderData = await poyMcDetailsFromPresentLot.findOne(query);
        res.send(winderData);
    })

    app.post("/poy-winder-updates", async (req, res) => {
        console.log(req.body);
        const { WinderData, changedProps } = req.body;
        WinderData.uploadedAt = format(new Date(), "Pp");
        console.log(WinderData);
        const result = await poyWinderUpdates.insertOne({ winderDetails: WinderData, changedProps });
        console.log(result);
        res.send(result);
    })

    // app.get("poy-winder-updates", async (req, res) => {
    //     const result = await poyWinderUpdates.find({}).toArray();
    //     res.send(result);
    // })

}

run().catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Polyspinning server is running')
})

app.listen(port, () => { console.log(`polyspinning server is running on port ${port}`) })