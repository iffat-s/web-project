import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AppDataSource from "../config/data-source.js";

const userRepository = AppDataSource.getRepository("User");

export const register = async (req, res) => {
    try {
        const { name, email, password, totalPoints, lifeTimePoints } = req.body;

        // check existing user
        const existingUser = await userRepository.findOneBy({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = userRepository.create({
            name,
            email,
            password: hashedPassword,
            totalPoints: totalPoints || 0, // default to 0 if not provided
            lifetimePoints: lifeTimePoints || 0 // default to 0 if not provided
        });

        const savedUser = await userRepository.save(newUser);

        // --- JWT ADDITION ---
        const token = jwt.sign(
            { id: savedUser.id }, 
            process.env.JWT_SECRET || "secret", 
            { expiresIn: "1d" }
        );

        res.status(201).json({
            message: "User registered successfully",
            token, // Send token back
            user: savedUser
        });
    } catch (error) {
        res.status(500).json({
            message: "Error registering user",
            error: error.message
        });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
       // const user = await userRepository.findOneBy({ email });
       const user = await userRepository.findOne({
        where: { email },
        select: ["id", "name", "email", "password", "totalPoints", "lifetimePoints"] // Force password selection
    });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // --- JWT ADDITION ---
        const token = jwt.sign(
            { id: user.id }, 
            process.env.JWT_SECRET || "secret", 
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            token, // This is the 'VIP Pass' for protected routes
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                totalPoints: user.totalPoints,
                lifetimePoints: user.lifetimePoints
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error logging in",
            error: error.message
        });
    }
};