var typeMarks = [];
var specialty = [];

$(document).ready(function () {
    ajax_message('/index_init/', {'csrfmiddlewaretoken': $($(tokenlist[0]).children()[0]).val()}, make_index)
});


function make_index(data) {
    typeMarks = data['TypeMarks'];
    specialty = data['Specialty'];
    $('#typeMarks').html(make_selector(typeMarks, true)).change(function () {
            var type_id = $(this).val();
            var type = search_in_json(typeMarks,'id', type_id);

            var html_text = '';
            var make_selector_trigger = false;
            if (type['name'] === 'Первичный') {
                 html_text =
                     '<label class="control-label" for="typeMarks">Cпециальность</label>\n' +
                    '<select id="speciality" data-placeholder="Cпециальность..."\n' +
                    'class="chosen-select form-control">\n' +
                    '</select>';
                 make_selector_trigger = true;

            }
            $('#second_block').html(html_text);
            if(make_selector_trigger){
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
        }
    )
}

function make_result() {
    hide_load();
}