const express = require('express');
const dtyMCUpdatesController = require('../../controllers/dtyMCUpdates.controller');

const router = express.Router();

router.route("/")

/**
 * @api {get} /api/v1/dty-machine-updates
 * @apiDescription Get all DTY machine updates data recorded
 * @apiPermission All Users
 * 
 * @apiHeader nothing
 * 
 * @apiParam nothing
 * 
 * @apiSuccess {Object[]} full lot information
 * 
 * @apiError no data available in database
 */

.get(dtyMCUpdatesController.getDtyMCUpdates)

/**
 * @api {post} /api/v1/dty-machine-updates
 * @apiDescription Post DTY machine updates through changes in frontend
 * @apiPermission Admin only
 * 
 * @apiHeader nothing
 * @apiBody {Object}, {machineData, updatedProperties, updatedFrom, updatedAt}
 * 
 * @apiParam nothing
 * 
 * @apiSuccess {Object}
 * 
 * @apiError no data available in database
 */
.post(dtyMCUpdatesController.postDtyMCUpdates);

module.exports = router;