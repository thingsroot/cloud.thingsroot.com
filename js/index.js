$(function(){
	/*左侧导航栏显示隐藏功能*/
	$(".left-main .sidebar-fold").click(function(){
		if($(this).parent().attr('class')=="left-main left-full"){
			$(this).find('img').css("transform","rotate(90deg)")
			$(this).parent().removeClass("left-full");
			$(this).parent().addClass("left-off");
			$(this).parent().parent().find(".right-product").removeClass("right-full");
			$(this).parent().parent().find(".right-product").addClass("right-off");
		}else{
			$(this).find('img').css("transform","rotate(0deg)")
			$(this).parent().removeClass("left-off");
			$(this).parent().addClass("left-full");
			$(this).parent().parent().find(".right-product").removeClass("right-off");
			$(this).parent().parent().find(".right-product").addClass("right-full");
		}
	});
	//	鼠标经过颜色变化
	$(".left-main .subNav").hover(function(){
	    $(this).find(".hover_img").css("display","inline");
	    $(this).find(".hd_img").css("display","none");
	},function(){
	    $(this).find(".hover_img").css("display","");
	    $(this).find(".hd_img").css("display","");
	});
	//首页头部展开收起
	$(".close-i").click(function(){
		if($(".contents").css("display")=='none'){
			$(".contents").slideDown(300);
			$(this).css({"background":"url(img/icon_close.png) no-repeat center","background-size":"15px"});
		}else{
			$(".contents").slideUp(300);
			$(this).css({"background":""});
		}
	})
	
	//首页内容显示隐藏	
	if(getCookie('index_block_1')=='hidden'){
		$(".product_main1").addClass('hidden');
		$('#s1').attr("checked",false);
	}
	if(getCookie('index_block_2')=='hidden'){
		$(".product_main2").addClass('hidden');
		$('#s2').attr("checked",false);
	}
	if(getCookie('index_block_3')=='hidden'){
		$(".product_main3").addClass('hidden');
		$('#s3').attr("checked",false);
	}
	if(getCookie('index_block_4')=='hidden'){
		$(".product_main4").addClass('hidden');
		$('#s4').attr("checked",false);
	}
	resetMarginLeft();
	
	$(".slider1,.slider2,.slider3,.slider4").click(function(){
		var _this = $(this);
		var index = _this.attr('val');
		if($('#s'+index).is(':checked')){
			$(".product_main"+index).hide().addClass('hidden bounceInLeft');
			setCookie('index_block_'+index,'hidden');
		}else{
			$(".product_main"+index).show().removeClass('hidden');
			setCookie('index_block_'+index,'display');
		}
		resetMarginLeft();
	});
	$('.product_main1 i,.product_main2 i,.product_main3 i,.product_main4 i').click(function(){
		var index = $(this).parent().parent().attr('val');
		setCookie('index_block_'+index,'hidden');
		$('.product_main'+index).hide().addClass('hidden');
		$(".slider"+index).click();
		resetMarginLeft();
	})	
	function resetMarginLeft() {
		$('.product_main').not('.hidden').each(function(index){
			if (index%2 == 0) {
				$(this).css('marginLeft', '0');
			} else {
				$(this).css('marginLeft', '1%');
			}
		});
	}
	//	展示第一个
	$('.J_tabs li:eq(0) a').tab('show');
	
//	折叠
	$(".collection_left p").each(function(){
		$(this).click(function(){
			if($(this).parent().find("ul") .css("display")=='none') {
				$(this).find("img").css("transform","rotate(180deg)");
				$(this).parent().find("ul").slideDown();
			}else{
				$(this).find("img").css("transform","rotate(0deg)");
				$(this).parent().find("ul").slideUp();
			}
		})
	});
	
//	更多按钮
	$(".main_content .bottom .more").on("click",function(){
		if($(this).parent().find(".more_content").hasClass("hd")){
			$(this).parent().find(".more_content").removeClass("hd")
		}else{
			$(this).parent().find(".more_content").addClass("hd")
		}
	});
//	应用li点击
	$(".collection_left li").on("click",function(){
		$(this).addClass("color");
		$(this).siblings().removeClass("color");
	});
//	点击旁边更多消失
// 	$(document).on("click",function(){
// 		$(".more_content").addClass("hd");
// 	});
// 	$(".btn-group ul,.btn-group").on("click",function(e){
// 		e.stopPropagation();
// 	});
// 	$(".rightHeight").css("min-height",$(".right-full").height()-30);
})
