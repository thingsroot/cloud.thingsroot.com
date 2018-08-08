/**
 * @file            collection.js
 * @description     单个网关管理。
 * @author          dongsun Team ( http://www.dongsun.com/ )
 * @date            2018-03-08 dongsun
**/
$(function(){
	var appconfigs = {};
	var pageSize = 9; // 每页条数
	var device_sn = getParam('device_sn');
	var tab_type = getParam('type'); // 当前处在哪个tab
	var tab_num ;
	var net_cfg ;
	var btp_cfg ;
	if(tab_type==''){
		tab_type = 'device';
        tab_num = 0;
	}
	//var set_app_option_list = new Array();
	
	setCookie('device_sn_current',device_sn);// 传递信息，当前网关id
	/*网关信息---------------------------------------------------*/
	Ajax.call('/api/method/iot_ui.iot_api.gate_info', {'sn':device_sn}, displayGateInfo, 'GET', 'JSON', 'FORM');
	// 网关信息详情显示
	function displayGateInfo(req){
		req = req.message;
		$('.J_basic_sn span.item_content').html(req.basic.sn);
        $('.J_basic_sn').attr('data-isbeta',req.basic.iot_beta);
        $('.J_basic_sn').attr('data-os',req.config.os);
        $('.J_basic_sn').attr('data-skynet_version',req.config.skynet_version);
        $('.J_basic_sn').attr('data-iot_version',req.config.iot_version);

		$('.J_basic_location span.item_content').html(req.basic.location);
		$('.J_basic_name span.item_content').html(req.basic.name);
		$('.J_basic_desc span.item_content').html(req.basic.desc);
		$('.J_basic_model span.item_content').html(req.basic.model);
		
		$('.J_config_cpu span.item_content').html(req.config.cpu);
		$('.J_config_ram span.item_content').html(req.config.ram);
		$('.J_config_rom span.item_content').html(req.config.rom);
		$('.J_config_os span.item_content').html(req.config.os);
		$('.J_config_skynet_version span.item_content').html(req.config.skynet_version);
		$('.J_config_iot_version span.item_content').html(req.config.iot_version);
		$('.J_config_public_ip span.item_content').html(req.config.public_ip);

		//$('.J_config_public_ip span').after(req.config.public_ip);
		
		$('.J_gate_name').html(req.basic.name);
		//console.log('displayGateInfo',req);

		if(req.basic.iot_beta){
			// console.log("当前是beta模式");
            $('.J_app_gate_enablebeta').addClass('hd');
            $('.J_app_gate_disablebeta').removeClass('hd');
            $('.J_isbeta_ span.item_content').html("启用");
		}
		else{
            // console.log("当前是正式模式");
            $('.J_app_gate_enablebeta').removeClass('hd');
            $('.J_app_gate_disablebeta').addClass('hd');
            $('.J_isbeta_ span.item_content').html("禁用");
		}

        if(req.config.data_upload){
            // console.log("当前是beta模式");
            $('.enable_data_upload').addClass('hd');
            $('.disable_data_upload').removeClass('hd');

        }
        else{
            // console.log("当前是正式模式");
            $('.enable_data_upload').removeClass('hd');
            $('.disable_data_upload').addClass('hd');

        }

            $('.J_app_gate_disable_netcfg').addClass('hd');
            $('.J_app_gate_enable_netcfg').removeClass('hd');
            $('.J_gateAppTabTitle_netcfg').addClass('hide');

            $('.J_app_gate_disable_vpn').addClass('hd');
            $('.J_app_gate_enable_vpn').removeClass('hd');
            $('.J_gateAppTabTitle_vpn').addClass('hd');
            $('.J_webmapping').addClass('hd');
            $('.J_ioevpn').addClass('hd');

		for(x in req.applist){
            // console.log(req.applist[x].name);
			if(req.applist[x].name=="network_uci"){
                $('.J_app_gate_enable_netcfg').addClass('hd');
                $('.J_app_gate_disable_netcfg').removeClass('hd');
                $('.J_gateAppTabTitle_netcfg').removeClass('hide');
                break;
			}


		}
        for(x in req.applist) {
            if(req.applist[x].name=="frpc"){
                // console.log("frpc");
                $('.J_app_gate_enable_vpn').addClass('hd');
                $('.J_app_gate_disable_vpn').removeClass('hd');
                $('.J_webmapping').removeClass('hd');
                $('.J_ioevpn').removeClass('hd');
                // $('.J_gateAppTabTitle_vpn').removeClass('hd');
                break;
            }
        }

		localStorage.setItem('device_detail_'+device_sn,JSON.stringify(req));
        /*网关固件版本---------------------------------------------------*/
        Ajax.call('/api/method/iot_ui.iot_api.query_firmware_lastver', {'sn':device_sn, "beta": req.basic.beta}, Gatefirmware_lastver, 'GET', 'JSON', 'FORM');
        function Gatefirmware_lastver(req){
            req = req.message;
            $('.J_basic_sn').attr('data-firmware_lastver',req.firmware_lastver);
            $('.J_basic_sn').attr('data-iot_lastver',req.freeioe_lastver);
            var iot_version  = $('.J_basic_sn').attr('data-iot_version');
            if(Number(req.freeioe_lastver) > Number(iot_version)){
                $('.J_app_gate_upgrade').removeClass('hd');
                $('span.upgrade_tip').removeClass('hd');
			}else{
                $('.J_app_gate_upgrade').addClass('hd');
                $('span.upgrade_tip').addClass('hd');
			}

            // console.log(req.freeioe_lastver , iot_version);
            localStorage.setItem('firmware_lastver_'+device_sn,JSON.stringify(req));
        }
	}


    // 固件升级开始
    $('.J_app_gate_upgrade').click(function(){

        var iot_lastver = $('.J_basic_sn').attr('data-iot_lastver');
        var id = device_sn +" sys_upgrade "+ Date.parse(new Date());
        var data = {
            "device": device_sn,
            "id": id,
            "data": {
                "no_ack": 1,
                "version": iot_lastver
            }
        }

        Ajax.call('/api/method/iot.device_api.sys_upgrade', JSON.stringify(data), gate_sys_upgrade, 'POST', 'JSON', 'JSON');

        function gate_sys_upgrade(req){
            if(req.message!=''){
                var idarr = {
                    'id':id,
                    'times':10,
                    'docid':'',
                    'type':'sys_upgrade',
                    'title':"固件升级",
                    'crontabDesc':device_sn,
                };
                addCrontab(idarr);
                alt('命令已发送，等待结果返回',1);
                setTimeout(function(){
                    Ajax.call('/api/method/iot_ui.iot_api.gate_info', {'sn':device_sn}, displayGateInfo, 'GET', 'JSON', 'FORM');
                }, 20000);
            }else{
                err('命令执行失败');
            }
        }

    });
    // 固件升级结束

    // 开启BETA模式开始
    $('.J_app_gate_enablebeta').click(function(){

        var id = device_sn + " gate_enable_beta "+ Date.parse(new Date());
        Ajax.call('/api/method/iot_ui.iot_api.enable_beta', JSON.stringify({"sn": device_sn }), gate_enable_beta, 'POST', 'JSON', 'JSON');

        function gate_enable_beta(req){
            if(req.message!=''){
                alt('命令发送成功',1);
                // setTimeout(function(){
                //     Ajax.call('/api/method/iot_ui.iot_api.gate_info', {'sn':device_sn}, displayGateInfo, 'GET', 'JSON', 'FORM');
                // }, 10000);
            }else{
                err('命令执行失败');
            }
        }

    });
    // 开启BETA模式结束


    // 关闭BETA模式开始
    $('.J_app_gate_disablebeta').click(function(){

        var id = device_sn +" gate_disable_beta "+ Date.parse(new Date());

        Ajax.call('/api/method/iot.device_api.sys_enable_beta', JSON.stringify({"device": device_sn , "data": 0}), gate_disablebeta, 'POST', 'JSON', 'JSON');
		// console.log(id);
        function gate_disablebeta(req){
            if(req.message!=''){
                // var idarr = {
                //     'id':id,
                //     'times':10,
                //     'docid':'',
                //     'type':'gate_disablebeta',
                //     'title':"关闭BETA模式",
                //     'crontabDesc':device_sn,
                // };
                // addCrontab(idarr);
                alt('命令已发送，等待结果返回',1);
                // setTimeout(function(){
                //     Ajax.call('/api/method/iot_ui.iot_api.gate_info', {'sn':device_sn}, displayGateInfo, 'GET', 'JSON', 'FORM');
                // }, 10000);
            }else{
                err('命令执行失败');
            }
        }

    });
    // 关闭BETA模式结束


	// 去商店
	$('.J_goshop').click(function(){
		window.location.href='shop.html?device_sn='+device_sn;
	})

	//  远程链接
	$('.J_ioevpn').click(function(){
		var url = 'ioevpn.html?gate_sn='+device_sn;
		window.open(url,"_blank"); 
		// window.location.href='ioevpn.html?gate_sn='+device_sn;
	})

    //  WEB映射
    $('.J_webmapping').click(function(){
        var _frpc_visitors;
        var _frpc_run;
        Ajax.call('/api/method/iot_ui.iot_api.gate_device_data_array', {'sn':device_sn,'vsn':device_sn + '.ioe_frpc'}, check_frpc_visitors, 'GET', 'JSON', 'JSON', false);
        function check_frpc_visitors(req){
            if(req.message!=''){
                for(x in req.message){
                    // console.log(req.applist[x].name);
                    if(req.message[x].name=="frpc_visitors"){
                        _frpc_visitors = req.message[x].pv;
                    }
                    if(req.message[x].name=="frpc_run"){
                        _frpc_run = req.message[x].pv;
                    }
                }

            }
        }


		if(_frpc_visitors=="\[\"" + device_sn + "__web\"\]"  && _frpc_run==1){
            var url = 'http://'+ device_sn + ".symgrid.com:880";
            window.open(url,"_blank");
		}else{
            var id = "set " + "ioe_frpc's config "+ ' '+Date.parse(new Date());
            var data = {
                "device": device_sn,
                "id": id,
                "data": {
                    "inst": "ioe_frpc",
                    "conf": {
                        "enable_web": true,
                        "token": "BWYJVj2HYhVtdGZL",
                        "auto_start": true
                    }
                }
            };

            Ajax.call('/api/method/iot.device_api.app_conf', JSON.stringify(data), ioe_frpc_config, 'POST', 'JSON', 'JSON');
            function ioe_frpc_config(req){
                if(req.message!=''){
                    alt('正在设置，等待10秒后重试',1);
                }else{
                    err('命令执行失败，请稍后重试！');
                }
            }
		}



    })

//单个应用的操作/////////////////////////////////////////////////////////////////////////////////
	/*
	*	应用升级
	*/
	$('ddd').click(function(){
		var data = {
			device: "iotiotiot", //网关序列号
		    id: "viccom.dong@symid.com uninstall iotiotiot's App bms", //执行指令附带的ID
		    data: {
		        "inst": "bms" //应用名称
		    }
		}
		Ajax.call('/api/method/iot.device_api.app_upgrade', data, getList, 'app_upgrade', 'JSON', 'JSON');
		function app_upgrade(req){
			console.log(req);
		}
	});
	
	/*
	*	设置应用开机自启动/不启动（已设置监控）
	*/
	$('.J_gateAppList').on('click','.application_main .set',function(){
		var _this = $(this);
		var i = _this.parent().parent().parent().attr('i');
		var value = _this.parent().parent().parent().attr('auto');
		var inst = _this.parent().parent().parent().attr('inst');
		var id,crontabDesc,title;
		if(value==1){
			value = 0;
			id = getCookie('full_name')+" stop "+device_sn+"'s "+inst+Date.parse(new Date());
			title = '关闭开机自启动';
			crontabDesc = inst;
		}else{
			value = 1;
			id = getCookie('full_name')+" start "+device_sn+"'s "+inst+Date.parse(new Date());
			title = '开启开机自启动';
			crontabDesc = inst;
		}
		var data = {
		    "device": device_sn,
		    "data": {"inst": inst,'option':'auto','value':value},
		    "id": id
		};
		Ajax.call('/api/method/iot.device_api.app_option', JSON.stringify(data), set_app_option, 'POST', 'JSON', 'JSON');
		function set_app_option(req){
			if(req.message!=''){
				var idarr = {
					'id':id,
					'times':10,
					'docid':'J_app_list_start_'+i,
					'type':'set_app_option',
					'title':title,
					'crontabDesc':crontabDesc,
				}
				addCrontab(idarr);
				alt('命令已发送，等待结果返回',1);return ;
			}else{
				err('命令执行失败');return ;
			}
		}
	})
	
	// 卸载应用(已监控结果)
	$('.J_gateAppList').on('click','.application_main .del',function(){
		var _this = $(this);
		var _parent = _this.parent().parent().parent();
		var inst = _this.attr('data-inst');
		layui.use(['laypage', 'layer'], function(){
		  	var laypage = layui.laypage
		  	,layer = layui.layer;
			layer.confirm('确定要卸载吗？', {
			  btn: ['确认','取消']
			}, function(){
				var id = "uninstall "+device_sn+"'s App "+inst+ ' '+Date.parse(new Date());
				var param = {
				    "device": device_sn,
				    "id": id,
				    "data": {"inst": inst}
				};
				Ajax.call('/api/method/iot.device_api.app_uninstall', JSON.stringify(param), app_uninstall,'POST', 'JSON', 'JSON',false);
				function app_uninstall(req){
			  		layer.closeAll();
					// console.log(req);
					if(req.message!=''){
						var idarr = {
							'id':id,
							'times':10,
							'docid':'J_'+inst,
							'type':'app_uninstall',
							'title':"应用卸载",
							'crontabDesc':inst,
						}
						addCrontab(idarr);
						alt('命令已发送，等待结果返回',1);return ;
					}else{
						err('命令执行失败');return ;
					}
				}
				//_parent.remove(); // 当前不删除，等到任务结束后删除。
			}, function(index){
			  layer.close(index);
			});
		});
	});

	// 启动应用/关闭
	$('.J_app_contorl,.J_app_restart').click(function(){
		var _this = $(this);
		var inst = _this.parent().attr('data-inst'); // 实例名称id
		var app_name = _this.parent().attr('data-app_name');
		var isRunning = _this.parent().attr('data-isRunning');
		// 重启
		var restart = _this.attr('data-isRunning');
		if(restart=='restart'){
			isRunning = 'restart';
		}
		// 重启end		
		var id = isRunning+" "+device_sn+"'s "+inst+ ' '+Date.parse(new Date());
		var param = {
		    "device": device_sn,
		    "data": {"inst": inst},	
		    "id": id
		};
		// console.log(param);
		if(isRunning=='已停止'){//去关闭
			Ajax.call('/api/method/iot.device_api.app_start', JSON.stringify(param), app_start,'POST', 'JSON', 'JSON');
			function app_start(req){
				// console.log('app_start',req);
				if(req.message!=''){
					var idarr = {
						'id':id,
						'times':10,
						'docid':'',
						'type':'app_start',
						'title':"应用启动",
						'crontabDesc':inst,
					}
					addCrontab(idarr);
					alt('命令已发送，等待结果返回',1);return ;
				}else{
					err('命令执行失败');return ;
				}				
			}
		}else if(isRunning=='运行中'){
			Ajax.call('/api/method/iot.device_api.app_stop', JSON.stringify(param), app_stop,'POST', 'JSON', 'JSON');
			function app_stop(req){
				// console.log('app_stop',req);
				if(req.message!=''){
					var idarr = {
						'id':id,
						'times':10,
						'docid':'',
						'type':'app_stop',
						'title':"应用停止",
						'crontabDesc':inst,
					}
					addCrontab(idarr);
					alt('命令已发送，等待结果返回',1);return ;
				}else{
					err('命令执行失败');return ;
				}
			}
		}else if(isRunning=='restart'){// 启动重启
			Ajax.call('/api/method/iot.device_api.app_restart', JSON.stringify(param), app_restart,'POST', 'JSON', 'JSON');
			function app_restart(req){
				// console.log('app_restart',req);
				if(req.message!=''){
					var idarr = {
						'id':id,
						'times':10,
						'docid':'',
						'type':'app_restart',
						'title':"应用重启",
						'crontabDesc':inst,
					}
					addCrontab(idarr);
					alt('命令已发送，等待结果返回',1);return ;
				}else{
					err('命令执行失败');return ;
				}
			}
		}
	});
	//end/////////////////////////////////////////////////////////////////////////////////
	
//========================================================================================================
//========================================================================================================
//==================================网关已安装应用列表start================================================
//========================================================================================================
//========================================================================================================
//========================================================================================================
    function requestAppList(){
        Ajax.call('/api/method/iot.device_api.app_list', JSON.stringify({'device':device_sn,'id': 'request ' + device_sn + ' app_list '+Date.parse(new Date())}), request_AppList,'POST', 'JSON', 'JSON');

        function request_AppList(req){
            if(req.message!=''){
                alt('请求网关发送应用列表命令已发送',1);
            }else{
                err('命令执行失败');
            }
        }
    }



	function getAppList(){
		if($('.J_gateAppTabTitle_manage').hasClass('color')==false){
			return false;
		}
        // Ajax.call('/api/method/iot.device_api.app_list', JSON.stringify({'device':device_sn,'id': 'request ' + device_sn + ' app_list '+Date.parse(new Date())}), '','POST', 'JSON', 'JSON');
		Ajax.call('/api/method/iot_ui.iot_api.gate_applist', {'sn':device_sn}, getList, 'GET', 'JSON', 'FORM');
		// 主动请求列表数据
		function getList(items){//0050562F49F7
			//console.log('gate_applist',items);
			var app_list = new Array();
			if (items.message) {
				items.message.forEach(function(d) {
					if(!d.info.downloading) {
						app_list.push(d);
					}
				})
			}
			localStorage.setItem('app_list_current_'+device_sn,JSON.stringify(app_list));
			display_app_list(1);
		}
	}
	// 应用列表翻页
	layui.use(['laypage', 'layer'], function(){
        var data = localStorage.getItem('app_list_current_'+device_sn);
        if(data=="undefined"){
            return false;
        }
		var data = JSON.parse(data);
		var length = 0;
		if(data && typeof(data)!=='undefined'){
			length = data.length;
		}
	  	var laypage = layui.laypage
	  	,layer = layui.layer;
		laypage.render({
		    elem: 'J_app_pagination_nav'
		    ,count: length
		    ,limit:	pageSize
		    ,theme: '#354E77'
		    ,jump: function(obj){
	      		display_app_list(obj.curr);
		    }
	  	});
	});
	
	// 数组翻页
	function pagination(pageNo, pageSize, array) {  
        var offset = (pageNo - 1) * pageSize;  
        return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);  
    }
    /**
    *	按页码显示内容列表
    *	page_num	页码
    */ 
	function display_app_list(page_num){
		var data = localStorage.getItem('app_list_current_'+device_sn);

		if(data=="undefined"){
			/*
			$('.J_gateAppList .none').show();
			$('.J_app_none,.go_shop').hide();
            $('div.application_main').remove();
            $('div.go_shop.J_goshop').remove();
            $('.J_gateAppList .go_shop').before("");
			return false;
			*/
			data = "[]";
		}
        data = JSON.parse(data);
		data = pagination(page_num,pageSize,data);
		var arrLen = data.length;
		if(arrLen==0 && page_num==1){
			$('.J_gateAppList .none').show();
            $('.J_app_none,.go_shop').hide();
			$('.J_app_none').hide();
			//return false;
		}else{
			$('.J_gateAppList .none').hide();
			$('.J_app_none,.go_shop').show();
		}
		var html='';
		for (var i = 0; i < arrLen; i++) {
			var inst = data[i].inst;
			var id='无';
			var app_name = '无';
			var fork_app = '';
			var fork_ver = '';
			var icon_image='http://iot.symgrid.com/assets/app_center/img/logo.png';
			var fullname,owner;
			var ver = '本地应用';
			var cloudver = '';
			var isdebug = 0;
			var localapp  = 1;
			var owner_login = getCookie('usr');
            var owner = "";
			if(data[i].cloud!=null){
				id = data[i].cloud.name;
				app_name = data[i].cloud.app_name;
				fork_app  = data[i].cloud.fork_app;
				fork_ver = data[i].cloud.fork_ver;
				icon_image = "http://iot.symgrid.com"+data[i].cloud.icon_image;
				fullname = data[i].cloud.fullname;
				owner = data[i].cloud.owner;
				cloudver = data[i].cloud.ver;
				ver = data[i].info.version;
				isdebug = 1;
                localapp  = 0;
			}

            if(data[i].info.conf!=null){
                appconfigs[data[i].inst] = data[i].info.conf;
            }
            else{
                appconfigs[data[i].inst] = {};
			}
            // console.log(data[i].cloud);
			// console.log(inst, owner, owner_login);
			if(owner==owner_login){// 登录用户非应用作者，关闭调试功能。
				isdebug = 1;
			}else{
                if(fork_app!=null && cloudver==fork_ver){
                    isdebug = 1;
				}
				isdebug = 0;
			}
			
			var autocheck="img_off";
			var autorunning = 'start';
			if(data[i].info.auto==1){ 
				 autocheck = 'img_on';
				var autorunning = 'stop';
			}
			var isRunning = '运行中';
			if(data[i].info.running=="" || data[i].info.running==null || typeof(data[i].info.running)=='undefined'){ 
				 isRunning = '已停止';
			}
			html += `<div class="application_main J_${inst}" i="${i}" id="J_${data[i].info.name}" app_name="${data[i].info.name}" device_sn="${data[i].info.sn}" inst="${inst}" auto="${data[i].info.auto}">
  						<div class="content app_frame"  data-isRunning="${isRunning}" data-autorunning="${autorunning}" data-app_name="${data[i].info.name}" data-version="${data[i].info.version}" data-inst="${inst}" data-isdebug="${isdebug}" data-icon_image="${icon_image}" data-ver="${ver}" data-cloudver="${cloudver}" data-localapp="${localapp}" data-fork_app="${fork_app}" data-fork_ver="${fork_ver}">
  							<div class="img"><img src="${icon_image}" /></div>
  							<div class="txt">
  								<div class="tit"><b>${inst}</b></div>
  								<p>${app_name}</p>
  								<p>开发者:${fullname}</p>
  								<p>状态:${isRunning}</p>
  								<div class="id">ID：${id}</div>
  							</div>
  							<div class="num">${ver}</div>
  						</div>
  						<div class="bottom">
  							<div class="fl app_frame" data-isRunning="${isRunning}" data-autorunning="${autorunning}" data-app_name="${data[i].info.name}" data-version="${data[i].info.version}" data-inst="${inst}" data-isdebug="${isdebug}" data-icon_image="${icon_image}" data-ver="${ver}" data-cloudver="${cloudver}"  data-localapp="${localapp}"  data-fork_app="${fork_app}" data-fork_ver="${fork_ver}">查看</div>

  							<div class="fr">
		  						<span class="${autocheck} set" id="J_app_list_start_${i}"></span>
  								<span class="del" data-isRunning="${isRunning}" data-autorunning="${autorunning}" data-app_name="${data[i].info.name}" data-version="${data[i].info.version}" data-inst="${inst}" data-isdebug="${isdebug}"></span>
  							</div>
  						</div>
  					</div>`;
		}
		$('.application_main').remove();
		$('.J_gateAppList .go_shop').before(html);
	}
	
	//查看应用详情
    $(".collection_main").on("click",".application_main .app_frame",function(){
        var _this = $(this);
        $(".shade").fadeIn(300);
//		$(".info_shade").css("margin-top",($(window).height()-$(".info_shade").height())/2);
        var app_name = _this.attr('data-app_name');
        var autorunning = _this.attr('data-autorunning');
        var isRunning = _this.attr('data-isRunning');// 运行状态
        var inst = _this.attr('data-inst');
        var version = _this.attr('data-version');
        var icon_image = _this.attr('data-icon_image');
        var ver = _this.attr('data-ver');
        var cloudver = _this.attr('data-cloudver');
        var isdebug = _this.attr('data-isdebug');
        var localapp = _this.attr('data-localapp');
        if(isRunning=="已停止"){
            $(".J_app_contorl").text('启动');
            $(".J_app_contorl").removeClass('color');
            //$('.J_app_restart').hide();
        }else{
            $(".J_app_contorl").text('停止');
            $(".J_app_contorl").addClass('color');
            //$('.J_app_restart').show();
        }
        $(".shade .tit").html(inst);

        if(localapp==1){ // 本地应用、隐藏。
            $('.J_appcenter_see,.J_more').hide();
            $('.J_more').parent().hide();
            $(".shade .J_app_version").html('本地应用');
        }else{
            $('.J_appcenter_see,.J_more').show();
            $('.J_more').parent().show();
            $(".shade .J_app_version").html('版本：'+ version +'<em>|</em>最新版本：'+ cloudver);
        }
        if(isdebug!=='1'){ // 作者非登录用户。
            if(localapp!=1){
                $('.J_app_more_debug').addClass('hd');
                $('.J_app_more_fork').removeClass('hd');
			}else{
                $('.J_app_more_debug').addClass('hd');
                $('.J_app_more_fork').addClass('hd');
			}
        }else{
            $('.J_app_more_debug').removeClass('hd');
            $('.J_app_more_fork').addClass('hd');
        }

        if(Number(cloudver) > Number(ver)){
            $('.J_app_more_update').removeClass('hd');
		}else{
            $('.J_app_more_update').addClass('hd');
		}
        $(".shade .J_oneAppInfo").attr('data-app_name',app_name);
        $(".shade .J_oneAppInfo").attr('data-autorunning',autorunning);
        $(".shade .J_oneAppInfo").attr('data-isRunning',isRunning);
        $(".shade .J_oneAppInfo").attr('data-inst',inst);
        $("#J_current_inst").val(inst);
        $(".shade .J_oneAppInfo").attr('data-version',version);
        $(".shade .J_oneAppInfo").attr('data-cloudver',cloudver);
        $(".shade .J_content img").attr('src',icon_image);
        $('#J_gate_comm_list').html('');
        $('#J_gate_log_list').html('');

    });

    // 应用配置
    $('.J_app_more_config').click(function(){
        $('div.useinfo_main').addClass('hd');
        $('div.app_config_modify').removeClass('hd');
        $(".more_content").addClass("hd");

        //初始化对象
        editor = ace.edit("json_editor");

        //设置风格和语言（更多风格和语言，请到github上相应目录查看）
        // editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/javascript");

        //字体大小
        editor.setFontSize(18);

        //设置只读（true时只读，用于展示代码）
        editor.setReadOnly(false);

        //自动换行,设置为off关闭
        // editor.setOption("wrap", "free")

        //启用提示菜单
        ace.require("ace/ext/language_tools");
        editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true
        });
        // editor.setValue("the new text here");

        // console.log("config:::", appconfigs[$(".shade .J_oneAppInfo").attr('data-inst')]);
        editor.setValue(JSON.stringify(appconfigs[$(".shade .J_oneAppInfo").attr('data-inst')], null, 4));

        var session = editor.getSession();
    })

    // 应用配置确定
    $('.button.config_confirm').click(function(){
        editor = ace.edit("json_editor");
        var inst = $(".shade .J_oneAppInfo").attr('data-inst');
        var devs = JSON.parse(editor.getValue());
        if(devs==''){
            devs = {};
        }
        var id = "config "+$(".shade .J_oneAppInfo").attr('data-inst')+"'s config "+ ' '+Date.parse(new Date());
        var data = {
            "device": device_sn,
            "id": id,
            "data": {
                "inst": inst,
                "conf": devs
            }
        }

        Ajax.call('/api/method/iot.device_api.app_conf', JSON.stringify(data), app_config, 'POST', 'JSON', 'JSON');

        function app_config(req){
            $('div.useinfo_main').removeClass('hd');
            $('div.app_config_modify').addClass('hd');
            if(req.message!=''){
                var idarr = {
                    'id':id,
                    'times':20,
                    'docid':'',
                    'type':'app_config',
                    'title':"应用配置",
                    'crontabDesc':inst+"配置",
                };
                addCrontab(idarr);
                alt('命令已发送，等待结果返回',1);
            }else{
                err('命令执行失败');
            }
        }

    });



    // 应用配置取消
    $('.button.config_cancle').click(function(){
        $('div.useinfo_main').removeClass('hd');
        $('div.app_config_modify').addClass('hd');

    });

    // 应用升级
    $('.J_app_more_update').click(function(){
        $(".more_content").addClass("hd");

        var inst = $(".shade .J_oneAppInfo").attr('data-inst');
        var app_name = $(".shade .J_oneAppInfo").attr('data-app_name');
        var cloudver = $(".shade .J_oneAppInfo").attr('data-cloudver');
        var id = $(".shade .J_oneAppInfo").attr('data-inst')+" upgrade "+ ' '+Date.parse(new Date());
        var data = {
            "device": device_sn,
            "id": id,
            "data": {
                "inst": inst,
                "name": app_name,
                "version": cloudver
                }
             }

        Ajax.call('/api/method/iot.device_api.app_upgrade', JSON.stringify(data), app_upgrade, 'POST', 'JSON', 'JSON');

        function app_upgrade(req){
            if(req.message!=''){
                var idarr = {
                    'id':id,
                    'times':20,
                    'docid':'',
                    'type':'app_upgrade',
                    'title':"应用升级",
                    'crontabDesc':inst+"升级",
                };
                addCrontab(idarr);
                alt('命令已发送，等待结果返回',1);
                $('.J_app_more_update').addClass('hd');
            }else{
                err('命令执行失败');
            }
        }

    });

	// 应用调试跳转
	$('.J_app_more_debug').click(function(){
		var url = 'debug.html?app='+$(".J_oneAppInfo").attr("data-app_name")+'&device_sn='+device_sn+'&app_inst='+$(".J_oneAppInfo").attr("data-inst")+'&version='+$(".J_oneAppInfo").attr("data-version")+'';
		window.location.href=url;
	});


    // 应用克隆
    $('.J_app_more_fork').click(function(){
        var app_name = $(".shade .J_oneAppInfo").attr('data-app_name');
        var cloudver = $(".shade .J_oneAppInfo").attr('data-cloudver');
        var version = $(".shade .J_oneAppInfo").attr('data-version');
        var inst = $(".shade .J_oneAppInfo").attr('data-inst');

        var data = {"app": app_name, "version": version };


        Ajax.call('/api/method/app_center.appmgr.get_fork', {'app':app_name, "version":version}, app_get_fork, 'GET', 'JSON', 'FORM');
        function app_get_fork(req){
            console.log(req);
            if(req.message instanceof Array && req.message[0]!=null){
                var url = 'debug.html?app='+ req.message[0] +'&device_sn='+ device_sn + '&app_inst='+ inst +'&version='+ req.message[1] +'';
                // console.log("1", url)
                window.location.href=url;

            }else{
                Ajax.call('/api/method/app_center.appmgr.fork', JSON.stringify(data), app_fork, 'POST', 'JSON', 'JSON');
            }
        }
        function app_fork(req){

            if(req.message!=''){
                    console.log(req.message);
                	var url = 'debug.html?app='+ req.message +'&device_sn='+ device_sn + '&app_inst='+ inst +'&version='+ version +'';
                	// console.log("2", url)
                	window.location.href=url;
            }else{
                console.log(req);
                err('命令执行失败');
            }
        }

    });
