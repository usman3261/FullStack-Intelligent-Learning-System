import fs from 'fs/promises';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

export const extractTextFromPDF = async (filePath) => {
    const dataBuffer = await fs.readFile(filePath);
    // Use the function directly as 'pdf'
    const data = await pdf(dataBuffer);
    return data.text;
};