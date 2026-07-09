const db = require("../db/queries");
const { body, validationResult, matchedData } = require("express-validator");
const passport = require("../passport/passport");
const bcrypt = require("bcryptjs");

exports.getIndex = async (req, res) => {
    if (!req.user) return res.redirect("/log-in");

    const userId = req.user.id;

    const [files, folders] = await db.getFolderContent(undefined, userId);
    res.render("index", {
        files,
        folders,
        currentFolderId: null,
    });
}

exports.getSignUpPage = (req, res) => {
    res.render("signUpForm");
}

const validateUser = [
    body("name")
        .trim()
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage(
            "Name can only contain letters, spaces, apostrophes, and hyphens",
        )
        .isLength({ min: 3, max: 100 })
        .withMessage("Name must have at least 3 letters"),
    body("username")
        .trim()
        .isAlphanumeric()
        .withMessage("Username must be alphanumeric")
        .isLength({ min: 3, max: 100 })
        .withMessage("Username must have at least 3 characters")
        .custom(async (value) => {
            const user = await db.getUser({ username: value });
            if (user) throw new Error("Username already exists");
        }),
    body("password")
        .trim()
        .isLength({ min: 6, max: 100 })
        .withMessage("Password must have at least 6 characters"),
    body("confirmPassword")
        .custom((value, { req }) => {
            return value === req.body.password;
        })
        .withMessage("Passwords do not match."),
];

exports.createUser = [
    validateUser,
    async (req, res) => {
        if (req.user) return res.redirect("/");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("signUpForm", { errors: errors.array() });
        }

        const { name, username, password } = matchedData(req);
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await db.createUser(name, username, hashedPassword);
        res.redirect("/log-in");
    },
];

exports.getLogInPage = (req, res) => {
    const loginMessage = req.session.messages?.[0];
    let loginErrorField = "password";

    if (loginMessage === "Incorrect username") {
        loginErrorField = "username";
    }

    res.render("logInForm", {
        loginMessage,
        loginErrorField,
    });
    req.session.messages = undefined;
}

exports.logInUser = (req, res, next) => {
    return passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/log-in",
        failureMessage: true,
    })(req, res, next);
}

exports.logOutUser = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("/");
    });
}

exports.getAddFilePage = (req, res) => {
    const { folderId } = req.query;
    res.render("addFileForm", { folderId });
}

const validateFiles = [];

exports.uploadFile = [
    validateFiles,
    async (req, res) => {
        if (!req.user) return res.redirect("/");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("addFileForm", { errors: errors.array() });
        }

        const files = req.files;
        const folderId = req.body.folderId;
        const count = await db.uploadFile(files, req.user.id, folderId ? Number(folderId) : null);
        if (folderId) res.redirect(`/folder/${folderId}`);
        else res.redirect("/");
    }
];

exports.getAddFolderPage = (req, res) => {
    const { parentId } = req.query;
    res.render("addFolderForm", { parentId });
}

const validateFolder = [];

exports.uploadFolder = [
    validateFolder,
    async (req, res) => {
        if (!req.user) return res.redirect("/");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("addFolderForm", { errors: errors.array() });
        }

        //const { name, parentId } = matchedData(req);
        const { name, parentId } = req.body;
        const count = await db.uploadFolder(name, req.user.id, parentId ? Number(parentId) : null);
        if (parentId) res.redirect(`/folder/${parentId}`);
        else res.redirect("/");
    }
];

exports.getFolder = async (req, res) => {
    if (!req.user) return res.redirect("/log-in");

    const userId = req.user.id;
    const { folderId } = req.params;

    const folder = await db.getFolder(folderId);

    if (folder === null) {
        return res.render("notFound404");
    }

    const folderOwnerId = folder?.ownerId;

    if (folderOwnerId === undefined || userId !== folderOwnerId) {
        return res.render("index", {
            files: [],
            folders: [],
            currentFolderId: null,
            error: "You don't have permission to access this folder",
        });
    }

    const [files, folders] = await db.getFolderContent(folderId, userId);
    res.render("index", {
        files,
        folders,
        currentFolderId: folderId,
        parentId: folder.parentId,
    });
}

exports.downloadFile = async (req, res) => {
    if (!req.user) return res.redirect("/log-in");

    const userId = req.user.id;
    const { fileId } = req.params;

    const file = await db.getFile(fileId);

    if (file === null) {
        return res.render("notFound404");
    }

    const fileOwnerId = file?.ownerId;

    if (fileOwnerId === undefined || userId !== fileOwnerId) {
        return res.status(403).render("index", {
            files: [],
            folders: [],
            currentFolderId: null,
            error: "You don't have permission to access this folder and download this file",
        });
    }

    return res.download(file.path, file.name);
}

exports.deleteFile = async (req, res) => {
    if (!req.user) return res.redirect("/log-in");

    const userId = req.user.id;
    const { fileId } = req.params;

    const file = await db.getFile(fileId);

    if (file === null) {
        return res.render("notFound404");
    }

    const fileOwnerId = file?.ownerId;

    if (fileOwnerId === undefined || userId !== fileOwnerId) {
        return res.render("index", {
            files: [],
            folders: [],
            currentFolderId: null,
            error: "You don't have permission to access this folder and delete this file",
        });
    }

    await db.deleteFile(fileId);
    if (file.folderId) res.redirect(`/folder/${file.folderId}`);
    else res.redirect("/");
}

exports.deleteFolder = async (req, res) => {
    if (!req.user) return res.redirect("/log-in");

    const userId = req.user.id;
    const { folderId } = req.params;

    const folder = await db.getFolder(folderId);

    if (folder === null) {
        return res.render("notFound404");
    }

    const folderOwnerId = folder?.ownerId;

    if (folderOwnerId === undefined || userId !== folderOwnerId) {
        return res.render("index", {
            files: [],
            folders: [],
            currentFolderId: null,
            error: "You don't have permission to access this folder and delete it",
        });
    }

    await db.deleteFolderAndContent(folderId);
    if (folder.parentId) res.redirect(`/folder/${folder.parentId}`);
    else res.redirect("/");
}