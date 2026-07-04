const express = require("express");
const session = require("express-session");
const passport = require("./passport/passport");
const LocalStrategy = require('passport-local').Strategy;
const path = require("node:path");
const indexRouter = require("./routes/index");
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const prisma = require("./db/prisma.js");

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    },
    store: new PrismaSessionStore(
        prisma,
        {
            checkPeriod: 2 * 60 * 1000,  // ms
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }
    )
}));
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

app.use("/", indexRouter);
// add other routers

app.get("/{*splat}", (req, res) => {
    res.status(404).render("notFound404");
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render("error500");
});

const PORT = 3000;
app.listen(PORT, (error) => {
    if (error) throw error;
    console.log(`Express app listening at http://localhost:${PORT}/`);
});
