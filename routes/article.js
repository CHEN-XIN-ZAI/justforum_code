const express = require('express');
var router = express.Router();
var formidable = require('formidable');
//csurf information_safe
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var parseForm = express.urlencoded({ extended: false });

const firebaseDB = require('../connections/firebase_admin_connect').db;
const uploadImage = require('../connections/firebase_admin_connect').uploadImage;

const layout_datadase = require('./layout');

router.get('/', csrfProtection, function (req, res) {
    var id = req.query.id || '';
    let auth_ = req.session.uid || '';
    if(id == ''){
        return res.redirect('/');
    }
    //取文章
    layout_datadase.article(id).then(function (snapshot) {
        let article = snapshot.article;
        let open = article.status == 'public' ? true : false;
        let time = new Date(parseInt(article.editor_time));
        time = time.getFullYear() + '/' + (time.getMonth() + 1) + '/' + time.getDate() + '-' + time.getHours() + ':' + time.getMinutes() + ':' + time.getMilliseconds().toString().substr(0, 2);
        article.editor_time = time;
        //增加觀看人數
        if (req.config.watch) {
            req.config.watch = 0;
            firebaseDB.ref('data/article/' + id + '/watch').set(article.watch + 1);
        }
        //檢查公開設定
        if (open == false ? (article.author !== auth_ ? false : true) : true) {

            layout_datadase.layout(auth_, article.category).then(function (layout) {
                layout.url = layout.local_URL + req.originalUrl;
                firebaseDB.ref('user/' + article.author).once('value', function (author_info) {
                    if (!author_info.exists()) {
                        return res.redirect(404);
                    }
                    
                    res.render('article', {
                        auth: auth_,
                        author: author_info.val(),
                        category: article,
                        layout_data: layout,
                        path_type: ['article', article.category, article.title],
                        csrfToken: req.csrfToken(),
                        config: req.config || ''
                    });
                });
            });

        } else {
            if (open) {
                layout_datadase.layout(auth_).then(function (layout) {
                    firebaseDB.ref('user/' + article.author).once('value', function (author_info) {
                        if (!author_info.exists()) {
                            return res.redirect(404);
                        }
                        res.render('article', {
                            auth: auth_,
                            author: author_info.val(),
                            category: article,
                            layout_data: layout,
                            path_type: ['article', article.category, article.title],
                            config: req.config || ''
                        });
                    });
                });
            } else {
                return res.redirect('沒有權限');
            }

        }
    }).catch(function (err) {  
        return res.redirect(err);
    })
});
//使用者留言
router.post('/msg', parseForm, csrfProtection, function (req, res, next) {
    let auth_ = req.session.uid || '',
        id = req.body.id,
        msg = req.body.msg;
    if (!msg || !id){
        return res.redirect(404);
    }
    if (auth_ !== '') {
        let addmsg = firebaseDB.ref('data/msg/' + id).push();
        let key = addmsg.key;
        let data = {
            key: key,
            user: auth_,
            msg: msg,
            editor_time: Date.now()
        };
        addmsg.set(data).then(function () {
            return res.redirect('/article?id=' + id);
        }).catch(function (err) {
            return res.redirect(404);
        });

    } else {
        return res.redirect('/signin');
    }
});
//顯示留言
router.post('/msg_get', parseForm, csrfProtection, function (req, res, next) {
    let auth_ = req.session.uid || '',
        id = req.body.id;
    layout_datadase.article_msg(id, auth_).then(function (msg) {  
        res.send({msg:'success',data:msg});
    }).catch(function (err) {  
        res.send({data:err});
    });
});
//刪除留言
router.post('/msg_del', parseForm, csrfProtection, function (req, res, next) {
    let auth_ = req.session.uid || '',
        id = req.body.id,
        key = req.body.key,
        reload = req.body.reload;
    if (!id || !key || !reload){
        return res.redirect(404);
    }else{
        firebaseDB.ref('data/msg/' + id + '/' + key).once('value',function (snapshot) {  
            if (!snapshot.exists){
                return res.redirect(404);
            }
            if (snapshot.val().user == auth_){
                firebaseDB.ref('data/msg/' + id + '/' + key).remove().then(function () {  
                    res.redirect(reload);
                }).catch(function () {  
                    res.redirect(reload);
                });
            }else{
                return res.redirect(404);
            }
        })
    }
    
});

