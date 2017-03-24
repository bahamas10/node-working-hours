/*
 * Check if a time is specified inside a set of working hours
 *
 * Author: Dave Eddy <dave@daveeddy.com>
 * Date: March 23, 2017
 * License: MIT
 */

var assert = require('assert-plus');
var jsprim = require('jsprim');

module.exports.WorkingHours = WorkingHours;

/*
 * Create a WorkingHours object by parsing a "schedule".  A schedule can look
 * like:
 *
 * var wh = new WorkingHours([
 *   false,
 *   '09:00-17:00',
 *   '09:00-17:00',
 *   '09:00-17:00',
 *   '09:00-17:00',
 *   '09:00-17:00',
 *   false
 * ]);
 *
 * Where each index of the array represents a day of the week (0 is sunday, 1
 * is monday, etc.).  An element can be:
 *
 * - true: match all dates on this day
 * - false: reject all dates on this day
 * - string: a time period to match given dates
 *
 * The time period strings must be given in 24 hour time in the form of
 * "hh:mm-hh:mm[,hh:mm-hh:mm,...]", for example
 *
 * - "09:00-17:00" - matches any time between 9AM and 5PM (inclusively)
 * - "09:00-11:59,13:00-16:59" - matches any time between 9AM and 11:59AM
 *       or any time between 1PM and 4:59PM
 *
 * If an array is given as a schedule, it must contain 7 elemnts (1 for each
 * day of the week).  For simplicity's sake, this module also allows you to
 * pass in a single element to the constructor to use for all days of the week,
 * for example:
 *
 * // match dates between 5AM and 6AM regardless of day
 * var wh = new WorkHours('05:00-06:00');
 *
 * // reject all dates
 * var none = new WorkHours(false);
 *
 * // accept all dates
 * var alltime = new WorkHours(true);
 */
function WorkingHours(sched) {
    var self = this;

    var arr = sched;
    if (!Array.isArray(arr) || arr.length !== 7) {
        arr = [arr, arr, arr, arr, arr, arr, arr];
    }

    assert.array(arr, 'arr');
    assert.equal(arr.length, 7, '7 days a week');

    self.schedule = jsprim.deepCopy(arr).map(function (day) {
        if (day === true || day === false) {
            return day;
        }

        if (typeof (day) === 'string') {
            day = day.split(',');
        }
        assert.arrayOfString(day, 'day array');

        return day.map(function (period) {
            var obj = {
                begin: {},
                end: {}
            };

            var _s = period.split('-');
            var begin = _s[0];
            var end = _s[1];

            assert(begin, 'begin');
            assert(end, 'end');

            var hour;
            var min;

            _s = begin.split(':');
            hour = parseInt(_s[0], 10);
            minute = parseInt(_s[1], 10);

            assert.finite(hour, 'hour')
            assert.finite(minute, 'minute')

            obj.begin = (hour * 60) + minute;

            _s = end.split(':');
            hour = parseInt(_s[0], 10);
            minute = parseInt(_s[1], 10);

            assert.finite(hour, 'hour')
            assert.finite(minute, 'minute')

            obj.end = (hour * 60) + minute;

            assert(obj.end >= obj.begin, 'end is before begin');

            return obj;
        });
    });
}

/*
 * Test a date against the schedule specified in the constructor.  True is
 * returned if the date is inside the schedule, otherwise false is returned.
 *
 * By default, this module uses your current timezone to determine the hours
 * and minutes of the given Date object.  You can specify {UTC: true} as the
 * opts argument to force the use of UTC.
 */
WorkingHours.prototype.test = function test(date, opts) {
    var self = this;

    opts = opts || {};
    assert.date(date, 'date');
    assert.object(opts, 'opts');
    assert.optionalBool(opts.UTC, 'opts.UTC');

    var day, hour, min;
    if (opts.UTC) {
        day = date.getUTCDay();
        hour = date.getUTCHours();
        min = date.getUTCMinutes();
    } else {
        day = date.getDay();
        hour = date.getHours();
        min = date.getMinutes();
    }
    var minutes = (hour * 60) + min;

    var sched = self.schedule[day];

    if (sched === true)
        return true;

    if (sched === false)
        return false;

    for (var i = 0; i < sched.length; i++) {
        var block = sched[i];
        if (minutes >= block.begin && minutes <= block.end) {
            return true;
        }
    }

    return false;
};
