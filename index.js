const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const { format } = require('date-fns');
const { connectToDB } = require('./utils/connectDB');
const presentLotAndTARoute = require('./routes/v1/presentLotAndTA.route');
const dtyMachinesRoute = require('./routes/v1/dtyMachines.route');
const dtyMachineSourcesRoute = require('./routes/v1/dtyMachineSources.route');
const dtyMachineUpdatesRoute = require('./routes/v1/dtyMachineUpdates.route');
const dtyProcessParamsRoute = require('./routes/v1/dtyProcessParameters.route');
const poyMachineSourcesRoute = require('./routes/v1/poyMachineSources.route');
const poyWinderRoute = require('./routes/v1/poyWinders.route');
const poyWinderUpdatesRoute = require('./routes/v1/poyWinderUpdates.route');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());;
app.use(express.json());

connectToDB()
  .then(() => {
    app.listen(port, () => { console.log(`polyspinning server is running on port ${port}`) })
  })
  .catch((err) => {
    console.error('Error starting server:', err);
  });

app.use("/api/v1/present-lot-and-transfer-area", presentLotAndTARoute);
app.use("/api/v1/dty-machines", dtyMachinesRoute);
app.use("/api/v1/dty-machine-details-from-present-lot", dtyMachineSourcesRoute)
app.use("/api/v1/dty-machine-updates", dtyMachineUpdatesRoute)
app.use("/api/v1/dty-process-parameters", dtyProcessParamsRoute)
app.use("/api/v1/poy-machine-details-from-present-lot", poyMachineSourcesRoute)
app.use("/api/v1/poy-winders", poyWinderRoute)
app.use("/api/v1/poy-winder-updates", poyWinderUpdatesRoute)

// async function run() {
//     const dtyMachinesCollection = client.db("polyspinning").collection("dtyMachines");
//     const dtyMcDetailsFromPresentLot = client.db("polyspinning").collection("dtyMcDetailsFromPresentLot");
//     const poyMcDetailsFromPresentLot = client.db("polyspinning").collection("poyMcDetailsFromPresentLot");
//     const dtyMachineUpdates = client.db("polyspinning").collection("dtyMachineUpdates");
//     const poyWinderUpdates = client.db("polyspinning").collection("poyWinderUpdates");
//     const dtyProcessParams = client.db("polyspinning").collection("dtyProcessParams");

// // dtyMachines

// // p.lot and ta

// // all dty machines from different sources

// dty machine updates

// dty process parameters or in short, params

// // all poy machines from different sources

// poy winders

// poy winder updates

// }

// run().catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Polyspinning server is running')
})

app.all("*", (req, res)=>{
    res.send("No routes found in server");
})