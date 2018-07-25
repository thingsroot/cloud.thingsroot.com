/**
 * @file            user.js
 * @description     用户检测登录、登录、注册、退出系统等操作。
 * @author          dongsun Team ( http://www.dongsun.com/ )
 * @date            2018-03-08 dongsun
**/
$(function(){
	isLogin();// 检测是否已登录	
	
	$('.J_login').click(function(){
		login();
	});
	$('.J_register').click(function(){
		register();	
	})
	
	// 登出
	$('#J_logout').click(function(){
		layui.use(['laypage', 'layer'], function(){
		  	var laypage = layui.laypage
		  	,layer = layui.layer;
			layer.confirm('确认退出吗？', {
			  btn: ['确认','取消']
			}, function(){
			  logout();
			}, function(index){
			  layer.close(index);
			});
		});
	});
	// 获取成员列表
	$('.J_getMembers').click(function(){
		var isAdmin = getCookie('isAdmin');
		if(isAdmin=='true'){
			redirect('personal.html');			
		}else{
			err('无权查看，请联系管理员');
			return false;
		}
	});
	
	var isAdmin = getCookie('isAdmin');
	if(isAdmin=='true'){
		$('.J_getMembers').removeClass('hd');
		$('.J_getMembers span').text('成员管理');
		$('.J_getMembers .sublist-title').text('成员管理');
	}else{
		$('.J_getMembers').addClass('hd');
	}
})
	/**
	*	登录
	*/
	function login(){
		var usr = $(".logoin input[name='usr']").val();
		var pwd = $(".logoin input[name='pwd']").val();
		if(usr==''){
			err('用户名不能为空');
			return false;
		}
		if(pwd==''){
			err('密码不能为空');
			return false;
		}
		var data = {usr:usr,pwd:pwd};
		Ajax.call('/api/method/login', {usr:usr,pwd:pwd}, loginfun, 'POST', 'JSON', "");//, 'FORM'
		var index = loading();
		function loginfun(req){
			if(req.message == 'Logged In'){
				//console.log('登录成功-----------------------------------------',req);
				setCookie('usr',usr);
				setCookie('full_name',req.full_name);
				getToken();
				// 检测是否为管理员		
				Ajax.call('/api/method/iot_ui.iot_api.company_admin', {user:usr}, checkAdminFun, 'POST', 'JSON');
				alt('登录成功,页面跳转中',1);
				setTimeout("redirect('index.html')", 2000);
			}else{
				layer.close(index);
			}
		}
		function checkAdminFun(req){
			setCookie('isAdmin',req.message.admin);
			if(req.message.admin==true){
				setCookie('companies',req.message.companies[0]);
			}else{
				setCookie('companies',"");
			}
		}
	}
	/**
	*	判断是否登录
	*/
	function isLogin(){
		var noLoginArr = ['login','register','find','find2']; // 排除无需登陆的页面板块
		auth_token = getCookie('auth_token');
		// console.log("token:::",auth_token);
        get_NewToken();
        // getToken();

		// if(in_array(getHtmlDocName(),noLoginArr)===false){ // 需要登录检测
		// 	if(auth_token==null){
		// 		redirect('login.html');
		// 	}else{
		// 		$('.J_nickname').text(getCookie('full_name'));
		// 	}
		// }
	}
	
	/**
	*	退出
	*/
	function logout(){
		Ajax.call('/?cmd=logout', '', logoutFun, 'GET', 'JSON', 'FORM');
		function logoutFun(req){
			delCookie('auth_token');
		}
		setTimeout("redirect('login.html')", 1500);
	}

	/**
	*	注册
	*/
	function register(){		
		var email = $(".logoin input[name='email']").val();
		var full_name = $(".logoin input[name='full_name']").val();
		Ajax.call('/', {cmd:"frappe.core.doctype.user.user.sign_up",email:email,full_name:full_name,redirect_to:''}, registerFun, 'POST', 'JSON', 'FORM');
		//var index = loading();
		function registerFun(req){
			if(req.message[0]==0){
				alt(req.message[1],5);
				layer.closeAll(index);
				$('.layui-layer-loading').remove();
				return false;
			}else if(req.message[0]==1){
				alt(req.message[1],1);
				layer.close(index);
				setTimeout("redirect('login.html');", 2000);
				return false;
			}
		}
	}
	
	/**
	*	更新 获取token
	*/
    function get_NewToken() {
        var page_name = document.URL.split("/")[document.URL.split("/").length - 1];
        $.ajax({
            url: '/apis/api/method/iot_ui.iot_api.get_token?' + Date.parse(new Date()),
            headers: {
                Accept: "application/json; charset=utf-8",
            },
            type: 'get',
            contentType: "application/json; charset=utf-8",
            dataType:'json',
            success:function(data){
                var new_token  =  data.message;
                // console.log("new token:::",new_token);
                getToken();
                if(page_name.search("login") != -1){
                    redirect('/');
                }
                else{
                    $('.J_nickname').text(getCookie('full_name'));
				}
            },
            error:function(data){
                // console.log(data);
            	if(data.responseJSON._server_messages!=null){
            		if(page_name.search("login") == -1){
                        redirect('login.html');
					}

				}

            }
        });
    }

	function getToken(){
		auth_token = getCookie('auth_token');
		//console.log('getToken-----------------------------------------auth_token',auth_token);
		//if(auth_token==null){
			Ajax.call('/api/method/iot_ui.iot_api.get_token', '', getTokened, 'GET', 'JSON', 'FORM');
		//}
	}
	function getTokened(req){
		// console.log('getToken-----------------------------------------',req);
		setCookie('auth_token',req.message);
	}
