let errorHandler = (err, req, res, next) => {
    statusCode = err.statusCode || 500;
     message = err.message || 'Internal Server Error';


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

if(error.code === 'LIMIT_FILE_SIZE'){
    statusCode = 400;
    message = 'File size is too large. Maximum limit is 1MB.';
}

if(error.code==='jsonWebTokenError'){
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
}

if(error.name === 'TokenExpiredError'){
    statusCode = 401;
    message = 'Token has expired. Please log in again.';
}
''
console.error('Error',{
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ?  err.stack : undefined,
});
res.status(statusCode).json({
    success: false,
    error: message,
    statusCode: statusCode,
});
}
export default errorHandler;