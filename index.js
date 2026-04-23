var express = require('express'); 
var app = express(); 
var mongoose = require('mongoose'); 

// Load environment variables from .env file
if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile();
}

// const User = require('./models/User');
 
var uri = process.env.MONGODB_URI;
mongoose.connect(uri) 
    .then(() => console.log('Đã kết nối thành công tới MongoDB.')) 
    .catch(err => console.log(err)); 

app.set('views', './views');
app.set('view engine', 'ejs');

// Pass Google Maps API Key to all views
app.use((req, res, next) => {
    res.locals.GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
 res.render('index', {
 title: 'Trang chủ'
 });
});

app.get('/login', (req, res) => {
    res.render('login', {
    title: 'Đăng nhập'
    });
});

app.get('/register', (req, res) => {
    res.render('register', {
    title: 'Đăng ký'
    });
});

 
app.listen(3000, () => { 
    console.log('Server is running at http://127.0.0.1:3000'); 
}); 
