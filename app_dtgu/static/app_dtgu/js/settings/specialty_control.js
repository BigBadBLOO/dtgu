var specialty = [];

var href_init = '/specialty_control_init/';
var href_work = '/work_specialty/';
var href_del = '/delete_specialty/';


my_filters = {};

gridOptions.columnDefs = [
    {
        headerName: "ID", field: "id", sortable: true, suppressSizeToFit: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
        comparator: for_value_with_number_and_string,
        filter: TextFilter,
        minWidth: 100,
    },
    {
        headerName: "Название",
        field: "name",
        resizable: true,
        sortable: true,
        comparator: for_value_with_number_and_string,
        filter: TextFilter,
        minWidth: 150,
    },
    {
        headerName: "Название на англ.",
        field: "name_en",
        sortable: true,
        resizable: true,
        comparator: for_value_with_number_and_string,
        filter: TextFilter,
        minWidth: 130,
    },
    {
        headerName: "Код специальности",
        field: "code",
        sortable: true,
        resizable: true,
        minWidth: 130,
        comparator: for_value_with_number_and_string,
        filter: TextFilter,
    },
    {
        headerName: "Код специальности на англ.",
        field: "code_en",
        sortable: true,
        resizable: true,
        minWidth: 130,
        comparator: for_value_with_number_and_string,
        filter: TextFilter,

    },
    {headerName: "Редактировать", field: "edit", minWidth: 120, suppressSizeToFit: true, cellRenderer: 'Button'},
];


function test_data(data) {
    if (data['name'].length === 0) {
        show_input_alert("#username", 'error', null);
        show_global_alert('danger', 'Обязательно укажите имя пользователя', 2);
        return false;
    }

    return true;
}


function set_panel_data(data) {

    if (typeof data !== 'object') {
        data = search_in_json(specialty, 'id', data);
    }

    $("#name").val(data["name"]);
    $("#name_en").val(data["name_en"]);
    $("#code").val(data["code"]);
    $("#code_en").val(data["code_en"]);
    my_modal_panel.find('.chosen-select').trigger("chosen:updated").change();
}

function get_panel_data() {
    return {
        "id": type_edit,
        "name": $.trim($("#name").val()),
        "name_en": $("#name_en").val(),
        "code": $("#code").val(),
        "code_en": $.trim($("#code_en").val()),
    };
}

function delete_from_list(items) {
    specialty = remove_list_from_json(specialty, 'id', items);
}

function set_data_to_table(data) {
    force_close_modal();
    console.log(data);
    var specialty = data.specialty[0];


    if (type_edit === -1) {
        add_row(make_one_row(specialty));
    } else {
        set_data_to_row(make_one_row(specialty));
    }
}

function set_data_to_row(data) {
    var rowNode = gridOptions.api.getRowNode(type_edit);

    rowNode.setDataValue('name', data['name']);
    rowNode.setDataValue('name_en', data['name_en']);
    rowNode.setDataValue('code', data['code']);
    rowNode.setDataValue('code_en', data['code_en']);
}

function set_data(data) {
    specialty = data.specialty;
    set_table_data(specialty);
}


function make_one_row(data) {
    return {
        id: data['id'],
        name: data['name'],
        name_en: data['name_en'],
        code: data['code'],
        code_en: data['code_en'],
        edit: 'Изменить'
    }
}