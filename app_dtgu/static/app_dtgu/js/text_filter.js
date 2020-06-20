// собственный фильтр
function TextFilter() {
}

TextFilter.prototype.init = function (params) {
    var self = this;
    self.valueGetter = params.valueGetter;
    self.all_default_val = [];
    self.all_unselected_val = [];
    self.col = params;

    self.destroy();
    self.setupGui(params);
    self.set_select_filter();
};

TextFilter.prototype.afterGuiAttached = function () {
    var self = this;
    if (!self.isFilterActive()) {
        self.set_select_filter();
    }
};
// not called by ag-Grid, just for us to help setup
TextFilter.prototype.setupGui = function (params) {
    let self = this;

    // установка события на отображения иконки меню при открытом фильтре
    let listener_menu = function (event) {
        if (event.column.menuVisible) {
            $('[col-id="' + self.col.column.colId + '"]').find(' .ag-header-cell-menu-button').addClass('opacity_one');
        } else {
            $('[col-id="' + self.col.column.colId + '"]').find(' .ag-header-cell-menu-button').removeClass('opacity_one');
        }
        // event.colDef.enableMenu = true
        // event.hidePopupMenu()
    };
    let column = self.col.column.columnApi.getColumn(self.col.column);
    column.addEventListener('menuVisibleChanged', listener_menu);


    self.gui = document.createElement('div');
    self.gui.innerHTML = '<div class="main_filter_block" >';

    //создаем модалку для фильтра
    if (self.col.circle_filter) {
        self.gui.querySelector('.main_filter_block').innerHTML +=
            '<div class="form-group">' +
            '<div class="form-control" style="padding: 6px 10px !important;">' +
            '<div style="float:left;"><i class="fa fa-circle icon_circle icon_circle_style" style="color: rgba(255,35,37,0.35)"></i></div>' +
            '<div style="float:left;"><i class="fa fa-circle icon_circle icon_circle_style" style="color: rgba(248,255,35,0.35)"></i></div>' +
            '<div style="float:left;"><i class="fa fa-circle icon_circle icon_circle_style" style="color: rgba(24,255,33,0.35)"></i></div>' +
            '<div style="float:left;"><i class="fa fa-circle icon_circle icon_circle_style" style="color: rgba(43,51,255,0.35)"></i></div>' +
            '<div style="float:left;"><i class="fa fa-circle icon_circle icon_circle_style" style="color: rgba(91,192,222,0.35)"></i></div>' +
            '<div style="float:right; "><i class="fa fa-close icon_circle icon_circle_spin"></i></div>' +
            '</div>';
    }

    self.gui.querySelector('.main_filter_block').innerHTML += '<div id="filter_checkbox_place"></div>';

    async function set_select_filter_async() {

        let all_row = getAllRows(self.col);
        let all_cells = [];

        all_row.forEach(function (item) {
            var elem = item[self.col.colDef.field] === null ? '' : $.trim(item[self.col.colDef.field].toString());
            if (!is_int(elem) && is_int(monthToComparableNumber(elem))) {
                elem = elem.split(' ')[1] === undefined ? elem.split(' ')[0] : elem.split(' ')[1];
            }
            if (!is_in_array(elem, all_cells)) {
                if (for_value_with_number_and_string(all_cells[all_cells.length - 1], elem) === -1) {
                    all_cells.push(elem);
                } else {
                    for (var i = 0; i < all_cells.length; i++) {
                        if (for_value_with_number_and_string(all_cells[i], elem) === 1) {
                            all_cells.insert(i, elem);
                            break;
                        }
                    }
                }
            }
        });


        var result = '';
        if (all_cells.length !== 0) {
            result +=
                '<div class="form-group">' +
                '<input id="filter_my_checkbox" type="text" class="form-control" size="25" placeholder="Поиск...">' +
                '</div>' +
                '<div class="form-group">' +
                '<div class="form-group" style="text-align: center;">' +
                '<a id="select_all_cell"><span class="left" style="color: #2a93d5; cursor: pointer">Выбрать все</span></a>' +
                '<span>&nbsp;&nbsp;&nbsp;</span>' +
                '<a id="reset_all_cell"><span class="right" style="color: #2a93d5; cursor: pointer">Очистить</span></a>' +
                '</div>' +
                '<div id="checkboxes">' +
                '<ul class="li_cells" style="padding: 0 10px 0 10px;">';


            var id = self.col.column.colId + '_' + parseInt(Math.random() * 1000);
            var id_iter = 0;
            all_cells.forEach((item) => {
                let item_less = item;
                if (item === '') {
                    item_less = '(Пустые)';
                } else {
                    item_less = item_less.toString().cut_text(16);
                }
                id_iter++;
                result +=
                    '<li>' +
                    '<input id="' + id + '_' + id_iter + '" data-id="' + item + '" type="checkbox" class="my_checkbox my_filter_checkbox" style="display: none;">' +
                    '<label for="' + id + '_' + id_iter + '" class="check" style="padding: 0">' +
                    '<svg width="18px" height="18px" viewBox="0 0 18 18">' +
                    '<path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z"></path>' +
                    '<polyline points="1 9 7 14 15 4"></polyline>' +
                    '</svg>' +
                    '<label for="' + id + '_' + id_iter + '" style="padding: 5px;font-weight: normal;">' + item_less + '</label>' +
                    '</label>' +
                    '</li>';
            });
            result +=
                '</ul>' +
                '</div>' +
                '</div>';
            await set_select_filter_async_result({
                'text': result,
                'val': all_cells
            });
        }

    }

    function set_select_filter_async_result(result) {
        self.gui.querySelector('#filter_checkbox_place').innerHTML = result.text;
        self.all_default_val = result.val;

        self.checkbox_filter = self.gui.querySelectorAll('.my_filter_checkbox');
        $(self.checkbox_filter)
            .prop('checked', true)
            .change(function () {
                listener_checkbox(this);
            });

        self.gui.querySelector('#select_all_cell').addEventListener('click', () => {
            checkbox_filter_auto(true);
        });
        self.gui.querySelector('#reset_all_cell').addEventListener('click', () => {
            checkbox_filter_auto(false);
        });

        function checkbox_filter_auto(marker){
            for (var i=0;  i< self.checkbox_filter.length; i++) {
                if (!$(self.checkbox_filter[i]).parent().hasClass('hidden')) {
                    $(self.checkbox_filter[i]).prop('checked', marker);
                    listener_checkbox(self.checkbox_filter[i]);
                }
            }
        }

        self.filter_my_checkbox = self.gui.querySelector('#filter_my_checkbox');
        self.filter_my_checkbox.addEventListener("change", listener);
        self.filter_my_checkbox.addEventListener("paste", listener);
        self.filter_my_checkbox.addEventListener("input", listener);

    }

    self.set_select_filter = function () {
        // создаем массив из уникальных значений в таблице для отображения в фильтре
        set_select_filter_async();
    };

    // устанавливаем события для элементов
    self.gui.querySelectorAll('.icon_circle').forEach(item => {
        item.addEventListener('click', function () {
            self.change_color(item);
        })
    });


    function listener(event) {
        if (event.target.value.length !== 0) {
            self.hide_my_filter_checkbox(event.target.value);
        } else {
            $(self.checkbox_filter).parent().removeClass('hidden');
            self.deselect_by_array(self.all_unselected_val);
        }
    }

    function listener_checkbox(event) {
        let value_cell = $(event).attr('data-id');
        let mass = [];


        if (!self.isFilterActive()) {
            mass = copy_obj(self.all_default_val);
        } else {
            mass = copy_obj(self.filterText);
        }

        if ($(event).prop('checked')) {
            mass.push($(event).attr('data-id'));
            mass = mass.filter(uniqueVal);

            self.all_unselected_val = remove_from_array(self.all_unselected_val, value_cell);
        } else {
            mass = remove_from_array(mass, value_cell);
            self.all_unselected_val.push(value_cell);
        }

        self.filterText = copy_obj(mass);

        self.test_checkbox_filtered();

        self.refresh_row_by_filter();
    }

    // устанавливаем дефолтные значения в элементах после асинхронного обновления данных
    if (self.isFilterActive()) {
        if (typeof self.filterText === 'object') {
            self.selected_checkbox_filtered();
        }
    }
};

