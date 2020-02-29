const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const routeMain = require('./routes/index');
const routeCourses = require('./routes/courses');
const routeAddCourse = require('./routes/add-course');
const routeCard = require('./routes/card');
const routerOrders = require('./routes/orders');
const routerAuth = require('./routes/auth');
const mongoose = require('mongoose');
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const { MONGODB_URI, SESSION_SECRET } = require('./keys');

const app = express();

const hbs = exphbs.create({
    extname: 'hbs',
    defaultLayout: 'main',
    helpers: require('./utils/hbs-helpers')
});

const store = new MongoStore({
    collection: 'sessions',
    uri: MONGODB_URI
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');


app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    useUnifiedTopology: true,
    store
}));
app.use(csrf());
app.use(flash());
app.use(varMiddleware);
app.use(userMiddleware);

app.use('/', routeMain);
app.use('/courses', routeCourses);
app.use('/add-course', routeAddCourse);
app.use('/card', routeCard);
app.use('/orders', routerOrders);
app.use('/auth', routerAuth);

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`)
        });
    } catch(err) {
        console.log(err);
    }
};

start();