/**
 * Created with JetBrains WebStorm.
 * User: spencer
 * Date: 9/7/13
 * Time: 12:44 AM
 * To change this template use File | Settings | File Templates.
 */

'use strict';

var timers = {},
    mailer = require('./mailer.js'),
    Q = require('q');

exports.startTimer = function(device) {

    timers[device.deviceId] = setTimeout(function() {
        var locals = {
            name: device.name,
            period: device.limit,
            type: 'open'
        };
        var emailDeferred = Q.defer();

        app.models.User.getUser(device.userId.toString(), function(err, user) {
            if (!err) {
                locals.email = user[0].email;
                emailDeferred.resolve(user[0].email);
            }
        });

        Q.all([emailDeferred.promise]).then(function() {
                mailer.email(locals, function(err) {
                    if (err) {
                        console.log(err);
                    }
                })
            }, function(err) {
                console.log(err);
            }
        );

        clearTimeout(timers[device.deviceId]);
        delete timers[device.deviceId];
    }, device.limit * 1000);
}

exports.stopTimer = function(deviceId) {
    clearTimeout(timers[deviceId]);
    delete timers[deviceId];
}

exports.checkRange = function(device) {
    var hours = new Date().getHours(),
        minutes = new Date().getMinutes(),
        now = new Date(0, 0, 0, hours, minutes, 0);

    for (var i = 0; i < device.ranges.length; i++) {
        var lower = device.ranges[i].lower.split(''),
            upper = device.ranges[i].upper.split(''),
            lowerHour = lower[0] + lower[1],
            lowerMin = lower[2] + lower[3],
            upperHour = upper[0] + upper[1],
            upperMin = upper[2] + upper[3],
            lowerTime = new Date(0, 0, 0, lowerHour, lowerMin, 0),
            upperTime = new Date(0, 0, 0, upperHour, upperMin, 0);

        if (now >= lowerTime && now <= upperTime) {
            var locals = {
                    lower: transformTime(lowerHour, lowerMin),
                    upper: transformTime(upperHour, upperMin),
                    name: device.name,
                    type: 'intrusion'
                },
                emailDeferred = Q.defer();

            app.models.User.getUser(device.userId.toString(), function(err, user) {
                if (!err) {
                    locals.email = user[0].email;
                    emailDeferred.resolve(user[0].email);
                }
            });

            Q.all([emailDeferred.promise]).then(function() {
                    mailer.email(locals, function(err) {
                        if (err) {
                            console.log(err);
                        }
                    })
                }, function(err) {
                    console.log(err);
                }
            );

            return;
        }
    }
}

function transformTime(hour, min) {
    var half = 'am';
    if (hour >= 12) {
        half = 'pm';
    } else if (hour > 12) {
        hour =- 12;
    } else if (hour == 0) {
        hour = '12';
    }

    return hour + ':' + min + ' ' + half;
}
