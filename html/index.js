$(function(){

    var signs = [];

    ['tram', 'trol'].map(function(type){
            var numbers = Object.keys(data[type]);
            if (type === 'trol') {
                var trol = true;
            }
            numbers.map(function(i){
                var route = data[type][i];

                var $sign = $('.sign').clone();

                if (trol) {
                    $sign.addClass('trol');
                }

                var route_keys = Object.keys(route);

                //if (route_keys.length === 1) {
                    //return;
                //} else {
                    route_keys.map(function(name, nu){
                        var r = nu;
                        if (route_keys.length === 1) {
                            var rr = r;
                        } else {
                            var rr = 1 - r;
                        }

                        var sign = $sign.clone();
                        sign.find('.number').text(i);
                        sign.find('.direction__to').text(Object.keys(route)[rr]);

                        var baseTable = sign.find('.timetable').eq(0).clone();
                        sign.find('.timetable').remove();

                        ['base', 'saturday', 'sunday'].map(function(key){
                            if (!route[Object.keys(route)[r]][key]) {
                                return;
                            }
                            var table = baseTable.clone();

                            table.find('.timetable__header').text('Отправление от остановки «' + Object.keys(route)[r] + "»" + (key === 'saturday' && ' (по субботам)' || key === 'sunday' && ' (по воскресеньям)' || ''));

                            var headers = table.find('.timetable__times tr').eq(0);
                            headers.html('');
                            var times = table.find('.timetable__times tr').eq(1);
                            times.html('');
                            Object.keys(route[Object.keys(route)[r]][key]).map(function(i){
                                headers.append($('<th></th>').html(i));

                                var col = route[Object.keys(route)[r]][key][i];
                                var t = [];
                                col.map(function(j){
                                    var el = $('<span></span>');
                                    var txt = j;

                                    if (/Д/.test(txt)) {
                                        el.addClass('depot');
                                        txt = txt.replace('Д', '');
                                    }
                                    t.push(el.html(txt));
                                })
                                times.append($('<td></td>').html(t));
                            })

                            sign.find('.info').before(table);
                        })

                        sign && signs.push(sign);
                    })
                //}


            })

    })

    $('body').append(signs);


});
