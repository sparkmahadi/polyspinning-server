
//     const dtyMachineUpdates = client.db("polyspinning").collection("dtyMachineUpdates");
const { db } = require("../utils/connectDB");
const dtyMachineUpdates = db.collection("dtyMachineUpdates")

module.exports.postDtyMCUpdates = async (req, res) => {
    const { newMCDetails, changedProps } = req.body;
    newMCDetails.uploadedAt = format(new Date(), "Pp");
    newMCDetails.changedProps = changedProps;
    const result = await dtyMachineUpdates.insertOne(newMCDetails);
    // console.log(result);
    res.send(result);
}

module.exports.getDtyMCUpdates = async (req, res) => {

}