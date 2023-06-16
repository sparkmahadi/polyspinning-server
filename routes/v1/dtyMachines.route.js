const express = require('express');
const dtyMachinesController = require('../../controllers/dtyMachines.controller');

const router = express.Router();

router.route("/").get(dtyMachinesController.getDtyMachines);

// api for getting details of a dty mc. if no side is mentioned in query then it will give resp for both side. else one side as expected.
router.route("/machine-details").get(dtyMachinesController.getDtyMachineDetails);

router.route("/update-from-parameter").put(dtyMachinesController.updateMCFromParams)

router.route("/update-from-present-lot").put(dtyMachinesController.updateMCFromPresentLot);

router.route("/update-manually").put(dtyMachinesController.updateMCManually);

module.exports = router;