'use strict';

// Development specific configuration
// ==================================
module.exports = {
  version:'0.0.1',
  mysql : { // mysql connection option
    connectionLimit : 30, //important
    // host     : '3.7.31.207',
    // user     : 'root',
    // password : 'RBI@M0ve@1980',
    host     : '13.234.36.105',
    user     : 'spiceread',
    password : 'Analytics#@!R@ad',
    // user     : 'root',
    // password : 'RBI@M0ve@2020',
    database : 'spicescreen',
    debug    :  false,
    queueLimit: 30,
    acquireTimeout: 150000,
    dateStrings : true
 },
  email:{
    host    : 'mail.vuliv.com',
    user    : 'no-reply@vuliv.com',
    password  : 'noreply123',
    sender    : 'Vuliv <vuliv.com>'
  },  
};
