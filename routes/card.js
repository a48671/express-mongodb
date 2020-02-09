const { Router } = require('express');
const Course = require('../models/courses');
const auth = require('../middleware/auth');

const router = Router();

const getCoursesFromCard = card => card.items.map(item => ({
    ...item.courseId._doc,
    id: item.courseId.id,
    count: item.count
}));

const getTotalFromCard = courses => courses.reduce((total, course) => {
    return total + course.price * course.count;
}, 0);

router.get('/', auth, async (req, res) => {
    const card =  await req.user.card.populate('items.courseId').execPopulate();
    const courses = getCoursesFromCard(card);
    const total = getTotalFromCard(courses);
    res.render('card', {
        isCard: true,
        title: 'Card',
        courses,
        total
    });
});

router.post('/add', auth, async (req, res) => {
    const { id } = req.body;
    const course = await Course.findById(id);
    await req.user.addToCard(course);
    res.redirect('/card');
});

router.delete('/remove/:id', auth, async (req, res) => {
    await req.user.removeCourseById(req.params.id);
    const card =  await req.user.card.populate('items.courseId').execPopulate();
    const courses = getCoursesFromCard(card);
    const total = getTotalFromCard(courses);
    res.status(200).json({courses, total});
});

module.exports = router;