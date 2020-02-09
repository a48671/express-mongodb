const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    name: String,
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExp: Date,
    card: {
        items: [
            {
                courseId: {
                    type: Schema.Types.ObjectId,
                    required: true,
                    ref: 'Course'
                },
                count: {
                    type: Number,
                    required: true,
                    default: 1
                }
            }
        ]
    }
});

userSchema.methods.addToCard = function(curse) {
    const items = [...this.card.items];
    const indexCourse = items.findIndex(currentCourse => currentCourse.courseId.toString() === curse._id.toString());
    if (indexCourse >= 0) {
        items[indexCourse].count = items[indexCourse].count + 1;
    } else {
        items.push({courseId: curse._id, count: 1})
    }
    this.card = {items};
    return this.save();
};

userSchema.methods.removeCourseById = function(id) {
    let items = [...this.card.items];
    const indexCourse = items.findIndex(course => course.courseId.toString() === id.toString());
    if (items[indexCourse].count === 1) {
        items.splice(indexCourse, 1);
    } else {
        items[indexCourse].count--;
    }
    this.card = {items};
    this.save();
};

userSchema.methods.clearCard = function() {
    this.card = {items: []};
    this.save();
};

module.exports = model('User', userSchema);