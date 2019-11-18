export function index() {
    $(document).ready(function () {
        new Vue({
            el: '#HotInfo',
            data: {
                data: [],
                category_hover_img: {
                    index: 0,
                    img: ''
                },
                reclick: ''
            },
            created: function () {
                // this.category_hover_img.img = this.category.live[0].img;
                this.ajax();
            },
            computed: {
                article_img() {
                    return {
                        'background-image': 'url(' + this.category_hover_img.img + ')'
                    }
                },
                article_imgurl() {
                    return this.category_hover_img.img;
                }
            },
            methods: {
                ajax() {
                    let self = this;
                    $.post("/article_list", {
                        _csrf: $('#HotInfo').data('token')
                    },
                        function (data, textStatus, jqXHR) {
                            self.data = data.data;
                            self.category_hover_img.img = data.data[0].data[0].content.split('/-justforum-/')[2] || '/img/no_img.png';
                        },
                        "json"
                    );
                },
                hover_show(i, img, e) {

                    if (e.target.nodeName !== 'A') {
                        return;
                    }
                    if (this.reclick !== $(e.target).attr('href')) {
                        this.category_hover_img.index = i;
                        this.category_hover_img.img = img;

                        this.reclick = $(e.target).attr('href');
                        $(e.target).trigger('click');
                    }
                }
            }
        });
    });
}
export function signin() {
    $(document).ready(function () {
        //移除驗證
        $('#email_r').focusout(function () {
            $('#email_r').removeClass('is-invalid');
        });
        $('#password_r').focusout(function () {
            $('#password_r').removeClass('is-invalid');
        });
        $('#password_ok').focusout(function () {
            $('#password_ok').removeClass('is-invalid');
        });
        $('#reset_pwd').focusout(function () {
            $('#reset_pwd').removeClass('is-invalid');
        });
        //申請帳號
        $('#apply').click(function (e) {
            e.preventDefault();
            $(this).attr('disabled', '');
            $(this).text('註冊中...');
            let email = $('#email_r').val();
            let password = $('#password_r').val();
            let password_ok = $('#password_ok').val();
            let myname_r = $('#myname_r').val();
            let apply_this = this;
            if (email !== '' && password == password_ok && password !== '' && password_ok !== '' && myname_r !== '') {
                let key = $(this).data('key');

                let addaccount = new XMLHttpRequest();
                addaccount.open('POST', '/signin/register');
                addaccount.setRequestHeader('Content-Type', 'application/json');
                addaccount.send(JSON.stringify({
                    '_csrf': key,
                    email: email,
                    password: password,
                    myname: myname_r
                }));
                addaccount.onload = function () {
                    if (addaccount.status == '200') {
                        let msg = JSON.parse(addaccount.responseText).message;
                        if (msg == '200') {
                            $(apply_this).parent().parent().hide();
                            $('#success').fadeIn();
                            $('#register h2').text('註冊成功');
                        } else {
                            apply_reset();
                        }
                        if (msg == "The email address is badly formatted.") {
                            $('#email_r').addClass('is-invalid');
                        } else if (msg == "The password must be 6 characters long or more.") {
                            $('#password_r').addClass('is-invalid');
                        } else if (msg == "The email address is already in use by another account.") {
                            alert('這個E-mail已經被使用，如果您的帳號被他人註冊或忘記密碼，可以前往登入頁面進行密碼重置!!\n關於被他人註冊，若未驗證E-mail是無法使用帳號的。');
                        }
                    } else {
                        apply_reset();
                        alert('不知明原因，註冊失敗!!');
                    }
                }
            } else {
                if (myname_r == '') {
                    alert('姓名不可為空!!');
                } else if (email == '') {
                    alert('E-mail不可為空!!');
                } else if (password == '') {
                    alert('密碼不可為空!!');
                } else if (password !== password_ok || password_ok == '') {
                    $('#password_ok').addClass('is-invalid');
                }
                apply_reset();
            }

            function apply_reset() {
                $(apply_this).removeAttr('disabled');
                $(apply_this).text('確認註冊');
            }

        });
        //重置密碼
        $('#reset_passwd').click(function (e) {
            e.preventDefault();
            let target_data = $('#reset_pwd');
            let email = target_data.val();
            let this_ = $(this);
            if (email == '') {
                alert('E-mail 不可為空');
            } else {
                this_.attr('disabled', '');
                let key = $(this).data('key');
                $.post("/signin/resetpwd", {
                        '_csrf': key,
                        'email': email
                    },
                    function (data) {
                        if (data.data !== 'success') {
                            target_data.addClass('is-invalid');
                        } else {
                            $(target_data).val('');
                            alert('已發送 密碼重置信件，請前往信箱重置密碼');
                            $('#reset_close').trigger('click');
                        }
                        this_.removeAttr('disabled');
                    },
                    "json"
                ).fail(function () {
                    alert('重置失敗，請稍後嘗試!!');
                });

            }
        });
        //登入帳號
        $('#signin').click(function (e) {
            e.preventDefault();
            let this_ = $(this);
            let email = $('#email').val();
            let password = $('#password').val();
            let remember = $('#remember:checked').val() == 'remember' ? true : false;
            let reurl = this_.data('reurl');
            let key = this_.data('key');
            $('#invalid-msg').removeClass('is-invalid');
            if (email == '' || password == '') {
                alert('欄位有空不可為空!!');
            } else {
                this_.attr('disabled', '');
                $.post("/signin/signin", {
                        '_csrf': key,
                        email: email,
                        password: password,
                        remember: remember
                    },
                    function (data) {
                        if (data.data == '200') {
                            if (reurl) {
                                window.location.href = reurl;
                            } else {
                                window.location.href = '/';
                            }
                        } else if (data.data == '0') {
                            alert('此E-mail，未完成驗證，請先前往信箱驗證方可登入。\n若未收到驗證，請使用忘記密碼重設方可。');
                            $(this_).removeAttr('disabled');
                        } else {
                            $('#invalid-msg').addClass('is-invalid');
                            $(this_).removeAttr('disabled');
                        }
                    },
                    "json"
                );
            }
        });
        $('#password').keypress(function (e) {
            if (e.which == 13){
                let this_ = $('#signin');
                let email = $('#email').val();
                let password = $('#password').val();
                let remember = $('#remember:checked').val() == 'remember' ? true : false;
                let reurl = this_.data('reurl');
                let key = this_.data('key');
                $('#invalid-msg').removeClass('is-invalid');
                if (email == '' || password == '') {
                    alert('欄位有空不可為空!!');
                } else {
                    this_.attr('disabled', '');
                    $.post("/signin/signin", {
                            '_csrf': key,
                            email: email,
                            password: password,
                            remember: remember
                        },
                        function (data) {
                            if (data.data == '200') {
                                if (reurl) {
                                    window.location.href = reurl;
                                } else {
                                    window.location.href = '/';
                                }
                            } else if (data.data == '0') {
                                alert('此E-mail，未完成驗證，請先前往信箱驗證方可登入。\n若未收到驗證，請使用忘記密碼重設方可。');
                                $(this_).removeAttr('disabled');
                            } else {
                                $('#invalid-msg').addClass('is-invalid');
                                $(this_).removeAttr('disabled');
                            }
                        },
                        "json"
                    );
                }

            }
        });
    });
}
export function user() {
    $(document).ready(function () {
        //==================================使用者==================================
        //##基本資料
        //圖檔壓縮
        function readURL_m(input) {
            return new Promise((resolve, reject) => {
                let data = input.files[0];
                if (input.files && data) {
                    let type = ('jpg jpeg png gif bmp').split(' ');
                    let check = false;
                    type.forEach((v) => {
                        if (data.type.indexOf(v) !== -1) {
                            check = true;
                        }
                    });
                    if (check) {
                        let reader = new FileReader();
                        reader.readAsDataURL(data);
                        reader.onload = function () {
                            if (data.size / 1024 > 512) {
                                let img = new Image();
                                img.src = this.result;
                                img.onload = function () {
                                    //圖檔，壓縮比，寬，高，寬高比
                                    let that = this,
                                        w = that.width,
                                        h = that.height,
                                        scale = w / h;
                                    //最寬100/最高100
                                    if (that.width > that.height) {
                                        w = that.width > 300 ? 300 : that.width;
                                        h = w / scale;
                                    } else {
                                        h = that.height > 300 ? 300 : that.height;
                                        w = h * scale;
                                    }
                                    let quality = 0.9; // 默認圖片質量為0.7
                                    let canvas = document.createElement('canvas');
                                    let ctx = canvas.getContext('2d');
                                    // 創建屬性節點
                                    let anw = document.createAttribute("width");
                                    anw.nodeValue = w;
                                    let anh = document.createAttribute("height");
                                    anh.nodeValue = h;
                                    canvas.setAttributeNode(anw);
                                    canvas.setAttributeNode(anh);
                                    ctx.drawImage(that, 0, 0, w, h);
                                    let base64 = canvas.toDataURL('image/jpeg', quality);

                                    resolve(base64);
                                }
                            } else {
                                resolve(this.result);
                            }
                        }
                    } else {
                        reject('您選擇的不是圖檔');
                    }

                }
            })
        }
        //圖檔轉換
        const b64toBlob = (b64Data, contentType, sliceSize = 512) => {
            const byteCharacters = atob(b64Data);
            const byteArrays = [];
            for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                const slice = byteCharacters.slice(offset, offset + sliceSize);
                const byteNumbers = new Array(slice.length);
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }

            const blob = new Blob(byteArrays, {
                type: contentType
            });

            return blob;
        }
        var form;
        $('#choose_user_img').change(function (e) {
            e.preventDefault();
            readURL_m(this).then(function (b64Data) {
                const blob = b64toBlob(b64Data.split(',')[1], b64Data.split(',')[0].split(';')[0].split(':')[1]);
                // const blobUrl = URL.createObjectURL(blob);
                form = new FormData();
                form.append("photo", blob, "file_" + Date.parse(new Date()) + ".jpg");
                $('#user_img i').addClass('d-none');
                $('#user_img img').removeClass('d-none');
                $('#user_img img').attr('src', b64Data);
                $('#user_img a').attr('href', b64Data);
            }).catch(function (err) {
                alert(err);
            });
        });
        $('#user_set').click(function (e) {
            e.preventDefault();
            $(this).attr('disabled', '');
            $(this).text('處理中...');
            upload_img();
        });

        function upload_img() {
            if (form) {
                $.ajax({
                    type: "POST",
                    url: "/user/image",
                    data: form,
                    contentType: false,
                    cache: false,
                    processData: false,
                    dataType: "json",
                    success: function (response) {
                        if (response.data == 'success') {
                            $('#user_submit').trigger('click');
                        } else {
                            alert(response.msg);
                            $('#user_submit').trigger('click');
                        }
                    }
                }).fail(function () {
                    alert('圖片存檔失敗，請稍後在試。');
                    $('#user_submit').trigger('click');
                });
            } else {
                $('#user_submit').trigger('click');
            }
        }
        //修改密碼
        $('#alter_passwd').click(function (e) {
            e.preventDefault();
            $('#alter_passwd_modal').hide();
            $('#alter_passwd_box').removeClass('d-none');
        });
        $('#account-set form').submit(function (e) {
            if ($('#newpassword').val() !== $('#password_ok').val()) {
                e.preventDefault();
                alert('新密碼與確認密碼不一致!!');
            } else {
                $(this).find('button').attr('disabled', '');
            }
        });
        //文章管理
        new Vue({
            el: '#article-set',
            directives: {
                infiniteScroll
            },
            data: {
                data: {},
                busy: false,
                step1: false,
                article_show: [],
                keys: [],
                count: 0,
                between: 3,
                ending: false,
                status: 'public',
                class_: 'btn btn-outline-secondary rounded-0 flex-grow-1',
                class_focus: ['active', '']
            },
            methods: {
                loadMore: function () {
                    this.busy = true;
                    let self = this;
                    setTimeout(() => {
                        if ($('#article-set').css('display') !== 'none') {
                            if (!self.step1) {
                                $.ajax({
                                    type: "POST",
                                    url: "/user/user_article",
                                    data: {
                                        _csrf: $('#article-set').data('key')
                                    },
                                    dataType: "json",
                                    success: function (response) {
                                        if (response.data !== 'nodata') {
                                            self.data = response.data.article;
                                            self.keys = Object.keys(self.data).reverse();
                                            self.step1 = true;
                                            self.busy = false;
                                        } else {
                                            self.step1 = true;
                                            self.busy = false;
                                            self.data = 'nodata';
                                        }
                                    }
                                });
                            } else {
                                if (this.data !== 'nodata') {
                                    for (let i = this.count; i < this.count + this.between; i++) {
                                        if (this.data[this.keys[i]].status == this.status) {
                                            this.article_show.push(this.data[this.keys[i]]);
                                        }

                                        if (this.keys.length - 1 == i) {
                                            this.ending = true;
                                            break;
                                        }
                                    }
                                    this.busy = false;
                                    if (this.ending) {
                                        this.busy = true;
                                    } else {
                                        this.count += this.between;
                                    }
                                } else {
                                    this.ending = true;
                                    this.busy = true;
                                }

                            }

                        } else {
                            this.busy = false;
                        }
                    }, 100);
                },
                public: function () {
                    if (this.status !== 'public') {
                        this.status = 'public';
                        this.article_show = [];
                        this.class_focus = ['active', ''];
                        this.ending = false;
                        this.count = 0;
                        this.busy = false;
                        this.loadMore();
                    }
                },
                draft: function () {
                    if (this.status !== 'draft') {
                        this.status = 'draft';
                        this.article_show = [];
                        this.class_focus = ['', 'active'];
                        this.ending = false;
                        this.count = 0;
                        this.busy = false;
                        this.loadMore();
                    }
                },
                del_article: function (e) {
                    if (!confirm('確定刪除嗎?')) {
                        e.preventDefault();
                    }
                },
                todate(time) {
                    var date = new Date(parseInt(time));
                    return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
                }
            }
        });
    });
}
export function article_create() {
    $(document).ready(function () {
        //==================================新增文章==================================
        //新增文章標籤
        (function category_tag_init() {
            var tag = $('#category option:selected').data('tag');
            if (tag !== undefined) {
                tag = tag.split(" ");
                for (let i = 0; i < tag.length - 1; i++) {
                    if (i == 0) {
                        $('#category_tag').append('<option selected>' + tag[i] + '</option>');
                    } else {
                        $('#category_tag').append('<option>' + tag[i] + '</option>');
                    }

                }
            }
        })();
        $('#category').change(function (e) {
            e.preventDefault();
            var tag = $('#category option:selected').data('tag');
            tag = tag.split(" ");
            $('#category_tag').html('');
            for (let i = 0; i < tag.length - 1; i++) {
                $('#category_tag').append('<option value="">' + tag[i] + '</option>');
            }
        });
        $('#add-tag div button').click(function (e) {
            e.preventDefault();
            var num = $('#tag input').attr('value').split(" ").length;
            var user_select = $('#add-tag input').val();
            if (num > 5) {
                alert('標籤最多5個');
            } else if (user_select == '') {
                alert('不可為空!!');
            } else if ($('#tag input').attr('value').indexOf(user_select) !== -1) {
                alert('已經有重複的標籤');
            } else {
                $('#tag').append('<button class="btn btn-primary btn-sm p-1 mr-1">' + user_select + '</button>');
                $('#tag input').attr('value', $('#tag input').val() + user_select + ' ');
            }
        });
        $('#this-tag-add').click(function (e) {
            e.preventDefault();
            var num = $('#tag input').attr('value').split(" ").length;
            var user_select = $('#category_tag option:selected').text();

            if (num > 5) {
                alert('標籤最多5個');
            } else if ($('#tag input').attr('value').indexOf(user_select) !== -1) {
                alert('已經有重複的標籤');
            } else {
                $('#tag').append('<button class="btn btn-primary btn-sm p-1 mr-1">' + user_select + '</button>');
                $('#tag input').attr('value', $('#tag input').val() + user_select + ' ');
            }
        });
        $('#tag').click(function (e) {
            e.preventDefault();
            if (e.target.nodeName !== 'BUTTON') {
                return;
            }
            var ary = $('#tag input').attr('value').split(e.target.textContent + ' ');
            ary = ary.join('');
            $('#tag input').attr('value', ary)
            $(e.target).remove();
        });
        $('#article_create').submit(function (e) {
            let editorData = editor.getData();
            let create_temp = document.createElement('div');
            create_temp.innerHTML = editorData;

            var num = $('#tag input').attr('value').split(" ");
            if (num.length >= 6) {
                if (Boolean(num[5])){
                    alert('標籤最多5個');
                    e.preventDefault();
                    return;
                }
            }
            if (!editorData) {
                alert('沒有文章內容!!');
            } else {
                let description = $(create_temp).find('h2,p,h3,h4').text().substr(0, 80);
                let img = $(create_temp).find('img').attr('src') || '';
                let split_str = '/-justforum-/';
                $('#article_content').val(editorData + split_str + description + split_str + img);
                return;
            }
            e.preventDefault();
        });
        //==================================ckedit5setting==================================
        //Array.from(editor.ui.componentFactory.names());
        class MyUploadAdapter {
            constructor(loader) {
                // The file loader instance to use during the upload.
                this.loader = loader;
            }
            // Starts the upload process.
            upload() {
                return this.loader.file
                    .then(file => new Promise((resolve, reject) => {
                        this._initRequest();
                        this._initListeners(resolve, reject, file);
                    }));
            }
            //終止上傳
            abort() {
                if (this.xhr) {
                    this.xhr.abort();
                }
            }
            _initRequest() {
                $('#create_article').text('圖片上傳中..');
                $('#create_article').attr('disabled', '');
                const xhr = this.xhr = new XMLHttpRequest();
                xhr.open('POST', '/article/image', true);
                xhr.responseType = 'json';
            }
            _initListeners(resolve, reject, file) {
                const xhr = this.xhr;
                const loader = this.loader;
                const genericErrorText = `無法上傳文件: ${ file.name }.`;
                xhr.addEventListener('error', () => reject(genericErrorText));
                xhr.addEventListener('abort', () => reject());
                xhr.addEventListener('load', () => {
                    const response = xhr.response;
                    if (!response || response.error) {
                        alert(response.error || '圖片上傳失敗!!');
                        $('#create_article').text('儲存');
                        $('#create_article').removeAttr('disabled');
                        return reject(response && response.error ? response.error.message : genericErrorText);
                    }
                    $('#create_article').text('儲存');
                    $('#create_article').removeAttr('disabled');
                    resolve({
                        default: response.url
                    });
                });
                if (file) {
                    let type = ('jpg jpeg png gif bmp').split(' ');
                    let check = false;
                    type.forEach((v) => {
                        if (file.type.indexOf(v) !== -1) {
                            check = true;
                        }
                    });
                    if (check) {
                        let reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = function () {
                            const data = new FormData();
                            if (file.size / 1024 > 1025) {
                                let img = new Image();
                                img.src = this.result;
                                img.onload = function () {
                                    //圖檔，壓縮比，寬，高，寬高比
                                    let that = this,
                                        wid = that.width,
                                        hig = that.height,
                                        scale = wid / hig;
                                    //最寬1920/最高1080
                                    if (that.width > that.height) {
                                        wid = that.width > 1920 ? 1920 : that.width;
                                        hig = wid / scale;
                                    } else {
                                        hig = that.height > 1080 ? 1080 : that.height;
                                        wid = hig * scale;
                                    }
                                    let quality = 0.7; // 默認圖片質量為0.7
                                    let canvas = document.createElement('canvas');
                                    let ctx = canvas.getContext('2d');
                                    // 創建屬性節點
                                    let anw = document.createAttribute("width");
                                    anw.nodeValue = wid;
                                    let anh = document.createAttribute("height");
                                    anh.nodeValue = hig;
                                    canvas.setAttributeNode(anw);
                                    canvas.setAttributeNode(anh);
                                    ctx.drawImage(that, 0, 0, wid, hig);
                                    let b64Data = canvas.toDataURL('image/jpeg', quality);

                                    const byteCharacters = atob(b64Data.split(',')[1]);
                                    const byteArrays = [];
                                    const sliceSize = 512;
                                    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                                        const slice = byteCharacters.slice(offset, offset + sliceSize);
                                        const byteNumbers = new Array(slice.length);
                                        for (let i = 0; i < slice.length; i++) {
                                            byteNumbers[i] = slice.charCodeAt(i);
                                        }
                                        const byteArray = new Uint8Array(byteNumbers);
                                        byteArrays.push(byteArray);
                                    }
                                    const blob = new Blob(byteArrays, {
                                        type: b64Data.split(',')[0].split(';')[0].split(':')[1]
                                    });

                                    data.append('photo', blob);
                                    xhr.send(data);
                                }
                            } else {
                                data.append('photo', file);
                                xhr.send(data);
                            }
                        }
                    } else {
                        reject('您選擇的圖檔不支援，或並不是圖檔，僅支援jpg png gif bmp格式的圖檔。');
                    }
                }

                //上傳進度
                if (xhr.upload) {
                    xhr.upload.addEventListener('progress', evt => {
                        if (evt.lengthComputable) {
                            loader.uploadTotal = evt.total;
                            loader.uploaded = evt.loaded;
                        }
                    });
                }
            }
        }

        function MyUploadAdapterPlugin(editor) {
            editor.plugins.get('FileRepository').createUploadAdapter = function (loader) {
                return new MyUploadAdapter(loader);
            }
        }
        
        ClassicEditor
            .create(document.querySelector('#editor'), {
                toolbar: {
                    viewportTopOffset: $('.navbar-dark').height()+2
                },
                extraPlugins: [MyUploadAdapterPlugin],
                imageUpload: {
                    uploadUrl: $('#editor').data('url') + '/article/image'
                }
            })
            .then(editor => {
                window.editor = editor;
            })
            .catch(err => {
                console.log(err);
            });
    });
}
export function forum() {
    $(document).ready(function () {
        new Vue({
            el: '#article_list',
            directives: {
                infiniteScroll
            },
            data: {
                data: [],
                busy: false,
                step1: false,
                article_show: [],
                count: 0,
                between: 3,
                ending: false,
                type: $('#article_list').data('type'),
                tag: '最新文章',
                start: 200,
                selected: 'new',
                select_busy: false
            },
            watch: {
                selected: function () {
                    if (this.select_busy) {
                        this.select_busy = false;
                    } else {
                        if (this.data.length > 1) {
                            if (this.selected == 'new') {
                                this.new_article();
                            } else if (this.selected == 'hot') {
                                this.hot_article();
                            }
                        }
                    }
                }
            },
            methods: {
                loadMore: function () {
                    this.busy = true;
                    this.start = 10;
                    let self = this;
                    setTimeout(() => {
                        if (!self.step1) {
                            $.ajax({
                                type: "POST",
                                url: "/forum/article",
                                data: {
                                    _csrf: $('#article_list').data('key'),
                                    type: this.type,
                                    tag: this.tag
                                },
                                dataType: "json",
                                success: function (response) {
                                    if (response.data !== 'nodata') {
                                        let temp = response.data.article;
                                        let keys = Object.keys(temp);

                                        for (let i = 0; i < keys.length; i++) {
                                            self.data.push(temp[keys[i]]);
                                        }
                                        self.step1 = true;
                                        if (response.type == '最多人觀看') {
                                            self.hot_article();
                                        } else {
                                            self.new_article();
                                        }

                                    } else {
                                        self.step1 = true;
                                        self.busy = false;
                                        self.data = 'nodata';
                                        self.loadMore();
                                    }
                                },
                                error: function (err) {
                                    self.step1 = true;
                                    self.busy = false;
                                    self.data = 'nodata';
                                }
                            });
                        } else {
                            if (this.data !== 'nodata') {
                                for (let i = this.count; i < this.count + this.between; i++) {
                                    this.article_show.push(this.data[i]);
                                    if (this.data.length - 1 == i) {
                                        this.ending = true;
                                        break;
                                    }
                                }
                                this.busy = false;
                                if (this.ending) {
                                    this.busy = true;
                                } else {
                                    this.count += this.between;
                                }
                            } else {
                                this.ending = true;
                                this.busy = true;
                            }
                        }
                    }, 100);
                },
                todate(time) {
                    var date = new Date(parseInt(time));
                    return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
                },
                get_type_tag(type, tag) {
                    if (this.type !== type || this.tag !== tag) {
                        this.type = type;
                        this.tag = tag;
                        this.article_show = [];
                        this.ending = false;
                        this.step1 = false;
                        this.busy = false;
                        this.data = [];
                        let article_views = $('#article_views').offset().top;
                        $('html,body').animate({scrollTop:article_views}, 500);
                        this.loadMore();
                    }
                },
                new_article() {
                    if (this.selected !== 'new') {
                        this.select_busy = true;
                        this.selected = 'new';
                    }

                    this.article_show = [];
                    this.data = this.data.sort(function (a, b) {
                        return a.editor_time < b.editor_time ? 1 : -1;
                    });
                    this.count = 0;
                    this.ending = false;
                    this.busy = false;
                    this.loadMore();
                },
                hot_article() {
                    if (this.selected !== 'hot') {
                        this.select_busy = true;
                        this.selected = 'hot';
                    }

                    this.article_show = [];
                    this.data = this.data.sort(function (a, b) {
                        return a.watch < b.watch ? 1 : -1;
                    });
                    this.count = 0;
                    this.ending = false;
                    this.busy = false;
                    this.loadMore();
                }
            }
        });
    });
}
export function article_msg() {
    $(document).ready(function () {
        let id = $('#user_res').data('id');
        let title_ = $('#user_res').data('title').toString();
        if (id && title_) {
            if (localStorage.getItem('article_log')) {
                let log = JSON.parse(localStorage.getItem('article_log'));
                let index = log.indexOf(title_);
                if (index !== -1) {
                    let title = log[index],
                        url = log[index + 1];
                    log.splice(index + 1, 1);
                    log.splice(index, 1);
                    log.splice(0, 0, url);
                    log.splice(0, 0, title);
                } else {
                    log.splice(0, 0, '/article?id=' + id);
                    log.splice(0, 0, title_);
                }
                localStorage.setItem('article_log', JSON.stringify(log));
            } else {
                let log = [];
                log.push(title_);
                log.push('/article?id=' + id);
                localStorage.setItem('article_log', JSON.stringify(log));
            }
        }
        new Vue({
            el: '#user_res',
            directives: {
                infiniteScroll
            },
            data: {
                data: [],
                busy: false,
                step1: false,
                article_show: [],
                count: 0,
                between: 3,
                ending: false,
                start: 500,
                num: '0 則'
            },
            watch: {

            },
            methods: {
                loadMore: function () {
                    this.busy = true;
                    this.start = 10;
                    let self = this;
                    setTimeout(() => {
                        if (!self.step1) {
                            $.ajax({
                                type: "POST",
                                url: "/article/msg_get",
                                data: {
                                    _csrf: $('#user_res').data('key'),
                                    id: $('#user_res').data('id')
                                },
                                dataType: "json",
                                success: function (response) {
                                    if (response.data !== 'nodata') {
                                        self.data = response.data;
                                        self.step1 = true;
                                        self.busy = false;
                                        self.num = response.data.length + ' 則';
                                    } else {
                                        self.step1 = true;
                                        self.busy = false;
                                        self.data = 'nodata';
                                        self.loadMore();
                                    }
                                },
                                error: function (err) {
                                    self.step1 = true;
                                    self.busy = false;
                                    self.data = 'nodata';
                                }
                            });
                        } else {
                            if (this.data !== 'nodata') {
                                for (let i = this.count; i < this.count + this.between; i++) {
                                    if (this.data[i].msg.split('\n').length >= 3) {
                                        this.data[i].pre = true;
                                    }
                                    this.article_show.push(this.data[i]);
                                    if (this.data.length - 1 == i) {
                                        this.ending = true;
                                        break;
                                    }
                                }
                                this.busy = false;
                                if (this.ending) {
                                    this.busy = true;
                                } else {
                                    this.count += this.between;
                                }
                            } else {
                                this.ending = true;
                                this.busy = true;
                            }
                        }
                    }, 100);
                },
                todate(time) {
                    var date = new Date(parseInt(time));
                    return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
                },
                show(e) {
                    $(e.target).siblings('pre').toggleClass('open');

                    if ($(e.target).siblings('pre').attr('class').indexOf('open') == -1) {
                        $(e.target).text('顯示完整內容');
                    } else {
                        $(e.target).text('隱藏部分內容');

                    }

                },
                before_time(time) {
                    let today = new Date();
                    let distance = today.getTime() - parseInt(time);
                    distance = Math.floor(distance / 1000);
                    if (distance < 60) {
                        return distance.toString() + '秒之前';
                    } else if (distance / 60 < 60) {
                        return Math.floor(distance / 60).toString() + '分鐘之前';
                    } else if (distance / 60 / 60 < 24) {
                        return Math.floor(distance / 60 / 60).toString() + '小時之前';
                    } else if (distance / 60 / 60 / 24 < 31) {
                        return Math.floor(distance / 60 / 60 / 24).toString() + '天之前';
                    } else if (distance / 60 / 60 / 24 / 365 < 1) {
                        return Math.floor(distance / 60 / 60 / 24 / 30).toString() + '月之前';
                    } else if (distance / 60 / 60 / 24 / 365 >= 1) {
                        return Math.floor(distance / 60 / 60 / 24 / 365).toString() + '年之前';
                    }
                }

            }
        });
    });
}
export function layout() {
    $(document).ready(function () {
        //search、menu半透明背景使用
        $('#menu-show').click(function (e) {
            e.preventDefault();
            $('#menu-show span').toggleClass('active');
            $('.left-close').stop().fadeToggle();
            $('.search-close').stop().fadeOut();
            $('.left-menu').toggleClass('show');
            //blur
            $('.contents').toggleClass('blur-left');
            $('.contents').removeClass('blur-search');
            //bg-transparent-black
            $('.search-min').removeClass('show');
        });
        $('#search-min').click(function (e) {
            e.preventDefault();
            $('.search-close').stop().fadeToggle();
            $('.left-close').stop().fadeOut();
            $('.search-min').toggleClass('show');
            //blur
            $('.contents').toggleClass('blur-search');
            $('.contents').removeClass('blur-left');
            //bg-transparent-black
            $('.left-menu').removeClass('show');
            //menu-animate
            $('#menu-show span').removeClass('active');
        });
        $('.left-close , .search-close').click(function (e) {
            e.preventDefault();
            $('.left-menu , .search-min').removeClass('show');
            $('.left-close , .search-close').stop().fadeOut();
            $('#menu-show span').removeClass('active');
            //blur
            $('.contents').removeClass('blur-left blur-search');
        });
        //滑鼠移動背景移動
        if ($('.img-b').attr('class').indexOf('index') !== -1){
            let win_w = $(window).innerWidth() / 2;
            let win_h = $(window).innerHeight() / 2;
            $(window).resize(function () {
                win_w = $(window).innerWidth() / 2;
                win_h = $(window).innerHeight() / 2;
            });
            $(window).mousemove(function (e) {
                // values: e.clientX, e.clientY, e.pageX, e.pageY
                let late_x = 0,
                    late_y = 0;
                if (e.clientX > win_w) {
                    late_x = (win_w - e.clientX) / 20;
                } else {
                    late_x = -(e.clientX - win_w) / 20;
                }
                if (e.clientY > win_h) {
                    late_y = (win_h - e.clientY) / 20;
                } else {
                    late_y = -(e.clientY - win_h) / 20;
                }
                $('.img-b').css('transform', 'translate(' + late_x + 'px,' + late_y + 'px)');
            });
        }
        //nav_bar隱藏動畫行動版
        let nav_bar = $('#nav_bar');
        let nav_bar_top = 0;
        let nav_bar_status = true;
        $(window).scroll(function () {
            if (nav_bar.css('display') == 'block') {
                if ($(this).scrollTop() > nav_bar_top) {
                    if (nav_bar_status){
                        nav_bar.addClass('hide');
                        nav_bar.removeClass('bounce');
                        nav_bar_status = false;
                        $('.search-min,.left-menu').css('top', '0');
                    }
                }else{
                    if (!nav_bar_status) {
                        nav_bar.removeClass('hide');
                        nav_bar.addClass('bounce');
                        nav_bar_status = true;
                        $('.search-min,.left-menu').css('top', '43px');
                    }
                }
                nav_bar_top = $(this).scrollTop();
            }
            
        });

        //歷史紀錄
        if (localStorage.getItem('article_log')){
            let log = JSON.parse(localStorage.getItem('article_log'));
            $('.article_log').text('');
            if (log.length > 10){
                log.length =10;
            }
            for (let i = 0; i < log.length; i+=2) {
                $('.article_log').append(`<a class="d-inline-block text-truncate w-100" href="${log[i+1]}" title="${log[i]}">${log[i]}</a>`);
            }
        }
        //封面動畫
        setTimeout(function () {
            $('.loading_animate').fadeOut(1000);
            $('body').removeClass('overflow-hidden');
            setTimeout(function () {
                $('.loading_animate').remove();
            }, 900);
        }, 300);
        //火箭
        $(window).scroll(function () {
            let top = $(this).scrollTop();
            if (top > 50) {
                $('.gotop').addClass('show');
            } else {
                $('.gotop').removeClass('show');
            }
        });
        $('.gotop').click(function (e) {
            e.preventDefault();
            $('html,body').animate({
                scrollTop: 0
            }, 1000);
            $(this).addClass('gomoon');

            this.addEventListener('animationend', function () {
                $(this).removeClass('gomoon');
            });
        });
        //離開網站動畫
        window.onbeforeunload = function () {
            if ($('section').data('type') !== 'article'){
                $('body').append(`<div class="leave">
                <div class="t"></div>
                <div class="b"></div>
                <div class="l"></div>
                <div class="r"></div>
                </div>`);
                setTimeout(() => {
                    $('.leave').addClass('open');
                }, 100);
            }
        }
        //-------------------socket.io-------------------------
        //card-toggle
        $('.card-toggle .card-header').click(function (e) {
            e.preventDefault();
            $(this).find('i').toggleClass('open');
            $(this).parent().find('.card-body').slideToggle();
        });
        //驗證聊天室登入
        let user_name = $('.chat .public input[name="user_info"]').val();
        if (!user_name) {
            if (localStorage.getItem('chat_nick')) {
                $('.chat .public input[name="user_info"]').val(localStorage.getItem('chat_nick'));
                $('.chat .public input[name="user_info"]').val();
                $('.chat .public #reset_nick').removeClass('d-none');
            } else {
                $('.chat .public .set_username').removeClass('d-none');
            }
        }
        //set_nick
        $('.chat .public .set_username button').click(function (e) {
            e.preventDefault();
            let nick = $('.chat .public .set_username input').val();
            if (nick) {
                $('.chat .public .set_username').addClass('d-none');
                $('.chat .public input[name="user_info"]').val(nick);
                $('.chat .public #reset_nick').removeClass('d-none');
                localStorage.setItem('chat_nick', nick);
            } else {
                alert('請輸入正確的暱稱');
            }
        });
        //重新設定暱稱
        $('.chat .public #reset_nick').click(function (e) {
            e.preventDefault();
            let user_name = localStorage.getItem('chat_nick');
            if (user_name) {
                $('.chat .public .set_username input').val(user_name);
            }
            $('.chat .public .set_username').removeClass('d-none');
        });
        //開啟聊天窗
        let step1 = true;
        $('.chat .card .card-header').click(function (e) {
            e.preventDefault();
            $('.chat .card .card-body').slideToggle(300);
            $(this).find('.default').toggleClass('focus');
            $(this).find('.change').toggleClass('d-none')
            if (step1) {
                step1 = false;
                let msg_init = document.getElementById('public_msg');
                msg_init.scrollTop = msg_init.scrollHeight - msg_init.clientHeight;
            }
        });
        //切換聊天窗
        $('.chat .card .card-header .change').click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).siblings('span').toggleClass('focus default');
            $('.chat .card .card-body > .d-flex > div').toggleClass('show');
        });
        //input判斷是否封鎖按鈕
        $('.chat .public input[type="search"]').on('keyup', function () {
            let text = $(this).val() || '';
            if (text) {
                $(this).siblings('button').removeAttr('disabled');
            } else {
                $(this).siblings('button').attr('disabled', '');
            }
        });
        const ip = $('.chat .public input[name="user_info"]').data('auth') == '0' ? $('.chat').data('ip') :
            {
                ip: $('.chat').data('ip'),
                name: $('.chat .public input[name="user_info"]').val(),
                img: $('.chat .public input[name="user_pic"]').val(),
                auth: '1'
            };

        //進入網頁後，提交上線狀態
        if (typeof (ip) == 'object') {
            socket.emit('online', ip);
        } else {
            socket.emit('online', {
                ip: ip,
                auth: ''
            });
        }
        let delay_msg = true;

        function send_msg(msg) {
            if (delay_msg) {
                delay_msg = false;
                setTimeout(() => {
                    delay_msg = true;
                }, 3000);
                if (typeof (ip) == 'object') {
                    if (ip.name && ip.img) {
                        ip.msg = msg;
                        return ip;
                    } else {
                        return '0';
                    }
                }
                let name = $('.chat .public input[name="user_info"]').val();
                let img = $('.chat .public input[name="user_pic"]').val();
                if (name && img) {
                    return {
                        ip: ip,
                        name: name,
                        img: img,
                        msg: msg,
                        auth: ''
                    }
                } else {
                    return '0';
                }
            } else {
                $('.sys_msg').show().fadeOut(1000);
                return '';
            }
        }
        //enter發送訊息
        $('.public form').submit(function (e) {
            e.preventDefault();
            let msg = $(this).find('input[name="msg"]').val() || '';
            if (msg) {
                let data = send_msg(msg);
                if (data) {
                    $(this).find('input[name="msg"]').val('');
                    socket.emit('send', data);
                }
            }
        });
        //發送訊息
        $('.chat .public #send_msg').click(function (e) {
            e.preventDefault();
            let msg = $(this).siblings('input[name="msg"]').val() || '';
            if (msg) {
                $(this).attr('disabled', '');
                let data = send_msg(msg);
                if (data) {
                    $(this).find('input[name="msg"]').val('');
                    socket.emit('send', data);
                }
            }
        });

        function show_msg_list(target_id, msg) {
            let msgbox = document.getElementById(target_id);
            let scroll_bottom = false;
            if (msgbox.scrollTop + 10 >= msgbox.scrollHeight - msgbox.clientHeight) {
                scroll_bottom = true;
            }
            let ip_ = '';
            if (typeof (ip) == 'object') {
                ip_ = ip.ip;
            } else {
                ip_ = ip;
            }
            //檢查訊息來源是否為自己
            let template = '';
            if (ip_ == msg.ip) {
                let xss = document.createElement('div');
                xss.className = 'media my-3';
                xss.innerHTML = `<div class="user_msg media-body text-right">
                                    <pre class="text-break mb-0"></pre>
                                    <small class="text-secondary">${msg.date}</small>
                                </div>`;
                $(xss).find('pre').text(msg.msg);
                template = xss;
            } else {
                let xss = document.createElement('div');
                xss.className = 'media my-3';
                xss.innerHTML = `<div class="img_box">
                                    <img width="30" height="30" src="${msg.img}" alt="" class="d-flex mr-3" style="border-radius: 50%;">
                                    <div class="ip_box alert alert-warning m-0 p-0">
                                        ${!msg.auth ? 'ip:' + msg.ip : 'ip:會員保密。'}
                                    </div>
                                </div>
                                <div class="user_msg media-body">
                                    <div class="text-primary name_"></div>
                                    <pre class="text-break mb-0"></pre>
                                    <small class="text-secondary">${msg.date}</small>
                                </div>`;
                $(xss).find('.user_msg .name_').text(msg.name);
                $(xss).find('pre').text(msg.msg);
                template = xss;
            }

            if (scroll_bottom) {
                $(msgbox).append(template);
                msgbox.scrollTop = msgbox.scrollHeight - msgbox.clientHeight;
            } else {
                $(msgbox).append(template);
            }
        }
        //接收訊息
        socket.on('getmsg', function (msg) {
            show_msg_list('public_msg', msg);
        });
        //提交線上狀態
        socket.on('online_test', function (msg) {
            let ip_ = '';
            let auth = '';
            if (typeof (ip) == 'object') {
                ip_ = ip.ip;
                auth = '1';
            } else {
                ip_ = ip;
            }
            socket.emit('online', {
                ip: ip_,
                auth: auth
            });
        });
        //監聽線上人數
        socket.on('online', function (msg) {
            $('.online-person').text(msg.all);
            $('.not-auth').text(msg.not_auth);
        });

        

    });
}