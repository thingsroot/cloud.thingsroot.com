//获取当前时间
var date = new Date();
var year = date.getFullYear();
var month = date.getMonth() + 1;
var day = date.getDate();
if (month < 10) {month = "0" + month;}
if (day < 10) {day = "0" + day;}
var nowDate = year + "-" + month + "-" + day;

var datas = {
    "start": 0,
    "limit": 34
};
Ajax.call('/apis/api/method/iot.user_api.device_activity', JSON.stringify(datas), message, 'POST', 'JSON', 'JSON');
function message(req){
    var list = req.message;
    //判断有没有最近消息
    if(list.length == 0 ){
        $('.redDot').hide();
    }else{
        $('.redDot').show();
    }
    //渲染列表
    var arr1 = [];
    for (var j=0;j<list.length;j++){
        if(list[j].disposed == 0){
            arr1.push(list[j]);
        }
    }
    console.log('-------------------')
    console.log(arr1)
    for (var i=0;i<12;i++){
        $('.list_box').append(
            '<li class="box_li">' +
            '<span>'+arr1[i].subject.substr(0,18)+'...'+ $.parseJSON(arr1[i].message).device_status +'!</span>' +
            '<span class="message_id" style="display: none;">'+arr1[i].name+'</span>' +
            '<span class="message_ago" title="'+arr1[i].creation+'"></span>' +
            '</li>'
        );
        $('.message_ago').eq(i).timeago();
        $('.box_li')[i].index = i;
        $('.box_li')[i].onclick = function(){
            var name = $('.message_id').eq(this.index).text();
            location.href = 'platform_details.html?name=' + name;
        }
    }
    var ago = $('.message_ago');
    console.log(ago);
    for(var i=0;i<ago.length;i++){
        console.log(ago[i])
    }
    $('.message_ago').eq(i).timeago();
}