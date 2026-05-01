import express from "express";
import validateRegister from "../middleware/validateRegister.js";
import validateLogin from "../middleware/validateLogin.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import loggerMiddleware from "../middleware/loggermiddleware.js";

function createUserRouter(userController) {
  const router = express.Router();

  router.use(loggerMiddleware);

  router.post("/register", validateRegister, userController.createUser);
  router.post("/login", validateLogin, userController.login);
  router.post("/logout", authMiddleware, userController.logout);

  router.get("/users", authMiddleware, roleMiddleware("admin"), userController.getUsers);
  router.get("/users/:id", authMiddleware, userController.getUserById);
  router.put("/users/:id", authMiddleware, userController.updateUser);
  router.delete("/users/:id", authMiddleware, roleMiddleware("admin"), userController.deleteUser);

  return router;
}

export default createUserRouter;