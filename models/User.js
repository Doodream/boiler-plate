const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
// salt를 이용해서 비밀번호를 암호화하는데 saltRounds는 salt의 글자 수이다.
const saltRounds = 10;



const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50,
    },
    email: {
        type: String,
        trim: true,
        //입력받은 데이터의 빈 공간 (space)를 없애주는 역할을 한다.
        unique: 1,
        // 고유성을 부여함
    },
    password: {
        type: String,
        minlength: 8,
    },
    // 역할에 따라 숫자를 부여 , 0은 일반유저 
    role: {
        type: Number,
        default: 0,
    },
    image: String,
    // 로그인 유효성 검사
    token: {
        type: String
    },
    // 로그인 유효성 토큰의 사용 기한
    tokenExp: {
        type: Number,
    }
})

userSchema.pre('save', function (next) {
    var user = this;

    // user 스키마중에 password가 입력이 될때만 암호화 진행 
    if (user.isModified('password')) {
        //사용자 비밀번호를 받아서 암호화 후 전송
        bcrypt.genSalt(saltRounds, function (err, salt) {
            // err 발생시 user.save() 에 err 전달
            if (err) return next(err);
            // salt가 잘 생성되었다면 
            bcrypt.hash(user.password, salt, function (err, hash) {
                // err가 뜨면 err message를 user.save()에 전달
                if (err) return next(err);
                // 비밀번호를 암호화해서 교체
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }

})

userSchema.methods.comparePassword = function (plainPassword, cb) {
    //
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    })
}
// schema는 model로 감싸줘야함
const User = mongoose.model('User', userSchema);
// 모델을 다른 파일에서도 쓸수 있게 exports 
module.exports = { User };