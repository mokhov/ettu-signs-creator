//var file = process.argv[2];
var Buffer = require('buffer').Buffer;
var Iconv  = require('iconv').Iconv;
var parseString = require('xml2js').parseString;
var jsdom = require("jsdom");


//if (!file) {
    //console.error('no file given');
//}

//var iata = file.split('/')[0] || 'svx';
//var airport = {
    //'svx': 'Екатеринбург',
    //'pee': 'Пермь',
    //'kuf': 'Самара',
    //'goj': 'Нижний Новгород'
//}[iata];

var xml2js = require('xml2js');
var fs = require('fs');

var files = fs.readdirSync('stops');
var result = { tram : {}, trol: {} };

var next = function () {
    if (files.length === 0) {
        fs.writeFile('html/stops_data.js', 'var stops = ' + JSON.stringify(result), function (err) {
            if (!err) {
                console.log('Successfully written to processed.json');
            } else {
                console.log(err);
            }
        });
        return;
    }
    processFile(files.shift())
}

var result = { tram: {}, trol: {} };


var processFile = function(file){
    console.log('processing ' + file);
    var type = file.split('_')[0];
    var route = file.split('_')[1];

    var data = fs.readFileSync('stops/' + file);

    var body = new Buffer(data, 'binary');
    conv = new Iconv('utf8', 'utf8');
    body = conv.convert(body).toString();

    result[type][route] = {stops: [], length: '', depot: '', time: ''};


    jsdom.env(
      body,
      ["http://code.jquery.com/jquery.js"],
      function (errors, window) {
          var $ = window.$;

            var stops_html = $('#main_block').find('table').eq(0).html().split('\n');
            stops_html.unshift();

            stops_html.map(function(stop){
                if (/Депо/.test(stop)) {
                    var depot = $.trim(stop.replace('Депо:', '').replace(/[:\n\t,\.]/g, '').replace(/<\/?\w+\/?>/g,'').replace('&nbsp;', ' ')).split(' ');
                    result[type][route].depot = depot;
                }
                if (/Длина/.test(stop)) {
                    result[type][route].length = /(\d+\,?\s?\d*\sкм)/.exec(stop)[1]
                }
                if (/Время/.test(stop)) {
                    result[type][route].time = /(\d+\sмин)/.exec(stop)[1]
                }

                if (/\d+\)/.test(stop)) {
                    result[type][route].stops.push($.trim(stop.replace(/[:\n\t,\.]/g, '').replace(/<\/?\w+\/?>/,'').replace('&nbsp;', ' ')));
                }
            });
            next();
         }
    );
};

next();

