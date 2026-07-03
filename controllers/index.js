const db = require("../db/queries");
const { body, validationResult, matchedData } = require("express-validator");
const passport = require("../passport/passport");
const bcrypt = require("bcryptjs");

exports.getIndex = (req, res) => {
    res.render("index");
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
            return res.status(400).render("sign-up-form", { errors: errors.array() });
        }

        const { name, username, password } = matchedData(req);
        const hashedPassword = await bcrypt.hash(password, 10);
        const rows = await db.createUser(name, username, hashedPassword);
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