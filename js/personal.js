/**
 * @file            personal.js
 * @description     用户中心成员操作
 * @author          dongsun Team ( http://www.dongsun.com/ )
 * @date            2018-03-08 dongsun
**/
$(function(){	
	var regex = {
		pwd:/^(\w){6,20}$/,
		mobile: /^0?(13[0-9]|15[012356789]|18[02356789]|14[57])[0-9]{8}$/,
		email: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
		phone: /^[+]{0,1}(\d){1,3}[ ]?([-]?((\d)|[ ]){1,12})+$/
	};
	var company = getCookie('companies');	
	var isAdmin = getCookie('isAdmin');
	if(isAdmin=='false'){
		err('无权查看，请联系管理员');
		redirect('index.html');	
	}
	getUserList();

			
	/**
	*	成员管理
	*/
	function getUserList(){
		console.log(company);
		Ajax.call('/apis/api/method/iot_ui.iot_api.list_company_member', {company:company}, displayUserListFun, 'POST', 'JSON', 'FORM');
		function displayUserListFun(req){
			console.log(req);
			var html='';
			var html1;
			$.each(req.message,function(i,val){
				html += `<div class="block" user="${val.user}">
							<img src="img/top_avatar.png"/>
							<span>${val.fullname}</span>
							<p class="close- fr"></p>
						</div>`;
			})
			$('.personal_content .none').after(html);
			//$('.personal_content .none').show();
			if(html==''){
				$('.personal_content .none').show();
			}
		}
	}

	/**
	*	添加用户资料（弹窗显示）
	*/
	$(".J_addUser").click(function(){
		$('.J_email').removeAttr("readonly");
		$(".shade").show();
		$('.J_email').show();
		$(".add").attr('data','add').text('添加');
		$(".shade .tit b").text('添加新成员');
		$(".shade .main").css("margin-top",($(window).height()-$(".shade .main").height())/2)
	});
	$(".shade .tit span").click(function(){
		$(".shade").hide();
	})
	// 提交添加/修改用户资料
	$('.add').click(function(){
		var _this = $(this);
		var type = $(".add").attr('data');
		var index = $(".add").attr('index'); // 记录点击的第几个
		$('.J_email').show();
		var email = $("input[name='email']").val();
		var first_name = $("input[name='first_name']").val();
		var last_name = $("input[name='last_name']").val();
		var phone = $("input[name='phone']").val();
		var mobile_no = $("input[name='mobile_no']").val();
		var new_password = $("input[name='new_password']").val();
		// 添加============================================
		if(type=='add'){
			if(email==''){err('邮箱不能为空');return false;}
	        if (!regex.email.test(email)){
				return err('请正确填写邮箱格式');
			}
			if(first_name==''){err('姓不能为空');return false;}
			if(last_name==''){err('名不能为空');return false;}
			if(phone==''){err('电话号码不能为空');return false;}
			if(mobile_no==''){err('手机号码不能为空');return false;}
	        if (!regex.mobile.test(mobile_no)){
				return err('请正确填写手机号码');
			}
			if(new_password==''){err('新用户密码不能为空');return false;}
			var data = {
				userinfo:{email:email,first_name:first_name,last_name:last_name,phone:phone,mobile_no:mobile_no,new_password:new_password},
				company:company
			}
			console.log(data);
			Ajax.call('/apis/api/method/iot_ui.iot_api.add_newuser2company', JSON.stringify(data), displayUserFun, 'POST', 'JSON', 'JSON');
			function displayUserFun(req){
				if(req.message.userid==email){
					var html = `<div class="block" user="${email}">
								<img src="img/top_avatar.png"/>
								<span>${first_name}${last_name}</span>
								<p class="close- fr"></p>
							</div>`;
					$('.personal_content .none').after(html);
					alt('添加成功',1);
					$(".shade").hide();
				}
				console.log(req);
			}
		// 修改==================================================
		}else if(type=='edit'){
			if(email==''){err('邮箱不能为空');return false;}
			if(first_name==''){err('姓不能为空');return false;}
			if(last_name==''){err('名不能为空');return false;}
			if(phone==''){err('电话号码不能为空');return false;}
			if(mobile_no==''){err('手机号码不能为空');return false;}
			var data = {userid:email,first_name:first_name,last_name:last_name,phone:phone,mobile_no:mobile_no,new_password:new_password
			}
			Ajax.call('/apis/api/method/iot_ui.iot_api.update_userinfo', JSON.stringify(data), editUserFun, 'POST', 'JSON', 'JSON');
			function editUserFun(req){
				if(req.message.userid==email){
					$('.personal_content .block').eq(index-1).find('span').text(first_name+" "+last_name);
					alt('修改成功',1);
					$(".shade").hide();
				}
			}
		}
		
	})
	
	/**
	*	删除成员资料
	*/
	$('.personal_content').on('click','.close-',function(){
		var username = $(this).parent().attr('user');
		if(username==getCookie('usr')){
			err('管理员不能删除');
			return false;
		}
		if(confirm("确定删除吗？")){
			var _this = $(this);
			var  data = {
				users:[username],
				company:company
			};
			Ajax.call('/apis/api/method/iot_ui.iot_api.del_userfromcompany', JSON.stringify(data), displayUserListFun, 'POST', 'JSON', 'JSON');
			function displayUserListFun(req){
				if(req.message.deleted.length==1){
					alt('删除成功',1);
					_this.parent().remove();
				}
				console.log(req);
			}
		}
	});
	/**
	*	获取修改成员资料（弹窗显示）
	*/
	$('.personal_content').on('click','.block span,img',function(){
		var index = $(this).index();
		var _this = $(this);
		$(".shade").show();
		$('.J_email').attr("readonly","readonly");
		$(".add").attr('data','edit').text('修改');
		$(".add").attr('index',index);
		//$('.J_email').hide();
		$(".shade .tit b").text('修改成员资料');
		$(".shade .main").css("margin-top",($(window).height()-$(".shade .main").height())/2);

		var data = {
				user:_this.parent().attr('user'),
			}
		Ajax.call('/apis/api/method/iot_ui.iot_api.userinfo_all?user='+_this.parent().attr('user'),"", displayUserFun, 'GET','JSON');
		function displayUserFun(req) {
			console.log('displayUserFun',req);
			$("input[name=email]").val(req.message.name);
			$("input[name=first_name]").val(req.message.first_name);
			$("input[name=last_name]").val(req.message.last_name);
			$("input[name=phone]").val(req.message.phone);
			$("input[name=mobile_no]").val(req.message.mobile_no);
		}
		// 临时测试
		//$.ajax({
		//	headers:{'Content-Type':'application/json'},
		//	headers:{Accept:"application/json; charset=utf-8"},
	 //       type: 'GET',
	 //       url: 'http://dongsun.com/apis/api/method/iot_ui.iot_api.userinfo_all',
	 //       //dataType: 'JSON',
	 //       dataType: "application/json",
  //      	data: {user:_this.find('p').attr('user')},
  //          success: function(data){
	 //           console.log('data==============',data);
  //          }
  //       //   ,error: function(error){
	 //       //   	console.log('error==============',error);
	 //       //} ,
  //      });
	});
	/**
	*	提交修改成员资料
	*/
	//$('.personal_content').on('click','.block',function(){
	//	var _this = $(this);
	//	$(".shade").show();
	//	$(".add").attr('data','edit').text('修改');
	//	$(".shade .tit b").text('修改成员资料');
	//	$(".shade .main").css("margin-top",($(window).height()-$(".shade .main").height())/2);

	//	var user = _this.find('p').attr('user');
	//	Ajax.call('/api/resource/User/'+user,'', displayUserFun, 'POST', 'JSON','FORM');
	//	function displayUserFun(req) {
	//		console.log(req);
	//		$("input[name=first_name]").val(req.data.first_name);
	//		$("input[name=last_name]").val(req.data.last_name);
	//		$("input[name=phone]").val(req.data.phone);
	//		$("input[name=mobile_no]").val(req.data.mobile_no);
	//	}
	//});

	
});













