import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

// Standardizing to ensure the ID is treated as a string in the payload
const generateToken = (id) => {
    return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

export const register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array().map(err => err.msg),
                statusCode: 400 
            });
        }

        const { username, email, password } = req.body;

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ 
                success: false, 
                error: userExists.email === email ? 'Email already in use' : 'Username already in use',
                statusCode: 400,
            });
        }

        const user = await User.create({
            username,
            email,
            password,
        });

        const token = generateToken(user._id);
        res.status(201).json({
            success: true,
            // Returning 'id' as a string to match frontend expectations
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
            },
            token,
            message: 'User registered successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password } = req.body;
        
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials', statusCode: 401 });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials', statusCode: 401 });
        }

        const token = generateToken(user._id);
        res.status(200).json({
            success: true,
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
            token,
            message: 'User logged in successfully',
        }); 
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (req, res, next) => {
    try {
        // req.user.id comes from the 'protect' middleware
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found', statusCode: 404 });
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { username, email, profileImage } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { username, email, profileImage },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: {
                ...user._doc,
                id: user._id.toString()
            },
            message: 'Profile updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body; 
        const user = await User.findById(req.user.id).select('+password');

        const isMatch = await user.matchPassword(currentPassword); 
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Old password incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password updated' });
    } catch (error) {
        next(error);
    }
};