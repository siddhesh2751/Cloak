import { Router } from "express";
import { listDevices, login, logout, logoutAll, refresh, register } from "../controllers/auth.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
// import { loginUser, registerUser } from "../controllers/user.controller.js";
//import { verifyJWT } from "../middlewares/auth.middleware.js";

const  router = Router() 

// router.route("/register").post(registerUser)
// router.route("/login").post(loginUser)
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", verifyAccessToken, logout);         // needs access token
router.post("/logout-all", verifyAccessToken, logoutAll); // needs access token
router.get("/devices", verifyAccessToken, listDevices);

//seured routes


export default router