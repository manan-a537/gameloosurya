const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    games: [{
        gameId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Game', 
            required: true 
        },
        quantity: { 
            type: Number, 
            default: 1,
            min: 1
        },
        price: { 
            type: Number, 
            required: true,
            min: 0
        }
    }],
    totalAmount: { 
        type: Number, 
        required: true,
        min: 0
    },
    status: { 
        type: String, 
        enum: ['pending', 'processing', 'completed', 'cancelled'], 
        default: 'pending' 
    },
    paymentMethod: { 
        type: String, 
        required: true,
        enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        zipCode: { type: String, required: true }
    },
    trackingNumber: String,
    notes: String,
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Method to calculate total amount
orderSchema.methods.calculateTotal = function() {
    this.totalAmount = this.games.reduce((total, game) => {
        return total + (game.price * game.quantity);
    }, 0);
    return this.totalAmount;
};

// Method to update order status
orderSchema.methods.updateStatus = async function(newStatus) {
    this.status = newStatus;
    this.updatedAt = new Date();
    await this.save();
};

// Method to add tracking number
orderSchema.methods.addTrackingNumber = async function(trackingNumber) {
    this.trackingNumber = trackingNumber;
    this.updatedAt = new Date();
    await this.save();
};

// Static method to find orders by user
orderSchema.statics.findByUser = function(userId) {
    return this.find({ userId }).sort({ createdAt: -1 });
};

// Static method to find orders by status
orderSchema.statics.findByStatus = function(status) {
    return this.find({ status }).sort({ createdAt: -1 });
};

// Static method to find orders by date range
orderSchema.statics.findByDateRange = function(startDate, endDate) {
    return this.find({
        createdAt: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ createdAt: -1 });
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 