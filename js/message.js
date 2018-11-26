var datas = {
    "start": 0,
    "limit": 12
};
Ajax.call('/apis/api/method/iot.user_api.device_activity',JSON.stringify(datas), message1, 'POST', 'JSON', 'JSON');
function message1(req){
    var list = req.message;
    var posed = [];
    for (var j=0;j<list.length;j++){
        if(list[j].disposed == 0){
            posed.push(list[j]);
        }
    }  //把所有未读消息集合
    if(posed.length == 0){
        $('.have').hide();
        $('.no_have').show();
        $('.redDot').hide();
    }else if(posed.length != 0){
        $('.have').hide();
        $('.no_have').hide();
        $('.redDot').show();
        //渲染列表
        for (var i=0;i<posed.length;i++){
            var obj = JSON.parse(posed[i].message);
            console.log(obj);
            var text;
//设备状态
            if(obj.hasOwnProperty('device_status')){
                if(obj.device_status == "ONLINE"){
                    text = '设备上线';
                } else{
                    text = '设备离线';
                }
                //设备操作
            } else if(obj.hasOwnProperty('action')){
                if(obj.channel == "app"){
                    if(obj.action == "option"){   //开机自启动
                        if(obj.data.value == 1){
                            text = '开启应用'+ obj.data.inst+'开机自启动'
                        }else if(obj.data.value == 0){
                            text = '关闭应用'+ obj.data.inst+'开机自启动'
                        }
                    }
                    else if(obj.action == "restart"){
                        text = '重启应用'+ obj.data.inst;
                    }else if(obj.action == "start"){
                        text = '启动应用'+obj.data.inst;
                    }else if(obj.action == "stop"){
                        text = '停止应用'+obj.data.inst;
                    }else if(obj.action == "conf"){
                        text = '更改应用'+obj.data.inst+'应用配置';
                    }else if(obj.action == "upload_comm"){
                        if(obj.data.sec == 0){
                            text = '停止上传应用'+obj.data.inst+'报文';
                        }else if(obj.data.sec == 120){
                            text = '上传应用'+obj.data.inst+'报文';
                        }
                    }else if(obj.action == "install"){
                        text = '安装应用'+obj.data.name+'实例名'+obj.data.inst;
                    }else if(obj.action == "uninstall"){
                        text = '卸载应用'+obj.data.inst;
                    }else if(obj.action == "query_comm"){
                        text = '应用'+obj.data.inst+'查询报文';
                    }else if(obj.action == "query_log"){
                        text = '应用'+obj.data.inst+'查询日志';
                    }else if(obj.action == "list"){
                        text = '刷新应用列表';
                    }else if(obj.action == "upgrade"){
                        text = '应用'+obj.data.inst+'升级到最新版本'
                    }else if(obj.action == "rename"){
                        text = '应用'+obj.data.inst+'重命名为'+obj.data.new_name;
                    }
                }  //app
                else if(obj.channel == "sys"){
                    if(obj.action == "enable/beta"){
                        if(obj.data == 0){
                            text = '网关关闭beta模式';
                        }else if(obj.data == 1){
                            text = '网关开启beta模式';
                        }
                    }else if(obj.action == "enable/data"){
                        if(obj.data == 0){
                            text = '网关关闭数据上传';
                        }else if(obj.data == 1){
                            text = '网关开启数据上传';
                        }
                    }else if(obj.action == "enable/log"){
                        if(obj.data == ""){
                            text = '网关关闭日志上送';
                        }else if(obj.data == 120){
                            text = '网关开启日志上送';
                        }
                    }else if(obj.action == "enable/comm"){
                        if(obj.data.sec == 0){
                            text = '网关停止报文上送';
                        }else if(obj.data.sec == 120){
                            text = '网关开启报文上送';
                        }
                    }else if(obj.action == "restart"){
                        text = '网关IOT程序重启';
                    }else if(obj.action == "reboot"){
                        text = '网关设备重启';
                    }else if(obj.action == "cloud_conf"){
                        text = '网关云中心配置选项更新';
                    }else if(obj.action == "enable/data_one_short"){
                        if(obj.data.sec == ""){
                            text = '网关关闭临时上传数据';
                        }else if(obj.data.sec == 120){
                            text = '网关开启临时上传数据';
                        }
                    }else if(obj.action == "ext/upgrade"){
                        text = '网关更新扩展库'+obj.data.name;
                    }else if(obj.action == "ext/list"){
                        text = '网关上传扩展库列表';
                    }else if(obj.action == "cfg/download"){
                        text = '网关IOT固件配置下载';
                    }else if(obj.action == "cfg/upload"){
                        text = '网关IOT固件配置上传';
                    }else if(obj.action == "upgrade"){
                        text = '网关升级到最新版本';
                    }else if(obj.action == "enable/event"){
                        text = '网关更改事件上传等级';
                    }else if(obj.action == "enable/stat"){
                        text = '网关开启统计数据上传';
                    }else if(obj.action == "batch_script"){
                        text = '网关执行批量操作';
                    }else if(obj.action == "upgrade/ack"){
                        text = '网关IOT固件升级确认';
                    }
                }  //sys
                else if(obj.channel == "command"){
                    text = '网关应用设备执行'+obj.data.cmd+'指令';
                } //command
                else if(obj.channel == "putput"){
                    text = '网关设备应用'+obj.data.output+'数据输出';
                }  //output
            }

            $('.list_box').append(
                '<li class="box_li">' +
                '<span>'+text+'</span>' +
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
        for(var i=0;i<ago.length;i++){
            $('.message_ago').eq(i).timeago();
        }

    }

}