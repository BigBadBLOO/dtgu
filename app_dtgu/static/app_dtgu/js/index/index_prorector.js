var typeMarks = [];
var specialty = [];
var marks = [];
var paramsMarks = [];

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

    setTimeout(makeGraph, 2000);
    setTimeout(hide_load, 1000);


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

            if(param.name === '% выпускников, трудоустроенных в ведущих компаниях, в течение года после выпуска'){
                childrenParam.push(  {
                    text: '<div id="graph_2_2_1" style="display: table;max-height: 200px"></div>',
                    type: 'childParamGraph',
                    field_search: 'childParamGraph_' + param.id,
                    pk: 'childParamGraph_' + param.id,
                })
            }

            if(param.name === 'Отношение средней з/п выпускника в первый год работы к средней з/п по региону'){
                childrenParam.push(  {
                    text: '<div id="graph_2_2_2" style="display: table;max-height: 200px"></div>',
                    type: 'childParamGraph',
                    field_search: 'childParamGraph_' + param.id,
                    pk: 'childParamGraph_' + param.id,
                })
            }

            children.forEach(function (childParam) {
                var child_graph = [];

                if(childParam.name === 'Газпром'){
                    child_graph.push(  {
                        text: '<div id="graph" style="display: table"></div>',
                        type: 'childParamGraph',
                        field_search: 'childParamGraph_' + childParam.id,
                        pk: 'childParamGraph_' + childParam.id,
                    })
                }

                childrenParam.push({
                    text: make_name(childParam.name),
                    type: 'childParam',
                    nodes: child_graph,
                    field_search: 'childParam_' + childParam.id,
                    pk: childParam.id,
                })
            });
            paramMark_node.push({
                text: make_name(param.name) + '<span class="pull-right" style="font-weight: 600">' + param.value + '</span>',
                type: 'param',
                nodes:childrenParam,
                field_search: 'param_' + param.id,
                pk: param.id,
            });
        });
        tree.push({
            text: make_name(index + 1 + '. ' + item.name),
            type: 'mark',
            nodes: paramMark_node,
            field_search: 'mark_' + item.id,
            pk: item.id,
        });
    });
    console.log(tree);
  return tree;
}


function expandChildrenNode(el,marker) {
    let tree = $('#'+marker);
    let nodeIdParent = $(el.parentNode).attr('data-nodeid');
    let node = tree.treeview('getNodes', nodeIdParent);
    if(node.state.expanded){
        tree.treeview('collapseNode', [ [node], { silent: true, ignoreChildren: false } ]);
    }else{
        tree.treeview('expandNode', [ node, { levels: 1, silent: true } ]);
    }
}


function make_name(name) {
    return '<span onclick="expandChildrenNode(this,\'third_block\')">' + name + '</span>'
}



function _getChildren(node) {
    if (node.nodes === undefined) return [];
    var childrenNodes = node.nodes;
    node.nodes.forEach(function(n) {
        childrenNodes = childrenNodes.concat(_getChildren(n));
    });
    return childrenNodes;
}

function make_card_graph(marker,text, column=6) {
    return '<div class="col-sm-12 col-md-12 col-lg-' + column + '">\n' +
        '                <div class="card">\n' +
        '                    <div class="card-body">\n' +
        '                        <p class="card-text pull-left">' + text + '</p>\n' +
        '                        <canvas id="' + marker + '"></canvas>\n' +
        '                    </div>\n' +
        '                </div>\n' +
        '            </div>';
}
function makeGraph() {
    var html = make_card_graph("LeftChart", "Динамика зарплаты", 6);
    html += make_card_graph("RightChart", "Динамика вакансий", 6);

    var html_2_2_1 = make_card_graph("Chart_2_2_1", "% выпускников, трудоустроенных в ведущих компаниях, в течение 5 лет",6);
    var html_2_2_2 = make_card_graph("Chart_2_2_2", "Отношение средней з/п выпускника за 5 лет", 6);
    
    $('#graph').html(html);
    
    $('#graph_2_2_1').html(html_2_2_1);
    $('#graph_2_2_2').html(html_2_2_2);

    try{
        makeGraphData_1_2();
    }catch (e) {
        
    }
     

}

