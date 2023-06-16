
    // const poyMcDetailsFromPresentLot = client.db("polyspinning").collection("poyMcDetailsFromPresentLot");
    const { db } = require("../utils/connectDB");
    const poyMcDetailsFromPresentLot = db.collection("poyMcDetailsFromPresentLot")

module.exports.getPoyMCsFromPresentLot = async (req, res) => {
    let existingArrWithoutId = [];
    const existingArr = await poyMcDetailsFromPresentLot.find().toArray();
    const sortedExistingArr = existingArr.sort((a, b) => a.WinderNo - b.WinderNo)
    for (let elem of sortedExistingArr) {
        const { _id, uploadedAt, ...rest } = elem;
        existingArrWithoutId.push(rest);
    }
    res.send(existingArrWithoutId);
}

module.exports.postPoyMCsFromPresentLot = async (req, res) => {
    const newWinderData = req.body;
    newWinderData.uploadedAt = format(new Date(), "Pp");
    newWinderData.updatedAt = "-";
    const result = await poyMcDetailsFromPresentLot.insertOne(newWinderData);
    res.send(result);
}

module.exports.updatePoyMCsFromPresentLot = async (req, res) => {
    const { winderDetails, changedProps } = req.body;
    const changedPropsWithoutId = changedProps.filter(element => element !== '_id');
    const query = { WinderNo: winderDetails.WinderNo };
    const option = { upsert: true };

    let updatedMCDetails = {};
    if (winderDetails) {
        for (let key of changedPropsWithoutId) {
            updatedMCDetails[key] = winderDetails[key];
        }
        updatedMCDetails.updatedAt = format(new Date(), "Pp");
    }
    const docToUpdate = { $set: updatedMCDetails }
    const result = await poyMcDetailsFromPresentLot.updateOne(query, docToUpdate, option);
    res.send(result);

}