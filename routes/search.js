var express = require('express');
var router = express.Router();

const layout_datadase = require('./layout');
const firebaseDB = require('../connections/firebase_admin_connect').db;

/* GET home page. */
router.get('/', function (req, res, next) {
    let auth_ = req.session.uid || '';
    let q= req.query.q;
    layout_datadase.layout(auth_, 'home').then(function (layout) {
        let layout_data = layout;
        layout_data.url = layout.local_URL + req.originalUrl;
        if (q) {
            firebaseDB.ref('data/article').once('value', function (snapshot) {
                if (!snapshot.exists) {
                    return res.render('search', {
                        auth: auth_,
                        layout_data: layout_data,
                        path_type: ['home'],
                        q: [],
                        config: req.config || ''
                    });
                }
                let data = snapshot.val();
                let data_ = [];
                let all_data = [];

                for (const key in data) {
                    data_.push({
                        title: data[key].title || '',
                        content: data[key].content || '',
                        id: data[key].id || ''
                    });
                }
                q = q.split(' ');
                for (const i in q) {
                    if (q[i]) {
                        for (const index in data_) {
                            if (data_[index].content.indexOf(q[i]) !== -1 || data_[index].title.indexOf(q[i]) !== -1) {
                                all_data.push(data_[index]);
                                data_.splice(index,1);
                            }
                        }
                    }
                }
                res.render('search', {
                    auth: auth_,
                    layout_data: layout_data,
                    path_type: ['home'],
                    q: all_data,
                    title:req.query.q,
                    config: req.config || ''
                });
            });
        }else{
            res.render('search', {
                auth: auth_,
                layout_data: layout_data,
                path_type: ['home'],
                q:[],
                title: '',
                config: req.config || ''
            });
        }
        
        
        
    });

});


module.exports = router;
