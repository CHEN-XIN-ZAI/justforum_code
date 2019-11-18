var express = require('express');
var router = express.Router();

const layout_datadase = require('./layout');
const firebaseDB = require('../connections/firebase_admin_connect').db;

/* GET home page. */
router.get('/', function (req, res, next) {
    let auth_ = req.session.uid || '';
    layout_datadase.layout(auth_, 'home').then(function (layout) {
        let layout_data = layout;
        layout_data.url = layout.local_URL + req.originalUrl;
        res.render('justcontrol', {
            auth: auth_,
            layout_data: layout_data,
            path_type: ['justcontrol'],
            config: req.config || ''
        });

    });

});


module.exports = router;
