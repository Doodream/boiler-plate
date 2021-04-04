const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const { User } = require('./models/User');
const { Review } = require('./models/Review');
const { auth } = require('./middleware/auth');
const config = require('./config/key');
const cors = require('cors');
const multer = require("multer");
const path = require("path");
const http = require('http');


const app = express()

const port = 8080;

const cors_origin = ['https://tooravel-front.vercel.app'];



// bodyParser에 대한 옵션추가

// application/x-www-form-urlencoded 타입으로 된 파일을 분석해서 가져올수 있게 하는 옵션
app.use(bodyParser.urlencoded({ extended: true }));
// applicaiton/json 타입으로 된 파일을 분석해서 가져올 수 있게 하는 옵션 
app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors({
    origin: cors_origin,
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.static("public"));


const storage = multer.diskStorage({
    destination: "./public/img/",
    filename: function (req, file, cb) {
        cb(null, "imgfile" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }
});


mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Conected...')).catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/api/signup', (req, res) => {
    //회원가입 할 때 필요한 정보들을 Client 에서 가져오면 
    //그것들을 데이터 베이스에 넣어준다.

    const user = new User(req.body);
    User.findOne({ email: req.body.email }, (err, isUser) => {
        if (isUser) {
            return res.json({
                success: false,
                message: "같은 이메일로 가입된 정보가 있습니다."
            })
        }

        user.save((err, doc) => {
            // 데이터 저장에 실패했을 경우 클라이언트에 err 반응 메세지를 보낸다.
            if (err) return res.json({ success: false, err })
            // 데이터 저장에 성공하면 
            return res.status(200).json({
                success: true,
                message: "환영합니다! 카카오톡 아이디로 회원가입되셨습니다.",
            })
        })
    })
})

// 내계정에서 계정 설정
app.post('/api/account/setting', (req, res) => {
    const user = new User(req.body);

    User.findOneAndUpdate({ email: req.body.email }, {
        name: req.body.name,
        gender: req.body.gender,
        nationality: req.body.nationality,
        image: req.body.image
    }, (err, user) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({
            success: true
        })
    })
})

app.post("/api/upload/image", upload.single("image"), function (req, res, next) {
    //console.log(req.file);
    res.status(200).send({
        fileName: req.file.filename
    });
    console.log(req.file.filename);
});

app.post('/api/upload/review', (req, res) => {
    console.log(req.body)
    const review = new Review(req.body);
    review.save((err, doc) => {
        if (err) return res.json({ reviewSave: false, err })

        return res.status(200).json({
            reviewSave: true,
            message: "리뷰 저장에 성공하셨습니다.",
        })
    })
})

app.post('/api/login/kakao/', (req, res) => {
    const user = new User(req.body);
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 사람이 없습니다."
            })
        }
        user.genToken((err, user) => {
            if (err) return res.status(400).send(err);
            res.cookie("x_auth", user.token)
                .status(200)
                .json({
                    loginSuccess: true,
                    token: user._id,
                    email: user.email,
                    image: user.image,
                    gender: user.gender,
                    name: user.name,
                    nationality: user.nationality,
                })
        })
    })

})
app.post('/api/login', (req, res) => {
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
                        loginSuccess: true,
                        token: user._id,
                        email: user.email,
                        image: user.image,
                        gender: user.gender,
                        name: user.name,
                        nationality: user.nationality,
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
        //lastname: req.user.lastname,
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

app.post('/api/download/reviews', (req, res) => {
    Review.find({}, (err, docs) => {
        if (err) {
            console.log(err);
            return res.send({
                success: false,
                message: "서버 데이터 전송에 실패하였습니다."
            })
        }
        return res.status(200).send(docs);
    });
})

var server = http.createServer(app).listen(port, () => {
    console.log('Tooravel_backend Listen ... http');
    if (process.env.NODE_ENV === 'production') {
        console.log("processing on production mode");
    } else {
        console.log("processing on development mode");
    }

});

server.keepAliveTimeout = 65000; // Ensure all inactive connections are terminated by the ALB, by setting this a few seconds higher than the ALB idle timeout
server.headersTimeout = 66000; // Ensure the headersTimeout is set higher than the keepAliveTimeout due to this nodejs regression bug: https://github.com/nodejs/node/issues/27363

