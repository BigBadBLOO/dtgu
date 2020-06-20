var profile = [];
var profile_group = [];
var group = [];
var is_active = [{id: 1, name: 'Активный'}, {id: 0, name: 'Неактивный'}];


var href_init = '/account_control_init/';
var href_work = '/work_user_profile/';
var href_del = '/delete_admin_user_profile/';

var test_username = true;

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
        headerName: "ФИО",
        field: "first_name",
        resizable: true,
        sortable: true,
        comparator: for_value_with_number_and_string,
        filter: TextFilter,
        minWidth: 150,
    },
    {
        headerName: "Учетная запись",
        field: "username",
        resizable: true,
        sortable: true,
        comparator: for_value_with_number_and_string,
        filter: TextFilter,
        minWidth: 150,
    },
    {
        headerName: "Группа",
        field: "group",
        sortable: true,
        resizable: true,
        comparator: for_value_with_number_and_string,
        filter: TextFilter,
        minWidth: 130,
    },
    {
        headerName: "Статус",
        field: "is_active",
        sortable: true,
        resizable: true,
        minWidth: 130,
        comparator: for_value_with_number_and_string,
        filter: TextFilter,
        cellRenderer: function (params) {
            return make_typed_badges(params.value === 'Активный' ? 'outline-success' : 'outline-danger', params.value);
        }
    },
    {headerName: "Редактировать", field: "edit", minWidth: 120, suppressSizeToFit: true, cellRenderer: 'Button'},
];


function test_data(data) {
    if (data['username'].length === 0) {
        show_input_alert("#username", 'error', null);
        show_global_alert('danger', 'Обязательно укажите имя пользователя', 2);
        return false;
    }

    if (!test_username) {
        show_global_alert('danger', 'Пользователь с таким именем существует', 2);
        return false;
    }

    if (data['password'].length > 0 && data['password'].length < 8) {
        show_input_alert("#password", 'error', 'keyup');
        show_global_alert('danger', 'Длинна пароля должна быть не менее 8 символов', 2);
        return false;
    }

    if (data['password'] !== data['password_test']) {
        show_input_alert("#password_test", 'error', 'keyup');
        show_global_alert('danger', 'Указанные пароли не совпадают', 2);
        return false;
    }

    if (type_edit === -1) {
        if (data['password'].length === 0) {
            show_input_alert("#password", 'error', 'keyup');
            show_global_alert('danger', 'Обязательно укажите пароль', 2);
            return false;
        }
    }
    return true;
}

$(document).ready(function () {
    $('#username').on('keyup', function () {
        ajax_test_username()
    });
});

function ajax_test_username() {
    var data = {
        'username': $('#username').val(),
        'csrfmiddlewaretoken': $($(tokenlist[0]).children()[0]).val()
    };
    hide_input_alert("#username", 'success');
    hide_input_alert("#username", 'error');

    if (data['username'].length !== 0) {
        if (data['username'] !== start_panel['username']) {
            show_input_alert("#username", 'warning', null);
            test_username = false;
            ajax_message('/test_username/', data, result_of_test_username);
        } else {
            show_input_alert("#username", 'success', null);
            test_username = true;
        }
    }
}

function result_of_test_username(data) {
    hide_input_alert("#username", 'warning');
    if (!!data.user_test) {
        show_input_alert("#username", 'error', null);
        test_username = false;
    } else {
        show_input_alert("#username", 'success', null);
        test_username = true;
    }
}

function set_panel_data(data) {

    if (typeof data !== 'object') {
        data = search_in_json(profile, 'id', data);
    }

    var user_g = search_in_json(profile_group, 'user_id', data.id);

    var gr = blank_panel.group | {id: 0};
    if (user_g !== null) {
        gr = search_in_json(group, 'id', user_g.group_id);
        if (gr === null) {
            gr = blank_panel.group | {id: 0};
        }
    }

    var user_s = is_active[data.is_active ? 0 : 1];

    $("#first_name").val(data["first_name"]);
    $("#username").val(data["username"]);
    $("#group").val(gr.id);
    $("#is_active").val(user_s.id);

    $("#password").val('');
    $("#password_test").val('');
    my_modal_panel.find('.chosen-select').trigger("chosen:updated").change();
}

function get_panel_data() {
    return {
        "id": type_edit,
        "first_name": $.trim($("#first_name").val()),
        "username": $.trim($("#username").val()),
        "group": $("#group").val(),
        "is_active": $("#is_active").val(),
        "password": $.trim($("#password").val()),
        "password_test": $.trim($("#password_test").val())
    };
}

function delete_from_list(items) {
    profile = remove_list_from_json(profile, 'id', items);
}

function set_data_to_table(data) {
    force_close_modal();

    var user = data.user[0];

    var u_group = data.group[0];

    profile = remove_from_json(profile, 'id', user.id);
    profile.push(user);

    profile_group = remove_from_json(profile_group, 'user_id', user.id);
    if (u_group !== null) {
        profile_group.push(u_group);
    }

    profile_group = remove_from_json(profile_group, 'user_id', data.id);

    if (type_edit === -1) {
        add_row(make_one_row(user));
    } else {
        set_data_to_row(make_one_row(user));
    }
}

function set_data_to_row(data) {
    var rowNode = gridOptions.api.getRowNode(type_edit);

    rowNode.setDataValue('username', data['username']);
    rowNode.setDataValue('first_name', data['first_name']);

    rowNode.setDataValue('group', data['group']);
    rowNode.setDataValue('is_active', data['is_active']);
}

function set_data(data) {
    profile = data.profile;

    profile_group = data.profile_group;
    group = data.group;

    set_table_data(profile);
    set_many_select();
}

function set_many_select() {
    $("#group").html(make_selector(group)).chosen(chosen_def);
    $("#is_active").html(make_selector(is_active)).chosen(chosen_def);
}


function make_one_row(data) {

    var user_g = search_in_json(profile_group, 'user_id', data.id);

    var gr = null;
    if (user_g !== null) {
        gr = search_in_json(group, 'id', user_g.group_id);
        if (gr === null) {
            gr = search_in_json(group, 'id', 0);
        }
    }

    var user_s = is_active[data.is_active && data.is_active == '1' ? 0 : 1];

    return {
        id: data['id'],
        username: data['username'],
        first_name: data['first_name'],
        group: gr === null ? '' : gr.name,
        is_active: user_s.name,
        edit: 'Изменить'
    }
}