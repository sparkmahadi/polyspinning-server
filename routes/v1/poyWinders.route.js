const express = require('express');
const poyWinderController = require('../../controllers/poyWinders.controller');

const router = express.Router();

router.route("/:WinderNo")
.get(poyWinderController.getPoyWinderDetails)

module.exports = router;