var express = require('express');
var router = express.Router();
//csurf information_safe
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var parseForm = express.urlencoded({ extended: false });

const firebaseDB = require('../connections/firebase_admin_connect').db;
const layout_datadase = require('./layout');
require('dotenv').config();

function auth_verification(req, res, next) {
    var auth_ = req.session.uid || '';
    if (auth_ !== process.env.system_user_id || !auth_) {
        res.redirect('404');
    } else {
        next();
    }
}

/* GET home page. */
router.get('/', auth_verification,csrfProtection, function (req, res) {
    var auth_ = req.session.uid || '';
    layout_datadase.layout(auth_,'home').then(function (layout) {
        let layout_data = layout;
        layout_data.url = layout.local_URL + req.originalUrl;
        res.render('dashboard', {
            auth: auth_,
            layout_data: layout_data,
            path_type: ['dashboard'],
            categories: layout_data.categories,
            msg: req.flash('msg'),
            csrfToken: req.csrfToken(),
            config: req.config || ''
        });
    });
    firebaseDB.ref('data/categories').once('value',function (snapshot) {  
        
    });
});
//公告
router.post('/postmsg', auth_verification, parseForm, csrfProtection, function (req, res) {
    var announcement = req.body.announcement || '';
    if (!announcement) {
        res.redirect('/dashboard');
    } else {
        firebaseDB.ref('data/announcement').set(announcement)
        .then(function () {  
            res.redirect('/dashboard');
        });
    }
});

router.post('/post', auth_verification, parseForm, csrfProtection, function (req, res) {
    var name = req.body.name || '';
    var path = req.body.path || '';
    if (name == '' || path == '') {
        res.redirect('/dashboard');
    }else{
        var target_= firebaseDB.ref('data/categories').push();
        var key = target_.key;
        var data = {
            name: name,
            path: path,
            id: key
        };
        target_.set(data).then(function () {  
            res.redirect('/dashboard');
        });
    }

});
router.post('/posttag', auth_verification, parseForm, csrfProtection, function (req, res) {
    var id = req.body.id || '';
    var tag = req.body.tag || '';
    if (id == '' || tag == '') {
        res.redirect('/dashboard');
    } else {
        var target_ = firebaseDB.ref('data/categories/' + id + '/tag').push();
        var key = target_.key;
        var data = {
            name: tag,
            id: key
        };
        target_.set(data).then(function () {
            res.redirect('/dashboard');
        });
    }

});
router.post('/postdel', auth_verification, parseForm, csrfProtection, function (req, res) {
    var name = req.body.name || '';
    var path = req.body.del || '';
    if (name == '' || path == '') {
        res.redirect('/dashboard');
    } else {
        var target_ = firebaseDB.ref('data/categories').push();
        var key = target_.key;
        firebaseDB.ref('data/categories/' + path).remove().then(function () {  
            req.flash('msg', name + ' 已刪除');
            res.redirect('/dashboard');
        });
        
    }

});
router.post('/postdeltag', auth_verification, parseForm, csrfProtection, function (req, res) {
    var name = req.body.name || '';
    var path = req.body.del || '';
    var category = req.body.category || '';
    if (name == '' || path == '' || category =='') {
        res.redirect('/dashboard');
    } else {
        var target_ = firebaseDB.ref('data/categories').push();
        var key = target_.key;
        firebaseDB.ref('data/categories/' + category + '/tag/' + path).remove().then(function () {
            req.flash('msg', name + ' 標籤已刪除');
            res.redirect('/dashboard');
        });

    }

});

module.exports = router;
