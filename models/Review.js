const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    image: {
        type: String,
    },
    name: {
        type: String,
        maxlength: 50,
    },
    rating: {
        type: Number,
    },
    comment: {
        type: String
    },
    date: {
        type: String
    }
})

reviewSchema.pre('save', function (next) {
    var review = this;
    next();
})


const Review = mongoose.model('Review', reviewSchema);
module.exports = { Review };