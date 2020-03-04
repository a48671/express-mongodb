const {Router} = require('express');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { validationResult } = require('express-validator/check');
const sendmail = require('../halpers/sendmail');
const { BASE_URL } = require('../keys');
const { registerValidators, loginValidators } = require('../utils/validators')

const router = new Router();

router.get('/login', (req, res) => {
    res.render('auth/login', {
        error: req.flash('error')
    });
});

router.post('/login', loginValidators, async (req, res) => {
    const { email, password } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg);
            return res.status(422).redirect('/auth/login');
        }
        const candidate = await User.findOne({email});
        if (candidate) {
            const areSame = await bcrypt.compare(password, candidate.password);
            if (areSame) {
                req.session.user = candidate;
                req.session.isAuth = true;
                req.session.save(err => {
                    if (err) throw err;
                    res.redirect('/');
                });
            } else {
                req.flash('error', 'Invalid password');
                res.redirect('/auth/login');
            }
        } else {
            req.flash('error', 'User is not found');
            return res.redirect('/auth/login');
        }
    } catch (e) {
        console.log(e);
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});

router.post('/registration', registerValidators, async (req, res) => {
    const { email, name, password: pass} = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg);
            return res.status(422).redirect('/auth/login#registration');
        }

        const password = await bcrypt.hash(pass, 10);
        const user = new User({email, name, password, card: { items: []}});
        await user.save();
        res.redirect('/');
    } catch (e) {
        console.log(e);
    }
});

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Reset password',
        error: req.flash('error')
    });
});

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Error');
                return res.redirect('/auth/reset');
            }

            const token = buffer.toString('hex');

            const candidate = await User.findOne({email: req.body.email});

            if (candidate) {
                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
                await candidate.save();
                await sendmail({
                    email: req.body.email,
                    title: 'Reset password',
                    html: `
                        <h1>Reset password</h1>
                        <p>Go to: ${BASE_URL}/auth/password/${token}</p>
                    `
                }).catch(err => err);
                return res.redirect('/auth/login');
            } else {
                req.flash('error', `User did not find with email: ${req.body.email}`);
                return res.redirect('/auth/reset')
            }
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}
        });
        if (!user) {
            req.flash('error', 'url invalid');
            return res.redirect('/auth/login');
        } else {
            res.render('auth/password', {
                title: 'New password',
                token: req.params.token,
                userId: user._id.toString(),
                error: req.flash('error')
            })
        }
    } catch (err) {
        console.log(err);
    }
});

router.post('/password', async (req, res) => {

    try {

        const { userId, token, password } = req.body;

        const user = await User.findOne({
            _id: userId,
            resetToken: token,
            resetTokenExp: {$gt: Date.now()}
        });

        if (user) {
            user.password = await bcrypt.hash(password, 10);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            user.save();
            res.redirect('/auth/login');
        } else {
            req.flash('error', 'password old');
            res.redirect('/auth/login');
        }
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;