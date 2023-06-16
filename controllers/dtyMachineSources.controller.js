// const dtyMcDetailsFromPresentLot = client.db("polyspinning").collection("dtyMcDetailsFromPresentLot");
const { db } = require("../utils/connectDB");
const dtyMcDetailsFromPresentLot = db.collection("dtyMcDetailsFromPresentLot")

module.exports.getDtyMCsFromPresentLot = async (req, res) => {
    let existingArrWithoutId = [];
    const existingArr = await dtyMcDetailsFromPresentLot.find().toArray();
    for (let elem of existingArr) {
        const { _id, ...rest } = elem;
        existingArrWithoutId.push(rest);
    }
    res.send(existingArrWithoutId);
}

module.exports.getDtyMCSFromPLSortedMerged = async (req, res) => {
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
}

module.exports.postDtyMCsFromPresentLot = async (req, res) => {
    const newMCDetails = req.body;
    const result = await dtyMcDetailsFromPresentLot.insertOne(newMCDetails);
    // console.log(result);
    res.send(result);
}

module.exports.updateDtyMCsFromPresentLot = async (req, res) => {
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
    const docToUpdate = { $set: updatedMCDetails }
    const result = await dtyMcDetailsFromPresentLot.updateOne(query, docToUpdate, option);
    res.send(result);

}