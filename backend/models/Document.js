import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    userId: { // Standardized to lowercase 'u'
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    fileName: {
        type: String,
        required: [true, 'File name is required'],
    },  
    filePath: {
        type: String,
        required: [true, 'File path is required'],
    },
    fileSize: {
        type: Number,
        required: [true, 'File size is required'],
    },      
    extractedText: {
        type: String,
        default: ''
    },
    chunks: [{
        content: { type: String, required: true },
        pageNumber: { type: Number, default: 0 },
        chunkIndex: { type: Number, required: true }
    }],
    uploadDate: {
        type: Date,
        default: Date.now
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        // Enum values MUST be lowercase to match the controller
        enum: ['uploaded', 'processing', 'processed', 'error'],
        default: 'processing'
    }
}, { 
    timestamps: true 
});

// Index helps speed up dashboard queries for a specific user
documentSchema.index({ userId: 1, uploadDate: -1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;