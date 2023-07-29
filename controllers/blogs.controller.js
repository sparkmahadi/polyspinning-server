const { ObjectId } = require("mongodb");
const { db } = require("../utils/connectDB");
const blogsCollection = db.collection("blogs")

module.exports.getBlogs = async (req, res) => {
    const blogs = await blogsCollection.find({}).toArray();
    res.send(blogs);
}

module.exports.getBlogDetails = async (req, res) => {
    const { id } = req.params;
    const query = { _id : new ObjectId(id)};
    const result = await blogsCollection.findOne(query);
    res.send(result);
}

module.exports.postBlog = async (req, res) => {
    const article = req.body;
    const result = await blogsCollection.insertOne(article);
    res.send(result);
}

module.exports.updateBlog = async (req, res) => {
    const article = req.body;
    const query = { _id: new ObjectId(article._id) };
    const option = { upsert: false };

    const docToUpdate = {
        $set: {
            title: article.title,
            detail: article.detail
        }
    };
    const result = await blogsCollection.updateOne(query, docToUpdate, option);
    res.send(result);
}

module.exports.deleteBlog = async (req, res) => {
    const { id } = req.params;
    const query = { _id: new ObjectId(id) };
    const result = await blogsCollection.deleteOne(query);
    res.send(result);
}