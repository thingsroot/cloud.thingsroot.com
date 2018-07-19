/**
 * @file            default.js
 * @description     首页。
 * @author          dongsun Team ( http://www.dongsun.com/ )
 * @date            2018-03-08 dongsun
**/
$(function(){
	$(".right-product").css("height",$(document).height()-20);
	var pageSize = 7; // 每页条数
	
	// 故障统计里的 前十的网关/一周内故障最多
	Ajax.call('/api/method/iot_ui.iot_api.device_event_count_statistics', "", device_event_count_statistics, 'GET', 'JSON', 'FORM');
	setInterval(function(){
			Ajax.call('/api/method/iot_ui.iot_api.device_event_count_statistics', "", device_event_count_statistics, 'GET', 'JSON', 'FORM');
		}, 120000);
	function device_event_count_statistics(items){
		console.log('device_event_count_statistics',items);
		localStorage.list_device_event_count_statistics_original = JSON.stringify(items.message);
		localStorage.list_current = JSON.stringify(items.message);
		display_error('today',1);
		display_error('total',1);
		$('#J_gateErrorTotal').html(items.message.length);
	}

    /**
    *	按页码显示内容列表
    *	page_num	页码
    */ 
	function display_error(type,page_num){
		var data = JSON.parse(localStorage.list_device_event_count_statistics_original);
		var sort=new Array();
		sort[type] = 'desc';
		data = arrSort(data,sort);
		//data = pagination(page_num,pageSize,data);
		var html='';
		var html1='';
		var arrLen = data.length;
		for (var i = 0; i < arrLen; i++) {
			if(type=='today'){
				var count = data[i].today;
			}else if(type=='total'){
				var count = data[i].total;
			}
			var index = ((page_num-1)*pageSize)+i;
			html += `
			    <tr>
			        <td>${i+1}</td>
			        <td>${data[i].name}</td>
			        <td>${data[i].position}</td>
			        <td>${data[i].last_updated}</td>
			        <td>${count}</td>
			    </tr>`;
	    }
	    $('#J_error_'+type).html(html);	    
	}

	function device_online_statistics(chart_id, tag_name) {
		console.log(chart_id);
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
