/**
 * Created with JetBrains WebStorm.
 * User: spencer
 * Date: 9/4/13
 * Time: 9:21 PM
 * To change this template use File | Settings | File Templates.
 */

'use strict';

var base64 = require('base64'),
    secret = 'self-c-cure',
    cookieName = 'self-c-cure';

function encode(userId) {
    if (!userId) {
        return '';
    }
    return base64.encode(userId + secret);
}

function decode(cookie) {
    if (cookie) {
        var decodedString = base64.decode(cookie);
    }
    return decodedString.slice(0, (decodedString.length - cookie.length) + 2);
}

exports.signup = function(req, res) {
	if (!req.body) {
		return res.send(404);
	}
	
	var user = new app.models.User();
	
	user.set('email', req.body.email);
	user.set('password', req.body.pass);

	user.save(function(err) {
		if (err) {
            res.send(500, err);
		} else {
            res.send(201);
		}
	});
};

exports.login = function(req, res, next) {
    var a = req.url.split('/').splice(3, req.url.split('/').length - 2)[0];
    var b = req.url.split('/').splice(3, req.url.split('/').length - 2)[2];
    if (req.url == '/auth/login/') {
        app.models.User.login(req.body.email, req.body.pass, function(err, user) {
            if (err) {
                res.send(400, err);
            } else {
                if (user) {
                    res.cookie(cookieName, encode(user.get('id')), { path: '/', expires: new Date(Date.now() + 900000), httpOnly: true });
                    res.send({ email: req.body.email, id: user.get('id') });
                } else {
                    res.send(401);
                }
            }
        });
    } else if (req.url == '/auth/signup/') {
        next();
    } else if ((a+b) == 'devicesopen') {
        next();
    } else if ((a+b) == 'devicesclosed') {
        next();
    } else {
        if (!req.cookies[cookieName]) {
            res.send(401);
        } else {
            app.models.User.getUser(decode(req.cookies[cookieName]), function(err, decodedUser) {
                if (err) {
                    res.send(500, err);
                } else {
                    if (decodedUser[0]) {
                        next();
                    } else {
                        res.send(401);
                    }
                }
            });
        }
    }
};

exports.logout = function(req, res) {
    res.clearCookie(cookieName, { path: '/' });
    res.send(200);
};