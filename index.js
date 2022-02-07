require("dotenv").config();

const express = require("express");
const passport = require("passport");
const cors = require("cors")

const app = express();
const connection = require("./connection");

const User = require("./models/userModels");
const userRouter = require("./routes/user");
const {registerStrategy, loginStrategy, verifyStrategy} = require("./middleware/auth");
const res = require("express/lib/response");
// const { default: Login } = require("./frontend-system/src/components/Login");


app.use(express.json());
app.use(passport.initialize());
app.use(cors());

// http://localhost/user/getallusers - sends request (req)
app.use("/user", userRouter);

passport.use("register", registerStrategy);
passport.use("login", loginStrategy);
passport.use(verifyStrategy);


app.listen(process.env.PORT, () => {
    connection.authenticate();
    User.sync({alter: true});
    console.log("App is Online");
});