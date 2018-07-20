/**
 * @file            collection.js
 * @description     单个网关管理。
 * @author          dongsun Team ( http://www.dongsun.com/ )
 * @date            2018-03-08 dongsun
**/	
$(function(){
	var pageSize = 4; // 每页条数
	var device_sn = getParam('device_sn');// 以当前网关id身份进入应用中心
    var app_inst = getParam('app_inst');
    var version = getParam('version');
    var cur_app = getParam('app');
    var editor_worksapce_version; // 编辑区版本号
    var get_latest_version; // 获取应用最新的版本号
    
	var device_info = JSON.parse(localStorage.getItem('device_detail_'+device_sn));

	$(".J_gate_name a").text(decodeURI(device_info.basic.name));
	$(".J_current_inst").html(app_inst);
	$("#J_current_inst").val(app_inst);

	var editorMode = {
		'txt': 'text',
		'md': 'markdown',
		'htaccess': 'text',
		'log': 'text',
		'js': 'javascript',
		'py': 'python',
		'c': 'c_cpp',
		'cpp': 'c_cpp',
		'cxx': 'c_cpp',
		'h': 'c_cpp',
		'hpp': 'c_cpp',
	};
    var code_editor = ace.edit("editor_code");
    code_editor.setTheme("ace/theme/tomorrow");
    code_editor.session.setMode("ace/mode/lua");
    code_editor.setFontSize(16);
    code_editor.setOptions({
		enableBasicAutocompletion: true,
		enableSnippets: true,
		enableLiveAutocompletion: true
	});
    var local_storage_prefix = cur_app + "_saved_file:";
    var doc_list = {};
    
	var editor_codeIng = $('.debug_top p');
	
	var editor_title_item = $('.debug_top p').on('click', function() {
		$(this).removeClass('active');
	});
	code_editor.on("change", function(e) {
		var session = code_editor.getSession();
		session.changed = true;
		editor_codeIng.html('<b>' + session.name + " ***" + '</b>');
		editor_codeIng.removeClass('modified').addClass('modified');
		$('.debug_top .upload').removeClass('off');
		$('.debug_top .save').removeClass('off');
	});
	code_editor.on("blur", function() {
		var session = code_editor.getSession();
		if (session.changed) {
			code_editor.execCommand('save', {});
		}
	});
	code_editor.on("changeSession", function(e) {
		var session = code_editor.getSession();
		var title = session.name;
		editor_codeIng.removeClass('modified');
		if (session.changed) {
			title = title + ' *';
			editor_codeIng.addClass('modified');
		}
		editor_codeIng.html('<b>' + title + '</b>');
		if (session.changed) {
			$('.debug_top .upload').removeClass('off');
			$('.debug_top .save').removeClass('off');
		} else {
			$('.debug_top .save').addClass('off');
		}
	});

	var commands = code_editor.commands;
	commands.addCommand({
		name: "save",
		bindKey: {win: "Ctrl-S", mac: "Command-S"},
		exec: function(arg) {
			var session = code_editor.session;
			var name = session.name;
			localStorage.setItem(
				local_storage_prefix + name,
				session.getValue()
			);
			session.changed = true;
			editor_codeIng.removeClass('modified').addClass('modified');
			editor_codeIng.html('<b>' + session.name + " *" + '</b>');
			$('.debug_top .save').addClass('off');
			//code_editor.cmdLine.setValue("saved "+ name);
		}
	});
	commands.addCommand({
		name: "load",
		bindKey: {win: "Ctrl-O", mac: "Command-O"},
		exec: function(arg) {
			var session = code_editor.session;
			var name = session.name;
			var value = localStorage.getItem(local_storage_prefix + name);
			if (typeof value == "string") {
				session.setValue(value);
				//code_editor.cmdLine.setValue("loaded "+ name);
			} else {
				//code_editor.cmdLine.setValue("no previuos value saved for "+ name);
			}
		}
	});
	var editor_switch_document = function(doc_name, data) {
		var mode = editorMode[data.type];
		if (!mode) {
			mode = data.type;
		}
		var s = doc_list[doc_name];
		if (!s) {
			var name = doc_name;
			var value = localStorage.getItem(local_storage_prefix + name);
			if (typeof value == "string") {
				s = ace.createEditSession(value, "ace/mode/" + mode);
				s.changed = true;
				//code_editor.cmdLine.setValue("loaded "+ name);
			} else {
				s = ace.createEditSession(data.content, "ace/mode/" + mode);
			}
			s.name = name;
			doc_list[name] = s;
		}
		code_editor.setSession(s, 1);
		code_editor.focus();
	};
	var editor_rename_document = function(doc_name, data) {
		if (doc_name == data.id)
			return;
		var session = doc_list[doc_name];
		if (session) {
			session.name = data.id;
			doc_list[data.id] = session;
			doc_list[doc_name] = null;
			//var type = selected_file.split('.').pop();
			var mode = editorMode[data.type];
			if (!mode) {
				mode = data.type;
			}
			session.setMode("ace/mode/" + mode);
		}
		var value = localStorage.getItem(local_storage_prefix + doc_name);
		if (typeof value == 'string') {
			localStorage.setItem(local_storage_prefix + data.id);
			localStorage.removeItem(local_storage_prefix + doc_name);
		}
	};
	
	var get_file_content = function(doc_name) {
		var backend_url = '/api/method/app_center.editor.editor?app=' + cur_app;
		Ajax.call(backend_url+'&operation=get_content&id=' + doc_name, '', get_content, 'GET', 'JSON', 'FORM');
		function get_content(d){
			if(d && typeof d.type !== 'undefined') {
				$('#editor_data .content').hide();
				switch(d.type) {
					case 'text':
					case 'txt':
					case 'md':
					case 'htaccess':
					case 'log':
					case 'sql':
					case 'php':
					case 'js':
					case 'json':
					case 'css':
					case 'html':
					case 'lua':
					case 'py':
					case 'c':
					case 'cpp':
					case 'cxx':
					case 'h':
					case 'hpp':
						$('#editor_data .code').show();
						editor_switch_document(doc_name, d);
						break;
					case 'png':
					case 'jpg':
					case 'jpeg':
					case 'bmp':
					case 'gif':
						$('#editor_data .image img')
							.one('load', function () {
								$(this).css({
									'marginTop':'-' + $(this).height()/2 + 'px',
									'marginLeft':'-' + $(this).width()/2 + 'px'
								});
							})
							.attr('src',d.content)
						;
						$('#editor_data .image').show();
						break;
					default:
						$('#editor_data .default').html(d.content).show();
						break;
				}
			}
		}
	};
	
	var backend_url = API_HOST+'/api/method/app_center.editor.editor?&app=' + cur_app;
	$('#jstree_tree').jstree({
		'core' : {
			'data' : {
				'url' : backend_url,
				'data' : function (node) {
					return { 'operation': 'get_node', 'id' : node.id };
				}
			},
			'check_callback' : function(o, n, p, i, m) {
				if(m && m.dnd && m.pos !== 'i') { return false; }
				if(o === "move_node" || o === "copy_node") {
					if(this.get_node(n).parent === this.get_node(p).id) { return false; }
				}
				return true;
			},
			'themes' : {
				'responsive' : false,
				'variant' : 'small',
				'stripes' : true
			}
		},
		'sort' : function(a, b) {
			return this.get_type(a) === this.get_type(b) ? (this.get_text(a) > this.get_text(b) ? 1 : -1) : (this.get_type(a) >= this.get_type(b) ? 1 : -1);
		},
		'contextmenu' : {
			'items' : function(node) {
				var tmp = $.jstree.defaults.contextmenu.items();
				delete tmp.create.action;
				tmp.create.label = "New";
				tmp.create.submenu = {
					"create_folder" : {
						"separator_after"	: true,
						"label"				: "Folder",
						"action"			: function (data) {
							var inst = $.jstree.reference(data.reference),
								obj = inst.get_node(data.reference);
							inst.create_node(obj, { type : "default" }, "last", function (new_node) {
								setTimeout(function () { inst.edit(new_node); },0);
							});
						}
					},
					"create_file" : {
						"label"				: "File",
						"action"			: function (data) {
							var inst = $.jstree.reference(data.reference),
								obj = inst.get_node(data.reference);
							inst.create_node(obj, { type : "file" }, "last", function (new_node) {
								setTimeout(function () { inst.edit(new_node); },0);
							});
						}
					}
				};
				if(this.get_type(node) === "file") {
					delete tmp.create;
				}
				//console.log(tmp);
				return tmp;
			}
		},
		'types' : {
			'default' : { 'icon' : 'folder' },
			'file' : { 'valid_children' : [], 'icon' : 'file' }
		},
		'unique' : {
			'duplicate' : function (name, counter) {
				return name + ' ' + counter;
			}
		},
		'plugins' : ['state','dnd','sort','types','contextmenu','unique',"wholerow"]
	})
	.on('delete_node.jstree', function (e, data) {// 替换ok
		Ajax.call(backend_url+"&operation=delete_node&id="+data.node.id, '', delete_node, 'GET', 'JSON', 'FORM',false);
		function delete_node(d){
			if(d && typeof d.status == 'OK') {
				data.instance.refresh();
			}
		}
	})
	.on('create_node.jstree', function (e, data) {// 替换ok
		Ajax.call('/api/method/app_center.editor.editor?app=' + cur_app+"&operation=create_node&type="+data.node.type+"&id="+data.node.parent+"&text="+data.node.text, "", create_node, 'GET', 'JSON', 'FORM',false);
		function create_node(d){
			if(d && typeof d.id !== 'undefined') {
				data.instance.set_id(data.node, d.id);
				if (d.icon) {
					data.instance.set_icon(data.node, d.icon);
				}
			}else{
				data.instance.refresh();
			}
		}
	})
	.on('rename_node.jstree', function (e, data) {// 替换ok	
		Ajax.call('/api/method/app_center.editor.editor?app=' + cur_app+"&operation=rename_node&id="+data.node.id+"&text="+data.text, "", rename_node, 'GET', 'JSON', 'FORM',false);
		function rename_node(d){
			if(d && typeof d.id !== 'undefined') {
				var doc_name = data.node.id;
				data.instance.set_id(data.node, d.id);
				if (d.icon) {
					data.instance.set_icon(data.node, d.icon);
				}
				editor_rename_document(doc_name, d.id);
			}else{
				data.instance.refresh();
			}
		}
	})
	.on('move_node.jstree', function (e, data) {// 替换ok
		Ajax.call('/api/method/app_center.editor.editor?app=' + cur_app+"&operation=move_node&id="+data.node.id+"&parent="+data.parent, "", move_node, 'GET', 'JSON', 'FORM',false);
		function move_node(d){
			//data.instance.load_node(data.parent);
			data.instance.refresh();
		}
	})
	.on('copy_node.jstree', function (e, data) {// 替换ok
		Ajax.call('/api/method/app_center.editor.editor?app=' + cur_app+"&operation=copy_node&id="+data.original.id+"&parent="+data.parent, "", copy_node, 'GET', 'JSON', 'FORM',false);
		function copy_node(d){
			//data.instance.load_node(data.parent);
			data.instance.refresh();
		}
	})
	.on('changed.jstree', function (e, data) {
		if(data && data.selected && data.selected.length) {
			if (data.node.type == 'default') {
				return;
			}
			var selected_file = data.selected.join(':');
			var session = doc_list[selected_file];
			if (session) {
				$('#editor_data .code').show();
				code_editor.setSession(session, 1);
				code_editor.focus();
			} else {
				var value = localStorage.getItem(local_storage_prefix + selected_file);
				if (typeof value == "string") {
					var type = selected_file.split('.').pop();
					editor_switch_document(selected_file, {"type": type, "content": value});
				} else {
					get_file_content(selected_file);
				}
			}
		}
		else {
			$('#editor_data .content').hide();
			$('#editor_data .default').html('Select a file from the tree.').show();
		}
	});

	var jstree_create_file = function() {//==ok
		var ref = $('#jstree_tree').jstree(true),
			sel = ref.get_selected();
		if(!sel.length) { return false; }
		sel = sel[0];
		sel = ref.create_node(sel, {"type":"file"});
		if(sel) {
			ref.edit(sel);
		}else{
			err('请选择目录后再添加文件');
		}
	};
	var jstree_create_folder = function() {//==ok
		var ref = $('#jstree_tree').jstree(true),
			sel = ref.get_selected();
		if(!sel.length) { 
			err('请选择目录后再添加文件夹');
			return false; 
		}
		sel = sel[0];
		sel = ref.create_node(sel, {"type":"default"});
		if(sel) {
			ref.edit(sel);
		}else{
			err('请选择目录后再添加文件夹');
		}
	};
	var jstree_rename = function() {
		var ref = $('#jstree_tree').jstree(true),
			sel = ref.get_selected();
		if(!sel.length) { return false; }
		sel = sel[0];
		ref.edit(sel);
	};
	var jstree_delete = function() {//==ok
		var ref = $('#jstree_tree').jstree(true),
			sel = ref.get_selected();
		if(!sel.length) {
			err('请选择文件或目录');
			return false; 
		}		
		layui.use(['laypage', 'layer'], function(){
		  	var laypage = layui.laypage
		  	,layer = layui.layer;
			layer.confirm('确定要删除吗？', {
			  btn: ['确认','取消']
			}, function(){
			  	ref.delete_node(sel);
			  	alt('删除成功');
			  	layer.closeAll();
			}, function(index){
			  layer.close(index);
			});
		});
		
	};


//------------------- 编辑器菜单栏操作
	//打包并安装到应用 start
	$('.debug_top .apply').click(function(){ 
		var html = $('.J_apply').html();
		html = html.replace(/value_device_sn/,device_sn);
		html = html.replace(/value_inst/,app_inst);
		layui.use('layer', function(){
			layui.layer.open({
			  title: '打包修改内容并安装到:',
			  type: 1,
			  skin: 'layui-layer-rim', //加上边框
			  area: ['460px', '400px'], //宽高
			  content: '<div class="ly">'+html+'</div>'
			});
		});
	});
	$('body').on('click','.ly #J_apply_do',function(){		
		var backend_url = '/api/method/app_center.editor.editor_apply';
		var args = {
			'app': cur_app,
			'device':$('.ly .J_apply_device').val(),
			'inst':$('.ly .J_apply_inst').val(),
			'version':version
		};
        if(!$('.ly .J_protocol').is(':checked')){
	        err('同意使用条款才能操作');
            return false;
        }
		Ajax.call(backend_url, args, apply_do, 'POST', 'JSON', 'FORM',false);
		function apply_do(req){
			if(req && typeof(req.message)!=='undefined'){
				layui.use('layer', function(){
					layer.closeAll();
				});
				alt('打包并安装成功',1);
				setTimeout(function(){
					layui.use('layer', function(){
						window.location.reload();
					});
				},2000);
			}else{
				alt('打包并安装失败',1);
			}
		}  		
	});
	//打包并安装到应用 end


	//发布新版本 start
	$('.debug_top .tag').click(function(){ 
		var html = $('.J_tag').html();
		layui.use('layer', function(){
			layui.layer.open({
			  title: '发布新版本',
			  type: 1,
			  skin: 'layui-layer-rim', //加上边框
			  area: ['460px', '380px'], //宽高
			  content: '<div class="ly">'+html+'</div>'
			});
		});
	});
	$('body').on('click','.ly #J_tag_do',function(){		
		var backend_url = '/api/method/app_center.editor.editor_release';
		var args = {
			'app': cur_app,
			//'operation': 'set_content',
			'version':$('.ly #J_tag_version').val(),
			'comment':$('.ly #J_tag_comment').val(),
		};
		if($('.ly #J_tag_version').val()==''){
			err('版本号不能为空');
            return false;
		}
		if($('.ly #J_tag_comment').val()==''){
			err('评论内容不能空');
            return false;
		}	
        if(!$('.ly .J_protocol').is(':checked')){
	        err('同意使用条款才能操作');
            return false;
        }
		Ajax.call(backend_url, args, tag_do, 'POST', 'JSON', 'FORM',false);
		function tag_do(req){
			if(req && typeof(req.message)!=='undefined'){
				layui.use('layer', function(){
					layer.closeAll();
				});
				alt('发布成功',1);
				setTimeout(function(){
					layui.use('layer', function(){
						window.location.reload();
					});
				},2000);
			}else{
				alt('发布失败',1);
			}
		}  		
	});
	//发布新版本 end

	
	//$('.debug_top .upload').click(upload_application); //
	//重置工作区到指定版本 start
	$('.debug_top .revert').click(function(){ 
		var html = $('.J_revert').html();	
		// 获取应用的版本列表
		Ajax.call('/api/method/app_center.api.get_versions?app=' + cur_app + '&beta=1', "", get_versions, 'GET', 'JSON', 'FORM');
		function get_versions(req){
			var version_list = '';
			console.log('get_versions',req);
			if(req && typeof req.message !== 'undefined') {
				var data = req.message;
				$.each(data,function(i,v){
					version_list += `<option value="${data[i].version}">${data[i].version}</option>`;
				})

                html = html.replace(/version_list/,localStorage.getItem('version_list'));

                layui.use('layer', function(){
                    layui.layer.open({
                        title: '重置编辑器工作区内容到',
                        type: 1,
                        skin: 'layui-layer-rim', //加上边框
                        area: ['460px', '240px'], //宽高
                        content: '<div class="ly">'+html+'</div>'
                    });
                });
			}
			// console.log('version_list',version_list);
			localStorage.setItem('version_list',version_list);
		}
	});
	$('body').on('click','.ly #J_revert_do',function(){
		var backend_url = '/api/method/app_center.editor.editor_revert';
		var args = {
			'app': cur_app,
			'operation': 'set_content',
			'version' : $('.ly #J_revert_version').val(),
		};
		Ajax.call(backend_url, args, revert_do, 'POST', 'JSON', 'FORM',false);
		function revert_do(req){
			if(req && typeof(req.message)!=='undefined'){
				layui.use('layer', function(){
					layer.closeAll();
				});
				alt('工作区重置成功',1);
				setTimeout(function(){
					layui.use('layer', function(){
						//layer.closeAll();
						window.location.reload();
					});
				},2000);
			}else{
				alt('工作区重置失败',1);
			}
		}
  		
	});
	//重置工作区到指定版本 end
	
	$('.debug_top .folder').click(jstree_create_folder); //新目录
	$('.debug_top .file').click(jstree_create_file); //新文件
	$('.debug_top .rename').click(jstree_rename); //重命名
	$('.debug_top .delete').click(jstree_delete); //删除

	$('.debug_top .save').click(function(){	//保存文件==ok
		$('.debug_top .save').addClass('off');
		var session = code_editor.getSession();
		if (session.changed) {
			upload_application_file(session.name, session.getValue());
		}
	});
	$('.debug_top .download').click(function () { //获取文件==ok
		layui.use(['laypage', 'layer'], function(){
		  	var laypage = layui.laypage
		  	,layer = layui.layer;
			layer.confirm('从服务器重新获取文件，将会删除本地所有的改动，是否执行？', {
			  btn: ['确认','取消']
			}, function(){
			  	var session = code_editor.getSession();
			  	console.log('session',session);
				if (session.changed) {
					$('.debug_top .save').addClass('off');
					localStorage.removeItem(local_storage_prefix + session.name);
					doc_list[session.name] = null;
					get_file_content(session.name);
					alt('执行成功',1);
			  		setTimeout('layer.closeAll();',2000);
				}else{
					err('文件未修改，无须执行');
				}
			}, function(index){
			  layer.close(index);
			});
		});
	});
	//撤销==ok
	$('.debug_top .undo').click(function () {
		code_editor.undo();
	});
	//重置==ok
	$('.debug_top .redo').click(function () { 
		code_editor.redo();
	});
	// 放大字号==ok
	$('.debug_top .zoom').click(function () {
		var font_size = code_editor.getFontSize() + 1;
		code_editor.setFontSize(font_size);
	});
	// 缩小字号==ok
	$('.debug_top .zoom_out').click(function () {
		var font_size = code_editor.getFontSize() - 1;
		code_editor.setFontSize(font_size);
	});
	$('.debug_top .align_justify').click(function () {
		//code_editor.indent();
	});

	// ==ok
	var upload_application_file = function(name, content) {
		var backend_url = '/api/method/app_center.editor.editor';
		var args = {
			'app': cur_app,
			'operation': 'set_content',
			'id' : name,
			'text' : content,
		};
		Ajax.call(backend_url, args, set_content, 'POST', 'JSON', 'FORM',false);
		function set_content(d){
			if(d && typeof(d.status)!=='undefined'){
				var session = doc_list[name];
				session.changed = false;
				localStorage.removeItem(local_storage_prefix + name);
				if (code_editor.getSession() == session) {
					editor_codeIng.removeClass('modified');
					editor_codeIng.html('<b>' + session.name + '</b>');
				}
				alt('Upload Ok!');
			}else{
				var session = doc_list[name];
				code_editor.setSession(session, 1);
				code_editor.focus();
				$('.debug_top .upload').removeClass('off');
				err('Upload Failed!');
			}
		}  
		//var backend_url = API_HOST+'/api/method/app_center.editor.editor';
		//var args = {
		//	'app': cur_app,
		//	'operation': 'set_content',
		//	'id' : name,
		//	'text' : content,
		//};
		//$.post(backend_url, args)
		//	.done(function (d) {
		//		var session = doc_list[name];
		//		session.changed = false;
		//		localStorage.removeItem(local_storage_prefix + name);
		//		if (code_editor.getSession() == session) {
		//			editor_codeIng.removeClass('modified');
		//			editor_codeIng.html('<b>' + session.name + '</b>');
		//		}
		//	})
		//	.fail(function () {
		//		var session = doc_list[name];
		//		code_editor.setSession(session, 1);
		//		code_editor.focus();
		//		$('.debug_top .upload').removeClass('off');
		//		err('Upload Failed!');
		//	});
	};
	
	var upload_application = function() {
		$('.debug_top.upload').addClass('off');
		for (var name in doc_list) {
			var session = doc_list[name];
			if (session.changed) {
				upload_application_file(session.name, session.getValue())
			}
		}
	};
	
		
	// 其他
	$('body').on('click','.J_content_close',function(){		
		layui.use('layer', function(){
			layer.closeAll();
		});
	});	

	$('.breadcrumb .J_gate_name').click(function(){
		window.location.href='collection.html?type=manage&device_sn='+device_sn;
	});
    //获取当前编辑区的版本号和设备安装版本的对比
	Ajax.call('/api/method/app_center.editor.editor_worksapce_version?app=' + cur_app, "", editor_worksapce_version, 'GET', 'JSON', 'FORM');
	function editor_worksapce_version(req){
		if(req && typeof req.message !== 'undefined') {
			if(req.message!=version){
				layui.use('layer', function(){
					layui.layer.open({
					  title: '版本提示',
					  type: 1,
					  skin: 'layui-layer-rim', //加上边框
					  area: ['460px', '210px'], //宽高
					  content: '<div class="debug_shade"><div class="add_content"><p>当前工作区并不是基于版本'+version+'而是'+req.message+',<br>请将设备中的应用升级到版本'+req.message+'，或者将工作区重置到版本'+version+'。</p><div class="bottom"><button class="J_content_close">我知道了</button></div></div></div>'
					});
				});
			}
		}
	}

	
	//$('.debug_top span').mouseover(function(){
	//	var areaname = $(this).find('img').attr('areaname');
	//	var title = $(this).find('img').attr('title');
	//	layui.use(['laypage', 'layer'], function(){
	//	  	var laypage = layui.laypage,layer = layui.layer;
	//		layer.tips(title, '.'+areaname,{
	//		  tips: [1, '#354E77'] //还可配置颜色
	//		});
	//	});
	//});
	
})
