var timeout = null;

function show_global_alert(my_class, my_text, my_timeout) {

    clearTimeout(timeout);
    $('#my_global_alert').remove();

    var result = '<div id="my_global_alert" class="alert alert-' + my_class + ' alert-dismissible text-center" role="alert" style="display: none;"><span class="lead">' + my_text + '</span></div>';

    $('body').append(result);

    $('#my_global_alert ').fadeIn('slow');

    $("#my_global_alert").click(function (e) {
        hide_global_alert();
    });

    if (my_timeout) timeout = setTimeout(hide_global_alert, my_timeout * 1000 + 1000);
}

function hide_global_alert() {
    $('#my_global_alert').fadeOut('slow');
}

function show_input_alert(marker, type, my_event) {
    $(marker).parent().addClass('has-' + type);

    $(marker).on(my_event, function (e) {
        e.preventDefault();
        hide_input_alert(marker, type);
        $(marker).unbind(my_event);
    })
}

function hide_input_alert(marker, type) {
    $(marker).parent().removeClass('has-' + type);
}


function exe_ack(text, func) {
    $('#ask_modal').show();
    $('#text_ask_modal').html(text);
    $('#submit_ask_modal').on('click', function (e) {
        e.preventDefault();
        func();
        $('#ask_modal').hide();
        $('#submit_ask_modal').unbind('click');
    });

    $('#dismiss_ask_modal').click(function (e) {
        e.preventDefault();
        $('#ask_modal').hide();
        $('#submit_ask_modal').unbind('click');
    });

}

function make_typed_badges(type, text) {
    return '<span class="badge badge-pill badge-' + type + '">' + text + '</span>';
}

function make_text_color(type, text) {
    return '<span style="color:' + type + '">' + text + '</span>';
}

function show_popover(self) {
    $(self).popover({
        container: 'body',
        placement: 'bottom',
        title: '',
        content: $(self).attr('data-title'),
        html: true,
        template: '<div class="popover" role="tooltip"><div class="popover-content"></div></div>'
        //delay: { "hide": 1000000 },
    }).popover('show').on('shown.bs.popover', function () {
        $(document).on('click scroll resize', function (e) {
            $(self).popover('destroy');
            $(document).unbind('click scroll resize');
        });
    });


}

function hide_popover() {

}