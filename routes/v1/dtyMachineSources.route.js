const express = require('express');
const dtyMachineSourcesController = require('../../controllers/dtyMachineSources.controller');

const router = express.Router();

router.route("/")
.get(dtyMachineSourcesController.getDtyMCsFromPresentLot)
.post(dtyMachineSourcesController.postDtyMCsFromPresentLot)
.put(dtyMachineSourcesController.updateDtyMCsFromPresentLot)

router.route("/sortedAndMerged").get(dtyMachineSourcesController.getDtyMCSFromPLSortedMerged);


module.exports = router;