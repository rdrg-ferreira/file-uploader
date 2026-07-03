const { Router } = require("express");
const controller = require("../controllers/index");
const router = Router();

router.get("/", controller.getIndex);
router.get("/sign-up", controller.getSignUpPage);
router.post("/sign-up", controller.createUser);
router.get("/log-in", controller.getLogInPage)
router.post("/log-in", controller.logInUser);
router.get("/log-out", controller.logOutUser);

module.exports = router;