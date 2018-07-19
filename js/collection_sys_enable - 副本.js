/**
 * @file            collection_sys_enable.js
 * @description     网关报文和日志上传。
 * @author          dongsun Team ( http://www.dongsun.com/ )
 * @date            2018-03-08 dongsun
**/
$(function(){
	var device_sn = getParam('device_sn');
	var symlinksn = device_sn;
    var cuser_id = getCookie('usr');//$.cookie('user_id');
    var csid = getCookie('auth_token');//$.cookie('sid');
	var current_vsn = '192929';
	var hostname = "iot.symgrid.com";
	var isShift = false;
	localStorage.setItem('debug_logSort','{}');// 日志默认排序
	localStorage.setItem('debug_commSort','{}');// 报文默认排序
	localStorage.setItem('debug_logKeyword','');
	localStorage.setItem('debug_logFilter','');
	localStorage.setItem('debug_commKeyword','');
	localStorage.setItem('debug_commFilter','');

	/**
	*	获取日志列表
	*/
	function get_sys_enable_log(device_sn,time){
		if($('#J_contorlLogListFlag').html()=="上传日志"){
			console.log('已经停止了120s周期接收日志');
			if(time>0){
				return false;
			}
		}else{
			console.log('开始120s周期接收日志');
		}
        var data = {
            "device": device_sn,
            "data": time,
            "id": current_vsn,
        };
        Ajax.call('/api/method/iot.device_api.sys_enable_log', JSON.stringify(data), sys_enable_log, 'POST', 'JSON', 'JSON');
        function sys_enable_log(req){
	        if(client && time==0){// 停止订阅
	        	alt('已停止订阅',1);
				client.unsubscribe(device_sn+'/comm', {
                    onSuccess: unsubscribeSuccess,
                    onFailure: unsubscribeFailure
                });
                disconnect();
                client=null;
		        return false;
	        }
        	console.log("查询日志................",req);
            var port = "8083";
            var clientId = 'js-mqtt-' + makeid();

            var path = "/mqtt";
            var user = cuser_id;
            var pass = csid;
            var keepAlive = 60;
            var timeout = 6;
            var tls = false;
            var cleanSession = true;
            var lastWillTopic = null;
            var lastWillQos = 0;
            var lastWillRetain = false;
            var lastWillMessage = null;


            if(path){
                client = new Paho.MQTT.Client(hostname, Number(port), path, clientId);
            } else {
                client = new Paho.MQTT.Client(hostname, Number(port), clientId);
            }
            //console.info('Connecting to Server: Hostname: ', hostname, '. Port: ', port, '. Path: ', client.path, '. Client ID: ', clientId);

            // set callback handlers
            client.onConnectionLost = onConnectionLost;
            client.onMessageArrived = onLogArrived;


            var options = {
                invocationContext: {host : hostname, port: port, path: client.path, clientId: clientId},
                timeout: timeout,
                keepAliveInterval:keepAlive,
                cleanSession: cleanSession,
                useSSL: tls,
                onSuccess: onConnect,
                onFailure: onFail
            };



            if(user){
                options.userName = user;
            }

            if(pass){
                options.password = pass;
            }

            if(lastWillTopic){
                var lastWillMessage = new Paho.MQTT.Message(lastWillMessage);
                lastWillMessage.destinationName = lastWillTopic;
                lastWillMessage.qos = lastWillQos;
                lastWillMessage.retained = lastWillRetain;
                options.willMessage = lastWillMessage;
            }
            //console.log(user,pass, device_sn+'/log');
            // connect the client
            client.connect(options);

            var t=setTimeout(function(){
							client.subscribe(device_sn+'/log', {qos: 0});
		                },100);
        }
        //clearHistory();
	}
	
	
	/**
	*	接收日志处理
	*/
	var gate_logList_current = new Array();
    function onLogArrived(message){
	    //console.log(message);
	    var message = JSON.parse(message.payloadString);
	    //console.log(message);
	    var millsec = message[1].toString().split(".")[1];
	    var arr = {
		    'cateName':message[0],
		    'localeTime':new Date(message[1]*1000).toLocaleString('chinese',{hour12:false})+' '+millsec,
		    'content':message[2]
	    }
	    if($('#J_clearLogListFlag').hasClass('clearing')){
			gate_logList_current = new Array();
			$('#J_clearLogListFlag').removeClass('clearing').addClass('clearend');
	    }
		gate_logList_current.push(arr);
		localStorage.setItem('gate_logList_original',JSON.stringify(gate_logList_current));
		localStorage.setItem('gate_logList_current',JSON.stringify(gate_logList_current));
		displayLogList();
    }
	
	// 日志显示
    function displayLogList(){
	    // 字段排序----> 对初始存储数据， 先把排序好， 因为自动刷新的时候， 需要记录之前的排序。
	    var list = localStorage.getItem('gate_logList_original');
	    list = JSON.parse(list);
		var debug_logSort = JSON.parse(localStorage.getItem('debug_logSort'));
		
		//"localeTime":"desc"
		if(JSON.stringify(debug_logSort)=="{}"){
			debug_logSort['localeTime'] = 'desc';
			//console.log('排序条件：','默认时间排序 - ',debug_logSort);
		}else{
			//console.log('排序条件：',debug_logSort);
		}
	    list = arrSort(list,debug_logSort); // 排序
		
	    // 搜索过滤---->对初始存储数据
		var keyword = localStorage.getItem('debug_logKeyword');
		var filter = 'content';//localStorage.getItem('debug_logFilter');
		//console.log('搜索条件：',filter+"="+keyword);
		
		if(keyword!=null && filter!=null){
			list = search_array(list,keyword,filter); // 搜索过滤
		}
		
	    
	    var total = 0;
		if(list && typeof list!=='undefined'){
			total = list.length;
		}
		var html = '';
		for (var i = 0; i < total; i++) {
			//console.log(list[i].localeTime,list[i].cateName,list[i].content);
			html += `<tr style="display:">
			        <td>${list[i].localeTime}</td>
			        <td>${list[i].cateName}</td>
			        <td>${list[i].content}</td>
			    </tr>`;
			if(i>4){
				//break;
			}
		}
		$('#J_gate_log_list').html(html);
    }
    // 排序筛选==============================
	$('#three th').click(function(){
		var _this = $(this);
		setLogOrder(_this);
	});
	$(document).keydown(function(event) {
		event = event || window.event;
		if (event.keyCode == 16) { //监听shift键
			isShift = true;
			return false;
		}
	});
	// 设置过滤条件
	function setLogOrder(_this){
		var index = _this.index();
		var debug_logSort =JSON.parse(localStorage.getItem('debug_logSort'));
		var name = _this.attr('data-orderName');
		var type = _this.attr('data-orderType');		
		var isRemoveClass=false;
		if(type=='desc'){
			_this.attr('data-orderType','asc');
			if(_this.find('i').hasClass('on') && isShift==true){ // 点第三下，并按shift生效区，恢复该列无排序效果
				isRemoveClass = true;
				_this.attr('data-orderType','desc');
				_this.find('i').removeClass("under");
				_this.find('i').removeClass("on");
			}else{
				if(isShift!==true){// 如果没按shift，执行单一排序效果
					_this.parent().find('i').each(function(i,v){
						if(i!==index){
							$(this).parent().attr('data-orderType','desc');
							$(this).removeClass("under");
							$(this).removeClass("on");
						}
					});
				}
				_this.find('i').removeClass("on").addClass("under");
			}
		}else{
			_this.attr('data-orderType','desc');
			_this.find('i').removeClass("under").addClass("on");
		}
		
		if(isShift==false){// 执行单一排序
			var debug_logSort1 = {};
			debug_logSort1[name] = type;
			localStorage.setItem('debug_logSort',JSON.stringify(debug_logSort1));
			debug_logSort = {};
		}else{// 执行多重排序
			if(isRemoveClass==true){// 点击第三下的时候，恢复该列无排序效果
				delete debug_logSort[name];
			}else{
				debug_logSort[name] = type;
			}
			localStorage.setItem('debug_logSort',JSON.stringify(debug_logSort));
		}
		displayLogList();
		isShift = false;		
	};

    /*设置过滤搜索条件*/
	$(".J_logSearchForm .input-group-addon").click(function(){
		searchLogFilter();
	});
	$(document).keydown(function(event) { //键盘响应函数
		event = event || window.event; //兼容多浏览器
		if (event.keyCode == 13) { //监听回车键
			searchLogFilter();
			return false;
		}
	});
	function searchLogFilter(){
		var filter = ['content'];
		var keyword = $('.J_logkeyword').val();
		localStorage.setItem('debug_logKeyword',keyword);
		localStorage.setItem('debug_logFilter',filter);
		displayLogList();
	}

	// 搜索表格的方式搜索
	function doLogSearch(){
		var info_text = $('#J_gate_log_list'),
	    opt = info_text.find('tr'),liLength=0,
	    val = $.trim($(".J_logkeyword").val());
	    $.each(opt,function(index,obj){    
		    if($(obj).find('td').text().indexOf(val)>=0){
			    liLength++;
			    $(obj).show();
		    }else{
		     	$(obj).hide();
		    }
	   })
	   if(liLength==0){
	    	opt.show();
	   }
	}	
	//-------------------------------------------------------------------------------------------------









    
	/**
	*	获取报文列表
	*/
	function get_sys_enable_comm(device_sn,time){		
		if($('#J_contorlCommListFlag').html()=="上传报文"){
			console.log('已经停止了120s周期接收报文');
			if(time>0){
				return false;
			}
		}else{
			console.log('开始120s周期接收报文');
		}
		var inst = $("#J_current_inst").val();
        var data = {
            "device": device_sn,
            "data": {
	                "inst": inst,
        			"sec": time
        		},
            "id": current_vsn,
        };
        Ajax.call('/api/method/iot.device_api.app_upload_comm', JSON.stringify(data), sys_enable_comm, 'POST', 'JSON', 'JSON');
        function sys_enable_comm(req){
	        if(client && time==0){// 停止订阅
	        	alt('已停止订阅',1);
                client.unsubscribe(device_sn+'/log', {
                    onSuccess: unsubscribeSuccess,
                    onFailure: unsubscribeFailure
                });
                disconnect();
                client=null;
		        return false;
	        }
        	console.log("查询报文................");
            var port = "8083";
            var clientId = 'js-mqtt-' + makeid();
            var path = "/mqtt";
            var user = cuser_id;
            var pass = csid;
            var keepAlive = 60;
            var timeout = 6;
            var tls = false;
            var cleanSession = true;
            var lastWillTopic = null;
            var lastWillQos = 0;
            var lastWillRetain = false;
            var lastWillMessage = null;
            if(path){
                client = new Paho.MQTT.Client(hostname, Number(port), path, clientId);
            } else {
                client = new Paho.MQTT.Client(hostname, Number(port), clientId);
            }
            console.info('Connecting to Server: Hostname: ', hostname, '. Port: ', port, '. Path: ', client.path, '. Client ID: ', clientId);

            // set callback handlers
            client.onConnectionLost = onConnectionLost;
            client.onMessageArrived = onMessageArrived;
            var options = {
                invocationContext: {host : hostname, port: port, path: client.path, clientId: clientId},
                timeout: timeout,
                keepAliveInterval:keepAlive,
                cleanSession: cleanSession,
                useSSL: tls,
                onSuccess: onConnect,
                onFailure: onFail
            };

            if(user){
                options.userName = user;
            }

            if(pass){
                options.password = pass;
            }

            if(lastWillTopic){
                var lastWillMessage = new Paho.MQTT.Message(lastWillMessage);
                lastWillMessage.destinationName = lastWillTopic;
                lastWillMessage.qos = lastWillQos;
                lastWillMessage.retained = lastWillRetain;
                options.willMessage = lastWillMessage;
            }

            // connect the client
            client.connect(options);
            console.log(user,pass, device_sn+'/comm');

            var t=setTimeout(function(){
							client.subscribe(device_sn+'/comm', {qos: 0});
		                },100);
        }
        //clearHistory();
	}

	
	/**
	*	接收报文处理
	*/
	var gate_commList_current = new Array();
    function onMessageArrived(message){ 
	    var obj = JSON.parse(message.payloadString);
	    var devicename = obj[0].split('\/')[0];
	    var direction = obj[0].split('\/')[1];
	    var localeTime = new Date(obj[1]*1000).toLocaleString('chinese',{hour12:false});
	    var millsec = obj[1].toString().split(".")[1];
	    var content = CharToHex(base64decode(obj[2]));	    
	    console.log(localeTime,devicename,direction,content);  
	    var arr = {
		    'cateName':devicename,
		    'localeTime':localeTime + ' ' + millsec,
		    'direction':direction,
		    'content':content,
	    }
	    if($('#J_clearCommListFlag').hasClass('clearing')){
			gate_commList_current = new Array();
			$('#J_clearCommListFlag').removeClass('clearing').addClass('clearend');
	    }
		gate_commList_current.push(arr);
		localStorage.setItem('gate_commList_original',JSON.stringify(gate_commList_current));
		localStorage.setItem('gate_commList_current',JSON.stringify(gate_commList_current));
		displayCommList();

    }

	
	// 日志显示
    function displayCommList(){
	    // 字段排序----> 对初始存储数据， 先把排序好， 因为自动刷新的时候， 需要记录之前的排序。
	    var list = localStorage.getItem('gate_commList_original');
	    list = JSON.parse(list);
		var debug_commSort = JSON.parse(localStorage.getItem('debug_commSort'));
		if(JSON.stringify(debug_commSort)=="{}"){
			debug_commSort['localeTime'] = 'desc';
			//console.log('排序条件：','默认时间排序 - ',debug_commSort);
		}else{
			//console.log('排序条件：',debug_commSort);
		}
	    list = arrSort(list,debug_commSort); // 排序
		
	    // 搜索过滤---->对初始存储数据
		var keyword = localStorage.getItem('debug_commKeyword');
		var filter = 'content';//localStorage.getItem('debug_logFilter');
		//console.log('搜索条件：',filter+"="+keyword);
		
		if(keyword!=null && filter!=null){
			list = search_array(list,keyword,filter); // 搜索过滤
		}
		
	    
	    var total = 0;
		if(list && typeof list!=='undefined'){
			total = list.length;
		}
		var html = '';
		for (var i = 0; i < total; i++) {
			//console.log(list[i].localeTime,list[i].cateName,list[i].content);
			html += `<tr style="display:">
			        <td>${list[i].localeTime}</td>
			        <td>${list[i].cateName}</td>
			        <td>${list[i].content}</td>
			    </tr>`;
		}
		$('#J_gate_comm_list').html(html);
    }
    // 排序筛选==============================
	$('#four th').click(function(){
		var _this = $(this);
		setCommOrder(_this);
	});
	$(document).keydown(function(event) {
		event = event || window.event;
		if (event.keyCode == 16) { //监听shift键
			isShift = true;
			return false;
		}
	});
	// 设置过滤条件
	function setCommOrder(_this){
		var index = _this.index();
		var debug_commSort =JSON.parse(localStorage.getItem('debug_commSort'));
		var name = _this.attr('data-orderName');
		var type = _this.attr('data-orderType');		
		var isRemoveClass=false;
		if(type=='desc'){
			_this.attr('data-orderType','asc');
			if(_this.find('i').hasClass('on') && isShift==true){ // 点第三下，并按shift生效区，恢复该列无排序效果
				isRemoveClass = true;
				_this.attr('data-orderType','desc');
				_this.find('i').removeClass("under");
				_this.find('i').removeClass("on");
			}else{
				if(isShift!==true){// 如果没按shift，执行单一排序效果
					_this.parent().find('i').each(function(i,v){
						if(i!==index){
							$(this).parent().attr('data-orderType','desc');
							$(this).removeClass("under");
							$(this).removeClass("on");
						}
					});
				}
				_this.find('i').removeClass("on").addClass("under");
			}
		}else{
			_this.attr('data-orderType','desc');
			_this.find('i').removeClass("under").addClass("on");
		}
		
		if(isShift==false){// 执行单一排序
			var debug_commSort1 = {};
			debug_commSort1[name] = type;
			localStorage.setItem('debug_commSort',JSON.stringify(debug_commSort1));
			debug_commSort = {};
		}else{// 执行多重排序
			if(isRemoveClass==true){// 点击第三下的时候，恢复该列无排序效果
				delete debug_commSort[name];
			}else{
				debug_commSort[name] = type;
			}
			localStorage.setItem('debug_commSort',JSON.stringify(debug_commSort));
		}
		displayCommList();
		isShift = false;		
	};

    /*设置过滤搜索条件*/
	$(".J_commSearchForm .input-group-addon").click(function(){
		searchCommFilter();
	});
	$(document).keydown(function(event) { //键盘响应函数
		event = event || window.event; //兼容多浏览器
		if (event.keyCode == 13) { //监听回车键
			searchCommFilter();
			return false;
		}
	});
	function searchCommFilter(){
		var filter = ['content'];
		var keyword = $('.J_commkeyword').val();
		localStorage.setItem('debug_commKeyword',keyword);
		localStorage.setItem('debug_commFilter',filter);
		displayCommList();
	}

// 	应用的启动、重启、停止
	$('.J_debug_app_start,.J_debug_app_stop,.J_debug_app_restart').click(function(){
		var _this = $(this);
		var inst = $("#J_current_inst").val(); // 实例名称id
		var isRunning = _this.attr('data-isRunning');
		
		// 重启end		
		var id = isRunning+" "+device_sn+"'s "+inst;
		var param = {
		    "device": device_sn,
		    "data": {"inst": inst},	
		    "id": id
		};
		console.log(param);
		if(isRunning=='start'){
			Ajax.call('/api/method/iot.device_api.app_start', JSON.stringify(param), app_start,'POST', 'JSON', 'JSON');
			function app_start(req){
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
		}else if(isRunning=='stop'){
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


	
// 其他操作=========================== 
	$('#J_contorlLogListFlag').click(function(){
		if($(this).hasClass('off')){ //停止上传
			$(this).text('上传日志');
			$(this).removeClass('off');
			get_sys_enable_log(device_sn,0);
		}else{//开启上传
			$(this).text('停止上传');
			$(this).addClass('off');
			get_sys_enable_log(device_sn,120);
	        alt('开始上传日志',1);
	        localStorage.setItem('gate_logList_original',"");
			setInterval(function(){
				get_sys_enable_log(device_sn,0);
				get_sys_enable_log(device_sn,120);
			}, 120000);
		}
	})
	
	$('#J_contorlCommListFlag').click(function(){
		if($(this).hasClass('off')){ //停止上传
			$(this).text('上传报文');
			$(this).removeClass('off');
			get_sys_enable_comm(device_sn,0);
		}else{//开启上传
			$(this).text('停止上传');
			$(this).addClass('off');
			get_sys_enable_comm(device_sn,120);
	        alt('开始上传报文',1);
	        localStorage.setItem('gate_commList_original',"");
			setInterval(function(){
				get_sys_enable_comm(device_sn,0);
				get_sys_enable_comm(device_sn,120);
			}, 120000);
		}
	})
	$('#J_clearLogListFlag').click(function(){
		$(this).removeClass('clearend').addClass('clearing');
		$('#J_gate_log_list').html('');
	})
	$('#J_clearCommListFlag').click(function(){
		$(this).removeClass('clearend').addClass('clearing');
		$('#J_gate_comm_list').html('');
	})
})
