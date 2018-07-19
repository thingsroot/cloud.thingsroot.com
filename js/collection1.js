/**
 * @file            collection.js
 * @description     单个网关管理。
 * @author          dongsun Team ( http://www.dongsun.com/ )
 * @date            2018-03-08 dongsun
**/
$(function(){
	var pageSize = 9; // 每页条数
	var device_sn = getParam('device_sn');
	var tab_type = getParam('type'); // 当前处在哪个tab
	if(tab_type==''){
		tab_type = 'device';
	}
	//var set_app_option_list = new Array();
	
	setCookie('device_sn_current',device_sn);// 传递信息，当前网关id
	/*网关信息---------------------------------------------------*/
	Ajax.call('/api/method/iot_ui.iot_api.gate_info', {'sn':device_sn}, displayGateInfo, 'GET', 'JSON', 'FORM');
	// 网关信息详情显示
	function displayGateInfo(req){
		req = req.message;
		$('.J_basic_sn span').after(req.basic.sn);
		$('.J_basic_location span').after(req.basic.location);
		$('.J_basic_name span').after(req.basic.name);
		$('.J_basic_desc span').after(req.basic.desc);
		$('.J_basic_model span').after(req.basic.model);
		
		$('.J_config_cpu span').after(req.config.cpu);
		$('.J_config_ram span').after(req.config.ram);
		$('.J_config_rom span').after(req.config.rom);
		$('.J_config_os span').after(req.config.os);
		$('.J_config_skynet_version span').after(req.config.skynet_version);
		$('.J_config_iot_version span').after(req.config.iot_version);
		$('.J_config_public_ip span').after(req.config.public_ip);
		//$('.J_config_public_ip span').after(req.config.public_ip);
		
		$('.J_gate_name').text(req.basic.name);
		//console.log('displayGateInfo',req);
		localStorage.setItem('device_detail_'+device_sn,JSON.stringify(req));
	}
	// 去商店
	$('.J_goshop').click(function(){
		window.location.href='shop.html?device_sn='+device_sn;
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
			crontabDesc = getCookie('full_name');
		}else{
			value = 1;
			id = getCookie('full_name')+" start "+device_sn+"'s "+inst+Date.parse(new Date());
			title = '开启开机自启动';
			crontabDesc = getCookie('full_name');
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
			  	var device = '';
				var id = "uninstall "+device_sn+"'s App "+inst;
				var data = '';
				var param = {
				    "device": device_sn,
				    "id": id,
				    "data": {"inst": inst}
				};
				Ajax.call('/api/method/iot.device_api.app_uninstall', JSON.stringify(param), "app_uninstall",'POST', 'JSON', 'JSON',false);
				function app_uninstall(req){
					//console.log(req);			
					if(req.message!=''){
						var idarr = {
							'id':id,
							'times':10,
							'docid':'',
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
				_parent.remove();
			  	layer.closeAll();
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
		var id = isRunning+" "+device_sn+"'s "+inst;
		var param = {
		    "device": device_sn,
		    "data": {"inst": inst},	
		    "id": id
		};
		console.log(param);
		if(isRunning=='已停止'){//去关闭
			Ajax.call('/api/method/iot.device_api.app_start', JSON.stringify(param), app_start,'POST', 'JSON', 'JSON');
			function app_start(req){
				//console.log('app_start1',req);
				//$(".J_app_contorl").text('停止');
				//$(".J_app_contorl").addClass('color');
				//$('.J_app_restart').show();	
				console.log('app_start',req);
				if(req.message!=''){
					var idarr = {
						'id':id,
						'times':10,
						'docid':'',
						'type':'app_start',
						'crontabDesc':inst+"启动",
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
				console.log('app_stop',req);
				//$(".J_app_contorl").text('启动');
				//$(".J_app_contorl").removeClass('color');
				//$('.J_app_restart').hide();
				if(req.message!=''){
					var idarr = {
						'id':id,
						'times':10,
						'docid':'',
						'type':'app_stop',
						'crontabDesc':inst+"停止",
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
				console.log('app_restart',req);
				if(req.message!=''){
					var idarr = {
						'id':id,
						'times':10,
						'docid':'',
						'type':'app_restart',
						'crontabDesc':inst+"重启",
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

	Ajax.call('/api/method/iot_ui.iot_api.gate_applist', {'sn':device_sn}, getList, 'GET', 'JSON', 'FORM');
	
	// 主动请求列表数据
	function getList(items){
		//console.log('gate_applist',items);
		localStorage.app_list_current = JSON.stringify(items.message);
		localStorage.app_list_current = JSON.stringify(items.message);
		display_app_list(1);
	}
	
	// 应用列表翻页
	layui.use(['laypage', 'layer'], function(){
		var data = JSON.parse(localStorage.app_list_current);
	  	var laypage = layui.laypage
	  	,layer = layui.layer;
		laypage.render({
		    elem: 'J_app_pagination_nav'
		    ,count: data.length
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
		var data = localStorage.app_list_current;
		if(data=='undefined'){
			$('.J_gateAppList .none').show();
			$('.J_app_none,.go_shop').hide();
			return false;
		}
		data = JSON.parse(data);
		data = pagination(page_num,pageSize,data);
		var arrLen = data.length;
		if(arrLen==0 && page_num==1){
			$('.J_gateAppList .none').show();
			$('.J_app_none').hide();
			return false;
		}else{
			$('.J_gateAppList .none').hide();
			$('.J_app_none,.go_shop').show();
		}
		var html='';
		for (var i = 0; i < arrLen; i++) {
			var inst = data[i].inst;
			var id='无';
			var app_name='无';
			var icon_image='http://iot.symgrid.com/assets/app_center/img/logo.png';
			var fullname="";
			var ver = '本地应用';
			var isdebug = 0;
			var userid = getCookie('full_name');
			if(data[i].cloud!=null){ 
				id = data[i].cloud.name;
				app_name = data[i].cloud.app_name;
				icon_image = "http://iot.symgrid.com"+data[i].cloud.icon_image;
				fullname = data[i].cloud.fullname;
				//ver = data[i].cloud.ver;
				ver = data[i].info.version;
				isdebug = 1;
			}
			
			if(fullname==userid){
				isdebug = 1;
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
			html += `<div class="application_main" i="${i}" id="J_${data[i].info.name}" app_name="${data[i].info.name}" device_sn="${data[i].info.sn}" inst="${inst}" auto="${data[i].info.auto}">
  						<div class="content">
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
  							<div class="fl" data-isRunning="${isRunning}" data-autorunning="${autorunning}" data-app_name="${data[i].info.name}" data-version="${data[i].info.version}" data-inst="${inst}" data-isdebug="${isdebug}" data-icon_image="${icon_image}" data-ver="${ver}">查看</div>
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
	$(".collection_main").on("click",".application_main .bottom .fl",function(){
		var _this = $(this);
		$(".shade").fadeIn(300);
//		$(".info_shade").css("margin-top",($(window).height()-$(".info_shade").height())/2);
		var app_name = _this.attr('data-app_name');
		var autorunning = _this.attr('data-autorunning');
		var isRunning = _this.attr('data-isRunning');// 运行状态
		var inst = _this.attr('data-inst');
		var version = _this.attr('data-version');
		var icon_image = _this.attr('data-icon_image');
		var ver= _this.attr('data-ver');
		var isdebug= _this.attr('data-isdebug');
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
		if(isdebug!=='1'){ // 本地应用、作者非登录用户，均隐藏。
			$('.J_appcenter_see,.J_more').hide();
			$('.J_more').parent().hide();
			$(".shade .J_app_version").html('本地应用');
		}else{
			$('.J_appcenter_see,.J_more').show();
			$('.J_more').parent().show();
			$(".shade .J_app_version").html('版本：'+_this.attr('data-version')+'<em>|</em>上次更新：'+_this.attr('data-version'));
		}
		$(".shade .J_oneAppInfo").attr('data-app_name',app_name);
		$(".shade .J_oneAppInfo").attr('data-autorunning',autorunning);
		$(".shade .J_oneAppInfo").attr('data-isRunning',isRunning);
		$(".shade .J_oneAppInfo").attr('data-inst',inst);
		$("#J_current_inst").val(inst);
		$(".shade .J_oneAppInfo").attr('data-version',version);		
		$(".shade .J_content img").attr('src',icon_image);
	});
	// 应用调试跳转
	$('.J_app_more_command1').click(function(){
		var url = 'debug.html?app='+$(".J_oneAppInfo").attr("data-app_name")+'&device_sn='+device_sn+'&app_inst='+$(".J_oneAppInfo").attr("data-inst")+'&version='+$(".J_oneAppInfo").attr("data-version")+'';
		window.location.href=url;
	})

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
		get_device_data_list(1,collection_device_vsn);
		display_device_page(1);// 执行显示页码
	}
	
    /**
    *	按设备码获取点表和数据
    *	page_num	页码
    */ 
	function get_device_data_list(page_num,vsn){
		getlist_gate_device_cfg(vsn);
		display_device_data(page_num);
	}
	
    /**
    *	获取点表,再获取设备数据，然后在两者数据合并
    *	@vsn	设备号
    */ 
    function getlist_gate_device_cfg(vsn){
	    //var vsn;
	    if(vsn==''){
		    vsn = $('.collection_left li').eq(0).attr('data-vsn');
		}
	    Ajax.call('/api/method/iot_ui.iot_api.gate_device_cfg', {'sn':device_sn,vsn:vsn}, gate_device_cfg, 'GET', 'JSON', 'JSON', false);
	    function gate_device_cfg(items){
		    var dataitem;
			var dataitems = new Array();
			
		    var deviceitem = items.message.inputs;
			var deviceitems = new Array();
		    
			//console.log('1、点表----'+vsn,deviceitem);
			dataitem = getlist_gate_device_data_array(vsn); // 获取设备数据
			dataitem = JSON.parse(dataitem);			
			$.each(dataitem,function(k,dv){
				console.log(dv.name,dv);
				dataitems[dv.name] = dv;//数据质量
			});
			//console.log('dataitems',dataitems);
			
			//console.log('deviceitem',deviceitem);
			$.each(deviceitem,function(k,dv){
				//console.log(dv.name,dataitems[dv.name]);
				if(dataitems.hasOwnProperty(dv.name)){
					dv['q'] = dataitems[dv.name].q;//数据时间戳
					dv['tm'] = dataitems[dv.name].tm;//数据时间戳
					dv['pv'] = dataitems[dv.name].pv; // 数值
				}else{
					dv['q'] = 'null';
					dv['tm'] = 'null';
					dv['pv'] = 'null';
				}
				deviceitems.push(dv);
			});
			//console.log('deviceitems=====',deviceitems);
			
			//console.log('2、数据----'+vsn,deviceitems);
			localStorage.setItem('gate_device_cfg_original',JSON.stringify(deviceitems));
			localStorage.setItem('gate_device_cfg_current',JSON.stringify(deviceitems));
					
			// 字段排序----> 对初始存储数据， 先把排序好， 因为自动刷新的时候， 需要记录之前的排序。
			var name = localStorage.getItem('collection_device_orderName');
			var type = localStorage.getItem('collection_device_orderType');
			if(name==null || type==null){
				name = 'name';
				type = 'asc';
			}
			var sort=new Array();
			sort[name] = type;
			deviceitems = arrSort(deviceitems,sort); // 排序
			//console.log('3、排序----'+vsn+ " " +name +" " +type,deviceitems);
			
			// 搜索过滤---->对初始存储数据
			var keyword = localStorage.getItem('collection_device_keyword');
			var filter = localStorage.getItem('collection_device_filter');
			if(keyword!=null && filter!=null){
				deviceitems = search_array(deviceitems,keyword,filter); // 搜索过滤
			}
			//console.log('4、搜索----'+vsn+ " 关键词:" +keyword +" 字段:" ,filter,deviceitems);
			localStorage.setItem('gate_device_cfg_current',JSON.stringify(deviceitems));
	    }
    }

    /**
    *	按页码显示 显示点表和数据
    *	page_num	页码
    */ 
	function display_device_data(page_num){
		var data = JSON.parse(localStorage.getItem('gate_device_cfg_current'));
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
			var data = JSON.parse(localStorage.getItem('gate_device_cfg_current'));
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
			console.log('stop loading device data...');
			return false;
		}else{
			console.log('start loading  device data...');
		}
		var page = getCookie('collection_device_page');
		var vsn = getCookie('collection_device_vsn');
		get_device_data_list(page,vsn);
	}	

    /**
    *	获取设备数据，返回给点表接口，合并数据
    *	vsn	设备号
    */ 
	function getlist_gate_device_data_array(vsn){
	    Ajax.call('/api/method/iot_ui.iot_api.gate_device_data_array', {'sn':device_sn,vsn:vsn}, gate_device_data_array, 'GET', 'JSON', 'JSON', false);
		function gate_device_data_array(items){
			localStorage.setItem('gate_device_data_array_current',JSON.stringify(items.message)); // 临时存放起来
		}
		return localStorage.getItem('gate_device_data_array_current'); // 
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
	$(".J_more").on("click",function(){
		if($(".more_content").hasClass("hd")){
			$(".more_content").removeClass("hd");
		}else{
			$(".more_content").addClass("hd");
		}
	})
	
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
		get_device_data_list(1,vsn);
		display_device_page(1);// 执行显示页码
	})
//采集设备部分end//////////////////////////////////////////////////////////////////////////////////////////////////
// ====================================================================================================
// ====================================================================================================
// ====================================================================================================
// ====================================================================================================
// ====================================================================================================

//网关详情报表start////////////////////////////////////////////////////////////////////////////////////////////////
	function tag_hisdata(chart_id, tag_name, vmin, vmax, data_multi, data_min, data_max) {
		if(!$('.collection_main .top div').eq(2).hasClass('color')){
			console.log('stop loading echarts...');
			return false;
		}else{
			console.log('start loading echarts...');
		}
		var myChart = echarts.init(document.getElementById(chart_id), 'light');
		var dev = device_sn;
		var url = API_HOST + '/api/method/iot_ui.iot_api.taghisdata?';
		url = url + 'sn=' + dev + '&tag=' + tag_name + '&condition=iot=%27'+ dev + '%27+and+device=%27' + dev + '%27+and+time%3Enow()+-+10m';
		//$.get('assets/' + tag_name + '.json', function (json_data) {
		$.get(url, function (json_data) {
			json_data = JSON.parse(json_data);
			var data = json_data.message;
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

	if(tab_type=='device'){	// 采集设备tab
	    $('.top .fr').show();// 搜索按钮
	    $("#J_device_pagination_nav").css('opacity',1);
	}else if(tab_type=='manage'){ // 网关设备tab
	    $('.top .fr').hide();
	    $("#J_app_pagination_nav").removeClass('hd');
	}else if(tab_type=='monitor'){	// 网关信息tab
	    $('.top .fr').hide();
	}
	$('.collection_main .J_gateAppTabTitle_'+tab_type).addClass('color');
	$('.J_content .J_gateAppTabContent_'+tab_type).show();
	
	
	// 顶部选项卡
	$(".collection_main .tab").click(function(){
		$(this).addClass("color");
		$(this).siblings().removeClass("color");
		var num=$(this).index();
        $(".content_main").eq(num).show();
        $(".content_main").eq(num).siblings().hide();
        if(num==0){
        	$(".pagination").css("opacity","1");
        }else{
        	$(".pagination").css("opacity","0");
        }
        
        // 显示翻页代码等
        if(num==0){
	        $('.top .fr').show();
	        $("#J_device_pagination_nav").css('opacity',1);
	        $("#J_app_pagination_nav").css('opacity',0);
        }else if(num==1){
	        $('.top .fr').hide();
	        $("#J_device_pagination_nav").css('opacity',0);
	        $("#J_app_pagination_nav").css('opacity',1);
        }else{
	        $('.top .fr').hide();
	        $("#J_device_pagination_nav").css('opacity',0);
	        $("#J_app_pagination_nav").css('opacity',0);
        }
	});
	
	//详情隐藏
	$(".info_shade .close-").on("click",function(){
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
	tag_hisdata('charts', 'cpuload', 0, 1, 1);
	tag_hisdata('charts_used', 'mem_used', 0, 512 * 1000 * 1000, 1);
	//tag_hisdata('charts_free', 'mem_free', 0, 512 * 1000 * 1000, 1);	
	setInterval(function(){
		//tag_hisdata('charts', 'cpuload', 0, 1, 1);
		//tag_hisdata('charts_used', 'mem_used', 0, 512 * 1000 * 1000, 1);
		// tag_hisdata('charts_free', 'mem_free', 0, 512 * 1000 * 1000, 1);
	}, 5000);
	
	/* 定时刷新采集设备数据 */
	//setInterval(reset_device_data_list, 3000);
})
