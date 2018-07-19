/**
 * @file            crontab.js
 * @description     监控一些执行任务结果。
 * @author          dongsun Team ( http://www.dongsun.com/ )
 * @date            2018-03-08 dongsun
**/

/**
*	添加任务
*/
function addCrontab(arr){
	var crontab_list = new Array();
	var crontab_tmp = localStorage.getItem('crontab_list'); // 任务列表
	if(crontab_tmp!==null){
		crontab_list = JSON.parse(crontab_tmp);
	}
	crontab_list.push(arr);
	localStorage.setItem('crontab_list',JSON.stringify(crontab_list));
	return ;
}

// 监控开机启动关闭的执行结果
function doCrontab(){
	var q = localStorage.getItem('crontab_list');
	if(q==null){
		console.log('crontab null');
		return false;
	}
	q = JSON.parse(q);
	if(q || q.length>0){
		for (var i = 0; i < q.length; i++) {
			//console.log(q[i].times,q[i].crontabDesc);
			Ajax.call('/api/method/iot.device_api.get_action_result', JSON.stringify({'id':q[i].id}), get_action_result,'POST', 'JSON', 'JSON',false);
			function get_action_result(req){
				if(req.message && typeof req.message!=='undefined'){
					//req.message.result = false;// test
					if(req.message.result==true){
						adalt(q[i].title+'成功',q[i].crontabDesc);
						if(q[i].type=='set_app_option' && getHtmlDocName()=='collection'){
							set_app_option_cb(q[i].docid);
						}else if(q[i].type=='app_uninstall' && getHtmlDocName()=='collection'){
							app_uninstall_cb(q[i].docid);
						}else if(q[i].type=='app_install' && getHtmlDocName()=='collection'){	
						}else if(q[i].type=='app_start' && getHtmlDocName()=='collection'){
							app_start_cb();
						}else if(q[i].type=='app_stop' && getHtmlDocName()=='collection'){	
							app_stop_cb();
						}else if(q[i].type=='app_restart' && getHtmlDocName()=='collection'){	
							app_restart_cb();
						}else{
						}
						console.log('---------------'+q[i].crontabDesc);
						q.splice(i,1);// 删除任务
					}else if(req.message.result==false){
						adalt(q[i].title+'失败',q[i].crontabDesc+','+req.message.message);
						q.splice(i,1);	
						return ;
					}
				}else{
					//console.log(q[i].crontabDesc+'执行超时'+q[i].times);
					q[i].times--;
					if(q[i].times==0){ // 十次查询完毕还未成功，表明失败。
						adalt(q[i].title+'超时',q[i].crontabDesc);
						q.splice(i,1);
					}
					return ;
				}
			}
		}
	}
	localStorage.setItem('crontab_list',JSON.stringify(q));
}

// 开机自启动设置结果处理
function set_app_option_cb(docid){
	if($('#'+docid).hasClass('img_off')){
		$('#'+docid).removeClass('img_off').addClass('img_on');
	}else{
		$('#'+docid).removeClass('img_on').addClass('img_off');
	}
}
function app_start_cb(){
	$(".J_app_contorl").text('停止');
	$(".J_app_contorl").addClass('color');
	//$('.J_app_restart').show();
	$(".J_oneAppInfo").attr('data-isRunning','运行中');
}
function app_stop_cb(){
	$(".J_app_contorl").text('启动');
	$(".J_app_contorl").removeClass('color');
	//$('.J_app_restart').hide();
	$('.J_oneAppInfo').attr('data-isRunning','已停止');
}
function app_restart_cb(){
	alt('重启成功');
}
function app_uninstall_cb(docid){
	if($('.'+docid).length!='undefined'){
		$('.'+docid).remove();
	}
}

$(function(){
	// 监控执行结果
	setInterval(function(){
		doCrontab();
	}, 3000);
})