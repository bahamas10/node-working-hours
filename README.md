Working Hours
=============

Check if a time is specified inside a set of working hours

Installation
------------

    npm install working-hours

Usage
-----

### `new WorkingHours(sched)`

Create a `WorkingHours` object by parsing a "schedule".  An example looks
like:

``` js
var WorkingHours = require('working-hours').WorkingHours;
var wh = new WorkingHours([
  false,
  '09:00-17:00',
  '09:00-17:00',
  '09:00-17:00',
  '09:00-17:00',
  '09:00-17:00',
  false
]);
```

Where each index of the array represents a day of the week (0 is sunday, 1
is monday, etc.).  An element can be:

- `true`: match all dates on this day
- `false`: reject all dates on this day
- `"string"`: a time period to match given dates

The time period strings must be given in 24 hour time in the form of
"hh:mm-hh:mm[,hh:mm-hh:mm,...]", for example

- "09:00-17:00" - match any time between 9AM and 5PM (inclusively)
- "09:00-11:59,13:00-16:59" - match any time between 9AM and 11:59AM
  or any time between 1PM and 4:59PM

If an array is given as a schedule, it must contain 7 elemnts (1 for each
day of the week).  For simplicity's sake, this module allows you to
pass in a single element to the constructor to use for all days of the week,
for example:

``` js
// match dates between 5AM and 6AM regardless of day
var wh = new WorkHours('05:00-06:00');

// reject all dates
var none = new WorkHours(false);

// accept all dates
var alltime = new WorkHours(true);
```

### `WorkingHours#test(date[, opts])`

Test a date against the schedule specified in the constructor.  True is
returned if the date is inside the schedule, otherwise false is returned.

By default, this module uses your current timezone to determine the hours
and minutes of the given Date object.  You can specify `{UTC: true}` as the
opts argument to force the use of UTC.

Using the schedule created above:

``` js
// any date on weekends will be rejected
wh.test(new Date('Sat Mar 18 2017 00:00:00')); // false
wh.test(new Date('Sat Mar 18 2017 12:00:00')); // false
wh.test(new Date('Sat Mar 18 2017 20:00:00')); // false
wh.test(new Date('Sun Mar 19 2017 00:00:00')); // false
wh.test(new Date('Sun Mar 19 2017 12:00:00')); // false
wh.test(new Date('Sun Mar 19 2017 20:00:00')); // false

// any date on weekdays will pass if they are within
// 9AM and 5PM (inclusively)
wh.test(new Date('Mon Mar 20 2017 00:00:00')); // false
wh.test(new Date('Mon Mar 20 2017 08:59:59')); // false
wh.test(new Date('Mon Mar 20 2017 12:00:00')); // true
wh.test(new Date('Mon Mar 20 2017 16:59:59')); // true
wh.test(new Date('Mon Mar 20 2017 17:00:00')); // true
wh.test(new Date('Mon Mar 20 2017 17:01:00')); // false

wh.test(new Date('Tue Mar 21 2017 12:00:00')); // true
wh.test(new Date('Wed Mar 22 2017 12:00:00')); // true
wh.test(new Date('Thu Mar 23 2017 12:00:00')); // true
wh.test(new Date('Fri Mar 24 2017 12:00:00')); // true
```

License
-------

MIT License
