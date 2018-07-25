function getParam(name) {
    //构造一个含有目标参数的正则表达式对象
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); 
    //匹配目标参数
    var r = window.location.search.substr(1).match(reg);
    //返回参数值
    if (r != null) return unescape(r[2]);
    //不存在时返回null
    return null; 
}

function check_local_status() {
   // console.log(net_mode, bind_port);
    // 检测本地服务状态
    $.ajax({
      url: 'http://127.0.0.1:5000/status',
      headers: {
              Accept: "application/json; charset=utf-8",
              Authorization: "Bearer 123123123"
              },
      type: 'get',
      contentType: "application/json; charset=utf-8",
      dataType:'json',
      //async:false,
      success:function(data){
        $("#mes_table  tr:not(:first)").empty("");
        $("span#check_local_result").addClass('text-success');
        $("span#check_local_result").removeClass('text-danger');
        $("span#check_local_result").text("IOE隧道服务运行正常");

          var services_status = new Array();

          // console.log(data);
          $.each(data,function(key,val){
            services_status.push(val);
            // console.log('键名是:'+key, '键值是:'+val);
            var html_tr =     '<tr><tr class="active">'
                            +  '<td>' + key + '</td>'
                            +  '<td>' + val + '</td>'
                            +  '<td></td></tr>';
            $("#mes_table").append(html_tr);
          });

          // console.log(services_status);
          var index = $.inArray("RUNNING", services_status);
          // console.log(index);
          if (index < 0) {
				$("button#start_vpn").addClass("btn-primary");
				$("button#start_vpn").removeClass("btn-danger");
				$("button#start_vpn").html("启动VPN");
				vpn_running = false;

				if(gate_status=="ONLINE"){
						$(".tunnel_config").attr("disabled",false);
						$("button#start_vpn").attr("disabled",false);				
				}


				$("span#ping_devip_result").removeClass('text-success')
				$("span#ping_devip_result").removeClass('text-danger')
				$("span#ping_devip_result").html("");
			  }
          else{
                $("button#start_vpn").addClass("btn-danger");
                $("button#start_vpn").removeClass("btn-primary");
                $("button#start_vpn").html("停止VPN");
				 vpn_running = true;
                $(".tunnel_config").attr("disabled",true)
				$("button#start_vpn").attr("disabled",false);
				if(vpn_running){
					  send_keep_alive();
					  var dev_ip = $("input#dev_ip").val();
					  check_ip_alive(dev_ip);
					  //check_tunnel_mode();
				  }

              }

      },
      error:function(data){
            $("#mes_table  tr:not(:first)").empty("");
            $("span#check_local_result").addClass('text-danger');
            $("span#check_local_result").html("无法连接本地服务，请检查IOE隧道服务是否启动" + '<a href="/downloads/freeioe_vpn_green.rar"  class="navbar-link">点击下载</a>');
            $(".service_error").html("");
			$(".tunnel_config").attr("disabled",true);
			$("button#start_vpn").attr("disabled",true);
			
      }

    });

    if($("button#start_vpn").html()==""){
          $("button#start_vpn").addClass("btn-primary");
          $("button#start_vpn").removeClass("btn-danger");
          $("button#start_vpn").html("启动VPN");
		   vpn_running = false;
          $("span#ping_devip_result").removeClass('text-success')
          $("span#ping_devip_result").removeClass('text-danger')
          $("span#ping_devip_result").html("");
    }

	    if($("button#start_vpn").html()=="启动中……"){
			$(".tunnel_config").attr("disabled",true);
			$("button#start_vpn").attr("disabled",true);
    }
	
		if($("button#start_vpn").html()=="停止中……"){
			$(".tunnel_config").attr("disabled",true);
			$("button#start_vpn").attr("disabled",true);
    }
	
    $("button#start_vpn").removeClass("hide");
    // 检测本地服务状态
}

