/**
 * @file            mine.js
 * @description     设备频道。
 * @author          dongsun Team ( http://www.dongsun.com/ )
 * @date            2018-03-08 dongsun
**/
$(function(){
	var pageSize = 10; // 每页条数
//已停止禁止点击更多
	$("table .end .more").unbind();
//给全选的复选框添加事件
    $(".all").click(function(){
    	// this 全选的复选框
    	var userids=this.checked;
    	//获取name=box的复选框 遍历输出复选框
    	$("input[class=box],input[class=all]").each(function(){
        	this.checked=userids;
     	});
 	});

 	$('table').on('click','input[class=box]',function(){
		$('input[class=box]').each(function(){
			if ($(this).is(':checked')) {
				allChosed = true;
			} else {
				allChosed = false;
				$('.all').prop('checked',false);
				return false;
			}
		});
		if (allChosed) {
			$('.all').prop('checked',true);
		}
	});
	
	// 默认全部
	function initGateList(){
		var page_num = localStorage.getItem('mine_gate_page_num');
		if(page_num==null){
			page_num=1;
		}
		var filter = $('.refresh').attr('data-filter');
		//console.log('开始请求网关列表-------------page:'+page_num,filter);
		Ajax.call('/api/method/iot_ui.iot_api.devices_list', {filter:filter}, getList_init, 'GET', 'JSON', 'FORM',false);	
		function getList_init(items){
			//console.log('接受网关列表数据-------------',items);
			localStorage.setItem('list_original',JSON.stringify(items.message));
			localStorage.setItem('list_current',JSON.stringify(items.message));
			var list = items.message;
			if(!items.message || typeof items.message=='undefined'){
				//alert(items.message);
				display_mine_list(1);
				display_mine_page(1);
			}
			// 字段排序----> 对初始存储数据， 先把排序好， 因为自动刷新的时候， 需要记录之前的排序。
			var name = localStorage.getItem('mine_gate_orderName');
			var type = localStorage.getItem('mine_gate_orderType');
			if(name==null || type==null){
				name = 'device_name';
				type = 'asc';
			}
			//console.log('test-------------',list);
			var sort=new Array();
			sort[name] = type;
			list = arrSort(list,sort); // 排序
			// 搜索过滤---->对初始存储数据			
			var keyword = localStorage.getItem('mine_gate_keyword');
			var filter = localStorage.getItem('mine_gate_filter');
			if(keyword!=null && filter!=null){
				list = search_array(list,keyword,filter); // 搜索过滤
			}
			localStorage.setItem('list_current',JSON.stringify(list));
			
			//console.log('结果数据-------------',list);
			display_mine_list(page_num);
			display_mine_page(page_num);
		}
	}
	
	//点击条件筛选
	$(".main_content .taps span").click(function(){
		$(this).addClass("color");
		$(this).siblings().removeClass("color");
		var filter = $(this).data('filter');
		$('.refresh').attr('data-filter',filter);
		initGateList();
	});
	$(".refresh").click(function(){ // 刷新
		initGateList();
	});
	
	// 排序筛选
	$('.J_mine_order').click(function(){
		var sort=new Array();
		var name = $(this).attr('data-orderName');//'device_sn';//
		var type = $(this).attr('data-orderType');
		sort[name] = type;
		if(type=='desc'){
			$(this).attr('data-orderType','asc');
		}else{
			$(this).attr('data-orderType','desc');
		}
		localStorage.setItem('mine_gate_orderName',name);
		localStorage.setItem('mine_gate_orderType',type);
		initGateList();
	});

	// 搜索start=========================
	$('.btn-group ul li').click(function(){
		var searchType =  $(this).text();
		var searchName =  $(this).attr('data-name');
		$('#J_searchType').text(searchType);
		$('#J_searchType').attr('data-name',searchName);
	});
	$('.input-group-addon').click(function(){
		searchMine();
	});
	$(document).keydown(function(event) { //键盘响应函数
		event = event || window.event; //兼容多浏览器
		if (event.keyCode == 13) { //监听回车键
			searchMine();
			return false;
		}
	}); 
	//键盘相应结束	
	function searchMine(){
		var filter = [$('#J_searchType').attr('data-name')];
		var keyword = $('#J_keyword').val();		
		localStorage.setItem('mine_gate_keyword',keyword);
		localStorage.setItem('mine_gate_filter',filter);
		initGateList();
	}
	// 搜索end=========================

	// 删除网关
	$('#J_remove').click(function(){
		if($('input[type="checkbox"][name="device"]:checked').length==0){
			err('请选择要删除的记录');
			return false;
		}
		layui.use(['laypage', 'layer'], function(){
		  	var laypage = layui.laypage
		  	,layer = layui.layer;
			layer.confirm('确认删除吗？', {
			  btn: ['确认','取消']
			}, function(){			  	
				$('input[type="checkbox"][name="device"]:checked').each(function(){
					var _this = $(this);
					var device_sn = _this.val();
					var index = _this.attr('index');
					var sn=new Array();
					sn[0] = device_sn;
					var data = {'sn':sn};

					Ajax.call('/api/method/iot_ui.iot_api.remove_gate', JSON.stringify(data), 'remove_list_originalFun', 'POST', 'JSON', 'JSON',false);
					//remove_list_original(device_sn); // 删除本地缓存
					//$('.J_list_one_'+index).remove();
					function remove_list_originalFun(req){
						if(req.message==true){
						}
					}
				});
				alt('删除成功',1);				
				//localStorage.setItem('gateList_page_num',page_num);
				initGateList(localStorage.getItem('page_num'));
			  	setTimeout('layer.closeAll();', 1500);
			}, function(index){
			  layer.close(index);
			});
		});
	})
	// 删除网关后， 删除缓存数据条目
	function remove_list_original(device_sn){
		var list_original = JSON.parse(localStorage.list_original);
		var list_current = JSON.parse(localStorage.list_current);
		var arrLen = list_original.length;
	 	list_original = list_original.filter(function(item) {
			return item.device_sn!= device_sn;
		});
	 	list_current = list_current.filter(function(item) {
			return item.device_sn!= device_sn;
		});
		localStorage.list_original = JSON.stringify(list_original);
		localStorage.list_current = JSON.stringify(list_current);
		return false;
	}
	
	// 翻页
	function display_mine_page(page_num){
		localStorage.setItem('mine_gate_page_num',page_num);
		layui.use(['laypage', 'layer'], function(){
			var data = localStorage.list_current;
			if(data=='undefined'){
				//$('.J_none').hide();
				//$('.none').show();
				return false;
			}
			data = JSON.parse(data);
		
		  	var laypage = layui.laypage
		  	,layer = layui.layer;
			laypage.render({
			    elem: 'J_pagination_nav'
			    ,count: data.length
			    ,limit:	pageSize
			    ,theme: '#354E77'
			    ,curr: page_num
				,layout: ['prev', 'page', 'next','count']
			    ,jump: function(obj){
					localStorage.setItem('mine_gate_page_num',obj.curr);
		      		display_mine_list(obj.curr);
			    }
		  	});
		});
	}
	
	// 数组翻页
	function pagination(pageNo, pageSize, array) {  
        var offset = (pageNo - 1) * pageSize;  
        return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);  
    }  

    /**
    *	按页码显示内容列表
    *	page_num	页码
    */ 
	function display_mine_list(page_num){
		$('.J_list_one').remove();
		var data = localStorage.list_current;
		if(data=='undefined'){
			if($('.refresh').attr('data-filter')=='all' && $('#J_keyword').val()==''){
				$('.none p').eq(1).text('您的账户下没有网关呢！');
				$('.J_bind').show();
			}else{
				$('.none p').eq(1).text('没有查询到符合条件的记录！');
				$('.J_bind').hide();
			}
			$('.J_none').hide();
			$('.none').show();
			return false;
		}
		data = JSON.parse(data);
		data = pagination(page_num,pageSize,data);
		var html='';
		var html1='';
		var arrLen = data.length;
		if(arrLen==0 && page_num==1){
			if($('.refresh').attr('data-filter')=='all' && $('#J_keyword').val()==''){
				$('.none p').eq(1).text('您的账户下没有网关呢！');
				$('.J_bind').show();
			}else{
				$('.none p').eq(1).text('没有查询到符合条件的记录！');
				$('.J_bind').hide();
			}
			$('.J_none').hide();
			$('.none').show();
		}else{
			$('.J_none').show();
			$('.none').hide();
		}
		for (var i = 0; i < arrLen; i++) {
			var index = ((page_num-1)*pageSize)+i;
			var status,statusName,device_name;
			var manageUrl = '#';
			var monitorUrl = '#';
			var deviceUrl = '#';
			if(data[i].device_desc==null){
				var device_desc = '无';
			}else{
				var device_desc = data[i].device_desc;
			}
			if(data[i].device_status=='ONLINE'){
				status = 'on';
				statusName = '在线';
				deviceUrl = 'collection.html?type=device&device_sn='+data[i].device_sn;
				manageUrl = 'collection.html?type=manage&device_sn='+data[i].device_sn;
				monitorUrl = 'collection.html?type=monitor&device_sn='+data[i].device_sn;
			}else if(data[i].device_status=='OFFLINE'){
				status = 'end';
				statusName = '离线';
			}else{
				status = 'end';
				statusName = '未连接';
			}
			device_name = data[i].device_name;

			html += `<tr class="J_list_one ${status} J_list_one_${index}">
				        <td><label class="checkbox"><input index="${index}" name="device" type="checkbox" class="box" value="${data[i].device_sn}"/><em></em></label></td>
				        <td><i class="on"></i><a href="${deviceUrl}" class="J_sn_${data[i].device_sn}">${device_name}</a></td>
				        <td class="J_desc_${index}">${device_desc}</td>
				        <td>北京</td>
				        <td>${data[i].last_updated}</td>`;
				        
				        html += `<td><i class="run"></i>${statusName}</td>`;
				        
				        html += `<td><a href="${monitorUrl}"><span><img src="img/button_oversee.png"/>监视</span></a><a href="${manageUrl}"><span><img src="img/button_settings.png"/>管理</span></a>
				        	<div class="btn-group">
								<p class="more"><span>更多</span><i></i></p>
								<div class="more_content hd"><!--animated fadeInDown-->
									<p class="J_edit" index="${index}" sn="${data[i].device_sn}" name="${data[i].device_name}" desc="${device_desc}">修改</p>
								</div>
							</div>
				        </td>
				    </tr>`;
	    }
	    $('#J_bodyline').after(html);
	    
	}
	//单个网关的操作////////////////////////////////////////////////////////////////////////////////////////////////
	// 列表里的更多按钮
	$(document).click(function(){
		$(".more_content").addClass("hd");
	})
	$(".main_content").on("click",".on .more",function(event){
		event.stopPropagation();
		if($(this).parent().find(".more_content").hasClass("hd")){
			$(this).parent().find(".more_content").removeClass("hd");
			$(this).parent().parent().parent().siblings().find(".more_content").addClass("hd");
		}else{
			$(this).parent().find(".more_content").addClass("hd");
		}
	})
	
	// 升级网关
	$('#J_upgrade').click(function(){
		alt('功能开发中',4);
	})
	
	// 绑定网关的弹层
	$(".J_bind").click(function(){
		$(".shade").show();
		
		$(".shade input[name='name']").val('');
		$(".shade input[name='sn']").val('');
		$(".shade textarea[name='desc']").val('');
		
		$(".shade input[name='sn']").attr('readonly',false);
		$(".shade .main").css("margin-top",($(window).height()-$(".shade .main").height())/2);
		$('.shade .tit b').text('绑定新网关');
		$('.shade .bottom .sure').attr('data','add');
		$('.J_add_none').show();
	});
	$(".shade .tit span").click(function(){
		$(".shade").hide();
	});
	
	// 修改网关的弹层
	$(".main_content").on("click",'.more_content .J_edit',function(){
		$(".shade").show();
		$(".shade input[name='sn']").attr('readonly',true);
		$(".shade .main").css("margin-top",($(window).height()-$(".shade .main").height())/2);
		$('.shade .tit b').text('修改网关');
		
		$('.shade .bottom .sure').attr('data','edit');
		$('.shade .bottom .sure').attr('index',$(this).attr('index'));
		
		$('.J_add_none').hide();
		$("input[name='name']").val($(this).attr('name'));
		$("input[name='sn']").val($(this).attr('sn'));
		$("#desc").val($(this).attr('desc'));
	})
	// 添加/修改网关 提交动作
	$('.shade .sure').click(function(){
		var source = $(this).attr('data');
		var name = $("input[name='name']").val();
		var sn = $("input[name='sn']").val();
		var owner_type = $("#owner_type").val();
		var desc = $("#desc").val();
		if(name==''){err('网关名称不能为空');return false;}
		if(sn==''){err('网关序列号不能为空');return false;}
		if(owner_type==''){err('设备归属不能为空');return false;}
		if(desc==''){err('网关描述不能为空');return false;}
		if(source=='add'){
			var data = {
				sn:sn,
				name:name,
				desc:desc,
				owner_type:owner_type,
			}
			Ajax.call('/api/method/iot_ui.iot_api.add_new_gate', JSON.stringify(data), add_new_gate, 'POST', 'JSON', 'JSON',false);
			function add_new_gate(req){
				if(req.message==true){
					alt('添加成功',1);
					$(".shade").hide();
					$(this).attr('data');
					
					$("input[name='name']").val('');
					$("input[name='sn']").val('');
					$("textarea[name='desc']").val('');
					
					$("#desc").val('');
					initGateList(1);
					//setTimeout("redirect('mine.html');", 2000);
				}
			}
		}else if(source=='edit'){
			var data = {
				sn:sn,
				name:name,
				desc:desc,
			}
			Ajax.call('/api/method/iot_ui.iot_api.update_gate', JSON.stringify(data), update_gate, 'POST', 'JSON', 'JSON');
			function update_gate(req){
				if(req.message==true){
					alt('修改成功',1);
					$(".shade").hide();
					$('.J_sn_'+sn).text(name);
					$('.J_desc_'+sn).text(desc);
					$("input[name='name']").val('');
					$("input[name='sn']").val('');
					$("#desc").val('');
				}
			}
		}
	})
	//end////////////////////////////////////////////////////////////////////////////////////////////////


	/* 获取网关列表 */
	initGateList();
	/* 定时刷新网关列表 */
	setInterval(initGateList, 10000);
})