// ====================================================================================================
// ====================================================================================================
// ====================================================================================================
//网关已安装应用列表end=================================================================================
// ====================================================================================================
// ====================================================================================================
// ====================================================================================================




//采集设备部分start//////////////////////////////////////////////////////////////////////////////////////////////////
	/* 应用与设备列表（左菜单 ok） */
	Ajax.call('/api/method/iot_ui.iot_api.gate_app_dev_tree', {'sn':device_sn}, gate_app_dev_tree, 'GET', 'JSON', 'JSON');
	// 设备列表显示
	function gate_app_dev_tree(items){
		var data;
		var html='';
		data = items.message;
		//console.log('gate_app_dev_tree',data);
		localStorage.gate_app_dev_tree_original = JSON.stringify(items.message);
		localStorage.gate_app_dev_tree_current = JSON.stringify(items.message);

		localStorage.setItem('collection_device_orderName','name');
		localStorage.setItem('collection_device_orderType','asc');
		
		var arrLen = data.length;
		var j = 0;
		$.each(data,function(key,val){
			var _ulclass='';
			if(j>0){_ulclass = 'hd';}
			html += `<div>
				<p><span></span>应用 ${key}<img src="img/icon_under.png" class=""/></p>
				<ul class="${_ulclass}">`;
					$.each(val,function(k,v){
						var _liclass='';
						if(k==0 && j==0){_liclass = 'color';}
						html += `<li class="${_liclass}" data-vsn="${v.sn}">├ <a title="${v.sn}">${v.inst}</a></li>`;
					})
				html += `</ul>
				</div>`;
			j++;
		})
		$('.collection_left').html(html);
		var collection_device_vsn = $('.collection_left li').eq(0).attr('data-vsn');// 进入页面， 默认查看第1一个应用里的第一个设备的数据
		setCookie('collection_device_vsn',collection_device_vsn);
		
		localStorage.setItem('collection_device_orderName','name');
		localStorage.setItem('collection_device_orderType','asc');
		localStorage.setItem('collection_device_keyword','');
		localStorage.setItem('collection_device_filter','name');
			
		// 去获取第一个应用的第一个设备数据信息
		get_device_data_list(1,collection_device_vsn,1);
		display_device_page(1);// 执行显示页码
	}
	
    /**
    *	按设备码获取点表和数据
    *	page_num	页码
    *	@vsn	设备号
    *	reset_cfg	是否重新刷新点表数据
    */ 
	function get_device_data_list(page_num,vsn,reset_cfg){
		merge_device_cfgAndData(vsn,reset_cfg);
		display_device_data(page_num);
	}
	
	/**
    *	获取点表,然后在两者数据合并
    *	vsn	设备号
    */ 
	function getlist_gate_device_cfg(vsn){
		Ajax.call('/api/method/iot_ui.iot_api.gate_device_cfg', {'sn':device_sn,vsn:vsn}, gate_device_cfg, 'GET', 'JSON', 'JSON', false);
	    function gate_device_cfg(items){
		    var deviceitem = items.message.inputs;
			localStorage.setItem('gate_device_cfg_current',JSON.stringify(deviceitem));
	    }
		return localStorage.getItem('gate_device_cfg_current'); // 
	}
	/**
    *	获取设备数据,然后在两者数据合并
    *	vsn	设备号
    */ 
	function getlist_gate_device_data_array(vsn){
	    Ajax.call('/api/method/iot_ui.iot_api.gate_device_data_array', {'sn':device_sn,vsn:vsn}, gate_device_data_array, 'GET', 'JSON', 'JSON', false);
		function gate_device_data_array(items){
			localStorage.setItem('gate_device_data_array_current',JSON.stringify(items.message)); // 临时存放起来
		}
		return localStorage.getItem('gate_device_data_array_current'); // 
	}
    /**
    *	获取点表,然后在两者数据合并
    *	@vsn	设备号
    *	reset_cfg	是否重新刷新点表数据
    */ 
    function merge_device_cfgAndData(vsn,reset_cfg){
	    if(vsn==''){
		    vsn = $('.collection_left li').eq(0).attr('data-vsn');
		}
		// 获取点表
		if(reset_cfg==1){ // 换了设备，就需要熟悉点表
			var device_cfg = getlist_gate_device_cfg(vsn);	
		}else{
			var device_cfg = localStorage.getItem('gate_device_cfg_current');
		}
		device_cfg = JSON.parse(device_cfg);
		//console.log(device_cfg);
		
		// 获取设备数据
		var device_data = getlist_gate_device_data_array(vsn);
        // console.log(device_data);
		if(device_data!='undefined'){
            device_data = JSON.parse(device_data);
		}


		
		var device_data_array = new Array(); // 设备数据的重组数组			
		var cfgAndData = new Array();	// 合并后的数据数组

        if(device_data!='undefined'){
            $.each(device_data,function(k,dv){
                //console.log(dv.name,dv);
                device_data_array[dv.name] = dv;//数据质量
            });
		}

		//console.log(device_data_array);
		$.each(device_cfg,function(k,dv){
			if(device_data_array.hasOwnProperty(dv.name)){
				dv['q'] = device_data_array[dv.name].q;//数据时间戳
				dv['tm'] = device_data_array[dv.name].tm;//数据时间戳
				dv['pv'] = device_data_array[dv.name].pv; // 数值
			}else{
				dv['q'] = 'null';
				dv['tm'] = 'null';
				dv['pv'] = 'null';
			}
			cfgAndData.push(dv);
		});
		localStorage.setItem('merge_device_cfgAndData_current',JSON.stringify(cfgAndData));
				
		// 字段排序----> 对初始存储数据， 先把排序好， 因为自动刷新的时候， 需要记录之前的排序。
		var name = localStorage.getItem('collection_device_orderName');
		var type = localStorage.getItem('collection_device_orderType');
		if(name==null || type==null){
			name = 'name';
			type = 'asc';
		}
		var sort=new Array();
		sort[name] = type;
		cfgAndData = arrSort(cfgAndData,sort); // 排序
		
		// 搜索过滤---->对初始存储数据
		var keyword = localStorage.getItem('collection_device_keyword');
		var filter = localStorage.getItem('collection_device_filter');
		if(keyword!=null && filter!=null){
			cfgAndData = search_array(cfgAndData,keyword,filter); // 搜索过滤
		}
		localStorage.setItem('merge_device_cfgAndData_current',JSON.stringify(cfgAndData));
    }

    /**
    *	按页码显示 显示点表和数据
    *	page_num	页码
    */ 
	function display_device_data(page_num){
		var data = JSON.parse(localStorage.getItem('merge_device_cfgAndData_current'));
		//console.log('5、显示----共'+data.length+'条',data);
		data = pagination(page_num,pageSize,data);
		//console.log('6、按页显示----page:'+page_num,data);
		//console.log(data);
		var html='';
		var arrLen = data.length;		
		if(arrLen==0 && page_num==1){
			$('.J_deviceDataList .none').show();
			$('.J_device_none').hide();
			return false;
		}else{
			$('.J_deviceDataList .none').hide();
			$('.J_device_none').show();
		}
		for (var i = 0; i < arrLen; i++) {
			var index = ((page_num-1)*pageSize)+i;
			html += `<tr>
				    	<td>${data[i].name}</td>
				        <td>${data[i].desc}</td>
				        <td>${data[i].tm}</td>
				        <td>${data[i].pv}</td>
				        <td>${data[i].q}</td>
				    </tr>`;
		}
		$('#J_device_data_list').html(html);
	}

	//采集设备的设备数据翻页
	function display_device_page(page_num){
		localStorage.setItem('collection_device_page_num',page_num);
		layui.use(['laypage', 'layer'], function(){
			var data = JSON.parse(localStorage.getItem('merge_device_cfgAndData_current'));
		  	var laypage = layui.laypage
		  	,layer = layui.layer;
			laypage.render({
			    elem: 'J_device_pagination_nav'
			    ,count: data.length
			    ,limit:	pageSize
			    ,theme: '#354E77'
			    ,curr: page_num
    			,layout: ['prev', 'page', 'next']//,'count'
			    ,jump: function(obj){
				    setCookie('collection_device_page',obj.curr); // 当前第几页
					localStorage.setItem('collection_device_page_num',page_num);
		      		display_device_data(obj.curr);
			    }
		  	});
		});
	}
	
	// 刷新数据
	function reset_device_data_list(){
		if(!$('.collection_main .top div').eq(0).hasClass('color')){
			//console.log('stop loading device data...');
			return false;
		}else{
			//console.log('start loading  device data...');
		}
		var page = getCookie('collection_device_page');
		var vsn = getCookie('collection_device_vsn');
		get_device_data_list(page,vsn,0);
	}	

	
    // 排序start=========================
	// 点击排序筛选
	$('.collection_right th').click(function(){
		var sort=new Array();
		var name = $(this).attr('data-orderName');
		var type = $(this).attr('data-orderType');
		sort[name] = type;
		if(type=='desc'){
			$(this).attr('data-orderType','asc');
		}else{
			$(this).attr('data-orderType','desc');
		}
		localStorage.setItem('collection_device_orderName',name);
		localStorage.setItem('collection_device_orderType',type);
		reset_device_data_list();// 刷新
	});
	
    // 排序end=========================

	
	// 搜索start=========================
	$('.input-group-addon').click(function(){
		searchDevice();
	});
    $('.collection_main .form-control').keydown(function(event) { //键盘响应函数
		event = event || window.event; //兼容多浏览器
		if (event.keyCode == 13) { //监听回车键
			searchDevice();
			return false;
		}
	});
	//键盘相应结束	
	function searchDevice(){
		var filter = ['name'];//'name';
		//var filter = ["name","desc",tiane,];
		var keyword = $('.form-control').val();
		if(keyword==''){
			//err('关键词不能为空');
			//return false;
		}
		localStorage.setItem('collection_device_keyword',keyword);
		localStorage.setItem('collection_device_filter',filter);
		reset_device_data_list();// 刷新
		display_device_page(1);// 搜索后执行显示页码		
	}
	// 搜索end=========================
	// 更多按钮
	// $(".J_more").on("click",function(){
	// 	if($(".more_content").hasClass("hd")){
	// 		$(".more_content").removeClass("hd");
	// 	}else{
	// 		$(".more_content").addClass("hd");
	// 	}
	// })
	
	//	采集设备的左菜单折叠
	$(".collection_left").on("click","p",function(){
		if($(this).parent().find("ul").css("display")=='none') {
			$(this).find("img").css("transform","rotate(180deg)");
			$(this).parent().find("ul").slideDown();
		}else{
			$(this).find("img").css("transform","rotate(0deg)");
			$(this).parent().find("ul").slideUp();
		}
	})
	//	采集设备的左菜单 li点击
	$(".collection_left").on("click","li",function(){
		var _this = $(this);
		$('.collection_left li').removeClass("color");
		_this.addClass("color");
		var vsn = _this.attr('data-vsn');
		setCookie('collection_device_vsn',vsn);// 当前要获取设备数据的某个应用下的某个设备sn
		get_device_data_list(1,vsn,1);
		display_device_page(1);// 执行显示页码
	})
