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

var files = fs.readdirSync('schedules');
var result = { tram : {}, trol: {} };

var next = function () {
    if (files.length === 0) {
        fs.writeFile('html/data.json', 'var data = ' + JSON.stringify(result), function (err) {
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

var endpoint_replacers = {
    'tram': {
        '5': [
            {
                'initial': 'Пл. 1 Пятилетки',
                'replacement': 'Площадь 1-ой пятилетки'
            },
            {
                'initial': ' М. Ботаническая',
                'replacement': 'метро "Ботаническая"'
            }
        ],
        '21': [
            {
                'initial': 'Кирова (в город)',
                'replacement': 'Кирова'
            }
        ],
        '24': [
            {
                'initial': 'Пл. 1 Пятилетки',
                'replacement': 'Площадь 1-ой пятилетки'
            }
        ],
        '26': [
            {
                'initial': 'УГТУ',
                'replacement': 'УрФУ'
            }
        ],
        '27': [
            {
                'initial': 'Челюскинцев (кп,с Вокзала)',
                'replacement': 'ЖД Вокзал'
            }
        ],
        '32': [
            {
                'initial': 'Дв. Спорта',
                'replacement': 'Дворец спорта'
            }
        ],
        '33': [
            {
                'initial': 'Дв. Спорта',
                'replacement': 'Дворец спорта'
            }
        ],
        '34': [
            {
                'initial': ' М  Ботаническая',
                'replacement': 'метро "Ботаническая"'
            }
        ],
        'А': [
            {
                'initial': 'Пл. Коммунаров',
                'replacement': 'Площадь Коммунаров'
            }
        ],
        '5А': [
            {
                'initial': 'Пл. 1 Пятилетки',
                'replacement': 'Площадь 1-ой пятилетки'
            }
        ],
    },
    'trol': {
        '1': [
            {
                'initial': 'Вокзал',
                'replacement': 'ЖД Вокзал'
            }
        ],
        '3': [
            {
                'initial': 'cт.Посадская',
                'replacement': 'Посадская'
            }
        ],
        '4': [
            {
                'initial': 'Динамо',
                'replacement': 'метро "Динамо"'
            }
        ],
        '7': [
            {
                'initial': 'cт.Посадская',
                'replacement': 'Посадская'
            }
        ],
        '9': [
            {
                'initial': 'cт.ф.Альвис',
                'replacement': 'табачная фабрика "Альвис"'
            },
            {
                'initial': 'Вокзал',
                'replacement': 'ЖД Вокзал'
            }
        ],
        '11': [
            {
                'initial': 'Нач.Онуфриева',
                'replacement': 'улица Начдива Онуфриева'
            },
            {
                'initial': 'гСвердл',
                'replacement': 'гостиница "Свердловск"'
            }
        ],
        '14': [
            {
                'initial': 'ост.Декабристов',
                'replacement': 'Декабристов'
            },
            {
                'initial': 'Декабристов (конечная)',
                'replacement': 'Декабристов'
            }
        ],
        '15': [
            {
                'initial': 'гСвердл',
                'replacement': 'гостиница "Свердловск"'
            }
        ],
        '16': [
            {
                'initial': 'Пед.университет',
                'replacement': 'Педагогический университет'
            },
            {
                'initial': 'Пед. институт',
                'replacement': 'Педагогический университет'
            }
        ],
        '17': [
            {
                'initial': 'Пл.1Пятилетки',
                'replacement': 'Площадь 1-ой пятилетки'
            }
        ],
        '19': [
            {
                'initial': 'ост.Академическая',
                'replacement': 'Академическая'
            }
        ]
    }
};

var processFile = function(file){
    console.log('processing ' + file);
    var type = file.split('_')[0];

    var data = fs.readFileSync('schedules/' + file);

    var body = new Buffer(data, 'binary');
    conv = new Iconv('utf8', 'utf8');
    body = conv.convert(body).toString();


    jsdom.env(
      body,
      ["http://code.jquery.com/jquery.js"],
      function (errors, window) {
          var $ = window.$;
            $('.table-item').map(function(i, j){
                var routenumber = /Маршрут:\s([^\s]+)/.exec($(j).find('.desc').text())[1];
                var weekday = /Дни:\s([А-Яа-я]+)/g.exec($(j).find('.desc').text())[1];
                var endpoint = /Конечная станция:\s(([^\s]+\s{0,2})+[^<\s]+)/g.exec($(j).find('.desc').text())[1].replace(/^ст\.?/i,'');

                if (endpoint_replacers[type][routenumber]) {
                    endpoint_replacers[type][routenumber].map(function(ep){
                        if (ep.initial === endpoint) {
                            endpoint = ep.replacement;
                        }
                    })
                }

                switch(weekday) {
                    case 'Будни':
                        weekday = 'base';
                        break;
                    case 'Суббота':
                        weekday = 'saturday';
                        break;
                    case 'Воскресенье':
                        weekday = 'sunday';
                        break;
                }

                if (!result[type][routenumber]) {
                    result[type][routenumber] = {};
                }
                if (!result[type][routenumber][endpoint]) {
                    result[type][routenumber][endpoint] = {};
                }
                if (!result[type][routenumber][endpoint][weekday]) {
                    result[type][routenumber][endpoint][weekday] = {};
                }

                var departures = $(j).find('.item');

                departures.map(function(i, departure){
                    var d = $(departure);
                    var hour = d.find('b').remove().text().replace(/^0/, '');

                    if (!result[type][routenumber][endpoint][weekday][hour]) {
                        result[type][routenumber][endpoint][weekday][hour] = []
                    }


                    var mins = $.trim(d.text().replace(/[:\n\t]/g, '')).split(/\s/);
                    result[type][routenumber][endpoint][weekday][hour] = result[type][routenumber][endpoint][weekday][hour].concat(mins);
                });
            })
            next();
         }
    );
};

next();
