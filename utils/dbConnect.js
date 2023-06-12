const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGO_URI;
// const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

let dbConnection;

module.exports = {
    connectToServer: function(callback){
        client.connect(function(err, db){
            if(err || db){
                return callback(err);
            }

            dbConnection = db.db("sample_airbnb");
            console.log("Successfully connected to MongoDB");
            
            return callback;
        })
    },
    getDb: function(){
        return dbConnection;
    }
};