TextFilter.prototype.refresh_row_by_filter = function () {
    var self = this;
    self.col.filterChangedCallback();
    if (self.col.total_row) {
        set_total_row();
    }
};

TextFilter.prototype.getGui = function () {
    return this.gui;
};

TextFilter.prototype.doesFilterPass = function (params) {
    var self = this;
    let passed = true;

    if (self.isFilterActive() && typeof self.filterText === "object") {
        let valueGetter = self.valueGetter;
        let value = valueGetter(params);
        value = value === null ? '' : $.trim(value);
        if (!is_int(value) && is_int(monthToComparableNumber(value))) {
            value = value.split(' ')[1] === undefined ? value.split(' ')[0] : value.split(' ')[1];
            var itog = self.filterText.filter(item => {
                return value === item; // тут логика сравнения
            });
            if (itog.length === 0) {
                passed = false;
            }
        } else {
            if (self.filterText.indexOf(value.toString()) < 0) {
                passed = false;
            }
        }
    }
    return passed;
};

TextFilter.prototype.isFilterActive = function () {
    return this.filterText !== null && this.filterText !== undefined;
};

TextFilter.prototype.test_checkbox_filtered = function () {
    var self = this;
    var count = self.gui.querySelectorAll('.my_filter_checkbox:checked').length;
    if (count === self.all_default_val.length) {
        self.destroy();
    }
};

