import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes and verify JWT
 */
const protect = async (req, res, next) => {
    let token;

    // 1. Check for Bearer token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Extract token
            token = req.headers.authorization.split(' ')[1];

            // 3. Verify token using the secret
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Find user and attach to request object
            // We use 'decoded.id' because we standardized this key in authController
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'User not found or account deactivated', 
                    statusCode: 401 
                });
            }

            // 5. Proceed to the next middleware/controller
            next();
        } catch (err) {
            console.error('Auth middleware error:', err.message);

            // Specific handling for expired tokens
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Session expired. Please log in again.', 
                    statusCode: 401 
                });
            }

            // General failure (invalid token, malformed, etc.)
            return res.status(401).json({ 
                success: false, 
                error: 'Not authorized, token validation failed', 
                statusCode: 401 
            });
        }
    }

    // 6. If no token was found at all
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            error: 'Not authorized, no access token provided', 
            statusCode: 401 
        });
    }
};

export default protect;