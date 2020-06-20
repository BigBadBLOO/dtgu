var typeMarks = [];
var specialty = [];
var marks = [];
var paramsMarks = [];

var type_id = -1;
$(document).ready(function () {
    ajax_message('/index_init/', {'csrfmiddlewaretoken': $($(tokenlist[0]).children()[0]).val()}, make_index)
});


function make_index(data) {
    typeMarks = data['TypeMarks'];
    specialty = data['Specialty'];
    $('#typeMarks').html(make_selector(typeMarks)).chosen(chosen_def).change(function () {
            type_id = $(this).val();
        }
    ).change();
    $('#speciality').html(make_selector(specialty,true)).chosen(chosen_def).change(function () {
         var speciality_id = $(this).val();
         show_load();
         var data = {
             'csrfmiddlewaretoken': $($(tokenlist[0]).children()[0]).val(),
             'type_id': type_id,
             'speciality_id': speciality_id
         };

        ajax_message('/calc_marks/', data, make_result)
    });
}

function make_result(data) {
    marks = data['marks'];
    paramsMarks = data['paramsMarks'];

    init_tree();
    hide_load();
}

function init_tree(){
    var data_tree = getTree();
    let tree = $('#third_block');
    tree.treeview({
        data: data_tree,
        levels: 1,
        showCheckbox: true,
        showTags: true,
        checkedIcon: 'fa fa-check',
        uncheckedIcon: 'fa fa-square-o',
        expandIcon: 'fa fa-plus',
		collapseIcon: 'fa fa-minus',
        highlightSelected: false,
    }).on('nodeChecked', function (event, node){
        let childrenNodes = _getChildren(node);
        $(childrenNodes).each(function(){
            node = tree.treeview('getNodes', this.nodeId);
            node.state.checked = true;
            if (node.$el) {
				node.$el.addClass('node-checked');
				node.$el.children('span.check-icon')
                    .removeClass('fa fa-square-o')
					.addClass('fa fa-check');
			}
        });
    }).on('nodeUnchecked', function (event, node) {
        let childrenNodes = _getChildren(node);
        $(childrenNodes).each(function () {
            node = tree.treeview('getNodes', this.nodeId);
            node.state.checked = false;
            if (node.$el) {
				node.$el.removeClass('node-checked');
				node.$el.children('span.check-icon')
                    .removeClass('fa fa-check')
					.addClass('fa fa-square-o');
			}
        });
    });
}

function getTree() {
    let tree = [];
    console.log(marks);
    marks.forEach(function (item) {
        var paramMark = search_list_in_json(paramsMarks,'mark_id', item.id);
        var paramMark_node = [];
        paramMark.forEach(function (param) {
            paramMark_node.push({
                text: param.name,
                type: 'param',
                field_search: 'param_' + param.id,
                pk: param.id,
            });
        });
        tree.push({
            text: item.name,
            type: 'mark',
            nodes: paramMark_node,
            field_search: 'mark_' + item.id,
            pk: item.id,
        });
    });
  return tree;
}

function make_user_name_mt(user, marker) {
    let marker1 = "\'" + marker + "\'";
    let user_name = '<span  class="clip" style="max-width: calc(100% - 208px);">' + user.name + '</span>';
    user_name += ' <span class="my-not-visible-xs"> (КФ =</span>' +
    '<input type="text" class="squared_input" onkeypress="validate(event,this)" onblur="changeFactor(this,'+user.id+',\'user_factor\')" value="' + user.factor + '">' +
    '<span class="my-not-visible-xs">)</span>';

    let check_get_leads = '';
    if (user.get_statistic === true){
        check_get_leads = 'checked="checked"'
    }
    let baged ='<div class="pull-right my_table" style="margin-top:-7px">' +
           '<div><input id="get_'+user.id+'" type="checkbox" class="my_checkbox get_leads"'+check_get_leads+' style="display:none">' +
           '<label for="get_'+user.id+'" class="check" style="padding:0" onclick="get_statistic_mt('+user.id+')">' +
           '<svg width="18px" height="18px" viewBox="0 0 18 18">'  +
           '<path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z"></path>' +
           '<polyline points="1 9 7 14 15 4"></polyline></svg></label><span class="btn-label my-not-visible-xs"> (Получать статистику?)</span></div>' +
           '<div style="padding-top: 3px"><span class="my-not-visible-xs" style="margin-left: 10px;">Обновлен: '+to_date_format(date_format(user.date_update))+'</span></div>' +
           '<div><div id="indicate_'+user.id+'" class="indicate_red"></div></div>' +
           '<div><button id="test_user_'+user.id+'" type="button" class="btn btn-purple btn-outline" onclick="test_user(this)" ' +
           'title="Протестировать подключение пользователя"><span class="fa-stack"><i class="fa fa-plug"></i></span>' +
           '</button></div></div>';
    return user_name + baged
}

function _getChildren(node) {
    if (node.nodes === undefined) return [];
    var childrenNodes = node.nodes;
    node.nodes.forEach(function(n) {
        childrenNodes = childrenNodes.concat(_getChildren(n));
    });
    return childrenNodes;
}