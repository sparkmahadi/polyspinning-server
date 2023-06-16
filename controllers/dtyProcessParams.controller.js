
//     const dtyProcessParams = client.db("polyspinning").collection("dtyProcessParams");
const { db } = require("../utils/connectDB");
const dtyProcessParams = db.collection("dtyProcessParams")

module.exports.getDtyProcessParams = async (req, res) => {
    const needQuery = req.query.need;
    let existingParamsWithoutId = [];
    if (needQuery === "withoutIdAndTime") {
        const existingParams = await dtyProcessParams.find({}, { sort: { uploadedAt: -1 } }).toArray();
        for (let elem of existingParams) {
            const { _id, uploadedAt, ...rest } = elem;
            existingParamsWithoutId.push(rest);
        }
        res.send(existingParamsWithoutId);
    }
    else {
        const existingParams = await dtyProcessParams.find({}, { sort: { uploadedAt: -1 } }).toArray();
        for (let elem of existingParams) {
            const { _id, ...rest } = elem;
            existingParamsWithoutId.push(rest);
        }
        res.send(existingParamsWithoutId);
    }
}

module.exports.getDtyProcessParamsByQuery = async (req, res) => {
    const machineNo = req.query.machineNo;
    const machinesString = req.query.machines;

    const getData = async (machineNo) => {
        const nonDigitRegex = /\D/;
        const containsOnlyNumbers = !nonDigitRegex.test(machineNo);
        if (containsOnlyNumbers) {
            // its full machine
            const paramOfFullMC = await dtyProcessParams.findOne({ DTYMCNo: machineNo }, { sort: { uploadedAt: -1 } });
            if (paramOfFullMC) { return (paramOfFullMC); }
            else { return { message: `No parameters found for M/C #${machineNo}` } }
        } else {
            // its half machine. if data for half MC is found then send it, otherwise look for params with full MC.
            const existingParams = await dtyProcessParams.findOne({ DTYMCNo: machineNo }, { sort: { uploadedAt: -1 } });
            if (!existingParams) {
                const fullMC = (parseInt(machineNo)).toString();
                const paramOfFullMC = await dtyProcessParams.findOne({ DTYMCNo: fullMC }, { sort: { uploadedAt: -1 } });
                if (paramOfFullMC) {
                    // overwriting the machine no with one side only for frontend
                    paramOfFullMC.DTYMCNo = machineNo;
                    return (paramOfFullMC);
                }
                else { return { message: `No parameters found for M/C #${machineNo}` } }
            } else {
                return (existingParams);
            }
        }
    };

    if (machineNo) {
        const response = await getData(machineNo);
        res.send(response);
    } else if (machinesString) {
        const machinesArr = machinesString.split(",");
        const data = [];
        for (let machineNo of machinesArr) {
            const response = await getData(machineNo);
            data.push(response);
        }
        res.send(data);
    } else {
        res.send({ message: "machine query is not found" });
    }

}

module.exports.postDtyProcessParams = async (req, res) => {
    const paramDetails = req.body;
    paramDetails.uploadedAt = format(new Date(), "Pp");
    const result = await dtyProcessParams.insertOne(paramDetails);
    res.send(result);
}