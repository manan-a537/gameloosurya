const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    items: [{
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
        default: 0,
        min: 0
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Method to calculate total amount
cartSchema.methods.calculateTotal = function() {
    this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    return this.totalAmount;
};

// Method to add item to cart
cartSchema.methods.addItem = async function(gameId, price, quantity = 1) {
    const existingItem = this.items.find(item => item.gameId.toString() === gameId.toString());
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        this.items.push({ gameId, price, quantity });
    }
    
    this.calculateTotal();
    this.updatedAt = new Date();
    await this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function(gameId) {
    this.items = this.items.filter(item => item.gameId.toString() !== gameId.toString());
    this.calculateTotal();
    this.updatedAt = new Date();
    await this.save();
};

// Method to update item quantity
cartSchema.methods.updateQuantity = async function(gameId, quantity) {
    const item = this.items.find(item => item.gameId.toString() === gameId.toString());
    if (item) {
        item.quantity = quantity;
        this.calculateTotal();
        this.updatedAt = new Date();
        await this.save();
    }
};

// Method to clear cart
cartSchema.methods.clearCart = async function() {
    this.items = [];
    this.totalAmount = 0;
    this.updatedAt = new Date();
    await this.save();
};

// Static method to find cart by user
cartSchema.statics.findByUser = function(userId) {
    return this.findOne({ userId });
};

// Static method to create new cart
cartSchema.statics.createCart = async function(userId) {
    const cart = new this({ userId });
    await cart.save();
    return cart;
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart; 