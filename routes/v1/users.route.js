const express = require('express');
const usersController = require('../../controllers/users.controller');

const router = express.Router();

router.route('/')
.get(usersController.getUsers)
// to post the users
.post(usersController.registerUser)

router.route('/:email')
// to load a user to check availability in db
.get(usersController.searchUser)
// to update verified status of users
.put(usersController.verifyUser)

router.route("/:id")
.delete(usersController.deleteUser)

// to check the accountType of user and admin
router.route("/accTypeCheck/:email").get(usersController.checkUserRole)

module.exports = router;