const { db } = require("../utils/connectDB");
const blogsCollection = db.collection("blogs")

module.exports.postDtyMCUpdates = async (req, res) => {
    const { newMCDetails, changedProps } = req.body;
    newMCDetails.uploadedAt = format(new Date(), "Pp");
    newMCDetails.changedProps = changedProps;
    const result = await dtyMachineUpdates.insertOne(newMCDetails);
    // console.log(result);
    res.send(result);
}

module.exports.getBlogs = async (req, res) => {
const blogs = await blogsCollection.find({}).toArray();
res.send(blogs);
}