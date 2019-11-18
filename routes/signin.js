var express = require('express');
var router = express.Router();

//csurf information_safe
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var parseForm = express.urlencoded({ extended: false });
//firebase_auth
const fireAuth = require('../connections/firebase_admin_connect').firebase.auth();
const firebaseDB = require('../connections/firebase_admin_connect').db;

const layout_datadase = require('./layout');
require('dotenv').config();

function auth_post(req, res,next) {
    var auth_ = req.session.uid || '';
    if (auth_ !== '') {
        res.send('404');
    }else{
        next();
    }
}

router.get('/', csrfProtection, function (req, res) {
    let auth_ = req.session.uid || '',
        reurl = req.query.reurl || '';

    if (auth_ !== '') {
        res.redirect('/');
    }else{
        layout_datadase.layout(auth_).then(function (layout) {
            res.render('signin', {
                auth: auth_,
                layout_data: layout,
                path_type: ['signin'],
                csrfToken: req.csrfToken(),
                reurl: reurl,
                config: req.config || ''
            });
        });
    }
    
});
//註冊
router.post('/register', auth_post, parseForm, csrfProtection, function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var myname = req.body.myname || '';

    fireAuth.createUserWithEmailAndPassword(email, password).then(function (user) {
        var actionCodeSettings = {
            url: process.env.local_url,
            handleCodeInApp: true
        };
        fireAuth.currentUser.sendEmailVerification(actionCodeSettings).then(function () {}).catch(function (error) {});

        var user_info = {
            email: email,
            name: myname,
            nick:'',
            sticker_img: '',
            sticker_img_m:'',
            tel:'',
            id: user.user.uid,
            article:{
                keyid_:{

                }
            }
        };
        firebaseDB.ref('user/' + user.user.uid).set(user_info)
        .then(function () {
            res.send({message:'200'});
        }).catch(function (err) {  
            
        });

    }).catch(function (err) {
        res.send(err);
    });
    
});
//登入
router.post('/signin', auth_post, parseForm, csrfProtection, function (req, res) {
    let email = req.body.email || '',
    password = req.body.password || '',
    remember = req.body.remember;
    fireAuth.signInWithEmailAndPassword(email, password)
    .then(function (user) {
        if (remember == 'true'){
            let today = new Date();
            today.setFullYear(2999,11,31);
            req.session.cookie.expires = today;
        }
        if (user.user.emailVerified == false) {
            res.send({data:'0'});
        }else{
            req.session.uid = user.user.uid;
            res.send({data:'200'});
        }
        
    }).catch(function (error) {
        res.send({data:error.message});
    });
    
});
//重置
router.post('/resetpwd', auth_post, parseForm, csrfProtection, function (req, res) {
    var email = req.body.email || '';
    var actionCodeSettings = {
        url: process.env.local_url,
        handleCodeInApp: true
    };
    fireAuth.sendPasswordResetEmail(email, actionCodeSettings)
        .then(function (user) {
            // Password reset email sent.
             res.send({data:'success'});
        })
        .catch(function (error) {
            // Error occurred. Inspect error.code.
            res.send({data:error.message});
        });
});
//登出
router.get('/signout', function (req, res) {
    req.session.uid = '';
    req.session.destroy(function () {  
        res.redirect('/');
    })

});

module.exports = router;
