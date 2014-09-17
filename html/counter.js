$(function(){
    var stat = function (nrasp) {
        var counter = 0, n = 0;
        var byHour = {};
        //var last = rasp[6][rasp[6].length - 1],
        var min = {m: 60, id: -1}, max = {m: 0, id: -1};
        var last;
        var minD = {m: 120, between: []}, maxD ={m: 0, between: []};

        var rasp = {};

        var diffs = {};
        Object.keys(nrasp).map(function(i){
            for (var j = 0; j < nrasp[i].length; j++) {
                if (nrasp[i][j].indexOf('Д') === -1) {
                    if (!rasp[i]) {
                        rasp[i] = [];
                    }
                    rasp[i].push(nrasp[i][j]);
                    //rasp[i].splice(j, 1);
                }
            }
        })
        console.log(rasp);

        var updateDiffs = function (i) {
            if (!diffs[i]) {
                diffs[i] = 0;
            }
            diffs[i]++;
        }


        Object.keys(rasp).map(function(i){

            if (!rasp[i]) {
                last += 60;
            } else {
                var accum = 0;
                for (var j = 0; j < rasp[i].length; j++) {
                    if (!last) {
                        last = +(i + '' + rasp[i][0]);
                    } else {
                        var curr = i + '' + rasp[i][j];
                        if (curr.indexOf('Д') === -1) {
                            curr = parseInt(curr);
                            
                            var differ = function (a, b) {
                                a = (''+a).split('');
                                b = (''+b).split('');

                                a_mins = +[a.pop(), a.pop()].reverse().join('');
                                b_mins = +[b.pop(), b.pop()].reverse().join('');

                                a_hour = +a.join('');
                                b_hour = +b.join('');

                                if (a_hour === b_hour) {
                                    return a_mins - b_mins;
                                } else {
                                    return a_mins + (60 - b_mins) + 60 * (a_hour - b_hour - 1);
                                }
                            }

                            diff = differ(curr, last);
                            console.log(curr, last, diff);
                            
                            updateDiffs(diff - diff % 5);


                            accum += diff;
                            if (diff <= minD.m) {
                                if (minD.m !== diff) {
                                    minD.between = [];
                                }
                                minD.m = diff;
                                minD.between.push([last, curr]);
                            }
                            if (diff >= maxD.m) {
                                if (maxD.m !== diff) {
                                    maxD.between = [];
                                }
                                maxD.m = diff;
                                maxD.between.push([last, curr]);
                            }

                            last = curr;
                        }
                    }
                }
                //console.log('total journeys: ', j, ' accumulator: ', accum, ' interval ', accum / j)
                byHour[i] = accum / j;

                if (byHour[i] < min.m) {
                    min.m = byHour[i];
                    min.id = i;
                }
                if (byHour[i] > max.m) {
                    max.m = byHour[i];
                    max.id = i;
                }
                counter++;
                //console.log('total', n, rasp[i], rasp[i].length);
                n += rasp[i].length;
                //last = rasp[i][rasp[i].length - 1];
            }
        });

        console.log('средний интервал ', counter/n * 60);
        console.log(min, max);

        Object.keys(byHour).map(function(i){
            var o = Math.ceil(byHour[i]) % 10;
            if (o === 0 || o > 4) {
                var s = ' минут';
            }
            else if (o > 1 || o < 5) {
                var s = ' минуты';
            } else {
                s = ' минута';
            }
            if (!byHour[i]) {
                console.log(i + ': поездов нет')
            } else {
                console.log(i + ':', Math.ceil(byHour[i]) + s);
            }
        })
        console.log(minD, maxD);
        console.log('всего поездов:', n);

        Object.keys(diffs).map(function(i, j){
            console.log('поездов с интервалом от ', i, ' до ', (+i+5), ' всего: ', diffs[i], ' процент: ', (diffs[i] / n) * 100 + '%')
        })
    }


    stat(data.tram[15]['Вторчермет'].base);
})
