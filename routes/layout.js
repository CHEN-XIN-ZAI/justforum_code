const firebaseDB = require('../connections/firebase_admin_connect').db;
require('dotenv').config();

function layout(auth, path_type) {
    return promise = new Promise((resolve, reject) => {
        let data = {};
        data.local_URL = process.env.local_url;
        // data.local_URL = 'https://justforum.herokuapp.com';
        data.system = 'no';
        firebaseDB.ref('data/categories').once('value', function (snapshot) {
            if (!snapshot.exists()) {
                data.categories = {};
            }else{
                data.categories = snapshot.val();
            }
            data.categories_list = '';
            data.categories_type = '';
            data.categories_tag = '';
            path_type = path_type || '';
            if (path_type) {
                for (const key in data.categories) {
                    data.categories_list += ' ' + data.categories[key].name;
                    if (path_type == 'home') {
                        data.categories_type = '首頁'
                    } else if (path_type == data.categories[key].path) {
                        data.categories_type = data.categories[key].name;
                        data.categories_tag = data.categories[key].tag;
                    }
                }
            }
            firebaseDB.ref('data/announcement').once('value', function (announcement) {
                let announcement_ = '無。';
                if (announcement.exists()){
                    announcement_ = announcement.val();
                }
                data.announcement = announcement_;
                if (auth) {
                    if (auth === process.env.system_user_id) {
                        data.system = 'ok';
                    }
                    firebaseDB.ref('user/' + auth).once('value', function (snapshot2) {
                        if (!snapshot2.exists()) {
                            data.user = {};
                            return resolve(data);
                        }

                        data.user = snapshot2.val();
                        resolve(data);
                    });
                } else {
                    data.user = {};
                    resolve(data);
                }
            });
            
        });
    });
}
function user(auth) {
    return promise = new Promise((resolve, reject) => {
        if (auth) {
            let data = {};
            firebaseDB.ref('user/' + auth).once('value', function (snapshot) {
                if (!snapshot.exists()) {
                    data.user = {};
                    return reject('nodata');
                }
                data.user = snapshot.val();
                resolve(data);
            });
        } else {
            return reject('nodata');
        }
    });
}
function article(id) {
    return promise = new Promise((resolve, reject) => {
        if (id){
            let data = {};
            firebaseDB.ref('data/article/' + id).once('value', function (snapshot) {
                if (!snapshot.exists()) {
                    return reject('nodata');
                }
                data.article = snapshot.val();
                data.article.tag_list = [];
                if (data.article.tag) {
                    data.article.tag_list = data.article.tag.substr(0, data.article.tag.length - 1).split(' ');
                }
                return resolve(data);
            });
        }else{
            return reject('nodata');
        }
        
    });
}
function article_msg(id,auth) {
    return promise = new Promise((resolve, reject) => {
        if (id){
            let data = [];
            firebaseDB.ref('data/msg/' + id).once('value', function (msg_list) {
                if (!msg_list.exists()) {
                    return reject('nodata');
                }
                let msg = msg_list.val();
                firebaseDB.ref('user').once('value', function (user) {
                    if (!user.exists()) {
                        return reject('nouser');
                    }
                    let user_ = [];
                    for (const key in user.val()) {
                        user_.push(user.val()[key]);
                    }
                    for (const key in msg) {
                        let msg_ = user_.map(function (obj) {
                            if (obj.id == msg[key].user) {
                                msg[key].img = obj.sticker_img || '';
                                msg[key].name = obj.nick || obj.nick;
                                return true;
                            }
                        });
                        if (msg_.indexOf(true) == -1) {
                            delete msg[key];
                            break;
                        }

                        if (auth) {
                            if (auth == msg[key].user) {
                                msg[key].user = true;
                            } else {
                                msg[key].user = false;
                            }
                        } else {
                            msg[key].user = false;
                        }
                    }

                    let msg_temp = [];
                    for (const key in msg) {
                        msg_temp.push(msg[key]);
                    }
                    msg_temp = msg_temp.sort(function (a, b) {
                        return a.editor_time < b.editor_time;
                    });
                    data = msg_temp;
                    resolve(data);
                });
            });
        }else{
            return reject('nodata');
        }
        
    });
    
}

function user_article(user_id) {
    return promise = new Promise((resolve, reject) => {
        if (user_id){
            let data = {};
            firebaseDB.ref('data/article').orderByChild('author')
                .equalTo(user_id)
                .once('value', function (snapshot) {
                    if (!snapshot.exists()) {
                        return reject('nodata');
                    }
                    data.article = snapshot.val();
                    resolve(data);
                });
        }else{
            return reject('nodata');
        }
        
    });
}

function article_list(type,tag) {
    return promise = new Promise((resolve, reject) => {
        let data = {};
        if (tag) {
            firebaseDB.ref('data/article')
                .once('value', function (snapshot) {
                    if (!snapshot.exists()) {
                        return reject('nodata');
                    }
                    data.article = snapshot.val();

                    for (const key in data.article) {
                        if (data.article[key].author){
                            delete data.article[key].author;
                        }
                        if (data.article[key].tag) {
                            if (data.article[key].tag.indexOf(tag) == -1) {
                                delete data.article[key];
                            }
                        } else {
                            delete data.article[key];
                        }
                    }
                    if (Object.keys(data.article).length == 0) {
                        return reject('nodata');
                    }
                    resolve(data);
                });
            
        } else if (type) {
            firebaseDB.ref('data/article').orderByChild('category')
                .equalTo(type)
                .once('value', function (snapshot) {
                    if (!snapshot.exists()) {
                        return reject('nodata');
                    }
                    data.article = snapshot.val();
                    for (const key in data.article) {
                        if (data.article[key].author){
                            delete data.article[key].author;
                        }
                        if (data.article[key].status !== 'public') {
                            delete data.article[key];
                        }
                    }
                    resolve(data);
                });
        }else{
            return reject('nodata');
        }
    });
}

module.exports = {
    layout,
    user,
    article,
    user_article,
    article_list,
    article_msg
};