function check_local_env() {
    // 发送心跳

    $.ajax({
      url: 'http://127.0.0.1:5000/check_env',
      headers: {
              Accept: "application/json; charset=utf-8",
              Authorization: "Bearer 123123123"
              },
      type: 'get',
      contentType: "application/json; charset=utf-8",
      dataType:'json',
      // async:false,
      // data: JSON.stringify(postinfo),
      success:function(data){
          var local_env_status = true;
		  var install_local_env = true;
		  if(data.frpc_bin && data.tinc_bin){
				install_local_env = false
		  }
          // console.log(data);
          $.each(data,function(key,val){
				// console.log(key, val);
				if (!(val)){
				  local_env_status = false;
				  return false;
				}
          });

          if(local_env_status){
              var html_env = '<span class="text-success">运行环境正常 </span>';

          }
		  else if(install_local_env){
				var html_env = '<span class="text-danger">运行环境未安装 </span><a href="/downloads/freeioe_vpn_green.rar"  class="navbar-link">点击下载</a>';
		  }
          else{
			if(data.tap_nic){				
				var tap_nic_icon = '<i class="glyphicon glyphicon-ok"></i>';			
			}else{				
				var tap_nic_icon = '<i class="glyphicon glyphicon-remove"></i>';		
			}
			if(data.frpc_bin){				
					var frpc_bin_icon = '<i class="glyphicon glyphicon-ok"></i>';			
			}else{				
					var frpc_bin_icon = '<i class="glyphicon glyphicon-remove"></i>';		
				}
			if(data.frpc_visitor_Service){				
					var frpc_visitor_Service_icon = '<i class="glyphicon glyphicon-ok"></i>';			
			}else{				
					var frpc_visitor_Service_icon = '<i class="glyphicon glyphicon-remove"></i>';			
			}
			if(data.tinc_bin){				
					var tinc_bin_icon = '<i class="glyphicon glyphicon-ok"></i>';			
			}else{				
					var tinc_bin_icon = '<i class="glyphicon glyphicon-remove"></i>';			
			}
			if(data["tinc.tofreeioebridge"]){				
					var tofreeioebridge_icon = '<i class="glyphicon glyphicon-ok"></i>';			
			}else{				
					var tofreeioebridge_icon = '<i class="glyphicon glyphicon-remove"></i>';			
			}
			if(data["tinc.tofreeioerouter"]){				
					var tofreeioerouter_icon = '<i class="glyphicon glyphicon-ok"></i>';			
			}else{				
					var tofreeioerouter_icon = '<i class="glyphicon glyphicon-remove"></i>';		
			}
            var html_env = '<span class="text-danger">运行环境异常 </span>'
                      + '<div class="btn-group">'
                      + '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'
                      +  '详情 <span class="caret"></span>'
                      +      '</button>'
                      +      '<ul class="dropdown-menu">'
                      +        '<li><a href="#">虚拟网卡：' + data.tap_nic + tap_nic_icon + '</a></li>'
                      +        '<li><a href="#">frpc程序：' + data.frpc_bin + tinc_bin_icon +'</a></li>'
                      +        '<li><a href="#">frpc服务状态：' + data.frpc_visitor_Service + frpc_visitor_Service_icon + '</a></li>'
                      +        '<li role="separator" class="divider"></li>'
                      +        '<li><a href="#">VPN程序：' + data.tinc_bin + tinc_bin_icon + '</a></li>'
                      +        '<li><a href="#">桥接服务：' + data["tinc.tofreeioebridge"] + tofreeioebridge_icon + '</a></li>'
                      +        '<li><a href="#">路由服务：' + data["tinc.tofreeioerouter"] + tofreeioerouter_icon + '</a></li>'
					  +        '<li role="separator" class="divider"></li>'
					  +        '<li><a type="button" class="btn btn-lg btn-primary  one_key_repair">一键修复</a></li>'
                      +      '</ul>'
                      +    '</div>'
          }

          $("span#check_env_result").html(html_env);

      },
      error:function(data){
          console.log(data);
      }
    });
}