TextFilter.prototype.selected_checkbox_filtered = function () {
    var self = this;
    $(self.checkbox_filter).prop('checked', false);
    for (var i = 0; i < this.filterText.length; i++) {
        $(self.gui.querySelectorAll('.my_filter_checkbox[data-id="' + this.filterText[i] + '"]')).prop('checked', true);
    }
};

TextFilter.prototype.re_init = function (old_unselected) {
    old_unselected = old_unselected === undefined ? [] : old_unselected;
    this.init(this.col);
    this.deselect_by_array(old_unselected);
};

TextFilter.prototype.deselect_by_array = function (array) {
    this.all_unselected_val = copy_obj(array);
    this.filterText = remove_array_from_array(copy_obj(this.all_default_val), this.all_unselected_val);
    this.selected_checkbox_filtered();
    this.test_checkbox_filtered();
    this.refresh_row_by_filter();
};

TextFilter.prototype.destroy = function () {
    this.filterText = null;
    this.all_unselected_val = [];
};

TextFilter.prototype.full_destroy = function () {
    this.destroy();
    this.refresh_row_by_filter();
};

TextFilter.prototype.soft_full_destroy = function () {
    var old_unselected = copy_obj(this.all_unselected_val);
    this.full_destroy();
    return old_unselected;
};

TextFilter.prototype.set_empty = function () {
    this.filterText = [];
    this.all_unselected_val = copy_obj(this.all_default_val);
};
TextFilter.prototype.set_full = function () {
    this.filterText = copy_obj(this.all_default_val);
    this.all_unselected_val = [];
};

TextFilter.prototype.change_color = function (elem) {
    var self = this;
    let color = $(elem).css('color');
    let field = self.col.colDef.field;
    var background = '';
    if (!$(elem).hasClass('fa-close')) {
        background = String(color);
    }
    self.col.column.colDef.cellStyle = {'background-color': background};
    try {
        save_column_data(field, {'color': background});
    } catch (e) {
    }
    gridOptions.api.refreshCells({
        force: true
    });
};

TextFilter.prototype.hide_my_filter_checkbox = function (val) {
    var self = this;
    var my_filter_checkbox = $(self.checkbox_filter);
    my_filter_checkbox.parent().addClass('hidden');
    for (var i = 0; i < my_filter_checkbox.length; i++) {
        if ($(my_filter_checkbox[i]).attr('data-id').toLowerCase().indexOf(val.toLowerCase()) === 0) {
            $(my_filter_checkbox[i]).parent().removeClass('hidden');
        }
    }
};