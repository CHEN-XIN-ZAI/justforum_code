var express = require('express');
var router = express.Router();

//csurf information_safe
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var parseForm = express.urlencoded({ extended: false });

const firebaseDB = require('../connections/firebase_admin_connect').db;
const layout_datadase = require('./layout');

/* GET home page. */
router.get('/', csrfProtection, function (req, res, next) {
    let auth_ = req.session.uid || '';
    let type = req.query.t || '';
    layout_datadase.layout(auth_ , type).then(function (layout) {
        let have_categories = false;
        let layout_data = layout;
        layout_data.url = layout.local_URL + req.originalUrl;
        for (let key in layout_data.categories) {
            if (layout_data.categories[key].path == type) {
                have_categories = true;
            }
        }
        if (have_categories){
            res.render('forum', {
                auth: auth_,
                layout_data: layout_data,
                path_type: ['home', type],
                csrfToken: req.csrfToken(),
                config: req.config || ''
            });
        }else{
            res.redirect('/');
        }
        
    });

});

//列出文章
router.post('/article', parseForm, csrfProtection, function (req, res, next) {

    let type = req.body.type || '';
    let tag = req.body.tag || '';
    let back_type = '最新文章';
    if(type){
        if (tag == '最新文章') {
            tag = '';
        }
        if (tag == '最多人觀看') {
            back_type = '最多人觀看';
            tag = '';
        }
        layout_datadase.article_list(type, tag).then(function (data) {
            res.send({
                msg: 'success',
                data: data,
                type: back_type
            });
        }).catch(function (err) {
            res.send({
                msg: 'success',
                data: err
            });
        })
    }else{
        res.send('err');
    }
    
});

module.exports = router;