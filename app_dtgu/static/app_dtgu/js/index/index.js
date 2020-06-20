var typeMarks = [];
var specialty = [];
var marks = [];
var paramsMarks = [];

// var type_id = -1;
var specialitys_id = -1;
$(document).ready(function () {
    ajax_message('/index_init/', {'csrfmiddlewaretoken': $($(tokenlist[0]).children()[0]).val()}, make_index)
});


function make_index(data) {
    typeMarks = data['TypeMarks'];

    specialty = data['Specialty'];

    specialty.map((item) => item.name = item.code + ' ' + item.name);

    $('#typeMarks').html(make_selector(typeMarks)).chosen(chosen_def).change(function () {
            var type_id = $(this).val();
            var speciality_id = $('#speciality').val();
            if(speciality_id !== ''){
                get_data(type_id, speciality_id)
            }else{
                $('#third_block').html('');
            }

        }
    );
    $('#speciality').html(make_selector(specialty,true)).chosen(chosen_def).change(function () {
         var speciality_id = $(this).val();
         specialitys_id = speciality_id;
         var type_id =  $('#typeMarks').val();
         show_load();
         get_data(type_id, speciality_id)
    });
}

function get_data(type_id, speciality_id) {
    var data = {
         'csrfmiddlewaretoken': $($(tokenlist[0]).children()[0]).val(),
         'type_id': type_id,
         'speciality_id': speciality_id
     };

    ajax_message('/calc_marks/', data, make_result)

}

function make_result(data) {
    marks = data['marks'];
    paramsMarks = data['paramsMarks'];
    var specialty_obj = search_in_json(specialty, 'id', specialitys_id);
    if(typeof specialty_obj === 'object'){

    }else {
        $('#third_block_name').html('' );
    }
    $('#third_block_name').html(
        '<h3 class="name">' + specialty_obj['name'] + ' (' + specialty_obj['code_en'] + ' ' + specialty_obj['name_en'] + ')' + '</h3>'
    );

    init_tree();
    hide_load();
}

function init_tree(){
    var data_tree = getTree();
    let tree = $('#third_block');
    tree.treeview({
        data: data_tree,
        levels: 2,
        showCheckbox: false,
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

    marks.forEach(function (item, index) {
        var paramMark = search_list_in_json(paramsMarks,'mark_id', item.id);
        var paramMark_node = [];
        paramMark.forEach(function (param) {
            paramMark_node.push({
                text: param.name + '<span class="pull-right" style="font-weight: 600">' + param.value + '</span>',
                type: 'param',
                field_search: 'param_' + param.id,
                pk: param.id,
            });
        });
        tree.push({
            text: index + 1 + '. ' + item.name,
            type: 'mark',
            nodes: paramMark_node,
            field_search: 'mark_' + item.id,
            pk: item.id,
        });
    });
  return tree;
}


function _getChildren(node) {
    if (node.nodes === undefined) return [];
    var childrenNodes = node.nodes;
    node.nodes.forEach(function(n) {
        childrenNodes = childrenNodes.concat(_getChildren(n));
    });
    return childrenNodes;
}