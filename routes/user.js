

const router = require("express").Router();
const User = require("../models/userModels");
const jwt = require("jsonwebtoken")



const hash = require("../hash.js");
const passport = require("passport");
const JwtStrategy = require("passport-jwt/lib/strategy");
const saltRounds = parseInt(process.env.SALT_ROUNDS);

const session = {session:false};

/* profile */

const profile = (req,res,next) => {
    res.status(200).json({message: "profile", user: req.user, token: req.query.secret_token});
}

router.get("/", passport.authenticate("jwt", session), profile);

/* register user */

// takes the authenticated req and returns a response
const register = async (req,res,next) => {
    try {
        req.user.name ? res.status(201).json({msg: 'user registered', user: req.user}) : res.status(401).json({msg:"User already exists"});
    } catch (error) {
        next (error);
    }
};

// http://localhost/user/createuser
// register router - authenticate using registerStrategy (names 'register') and 
// passes on the register function defined above
router.post("/registeruser", passport.authenticate("register", session), register);


/* LOGIN */

const login = async (req,res,next) => {
    passport.authenticate("login", (error, user) => {
        try {
            if (error) {
                res.status(500).json({message: "Internal Server Error"})
            } else if (!user) {
                res.status(401).json(info);
            } else {
                const loginFn = (error) => {
                    if(error){
                        return next(error);
                    } else {
                        const userData = {id:user.id, name: user.name};
                        const data = {user, token: jwt.sign({user: userData}, process.env.SECRET_KEY)};
                        res.status(200).json(data);
                    }
                }
                req.login(user, session, loginFn)
            }
        } catch (error) {
            return next(error)
        }
    }) (req,res,next); //IFFY - immediately invoked function expression
};

router.post("/userlogin", login);



// get all users
router.get("/", async(req,res) => {
    const allUsers = await User.findAll({
        attributes: ["id","name"]
    });
    res.status(200).json({msg: "users retrieved", data: allUsers});
})

// create a user
router.post("/", async(req,res) => {
    const user = await User.create({
        name:req.body.name,
        passwordHash: req.body.password
    });
    res.status(201).json({msg: "user created"});
});

// delate all users
router.delete("/", async(req,res) => {
    const userDelete = await User.destroy({where:{}});
    console.log(userDelete)
    res.status(200).json({msg:"all users deleted"} );
});

// get a single location
router.get("/:id", async(req,res) => {
    const user = await User.findOne({where:{id:req.params.id}})
    res.status(200).json({msg:`user found`});
});

// update a single user
router.put("/:id", async(req,res) =>{
    const updateUser = await User.update({name: req.body.newName}, {where: {id: req.params.id}});
    const user = await User.findOne({where: {id: req.params.id}})
    res.status(202).json({msg: `${user} updated`});
});

// delete a single user 
router.delete("/:id", async(req,res) => {
    const user = await User.findOne({where: {id: req.params.id}});
    const deletedUser = await user.destroy();
    console.log(deletedUser)
    res.status(201).json({msg: `user deleted`});
});

module.exports = router;