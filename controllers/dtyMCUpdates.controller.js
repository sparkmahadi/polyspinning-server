const { db } = require("../utils/connectDB");
const dtyMachineUpdates = db.collection("dtyMachineUpdates")

module.exports.postDtyMCUpdates = async (req, res) => {
    const {machineData, updatedProperties, updatedFrom, updatedAt} = req.body;
    const updateInfo = {machineData, updatedProperties, updatedFrom, updatedAt};
    const result = await dtyMachineUpdates.insertOne(updateInfo);
    // console.log(result);
    res.send(result);
}

module.exports.getDtyMCUpdates = async (req, res) => {
    const machines = await dtyMachineUpdates.find({}).toArray();
    res.send(machines);
}