const db = require("../db/queries");
const { body, check, validationResult, matchedData } = require("express-validator");
const passport = require("../passport/passport");
const bcrypt = require("bcryptjs");
const supabase = require("../db/storage");
const multer = require("multer");

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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { files: 10, fileSize: 2097152 } }).array("file");

exports.uploadFile = (req, res, next) => {
    if (!req.user) return res.redirect("/");

    upload(req, res, async function (err) {
        
        if (err instanceof multer.MulterError) {
            const errors = [];
            if (err.code === "LIMIT_FILE_COUNT") errors.push({ path: "file", msg: "You can't upload more than 10 files at a time" });
            else if (err.code === "LIMIT_FILE_SIZE") errors.push({ path: "file", msg: "You can't upload a file with more than 2MB" });
            
            return res.status(400).render("addFileForm", { errors, folderId: req.body.folderId });
        } 
        
        if (err) return next(err);

        try {
            const files = req.files || [];
            const folderId = req.body.folderId;

            await Promise.all(files.map(async (f) => {
                const metadata = await supabase.uploadFile(f, req.user.id);
                if (metadata) {
                    await db.uploadFile(f, req.user.id, folderId ? Number(folderId) : null, metadata.path);
                }
            }));

            if (folderId) return res.redirect(`/folder/${folderId}`);
            return res.redirect("/");
            
        } catch (dbError) {
            return next(dbError);
        }
    });
};

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

    const blob = await supabase.downloadFile(file.path);
    if (!blob) return res.render("notFound404");

    const buffer = Buffer.from(await blob.arrayBuffer());

    res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
    res.setHeader("Content-Type", blob.type || "application/octet-stream");
    return res.send(buffer);
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

    const data = await supabase.deleteFile(file.path);
    if (!data) return res.render("notFound404");

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