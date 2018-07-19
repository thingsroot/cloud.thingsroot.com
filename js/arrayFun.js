/**
 * @file            arrayFun.js
 * @description     数组操作。
 * @author          dongsun 李家兵 ( http://www.dongsun.com/ )
 * @date            2018-03-08 dongsun
**/

/*
*	数组排序
*/
/*
var items = [
    {name:"linc",age:28,num:1234},
    {name:"linc",age:28,num:12345},
    {name:"kiki",age:20,num:12345},
];
items1 = arrSort(items,{"age": "asc"});
console.log(items1);
*/
// 功能函数，不直接调用
function _sortByProps(item1, item2, obj) {
	var props = [];
	if(obj){
	    props.push(obj)
	}
	var cps = []; // 存储排序属性比较结果。
	// 如果未指定排序属性(即obj不存在)，则按照全属性升序排序。
	// 记录下两个排序项按照各个排序属性进行比较得到的结果    
	var asc = true;
	if (props.length < 1) {
	    for (var p in item1) {
	        if (item1[p] > item2[p]) {
	            cps.push(1);
	            break; // 大于时跳出循环。
	        } else if (item1[p] === item2[p]) {
	            cps.push(0);
	        } else {
	            cps.push(-1);
	            break; // 小于时跳出循环。
	        }
	    }
	} 
	else {
	    for (var i = 0; i < props.length; i++) {
	        var prop = props[i];
	        for (var o in prop) {
	            asc = prop[o] === "asc";
	            if (item1[o] > item2[o]) {
	                cps.push(asc ? 1 : -1);
	                break; // 大于时跳出循环。
	            } else if (item1[o] === item2[o]) {
	                cps.push(0);
	            } else {
	                cps.push(asc ? -1 : 1);
	                break; // 小于时跳出循环。
	            }
	        }
	    }
	}
	// 根据各排序属性比较结果综合判断得出两个比较项的最终大小关系
    for (var j = 0; j < cps.length; j++) {
        if (cps[j] === 1 || cps[j] === -1) {
            return cps[j];
        }
    }
    return false;
};
/**
*	数组排序
*	@items	array	数组
*	@propOrders	json obj	排序方法	{"name": "desc","age": "asc",......}
*/ 
function arrSort(items,propOrders) {
    items.sort(function (a, b) {
        return _sortByProps(a, b, propOrders);
    });
    //console.log(items);
    return items;
}


/**
*	数组搜索过滤
*	@items	array	数组
*	@filter	json obj	过滤规则	['cn','en','字段名称']
*/ 
/*var items = [
    {id: "1", en: "aa", cn: "dd", code: "93"},
    {id: "2", en: "bb", cn: "ee", code: "964"},        
    {id: "3", en: "cc", cn: "ff", code: "974"}
];
search_array(items,'Afg',['cn','en']);
*/
function search_array(items, keyWord, filter) {
    var result = [];
    if (!(filter instanceof Array) && !(typeof filter)){
	    return result;
    }
    if (typeof filter  === 'string') filter = [filter];
    items.forEach( (item, index) => {
        for (var key of filter){
            if (item[key].includes(keyWord)) {
                if (result.indexOf(item) == -1) {
                    result.push(item);
                }
            }
        }
    })
    //console.log(result);
    return result;
}