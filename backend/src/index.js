import dotenv from "dotenv";
import AppDataSource from "./config/data-source.js";
import app, { setupRoutes } from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully");

    const userRepository = AppDataSource.getRepository("User");
   

    setupRoutes(userRepository);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });