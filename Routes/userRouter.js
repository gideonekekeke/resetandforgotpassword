const express = require("express");
const {
	RegisterUser,
	getAllUsers,
	verifiedUser,
	forgetPasswords,
	newPassword,
} = require("../Controller/userController");
const upload = require("../utils/MulterConfig");

const router = express.Router();

router.route("/reg").post(upload, RegisterUser);
router.route("/").get(getAllUsers);
router.route("/:id/:token").get(verifiedUser);

router.post("/forgetPassword/fog", forgetPasswords);
router.route("/reset/:id/:token").post(newPassword);

module.exports = router;