function makeGraphData_1_2() {
    var data_for_left_chart = {};
    var data_for_right_chart = {};

    var data_for_2_2_1_chart = {};
    var data_for_2_2_2_chart = {};

    var type_for_char = 'this_week';

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
    Chart.defaults.global.elements.line.backgroundColor = 'rgba(0,151,204,0.1)';

    try {
        var l_ctx = document.getElementById('LeftChart').getContext('2d');
        var l_chart = new Chart(l_ctx, {
            type: 'line',
            options: options
        });

        var r_ctx = document.getElementById('RightChart').getContext('2d');
        var r_chart = new Chart(r_ctx, {
            type: 'line',
            options: options
        });
    }catch (e) {}

    try {
        var ctx_2_2_1 = document.getElementById('Chart_2_2_1').getContext('2d');
        var chart_2_2_1 = new Chart(ctx_2_2_1, {
            type: 'line',
            options: options
        });

        var ctx_2_2_2 = document.getElementById('Chart_2_2_2').getContext('2d');
        var chart_2_2_2 = new Chart(ctx_2_2_2, {
            type: 'line',
            options: options
        });
    }catch (e) {}

    function change_data_in_left_chart() {
        if (type_for_char in data_for_left_chart) {
            l_chart.clear();
            l_chart.data = data_for_left_chart[type_for_char];
            l_chart.update();
        }
    }

    function change_data_in_right_chart() {
        if (type_for_char in data_for_right_chart) {
            r_chart.clear();
            r_chart.data = data_for_right_chart[type_for_char];
            r_chart.update();
        }
    }

    function change_data_in_2_2_1_chart() {
        if (type_for_char in data_for_2_2_1_chart) {
            chart_2_2_1.clear();
            chart_2_2_1.data = data_for_2_2_1_chart[type_for_char];
            chart_2_2_1.update();
        }
    }

    function change_data_in_2_2_2_chart() {
        console.log(data_for_2_2_2_chart);
        if (type_for_char in data_for_2_2_2_chart) {
            chart_2_2_2.clear();
            chart_2_2_2.data = data_for_2_2_2_chart[type_for_char];
            chart_2_2_2.update();
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
        if('chart_2_2_1' in  data.dataset){
           data_for_2_2_1_chart = data.dataset.chart_2_2_1;
            change_data_in_2_2_1_chart();
        }
        if('chart_2_2_2' in  data.dataset){
           data_for_2_2_2_chart = data.dataset.chart_2_2_2;
            change_data_in_2_2_2_chart();
        }
    }

    var data = {
        dataset:{
            chart_profit_calc:{
                this_week:{
                    datasets:[
                        {
                            data:[64800, 76500,77900,79300,86000,89500]
                        }
                    ],
                    labels:['01.20','02.20','03.20','04.20','05.20','06.20']
                }
            },
            chart_leads_count:{
                this_week:{
                    datasets:[
                        {
                            data:[42, 24,29,35,30,40]
                        }
                    ],
                    labels:['01.20','02.20','03.20','04.20','05.20','06.20']
                }
            },
            chart_2_2_1:{
                this_week:{
                    datasets:[
                        {
                            data:[28, 40, 30, 34, 39, 42]
                        }
                    ],
                    labels:['2015','2016','2017','2018','2019','2020']
                }
            },
            chart_2_2_2:{
                this_week:{
                    datasets:[
                        {
                            data:[68, 79, 60, 65, 70, 75]
                        }
                    ],
                    labels:['2015','2016','2017','2018','2019','2020']
                }
            },
        }
    };
    change_data_in_charts(data);
}