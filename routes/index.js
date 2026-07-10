const { Router } = require("express");
const controller = require("../controllers/index");
const path = require("node:path");
const crypto = require("node:crypto");
const router = Router();

router.get("/", controller.getIndex);
router.get("/sign-up", controller.getSignUpPage);
router.post("/sign-up", controller.createUser);
router.get("/log-in", controller.getLogInPage)
router.post("/log-in", controller.logInUser);
router.get("/log-out", controller.logOutUser);

router.get("/add-file", controller.getAddFilePage);
router.post("/add-file", controller.uploadFile);
router.post("/delete-file/:fileId", controller.deleteFile);

router.get("/add-folder", controller.getAddFolderPage);
router.post("/add-folder", controller.uploadFolder);
router.post("/delete-folder/:folderId", controller.deleteFolder);

router.get("/folder/:folderId", controller.getFolder);
router.get("/download/:fileId", controller.downloadFile);

module.exports = router;