var protect_close_modal = true;
var type_open = true;
var type_edit = -1;

var blank_panel = {};

var start_panel = {};

var my_filters = {};

var rowDefs = [];

var eGridDiv;

var my_modal_panel;

var gridOptions = {
    getRowNodeId: function (data) {
        return data.id;
    },
    groupSelectsChildren: true,
    groupSuppressAutoColumn: true,
    suppressRowClickSelection: true,
    suppressDragLeaveHidesColumns: true,
    groupDefaultExpanded: 1,
    pagination: true,
    viewportRowModelPageSize: 1,
    viewportRowModelBufferSize: 0,
    animateRows: true,
    rowSelection: 'multiple',
    domLayout: 'autoHeight',
    onFirstDataRendered: onFirstDataRendered,
    components: {
        'Button': Button
    },
    localeText: agLocaleText,
};

function copy_text(text){
    var el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

$(document).ready(function () {

    my_modal_panel = $('#my_modal_panel');

    // для фильтров с установкой цветовой гаммы

    $('#button_create').click(function (e) {
        e.preventDefault();
        if (type_open) {
            var data = get_panel_data();
            data['csrfmiddlewaretoken'] = $($(tokenlist[0]).children()[0]).val();

            try {
                if (!test_data(data)) return;
            } catch (e) {

            }

            if (type_edit === -1) {
                show_load();
                ajax_message(href_work, data, set_data_to_table);
            } else {
                if (!compare_obj(get_panel_data(), start_panel)) {
                    show_load();
                    ajax_message(href_work, data, set_data_to_table);
                }
                force_close_modal();
            }
        }
    });

    $('#del_rows').click(function (e) {
        e.preventDefault();

        var selectedData = gridOptions.api.getSelectedRows();
        if (selectedData.length === 0) {
            show_global_alert('info', 'Вы не выбрали ни одной записи', 1);
        } else {
            var info = '';
            if (selectedData.length === 1) {
                info = 'выбранную запись?';
            } else {
                info = 'выбранные записи (' + selectedData.length + '&nbsp;шт.)?';
            }
            exe_ack('Вы действительно хотите удалить ' + info, function () {

                gridOptions.api.updateRowData({remove: selectedData});
                var items = get_list_of_elems(selectedData, 'id');
                var data = {
                    'items': items.join(','),
                    'csrfmiddlewaretoken': $($(tokenlist[0]).children()[0]).val()
                };

                ajax_message(href_del, data);
                delete_from_list(items);
            });
        }
    });

    $('#button_open_my_modal_panel').click(function (e) {
        e.preventDefault();
        my_modal_panel.modal('show');
    });

    my_modal_panel.on('show.bs.modal', function () {

        type_open = true;
        type_edit = -1;

        set_panel_data(blank_panel);

        $(this).find('.has-error').removeClass('has-error');
        $(this).find('.has-warning').removeClass('has-warning');
        $(this).find('.has-success').removeClass('has-success');

        $(this).find('.modal-title').html('Добавление данных');

        $('#button_create').show();

        protect_close_modal = true;

        try {
            set_local_data();
        } catch (e) {

        }

        blank_panel = get_panel_data();

        $('.modal-view').hide();
        $('.modal-view-info').hide();

    }).on('shown.bs.modal', function () {
        start_panel = get_panel_data();
        try {
            ajax_test_username();
        } catch (e) {

        }
    }).on('hide.bs.modal', function (e) {
        if (protect_close_modal) {
            e.preventDefault();

            var b_abj = type_edit === -1 ? blank_panel : start_panel;

            if (!compare_obj(get_panel_data(), b_abj)) {
                exe_ack('При закрытии окна вы потеряете все внесённые изменения!<br><br>Подтвердите закрытие', function () {
                    force_close_modal();
                });
            } else {
                force_close_modal();
            }
        }
    });

    eGridDiv = document.querySelector('#myGrid');

    new agGrid.Grid(eGridDiv, gridOptions);

    $('.grid_row_count').click(function (e) {
        e.preventDefault();
        grid_row_count_setter({val: $(this).attr('data-id'), name: $(this).text()});
    });

    grid_row_count_setter((function () {
        var active = $('.grid_row_count.active');
        if (active.length === 0) {
            return {val: 0, name: 'Все'};
        } else {
            return {val: $(active[0]).attr('data-id'), name: $(active[0]).text()};
        }
    })());

    // $('.ag-header-cell-menu-button').click(function (e) {
    //     $('.ag-filter-select').chosen({
    //         no_results_text: "Ничего не найдено по запросу: ",
    //         search_contains: true,
    //         display_disabled_options: false,
    //         display_selected_options: false,
    //         max_shown_results: 15,
    //         allow_single_deselect: true,
    //         disable_search_threshold: 10,
    //         width: '100%'
    //     });
    //     $('.chosen-single').addClass('form-control');
    // });

    set_select_column();
    init_this();
});

function grid_row_count_setter(elem) {
    $('.grid_row_count.active').removeClass('active');
    $('.grid_row_count[data-id=' + elem.val + ']').addClass('active');
    $('#selected_grid_row_count').text(elem.name);
    onPageSizeChanged({value: elem.val});
}


function init_this() {
    my_filters['csrfmiddlewaretoken'] = $($(tokenlist[0]).children()[0]).val();
    show_load();
    ajax_message(href_init, my_filters, set_data);
}

function set_select_column() {

    var result = '';

    for (var i = 0; i < gridOptions.columnDefs.length; i++) {
        rowDefs.push(gridOptions.columnDefs[i]['field']);
        result += '<option value="' + gridOptions.columnDefs[i]['field'] + '"';
        if (!gridOptions.columnDefs[i]['hide']) {
            result += ' selected="selected" ';
        }
        result += '>';
        result += gridOptions.columnDefs[i]['headerName'];
        result += '</option>';
    }


    $('#grid_cols_elem')
        .html(result)
        .chosen({
            no_results_text: "Ничего не найдено по запросу: ",
            search_contains: true,
            display_disabled_options: false,
            display_selected_options: false,
            max_shown_results: 15,
            allow_single_deselect: true,
            disable_search_threshold: 10,
            width: '100%'
        });
    $('.chosen-choices').addClass('form-control');
}


function force_close_modal() {
    protect_close_modal = false;
    my_modal_panel.modal('hide');
    protect_close_modal = true;
}

function set_table_data(list) {
    var older_filters = {};

    for (var i in gridOptions.api.filterManager.allFilters) {
        older_filters[i] = gridOptions.api.filterManager.allFilters[i].filterPromise.resolution.soft_full_destroy();
    }

    gridOptions.api.setRowData([]);

    make_add_row_data(list);

    for (var i in older_filters) {
        gridOptions.api.filterManager.allFilters[i].filterPromise.resolution.re_init(older_filters[i]);
    }
}

function make_row_data(list) {
    var result = [];
    for (var i = 0; i < list.length; i++) {
        result.push(make_one_row(list[i]));
    }
    return result;
}

function make_add_row_data(list) {
    for (var i = 0; i < list.length; i++) {
        add_row(make_one_row(list[i]));
    }
}

function add_row(row) {
    gridOptions.api.updateRowData({add: [row]});
}

function make_row_fake_data(self) {
    var result = [];
    var elem = {};
    var i;
    for (i = 0; i < self.columnDefs.length; i++) {
        elem[self.columnDefs[i]['field']] = '';
    }
    for (i = 0; i < 0; i++) {
        result.push(elem);
    }
    return result;
}

function onPageSizeChanged(self) {
    gridOptions.api.paginationSetPageSize(parseInt(self.value));
}

function onPageSearchVal(self) {
    gridOptions.api.setQuickFilter($.trim(self.value));
}

function onFirstDataRendered(params) {
    return params.api.sizeColumnsToFit();
}

function onColElemEditVisible(self) {
    setColTempByArray($(self).val());
}

function setColTempByArray(array) {
    gridOptions.columnApi.setColumnsVisible(rowDefs, true);
    if (array !== null) {
        gridOptions.columnApi.setColumnsVisible(remove_from_array_list(rowDefs, array), false);
        gridOptions.columnApi.moveColumns(array, 0);
        for (var i in gridOptions.api.filterManager.allFilters) {
            if (!is_in_array(i, array)) {
                gridOptions.api.filterManager.allFilters[i].filterPromise.resolution.full_destroy();
            }
        }
        for (var i in gridOptions.api.filterManager.allFilters) {
            if (is_in_array(i, array)) {
                var elem = gridOptions.api.filterManager.allFilters[i].filterPromise.resolution;
                elem.re_init(elem.soft_full_destroy());
            }

        }
        gridOptions.api.refreshCells({
            force: true
        });
    } else {
        gridOptions.columnApi.moveColumns(rowDefs, 0);
        gridOptions.api.sizeColumnsToFit();
    }
}

gridOptions.onColumnVisible = function (e) {

    var grid_cols_elem = $('#grid_cols_elem').val();

    if (grid_cols_elem) {
        if (e.column !== null) {

            if (e.visible) {
                grid_cols_elem = add_to_array(grid_cols_elem, e.column.colId);
            } else {
                grid_cols_elem = remove_from_array(grid_cols_elem, e.column.colId);
            }

            $('#grid_cols_elem').val(grid_cols_elem).trigger("chosen:updated");
        }
    }
};

function set_select_options(self, list, style = 'light') {
    var id = $(self).attr('data-id');

    var list_of_elem = search_list_in_json_by_arr(list, 'id', $(self).val());

    var result = '';

    if (list_of_elem.length > 1) {
        for (var i = 0; i < list_of_elem.length; i++) {
            result += '<span class="badge select-option-badge select-option-badge-' + style + '">';
            result += list_of_elem[i]['name'];
            result += '</span>';
        }
    }
    $(id).html(result);
}

function Button() {
}

Button.prototype.getGui = function () {
    return this.eGui;
};

Button.prototype.init = function (params) {
    if (params.value !== '') {
        this.eGui = document.createElement('div');

        var disabled = false;

        if (params.data.status_btn === undefined ? false : params.data.status_btn) {
            disabled = true;
        }


        if (params.value === 'Скачать') {
            this.eGui.innerHTML = '<button class="btn-simple btn btn-purple btn-outline"' + '"' +
                (params.data.score_control_type ? ' disabled="disabled" ' : ' ') + '>' +
                '<span class="fa-stack"><i class="fa fa-download"></i></span><span class="btn-label my-value"></span></button>';
        }
        if (params.value === 'Просмотр') {
            this.eGui.innerHTML = '<button class="btn-simple btn btn-purple btn-outline btn-disabled-' + params.data.id + '"' +
                (disabled ? ' disabled="disabled" ' : ' ') + '>' +
                '<span class="fa-stack"><i class="fa fa-table"></i></span><span class="btn-label my-value"></span></button>';
        }
        if (params.value === 'Изменить') {
            this.eGui.innerHTML = '<button class="btn-simple btn btn-warning btn-outline btn-disabled-' + params.data.id + '"' +
                (disabled ? ' disabled="disabled" ' : ' ') + '>' +
                '<span class="fa-stack"><i class="fa fa-pencil"></i></span><span class="btn-label my-value"></span></button>';
        }
        if (params.value === 'Оплачен') {
            this.eGui.innerHTML = '<button class="btn-simple btn btn-success btn-outline btn-disabled-' + params.data.id + '"' +
                (disabled ? ' disabled="disabled" ' : ' ') + '>' +
                '<span class="fa-stack"><i class="fa fa-check"></i></span><span class="btn-label my-value"></span></button>';
        }
        if (params.value === 'Не оплачен') {
            this.eGui.innerHTML = '<button class="btn-simple btn btn-danger btn-outline btn-disabled-' + params.data.id + '"' +
                (disabled ? ' disabled="disabled" ' : ' ') + '>' +
                '<span class="fa-stack"><i class="fa fa-circle"></i></span><span class="btn-label my-value"></span></button>';
        }
        if (params.value === 'Копировать') {
            this.eGui.innerHTML = '<button class="btn-simple btn btn-purple btn-outline"' + '"' + '>' +
                '<span class="fa-stack"><i class="fa fa-copy"></i></span><span class="btn-label my-value"></span></button>';
        }
        if (params.value === 'Отправить') {
            this.eGui.innerHTML = '<button class="btn-simple btn btn-purple btn-outline btn-disabled-' + params.data.id + '"' +
                (disabled ? ' disabled="disabled" ' : ' ') + '>' +
                '<span class="fa-stack"><i class="fa fa-mail-reply"></i></span><span class="btn-label my-value"></span></button>';
        }


        // get references to the elements we want
        this.eButton = this.eGui.querySelector('.btn-simple');
        this.eValue = this.eGui.querySelector('.my-value');

        // set value into cell
        this.eValue.innerHTML = params.valueFormatted ? params.valueFormatted : params.value;

        this.eventListener = function () {
            if (params.value === 'Просмотр') {
                my_modal_panel.modal('show').find('.modal-title').html('Просмотр данных');
                $('#button_create').hide();
                $('.modal-view').show();
                $('.modal-view-info').show();
                type_open = false;
                protect_close_modal = false;
                type_edit = params.data.id;
                set_panel_data(type_edit);
            }
            if (params.value === 'Изменить') {
                my_modal_panel.modal('show').find('.modal-title').html('Изменение данных');
                type_edit = params.data.id;
                set_panel_data(type_edit);
            }
            if (params.value === 'Оплачен') {
                set_score_status(params.data.id, true);
            }
            if (params.value === 'Не оплачен') {
                set_score_status(params.data.id, false);
            }
            if (params.value === 'Скачать') {
                download_file(params.data.id, params);
            }
            if (params.value === 'Копировать') {
                copy_source(params);
            }
            if (params.value === 'Отправить') {
                resend_mail(params.data.id);
            }
        };
        this.eButton.addEventListener('click', this.eventListener);
    }
};

function compare_date_in_filter(filterLocalDateAtMidnight, cellValue) {
    if (cellValue == null) return 0;

    var dateParts = cellValue.split(' ')[1].split('.');
    var cellDate = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));

    if (filterLocalDateAtMidnight > cellDate) {
        return -1;
    } else if (filterLocalDateAtMidnight < cellDate) {
        return 1;
    } else {
        return 0;
    }
}

gridOptions.getRowStyle = function (params) {
    if (params.node.rowPinned) {
        return {
            'font-weight': 'bold',
        };
    }
};
