const mongoose = require('mongoose');

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
        minlength: 16,
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

const User = mongoose.model('User', userSchema);
module.exports = { User }