/**
 * @file            mine.js
 * @description     设备频道。
 * @author          dongsun Team ( http://www.dongsun.com/ )
 * @date            2018-03-08 dongsun
**/

    var rows_selected = [];
    var rows_selected_data = [];
    var table_obj = new Object();


    function updateDataTableSelectAllCtrl(table){
        var $table             = table.table().node();
        var $chkbox_all        = $('tbody input[type="checkbox"]', $table);
        var $chkbox_checked    = $('tbody input[type="checkbox"]:checked', $table);
        // var chkbox_select_all  = $('thead input[name="select_all"]', $table).get(0);
        // var table_footer_select_all  = $('#table_footer input[name="select_all"]').get(0);

        var chkbox_select_all  = $('input[name="select_all"]');
        // If none of the checkboxes are checked
        if($chkbox_checked.length === 0){
            // console.log(1);
        //    chkbox_select_all.checked = false;
        //    table_footer_select_all.checked = false;
        //    if('indeterminate' in chkbox_select_all){
        //       chkbox_select_all.indeterminate = false;
        //    }
        chkbox_select_all.each(function(i){
            this.checked = false;
        })
     
        // If all of the checkboxes are checked
        } else if ($chkbox_checked.length === $chkbox_all.length){
            // console.log(2);
        //    chkbox_select_all.checked = true;
        //    table_footer_select_all.checked = true;
        //    if('indeterminate' in chkbox_select_all){
        //       chkbox_select_all.indeterminate = false;
        //    }
        chkbox_select_all.each(function(i){
            this.checked = true;
        })
        // If some of the checkboxes are checked
        } else {
            // console.log(3);
        //    chkbox_select_all.checked = false;
        //    table_footer_select_all.checked = false;
        //    //console.log(table.button()[0].node);
        //    if('indeterminate' in chkbox_select_all){
        //       chkbox_select_all.indeterminate = true;
        //    }
        chkbox_select_all.each(function(i){
            this.checked = false;
        })
        }
        
     }

    $(document).ready(function() {

        function update_gate_list(req){
            if(req.message){
                _gate_list_lenth = req.message;
            }else{
                _gate_list_lenth = 0;
            }
            if(_gate_list_lenth == '0'){
                if(filter=="all"){
                    $('div.none p').eq(1).text('您的账户下没有网关呢！');
                    $('div.none button').removeClass('hd');
                }else{
                    $('div.none p').eq(1).text('没有查询到符合条件的记录！');
                    $('div.none button').addClass('hd');
                }
                $('div.none').show();
                $('table.table').hide();
                $('div#table_footer').hide();

            }else{
                $('div.none').hide();
                $('table.table').show();
                $('div#table_footer').show();
            }
        }

        var filter = 'all';
        var _gate_list_lenth = 0;
        var _gate_list_url = "/api/method/iot_ui.iot_api.devices_list?filter="+filter;
        var _gate_list_lenth_url = "/api/method/iot_ui.iot_api.devices_list?filter=len_"+filter;
        table_obj.rtvalueurl = "/apis" + _gate_list_url;
        // console.log($("#example tfoot th:not(':first,:last')"));

        table_obj.dev_list = $('#example').DataTable({
            dom: 'rt<"#table_footer"Bp>',
            // deferRender:    true,
            // scrollY:        '50vh',
            // scrollCollapse: true,
            // scroller:       true,
            // paging:         true,
            buttons: [
               

             ],
        //"bInfo" : false,
        //"pagingType": "full_numbers" ,
        "bStateSave": false,
        "sPaginationType": "full_numbers",
        "iDisplayLength" : 10,
        "ajax": {
            "url": table_obj.rtvalueurl,
            "dataSrc": "message",
        },
        // "data": _gate_list,
        "columns": [
            {"data": null},
            {"data": "device_name"},
            {"data": "device_desc"},
            {"data": "longitude"},
            {"data": "last_updated"},
            {"data": "device_status"},
            {"data": null},
        ],
        // "language": {
        //     "url": "//cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Chinese.json"
        // },
        "language": {
            "sProcessing": "处理中...",
            "sLengthMenu": "显示 _MENU_ 项结果",
            "sZeroRecords": "没有匹配结果",
            "sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
            "sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
            "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
            "sInfoPostFix": "",
            "sSearch": "搜索:",
            "sUrl": "",
            "sEmptyTable": "表中数据为空",
            "sLoadingRecords": "载入中...",
            "sInfoThousands": ",",
            "oPaginate": {
            "sFirst": "首页",
            "sPrevious": "上页",
            "sNext": "下页",
            "sLast": "末页"
            },
            "oAria": {
            "sSortAscending": ": 以升序排列此列",
            "sSortDescending": ": 以降序排列此列"
            }
            },
        rowCallback: function(row, data, dataIndex){
            if(data.device_status=="ONLINE"){
                $(row).addClass('on');
                $(row).children('td').eq(1).addClass('gate_hand');
                $(row).children('td').eq(2).addClass('gate_hand');
            }
            else{
                $(row).addClass('end');
            }
            },
        columnDefs: [
            {
            //   指定第第一列   
                targets: 0,
                searchable: false,
                orderable: false,
                width: '1%',
                render: function(data, type, row, meta) {
                 var gen_html = '<label class="checkbox"><input index="0" name="device" type="checkbox" class="box"><em></em></label>';
                 return gen_html;
                }
            },
            {
                //   指定第第2列
                targets: 1,
                width: '20%',
                render: function(data, type, row, meta) {
                    // console.log(data)
                    return '<i class="on"></i>'+data;
                }
            },
            {
                //   指定第第3列
                targets:  2,
                width: '20%'
            },
            {
                //   指定第第4列
                targets:  3,
                width: '10%'
            },
            {
                //   指定第第5列
                targets:  3,
                width: '10%'
            },
            {
                //   指定第第6列
                targets: 5,
                render: function(data, type, row, meta) {
                    if(data=="ONLINE"){
                        // console.log(data, type, row, meta);
                        // $(row).addClass('green');
                        return '<i class="run"></i>'+"在线";                        
                    }
                    else if(data=="OFFLINE"){
                        return '<i class="run"></i>'+"离线";
                    }
                    else{
                        return '<i class="run"></i>'+"未连接";
                    }
                //  var gen_html = '<label class="checkbox"><input index="0" name="device" type="checkbox" class="box"><em></em></label>';
                //  return gen_html;
                }
            },

            {
            //   指定第最后一列
            targets: 6,
            searchable: false,
            orderable: false,
            width: '25%',
            render: function(data, type, row, meta) {

                if(data){
                    var status;
                    var manageUrl = '#';
                    var monitorUrl = '#';
                    if(data.device_status=='ONLINE'){
                        var status = 'on';
                        var deviceUrl = 'collection.html?type=device&device_sn='+data.device_sn;
                        var manageUrl = 'collection.html?type=manage&device_sn='+data.device_sn;
                        var monitorUrl = 'collection.html?type=monitor&device_sn='+data.device_sn;
                    }
                    var gen_html = '<a href="'+ monitorUrl + '"><span><img src="img/button_oversee.png"/>监视</span></a><a href="' + manageUrl + '"><span><img src="img/button_settings.png"/>管理</span></a>'
                        + '<div class="btn-group">'
                        + '<p class="more"><span>更多</span><i></i></p>'
                        + '<div class="more_content hd"><!--animated fadeInDown-->'
                        + '<p class="J_edit" index="" sn="' + data.device_sn +'" name="' + data.device_name +'" desc="' + data.device_desc + '">修改</p>'
                        + '</div>'
                        + '</div>';

                    return gen_html;
                }else{
                    console.log("1");
                }


            }
        }],
        "initComplete": function(settings, json) {
            // 列表里的更多按钮
            $(".main_content").on("click",".on .more",function(event){
                event.stopPropagation();
                if($(this).parent().find(".more_content").hasClass("hd")){
                    $(this).parent().find(".more_content").removeClass("hd");
                    $(this).parent().parent().parent().siblings().find(".more_content").addClass("hd");
                }else{
                    $(this).parent().find(".more_content").addClass("hd");
                }
            });

            Ajax.call('' + _gate_list_lenth_url, '', update_gate_list, 'GET', 'JSON', 'JSON');

            
            // 绑定网关的弹层
            $(".bind").click(function(){
                $(".shade").show();
                $(".shade .main").css("margin-top",($(window).height()-$(".shade .main").height())/2);
                $('.shade .tit b').text('绑定新网关');
                $('.shade .bottom .sure').attr('data','add');
                $('.J_add_none').show();
            });
            $(".shade .tit span").click(function(){
                $(".shade").hide();
            });


            
            // 修改网关的弹层
            $(".main_content").on("click",'.more_content .J_edit',function(){
                $(".shade").show();
                $(".shade .main").css("margin-top",($(window).height()-$(".shade .main").height())/2);
                $('.shade .tit b').text('修改网关');
                
                $('.shade .bottom .sure').attr('data','edit');
                $('.shade .bottom .sure').attr('index',$(this).attr('index'));
                
                $('.J_add_none').hide();
                $("input[name='name']").val($(this).attr('name'));
                $("input[name='sn']").val($(this).attr('sn'));
                $("#desc").val($(this).attr('desc'));
            })
            // 添加/修改网关 提交动作
            $('.shade .sure').click(function(){
                var source = $(this).attr('data');
                var name = $("input[name='name']").val();
                var sn = $("input[name='sn']").val();
                var owner_type = $("#owner_type").val();
                var desc = $("#desc").val();
                if(name==''){err('网关名称不能为空');return false;}
                if(sn==''){err('网关序列号不能为空');return false;}
                if(owner_type==''){err('设备归属不能为空');return false;}
                if(desc==''){err('网关描述不能为空');return false;}
                if(source=='add'){
                    var data = {
                        sn:sn,
                        name:name,
                        desc:desc,
                        owner_type:parseInt(owner_type),
                    }
                    Ajax.call('/api/method/iot_ui.iot_api.add_new_gate', JSON.stringify(data), add_new_gate, 'POST', 'JSON', 'JSON');
                    function add_new_gate(req){
                        if(req.message==true){
                            alt('添加成功',1);
                            $(".shade").hide();
                            Ajax.call('' + _gate_list_lenth_url, '', update_gate_list, 'GET', 'JSON', 'JSON');
                            table_obj.dev_list.ajax.url(table_obj.rtvalueurl).load();
                        }
                        console.log(req);
                    }
                }else if(source=='edit'){
                    var data = {
                        sn:sn,
                        name:name,
                        desc:desc,
                    }
                    Ajax.call('/api/method/iot_ui.iot_api.update_gate', JSON.stringify(data), update_gate, 'POST', 'JSON', 'JSON');
                    function update_gate(req){
                        if(req.message==true){
                            alt('修改成功',1);
                            $(".shade").hide();
                            $('.J_name_'+$('.shade .sure').attr('index')).text(name);
                            $('.J_desc_'+$('.shade .sure').attr('index')).text(desc);
                            table_obj.dev_list.ajax.url(table_obj.rtvalueurl).load();
                        }
                        console.log(req);
                    }
                }
            })

          }
        });



    //var dev_list = $('#example').DataTable();

    // new $.fn.dataTable.Buttons( dev_list, {
    //     buttons: [
    //         {
    //             text: 'button3',
    //             class: 'btn',
    //             action: function ( e, dt, node, config ) {
    //                 alert( 'Button3 activated' );
    //             }
    //         },
    //         {
    //             text: 'button4',
    //             class: 'btn',
    //             action: function ( e, dt, node, config ) {
    //                 alert( 'Button4 activated' );
    //             }
    //         },
    //     ]
    // } );

    // dev_list.buttons( 1, null ).container().appendTo(
    //     dev_list.table().container()
    // );
/*
    dev_list.columns().every( function () {
        var that = this;
 
        $( 'input', this.footer() ).on( 'keyup change', function () {
            if ( that.search() !== this.value ) {
                that
                    .search( this.value )
                    .draw();
            }
        } );
    } );
    */


	$(".main_content .taps span").click(function(){
		$(this).addClass("color");
		$(this).siblings().removeClass("color");
		filter = $(this).data('filter');

        _gate_list_lenth_url = "/api/method/iot_ui.iot_api.devices_list?filter=len_"+filter;
        _gate_list_url = "/api/method/iot_ui.iot_api.devices_list?filter="+filter;
        table_obj.rtvalueurl = "/apis" + _gate_list_url;

        Ajax.call('' + _gate_list_lenth_url, '', update_gate_list, 'GET', 'JSON', 'JSON');


        table_obj.dev_list.ajax.url(table_obj.rtvalueurl).load();

        $('input[name="select_all"]').each(function(i){
            this.checked = false;
        })

	});
	$("div.refresh").click(function(){

        table_obj.dev_list.ajax.url(table_obj.rtvalueurl).load();
        $('input[name="select_all"]').each(function(i){
            this.checked = false;
        })

	});


    $('input.J_keyword').on( 'keyup click', function () {
        var key = $('input.J_keyword').val();
        var colnum = 1
        if($('.search_keyword').text()=="名称"){
            var colnum = 1
        }
        if($('.search_keyword').text()=="描述"){
            var colnum = 2
        }
        table_obj.dev_list
            .columns( colnum )
            .search( key )
            .draw();
    } );

    //$('#table_footer').prepend('<label class="checkbox"><input index="0" name="device" type="checkbox" class="box"><em></em></label>');

        $('#table_footer').prepend('<div class="dataTables_info bottom J_none"><div style="margin-top: 10px;">'
						+ '<label class="checkbox"><input type="checkbox" name="select_all" class="all"/>全选<em></em></label>'
						+ '<span id="J_remove">移除</span>'
						+ '<span id="J_upgrade">升级</span>'
                        + ' </div></div>');
                        

                // Handle click on checkbox
        $('#example tbody').on('click', 'input[type="checkbox"]', function(e){
            var $row = $(this).closest('tr');

            // Get row data
            var data = table_obj.dev_list.row($row).data();
            // console.log(data);

            // Get device_sn
            var rowId = data.device_sn;
            // console.log("rowId:",rowId);

            // Determine whether device_sn is in the list of rows_selected
            var index = $.inArray(rowId, rows_selected);
            var index_1 = $.inArray(data, rows_selected_data);
            // console.log("index:",index, index_1);

            // console.log("@@@@@@@:",this.checked);
            // If checkbox is checked and row ID is not in list of rows_selected
            if(this.checked && index === -1){
            rows_selected.push(rowId);
            rows_selected_data.push(data);

            // Otherwise, if checkbox is not checked and row ID is in list of rows_selected
            } else if (!this.checked && index !== -1){
            rows_selected.splice(index, 1);
            rows_selected_data.splice(index_1, 1);
            }

            if(this.checked){
                // console.log(this.checked);
                $row.addClass('selected');
            } else {
                // console.log(this.checked);
                $row.removeClass('selected');
            }

            // Update state of "Select all" control
            updateDataTableSelectAllCtrl(table_obj.dev_list);

            // Prevent click event from propagating to parent
            e.stopPropagation();
        });

        // Handle click on "Select all" control
        $('input[name="select_all"]', table_obj.dev_list.table().container()).on('click', function(e){
            if(this.checked){
            $('#example tbody input[type="checkbox"]:not(:checked)').trigger('click');
            } else {
            $('#example tbody input[type="checkbox"]:checked').trigger('click');
            }

            
            // Prevent click event from propagating to parent
            e.stopPropagation();
        });

        $('#table_footer span[id="J_remove"]').click(function(e){
            // var chkbox_select_all  = $('input[name="select_all"]');
            // chkbox_select_all.each(function(i){
            //     console.log(this);
            // })

            var gate_datas  ={"sn": []};
            for(var i= 0;i<rows_selected_data.length;i++){
                gate_datas['sn'].push(rows_selected_data[i].device_sn)
            }
            Ajax.call('/api/method/iot_ui.iot_api.remove_gate', JSON.stringify(gate_datas), remove_gate, 'POST', 'JSON', 'JSON');
            function remove_gate(req){
                if(req.message){
                    alt('移除选择网关成功',1);
                }else{
                    alt('移除选择网关失败',1);
                }
                Ajax.call('' + _gate_list_lenth_url, '', update_gate_list, 'GET', 'JSON', 'JSON');
                table_obj.dev_list.ajax.url(table_obj.rtvalueurl).load();
            }

        });


        $('button.remake').on('click', function(){

            $("input[name='name']").val("");
            $("input[name='sn']").val("");
            $("#desc").val("");
        });


        $('div.search_filter li').on('click', function(){
            $('.search_keyword').text($(this).text());
                              });


        $('table.table tbody').on('click', 'tr td:nth-child(2)', function () {
            var data = table_obj.dev_list.row( this ).data();
            if(data.device_status=="ONLINE"){
                var deviceUrl = 'collection.html?type=device&device_sn='+data.device_sn;
                window.location.href=deviceUrl
            }
        } );

        $('table.table tbody').on('click', 'tr td:nth-child(3)', function () {
            var data = table_obj.dev_list.row( this ).data();
            if(data.device_status=="ONLINE"){
                var deviceUrl = 'collection.html?type=device&device_sn='+data.device_sn;
                window.location.href=deviceUrl
            }
        } );

        $(document).click(function(){
            $(".more_content").addClass("hd");
        });


        setInterval('Ajax.call(\'\' + _gate_list_lenth_url, \'\', update_gate_list, \'GET\', \'JSON\', \'JSON\');table_obj.dev_list.ajax.url(table_obj.rtvalueurl).load();', 20000);

        // $('#table_footer span[id="J_upgrade"]').click(function(e){
        //     var mmmm = $(this).parent().children().first().children().first();
        //     console.log(mmmm,mmmm.prop("checked"));
        //     if (mmmm.prop("checked")) {
        //         //设置checked属性
        //         mmmm.prop("checked", false);
        //      } else {
        //         //设置checked属性
        //         mmmm.prop("checked",true);                                
        //      }

        // });


        // $('#example tbody').on( 'click', 'tr', function (e) {
        //     var $rowcheckbox = $(this).children().first().children().first().children().first()
        //     console.log("selected", $(this).hasClass('selected'));
        //     if ( $(this).hasClass('selected') ) {
        //         console.log(1);
        //         $(this).removeClass('selected');
        //         $rowcheckbox.attr("checked", false);
        //         console.log($rowcheckbox.is(':checked'));
        //     }
        //     else {
        //         console.log(2);
        //         $(this).addClass('selected');
        //         $rowcheckbox.attr("checked",true);
        //         console.log($rowcheckbox.is(':checked'));
        //     }
            
        //     // console.log($(this).children().first().children().first().first());
        //     // $(this).children().first().children().first().children().attr("checked", true);
        //     // $(this).toggleClass('selected');
        // } );


    });

    
