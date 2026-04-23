var express = require('express'); 
var app = express(); 
var mongoose = require('mongoose'); 
// const User = require('./models/User');
 
var uri = 'mongodb://user01:089205000691@ac-ztzmbka-shard-00-02.rulyh4r.mongodb.net:27017/trangtin?ssl=true&authSource=admin'; 
mongoose.connect(uri) 
    .then(() => console.log('Đã kết nối thành công tới MongoDB.')) 
    .catch(err => console.log(err)); 

app.set('views', './views');
app.set('view engine', 'ejs');
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
