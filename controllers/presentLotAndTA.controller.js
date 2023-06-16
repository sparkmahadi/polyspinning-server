const { ObjectId } = require("mongodb");
const { db } = require("../utils/connectDB");
const dtyPresentLotAndTransfer = db.collection("presentLotAndTransfer")

module.exports.getPresentLotData = async (req, res) => {
    // serves the latest lot data i.e. findOne
    const result = await dtyPresentLotAndTransfer.findOne({}, { sort: { uploadedAt: -1 } });
    res.send(result);
}

module.exports.uploadPresentLot = async (req, res) => {
    const excelData = req.body;
    const result = await dtyPresentLotAndTransfer.insertOne(excelData);
    res.send(result);
}

module.exports.getPresentLotHistory = async (req, res) => {
    const result = await dtyPresentLotAndTransfer.find({}, { sort: { uploadedAt: -1 } }).toArray();
    res.send(result);
}

module.exports.getLotDataById = async (req, res) => {
    const {id} = req.params;
    const query = { _id : new ObjectId(id)};
    const result = await dtyPresentLotAndTransfer.findOne(query);
    res.send(result);
}