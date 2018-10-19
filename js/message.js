var datas = {
    "start": 0,
    "limit": 12
};
Ajax.call('/apis/api/method/iot.user_api.device_activity',JSON.stringify(datas), message, 'POST', 'JSON', 'JSON');
function message(req){
    console.log(req.message)
    var list = req.message;
    var posed = [];
    for (var j=0;j<list.length;j++){
        console.log(list[j].disposed);
        if(list[j].disposed == 0){
            posed.push(list[j]);
        }
    }  //把所有未读消息集合
    // console.log(posed);
    if(posed.length == 0){
        console.log('暂时没有未读信息');
        $('.have').hide();
        $('.no_have').show();
        $('.redDot').hide();
    }else{
        console.log('有未读信息');
        $('.have').show();
        $('.no_have').hide();
        $('.redDot').show();
        //渲染列表
        for (var i=0;i<12;i++){
            $('.list_box').append(
                '<li class="box_li">' +
                '<span>'+posed[i].subject.substr(0,18)+'...'+ $.parseJSON(posed[i].message).device_status +'!</span>' +
                '<span class="message_id" style="display: none;">'+posed[i].name+'</span>' +
                '<span class="message_ago" title="'+posed[i].creation+'"></span>' +
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
}