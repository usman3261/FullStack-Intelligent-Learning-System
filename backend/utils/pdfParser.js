import { PdfReader } from "pdfreader";

/**
 * Extracts raw text from a PDF file using PdfReader.
 * This is a robust alternative that avoids the 'gr' constructor bug.
 */
export const extractTextFromPDF = async (filePath) => {
    return new Promise((resolve, reject) => {
        let fullText = "";
        
        new PdfReader().parseFileItems(filePath, (err, item) => {
            if (err) {
                console.error("PdfReader Error:", err);
                return reject(err);
            }
            
            if (!item) {
                // End of file
                if (!fullText.trim()) {
                    return reject(new Error("No readable text found in PDF."));
                }
                return resolve(fullText.trim());
            }
            
            if (item.text) {
                // Add text and a space to keep words separated
                fullText += item.text + " ";
            }
        });
    });
};