var express = require('express');
var router = express.Router();
//csurf information_safe
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var parseForm = express.urlencoded({ extended: false });

var nodemailer = require('nodemailer');

const firebaseDB = require('../connections/firebase_admin_connect').db;
const layout_datadase = require('./layout');

const array_cut_startAll =8;
/* GET home page. */
router.get('/',csrfProtection, function (req, res) {
    let auth_ = req.session.uid || '';
    layout_datadase.layout(auth_,'home').then(function (layout) {
        let layout_data = layout;
        layout_data.url = layout.local_URL + req.originalUrl;
        res.render('index', {
            auth: auth_,
            layout_data: layout_data,
            path_type:['home'],
            csrfToken: req.csrfToken(),
            config: req.config
        });
    });
});
router.get('/client_service', csrfProtection, function (req, res) {
    res.render('client_service', {csrfToken: req.csrfToken()});
});
router.post('/client_service', parseForm, csrfProtection, function (req, res) {
    let email = req.body.email,
        msg = req.body.text;
    if (!email || !msg) {
        res.send(`<h3>您發送的資訊不完整，請稍後再試。</h3>\n\n<span>6</span>秒後自動返回發問頁<script>var i = 6;setInterval(()=>{i--;document.querySelector('span').textContent = i;if(i == 0){window.location.href = '/client_service';}},1000);</script>`);
    } else {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.Guser,
                pass: process.env.Gpass
            }
        });
        let toMailer = [
            'as755033@gmail.com'
            ,email 
        ];
        let mailOptions = {
            from: '"就是論壇"<justforum@service.com>',
            subject: email + '-就是論壇',
            text: msg
        }
        let result_num = 0;
        for (let i = 0; i < toMailer.length; i++) {
            if(i>0){
                mailOptions.subject = '客服回報通知信-就是論壇';
                mailOptions.text = '此信為 就是論壇 客服回報確認函，以下是您發送的訊息 : \n' + msg + '\n\n感謝您向 就是論壇 客服提問，我們會在最快的時間內，發送電子郵件與你聯繫，並解決您的問題。\n\n本信件由系統自動發出，請勿直接回覆!!';
            }
            mailOptions.to = toMailer[i];
            transporter.sendMail(mailOptions, function (err, info) {
                result_num++;
                if (err) {
                    return console.log(err);
                }
            });
        }
        let wait_result = setInterval(() => {
            if (toMailer.length == result_num) {
                res.send(`<h3>您的提問已發出，若有問題，歡迎隨時發問。</h3>\n\n<span>6</span>秒後自動返回發問頁<script>var i = 6;setInterval(()=>{i--;document.querySelector('span').textContent = i;if(i == 0){window.location.href = '/client_service';}},1000);</script>`);
                clearInterval(wait_result);
            }
        }, 1000);
        
    }
});
//列出文章
router.post('/article_list', parseForm, csrfProtection, function (req, res) {
    firebaseDB.ref('data/article').once('value', function (snapshot) {
        if (!snapshot.exists()) {
            return res.send({
                msg: 'nodata',
                data: ''
            });
        }
        let data = snapshot.val();
        for (const key in data) {
            if (data[key].author) {
                delete data[key].author;
            }
        }
        let data_ = []
        let temp = data;
        let keys = Object.keys(temp);
        for (let i = 0; i < keys.length; i++) {
            data_.push(temp[keys[i]]);
        }
        //最新資訊
        keys = data_.sort(function (a, b) {
            return a.editor_time < b.editor_time ? 1 : -1;
        }).slice(0);
        //最多觀看
        temp = data_.sort(function (a, b) {
            return a.watch < b.watch ? 1 : -1;
        }).slice(0);
        keys.splice(array_cut_startAll);
        temp.splice(array_cut_startAll);
        data = {
            msg: 'success',
            data: []
        };
        data.data.push({
            id: 'new',
            name: '最新資訊',
            data: keys
        });
        data.data.push({
            id: 'hot',
            name: '最多觀看',
            data: temp
        });
        data_ = data_.sort(function (a, b) {
            return a.category_name > b.category_name ? 1 : -1;
        }).slice(0);
        temp = [];
        keys = [];
        let name = data_[0].category_name;
        for (let i = 0; i < data_.length; i++) {
            if (data_[i].category_name == name) {
                temp.push(data_[i]);
            } else {
                temp = temp.sort(function (a, b) {
                    return a.watch < b.watch ? 1 : -1;
                });
                data.data.push({
                    id: temp[0].category,
                    name: name,
                    data: temp
                })
                name = data_[i].category_name;
                temp = [];
                temp.push(data_[i]);
            }
        }
        temp = temp.sort(function (a, b) {
            return a.watch < b.watch ? 1 : -1;
        });
        data.data.push({
            id: temp[0].category,
            name: name,
            data: temp
        })
        res.send(data);
    });
    

});

module.exports = router;
