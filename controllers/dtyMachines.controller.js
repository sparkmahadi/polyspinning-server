const { format } = require("date-fns");
const { db } = require("../utils/connectDB");
const dtyMachinesCollection = db.collection("dtyMachines")

module.exports.getDtyMachines = async (req, res) => {
    const query = {};
    const machines = await dtyMachinesCollection.find(query).toArray();
    // console.log("machines", machines);
    machines.sort((a, b) => {
        const dtyMcNoA = parseInt(a.mcInfo.DTYMCNo.replace('DTYMCNo ', ''));
        const dtyMcNoB = parseInt(b.mcInfo.DTYMCNo.replace('DTYMCNo ', ''));

        if (dtyMcNoA < dtyMcNoB) {
            return -1;
        } else if (dtyMcNoA > dtyMcNoB) {
            return 1;
        } else {
            const sideOrder = { A: 1, B: 2 };
            const sideComparison = sideOrder[a.mcInfo.Side] - sideOrder[b.mcInfo.Side];

            if (sideComparison === 0) {
                return 0;
            } else {
                return sideComparison;
            }
        }
    });
    res.send(machines);
}

module.exports.getDtyMachineDetails = async (req, res) => {
    const { machine } = req.query;
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
}

module.exports.updateMCFromParams = async (req, res) => {
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
            // console.log("result", result);
            response.push(result);
        }
        res.send(response);
    } else {
        if (machine.endsWith("A")) {
            Side.push("A");
            query = { "mcInfo.DTYMCNo": machineNo, "mcInfo.Side": "A" };
            const result = await dtyMachinesCollection.updateOne(query, docToUpdate, option);
            // console.log("result", result);
            res.send(result);
        }
        if (machine.endsWith("B")) {
            Side.push("B");
            query = { "mcInfo.DTYMCNo": machineNo, "mcInfo.Side": "B" };
            const result = await dtyMachinesCollection.updateOne(query, docToUpdate, option);
            // console.log("result", result);
            res.send(result);
        }
    }
    // console.log(newParameter);
    // res.send("machine");
}

module.exports.updateMCFromPresentLot = async (req, res) => {
    const newLot = req.body;
    const machine = newLot.DTYMCNo;
    const machineNo = parseInt(machine).toString();
    const query = { "mcInfo.DTYMCNo": machineNo, "mcInfo.Side": newLot.Side };
    const option = { upsert: false };

    const [DTYDenier, Filaments, IntType] = newLot.ProductType.split("/");
    const docToUpdate = {
        $set: {
            "updatedAt.presentLotAndTA": format(new Date(), "Pp"),

            "mcInfo.Status": "Running",

            "DTYInfo.DTYType": newLot.ProductType,
            "DTYInfo.DTYDenier": DTYDenier,
            "DTYInfo.Filaments": Filaments,
            "DTYInfo.LotNo": newLot.PresentLotNo,
            "DTYInfo.InspectionArea": newLot.InspectionArea,
            "DTYInfo.DTYTubeColor": newLot.DTYBobbinColor,

            "POYInfo.POYLine": newLot.POYLine,

            "params.IntType": IntType,
            "params.AirPressure": newLot.AirPress,
            "params.IntJetType": newLot.INTJet,
        }
    };

    const result = await dtyMachinesCollection.updateOne(query, docToUpdate, option);
    console.log("updated main machine", result);
    res.send(result);
}

module.exports.updateMCManually = async (req, res) => {
    console.log('manually update called');
    const { DTYMCNo, Side } = req.query;
    const { changedProps } = req.body;
    console.log("changedProperties", changedProps);
    let query = {};
    const option = { upsert: true };

    const docToUpdate = { $set: {} };
    for (let key in changedProps) {
        for (let n in changedProps[key]) {
            docToUpdate.$set[`${key}.${n}`] = changedProps[key][n];
        }
    }
    docToUpdate.$set["updatedAt.manually"] = format(new Date(), "Pp");

    if (!Side) {
        Side = ["A", "B"];
        const response = [];
        for (let elem of Side) {
            query = { "mcInfo.DTYMCNo": DTYMCNo, "mcInfo.Side": elem };
            console.log(query);
            const result = await dtyMachinesCollection.updateOne(query, docToUpdate, option);
            // console.log("result", result);
            response.push(result);
        }
        res.send(response);
    } else {
        query = { "mcInfo.DTYMCNo": DTYMCNo, "mcInfo.Side": Side };
        const result = await dtyMachinesCollection.updateOne(query, docToUpdate, option);
        // console.log("result", result);
        res.send(result);
    }

    // const option = { upsert: true };
    // // console.log(docToUpdate);
    // const result = await dtyMachinesCollection.updateOne(query, docToUpdate, option);
    // res.send(result);
}

module.exports.searchDtyMachine = async (req, res) => {
    const { searchedCategory, searchedProp, searchText } = req.query;
    let query = {
        "$or": [
            { [`${searchedCategory}.${searchedProp}`]: { $regex: new RegExp(searchText, "i") } }
        ]
    };
    const machines = await dtyMachinesCollection.find(query).toArray();

    machines.sort((a, b) => {
        const dtyMcNoA = parseInt(a.mcInfo?.DTYMCNo.replace('DTYMCNo ', ''));
        const dtyMcNoB = parseInt(b.mcInfo?.DTYMCNo.replace('DTYMCNo ', ''));

        if (dtyMcNoA < dtyMcNoB) {
            return -1;
        } else if (dtyMcNoA > dtyMcNoB) {
            return 1;
        } else {
            const sideOrder = { A: 1, B: 2 };
            const sideComparison = sideOrder[a.mcInfo.Side] - sideOrder[b.mcInfo.Side];

            if (sideComparison === 0) {
                return 0;
            } else {
                return sideComparison;
            }
        }
    });

    res.send(machines);
}

module.exports.updateOtherMC = async (req, res) =>{
    const {Props} = req.body;
    const {DTYMCNo, Side, UpdatesFrom} = req.query;
    const query = {"mcInfo.DTYMCNo" :DTYMCNo, "mcInfo.Side" :Side}
    const option = {upsert: false};
    const docToUpdate = { $set: {} };

    for (let key in Props) {
        for (let n in Props[key]) {
            docToUpdate.$set[`${key}.${n}`] = Props[key][n];
        }
    }

    docToUpdate.$set[`updatedAt.fromMC${UpdatesFrom}`] = format(new Date(), "Pp");

    const result = await dtyMachinesCollection.updateOne(query, docToUpdate, option);
    console.log(result);
    res.send(result);
}