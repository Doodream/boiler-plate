const { User } = require("../models/User");

let auth = (req, res, next) => {
    // 인증 처리를 하는 곳으로 클라이언트의 쿠키에 저장된 토큰을 가져와서 디코드 한다.
    // 디코드 하면 userID가 나오는데 userID가 있으면 인증 okay 
    let token = req.cookies.x_auth

    User.findByToken(token, (err, user) => {
        if (err) throw err;
        if (!user) return res.json({ isAuth: false, error: true });

        req.token = token;
        req.user = user;
        next();

    })

}

module.exports = { auth };