function check_tunnel_mode() {
     $.ajax({
      url: 'http://127.0.0.1:5000/tunnel_mode',
      headers: {
              Accept: "application/json; charset=utf-8",
              Authorization: "Bearer 123123123"
              },
      type: 'get',
      contentType: "application/json; charset=utf-8",
      dataType:'json',
      success:function(data){
		console.log(data);
		data = data.message;
         if(data){
					console.log(data);
					$("input#authcode").val(data.auth_code);
					// console.log(data.is_running, data.gate_sn, gate_sn);
					// console.log(vpn_running, data.gate_sn!=gate_sn);
					if (data.is_running){
						vpn_running=data.is_running;
					}
					
					console.log(data.gate_sn, gate_sn);
					var vpn_msg_html = '';
					if(vpn_running  &&  data.gate_sn!=gate_sn){
							console.log("本地在运行，序列号不一样");

								var date = new Date();  
								var strDate = date.toLocaleString().replace(/[年月]/g,'-').replace(/[日上下午]/g,'');  
								vpn_msg_html = vpn_msg_html + strDate + "  当前计算机正和网关" + data.gate_sn + "进行VPN连接，你可在此关闭本机和网关"+ data.gate_sn + "的VPN连接，<button onclick='stop_vpn_in_modal()'>停止VPN</button>，也可关闭当前页面，稍候再试！";
								$("span.error_tips").html(vpn_msg_html);
								$('#myModal').modal('show'); 
					  }


					  

					$("input#gatesn").val(data.gate_sn);
					$("input#tap_ip").val(data.vpn_cfg.tap_ip);
					  $("input#tap_netmask").val(data.vpn_cfg.tap_netmask);
					  $("input#dev_ip").val(data.vpn_cfg.dev_ip);

					  
					gate_sn  = $("input#gatesn").val();
					net_mode = data.vpn_cfg.net_mode;
					frpc_item = gate_sn + "_" + net_mode;
					if(net_mode=="router"){
						bind_port = "666";
						$("span#vn_ipaddr").html("现场子网地址:");
					  $("span#vn_netmask").html("现场子网netmask:");
					  $("button#bridge").removeClass("btn-primary active");
					  $("button#router").addClass("btn-primary active");
					}
					else{
						bind_port = "665";
						$("span#vn_ipaddr").html("现场子网地址:");
						$("span#vn_netmask").html("现场子网netmask:");
						$("button#router").removeClass("btn-primary active");
						$("button#bridge").addClass("btn-primary active");
					}
					if(data.common.protocol=="tcp"){
						  net_protocol=data.common.protocol;
						  $("button#protocol_tcp").addClass("btn-primary active");
						  $("button#protocol_kcp").removeClass("btn-primary active");
					}
					else{
							net_protocol=data.common.protocol;
						  $("button#protocol_kcp").addClass("btn-primary active");
						  $("button#protocol_tcp").removeClass("btn-primary active");
					}
					
	
		
			}
		
		else{
			console.log("本地未运行");
			check_gate_isbusy(gate_sn_org, cloud_url, auth_code );
		}
      },
      error:function(data){
          console.log(data);
      }
    });
}

function query_cloudproxy_status(proxy_item) {
    var cloud_proxy = {"proxy_stcp":proxy_item};
    // console.log(cloud_proxy);
    $.ajax({
      url: 'http://127.0.0.1:5000/cloudstatus',
      headers: {
              Accept: "application/json; charset=utf-8",
              Authorization: "Bearer 123123123"
              },
      type: 'post',
      contentType: "application/json; charset=utf-8",
      dataType:'json',
      //async:false,
      data: JSON.stringify(cloud_proxy),
      success:function(data){
        if(data){
              $.each(data,function(key,val){
                // console.log('键名是:'+key, '键值是:'+val);

                $('span#cloud_tunnel_name').html(val.name);
                $('span#this_start_time').html(val.last_start_time);
                $('span#last_Traffic_data').html(Math.round((Number(val.today_traffic_in)+Number(val.today_traffic_out))/1024) + "KB");

                if(Number(val.cur_conns)>0){
                    $('span#local_link_result').removeClass('text-danger');
                    $('span#local_link_result').addClass('text-success');
                    $('span#local_link_result').html("已连接");
                }
                else{
                    $('span#local_link_result').removeClass('text-success');
                    $('span#local_link_result').addClass('text-danger');
                    $('span#local_link_result').html("未连接");
                }

                if(val.status=="online"){
                    $('span#cloud_tunnel_status').removeClass('text-danger');
                    $('span#cloud_tunnel_status').addClass('text-success');
                    $('span#cloud_tunnel_status').html(val.status);
                }
                else{
                    $('span#cloud_tunnel_status').removeClass('text-success');
                    $('span#cloud_tunnel_status').addClass('text-danger');
                    $('span#cloud_tunnel_status').html(val.status);
                }
            });
        }
        else{

          $("div#cloud_ret_message").html("代理服务未查询到任何数据");

        }

      },
      error:function(data){
          $("div#cloud_ret_message").html("无法连接本地服务，请检查IOE隧道服务是否启动");
      }
    });
}


