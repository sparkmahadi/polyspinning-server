const { format } = require("date-fns");
const { db } = require("../utils/connectDB");
const poyMcDetailsFromPresentLot = db.collection("poyMcDetailsFromPresentLot");
const dtyMachinesCollection = db.collection("dtyMachines")

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

const updateData = async (query, docToUpdate, option) => {
    const data = await dtyMachinesCollection.updateMany(query, docToUpdate, option);
    console.log("data", data);
    return data;
};

module.exports.updateDtyMcByPoyInfo = async (req, res) => {
    try {
      const poySummary = req.body;
      const time = format(new Date(), "Pp");
      const responses = [];
      const option = { upsert: false };
      const findDataPromises = poySummary.map((info) => {
        const summary = info.Summary;
        const findDataPromisesPerInfo = Object.entries(summary).map(async (smry) => {
          const keyString = smry[0];
          const [denier, filaments, bobbinColor, poyColor, chipsName, ends] = keyString.split('-');
          const value = smry[1];
          const minDenier = (parseInt(denier) - 5).toString();
          const maxDenier = (parseInt(denier) + 5).toString();
  
          const query = {
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
          if(result.modifiedCount > 0){
              responses.push(result);
          }
          return result;
        });
  
        return Promise.all(findDataPromisesPerInfo);
      });
      const updateResults = await Promise.all(findDataPromises);
      await res.send(responses);
    } catch (error) {
      res.status(500).send("An error occurred while updating the database.");
    }
  };