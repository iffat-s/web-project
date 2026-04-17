import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  // 1. Get the token from the request header
  // Standard format is: "Bearer YOUR_TOKEN_STRING"
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // 2. If there is no token, don't let them proceed
  if (!token) {
    return res.status(403).json({ message: "No token provided. Access denied." });
  }

  try {
    // 3. Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

    // 4. Attach the decoded user data (ID and Role) to the request object
    // This allows your controllers to know WHO is making the request
    req.user = decoded;

    // 5. Everything is good! Move to the next function (the controller)
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};