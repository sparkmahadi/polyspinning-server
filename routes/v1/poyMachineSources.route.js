const express = require('express');
const poyMachineSources = require('../../controllers/poyMachineSources.controller');

const router = express.Router();

router.route("/")
.get(poyMachineSources.getPoyMCsFromPresentLot)
.post(poyMachineSources.postPoyMCsFromPresentLot)
.put(poyMachineSources.updatePoyMCsFromPresentLot)

module.exports = router;