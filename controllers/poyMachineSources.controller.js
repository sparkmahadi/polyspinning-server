const { format } = require("date-fns");
const { db } = require("../utils/connectDB");
const { ObjectId } = require("mongodb");
const poyMcDetailsFromPresentLot = db.collection("poyMcDetailsFromPresentLot");
const dtyMachinesCollection = db.collection("dtyMachines")

module.exports.getPoyMCsFromPresentLot = async (req, res) => {
  const existingArr = await poyMcDetailsFromPresentLot.find().toArray();
  const sortedArr = existingArr.sort((a, b) => a.WinderNo - b.WinderNo)
  res.send(sortedArr);
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


module.exports.updateDtyMcByPoyInfo = async (req, res) => {
  const responses = [];
  const updateData = async (query, docToUpdate, option) => {
    const result = await dtyMachinesCollection.updateMany(query, docToUpdate, option);
    return result;
  };
  try {
    const {poySummary, time} = req.body;
    const option = { upsert: false };
    const findDataPromises = poySummary.map((info) => {
      const summary = info.Summary;
      const findDataPromisesPerInfo = Object.entries(summary).map(async (smry) => {
        const keyString = smry[0];
        const [denier, filaments, bobbinColor, poyColor, chipsName, ends] = keyString.split('-');
        const value = smry[1];
        const minDenier = (parseInt(denier) - 5).toString();
        const maxDenier = (parseInt(denier) + 5).toString();

        let query = {
          "POYInfo.POYLine": info.LineNo,
          "POYInfo.POYDenier": { $gte: minDenier, $lte: maxDenier },
          "POYInfo.Filaments": filaments,
          "POYInfo.POYColor": poyColor,
        };

        const docToUpdate = {
          $set: {
            "POYInfo.TotalWinder": value,
            "POYInfo.POYBobbin": bobbinColor,
            "POYInfo.ChipsName": chipsName,
            "POYInfo.EndsPerWinder": ends,
            "updatedAt.POYLotUpdate": time,
          },
        };

        const result = await updateData(query, docToUpdate, option);
        if (result.modifiedCount > 0) {
          responses.push(result);
        }
        return result;

      });

      return Promise.all(findDataPromisesPerInfo);
    });
    const updateResults = await Promise.all(findDataPromises);
    // console.log("updateResults", updateResults);
    await res.send(responses);
    console.log(responses);
  } catch (error) {
    res.status(500).send("An error occurred while updating the database.");
  }
};

module.exports.deletePoyMC = async(req, res) =>{
  const {id} = req.params;
  const query = {_id: new ObjectId(id)};
  const result = await poyMcDetailsFromPresentLot.deleteOne(query);
  console.log(result);
  res.send(result);
}