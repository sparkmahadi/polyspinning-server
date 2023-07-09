const { db } = require("../utils/connectDB");
const usersCollection = db.collection("users");

module.exports.getUsers = async (req, res) => {
    const user = await usersCollection.find({}).toArray();
    res.send(user);
}

module.exports.registerUser = async (req, res) => {
    const user = req.body;
    const query = { email: user.email };
    const oldUser = await usersCollection.findOne(query);
    if (!oldUser) {
        const result = await usersCollection.insertOne(user);
        return res.send(result);
    }
    return res.send({ message: "Welcome Back!" });
}

module.exports.searchUser = async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    res.send(user);
}

module.exports.verifyUser = async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const verification = req.body;
    const option = { upsert: true };
    const updateUser = {
        $set: {
            verified: verification.verified
        }
    };
    const result = await usersCollection.updateOne(query, updateUser, option);
    res.send(result);
}

module.exports.deleteUser = async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await usersCollection.deleteOne(query);
    res.send(result);
}

module.exports.checkUserRole = async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    res.send({ accountType: user?.accountType });
}