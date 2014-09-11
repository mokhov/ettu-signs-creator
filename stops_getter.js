var request = require('request');
var Buffer = require('buffer').Buffer;
var Iconv  = require('iconv').Iconv;
var fs = require('fs');

// Урлы для забора данных об аэропортах
var urls = {
    'tram': 'http://www.ettu.ru/pass/routes/tm<n>/',
    'trol': 'http://www.ettu.ru/pass/routes/tl<n>/'
};

var numbers = {
    tram: 34,
    trol: 20
}


Object.keys(numbers).map(function(tt){
    for (var i = 1; i <= numbers[tt]; i++) {
        (function(i){
            request({
                    uri: urls[tt].replace('<n>', i),
                    method: 'POST',
                    encoding: 'binary'
                }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    body = new Buffer(body, 'binary');
                    conv = new Iconv('windows-1251', 'utf8');
                    body = conv.convert(body).toString();

                    fs.writeFile('stops/' + tt + '_' + i + '_' + new Date().toISOString() + '.html', body, function (err) {
                        if (!err) {
                            console.log('Successfully got ' + tt + '_' + i + ' airport timetable');
                        } else {
                            console.log(err);
                        }
                    });
                }
            });
        })(i)
    }
})
