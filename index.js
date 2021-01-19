const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { User } = require('./models/User');

const app = express()
const port = 4000

// bodyParser에 대한 옵션추가

// application/x-www-form-urlencoded 타입으로 된 파일을 분석해서 가져올수 있게 하는 옵션
app.use(bodyParser.urlencoded({ extended: true }));
// applicaiton/json 타입으로 된 파일을 분석해서 가져올 수 있게 하는 옵션 
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://dbDoodream:Sskstls1!@boilerplate.roags.mongodb.net/<dbname>?retryWrites=true&w=majority', {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Conected...')).catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Hello World!')
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

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})