//采集设备部分end//////////////////////////////////////////////////////////////////////////////////////////////////
// ====================================================================================================
// ====================================================================================================
// ====================================================================================================
// ====================================================================================================
// ====================================================================================================

//网关详情报表start////////////////////////////////////////////////////////////////////////////////////////////////
	/**
	* @timer	定时时是1，为了不再当前页面时候，不请求数据而设置
	*/
	function tag_hisdata(chart_id, tag_name, vmin, vmax, data_multi, data_min, data_max, timer) {
		if($('.collection_main .top div').eq(2).hasClass('color')==false && timer==1){
			return false;
		}
		var myChart = echarts.init(document.getElementById(chart_id), 'light');
		var dev = device_sn;
		var url = API_HOST + '/api/method/iot_ui.iot_api.taghisdata?';
		url = url + 'sn=' + dev + '&tag=' + tag_name + '&condition=iot=%27'+ dev + '%27+and+device=%27' + dev + '%27+and+time%3Enow()+-+10m';
		//$.get('assets/' + tag_name + '.json', function (json_data) {
		$.get(url, function (json_data) {
			// console.log(json_data);
			// json_data = JSON.parse(json_data);
			var data = json_data.message;
			//window.onresize = myChart.resize;
			window.addEventListener("resize", function () {
                myChart.resize();
            });
			myChart.setOption(option = {
				title: {
					//text: tag_name
				},
                grid:{
                    left:'2%',
                    right:'2%',
                    bottom:'1%',
                    containLabel:true
                },
				tooltip: {
					trigger: 'axis',
					formatter: function (params) {
						var date = params[0].data[0];
						return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ':' + date.getMilliseconds() + ' : ' + params[0].value[1];
					}
				},
				xAxis: {
					type:'time',
					axisLabel: {
						rotate: 50,
						interval: 0
					}
				},
				yAxis: {
					type: 'value',
					scale: true,
					boundaryGap: ['20%', '20%']
				},
				toolbox: {
					left: 'center',
					//feature: {
					//	dataZoom: {
					//		yAxisIndex: 'none'
					//	},
					//	restore: {},
					//	saveAsImage: {}
					//}
				},
				visualMap: {
					top: 10,
					right: 10,
					min: vmin,
					max: vmax,
					splitNumber: 5,
					color: ['#d94e5d','#eac736','#50a3ba'],
					textStyle: {
						color: '#fff'
					},
					show: false
				},
				series: {
					name: tag_name,
					type: 'line',
        			smooth: true,
					data: data.map(function (item) {
						return [new Date(item.time), item.value * data_multi];
					})
				}
			});
		});
	}
	
