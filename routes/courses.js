const {Router} = require('express');
const Courses = require('../models/courses');
const auth = require('../middleware/auth');

const router = Router();

function isOwner(course, req) {
    return course.user._id.toString() === req.user._id.toString();
}

router.get('/', async (req, res) => {
    try {
        const courses = await Courses.find().populate('user', 'mail name');
        res.render('courses', {
            title: 'Courses',
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null,
            courses
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/:id/edit', auth, async (req,res) => {
    if (!req.query.allow) return res.redirect('/');
    try {
        const course = await Courses.findById(req.params.id);

        if (!isOwner(course, req)) {
            return res.redirect('/courses');
        }

        res.render('edit-course', {
            title: 'Edit course',
            course
        });
    } catch (e) {
        console.log(e);
    }
});

router.post('/edit', auth, async (req, res) => {
    const { id } = req.body
    delete req.body.id;

    try {
        const course = await Courses.findById(id);

        if (!isOwner(course, req)) {
            return res.redirect('/courses');
        }

        Object.assign(course, req.body);
        await course.save();

        res.redirect('/courses');
    } catch (e) {
        console.log(e);
    }
});

router.get('/:id', async (req, res) => {
    const course = await Courses.findById(req.params.id).populate('user', 'name');
    res.render('course', {
        layout: 'empty',
        title: course.title,
        course
    });
});

router.post('/remove', auth, async (req, res) => {
    try {
        await Courses.deleteOne({
            _id: req.body.id,
            user: req.user._id
        });
        res.redirect('/courses');
    } catch (e) {
        console.log(e)
    }
});

module.exports = router;