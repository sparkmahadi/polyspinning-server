const express = require('express');
const poyWinderUpdatesController = require('../../controllers/poyWinderUpdates.controller');

const router = express.Router();

router.route("/")
.get(poyWinderUpdatesController.getPoyWinderUpdates)
.post(poyWinderUpdatesController.postPoyWinderUpdates)

router.route("/update-dty-machines").put();

module.exports = router;