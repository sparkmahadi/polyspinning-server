
//     const poyWinderUpdates = client.db("polyspinning").collection("poyWinderUpdates");
const { db } = require("../utils/connectDB");
const poyWinderUpdates = db.collection("poyWinderUpdates")

module.exports.getPoyWinderUpdates = async (req, res) => {
    const result = await poyWinderUpdates.find({}).toArray();
    res.send(result);
}

module.exports.postPoyWinderUpdates = async (req, res) => {
    const { WinderData, changedProps } = req.body;
    WinderData.uploadedAt = format(new Date(), "Pp");
    const result = await poyWinderUpdates.insertOne({ winderDetails: WinderData, changedProps });
    // console.log(result);
    res.send(result);
}