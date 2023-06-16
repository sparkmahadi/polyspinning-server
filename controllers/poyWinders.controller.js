// const poyMcDetailsFromPresentLot = client.db("polyspinning").collection("poyMcDetailsFromPresentLot");
const { db } = require("../utils/connectDB");
const poyMcDetailsFromPresentLot = db.collection("poyMcDetailsFromPresentLot")

module.exports.getPoyWinderDetails = async (req, res) => {
    const WinderNo = req.params.WinderNo;
    const query = { WinderNo: WinderNo };
    const winderData = await poyMcDetailsFromPresentLot.findOne(query);
    res.send(winderData);
}