//新增文章
router.get('/create', csrfProtection, function (req, res, next) {
    let auth_ = req.session.uid || '';
    if (auth_ !== '') {
        layout_datadase.layout(auth_).then(function (layout) {
            res.render('create-article', {
                auth: auth_,
                layout_data: layout,
                msg: req.flash('msg'),
                article:'',
                path_type: ['article', '發表文章'],
                csrfToken: req.csrfToken(),
                config: req.config || ''
            });
        });
    } else {
        res.redirect('/');
    }
});
//編輯文章
router.get('/editor/:id',csrfProtection, function (req, res, next) {
    let auth_ = req.session.uid || '';
    let id = req.params.id;
    if (auth_ !== '') {
        layout_datadase.layout(auth_).then(function (layout) {
            layout_datadase.article(id).then(function (article_data) {
                if (article_data == 'nodata'){
                    return res.redirect('/');
                }
                if (article_data.article.author == auth_){
                    res.render('create-article', {
                        auth: auth_,
                        layout_data: layout,
                        article: article_data.article,
                        msg: req.flash('msg'),
                        path_type: ['article', '編輯文章'],
                        csrfToken: req.csrfToken(),
                        config: req.config || ''
                    });
                }else{
                    res.redirect('/');
                }
            }).catch(function () {
                res.redirect('/');
            });;
        });
    } else {
        res.redirect('/');
    }
});
//編輯文章
router.post('/editor/:id', parseForm, csrfProtection, function (req, res, next) {
    let auth_ = req.session.uid || '',
        id = req.params.id,
        title= req.body.title,
        tag= req.body.tag,
        content= req.body.content,
        status= req.body.status,
        category = req.body.category,
        author_name = req.body.author;

    if (auth_ !== '') {
        if (!title || !content || !status || !category || !author_name) {
            req.flash('msg', '內容有缺少，文章請輸入完整。');
            return res.redirect('/article/create');
        }
        layout_datadase.article(id).then(function (article) {
            let article_data = article.article;
            if (article_data.author == auth_) {
                let data = {
                    id: id,
                    title,
                    content,
                    status,
                    category,
                    watch: article_data.watch,
                    author: auth_,
                    create_time: article_data.create_time,
                    name:author_name
                }
                let today = new Date();
                let utc = 0;
                if (today.getTimezoneOffset() !== -480) {
                    let set_utc = 8;
                    utc = (today.getTimezoneOffset() / 60) * -1;
                    utc = -(utc - set_utc);
                }
                
                data.editor_time = today.getTime() + utc * 60 * 60 * 1000;
                if (tag !== '') {
                    data.tag = tag;
                }
                firebaseDB.ref('data/categories').orderByChild('path')
                    .equalTo(category)
                    .once('value', function (snapshot) {
                        if (snapshot.exists()) {
                            let category_name = Object.keys(snapshot.val());
                            data.category_name = snapshot.val()[category_name].name;
                        }
                        firebaseDB.ref('data/article/' + id).set(data).then(function () {
                            return res.redirect('/article?id=' + id);
                        }).catch(function () {
                            req.flash('msg', '資料庫儲存失敗，請稍後再試。');
                            return res.redirect('/article/editor/' + id);
                        });
                    });
            }else{
                return res.redirect(404);
            }
        });
        
    } else {
        return res.redirect(404);
    }
});
//新增文章
router.post('/create', parseForm, csrfProtection, function (req, res, next) {
    let auth_ = req.session.uid || '',
        title= req.body.title,
        tag= req.body.tag,
        content= req.body.content,
        status= req.body.status,
        category = req.body.category,
        author_name = req.body.author;;
    
    if (auth_ !== '') {
        if (!title || !content || !status || !category || !author_name) {
            req.flash('msg', '內容有缺少，文章請輸入完整。');
            return res.redirect('/article/create');
        }
        let create_article = firebaseDB.ref('data/article').push();
        let key = create_article.key;
        let data = {
            id: key,
            title,
            content,
            status,
            category,
            watch: 0,
            author: auth_,
            name: author_name
        }
        let today = new Date();
        let utc = 0;
        if (today.getTimezoneOffset() !== -480) {
            let set_utc = 8;
            utc = (today.getTimezoneOffset() / 60) * -1;
            utc = -(utc - set_utc);
        }
        today = today.getTime() + utc * 60 * 60 * 1000;
        data.create_time = today;
        data.editor_time = today;
        if (tag !== '') {
            data.tag = tag;
        }
        firebaseDB.ref('data/categories').orderByChild('path')
            .equalTo(category)
            .once('value', function (snapshot) {
                if (snapshot.exists()) {
                    let category_name = Object.keys(snapshot.val());
                    data.category_name = snapshot.val()[category_name].name;
                }
                create_article.set(data).then(function () {
                    // req.flash('msg', '儲存成功');
                    return res.redirect('/article?id=' + key);
                }).catch(function () {

                });
            });
        
    } else {
        return res.redirect(404);
    }
});
//圖片上傳
router.post('/image', function (req, res, next) {
    let auth_ = req.session.uid || '';
    if (auth_ !==''){
    var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) {
                // return res.redirect(303, '/error');
                res.send({error:err});
            }
            uploadImage(files).then(function (url) {  
                res.send({url:url});
            }).catch(function (err) {  
                res.send({error:err});
            })
            
        });
    }else{
        res.send({error:'您的狀態已經登出，請重新登入。'});
    }
});

module.exports = router;
