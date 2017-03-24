var f = require('util').format;

var test = require('tape');

var WorkingHours = require('../').WorkingHours;

function runtests(t, sched, tests) {
    var wh = new WorkingHours(sched);
    t.ok(wh, 'WorkingHours object');

    tests.forEach(function (arr, i) {
        var date = new Date(arr[0]);
        var expected = arr[1];
        t.equal(wh.test(date), expected,
            f('test %s (expect %s)',
            date, expected));
    });
}

test('test 9-5 weekday', function (t) {
    var sched = [
        false,
        '09:00-17:00',
        '09:00-17:00',
        '09:00-17:00',
        '09:00-17:00',
        '09:00-17:00',
        false
    ];

    var tests = [
        ['Sun Mar 19 2017 00:00:00 UTC', false],
        ['Sun Mar 19 2017 12:00:00 UTC', false],

        ['Mon Mar 20 2017 00:00:00 UTC', false],
        ['Mon Mar 20 2017 08:59:59 UTC', false],
        ['Mon Mar 20 2017 09:00:00 UTC', true],
        ['Mon Mar 20 2017 12:00:00 UTC', true],
        ['Mon Mar 20 2017 16:59:59 UTC', true],
        ['Mon Mar 20 2017 17:00:00 UTC', true],
        ['Mon Mar 20 2017 17:01:00 UTC', false],

        ['Tue Mar 21 2017 00:00:00 UTC', false],
        ['Tue Mar 21 2017 12:00:00 UTC', true],
        ['Tue Mar 21 2017 20:00:00 UTC', false],

        ['Wed Mar 22 2017 00:00:00 UTC', false],
        ['Wed Mar 22 2017 12:00:00 UTC', true],
        ['Wed Mar 22 2017 20:00:00 UTC', false],

        ['Thu Mar 23 2017 00:00:00 UTC', false],
        ['Thu Mar 23 2017 12:00:00 UTC', true],
        ['Thu Mar 23 2017 20:00:00 UTC', false],

        ['Fri Mar 24 2017 00:00:00 UTC', false],
        ['Fri Mar 24 2017 12:00:00 UTC', true],
        ['Fri Mar 24 2017 20:00:00 UTC', false],

        ['Sat Mar 25 2017 00:00:00 UTC', false],
        ['Sat Mar 25 2017 12:00:00 UTC', false],
        ['Sat Mar 25 2017 20:00:00 UTC', false],

        ['Sun Mar 26 2017 00:00:00 UTC', false],
        ['Sun Mar 26 2017 12:00:00 UTC', false],
        ['Sun Mar 26 2017 20:00:00 UTC', false],
    ];

    runtests(t, sched, tests);

    t.end();
});

[
    {name: '24x7', expect: true, sched: true},
    {name: 'none', expect: false, sched: false}
].forEach(function (o) {
    var tests = [
        ['Sun Mar 19 2017 00:00:00 UTC', o.expect],
        ['Mon Mar 20 2017 00:00:00 UTC', o.expect],
        ['Tue Mar 21 2017 00:00:00 UTC', o.expect],
        ['Wed Mar 22 2017 00:00:00 UTC', o.expect],
        ['Thu Mar 23 2017 20:00:00 UTC', o.expect],
        ['Fri Mar 24 2017 00:00:00 UTC', o.expect],
        ['Sat Mar 25 2017 00:00:00 UTC', o.expect],
        ['Sun Mar 26 2017 20:00:00 UTC', o.expect],
        [new Date(), o.expect]
    ];
    test(o.name, function (t) {
        var sched = [
            o.sched,
            o.sched,
            o.sched,
            o.sched,
            o.sched,
            o.sched,
            o.sched
        ];
        runtests(t, sched, tests);
        t.end();
    });

    test(f('%s (simple constructor)', o.name), function (t) {
        var sched = o.sched;
        runtests(t, sched, tests);
        t.end();
    });
});

