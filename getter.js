var request = require('request');
var Buffer = require('buffer').Buffer;
var Iconv  = require('iconv').Iconv;
var fs = require('fs');
var zlib = require('zlib');
var curlify = require('request-as-curl');
var exec = require('child_process').exec;

// Урлы для забора данных об аэропортах
var types = {
    'tram': 'http://www.ettu.ru/pass/timetable/tram',
    'kuf': 'http://uwww.aero/1linerasp.ajax.5.19.php?pvr',
    'pee': 'http://www.aviaperm.ru/1linerasp.ajax.5.19.php?pvr',
    'goj': 'http://www.airportnn.ru/1linerasp.ajax.5.19.php?pvr'
};

// Значимые параметры, ищем среди них ИАТА коды аэропортов
var args = process.argv.splice(2);

if (args.length === 0 || !args) {
    args = ['svx', 'kuf', 'goj', 'pee'];
}

//args.map(function(iata){
    var curr_uri = types.tram;

    if (!curr_uri) {
        return;
    }

// Почему-то только CURL'ом получается забирать
var curl_str = "curl 'http://www.ettu.ru/pass/timetable/tram' -H 'Pragma: no-cache' -H 'Origin: http://www.ettu.ru' -H 'Accept-Encoding: gzip,deflate' -H 'Accept-Language: en-US,en;q=0.8,ru;q=0.6' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.94 Safari/537.36' -H 'Content-Type: application/x-www-form-urlencoded' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' -H 'Cache-Control: no-cache' -H 'Referer: http://www.ettu.ru/pass/timetable/tram' -H 'Cookie: admin_session=3b21ddf3ef3b3b3a68ceb673fbbda226; _ym_visorc_21022531=w' -H 'Connection: keep-alive' --data 'action=filter&type=%type%&track=m&track_head=%number%&station_head=%F1%F2.%C2%C8%C7&weekdays=weekdays&saturday=saturday&sunday=sunday' --compressed";
var types = {
    tram: Object.keys(new Array(35).join(' ').split('')),
    trol: Object.keys(new Array(21).join(' ').split(''))
};
Object.keys(types).map(function(j){
    types[j].map(function(i){
        types[j][i]++;
    });
});

// Добавляем недомаршруты
types.tram = types.tram.concat(['5%C0', '%C0']);

Object.keys(types).map(function (j) {
    var strr = curl_str.replace('%type%', j);
    types[j].map(function (i){
            var num = i;
            var str = strr.replace('%number%', num);
            exec(str, {encoding: 'binary'}, function (error, stdout, stderr) {
                //console.log('stdout: ' + stdout);
                var data = new Buffer(stdout, 'binary');
                conv = new Iconv('windows-1251', 'utf8');
                var body = stdout;
                var body = conv.convert(data).toString();
                fs.writeFile('schedules/' + j + '_' + num + '_' + new Date().toISOString() + '.html', body, function (err) {
                    if (!err) {
                        console.log('Successfully got ' + j + ' ' + num);
                    } else {
                        console.log(err);
                    }
                });
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });
        })
})
