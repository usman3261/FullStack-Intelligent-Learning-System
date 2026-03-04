import express from 'express';
import { 
    uploadDocument, 
    getDocuments, 
    getDocumentById, // Changed from getDocument to match your controller
    deleteDocument 
} from '../controllers/documentController.js';
import protect from '../middleware/auth.js';
import multer from 'multer';

// Make sure this path exists in your backend root!
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocumentById); // Updated here as well
router.delete('/:id', deleteDocument);

export default router;