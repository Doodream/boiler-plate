const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const { User } = require('./models/User');
const { auth } = require('./middleware/auth');
const config = require('./config/key');
const cors = require('cors');

const app = express()
const port = 4000

const cors_origin = ['http://localhost:3000'];

// bodyParser에 대한 옵션추가

// application/x-www-form-urlencoded 타입으로 된 파일을 분석해서 가져올수 있게 하는 옵션
app.use(bodyParser.urlencoded({ extended: true }));
// applicaiton/json 타입으로 된 파일을 분석해서 가져올 수 있게 하는 옵션 
app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors({
    origin: cors_origin,
    credentials: true
}));

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Conected...')).catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/api/hello', (req, res) => {
    res.send("안녕 나는 두드림의 두번째 서버야")
})

app.post('/register', (req, res) => {
    //회원가입 할 때 필요한 정보들을 Client 에서 가져오면 
    //그것들을 데이터 베이스에 넣어준다.

    const user = new User(req.body);
    user.save((err, doc) => {
        // 데이터 저장에 실패했을 경우 클라이언트에 err 반응 메세지를 보낸다.
        if (err) return res.json({ success: false, err })
        // 데이터 저장에 성공하면 
        return res.status(200).json({
            success: true
        })
    })
})

app.post('/login', (req, res) => {
    const user = new User(req.body);
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 사람이 없습니다."
            })
        }

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) {
                return res.json({
                    loginSuccess: false,
                    message: "비밀번호가 틀렸습니다."
                })
            }

            user.genToken((err, user) => {
                if (err) return res.status(400).send(err);
                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({
                        loginSuccess: true, userId: user._id
                    })
            })
        })
    })

})

app.get('/api/users/auth', auth, (req, res) => {
    // 미들웨어를 모두 통과함 // Authentication : true
    res.status(200).json({
        _id: req.user._id,
        // role = 0은 일반 유저이므로 어드민이 아니다.
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        image: req.user.image,
    })
})

app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({
            success: true
        })
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

