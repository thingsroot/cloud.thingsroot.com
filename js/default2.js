/**
 * @file            default.js
 * @description     首页。
 * @author          dongsun Team ( http://www.dongsun.com/ )
 * @date            2018-03-08 dongsun
**/
$(function(){

    //获取当前时间
    function getBeforeDate(n){//n为你要传入的参数，当前为0，前一天为-1，后一天为1
        var date = new Date() ;
        var year,month,day ;
        date.setDate(date.getDate()+n);
        year = date.getFullYear();
        month = date.getMonth()+1;
        day = date.getDate() ;
        s = year + '-' + ( month < 10 ? ( '0' + month ) : month ) + '-' + ( day < 10 ? ( '0' + day ) : day) ;
        return s ;
    }
    var t = getBeforeDate(0);
    var t1 = getBeforeDate(-1);
    var t2 = getBeforeDate(-2);
    var t3 = getBeforeDate(-3);
    var t4 = getBeforeDate(-4);
    var t5 = getBeforeDate(-5);
    var t6 = getBeforeDate(-6);

	$(".right-product").css("height",$(document).height()-20);
	var pageSize = 7; // 每页条数
	
	// 故障统计里的 前十的网关/一周内故障最多
	Ajax.call('/api/method/iot_ui.iot_api.device_event_count_statistics', "", device_event_count_statistics, 'GET', 'JSON', 'FORM');
	setInterval(function(){
			Ajax.call('/api/method/iot_ui.iot_api.device_event_count_statistics', "", device_event_count_statistics, 'GET', 'JSON', 'FORM');
		}, 120000);
	function device_event_count_statistics(items){
		// console.log('device_event_count_statistics',items);
		localStorage.list_device_event_count_statistics_original = JSON.stringify(items.message);
		localStorage.list_current = JSON.stringify(items.message);
		$('#J_gateErrorTotal').html(items.message.length);
	}

    /**
    *	当天前10的网关
    */
    $.ajax({
        url:"/apis/api/method/iot_ui.iot_api.device_event_count_statistics",
        type:"GET",
        success:function (data) {
            var data = JSON.parse(localStorage.list_device_event_count_statistics_original);
            var html='';
            //创建新数组
            var arr1 = [];
            for (var i = 0; i < data.length; i++) {
                //判断次数与时间
                if(data[i].today != '0' && data[i].last_updated.indexOf(t) != -1){
                    arr1.push(data[i]);
                }
            }
            //渲染表格
            for(var j=0;j<arr1.length;j++){
                html += `
			    <tr class="myTr">
			        <td>${j+1}</td>
			        <td>${arr1[j].name}</td>
			        <td>${arr1[j].position}</td>
			        <td>${arr1[j].last_updated}</td>
			        <td>${arr1[j].today}</td>
			        <td>${arr1[j].sn}</td>
			    </tr>`;
            }

            $('#J_error_today').html(html);
            if($('#J_error_today').children().length == 0){
                $('#one>table').hide();
                $('#one>p').show();
            }
        },
		complete:function () {
        	var tr_len = $('#J_error_today>tr');
			for (var q=0;q<tr_len.length;q++){
				(function(j){
                    tr_len[j].onclick = function () {
                        location.href = 'device_message.html?sn=' + $(this).find($('td:nth-child(6)')).text()
                    };
                })(q)
			}
        }
    })

    /**
     *	一周内故障最多
     */
    $.ajax({
        url:"/apis/api/method/iot_ui.iot_api.device_event_count_statistics",
        type:"GET",
        success:function (data) {
            var data = JSON.parse(localStorage.list_device_event_count_statistics_original);
            var html1='';
            //创建新数组
            var arr2 = [];
            for (var i = 0; i < data.length; i++) {
                //判断次数与时间
                if( data[i].last_updated.indexOf(t) != -1
                    || data[i].last_updated.indexOf(t1) != -1
                    || data[i].last_updated.indexOf(t2) != -1
                    || data[i].last_updated.indexOf(t3) != -1
                    || data[i].last_updated.indexOf(t4) != -1
                    || data[i].last_updated.indexOf(t5) != -1
                    || data[i].last_updated.indexOf(t6) != -1){
                    if(data[i].total != '0'){
                        arr2.push(data[i]);
                    }
                }
            }
            console.log(arr2)
            //渲染表格
            for(var j=0;j<arr2.length;j++){
                html1 += `
			    <tr class="myTr">
			        <td>${j+1} <input type="hidden" value='${arr2[j].sn}'></td>
			        <td>${arr2[j].name}</td>
			        <td>${arr2[j].position}</td>
			        <td>${arr2[j].last_updated}</td>
			        <td>${arr2[j].total}</td>
			        <td>${arr2[j].sn}</td>
			    </tr>`;
            }
            $('#J_error_total').html(html1);
            if($('#J_error_total').children().length == 0){
                $('#two>table').hide();
                $('#two>p').show();
            }
        },
        complete:function () {
            var tr_len = $('#J_error_total>tr');
            for (var q=0;q<tr_len.length;q++){
                (function(j){
                    tr_len[j].onclick = function () {
                        location.href = 'device_message.html?sn=' + $(this).find($('td:nth-child(6)')).text()
                    };
                })(q)
            }
        }
    });




    function device_online_statistics(chart_id, tag_name) {
		// console.log(chart_id);
		var myChart = echarts.init(document.getElementById(chart_id), 'light');
		//var url = 'http://iot.symgrid.com/api/method/iot_ui.iot_api.device_status_statistics';
		var url = '/apis/api/method/iot_ui.iot_api.device_status_statistics';
		//$.get('assets/'+chart_id+'.json', function (json_data) {
		$.get(url, function (json_data) {
			//json_data = JSON.parse(json_data);
			if(!json_data.message || typeof json_data.message=='undinfed'){
				$('#'+chart_id).text('暂无数据');
				return false;
			}
			var data = json_data.message;
			//console.log(data);
			window.addEventListener("resize", function () {
                myChart.resize();
            });
			myChart.setOption(option = {
				title : {
					//text: '设备在线统计',
					subtext: tag_name,
				},
				tooltip: {
					trigger: 'axis'
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
					feature: {
						dataZoom: {
							yAxisIndex: 'none'
						},
						restore: {},
						saveAsImage: {}
					}
				},
				series: [{
					name: 'Online',
					type: 'line',
        			smooth: true,
					data: data.map(function (item) {
						return [new Date(item.time), item.online];
					}),
					lineStyle: {
						color: '#50a3ba'
					}
				},
				{
					name: 'Offline',
					type: 'line',
        			smooth: true,
					data: data.map(function (item) {
						return [new Date(item.time), item.offline];
					}),
					lineStyle: {
						color: '#eac736'
					}
				}]
			});
		});
	}

	function device_type_statistics(chart_id, tag_name) {
		var myChart = echarts.init(document.getElementById(chart_id), 'light');
		var url = 'http://iot.symgrid.com/api/method/iot_ui.iot_api.device_type_statistics';
		var url = '/apis/api/method/iot_ui.iot_api.device_type_statistics';
		//$.get('assets/' + chart_id + '.json', function (json_data) {
		$.get(url, function (json_data) {
			if(!json_data.message || typeof json_data.message=='undinfed'){
				$('#'+chart_id).text('暂无数据');
				return false;
			}
			//json_data = JSON.parse(json_data);
			var data = json_data.message;
			window.addEventListener("resize", function () {
                myChart.resize();
            });
			myChart.setOption(option = {
				title : {
					//text: '设备类型统计',
					subtext: tag_name,
					x:'center'
				},
				tooltip : {
					trigger: 'item',
					formatter: "{a} <br/>{b} : {c} ({d}%)"
				},
				legend: {
					orient: 'vertical',
					left: 'left',
					data: ['Q102','其他']
				},
				series : [
					{
						name: '设备类型',
						type: 'pie',
						radius : '55%',
						center: ['50%', '60%'],
						data:[
							{value:data['Q102'], name:'Q102'},
							{value:data['VBOX'], name:'其他'},
						],
						itemStyle: {
							emphasis: {
								shadowBlur: 10,
								shadowOffsetX: 0,
								shadowColor: 'rgba(0, 0, 0, 0.5)'
							}
						}
					}
				]
			});
		});
	}

	function device_event_type_statistics(chart_id, tag_name) {
		var myChart = echarts.init(document.getElementById(chart_id), 'light');
		var url = 'http://iot.symgrid.com/api/method/iot_ui.iot_api.device_event_type_statistics';
		var url = '/apis/api/method/iot_ui.iot_api.device_event_type_statistics';
		//$.get('assets/' + chart_id + '.json', function (json_data) {
		$.get(url, function (json_data) {
			if(!json_data.message || typeof json_data.message=='undinfed'){
				$('#'+chart_id).text('暂无数据');
				return false;
			}
			//json_data = JSON.parse(json_data);
			var data = json_data.message;
			myChart.setOption(option = {
				title : {
					//text: '事件类型统计'
				},
				tooltip : {
					trigger: 'axis',
					axisPointer : {            // 坐标轴指示器，坐标轴触发有效
						type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
					}
				},
				legend: {
					data:["系统", "设备", "通讯", "数据", "应用"]
				},
				grid: {
					left: '3%',
					right: '4%',
					bottom: '3%',
					containLabel: true
				},
				xAxis : [
					{
						type : 'category'
					}
				],
				yAxis : [
					{
						type : 'value'
					}
				],
				series : [
					{
						name:'系统',
						type:'bar',
						data: data.map(function (item) {
							return [new Date(item.time).toDateString(), item['系统']];
						})
					},
					{
						name:'设备',
						type:'bar',
						data: data.map(function (item) {
							return [new Date(item.time).toDateString(), item['设备']];
						})
					},
					{
						name:'通讯',
						type:'bar',
						data: data.map(function (item) {
							return [new Date(item.time).toDateString(), item['通讯']];
						})
					},
					{
						name:'数据',
						type:'bar',
						data: data.map(function (item) {
							return [new Date(item.time).toDateString(), item['数据']];
						})
					}
				]
			});
		});
	}

	// 图表
	device_online_statistics('device_status_statistics', '');
	device_type_statistics('device_type_statistics', 'device_type_statistics');
	device_event_type_statistics('device_event_type_statistics', 'device_event_type_statistics');
	setInterval(function(){
		device_online_statistics('device_status_statistics', '');
		device_type_statistics('device_type_statistics', 'device_type_statistics');
		device_event_type_statistics('device_event_type_statistics', 'device_event_type_statistics');
	}, 120000);
})




