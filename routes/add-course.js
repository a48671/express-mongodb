const { Router } = require('express');
const Course = require('../models/courses');
const auth = require('../middleware/auth');
const { validationResult } = require('express-validator');
const { courseValidators } = require('../utils/validators');

const router = Router();

router.get('/', auth, (req, res) => {
    res.render('add-course', {
        title: 'Add Course',
        isAddCourse: true
    });
});

router.post('/', courseValidators, auth, async (req, res) => {
    const { title, price, image } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render(`add-course`, {
            error: errors.array()[0].msg,
            title: 'Add Course',
            isAddCourse: true,
            data: {title, price, image}
        });
    }

    const course = new Course({title, price, image, user: req.user});
    try {
        await course.save();
        res.redirect('/courses');
    } catch(e) {
        console.log(e);
    }
});

module.exports = router;