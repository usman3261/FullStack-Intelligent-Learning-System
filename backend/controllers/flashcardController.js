import Flashcard from '../models/Flashcard.js';

export const getFlashcards = async (req, res,next) => {
    try {
        const flashcards = await Flashcard.find({ userId: req.user._id,documentId: req.params.documentId })
        .populate('documentId', 'title fileName')
        .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            court: flashcards.length,
            data: flashcards
        });


    }
    catch (error) { 
        next(error);
    }
};

export const getAllFlashcardSets = async (req, res,next) => {
     try {
        
        const flashcardSets = await Flashcard.find({ userId: req.user._id })
        .populate('documentId', 'title')
        .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: flashcardSets.length,
            data: flashcardSets,
        });

    }
    catch (error) { 
        next(error);
    }
};
export const reviewFlashcard = async (req, res,next) => {
    try {
        const flashcardSet = await Flashcard.findOne({
            'cards._id': req.params.flashcardId,
            userId: req.user._id,
        });
        if (!flashcardSet) {
            return res.status(404).json({
                success: false,
                message: 'Flashcard not found',
            });
        }

        const cardIndex = flashcardSet.cards.findIndex(card => card._id.toString() === req.params.flashcardId);
        if (cardIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Flashcard not found in set',
            });
        }

        flashcardSet.cards[cardIndex].lastReviewed = new Date();
        flashcardSet.cards[cardIndex].reviewCount += 1;
        await flashcardSet.save();

        res.status(200).json({
            success: true,
            message: 'Flashcard reviewed status updated',
            data: flashcardSet
        });

    }
    catch (error) { 
        next(error);
    }
};

export const toggleStarFlashcard = async (req, res,next) => {
    try {
        
        const flashcardSet = await Flashcard.findOne({
            'cards._id': req.params.flashcardId,
            userId: req.user._id,
        });
        if (!flashcardSet) {
            return res.status(404).json({
                success: false,
                message: 'Flashcard not found',
            });
        }

        const cardIndex = flashcardSet.cards.findIndex(card => card._id.toString() === req.params.cardId);

        if (cardIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Flashcard not found in set',
            });
        }

        flashcardSet.cards[cardIndex].isStarred = !flashcardSet.cards[cardIndex].isStarred;
        await flashcardSet.save();

        res.status(200).json({
            success: true,
            message: `Flashcard ${flashcardSet.cards[cardIndex].isStarred ? 'starred' : 'unstarred'} `,
            data: flashcardSet
        });

    }
    catch (error) { 
        next(error);
    }
};

export const deleteFlashcardSet = async (req, res,next) => {
    try {
        
        const flashcardSet = await Flashcard.findOne({
            _id: req.params.flashcardSetId,
            userId: req.user._id,
        });

        if (!flashcardSet) {
            return res.status(404).json({
                success: false,
                message: 'Flashcard set not found',
            });
        }

        await Flashcard.deleteOne({ _id: req.params.flashcardSetId, userId: req.user._id });

        res.status(200).json({
            success: true,
            message: 'Flashcard set deleted',
        });

    }
    catch (error) { 
        next(error);
    }
};