function check_ip_alive(ip) {
  postdata = {"ipaddr":ip}
   $.ajax({
      url: 'http://127.0.0.1:5000/ip_alive',
      headers: {
              Accept: "application/json; charset=utf-8",
              Authorization: "Bearer 123123123"
              },
      type: 'post',
      contentType: "application/json; charset=utf-8",
      dataType:'json',
      data: JSON.stringify(postdata),
      success:function(data){
        // console.log(data);
        //   console.log(data.message);
          if(data.message){
            // console.log("连接畅通");
            $("span#ping_devip_result").removeClass('text-danger')
            $("span#ping_devip_result").addClass('text-success')
            $("span#ping_devip_result").html("连接畅通");
          }
          else{
            // console.log("连接不通");
            $("span#ping_devip_result").removeClass('text-success')
            $("span#ping_devip_result").addClass('text-danger')
            $("span#ping_devip_result").html("连接不通");
          }

      },
      error:function(data){
          console.log(data);
      }
  });
}


function send_keep_alive() {
    // 发送心跳
       $.ajax({
        url: 'http://127.0.0.1:5000/keep_alive',
        headers: {
                Accept: "application/json; charset=utf-8",
                Authorization: "Bearer 123123123"
                },
        type: 'post',
        contentType: "application/json; charset=utf-8",
        dataType:'json',
        //async:false,
        data: "",
        success:function(data){
            // console.log(data);
        },
        error:function(data){
            console.log(data);
        }
      });
}

function start_local_vpn(postinfo) {
      $.ajax({
        url: 'http://127.0.0.1:5000/start',
        headers: {
                Authorization: "Bearer 123123123"
                },
        type: 'post',
        contentType: "application/json; charset=utf-8",
        dataType:'json',
        //async:false,
        data: JSON.stringify(postinfo),
        success:function(data){
				// console.log("周期检测执行结果");

				    var now = new Date();  
						exitTime = now.getTime() + 20000;
							if(!check_act_result_ret_has_start){
							  check_act_result_ret = setInterval(function(){
									check_act_result();;
							  },2000);
							  check_act_result_ret_has_start =true;
						  }
							
		    },

        error:function(data){
              $("#mes_table  tr:not(:first)").empty("");
              $("span#check_local_result").addClass('text-danger');
              $("span#check_local_result").html("无法连接本地服务，请检查freeioe_vpn_Service服务是否启动或者运行环境是否安装，如未安装，" + '<a href="/downloads/freeioe_vpn_green.rar"  class="navbar-link">点击下载</a>');
        }
      });

}



function stop_local_vpn() {
      $.ajax({
        url: 'http://127.0.0.1:5000/stop',
        headers: {
                Authorization: "Bearer 123123123"
                },
        type: 'post',
        contentType: "application/json; charset=utf-8",
        dataType:'json',
        //async:false,
        data: "",
        success:function(data){

			if(data.message){
					$("div#vpn_ret_message").removeClass("hide");
					var date = new Date();  
					var strDate = date.toLocaleString().replace(/[年月]/g,'-').replace(/[日上下午]/g,'');  
					$("div#vpn_ret_message").html(strDate+": 停止成功");
					check_local_status();
					query_cloudproxy_status(frpc_item);
					if(!check_local_status_has_start){
						check_local_status_has_start = true;
						check_local_status_ret = setInterval(function(){
						  check_local_status();
						},5000);						
					}			
			}
			else{
					$("div#vpn_ret_message").removeClass("hide");
					var date = new Date();  
					var strDate = date.toLocaleString().replace(/[年月]/g,'-').replace(/[日上下午]/g,'');  
					$("div#vpn_ret_message").html(strDate + ": 停止失败，VPN已经停止或其他原因");
			}
			


        },
        error:function(data){
            $("#mes_table  tr:not(:first)").empty("");
            $("span#check_local_result").addClass('text-danger');
            $("span#check_local_result").html("无法连接本地服务，请检查IOE隧道服务是否启动");
			$("div#vpn_ret_message").html("");
        }
      });

}


