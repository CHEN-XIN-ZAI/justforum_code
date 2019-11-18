var express = require('express');
var router = express.Router();
var formidable = require('formidable');

//csurf information_safe
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var parseForm = express.urlencoded({ extended: false });

const fireAuth = require('../connections/firebase_admin_connect').firebase.auth();
const firebaseDB = require('../connections/firebase_admin_connect').db;
const uploadImage = require('../connections/firebase_admin_connect').uploadImage;

const layout_datadase = require('./layout');

function auth_post(req, res, next) {
    var auth_ = req.session.uid || '';
    if (auth_ == '') {
        res.send('404');
    } else {
        next();
    }
}


router.get('/', csrfProtection, function (req, res, next) {
    let auth_ = req.session.uid || '';
    if (auth_ !== '') {
        layout_datadase.layout(auth_).then(function (layout) {
            res.render('users', {
                auth: auth_,
                layout_data: layout,
                path_type: ['user'],
                csrfToken: req.csrfToken(),
                msg: req.flash('msg'),
                config: req.config || ''
            });
        });
    }else{
        res.redirect('/');
    }
});
router.post('/update_pwd', auth_post, parseForm, csrfProtection, function (req, res, next) {
    let auth_ = req.session.uid || '';
    let email = req.body.email;
    let password = req.body.password;
    let newpassword = req.body.newpassword;

    fireAuth.signInWithEmailAndPassword(email,password).then(function (user_info) {
        fireAuth.currentUser.updatePassword(newpassword).then(function (user) {  
            req.flash('msg', '密碼已變更');
            res.redirect('/user');
        }).catch(function (err) {  
            req.flash('msg', '密碼強度不夠，請大於6個字元');
            res.redirect('/user');
        });
    }).catch(function (err) {  
        req.flash('msg', '密碼有誤。');
        res.redirect('/user');
    })
    
});
//列出文章
router.post('/user_article', auth_post, parseForm, csrfProtection, function (req, res, next) {
    let auth_ = req.session.uid || '';
    if (!auth_) {
        return res.send({msg:'user error.',data:''});
    }else{
        layout_datadase.user_article(auth_).then(function (data) {
            res.send({msg:'success',data:data});
        }).catch(function (err) {  
            res.send({msg:'success',data:err});
        })
    }
});
//刪除文章
router.post('/user_article_del', auth_post, parseForm, csrfProtection, function (req, res, next) {
    let auth_ = req.session.uid || '';
    let id = req.body.id;
    let title = req.body.title;
    let author = req.body.author;
    if (!id || author !== auth_ || !title) {
        req.flash('msg', '資料回應不完整或沒有權限，無法刪除。');
        return res.redirect('/user');
    } else {
        firebaseDB.ref('data/article/' + id).remove().then(function () {
            req.flash('msg', title + ' 已刪除');
            res.redirect('/user');
        }).catch(function () {
            req.flash('msg', '資料沒有已刪除，可能原因:資料庫沒有該筆資料，或資料庫沒有回應。');
            res.redirect('/user');
        });
    }

});

router.post('/info', auth_post, parseForm, csrfProtection, function (req, res, next) {
    let name = req.body.name,
        nick = req.body.nick;
    firebaseDB.ref('user/' + req.session.uid).once('value',function (snapshot) {  
        let data = snapshot.val();
        data.name = name;
        data.nick = nick;
        firebaseDB.ref('user/' + req.session.uid).set(data).then(function () {  
            res.redirect('/user');
        });
    });
});

//已有圖片變更時要刪除，待修正
router.post('/image', auth_post, function (req, res, next) {

    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) {
            return res.redirect(303, '/error');
        }
        uploadImage(files).then(function (url) {
            firebaseDB.ref('user/' + req.session.uid + '/sticker_img').set(url)
            .then(function () {  
                res.send({data:'success'});
            }).catch(function (err) {  
                console.log(err);
                res.send({data:'error',msg:err});
            });
            
        }).catch(function (err) {
            res.send({data:'error',msg:err});
        });
    });
});
module.exports = router;
