
  cloud_url = "http://iot.symgrid.com";
  auth_code = getParam('authcode');
  gate_sn_org  = getParam('gate_sn');
    gate_sn = "";
  gate_status ="ONLINE";
  // gate_isbusy = false;
  vpn_running = "";
  check_local_status_ret = "";
  check_local_status_has_start = "";
  check_cloud_status_ret = "";
  check_act_result_ret ="";
  check_act_result_ret_has_start = "";
  exitTime = "";
  link_mode = "virtual_network";
  net_mode = "bridge";
  bind_port = "665";
  net_protocol = "tcp";
  frpc_item = "";

$(document).ready(function(){
	if(gate_sn_org){
		$("input#gatesn").val(gate_sn_org);
	}
	if(auth_code){
		$("input#authcode").val(auth_code);
	}
	gate_sn  = $("input#gatesn").val();
	auth_code = $("input#authcode").val();
	console.log("gate_sn:",gate_sn, "auth_code:",auth_code)
	frpc_item = gate_sn + "_" + net_mode;
	
	check_tunnel_mode();
	check_local_status();
	check_gate_alive(gate_sn, cloud_url, auth_code);
	var t1 = setTimeout("query_cloudproxy_status(frpc_item)",3000);
	var t2 = setTimeout("check_local_env()",2000);

	check_local_status_ret = setInterval(function(){
	  check_local_status();
	  },5000);
	  
	setInterval(function(){	  check_gate_alive(gate_sn, cloud_url, auth_code);	  },5000);

	check_local_status_has_start = true;
	check_cloud_status_ret = setInterval(function(){
		query_cloudproxy_status(frpc_item);
	  },20000);



// 本地查询按钮------开始
  $("button#query").click(function(){
      check_local_status();
  });
// 本地查询按钮------结束

// 选择按钮--VPN启动-----开始
  $("button#start_vpn").click(function(){
    if($("button#start_vpn").html()=="启动VPN"){
      gate_sn  = $("input#gatesn").val();
      frpc_item = gate_sn + "_" + net_mode;
      auth_code = $("input#authcode").val();
      // console.log(gate_sn);
      $("#mes_table  tr:not(:first)").empty("");
      var html_wait = '<tr class="success"><td>正在加载数据</td><td></td><td></td></tr>';
      $("#mes_table").append(html_wait);


      var tap_ip  = $("input#tap_ip").val();
      var tap_netmask  = $("input#tap_netmask").val();
      var dev_ip = $("input#dev_ip").val();

      var vpn_frpc_cfg = {
                        "role": "visitor",
                        "type": "stcp",
                        "server_name": gate_sn + "_" + net_mode,
                        "sk": "password",
                        "bind_addr": "127.0.0.1",
                        "bind_port": bind_port,
                        "use_encryption": "false",
                        "use_compression": "true"
                      }
      var gate_visitor_frpc_cfg = {
                  "type": "stcp",
                  "sk": "password",
                  "local_ip": "127.0.0.1",
                  "local_port": bind_port,
                  "use_encryption": "false",
                  "use_compression": "true"
                }
      var gate_frpc_cfg = {"visitors": {}}
      gate_frpc_cfg["visitors"][net_mode] = gate_visitor_frpc_cfg

      var postinfo = {
        "gate_sn": gate_sn,
        "cloud_url": cloud_url,
        "auth_code": auth_code,
        "vpn_cfg" : {
          "net_mode" : net_mode,
          "tap_ip" : tap_ip,
          "tap_netmask" : tap_netmask,
          "dev_ip" : dev_ip
        },
        "common":{
            "admin_addr":"127.0.0.1",
            "admin_port":"7402",
            "server_addr":"hs.symgrid.com",
            "server_port":"54433",
            "token":"BWYJVj2HYhVtdGZL",
            "protocol":net_protocol,
            "login_fail_exit":"false"
          },

        "gate_frpc_cfg": gate_frpc_cfg,
        "local_frp_cfg" : {
            "proxycfg":{ }

            },

          }

      postinfo["local_frp_cfg"]["proxycfg"][frpc_item]=vpn_frpc_cfg;
      // console.log(postinfo);
      $("button#start_vpn").html("启动中……");
      $("button#start_vpn").attr("disabled",true);
	  $(".tunnel_config").attr("disabled",true)
	  clearInterval(check_local_status_ret);

	  check_local_status_has_start = false;
      start_local_vpn(postinfo);
      query_cloudproxy_status(frpc_item);


    }
    else{

      $("#mes_table  tr:not(:first)").empty("");
      var html_wait = '<tr class="success"><td>正在加载数据</td><td></td><td></td></tr>';
      $("#mes_table").append(html_wait);
      $("button#start_vpn").html("停止中……");
	  $("button#start_vpn").attr("disabled",true);
      console.log("停止中……")
      clearInterval(check_local_status_ret);
	  check_local_status_has_start = false;
		stop_local_vpn();


    }


});
// 选择按钮--VPN启动-----结束

// 一键修复按钮
	$("body").on("click", "a.one_key_repair", function(){
		one_key_repair();
    } );
// 一键修复按钮


// 测试按钮
    $("button#mytest").click(function(){
      // var dev_ip = $("input#dev_ip").val();
      // check_act_result();
		// check_gate_alive(gate_sn, cloud_url, auth_code);
		// one_key_repair();
		
		
    });
// 测试按钮

// 选择按钮--云端状态-----开始
  $("button#cloud").click(function(){
      query_cloudproxy_status(frpc_item);
});
// 选择按钮--云端状态-----结束


// 选择按钮--本地环境-----开始
  $("button#check_env").click(function(){
    check_local_env();

});
// 选择按钮--本地环境-----结束

// 选择按钮--网络模式-----开始
    $("button#bridge").click(function(){
      net_mode = "bridge";
      bind_port = "665";
      frpc_item = gate_sn + "_" + net_mode;
      // console.log(net_mode);
      $("input#tap_ip").val("192.168.0.33");
      $("span#vn_ipaddr").html("虚拟网卡IP:");
      $("span#vn_netmask").html("虚拟网卡netmask:");
      $("button#bridge").addClass("btn-primary active");
      $("button#router").removeClass("btn-primary active");
    });


    $("button#router").click(function(){
      net_mode="router";
      bind_port = "666";
      frpc_item = gate_sn + "_" + net_mode;
      // console.log(net_mode);
      $("input#tap_ip").val("192.168.0.0");
      $("span#vn_ipaddr").html("现场子网地址:");
      $("span#vn_netmask").html("现场子网netmask:");
      $("button#bridge").removeClass("btn-primary active");
      $("button#router").addClass("btn-primary active");
    });
// 选择按钮--网络模式-----结束

// 选择按钮--协议-----开始
    $("button#protocol_tcp").click(function(){
      net_protocol="tcp";
      // console.log(net_protocol);
      $("button#protocol_tcp").addClass("btn-primary active");
      $("button#protocol_kcp").removeClass("btn-primary active");
    });

    $("button#protocol_kcp").click(function(){
      net_protocol="kcp";
      // console.log(net_protocol);
      $("button#protocol_tcp").removeClass("btn-primary active");
      $("button#protocol_kcp").addClass("btn-primary active");
    });
// 选择按钮--协议-----结束

// 选择按钮--连接模式-----开始
    $("button#virtual_network").click(function(){
      link_mode="virtual_network";
      frpc_item = gate_sn + "_" + net_mode;
      // console.log(link_mode);
      $("div#v_network").removeClass("hide");
      $("div#v_serial").addClass("hide");
      $("button#virtual_network").addClass("btn-primary active");
      $("button#virtual_serial").removeClass("btn-primary active");
    });

    $("button#virtual_serial").click(function(){
      link_mode="virtual_serial";
      frpc_item = gate_sn + "_" + link_mode;
      // console.log(link_mode);
      $("div#v_network").addClass("hide");
      $("div#v_serial").removeClass("hide");
      $("button#virtual_network").removeClass("btn-primary active");
      $("button#virtual_serial").addClass("btn-primary active");

      if($("button#start_serial").html()==""){
          $("button#start_serial").addClass("btn-primary");
          $("button#start_serial").removeClass("btn-danger");
          $("button#start_serial").html("启动串口");
      }

      $("button#start_serial").removeClass("hide");
    });
// 选择按钮--连接模式-----结束


// 关闭页面按钮-----开始
    $("button.close_page").click(function(){
			console.log("@@@@@@@@@@@@@@@@@@")
			closeWindows();
    });
// 关闭页面按钮-----结束
});
