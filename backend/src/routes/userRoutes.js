import express from "express";

function createUserRouter(userController) {
  const router = express.Router();

  router.post("/register", userController.createUser);
  router.get("/users", userController.getUsers);
  router.post("/login", userController.login);
  router.post("/logout", userController.logout);
  return router;
}

export default createUserRouter;