/**
 * @file            mine.js
 * @description     设备频道。
 * @author          dongsun Team ( http://www.dongsun.com/ )
 * @date            2018-03-08 dongsun
**/
$(function(){
	//测试数据
	var items = [
	    {name:"linc",age:21,time:"2018/6/19 10:41:20 12"},
	    {name:"linc",age:28,time:"2018/6/19 10:40:55 12"},
	    {name:"linc",age:20,time:"2018/6/19 10:41:10 22"},
	    {name:"aaaa",age:26,time:"2018/6/19 10:40:52"},
	    {name:"bbbb",age:27,time:"2018/6/19 10:40:52"},
	    {name:"cccc",age:26,time:"2018/6/19 10:40:52"},
	    {name:"dddd",age:29,time:"2018/6/19 10:40:52"},
	    {name:"bbbb",age:30,time:"2018/6/19 10:40:52"}
	    //{name:"linc",age:21,time:"775830"},
	    //{name:"linc",age:28,time:"780340"},
	    //{name:"linc",age:20,time:"767650"},
	    //{name:"aaaa",age:26,time:"812660"},
	    //{name:"bbbb",age:27,time:"815720"},
	    //{name:"cccc",age:26,time:"815720"},
	    //{name:"dddd",age:29,time:"815720"},
	    //{name:"bbbb",age:30,time:"815720"}
	    //{name:"linc",age:21,time:775830},
	    //{name:"linc",age:28,time:780340},
	    //{name:"linc",age:20,time:767650},
	    //{name:"aaaa",age:26,time:812660},
	    //{name:"bbbb",age:27,time:815720},
	    //{name:"cccc",age:26,time:815720},
	    //{name:"dddd",age:29,time:815720},
	    //{name:"bbbb",age:30,time:815720}
	];

                
    function test(propOrders) {
        items.sort(function (a, b) {
            return SortByProps(a, b, propOrders);
        });
        $.each(items,function(i,v){
	        console.log(v.name,v.age,v.time);
        })
        console.log(items);
    }
    
    function testAsc() {
	    var sort = {"name":'',"age":'',"time":''};
	    sort['time'] = 'desc';
	    //sort['name'] = 'asc';
	    //sort['age'] = 'desc';
        console.log(sort);
	    test(sort);
        //test({ "name": "asc", "time": "desc" });
    }
    
    function testDesc() {
        test({ "name": "desc", "age": "desc" });
    }
    
	testAsc();
	////两个字段一升一降排序
	//(function asc_desc(){
	//    items.sort(function (a, b) {
	//        return SortByProps(a, b, { "name": "asc", "age": "desc" });
	//    });
	//    console.log(items)
	//})();
	////两个字段都降序排序，其他排序方向同理，也可再加字段
	//(function desc(){
	//    items.sort(function (a, b) {
	//        return SortByProps(a, b, { "name": "desc", "age": "desc" });
	//    });
	//    console.log(items)
	//})();
	////不定义排序方向和字段，默认都升序排列
	//(function asc(){
	//    items.sort(function (a, b) {
	//        return SortByProps(a, b);
	//    });
	//    console.log(items)
	//})();

	//以下函数排序属性并未写死，可直接拿去用自定义属性
	function SortByProps(item1, item2, obj) {
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
	}

})
