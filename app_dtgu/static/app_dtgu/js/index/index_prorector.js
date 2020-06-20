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

    setTimeout(    makeGraph, 2000);
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
            var children = search_list_in_json(paramsMarks,'HighOrderParamMark_id', param.id);

            var childrenParam = [];
            children.forEach(function (childParam) {
                var child_graph = [{
                    text: '<div id="graph" style="display: table"></div>',
                    type: 'childParamGraph',
                    field_search: 'childParamGraph_' + childParam.id,
                    pk: 'childParamGraph_' + childParam.id,
                }];

                childrenParam.push({
                    text: childParam.name,
                    type: 'childParam',
                    nodes: childParam.name === 'Газпром' ? child_graph : [],
                    field_search: 'childParam_' + childParam.id,
                    pk: childParam.id,
                })
            });
            paramMark_node.push({
                text: param.name + '<span class="pull-right" style="font-weight: 600">' + param.value + '</span>',
                type: 'param',
                nodes:childrenParam,
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

function makeGraph() {

    var html = '<div class="col-sm-12 col-md-12 col-lg-6">\n' +
        '                <div class="card">\n' +
        '                    <div class="card-body">\n' +
        '                        <p class="card-text pull-left">Динамика зарплаты</p>\n' +
        '                        <canvas id="LeftChart"></canvas>\n' +
        '                    </div>\n' +
        '                </div>\n' +
        '            </div>';

    html += '<div class="col-sm-12 col-md-12 col-lg-6">\n' +
        '                <div class="card">\n' +
        '                    <div class="card-body">\n' +
        '                        <p class="card-text pull-left">Динамика вакансий</p>\n' +
        '                        <canvas id="RightChart"></canvas>\n' +
        '                    </div>\n' +
        '                </div>\n' +
        '            </div>';

    $('#graph').html(html);
    makeGraphData();
}

function makeGraphData() {

    var data_for_left_chart = {};
    var data_for_right_chart = {};

    var type_for_left_char = 'this_week';
    var type_for_right_char = 'this_week';

    var options = {
        legend: {
            display: false
        },
        elements: {
            line: {
                tension: 0
            }
        },
        tooltips: {
            mode: 'point',
            bodyFontSize: 15,
            bodySpacing: 3,
            callbacks: {
                label: function (tooltipItem, data) {
                    return ' ' + tooltipItem.yLabel;
                }
            },

        },
        scales: {
            yAxes: [{
                gridLines: {
                    drawBorder: false,
                },
                ticks: {
                    callback: function (value, index, values) {
                        return value;
                    }

                }
            }],
            xAxes: [{
                gridLines: {
                    display: false,
                }
            }]

        }

    };
    Chart.defaults.global.hover.mode = 'index';
    Chart.defaults.global.elements.point.radius = 5;
    Chart.defaults.global.elements.point.hoverRadius = 7;
    Chart.defaults.global.elements.point.backgroundColor = 'rgb(255, 255, 255)';
    Chart.defaults.global.elements.point.borderColor = '#0097cc';
    Chart.defaults.global.elements.point.borderWidth = 2;

    Chart.defaults.scale.ticks.beginAtZero = true;

    Chart.defaults.global.elements.line.borderColor = '#0097cc';
    Chart.defaults.global.elements.line.backgroundColor = 'rgba(146, 44, 136,.1)';


    var l_ctx = document.getElementById('LeftChart').getContext('2d');
    var r_ctx = document.getElementById('RightChart').getContext('2d');
    var l_chart = new Chart(l_ctx, {
        type: 'line',
        options: options
    });

    var r_chart = new Chart(r_ctx, {
        type: 'line',
        options: options
    });

    function change_data_in_left_chart() {
        if (type_for_left_char in data_for_left_chart) {
            l_chart.clear();
            l_chart.data = data_for_left_chart[type_for_left_char];
            l_chart.update();
        }
    }

    function change_data_in_right_chart() {
        if (type_for_right_char in data_for_right_chart) {
            r_chart.clear();
            r_chart.data = data_for_right_chart[type_for_right_char];
            r_chart.update();
        }
    }

    function change_data_in_charts(data) {
        if('chart_profit_calc' in  data.dataset){
           data_for_left_chart = data.dataset.chart_profit_calc;
           change_data_in_left_chart();
        }
        if('chart_leads_count' in  data.dataset){
           data_for_right_chart = data.dataset.chart_leads_count;
            change_data_in_right_chart();
        }
    }

    var data = {

        dataset:{
            chart_profit_calc:{
                this_week:{
                    datasets:[
                        {
                            data:[78800, 75500,77900,79300,80000,79500]
                        }
                    ],
                    labels:['01.20','02.20','03.20','04.20','05.20','06.20']
                }
            },
            chart_leads_count:{
                this_week:{
                    datasets:[
                        {
                            data:[420, 240,290,350,300,400]
                        }
                    ],
                    labels:['01.20','02.20','03.20','04.20','05.20','06.20']
                }

            }
        }
    };
    change_data_in_charts(data);


}