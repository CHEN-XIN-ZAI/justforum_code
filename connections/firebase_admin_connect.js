const firebase = require('firebase');
const admin = require("firebase-admin");
const session = require('express-session');
const FirebaseStore = require('connect-session-firebase')(session);
const { Storage } = require('@google-cloud/storage');

require('dotenv').config()

const storage = new Storage({
    projectId: '',
    keyFilename: process.env.firebaseStorage_key
});

const ref = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.firebase_key)),
    databaseURL: process.env.FIREBASE_databaseURL,
    storageBucket: process.env.FIREBASE_dataStorageURL
});

var firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};
firebase.initializeApp(firebaseConfig);


const bucket = storage.bucket("");

// 上傳檔案
const uploadImage = (file) => {
    let promise = new Promise((resolve, reject) => {
        if (!file) {
            reject("請上傳檔案");
        }
        const uploadTo = 'img/' + Date.now() + '-' + file.photo.size +file.photo.name;
        bucket.upload(file.photo.path, {
            destination: uploadTo,
            public: true,
            metadata: {
                cacheControl: 'public, max-age=31536000',
                contentType: file.photo.type
            }
        },
        function (err) {
            if (err) {
                reject(err);
            }
            let url = 'https://storage.googleapis.com/justforum-168go.appspot.com/' + uploadTo;
            resolve(url);
        });

    })
    return promise;
}

// 列出 storage 所有的檔案
const listFiles = function () {
    let promise = new Promise((resolve, reject) => {
        let fileNameList = [];
        bucket.getFiles()
            .then(results => {
                const files = results[0];
                console.log('Files:');
                files.forEach(file => {
                    fileNameList.push(file.name);
                });
                resolve(fileNameList);
            })
            .catch(err => {
                reject(err);
                console.log('error', err);
            })
    });
}
// 刪除檔案
const deleteFile = function (filePath) {
    let promise = new Promise((resolve, reject) => {
        bucket.file(filePath)
            .delete()
            .then(() => {
                resolve(true);
                //console.log(`gs://${bucketName}/${filename} deleted.`);
            })
            .catch(err => {
                reject(err);
                console.error('ERROR:', err);
            });
    });

    return promise;
}
// 取得檔案對外 url
const generateSignedUrl = function (firePath) {
    let promise = new Promise(function (resolve, reject) {
        const options = {
            action: 'read',
            expires: Date.now() + 50000 * 60 * 60,
        };

        bucket.file(firePath)
            .getSignedUrl(options)
            .then(function (results) {
                const url = results[0];
                // console.log(`The signed url for  is ${url}.`);
                return resolve(url);

                //console.log(`gs://${bucketName}/${filename} deleted.`);
            })
            .catch(err => {
                reject(err);
                console.error('ERROR:', err);
            });
    });
    return promise;
}

module.exports = {
    firebase,
    db: admin.database(),
    FirebaseStore,
    ref,
    uploadImage
};