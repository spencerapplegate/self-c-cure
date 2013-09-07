/**
 * Created with JetBrains WebStorm.
 * User: spencer
 * Date: 9/5/13
 * Time: 10:10 PM
 * To change this template use File | Settings | File Templates.
 */

'use strict';

var nodemailer = require('nodemailer'),
    path = require('path'),
    templatesDir = path.resolve(__dirname, '..', 'views/mailer'),
    emailTemplates = require('email-templates');


// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "self.c.cure@gmail.com",
        pass: "PenAppsFall2013"
    }
});

exports.email = function(locals, cb) {

    emailTemplates(templatesDir, function(err, template) {
        if (err) {
            console.log(err);
        } else {
            template(locals.type, locals, function(err, html, text) {
                if (err) {
                    console.log(err);
                } else {
                    // setup e-mail data with unicode symbols
                    var mailOptions = {
                        from: "self.c.cure@gmail.com", // sender address
                        to: "spencer.applegate3@gmail.com", // list of receivers
                        subject: "A message from Self-C-Cure", // Subject line
                        text: text, // plaintext body
                        html: html
                    }

                    // send mail with defined transport object
                    smtpTransport.sendMail(mailOptions, function(error, response){
                        if(error){
                            console.log(error);
                        }else{
                            console.log("Message sent: " + response.message);
                        }

                        // if you don't want to use this transport object anymore, uncomment following line
                        smtpTransport.close(); // shut down the connection pool, no more messages
                    });
                }
            });

            cb();
        }
    });
};