function check_gate_isbusy(sn, url, code) {
	    var postinfo = {
			"gate_sn": sn,
			"cloud_url": url,
			"auth_code": code,
		}
      $.ajax({
        url: 'http://127.0.0.1:5000/gate_isbusy',
        headers: {
                Authorization: "Bearer 123123123"
                },
        type: 'post',
        contentType: "application/json; charset=utf-8",
        dataType:'json',
        //async:false,
        data: JSON.stringify(postinfo),
        success:function(data){
				console.log(data);
				if(data.message==1){
					vpn_msg_html = "你准备操作的网关正在被其他用户使用！请关闭当前页面，稍候再试！";
					$("span.error_tips").html(vpn_msg_html);
					 $('#myModal').modal('show'); 		
				}
			
		    },

        error:function(data){
              $("#mes_table  tr:not(:first)").empty("");
              $("span#check_local_result").addClass('text-danger');
              $("span#check_local_result").html("无法连接本地服务，请检查freeioe_vpn_Service服务是否启动或者运行环境是否安装，如未安装，" + '<a href="/downloads/freeioe_vpn_green.rar"  class="navbar-link">点击下载</a>');
        }
      });

}


function check_gate_alive(sn, url, code) {
	    var postinfo = {
			"gate_sn": sn,
			"cloud_url": url,
			"auth_code": code,
		}
      $.ajax({
        url: 'http://127.0.0.1:5000/gate_alive',
        headers: {
                Authorization: "Bearer 123123123"
                },
        type: 'post',
        contentType: "application/json; charset=utf-8",
        dataType:'json',
        //async:false,
        data: JSON.stringify(postinfo),
        success:function(data){
				// console.log(data);
				if(data.message=="ONLINE"){
					$("span.gate_status_result").addClass("text-success");
					$("span.gate_status_result").removeClass("text-danger");
					$("span.gate_status_result").html(data.message);
					gate_status="ONLINE";
				}
				if(data.message=="OFFLINE"){
					$("span.gate_status_result").addClass("text-danger");
					$("span.gate_status_result").removeClass("text-success");
					$("span.gate_status_result").html(data.message);
					$(".tunnel_config").attr("disabled",true);
					$("button#start_vpn").attr("disabled",true);
					gate_status="OFFLINE";
					if(vpn_running){
						stop_local_vpn();
					}
					
				}				
		    },

        error:function(data){
              $("#mes_table  tr:not(:first)").empty("");
              $("span#check_local_result").addClass('text-danger');
              $("span#check_local_result").html("无法连接本地服务，请检查freeioe_vpn_Service服务是否启动或者运行环境是否安装，如未安装，" + '<a href="/downloads/freeioe_vpn_green.rar"  class="navbar-link">点击下载</a>');
        }
      });

}

