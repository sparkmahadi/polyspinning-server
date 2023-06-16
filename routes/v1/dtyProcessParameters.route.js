const express = require('express');
const dtyProcessParamsController = require('../../controllers/dtyProcessParams.controller');

const router = express.Router();

router.route("/")
.get(dtyProcessParamsController.getDtyProcessParams)
.post(dtyProcessParamsController.postDtyProcessParams);

router.route("/by-query").get(dtyProcessParamsController.getDtyProcessParamsByQuery);

module.exports = router;