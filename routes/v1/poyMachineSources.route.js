const express = require('express');
const poyMachineSourcesController = require('../../controllers/poyMachineSources.controller');

const router = express.Router();

router.route("/")
.get(poyMachineSourcesController.getPoyMCsFromPresentLot)
.post(poyMachineSourcesController.postPoyMCsFromPresentLot)
.put(poyMachineSourcesController.updatePoyMCsFromPresentLot)

router.route("/delete/:id").delete(poyMachineSourcesController.deletePoyMC);

router.route("/update-poyInfo-in-dty-machines").put(poyMachineSourcesController.updateDtyMcByPoyInfo);

module.exports = router;