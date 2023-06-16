const express = require('express');
const poyWinderUpdatesController = require('../../controllers/poyWinderUpdates.controller');

const router = express.Router();

router.route("/")
.get(poyWinderUpdatesController.getPoyWinderUpdates)
.post(poyWinderUpdatesController.postPoyWinderUpdates)

module.exports = router;