//网关详情报表end////////////////////////////////////////////////////////////////////////////////////////////////
// ====================================================================================================
// ====================================================================================================
// ====================================================================================================
// ====================================================================================================
// ====================================================================================================

/*其他---------------------------------------------------*/
//	$(".collection_left").css("height",$(".collection_main").height()-$(".collection_main .top").height());
//	$(".J_content").css("height",$(".collection_main").height()-$(".collection_main .top").height());

	$('.collection_main .J_gateAppTabTitle_'+tab_type).addClass('color');
	$('.J_content .J_gateAppTabContent_'+tab_type).removeClass("op");
	if(tab_type=='device'){	// 采集设备tab
        tab_num = 0;
	    $('.top .datasearch').show();// 搜索按钮
        $('.applistrefresh').removeClass('hd');// 刷新按钮
        $('.data_upload').removeClass('hd');// 数据上送
	    $("#J_device_pagination_nav").css('opacity',1);
	}else if(tab_type=='manage'){ // 网关设备tab
        tab_num = 1;
	    $('.top .datasearch').hide();
        $('.applistrefresh').removeClass('hd');// 刷新按钮
        $('.data_upload').addClass('hd');// 数据上送
	    $("#J_app_pagination_nav").removeClass('hd');
	    getAppList();
	}else if(tab_type=='monitor'){	// 网关信息tab
        tab_num = 2;
	    $('.top .datasearch').hide();
        $('.applistrefresh').addClass('hd');// 刷新按钮
        $('.data_upload').addClass('hd');// 数据上送
	    // 为了让容器先显示，然后在加载数据， 否在图表显示有问题。
	    setTimeout(function(){		    
			tag_hisdata('charts', 'cpuload', 0, 4, 1,'','',0);
			tag_hisdata('charts_used', 'mem_used', 0, 512 * 1000 * 1000, 1,'','',0);
			//tag_hisdata('charts_free', 'mem_free', 0, 512 * 1000 * 1000, 1,'','',0);	
	    }, 200);


	}
	
	
	// 顶部选项卡
	$(".collection_main .tab").click(function(){
		$(this).addClass("color");
		$(this).siblings().removeClass("color");
		var num=$(this).index();
        $(".content_main").eq(num).removeClass("op");
	    $(".content_main").eq(num).siblings().addClass("op");
        tab_num = num;
        console.log(tab_num);
        if(num==0){
        	$(".pagination").css("opacity","1");
        }else{
        	$(".pagination").css("opacity","0");
        }
        
        // 显示翻页代码等
        if(num==0){
	        $('.top .datasearch').show();
            $('.applistrefresh').removeClass('hd');// 刷新按钮
            $('.data_upload').removeClass('hd');// 数据上送
	        $("#J_device_pagination_nav").css('opacity',1);
	        $("#J_app_pagination_nav").css('opacity',0);
            Ajax.call('/api/method/iot_ui.iot_api.gate_app_dev_tree', {'sn':device_sn}, gate_app_dev_tree, 'GET', 'JSON', 'JSON');
        }else if(num==1){
	        $('.top .datasearch').hide();
            $('.applistrefresh').removeClass('hd');// 刷新按钮
            $('.data_upload').addClass('hd');// 数据上送
	        $("#J_device_pagination_nav").css('opacity',0);
	        $("#J_app_pagination_nav").css('opacity',1);
            // requestAppList();
	        getAppList();
        }else if(num==2){
	        $('.top .datasearch').hide();
            $('.applistrefresh').addClass('hd');// 刷新按钮
            $('.data_upload').addClass('hd');// 数据上送
	        $("#J_device_pagination_nav").css('opacity',0);
	        $("#J_app_pagination_nav").css('opacity',0);
	        // 为了让容器先显示，然后在加载数据， 否在图表显示有问题。
		    setTimeout(function(){		    
				tag_hisdata('charts', 'cpuload', 0, 4, 1,'','',0);
				tag_hisdata('charts_used', 'mem_used', 0, 512 * 1000 * 1000, 1,'','',0);
				//tag_hisdata('charts_free', 'mem_free', 0, 512 * 1000 * 1000, 1,'','',0);	
		    }, 200);
        }else if(num==3){
            $('.top .datasearch').hide();
            $('.applistrefresh').addClass('hd');// 刷新按钮
            $('.data_upload').addClass('hd');// 数据上送
            $("#J_device_pagination_nav").css('opacity',0);
            $("#J_app_pagination_nav").css('opacity',0);
            // 为了让容器先显示，然后在加载数据， 否在图表显示有问题。

            Ajax.call('/api/method/iot_ui.iot_api.gate_device_data_array', {'sn':device_sn,vsn:device_sn + '.Network' }, gate_netcfg, 'GET', 'JSON', 'JSON', false);

        }


	});


    function gate_netcfg(req){
        req = req.message;
        if(req!=""){

            $.each(req,function(n,value) {
                if(value.name=="network_lan"){

                    net_cfg = JSON.parse(value.pv);
                    $('.N_lanip_ input.form-control').val(net_cfg.ipaddr);
                    $('.N_laninetmask_ input.form-control').val(net_cfg.netmask);

                }
                if(value.name=="ntp"){
                    ntp_cfg = JSON.parse(value.pv);
                    if(ntp_cfg.enabled){
                        $('.N_ntpclient_ span.item_content').html('启用');
                    }else{
                        $('.N_ntpclient_ span.item_content').html('禁用');
                    }

                    $('.N_ntpsrvlist_ span.item_content').html(JSON.stringify(ntp_cfg.server));
                }
            });
        }

    }

    $('.btn.applistrefresh').on("click", function(){
        if(tab_num==0){
            Ajax.call('/api/method/iot_ui.iot_api.gate_app_dev_tree', {'sn':device_sn}, gate_app_dev_tree, 'GET', 'JSON', 'JSON');
		}
		else if(tab_num==1){
        	requestAppList();
        }
    });

    //开启网关数据上传
    $('.enable_data_upload').on("click", function(){
        var id = "enable "+device_sn+"  data upload  " + Date.parse(new Date());
        var data = {
            "device": device_sn,
            "id": id,
            "data": 1
        };
        Ajax.call('/api/method/iot.device_api.sys_enable_data', JSON.stringify(data), gate_data_upload , 'POST', 'JSON', 'JSON');


        function gate_data_upload(req) {
            if (req.message != '') {
                var idarr = {
                    'id': id,
                    'times': 10,
                    'docid': 'gate_data_upload',
                    'type': 'data_upload',
                    'title': "开启数据上传",
                    'crontabDesc': 'enable data_upload',
                }
                addCrontab(idarr);
                alt('命令已发送，等待结果返回', 1);
                var data = {
                    "device": device_sn,
                    "id": id,
                    "data": 1
                };
                // setTimeout(function(){
                //     Ajax.call('/api/method/iot.device_api.sys_restart', JSON.stringify(data), '', 'POST', 'JSON', 'JSON');
                // }, 1000);

                // setTimeout(function(){
                //     Ajax.call('/api/method/iot_ui.iot_api.gate_info', {'sn':device_sn}, displayGateInfo, 'GET', 'JSON', 'FORM');
                // }, 15000);

                return;
            } else {
                err('命令执行失败');
                return;
            }
        }

    });
    //开启网关数据上传

    //关闭网关数据上传
    $('.disable_data_upload').on("click", function(){
        var id = "enable "+device_sn+"  data upload  " + Date.parse(new Date());
        var data = {
            "device": device_sn,
            "id": id,
            "data": 0
        };
        Ajax.call('/api/method/iot.device_api.sys_enable_data', JSON.stringify(data), disable_gate_data_upload , 'POST', 'JSON', 'JSON');


        function disable_gate_data_upload(req) {
            if (req.message != '') {
                var idarr = {
                    'id': id,
                    'times': 10,
                    'docid': 'disable_gate_data_upload',
                    'type': 'data_upload',
                    'title': "关闭数据上传",
                    'crontabDesc': 'disable data_upload',
                }
                addCrontab(idarr);
                alt('命令已发送，等待结果返回', 1);
                var data = {
                    "device": device_sn,
                    "id": id,
                    "data": 1
                };
                // setTimeout(function(){
                //     Ajax.call('/api/method/iot.device_api.sys_restart', JSON.stringify(data), '', 'POST', 'JSON', 'JSON');
                // }, 1000);

                return;
            } else {
                err('命令执行失败');
                return;
            }
        }

    });
    //关闭网关数据上传

    //开启网关网络配置
    $('.J_app_gate_enable_netcfg').on("click", function(){
        var id = "install "+device_sn+"'s App network_uci  " + Date.parse(new Date());
        var data = {
            "device": device_sn,
            "id": id,
            "data": {
                "inst": "Network",
                "name": "network_uci",
                "version":'latest'
            }
        };


        Ajax.call('/api/method/iot.device_api.app_install', JSON.stringify(data), app_install, 'POST', 'JSON', 'JSON');

        setTimeout(function(){
            requestAppList();
        }, 5000);

        // setTimeout(function(){
        //     Ajax.call('/api/method/iot_ui.iot_api.gate_info', {'sn':device_sn}, displayGateInfo, 'GET', 'JSON', 'FORM');
        // }, 10000);

        setTimeout(function(){
            requestAppList();
        }, 5000);

        function app_install(req) {
            if (req.message != '') {
                var idarr = {
                    'id': id,
                    'times': 10,
                    'docid': 'J_network_uci',
                    'type': 'app_install',
                    'title': "应用安装",
                    'crontabDesc': 'network_uci',
                }
                addCrontab(idarr);
                alt('命令已发送，等待结果返回', 1);

                return;
            } else {
                err('命令执行失败');
                return;
            }
        }

    });
    //开启网关网络配置

    //关闭网关网络配置
    $('.J_app_gate_disable_netcfg').on("click", function(){
        var id = "uninstall "+device_sn+"'s App network_uci  " + Date.parse(new Date());
        var data = {
            "device": device_sn,
            "id": id,
            "data": {"inst": "Network"}
        };
        Ajax.call('/api/method/iot.device_api.app_uninstall', JSON.stringify(data), app_uninstall,'POST', 'JSON', 'JSON');
        // setTimeout(function(){
        //     Ajax.call('/api/method/iot_ui.iot_api.gate_info', {'sn':device_sn}, displayGateInfo, 'GET', 'JSON', 'FORM');
        // }, 10000);

        function app_uninstall(req) {

            if (req.message != '') {
                var idarr = {
                    'id': id,
                    'times': 10,
                    'docid': 'J_network_uci',
                    'type': 'app_uninstall',
                    'title': "应用卸载",
                    'crontabDesc': 'network_uci',
                }
                addCrontab(idarr);
                alt('命令已发送，等待结果返回', 1);

                return;
            } else {
                err('命令执行失败');
                return;
            }
        }
    });
    //关闭网关网络配置


    //开启网关远程连接
    $('.J_app_gate_enable_vpn').on("click", function(){
        var id = "install "+device_sn+"'s App frpc  " + Date.parse(new Date());
        var data = {
            "device": device_sn,
            "id": id,
            "data": {
                "inst": "ioe_frpc",
                "name": "frpc",
				"from_web": 1,
				"conf": {
					"enable_web": true,
					"token": "BWYJVj2HYhVtdGZL",
					"auto_start": true
                },
                "version":'latest'
            }
        };


        Ajax.call('/api/method/iot.device_api.app_install', JSON.stringify(data), app_install, 'POST', 'JSON', 'JSON');

        setTimeout(function(){
            requestAppList();
        }, 5000);

        function app_install(req) {
            if (req.message != '') {
                var idarr = {
                    'id': id,
                    'times': 10,
                    'docid': 'J_frpc',
                    'type': 'app_install',
                    'title': "应用安装",
                    'crontabDesc': 'frpc',
                }
                addCrontab(idarr);
                alt('命令已发送，等待结果返回', 1);

                return;
            } else {
                err('命令执行失败');
                return;
            }
        }

    });
    //开启网关远程连接

    //关闭网关远程连接
    $('.J_app_gate_disable_vpn').on("click", function(){
        var id = "uninstall "+device_sn+"'s App frpc  " + Date.parse(new Date());
        var data = {
            "device": device_sn,
            "id": id,
            "data": {"inst": "ioe_frpc"}
        };
        Ajax.call('/api/method/iot.device_api.app_uninstall', JSON.stringify(data), app_uninstall,'POST', 'JSON', 'JSON');
        // setTimeout(function(){
        //     Ajax.call('/api/method/iot_ui.iot_api.gate_info', {'sn':device_sn}, displayGateInfo, 'GET', 'JSON', 'FORM');
        // }, 10000);

        function app_uninstall(req) {

            if (req.message != '') {
                var idarr = {
                    'id': id,
                    'times': 10,
                    'docid': 'J_frpc',
                    'type': 'app_uninstall',
                    'title': "应用卸载",
                    'crontabDesc': 'frpc',
                }
                addCrontab(idarr);
                alt('命令已发送，等待结果返回', 1);

                return;
            } else {
                err('命令执行失败');
                return;
            }
        }
    });
    //关闭网关远程连接


    $('.lan_modify').on("click", function(){
        $('.lan_modify_op').removeClass('hd');
        $('.N_lanip_ input.form-control').removeAttr('readonly');
        $('.N_laninetmask_ input.form-control').removeAttr('readonly');
        $('.lan_modify_cancel').attr('data-ipaddr',$('.N_lanip_ input.form-control').val());
        $('.lan_modify_cancel').attr('data-netmask',$('.N_laninetmask_ input.form-control').val());

    });
    $('.lan_modify_cancel').on("click", function(){
        $('.lan_modify_op').addClass('hd');
        $('.N_lanip_ input.form-control').val($('.lan_modify_cancel').attr('data-ipaddr'));
        $('.N_laninetmask_ input.form-control').val($('.lan_modify_cancel').attr('data-netmask'));
        $('.N_lanip_ input.form-control').attr('readonly', 'readonly');
        $('.N_laninetmask_ input.form-control').attr('readonly', 'readonly');

    });

    $('.lan_modify_confirm').on("click", function(){
        var ipaddr = $('.N_lanip_ input.form-control').val();
        var netmask = $('.N_laninetmask_ input.form-control').val();
		net_cfg.ipaddr = ipaddr;
        net_cfg.netmask = netmask;

		var id =  device_sn + " lan_cfg " + Date.parse(new Date());
        var data = {
            "id": id,
            "device": device_sn,
            "data": {
                "device": device_sn + ".Network",
                "output": "network_lan",
                "value": net_cfg,
                "prop": "value"
            }
        }

        Ajax.call('/api/method/iot.device_api.send_output', JSON.stringify(data), gate_lan_set, 'POST', 'JSON', 'JSON');

        function gate_lan_set(req){
            if(req.message!=''){
                var idarr = {
                    'id':id,
                    'times':20,
                    'docid':'',
                    'type':'gate_lan_cfg',
                    'title':"LAN口配置",
                    'crontabDesc':device_sn + " LAN口 配置 ",
                };
                addCrontab(idarr);
                alt('命令已发送，等待结果返回',1);

                $('.lan_modify_op').addClass('hd');
                $('.N_lanip_ input.form-control').attr('readonly', 'readonly');
                $('.N_laninetmask_ input.form-control').attr('readonly', 'readonly');

                setTimeout(function(){
                    Ajax.call('/api/method/iot_ui.iot_api.gate_device_data_array', {'sn':device_sn,vsn:device_sn + '.Network' }, gate_netcfg, 'GET', 'JSON', 'JSON');
                }, 4000);
            }else{
                err('命令执行失败');
                $('.lan_modify_op').addClass('hd');
                $('.N_lanip_ input.form-control').val($('.lan_modify_cancel').attr('data-ipaddr'));
                $('.N_laninetmask_ input.form-control').val($('.lan_modify_cancel').attr('data-netmask'));
                $('.N_lanip_ input.form-control').attr('readonly', 'readonly');
                $('.N_laninetmask_ input.form-control').attr('readonly', 'readonly');

            }
        }
        // $('.lan_modify_op').addClass('hd');
        // $('.N_lanip_ input.form-control').attr('readonly', 'readonly');
        // $('.N_laninetmask_ input.form-control').attr('readonly', 'readonly');

    });


	//详情隐藏
	$(".info_shade .close-").on("click",function(){
        $('div.useinfo_main').removeClass('hd');
        $('div.app_config_modify').addClass('hd');
		$(".shade").fadeOut(300);
	})
	$('.J_content .see').click(function(){
		redirect('http://iot.symgrid.com/app_detail?app='+$(".shade .tit").html());
	});
//	th箭头状态
	$("th").on("click",function(){
		if($(this).find("i").hasClass("down")){
			$(this).find("i").removeClass("down");
		}else{
			$(this).find("i").addClass("down");
		}
	});


	// 刷新cpu等echarts图表
	setInterval(function(){
		tag_hisdata('charts', 'cpuload', 0, 4, 1,'','',1);
		tag_hisdata('charts_used', 'mem_used', 0, 512 * 1000 * 1000, 1,'','',1);
		// tag_hisdata('charts_free', 'mem_free', 0, 512 * 1000 * 1000, 1,'','',1);
	}, 15000);

    // 周期获取网关状态信息
    setInterval(function(){
        Ajax.call('/api/method/iot_ui.iot_api.gate_info', {'sn':device_sn}, displayGateInfo, 'GET', 'JSON', 'FORM');
    }, 15000);

	/* 定时刷新采集设备数据 */
	setInterval(reset_device_data_list, 3000);

	// 定时刷新已安装应用
	setInterval(getAppList, 8000);
})
