const {Router} = require('express');
const Order = require('../models/order');
const auth = require('../middleware/auth');

const router = new Router();

router.post('/', auth, async (req, res) => {
    try {
        const user = await req.user.populate('card.items.courseId').execPopulate();

        const courses = user.card.items.map(course => ({
            count: course.count,
            course: {...course.courseId._doc}
        }));

        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user
            },
            courses
        });

        await order.save();
        await req.user.clearCard();

        res.redirect('/orders');
    } catch(e) {
        console.log(e);
    };
});

router.get('/', auth, async (req, res) => {
    try {
        let orders = await Order.find({'user.userId': req.user._id}).populate('user.userId');
        orders = orders.map(order => ({
            ...order._doc,
            total: order.courses.reduce((total, order) => {
                return total += order.count * order.course.price
            }, 0)
        }))

        res.render('orders', {
            isOrders: true,
            orders
        });
    } catch(e) {
        console.log(e);
    }
});

module.exports = router;