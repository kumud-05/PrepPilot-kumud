const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Generate a JWT token for the authenticated user.
 * @param {string} userId - MongoDB user ID.
 * @returns {string} JWT token valid for 7 days.
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/**
 * Register a new user account.
 * @route POST /api/auth/register
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 * @throws {Error} When the server fails to create a user.
 * @example
 * POST /api/auth/register
 * {
 *   "name": "Jane Doe",
 *   "email": "jane@example.com",
 *   "password": "securePass123",
 *   "profileImageUrl": "https://example.com/avatar.png"
 * }
 * @example
 * 201 {
 *   "_id": "6426c5a5...",
 *   "name": "Jane Doe",
 *   "email": "jane@example.com",
 *   "profileImageUrl": "https://example.com/avatar.png",
 *   "token": "eyJhb..."
 * }
 */
const registerUser = async (req, res) => {
    try {
        const { name, email, password, profileImageUrl } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: "A user with this email already exists" });
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImageUrl,
        });

        // Return user data with JWT
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error occurred", error: error.message });
    }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
/**
 * Authenticate a user and return a JWT token.
 * @route POST /api/auth/login
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 * @throws {Error} When authentication fails or server error occurs.
 * @example
 * POST /api/auth/login
 * {
 *   "email": "jane@example.com",
 *   "password": "securePass123"
 * }
 * @example
 * 200 {
 *   "_id": "6426c5a5...",
 *   "name": "Jane Doe",
 *   "email": "jane@example.com",
 *   "profileImageUrl": "https://example.com/avatar.png",
 *   "token": "eyJhb..."
 * }
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if(!user){
            return res.status(401).json({ success: false, message: "Invalid email or password provided" })
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({ success: false, message: "Invalid email or password provided" });
        }

        // return user data with JWT
        res.json({
            _id:user._id,
            name:user.name,
            email:user.email,
            profileImageUrl:user.profileImageUrl,
            token:generateToken(user._id),
        });
    }catch(error){
        res.status(500).json({ success: false, message: "Internal server error occurred", error: error.message });
    }
};

// @desc Get user profile
// @route GET /api/auth/profile
// @access Private (Require JWT)
/**
 * Get the profile of the currently authenticated user.
 * @route GET /api/auth/profile
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 * @throws {Error} When the user is not found or server error occurs.
 * @example
 * GET /api/auth/profile
 * Authorization: Bearer eyJhb...
 * @example
 * 200 {
 *   "_id": "6426c5a5...",
 *   "name": "Jane Doe",
 *   "email": "jane@example.com",
 *   "profileImageUrl": "https://example.com/avatar.png"
 * }
 */
const getUserProfile = async (req, res) => {
    try {
        const user = req.user;
        if(!user){
            return res.status(404).json({ success: false, message: "Requested user profile not found" });
        }
        res.json(user);
    }catch(error){
        res.status(500).json({ success: false, message: "Internal server error occurred", error: error.message });
    }
};

module.exports = { registerUser, loginUser, getUserProfile };