const { body } = require('express-validator');

exports.registerValidators = [
    body('email').isEmail().withMessage('Input correctly email'),
    body('password', 'Password must be min 6 symbols').isLength({min: 6, max: 56}).isAlphanumeric(),
    body('confirm').custom((value, {req}) => {
        if (value !== req.body.password) {
            throw Error('Passwords must bu same');
        }
        return true;
    }),
    body('name').isLength({min: 3}).withMessage('Name must bu min 3 symbols')
];