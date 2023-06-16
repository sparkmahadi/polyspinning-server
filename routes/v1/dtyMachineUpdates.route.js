const express = require('express');
const dtyMCUpdatesController = require('../../controllers/dtyMCUpdates.controller');

const router = express.Router();

router.route("/").get(dtyMCUpdatesController.getDtyMCUpdates).post(dtyMCUpdatesController.postDtyMCUpdates);

module.exports = router;