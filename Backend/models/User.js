const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: function() {
            // Password is required only if the user is not created via social login
            return !this.googleId && !this.facebookId && !this.githubId;
        },
        minlength: 6
    },
    googleId: { type: String },
    facebookId: { type: String },
    githubId: { type: String },
    picture: { type: String },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    preferences: {
        theme: { type: String, default: 'light' },
        notifications: { type: Boolean, default: true }
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login
userSchema.methods.updateLastLogin = async function() {
    this.lastLogin = new Date();
    await this.save();
};

// Method to deactivate account
userSchema.methods.deactivateAccount = async function() {
    this.isActive = false;
    await this.save();
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email });
};

// Static method to find by social ID
userSchema.statics.findBySocialId = function(provider, id) {
    const field = `${provider}Id`;
    return this.findOne({ [field]: id });
};

const User = mongoose.model('User', userSchema);

module.exports = User;