test('test 1 hour every day', function (t) {
    var sched = '12:00-13:00';

    var tests = [
        ['Sun Mar 19 2017 11:59:59 UTC', false],
        ['Sun Mar 19 2017 12:00:00 UTC', true],
        ['Sun Mar 19 2017 12:59:59 UTC', true],
        ['Sun Mar 19 2017 13:00:00 UTC', true],
        ['Sun Mar 19 2017 13:01:00 UTC', false],

        ['Mon Mar 20 2017 11:59:59 UTC', false],
        ['Mon Mar 20 2017 12:00:00 UTC', true],
        ['Mon Mar 20 2017 12:59:59 UTC', true],
        ['Mon Mar 20 2017 13:00:00 UTC', true],
        ['Mon Mar 20 2017 13:01:00 UTC', false],
    ];

    runtests(t, sched, tests);

    t.end();
});

test('test complex schedule', function (t) {
    var sched = [
        false, // sundays are always off
        true, // mondays are always on
        '0:30-0:45', // tuesdays only 15 minutes are on
        '1:35-1:50,2:35-2:50', // wednesdays only 2 15 minute windows are on
        '12:00-12:00', // thursday only 1 minute is valid
        '9:00-11:59,13:00-17:00', // friday is a normal 9-5 work day with an hour lunch
        '0:00-12:00,12:01-20:00,20:00-23:59' // saturday is always on in a convoluted way
    ]

    var tests = [
        ['Sun Mar 19 2017 00:00:00 UTC', false],
        ['Sun Mar 19 2017 12:00:00 UTC', false],
        ['Sun Mar 19 2017 18:00:00 UTC', false],

        ['Mon Mar 20 2017 00:00:00 UTC', true],
        ['Mon Mar 20 2017 09:00:00 UTC', true],
        ['Mon Mar 20 2017 12:00:00 UTC', true],
        ['Mon Mar 20 2017 17:00:00 UTC', true],

        ['Tue Mar 21 2017 00:00:00 UTC', false],
        ['Tue Mar 21 2017 00:30:00 UTC', true],
        ['Tue Mar 21 2017 00:35:00 UTC', true],
        ['Tue Mar 21 2017 00:40:00 UTC', true],
        ['Tue Mar 21 2017 00:45:00 UTC', true],
        ['Tue Mar 21 2017 00:46:00 UTC', false],

        ['Wed Mar 22 2017 00:00:00 UTC', false],
        ['Wed Mar 22 2017 01:35:00 UTC', true],
        ['Wed Mar 22 2017 01:50:00 UTC', true],
        ['Wed Mar 22 2017 01:51:00 UTC', false],
        ['Wed Mar 22 2017 02:34:00 UTC', false],
        ['Wed Mar 22 2017 02:35:00 UTC', true],
        ['Wed Mar 22 2017 02:50:00 UTC', true],
        ['Wed Mar 22 2017 12:00:00 UTC', false],
        ['Wed Mar 22 2017 20:00:00 UTC', false],

        ['Thu Mar 23 2017 00:00:00 UTC', false],
        ['Thu Mar 23 2017 11:59:59 UTC', false],
        ['Thu Mar 23 2017 12:00:00 UTC', true],
        ['Thu Mar 23 2017 12:00:30 UTC', true],
        ['Thu Mar 23 2017 12:01:00 UTC', false],
        ['Thu Mar 23 2017 20:00:00 UTC', false],

        ['Fri Mar 24 2017 00:00:00 UTC', false],
        ['Fri Mar 24 2017 09:00:00 UTC', true],
        ['Fri Mar 24 2017 11:59:59 UTC', true],
        ['Fri Mar 24 2017 12:00:00 UTC', false],
        ['Fri Mar 24 2017 12:59:59 UTC', false],
        ['Fri Mar 24 2017 13:00:00 UTC', true],
        ['Fri Mar 24 2017 17:00:00 UTC', true],
        ['Fri Mar 24 2017 20:00:00 UTC', false],

        ['Sat Mar 25 2017 00:00:00 UTC', true],
        ['Sat Mar 25 2017 12:00:00 UTC', true],
        ['Sat Mar 25 2017 12:01:00 UTC', true],
        ['Sat Mar 25 2017 20:00:00 UTC', true],
    ];

    runtests(t, sched, tests);

    t.end();
});
