/**
 * @file            collection.js
 * @description     单个网关管理。
 * @author          dongsun Team ( http://www.dongsun.com/ )
 * @date            2018-03-08 dongsun
**/
$(function(){
	var pageSize = 12; // 每页条数
	var device_sn = getParam('device_sn');// 以当前网关id身份进入应用中心
	var deviceInfo;
	// 当前网关信息
	Ajax.call('/api/method/iot_ui.iot_api.gate_info', {sn:device_sn}, deviceInfo, 'GET', 'JSON', 'FORM');
	function deviceInfo(req){
		deviceInfo = req.message;
		//console.log('deviceInfo',deviceInfo);
	}
	$('.J_device_sn').val(device_sn);
	
	// 应用中心列表显示===========================
	doGetAppList();
	function doGetAppList(){
		var category = $('.center .line').eq(0).find('p .all').text();
		var protocol = $('.center .line').eq(1).find('p .all').text();
		var device_supplier = $('.center .line').eq(2).find('p .all').text();
		if(category=='全部'){category = '';}
		if(protocol=='全部'){protocol = '';}
		if(device_supplier=='全部'){device_supplier = '';}
		var data = {
			'category':category,
			'protocol':protocol,
			'device_supplier':device_supplier,
			'user':'',
			'name':'',
			'app_name':'',
		};
		//console.log('appstore_applist_data',data);
		Ajax.call('/api/method/iot_ui.iot_api.appstore_applist', JSON.stringify(data), getList, 'POST', 'JSON', 'JSON',false);
		// 主动请求列表数据
		function getList(items){
			if(items.message && typeof items.message!=='undefined'){
				//console.log(items.message);
				localStorage.shop_app_list_original = JSON.stringify(items.message);
				localStorage.shop_app_list_current = JSON.stringify(items.message);
				display_appList(1);
				display_app_page();
			}else{
				$('.J_appList .main').remove();
				$('.J_appList .none').show();
				$('.J_none').hide();
			}
		}	
	}
	// 翻页
	function display_app_page(){
		layui.use(['laypage', 'layer'], function(){
			var data = JSON.parse(localStorage.shop_app_list_current);
		  	var laypage = layui.laypage
		  	,layer = layui.layer;
			laypage.render({
			    elem: 'J_pagination_nav'
			    ,count: data.length
			    ,limit:	pageSize
			    ,theme: '#354E77'
			    ,jump: function(obj){
		      		display_appList(obj.curr);
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
	function display_appList(page_num){
		var data = JSON.parse(localStorage.shop_app_list_current);
		data = pagination(page_num,pageSize,data);//'';//
		var arrLen = data.length;
		if(arrLen==0 && page_num==1){
			$('.J_appList .none').show();
			$('.J_none').hide();
			return false;
		}else{
			$('.J_appList .none').hide();
			$('.J_none').show();
		}
		var html='';
		// console.log(data);
		for (var i = 0; i < arrLen; i++) {
			/* 临时获取最新应用版本号 */
			var lastest_version = '';
			var device_detail = JSON.parse(localStorage.getItem('device_detail_'+device_sn));
			Ajax.call('/api/method/app_center.api.get_latest_version?app='+data[i].name+'&beta='+device_detail.basic.beta, "", get_latest_version ,'GET', 'JSON', 'FORM', false);
			function get_latest_version(d){
				if(d && typeof d.message !== 'undefined') {
					lastest_version = d.message;
					localStorage.setItem('app_lastest_version_'+data[i].name,d.message);
				}
			}
			//var inst = data[i].inst;alert(inst);
			var id='无';
			var ver='无';
			if(data[i].cloud!=null){ 
				id = data[i].cloud.name;
				ver = data[i].cloud.ver;
			}
			var star = parseFloat(data[i].star)*10;
		    var modified = (new Date(data[i].modified)).getTime();
    		modified = new Date(modified).format("yyyy-MM-dd");
			html += `<div class="main J_one_${i}">
						<div class="shop_block">
							<div class="img"><img src="http://iot.symgrid.com/${data[i].icon_image}" /></div>
							<div class="mid">
								<p class="J_name_${i}" name="${data[i].name}" lastest_version="${lastest_version}">${data[i].app_name}</p>
								<p class="v_code">${lastest_version}</p>
								<p>${data[i].device_supplier}</p>
								<p>${data[i].owner}</p>
							</div>
							<div class="right">
								<button index="${i}">现在安装</button>
								<p index="${i}">更多详情</p>
							</div>
						</div>
						<div class="money">
							<div class="stars star-${star}"></div>
							<b>最近更新：<span>${modified}</span></b>
						</div>
					</div>`;
		}
		$('.J_appList .main').remove();
		$('.J_appList .none').after(html);
	}

	//  筛选条件
	getFilter();
	function getFilter(){
		Ajax.call('/api/resource/App Category', "", getFilter1, 'GET', 'JSON', 'FORM');
		function getFilter1(req){
			var html="<span class='all'>全部</span>";
			$.each(req.data,function(i,v){
				html += '<span>'+v.name+'</span>';
			});
			$('.center .line').eq(0).find('p').html(html);
		}
		Ajax.call('/api/resource/App Device Protocol', "", getFilter2, 'GET', 'JSON', 'FORM');
		function getFilter2(req){
			var html="<span class='all'>全部</span>";
			$.each(req.data,function(i,v){
				html += '<span>'+v.name+'</span>';
			});
			$('.center .line').eq(1).find('p').html(html);
		}
		Ajax.call('/api/resource/App Device Supplier', "", getFilter3, 'GET', 'JSON', 'FORM');
		function getFilter3(req){
			var html="<span class='all'>全部</span>";
			$.each(req.data,function(i,v){
				html += '<span>'+v.name+'</span>';
			});
			$('.center .line').eq(2).find('p').html(html);
		}
	}
	$('.center .line p').on('click','span',function(){
		//var name = $(this).attr('data-classname');
		//var val = $(this).text();
		var _this = $(this);
		_this.parent().find('span').removeClass('all');
		_this.addClass('all');
		doGetAppList();	
	});
	
	// 搜索
	$('.input-group-addon').click(function(){
		searchAppname();
	});
	$(document).keydown(function(event) { //键盘响应函数
		event = event || window.event; //兼容多浏览器
		if (event.keyCode == 13) { //监听回车键
			if($("#J_keyword").is(":focus")){ // 只有焦点在关键词框的时候才生效
				searchAppname();
				return false;
			}
		}
	});
	function searchAppname(){
		var filter = ['app_name'];
		var keyword = $('#J_keyword').val();
		search_list(filter,keyword);
	}
	// 点击搜索显示数据
	function search_list(filter,keyword){
		if(keyword==''){			
			localStorage.shop_app_list_current = localStorage.shop_app_list_original;
		}else{
			var data = JSON.parse(localStorage.shop_app_list_original);
			data = search_array(data,keyword,filter); // 排序
			localStorage.shop_app_list_current = JSON.stringify(data);
		}
		display_appList(1);
		display_app_page();
	}
	
	/**
	*	安装弹窗
	*/
	$(".shade.app-detail .J_setupButton").click(function(){
		//var html = $('.J_install_html').html();
		//layui.use('layer', function(){
		//	layui.layer.open({
		//	  title: '应用安装',
		//	  type: 1,
		//	  skin: 'layui-layer-rim', //加上边框
		//	  area: ['460px', '540px'], //宽高
		//	  content: html
		//	});
		//});
		$(".shade.app-detail").hide();

		// $(".J_install_html").show();
        $(".shade.app-install").show();
		$(".J_install_html").css({"top":($(window).height()-$(".J_install_html").height())/2})
	})
	// 应用列表点击立即安装， 显示安装窗口
	$('.J_appList').on('click','.shop_block .right button',function(){
		var index = $(this).attr('index');
		var app_name = $('.J_name_'+index).attr('name');
		$('.J_app').val(app_name);


		// $(".J_install_html").show();
        $(".shade.app-install").show();
		$(".J_install_html").css({"top":($(window).height()-$(".J_install_html").height())/2})
	})
	
	/**
	*	显示获取应用详情
	*/
	$(".content").on("click",".shop_block .right p",function(){
		var index = $(this).attr('index');
		var app_name = $('.J_name_'+index).attr('name');
		var lastest_version = $('.J_name_'+index).attr('lastest_version');
		$(".shade.app-detail").fadeIn(300);
//		$(".info_shade").css("margin-top",($(window).height()-$(".info_shade").height())/2);
		
		var data  = {
			app_name:app_name
		}
		Ajax.call('/api/method/iot_ui.iot_api.app_details', JSON.stringify(data), app_details, 'POST', 'JSON', 'JSON',false);
		function app_details(req){
			localStorage.setItem('app_details_'+req.message.name,JSON.stringify(req.message));
			$('.J_app').val(req.message.name); // 当前查看的appid
			
		    var modified = (new Date(req.message.modified)).getTime();
    		modified = new Date(modified).format("yyyy-MM-dd");
    		var star = req.message.star*10;
    		
			//console.log('app_details',req);
			var html = `<div class="left">
		  					<div class="logo"><img src="http://iot.symgrid.com/${req.message.icon_image}"></div>
		  					<div class="txt">
		  						<div class="name">${req.message.app_name}<span>${lastest_version}</span></div>
		  						<div>发布者：${req.message.device_supplier}<em>|</em><span class="stars star-${star}"></span>(165)</div>
		  						<div><span>更新日期：${modified}</span><span>更新记录：${req.message.fork_version}</span><span>适配型号：${req.message.device_serial}</span></div>
		  					</div>
		  				</div>`;
		  	$('.shopinfo_center .left').remove();
		  	$('.shopinfo_center .button').before(html);
		  	// md数据
		  	$('#my-editormd').html('<textarea id="my-editormd-markdown-doc" name="my-editormd-markdown-doc" style="display:;"></textarea>');
		  	$('#my-editormd-markdown-doc').val(req.message.description);
		  	
		  	$('#J_id').val(req.message.name);
		  	$('.carousel-inner img').attr("src",'http://iot.symgrid.com/'+req.message.icon_image);
		  	getCommentList(req.message.name); // 评论
	
			editormd.markdownToHTML("my-editormd", {//注意1：这里的就是上面的DIV的id属性值
				htmlDecode: "style,script,iframe",  // you can filter tags decode
				emoji: true,
				taskList: true,
				tex: true,  // 默认不解析
				flowChart: true,  // 默认不解析
				sequenceDiagram: true,  // 默认不解析			
				//width   : "90%",
				//height  : 640,
				//syncScrolling : "single",
				//saveHTMLToTextarea : false//注意3：这个配置，方便post提交表单
			});
		}
	})

	/**
	*	获取评论列表
	*/
	function getCommentList(app){//filters:'[["app","=","APP00000014"]]'
		Ajax.call('/api/resource/IOT Application Review?filters=[["app","=","'+app+'"]]&fields="*"', "", displayCommentList, 'GET', 'JSON', 'FORM');
		function displayCommentList(req){
			data = req.data;
			var arrLen = data.length;
			var html='';
			for (var i = 0; i < arrLen; i++) {
				// console.log(data[i].star);
				html += `<div class="comment_main cf">
							<div class="img fl">
								<!--<img src="img/bg_left.png" />-->
							</div>
							<div class="fl">
								<p><b>${data[i].title}</b><span class="star-${data[i].star}"></span><span>${data[i].creation}</span></p>
								<p>${data[i].content}</p>
								<p onClick="javascript:alt('开发中',4);">
									<img src="img/shop_praise.png" />  <!--<img src="img/shop_praise_hover.png" />未收藏和收藏的图-->
									<img src="img/shop_sharecmt.png" />
									<img src="img/shop_delete.png" />
								</p>
							</div>
						</div>`;
			}
			$('.J_comment').html(html);
		}
	}

	// 添加应用评论
	$('.comment_bottom button').click(function(){
		var data = {
			app:$('#J_id').val(),
			star:$('input[name="start"]').val(),
			title:$('input[name="title"]').val(),
			content:$('#content').val()
		}
		if(data.title==''){err('标题不能为空');return false;}
		if(data.content==''){err('内容不能为空');return false;}
		if(data.star=='0'){err('请选择评分');return false;}
		Ajax.call('/api/method/app_center.appmgr.add_review', JSON.stringify(data), add_review, 'POST', 'JSON', 'JSON');
		function add_review(req){
			if(typeof req.message!=='undefined'){
				alt('评论成功',1);
				setTimeout(function(){
					getCommentList($('#J_id').val());
					}, 1000);
				$('input[name="title"]').val('');
				$('#content').val('');
			}
		}		
	})
	
	//	分类折叠
	$(".shop_content .line .more").each(function(){
		var i = true;
		$(this).click(function(){
			if(i) {
				$(this).find("img").css("transform","rotate(180deg)");
				$(this).find("em").html("收起");
				$(this).parent().find("p").css("height","auto");
				i = false;
			}else{
				$(this).find("img").css("transform","rotate(0deg)");
				$(this).find("em").html("更多");
				$(this).parent().find("p").css("height","25px");
				i = true;
			}
		})
	});
	
	//	分类详情隐藏
	$(".info_shade .close-").on("click",function(){
		$(".shade.app-detail").fadeOut(300);
	});

	$(".J_install_html .close-").on("click",function(){
		// $(".J_install_html ").fadeOut(300);
        $(".shade.app-install").fadeOut(300);
	});
	
	$('.J_gate_name').html('<a href="collection.html?type=manage&device_sn='+device_sn+'">'+device_sn+'</a>');
    
	//  星星评分
	$(".box li").click(function(){
	    var index = $(this).index();
	    $('input[name="start"]').val(index+1);
		var parentId = $(this).parent().attr("id");
		$("#"+parentId).find("li").css("background-image","url('../img/star_link.png')");
		for(var i=0;i<=index;i++){
			$("#"+parentId).find("li").eq(i).css("background-image","url('../img/star_hover.png')");
		}
	});
})
