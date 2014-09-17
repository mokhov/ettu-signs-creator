$(function(){
    var signs = [];

    var mins = function(a) {
        var o = a % 10;
        if (o === 0 || o > 4 || a % 100 >= 11 && a % 100 <= 15) {
            var s = ' минут';
        }
        else if (o > 1 && o < 5) {
            var s = ' минуты';
        } else {
            s = ' минута';
        }
        return a + s;
    };

    var trim_stop = function (stop) {
        return  stop.replace(/\d+\)\s?/, '').replace(/^ул/, 'улица').replace(/^пл/, 'площадь').replace(/^пр/, 'проспект');
    };

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

                        var $stops = sign.find('.stops');
                        $stops.html('');

                        var union = $('<div class="stops__union"></div>');

                        var stops_info = stops[type][i];
                        if (i === 'А') {
                            var stops_info = stops[type][31];
                        }
                        if (stops_info) {
                            var curr_stops = stops_info.stops;
                            var stops_time = parseInt(stops_info.time);
                            var stops_len = curr_stops.length;

                            if (trim_stop(curr_stops[0]) !== trim_stop(curr_stops[stops_len - 1])) {
                                stops_time = Math.round(stops_time/2);
                            }
                            stops_time = mins(stops_time);

                            if (curr_stops[0].indexOf(Object.keys(route)[rr]) > -1 ||
                                curr_stops[curr_stops.length - 1].indexOf(Object.keys(route)[r]) > -1) {
                                curr_stops = curr_stops.reverse();
                            }

                            curr_stops.map(function(stop, stopI){
                                var stop = trim_stop(stop);

                                if (stopI === 0) {
                                    $stops.append($('<div class="stops__pass"><div class="stops__pass-time">' + stops_time +'</div></div>'));
                                    $stops.append($('<div class="stops__key-stop"></div>').html(stop));
                                } else if (stopI === stops_len -1 ) {
                                    $stops.append(union);
                                    $stops.append($('<div class="stops__key-stop"></div>').html(stop));
                                } else {
                                    union.append($('<div></div>').html(stop));
                                }
                            })
                            //$stops.append(stops_info.depot.join(', '));
                        }

                        var baseTable = sign.find('.timetable').eq(0).clone();
                        sign.find('.timetable').remove();

                        var types = Object.keys(route[Object.keys(route)[r]]);

                        types.map(function(key){
                            if (!route[Object.keys(route)[r]][key]) {
                                return;
                            }
                            var table = baseTable.clone();

                            var extra_header = (key === 'base' && ' (будни)' || key === 'saturday' && ' (по субботам)' || key === 'sunday' && ' (по воскресеньям)' || key === 'dayoffs' && ' (выходные дни)' || '')
                            table.find('.timetable__header').text('Отправление от остановки «' + Object.keys(route)[r] + "»" + extra_header);

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
                                        if ((type !== 'trol' || Object.keys(route)[rr] !== 'Коммунистическая')) {
                                            el.addClass('depot');
                                        }
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
