!function(t){var e={};function i(n){if(e[n])return e[n].exports;var s=e[n]={i:n,l:!1,exports:{}};return t[n].call(s.exports,s,s.exports,i),s.l=!0,s.exports}i.m=t,i.c=e,i.d=function(t,e,n){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var s in t)i.d(n,s,function(e){return t[e]}.bind(null,s));return n},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=1)}([function(t,e,i){t.exports=function(){"use strict";var t="@@InfiniteScroll",e=function(t){return t===window?Math.max(window.pageYOffset||0,document.documentElement.scrollTop):t.scrollTop},i=document.defaultView.getComputedStyle,n=function(t){return t===window?e(window):t.getBoundingClientRect().top+e(window)},s=function(t){for(var e=t.parentNode;e;){if("HTML"===e.tagName)return!0;if(11===e.nodeType)return!1;e=e.parentNode}return!1},r=function(){if(!this.binded){this.binded=!0;var t,e,n,s,r,a,l,c,u=this,d=u.el,f=d.getAttribute("infinite-scroll-throttle-delay"),h=200;f&&(h=Number(u.vm[f]||f),(isNaN(h)||h<0)&&(h=200)),u.throttleDelay=h,u.scrollEventTarget=function(t){for(var e=t;e&&"HTML"!==e.tagName&&"BODY"!==e.tagName&&1===e.nodeType;){var n=i(e).overflowY;if("scroll"===n||"auto"===n)return e;e=e.parentNode}return window}(d),u.scrollListener=(t=o.bind(u),e=u.throttleDelay,c=function(){t.apply(a,l),s=n},function(){if(a=this,l=arguments,n=Date.now(),r&&(clearTimeout(r),r=null),s){var t=e-(n-s);t<0?c():r=setTimeout((function(){c()}),t)}else c()}),u.scrollEventTarget.addEventListener("scroll",u.scrollListener),this.vm.$on("hook:beforeDestroy",(function(){u.scrollEventTarget.removeEventListener("scroll",u.scrollListener)}));var p=d.getAttribute("infinite-scroll-disabled"),g=!1;p&&(this.vm.$watch(p,(function(t){u.disabled=t,!t&&u.immediateCheck&&o.call(u)})),g=Boolean(u.vm[p])),u.disabled=g;var m=d.getAttribute("infinite-scroll-distance"),b=0;m&&(b=Number(u.vm[m]||m),isNaN(b)&&(b=0)),u.distance=b;var v=d.getAttribute("infinite-scroll-immediate-check"),w=!0;v&&(w=Boolean(u.vm[v])),u.immediateCheck=w,w&&o.call(u);var y=d.getAttribute("infinite-scroll-listen-for-event");y&&u.vm.$on(y,(function(){o.call(u)}))}},o=function(t){var i=this.scrollEventTarget,s=this.el,r=this.distance;if(!0===t||!this.disabled){var o=e(i),a=o+function(t){return t===window?document.documentElement.clientHeight:t.clientHeight}(i);(i===s?i.scrollHeight-a<=r:a+r>=n(s)-n(i)+s.offsetHeight+o)&&this.expression&&this.expression()}},a={bind:function(e,i,n){e[t]={el:e,vm:n.context,expression:i.value};var o=arguments;e[t].vm.$on("hook:mounted",(function(){e[t].vm.$nextTick((function(){s(e)&&r.call(e[t],o),e[t].bindTryCount=0,function i(){e[t].bindTryCount>10||(e[t].bindTryCount++,s(e)?r.call(e[t],o):setTimeout(i,50))}()}))}))},unbind:function(e){e&&e[t]&&e[t].scrollEventTarget&&e[t].scrollEventTarget.removeEventListener("scroll",e[t].scrollListener)}},l=function(t){t.directive("InfiniteScroll",a)};return window.Vue&&(window.infiniteScroll=a,Vue.use(l)),a.install=l,a}()},function(t,e,i){"use strict";i.r(e);i(0);$(document).ready((function(){var t;$("#choose_user_img").change((function(e){var i;e.preventDefault(),(i=this,new Promise((t,e)=>{let n=i.files[0];if(i.files&&n){let i="jpg jpeg png gif bmp".split(" "),s=!1;if(i.forEach(t=>{-1!==n.type.indexOf(t)&&(s=!0)}),s){let e=new FileReader;e.readAsDataURL(n),e.onload=function(){if(n.size/1024>512){let e=new Image;e.src=this.result,e.onload=function(){let e=this,i=e.width,n=e.height,s=i/n;e.width>e.height?n=(i=e.width>300?300:e.width)/s:i=(n=e.height>300?300:e.height)*s;let r=document.createElement("canvas"),o=r.getContext("2d"),a=document.createAttribute("width");a.nodeValue=i;let l=document.createAttribute("height");l.nodeValue=n,r.setAttributeNode(a),r.setAttributeNode(l),o.drawImage(e,0,0,i,n);let c=r.toDataURL("image/jpeg",.9);t(c)}}else t(this.result)}}else e("您選擇的不是圖檔")}})).then((function(e){const i=((t,e,i=512)=>{const n=atob(t),s=[];for(let t=0;t<n.length;t+=i){const e=n.slice(t,t+i),r=new Array(e.length);for(let t=0;t<e.length;t++)r[t]=e.charCodeAt(t);const o=new Uint8Array(r);s.push(o)}return new Blob(s,{type:e})})(e.split(",")[1],e.split(",")[0].split(";")[0].split(":")[1]);(t=new FormData).append("photo",i,"file_"+Date.parse(new Date)+".jpg"),$("#user_img i").addClass("d-none"),$("#user_img img").removeClass("d-none"),$("#user_img img").attr("src",e),$("#user_img a").attr("href",e)})).catch((function(t){alert(t)}))})),$("#user_set").click((function(e){e.preventDefault(),$(this).attr("disabled",""),$(this).text("處理中..."),t?$.ajax({type:"POST",url:"/user/image",data:t,contentType:!1,cache:!1,processData:!1,dataType:"json",success:function(t){"success"==t.data?$("#user_submit").trigger("click"):(alert(t.msg),$("#user_submit").trigger("click"))}}).fail((function(){alert("圖片存檔失敗，請稍後在試。"),$("#user_submit").trigger("click")})):$("#user_submit").trigger("click")})),$("#alter_passwd").click((function(t){t.preventDefault(),$("#alter_passwd_modal").hide(),$("#alter_passwd_box").removeClass("d-none")})),$("#account-set form").submit((function(t){$("#newpassword").val()!==$("#password_ok").val()?(t.preventDefault(),alert("新密碼與確認密碼不一致!!")):$(this).find("button").attr("disabled","")})),new Vue({el:"#article-set",directives:{infiniteScroll:infiniteScroll},data:{data:{},busy:!1,step1:!1,article_show:[],keys:[],count:0,between:3,ending:!1,status:"public",class_:"btn btn-outline-secondary rounded-0 flex-grow-1",class_focus:["active",""]},methods:{loadMore:function(){this.busy=!0;let t=this;setTimeout(()=>{if("none"!==$("#article-set").css("display"))if(t.step1)if("nodata"!==this.data){for(let t=this.count;t<this.count+this.between;t++)if(this.data[this.keys[t]].status==this.status&&this.article_show.push(this.data[this.keys[t]]),this.keys.length-1==t){this.ending=!0;break}this.busy=!1,this.ending?this.busy=!0:this.count+=this.between}else this.ending=!0,this.busy=!0;else $.ajax({type:"POST",url:"/user/user_article",data:{_csrf:$("#article-set").data("key")},dataType:"json",success:function(e){"nodata"!==e.data?(t.data=e.data.article,t.keys=Object.keys(t.data).reverse(),t.step1=!0,t.busy=!1):(t.step1=!0,t.busy=!1,t.data="nodata")}});else this.busy=!1},100)},public:function(){"public"!==this.status&&(this.status="public",this.article_show=[],this.class_focus=["active",""],this.ending=!1,this.count=0,this.busy=!1,this.loadMore())},draft:function(){"draft"!==this.status&&(this.status="draft",this.article_show=[],this.class_focus=["","active"],this.ending=!1,this.count=0,this.busy=!1,this.loadMore())},del_article:function(t){confirm("確定刪除嗎?")||t.preventDefault()},todate(t){var e=new Date(parseInt(t));return e.getFullYear()+"/"+(e.getMonth()+1)+"/"+e.getDate()}}})}))}]);