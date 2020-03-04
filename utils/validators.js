const { body } = require('express-validator');
const User = require('../models/user');
exports.registerValidators = [
    body('email')
        .isEmail().withMessage('Input correctly email')
        .custom(async (value) => {
            const user = await User.findOne({email: value});
            if (user) {
                return Promise.reject('User with this email already exist')
            }
        })
        .normalizeEmail(),
    body('password', 'Password must be min 6 symbols')
        .isLength({min: 6, max: 56})
        .isAlphanumeric()
        .trim(),
    body('confirm')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw Error('Passwords must bu same');
            }
            return true;
        })
        .trim(),
    body('name')
        .isLength({min: 3}).withMessage('Name must bu min 3 symbols')
        .trim()
];
exports.loginValidators = [
    body('email')
        .isEmail().withMessage('Input correctly email')
        .normalizeEmail()
];

exports.courseValidators = [
    body('title').isLength({min: 3}).withMessage('Title must be min 3 symbols'),
    body('price').isNumeric().withMessage('Price must be number'),
    body('image', 'Input correctly url').isURL()
];