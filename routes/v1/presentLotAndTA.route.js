const express = require('express');
const presentLotAndTAController = require('../../controllers/presentLotAndTA.controller');

const router = express.Router();


router.route("/")

/**
 * @api {get} /api/v1/present-lot-and-transfer-area
 * @apiDescription Get Latest DTY Present Lot and Transfer Area Data
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

.get(presentLotAndTAController.getPresentLotData)

/**
 * @api {post} /api/v1/present-lot-and-transfer-area
 * @apiDescription Post Latest DTY Present Lot and Transfer Area Data
 * @apiPermission Admin only
 * 
 * @apiHeader nothing
 * @apiBody {Array}, specTitles and specDetails
 * 
 * @apiParam nothing
 * 
 * @apiSuccess {Object[]} full lot information
 * 
 * @apiError no data available in database
 */

.post(presentLotAndTAController.uploadPresentLot)


router.route("/history").get(presentLotAndTAController.getPresentLotHistory)
router.route("/history/:id").get(presentLotAndTAController.getLotDataById)

module.exports = router;