const { Router } = require("express");
const controller = require("../controllers/index");
const multer = require("multer");
const path = require("node:path");
const crypto = require("node:crypto");
const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "saved"));
  },
  filename: function (req, file, cb) {
    const uuid = crypto.randomUUID();
    cb(null, `${uuid}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage })

router.get("/", controller.getIndex);
router.get("/sign-up", controller.getSignUpPage);
router.post("/sign-up", controller.createUser);
router.get("/log-in", controller.getLogInPage)
router.post("/log-in", controller.logInUser);
router.get("/log-out", controller.logOutUser);

router.get("/add-file", controller.getAddFilePage);
router.post("/add-file", upload.array("file"), controller.uploadFile);

module.exports = router;