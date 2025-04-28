const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    gameId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Game', 
        required: true 
    },
    rating: { 
        type: Number, 
        required: true,
        min: 1,
        max: 5
    },
    title: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 100
    },
    content: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 2000
    },
    likes: { 
        type: Number, 
        default: 0,
        min: 0
    },
    dislikes: { 
        type: Number, 
        default: 0,
        min: 0
    },
    isVerifiedPurchase: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Index for efficient querying
reviewSchema.index({ gameId: 1, userId: 1 }, { unique: true });

// Method to update review content
reviewSchema.methods.updateContent = async function(title, content, rating) {
    this.title = title;
    this.content = content;
    this.rating = rating;
    this.updatedAt = new Date();
    await this.save();
};

// Method to like review
reviewSchema.methods.like = async function() {
    this.likes += 1;
    await this.save();
};

// Method to dislike review
reviewSchema.methods.dislike = async function() {
    this.dislikes += 1;
    await this.save();
};

// Static method to find reviews by game
reviewSchema.statics.findByGame = function(gameId, page = 1, limit = 10) {
    return this.find({ gameId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'username picture');
};

// Static method to find reviews by user
reviewSchema.statics.findByUser = function(userId, page = 1, limit = 10) {
    return this.find({ userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('gameId', 'title imageUrl');
};

// Static method to get average rating for a game
reviewSchema.statics.getAverageRating = async function(gameId) {
    const result = await this.aggregate([
        { $match: { gameId } },
        { $group: { _id: null, averageRating: { $avg: "$rating" } } }
    ]);
    return result[0]?.averageRating || 0;
};

// Static method to get review count for a game
reviewSchema.statics.getReviewCount = function(gameId) {
    return this.countDocuments({ gameId });
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 