function check_act_result() {
   $.ajax({
      url: 'http://127.0.0.1:5000/act_result',
      headers: {
              Accept: "application/json; charset=utf-8",
              Authorization: "Bearer 123123123"
              },
      type: 'get',
      contentType: "application/json; charset=utf-8",
      dataType:'json',
      success:function(data){
	  				var now = new Date(); 
					$("div#vpn_ret_message").removeClass("hide");
					var ret_mes='';
					var date = new Date();  
					var strDate = date.toLocaleString().replace(/[年月]/g,'-').replace(/[日上下午]/g,'');  
					if(data.cloud_mes){
						// console.log("cloud_mes:", data.cloud_mes);
						ret_mes = ret_mes + "平台返回消息： " + strDate + "  " + data.cloud_mes + '<br />';
						$("div#vpn_ret_message").html(ret_mes);
					}
					else{
						ret_mes = ret_mes + "平台返回消息： "+ strDate + "   空" + '<br />';
						$("div#vpn_ret_message").html(ret_mes);
					}
					if(data.gate_mes){
						// console.log("gate_mes:", data.gate_mes);
						ret_mes = ret_mes+ "网关返回消息： "  + strDate + "  " + data.gate_mes + '<br />';
						$("div#vpn_ret_message").html(ret_mes);
					}
					else{
						ret_mes = ret_mes+ "网关返回消息：" + strDate + "   空"  + '<br />';
						$("div#vpn_ret_message").html(ret_mes);					
					}
					
					if(data.vpn_mes){
					// console.log("vpn_mes:", data.vpn_mes);
						ret_mes = ret_mes + data.vpn_me + '<br />';
						$("div#vpn_ret_message").html(ret_mes);
					}
					if(data.services_mes){
						// console.log("vpn_mes:", data.services_mes);
						ret_mes = ret_mes + "本地返回消息： " + strDate + "  " + data.services_mes + '<br />';
						$("div#vpn_ret_message").html(ret_mes);

							exitTime = now.getTime() - 1;

					}
					// console.log(exitTime-now.getTime());
					if(now.getTime() > exitTime){
						// console.log("退出check_act_result");
						clearInterval(check_act_result_ret);
						check_act_result_ret_has_start=false;
						
						if(!check_local_status_has_start){
							check_local_status_has_start = true;
							check_local_status_ret = setInterval(function(){
							  check_local_status();
							},5000);						
						}

					}
		
		},
      error:function(data){
          console.log(data);
      }
  });
}

function one_key_repair() {
   $.ajax({
      url: 'http://127.0.0.1:5000/one_key_repair',
      headers: {
              Accept: "application/json; charset=utf-8",
              Authorization: "Bearer 123123123"
              },
      type: 'get',
      contentType: "application/json; charset=utf-8",
      dataType:'json',
      success:function(data){
		console.log(data);
		if(data.message){
			$("span#check_env_result").html("修复完成，重新检测运行环境……");
		}
		setTimeout("check_local_env()",5000);
		},
      error:function(data){
              $("#mes_table  tr:not(:first)").empty("");
              $("span#check_local_result").addClass('text-danger');
              $("span#check_local_result").html("无法连接本地服务，请检查freeioe_vpn_Service服务是否启动或者运行环境是否安装，如未安装，" + '<a href="/downloads/freeioe_vpn_green.rar"  class="navbar-link">点击下载</a>');
      }
  });
}

function stop_vpn_in_modal() {
      $("button#start_vpn").html("停止中……");
	  $("button#start_vpn").attr("disabled",true);
      clearInterval(check_local_status_ret);
	  check_local_status_has_start = false;
      $.ajax({
        url: 'http://127.0.0.1:5000/stop',
        headers: {
                Authorization: "Bearer 123123123"
                },
        type: 'post',
        contentType: "application/json; charset=utf-8",
        dataType:'json',
        //async:false,
        data: "",
        success:function(data){

			if(data.message){
					$("div#vpn_ret_message").removeClass("hide");
					var date = new Date();  
					var strDate = date.toLocaleString().replace(/[年月]/g,'-').replace(/[日上下午]/g,'');  
					$("div#vpn_ret_message").html(strDate+": 停止成功");
					check_local_status();
					query_cloudproxy_status(frpc_item);
					if(!check_local_status_has_start){
						check_local_status_has_start = true;
						check_local_status_ret = setInterval(function(){
						  check_local_status();
						},5000);						
					}			
			}
			else{
					$("div#vpn_ret_message").removeClass("hide");
					var date = new Date();  
					var strDate = date.toLocaleString().replace(/[年月]/g,'-').replace(/[日上下午]/g,'');  
					$("div#vpn_ret_message").html(strDate + ": 停止失败，VPN已经停止或其他原因");
			}
			
			location=location.href;


        },
        error:function(data){
            $("#mes_table  tr:not(:first)").empty("");
            $("span#check_local_result").addClass('text-danger');
            $("span#check_local_result").html("无法连接本地服务，请检查IOE隧道服务是否启动");
			$("div#vpn_ret_message").html("");
        }
      });
};


function closeWindows() {
		var userAgent = navigator.userAgent;
		if (userAgent.indexOf("Firefox") != -1
		|| userAgent.indexOf("Chrome") != -1) {
			close();
		} else {
				window.opener = "..";
				window.open("", "_self");
				window.close();
		}
};