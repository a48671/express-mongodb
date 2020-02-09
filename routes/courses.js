const {Router} = require('express');
const Courses = require('../models/courses');
const auth = require('../middleware/auth');

const router = Router();

router.get('/', async (req, res) => {
    const courses = await Courses.find().populate('user', 'mail name');
    res.render('courses', {
        title: 'Courses',
        isCourses: true,
        courses
    });
});

router.get('/:id/edit', auth, async (req,res) => {
    if (!req.query.allow) return res.redirect('/');
    const course = await Courses.findById(req.params.id);
    res.render('edit-course', {
        title: 'Edit course',
        course
    });
});

router.post('/edit', auth, async (req, res) => {
    const { id } = req.body
    delete req.body.id
    await Courses.findByIdAndUpdate(id, req.body);
    res.redirect('/courses');
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
    await Courses.deleteOne({_id: req.body.id});
    res.redirect('/courses');
});

module.exports = router;