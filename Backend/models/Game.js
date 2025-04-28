const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 100
    },
    description: { 
        type: String, 
        required: true,
        trim: true
    },
    price: { 
        type: Number, 
        required: true,
        min: 0
    },
    imageUrl: { 
        type: String,
        validate: {
            validator: function(v) {
                return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v);
            },
            message: props => `${props.value} is not a valid URL!`
        }
    },
    category: { 
        type: String, 
        required: true,
        enum: ['Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Racing', 'Puzzle', 'Simulation']
    },
    platform: { 
        type: String, 
        required: true,
        enum: ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile']
    },
    releaseDate: { 
        type: Date,
        validate: {
            validator: function(v) {
                return v <= new Date();
            },
            message: props => `${props.value} is not a valid release date!`
        }
    },
    developer: { 
        type: String,
        trim: true
    },
    publisher: { 
        type: String,
        trim: true
    },
    rating: { 
        type: Number, 
        min: 0, 
        max: 5,
        default: 0
    },
    isFeatured: { 
        type: Boolean, 
        default: false 
    },
    isAvailable: { 
        type: Boolean, 
        default: true 
    },
    systemRequirements: {
        minimum: {
            os: String,
            processor: String,
            memory: String,
            graphics: String,
            storage: String
        },
        recommended: {
            os: String,
            processor: String,
            memory: String,
            graphics: String,
            storage: String
        }
    },
    tags: [{
        type: String,
        trim: true
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Method to calculate average rating
gameSchema.methods.calculateAverageRating = async function() {
    const Review = mongoose.model('Review');
    const reviews = await Review.find({ gameId: this._id });
    if (reviews.length === 0) return 0;
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = totalRating / reviews.length;
    await this.save();
    return this.rating;
};

// Static method to find featured games
gameSchema.statics.findFeatured = function() {
    return this.find({ isFeatured: true, isAvailable: true });
};

// Static method to find games by category
gameSchema.statics.findByCategory = function(category) {
    return this.find({ category, isAvailable: true });
};

// Static method to find games by platform
gameSchema.statics.findByPlatform = function(platform) {
    return this.find({ platform, isAvailable: true });
};

// Static method to search games
gameSchema.statics.search = function(query) {
    return this.find({
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $regex: query, $options: 'i' } }
        ],
        isAvailable: true
    });
};

const Game = mongoose.model('Game', gameSchema);

module.exports = Game; 