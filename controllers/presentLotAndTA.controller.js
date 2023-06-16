const { db } = require("../utils/connectDB");
const dtyPresentLotAndTransfer = db.collection("presentLotAndTransfer")

module.exports.getPresentLotData = async (req, res) => {
    const result = await dtyPresentLotAndTransfer.findOne({}, { sort: { uploadedAt: -1 } });
    res.send(result);
}

module.exports.uploadPresentLot = async (req, res) => {
    const excelData = req.body;
    const result = await dtyPresentLotAndTransfer.insertOne(excelData);
    res.send(result);
}