// скрипт для панели навигации
var tokenlist = ['#csrf_token'];

var is_save_sessions = $.cookie('save_sessions');


var chosen_def = {
    no_results_text: "Ничего не найдено по запросу: ",
    search_contains: true,
    display_disabled_options: false,
    display_selected_options: false,
    allow_single_deselect: true,
    disable_search_threshold: 5,
    width: '100%'
};

$(document).ready(function () {

    $('#full_screen').click(function () {
        toggleFullscreen();
    });

    $(window).scroll(function () {
        if ($(this).scrollTop() > 50) {
            $('.my-back-to-top, .my-refresh-data').fadeIn();
        } else {
            $('.my-back-to-top, .my-refresh-data').fadeOut();
        }
    });

    /** При нажатии на кнопку мы перемещаемся к началу страницы */
    $('.my-back-to-top').click(function () {
        $('body,html').animate({
            scrollTop: 0
        }, 500);
    });

    // для сайдбара
    $("#menu-toggle").click(function (e) {
        e.preventDefault();
        menu_toggle();
    });
    $("#menu-toggle-2").click(function (e) {
        e.preventDefault();
        menu_toggle_2();
    });

    $("#sidebar-wrapper-help").click(function (e) {
        e.preventDefault();
        menu_toggle();
    });

    $('#sidebar-wrapper').mouseleave(function () {
        $('#menu ul').hide(200);
        $('#menu li a i').removeClass('fa-chevron-down_open');
    });


    function menu_toggle() {
        $("#wrapper").toggleClass("toggled");
    }

    function menu_toggle_2() {
        $("#wrapper").toggleClass("toggled-2");
        $('#menu ul').hide();
        $('#menu li a i').removeClass('fa-chevron-down_open');
    }

    initMenu();


    $('#user_name').focus().keyup(function (e) {
        if (e.keyCode == 13) {
            $('#user_password').focus();
        }
    });
    $('#user_password').keyup(function (e) {
        if (e.keyCode == 13) {
            login();
        }
    });

    $('#signIn').click(function () {
        login();
    });


    $('#signOut').click(function () {
        logout();
    });

    var location = window.location.href;
    var mass_url = location.split('/');
    var cur_url = '/' + mass_url[mass_url.length - 2] + '/';
    $('#menu li').each(function () {

        var link = $(this).find('a').attr('href');
        if (cur_url === link) {

            $(this).addClass('active');
        }
    });

    // $('li.active').parent().siblings().addClass('open');
    // $('li.active').parent().slideDown('normal');
    // $('.sidebar-nav a.open i.fa-chevron-down').addClass('fa-chevron-down_open');

    $('.js-tilt').tilt({
        scale: 1.1
    });

});

function set_advertiser_balance(data) {
    var result = '';
    if (data.balance_type.length === 0) {

        var balance = get_balance(data.offers);
        var leads = get_lead(data.offers);

        result += set_advertiser_balance_view(balance, 'Баланс', 'руб.');
        result += ' (';
        result += set_advertiser_balance_view(leads, 'Лиды', 'шт.');
        result += ')';

    } else {
        var value = 0;
        switch (data.balance_type[0]['code']) {
            case 'rub':
                value = get_balance(data.offers);
                break;
            case 'leads':
                value = get_lead(data.offers);
                break;
            default:
                break;
        }
        result += set_advertiser_balance_view(value, data.balance_type[0]['name'], data.balance_type[0]['encounter_type']);
    }

    $('#advertiser_balance').html(result);
}

function set_advertiser_balance_view(value, name, encounter_type) {
    var result = '';
    var color = 'black';
    if (value < 0) {
        color = 'red';
    }
    result += '<span style="cursor:help; color: ' + color + '" title="' + name + '">';
    result += value;
    result += ' ';
    result += encounter_type;
    result += '</span>';
    return result;
}

function login() {
    let token = $($(tokenlist[0]).children()[0]).val();
    var user_name = $.trim($('#user_name').val());
    var user_password = $.trim($('#user_password').val());
    var save_sessions = $('#not_save_sessions').prop("checked");

    if (user_name.length === 0 && user_password.length === 0) {
        show_input_alert("#user_name", 'error', 'keyup');
        show_input_alert("#user_password", 'error', 'keyup');
        show_global_alert('danger', 'Обязательно укажите имя пользователя и пароль', 2);
        return;
    }

    if (user_name.length === 0) {
        show_input_alert("#user_name", 'error', 'keyup');
        show_global_alert('danger', 'Обязательно укажите имя пользователя', 2);
        return;
    }


    if (user_password.length === 0) {
        show_input_alert("#user_password", 'error', 'keyup');
        show_global_alert('danger', 'Обязательно укажите пароль', 2);
        return;
    }

    let data = {
        'username': user_name,
        'password': user_password,
        'csrfmiddlewaretoken': token
    };

    if (!save_sessions) {
        $.cookie('save_sessions', true, {path: '/', expires: 1000});
    } else {
        $.cookie('save_sessions', true, {path: '/'});
    }

    ajax_message('/login_view/', data);
}

function toggleFullscreen(elem) {
    elem = elem || document.documentElement;
    if (!document.fullscreenElement && !document.mozFullScreenElement &&
        !document.webkitFullscreenElement && !document.msFullscreenElement) {


        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        $('#full_screen_label').removeClass('fa-expand');
        $('#full_screen_label').addClass('fa-compress');
    } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
        $('#full_screen_label').removeClass('fa-compress');
        $('#full_screen_label').addClass('fa-expand');
    }
}

function logout() {
    let my_token = $($(tokenlist[0]).children()[0]).val();
    let data = {'csrfmiddlewaretoken': my_token};
    ajax_message('/logout_view/', data)
}

function initMenu() {

    $('#menu ul').hide();
    $('#menu ul').children('.current').parent().show();
    $('#menu li a').click(
        function () {
            var checkElement = $(this).next();
            if ((checkElement.is('ul')) && (checkElement.is(':visible'))) {
                checkElement.slideDown('normal');
                $('#menu ul:visible').slideUp('normal');
                $('.open').removeClass('open');
                $('.sidebar-nav a i.fa-chevron-down').removeClass('fa-chevron-down_open');
                return false;
            }
            if ((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
                $('#menu ul:visible').slideUp('normal');
                checkElement.slideDown('normal');
                $('.open').removeClass('open');
                $('.sidebar-nav a i.fa-chevron-down').removeClass('fa-chevron-down_open');
                $(this).addClass('open');
                $('.sidebar-nav a.open i.fa-chevron-down').addClass('fa-chevron-down_open');
                return false;
            }
        }
    );
}


// скрипт для загрузки файла
$(function () {
    // We can attach the `fileselect` event to all file inputs on the page
    $(document).on('change', ':file', function () {
        var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);
    });

    // We can watch for our custom `fileselect` event like this
    $(document).ready(function () {
        $(':file').on('fileselect', function (event, numFiles, label) {

            var input = $(this).parents('.input-group').find(':text'),
                log = numFiles > 1 ? numFiles + ' files selected' : label;

            if (input.length) {
                input.val(log);
            } else {
                if (log) alert(log);
            }

        });
    });

});