const { MongoClient } = require('mongodb');

// const uri = process.env.MONGO_URI;
const uri = 'mongodb://localhost:27017';


const dbName = 'polyspinning';

const client = new MongoClient(uri);

async function connectToDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB successfully');

    const db = client.db(dbName);

    return db;
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err;
  }
}

module.exports = {
  connectToDB,
  db: client.db(dbName)
};
