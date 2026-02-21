let errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID';
    }
    
    if (err.code === 11000) {
        let field = Object.keys(err.keyValue); 
        message = `Duplicate value for field: ${field}`;
        statusCode = 400;
    }

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map((val) => val.message).join(', ');
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        statusCode = 400;
        message = 'File size is too large. Maximum limit is 1MB.';
    }

    if (err.name === 'JsonWebTokenError' || err.code === 'jsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please log in again.';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token has expired. Please log in again.';
    }

    console.error('Error Trace:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    res.status(statusCode).json({
        success: false,
        error: message,
        statusCode: statusCode,
    });
};

export default errorHandler;