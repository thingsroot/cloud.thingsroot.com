/**
 * @file            common.js
 * @description     公共函数。
 * @author          dongsun Team ( http://www.dongsun.com/ )
 * @date            2018-03-08 dongsun
**/

/* 排除 transport.js和jquery的冲突 */
$(function() {
	window.__Object_toJSONString = Object.prototype.toJSONString;
	delete Object.prototype.toJSONString;
});

/**
 *	获取url里的文件名
**/
function getHtmlDocName() {
    var str = window.location.href;
    str = str.substring(str.lastIndexOf("/") + 1);
    str = str.substring(0, str.lastIndexOf("."));
    return str;
}
/**
 *	获取url里的某个参数值
**/
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
function getUrlParam(param){
    //获取当前URL
    var local_url = document.location.href; 
    //获取要取得的get参数位置
    var get = local_url.indexOf(param +"=");
    if(get == -1){
        return false;   
    }   
    //截取字符串
    var get_par = local_url.slice(param.length + get + 1);    
    //判断截取后的字符串是否还有其他get参数
    var nextPar = get_par.indexOf("&");
    if(nextPar != -1){
        get_par = get_par.slice(0, nextPar);
    }
    return get_par;
}

// 改写alert,使用layer插件 icon 1对2×3？4锁5哭
//function alert(content,icon){
//	alt(content,icon);
//}
function alt(content,icon){
	if(icon=="undefined" && icon==''){
		icon = 1;
	}
	layui.use('layer', function(){
		layui.layer.msg(content,{
			icon: icon,
			time: 1500,
		});
	});
}
// 公告右下角提醒
function adalt(title,content,icon){
	layui.use('layer', function(){
		var index = layui.layer.open({
		  type: 1
		  ,area:'auto'
		  ,title: "任务通知栏" //不显示标题栏
		  ,offset: 'rb'
		  ,content: '<div style="padding: 8px 40px;">'+title+'</div><div style="padding: 20px 40px;">'+content+'</div>'
		  //,btn: '关闭全部'
		  ,btnAlign: 'r' //按钮居中
		  ,shade: 0 //不显示遮罩
		  ,yes: function(){
		    layui.layer.closeAll();
		  }
		});
		setTimeout(function(){
			// console.log('lay',index);
			layer.close(index);
		}, 15000);
	});
	
}

// 错误提示
function err(content){
	layui.use('layer', function(){
		layui.layer.msg(content,{
			icon: 5,
			time: 1500,
		});
	});
}
function loading(icon) {
	var index;
	if(icon==''){
		icon = 0;
	}
	layui.use('layer', function(){
		index = layui.layer.load(icon, {shade: false});//0代表加载的风格，支持0-2
	});
	return index;
}



/* *
* 对返回的HTTP响应结果进行过滤。
*
* @public
* @params   {mix}   result   xhr.responseText
* @return  返回过滤后的结果
* @type string
*/
function errorMsg(result,err_message){
	var result = JSON.parse(result);
	err_message = (err_message)?err_message:"error";
	if(result && typeof result.message !== 'undefined') {
		return result.message;
	}else if (result._server_messages) {
		var msg = ($.map(JSON.parse(result._server_messages || '[]'), function(v) {						
			try {
				return JSON.parse(v).message;
			} catch (e) {
				return v;
			}
		}) || []).join(',') || err_message;

		// console.log('msg',msg);
		return msg;
	}else{
		return err_message;
	}
}

//alt(21,1);
/**
 *	获取cookie
**/
function getCookie(name){
	value = $.cookie('DS_'+name);
	if(value!=null) {
		value = decodeURI(value, "utf-8");
	}
	return value;
}
/**
 *	设置或删除cookie ， value==null时删除
**/
function setCookie(name,value){
	if(value==null){
		$.cookie('DS_'+name, '', { expires: -1, path: "/"}); // 删除
		return;
	}
	value = encodeURI(value, "utf-8");
	return $.cookie('DS_'+name,value, { expires: 7, path: "/"});
}
/**
 *	删除cookie
**/
function delCookie(name,value){
	return $.cookie('DS_'+name, '', { expires: -1, path: "/"}); // 删除
}
// 跳转
function redirect(url){
	window.location.href=url;
}

// 判断键值是否在数组中
function in_array(stringToSearch, arrayToSearch) {
     for (s = 0; s < arrayToSearch.length; s++) {
      thisEntry = arrayToSearch[s].toString();
      if (thisEntry == stringToSearch) {
       return true;
      }
     }
     return false;
}

// 函数将查询字符串解析到变量中 	parse_str 反向函数
function parse_url(){
	url = location.search.substr(1);
	var querys = url
    .substring(url.indexOf('?') + 1)
    .split('&')
    .map((query) => query.split('='))
    .reduce((params, pairs) => (params[pairs[0]] = pairs[1] || '', params), {});
	return querys;
}
// 函数将查询字符串解析到变量中 	parse_url 反向函数
function parse_str(obj) { 
	var ret = []; 
	for(var key in obj){ 
		key = encodeURIComponent(key); 
		var values = obj[key]; 
		if(values && values.constructor == Array){//数组 
			var queryValues = []; 
			for (var i = 0, len = values.length, value; i < len; i++) { 
				value = values[i]; 
				queryValues.push(toQueryPair(key, value)); 
			} 
			ret = ret.concat(queryValues); 
		}else{ //字符串 
			ret.push(toQueryPair(key, values)); 
		} 
	} 
	return ret.join('&'); 
} 
function toQueryPair(key, value) { 
	if (typeof value == 'undefined'){ 
		return key; 
	} 
	return key + '=' + encodeURIComponent(value === null ? '' : String(value)); 
}

Date.prototype.format = function(fmt) { 
     var o = { 
        "M+" : this.getMonth()+1,                 //月份 
        "d+" : this.getDate(),                    //日 
        "h+" : this.getHours(),                   //小时 
        "m+" : this.getMinutes(),                 //分 
        "s+" : this.getSeconds(),                 //秒 
        "q+" : Math.floor((this.getMonth()+3)/3), //季度 
        "S"  : this.getMilliseconds()             //毫秒 
    }; 
    if(/(y+)/.test(fmt)) {
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
    }
     for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
             fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
         }
     }
    return fmt; 
} 
Array.prototype.remove=function(dx)
{
	if(isNaN(dx)||dx>this.length){return false;}
	for(var i=0,n=0;i<this.length;i++)
	{
		if(this[i]!=this[dx])
		{
			this[n++]=this[i]
		}
	}
	this.length-=1
}
function getCookies(cookiename) {
	var result;
	var mycookie = document.cookie;
	var start2 = mycookie.indexOf(cookiename + "=");
	if (start2 > -1) {
	start = mycookie.indexOf("=", start2) + 1;
	var end = mycookie.indexOf(";", start);

	if (end == -1) {
	end = mycookie.length;
	}

	result = unescape(mycookie.substring(start, end));
	}

	return result;
}

function left(len,content){
	if(!content) return false;
	if(content.length>len){
		content = content.substring(0,len)+'...';
	}
	return content;
}