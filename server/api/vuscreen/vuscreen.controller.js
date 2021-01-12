'use strict';

var _ = require('lodash');
var db = require('../../config/mysql')
// var db_pp = require('../../config/mysql_pp')
var Action = require('../vuscreen/vuscreen.model');
var moment = require('moment');
var EM = require('../../../server/config/email-dispatcher');
var NodeCache = require("node-cache");
var cachedData = new NodeCache({ stdTTL: 0 });
var mongoose = require('mongoose')
var json2csv = require('json2csv');
var fs = require('fs')
var config = require('../../../server/config/environment');
var request = require('request');




/*  
    @Authentication ----> by session key
    @Authorization ----> Access Controll Logic
    Author : Kedar Gadre
    Date : 15/08/2018
    Modified_by : Kedar Gadre
    Modification Date : 15/08/2018
*/
exports.get_serverclient_datewise = function (req, res) {

  var days = [35, 28, 21, 14, 7]
  var beforeOneWeek;
  var day;
  var diffToMonday;
  var dayofweeks = [];
  var filter;
  var startDate, endDate;
  var version;

  if (req.query.version != "undefined" && req.query.version != "") {
    version = "'" + req.query.version + "'"
  } else {
    version = 'null'
  }

  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  filter = " sync_date >= '" + startDate + "' AND sync_date <= '" + endDate + "' AND version = IFNULL(" + version + ",version) "
  if (req.query.daysfilter != "undefined" && req.query.daysfilter != "" && typeof (req.query.daysfilter) != "undefined") {
    for (var i = 0; i < days.length; i++) {
      beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * days[i] * 1000)
      day = beforeOneWeek.getDay()
      diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1)
      dayofweeks.push(moment(new Date(beforeOneWeek.setDate(diffToMonday + parseInt(req.query.daysfilter)))).format('YYYY-MM-DD'))
    };
    if (req.query.daysfilter == new Date().getDay() - 1) {
      dayofweeks.push(moment(new Date()).format('YYYY-MM-DD'))
    }

    filter = " version = IFNULL(" + version + ",version) "
      + "   AND sync_date IN " + JSON.stringify(dayofweeks).replace('[', '(').replace(']', ')')

  }
  var query = "SELECT sync_date date,"
    + "      count(1) server"
    + " FROM vuscreen_events "
    + " where " + filter + " AND partner = '" + req.user.partner_id + "' AND user = 'server' AND event = 'start'"
    + " GROUP BY date order by date";

  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    else {
      var query1 = "SELECT sync_date date,"
        + "      count(distinct mac) client"
        + " FROM vuscreen_tracker "
        + " where " + filter + " AND partner = '" + req.user.partner_id + "'"
        + " GROUP BY date order by date";
      db.get().query(query1, function (err, doc1) {
        if (err) { return handleError(res, err); }
        var data = [doc, doc1]
        return res.status(200).json(data);
      })
    };
  })
};

/*  
    @Authentication ----> by session key
    @Authorization ----> Access Controll Logic
    Author : Kedar Gadre
    Date : 15/08/2018
    Modified_by : Kedar Gadre
    Modification Date : 15/08/2018
*/
exports.get_serverclient_hourwise = function (req, res) {
  var days = [35, 28, 21, 14, 7]
  var beforeOneWeek;
  var day;
  var diffToMonday;
  var dayofweeks = [];
  var filter;
  var version;
  if (req.query.version != "undefined" && req.query.version != "") {
    version = "'" + req.query.version + "'"
  } else {
    version = 'null'
  }
  var startDate, endDate;
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  filter = " sync_date >= '" + startDate + "' AND sync_date <= '" + endDate + "' AND version = IFNULL(" + version + ",version) "
  if (req.query.daysfilter != "undefined" && req.query.daysfilter != "") {
    for (var i = 0; i < days.length; i++) {
      beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * days[i] * 1000)
      day = beforeOneWeek.getDay()
      diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1)
      dayofweeks.push(moment(new Date(beforeOneWeek.setDate(diffToMonday + parseInt(req.query.daysfilter)))).format('YYYY-MM-DD'))
    };
    if (req.query.daysfilter == new Date().getDay() - 1) {
      dayofweeks.push(moment(new Date()).format('YYYY-MM-DD'))
    }

    filter = " version = IFNULL(" + version + ",version) "
      + "  sync_date IN " + JSON.stringify(dayofweeks).replace('[', '(').replace(']', ')')


  }


  var query = "SELECT DATE_FORMAT(sync_datetime, '%Y-%m-%d') date,"
    + "      DATE_FORMAT(sync_datetime,'%H') hourRange,"
    + "      count(1) server"
    + " FROM vuscreen_events "
    + " where " + filter + " AND partner = '" + req.user.partner_id + "'  AND user = 'server' AND event = 'start'"
    + " GROUP BY hourRange,date order by date , hourRange";
  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    else {
      var query1 = "SELECT DATE_FORMAT(sync_datetime, '%Y-%m-%d') date,"
        + "      DATE_FORMAT(sync_datetime,'%H') hourRange,"
        + "      count(distinct mac) client"
        + " FROM vuscreen_tracker "
        + " where " + filter + " AND partner = '" + req.user.partner_id + "'"
        + " GROUP BY hourRange,date order by date , hourRange";
      db.get().query(query1, function (err, doc1) {
        if (err) { return handleError(res, err); }
        var data = [doc, doc1]
        return res.status(200).json(data);
      })
    }
  })
};


/*  
    @Authentication ----> by session key
    @Authorization ----> Access Controll Logic
    Author : Kedar Gadre
    Date : 15/08/2018
    Modified_by : Kedar Gadre
    Modification Date : 15/08/2018
*/
exports.get_fileplayshare_hourwise = function (req, res) {
  var days = [35, 28, 21, 14, 7]
  var beforeOneWeek;
  var day;
  var diffToMonday;
  var dayofweeks = [];
  var filter;
  var version;
  if (req.query.version != "undefined" && req.query.version != "") {
    version = "'" + req.query.version + "'"
  } else {
    version = 'null'
  }
  var startDate, endDate;
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  filter = " sync_date >= '" + startDate + "' AND sync_date <= '" + endDate + "' AND version = IFNULL(" + version + ",version) "
  if (req.query.daysfilter != "undefined" && req.query.daysfilter != "") {
    for (var i = 0; i < days.length; i++) {
      beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * days[i] * 1000)
      day = beforeOneWeek.getDay()
      diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1)
      dayofweeks.push(moment(new Date(beforeOneWeek.setDate(diffToMonday + parseInt(req.query.daysfilter)))).format('YYYY-MM-DD'))
    };
    if (req.query.daysfilter == new Date().getDay() - 1) {
      dayofweeks.push(moment(new Date()).format('YYYY-MM-DD'))
    }

    filter = " version = IFNULL(" + version + ",version) AND "
      + "  sync_date IN " + JSON.stringify(dayofweeks).replace('[', '(').replace(']', ')')


  }


  var query = "SELECT DATE_FORMAT(sync_datetime, '%Y-%m-%d') date,"
    + "      DATE_FORMAT(sync_datetime,'%H') hourRange,"
    + "      count(1) server"
    + " FROM vuscreen_tracker "
    + " where " + filter + " AND type= 'video' AND view_duration>0 AND partner= '" + req.user.partner_id + "'"
    + " GROUP BY hourRange,date order by date , hourRange";

  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    else {
      var query1 = "SELECT DATE_FORMAT(sync_datetime, '%Y-%m-%d') date,"
        + "      DATE_FORMAT(sync_datetime,'%H') hourRange,"
        + "      ROUND(SUM(view_duration/60000)) client"
        + " FROM vuscreen_tracker "
        + " where " + filter + " AND type= 'video' AND view_duration>0 AND partner = '" + req.user.partner_id + "'"
        + " GROUP BY hourRange,date order by date , hourRange";
      db.get().query(query1, function (err, doc1) {
        if (err) { return handleError(res, err); }
        var data = [doc, doc1]
        return res.status(200).json(data);
      })
    }
  })
};


// Get list of server sessions logs
var vuscreen_getAllData_Pagination = function (req, cb) {
  var startDate = 'null', endDate = 'null';
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var filter = '';

  if (req.query.session_id) { filter = " AND A.session_id ='" + req.query.session_id + "'" }
  if (req.query.vehicle_no) { filter = " AND C.vehicle_no ='" + req.query.vehicle_no + "'" }
  if (req.query.device_id) { filter = " AND A.device_id ='" + req.query.device_id + "'" }
  // if (req.query.region) {filter = " AND region ='"+req.query.region+"'"}
  // if (req.query.uid) {filter = " AND uid ='"+req.query.uid+"'"}  

  var query = " select "
    + " A.id,"
    + " A.session_id,"
    + " A.device_id,"
    + " A.started_at,"
    + " C.vehicle_no,"
    + " C.partner,"
    + " C.reg_id,"
    + " C.source,"
    + " C.destination,"
    + " C.seat_start,"
    + " C.seat_end,"
    + " B.client_connected,"
    + " B.client_disconnected,"
    + " D.connected,"
    + " D.videoPlayed,"
    + " D.total_duration,"
    + " E.end_at"
    + " from"
    + " (select "
    + " A.id,"
    + " A.session_id,"
    + " A.device_id,"
    + " A.reg_id,"
    + " A.sync_datetime started_at"
    + " FROM"
    + " vuscreen_events A"
    + " join vuscreen_registration C ON A.reg_id = C.reg_id"
    + " where"
    + " user = 'server' and event = 'start') A"
    + " LEFT JOIN"
    + " (select "
    + " session_id,"
    + " reg_id,"
    + " sum(case"
    + " when user = 'client' and event = 'connected' then 1"
    + " else 0"
    + " end) client_connected,"
    + " sum(case"
    + " when"
    + " user = 'client'"
    + " and event = 'disconnected'"
    + " then"
    + " 1"
    + " else 0"
    + " end) client_disconnected"
    + " FROM"
    + " vuscreen_events"
    + " GROUP BY session_id , reg_id) B ON A.session_id = B.session_id"
    + " and A.reg_id = B.reg_id"
    + "  LEFT JOIN"
    + " (select "
    + " session_id,"
    + " reg_id,"
    + " count(distinct mac) connected,"
    + " count(1) videoPlayed,"
    + " ROUND(SUM(view_duration /60000)) total_duration"
    + " FROM"
    + " vuscreen_tracker"
    + "  GROUP BY session_id , reg_id) D ON A.session_id = D.session_id"
    + " and A.reg_id = D.reg_id"
    + " join"
    + " vuscreen_registration C ON A.reg_id = C.reg_id"
    + " left join"
    + " (select "
    + " session_id, reg_id, sync_datetime end_at"
    + " FROM"
    + " vuscreen_events"
    + " where"
    + "  user = 'server' and event = 'stop') E ON A.session_id = E.session_id"
    + " and A.reg_id = E.reg_id"
    + " where"
    + " C.partner = '" + req.user.partner_id + "'"
    + " AND DATE_FORMAT(A.started_at, '%Y-%m-%d') >= '" + startDate + "'"
    + " AND DATE_FORMAT(A.started_at, '%Y-%m-%d') <= '" + endDate + "'" + filter
    + " order by id desc"
  var option = { draw: req.query.draw, start: req.query.start, length: req.query.length };
  db.pagination(query, option, function (err, doc) {
    return cb(err, doc);
  })
};

// Get list of registered users
exports.vuscreen_index = function (req, res) {
  vuscreen_getAllData_Pagination(req, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};

//export csv function for  registered user
exports.vuscreen_export_csv = function (req, res) {
  var fields = ["session_id", "device_id", "started_at", "end_at", "vehicle_no", "source", "destination", "connected", "videoPlayed", "total_duration"];
  var fieldversions = ["session_id", "device_id", "started_at", "end_at", "vehicle_no", "source", "destination", "connected", "videoPlayed", "total_duration"];

  var name = 'server_sessions_' + (moment(new Date()).format('YYYY-MM-DD')).toString()
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-disposition', 'attachment;filename=' + name + '.csv');
  res.write(fields.join(","));

  function pagination() {
    vuscreen_getAllData_Pagination(req, function (err, doc) {
      if (doc.data.length > 0) {
        req.query.start = parseInt(req.query.start) + parseInt(req.query.length);
        var row = '';
        for (var i = 0; i < doc.data.length; i++) {
          var json = doc.data[i];
          var col = '';
          for (var x = 0; x < fields.length; x++) {
            var val = json[fields[x]];
            if (val) {
              val = val.toString().replace(/,/g, ' ').replace(/"/g, ' ');
            }
            if (val == '' || typeof (val) == 'undefined' || val == null) { val = ' '; };
            // if (fields[x] == 'started_at') { val =  moment(val).format('YYYY-MM-DD HH:mm:ss ').toString() };

            if (col == '') {
              col = val;
            } else {
              col = col + ',' + val;
            }
          };
          if (row == '') { row = col; }
          else { row = row + '\r\n' + col; }
        };
        res.write('\r\n');
        res.write(row);
        pagination();
      } else {
        res.end();
      }
    })
  }
  pagination();
}


// Get list of registered logs
var vuscreen_getAllRegData_Pagination = function (req, cb) {
  var startDate = 'null', endDate = 'null';
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var filter = '';

  if (req.query.device_id) { filter = " AND device_id ='" + req.query.device_id + "'" }
  //if (req.query.interface) {filter = " AND interface ='"+req.query.interface+"'"}
  //if (req.query.version) {filter = " AND version ='"+req.query.version+"'"}
  if (req.query.vehicle_no) { filter = " AND vehicle_no ='" + req.query.vehicle_no + "'" }
  if (req.query.reg_id) { filter = " AND reg_id ='" + req.query.reg_id + "'" }

  var query = "select * from vuscreen_registration"
    + " where partner = '" + req.user.partner_id + "' AND sync_date >= '" + startDate + "' AND sync_date <= '" + endDate + "'" + filter
    + " order by sync_datetime desc"
  var option = { draw: req.query.draw, start: req.query.start, length: req.query.length };
  // 
  db.pagination(query, option, function (err, doc) {
    return cb(err, doc);
  })
};

// Get list of registered users
exports.vuscreen_registration_index = function (req, res) {
  vuscreen_getAllRegData_Pagination(req, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};


//export csv function for  registered user
exports.vuscreen_registration_export_csv = function (req, res) {
  var fields = ["reg_id", "vehicle_no", "device_id", "source", "destination", "seat_start", "seat_end", "model", "interface", "os_version", "sync_datetime", "sdcard_name", "sdcard_no", "owner_email", "owner_name", "owner_no", "driver_name", "driver_no", "helper_name", "helper_no"];
  var fieldversions = ["reg_id", "vehicle_no", "device_id", "source", "destination", "seat_start", "seat_end", "model", "interface", "os_version", "sync_datetime", "sdcard_name", "sdcard_no", "owner_email", "owner_name", "owner_no", "driver_name", "driver_no", "helper_name", "helper_no"];

  var name = 'registered_' + (moment(new Date()).format('YYYY-MM-DD')).toString()
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-disposition', 'attachment;filename=' + name + '.csv');
  res.write(fields.join(","));

  function pagination() {
    vuscreen_getAllRegData_Pagination(req, function (err, doc) {
      if (doc.data.length > 0) {
        req.query.start = parseInt(req.query.start) + parseInt(req.query.length);
        var row = '';
        for (var i = 0; i < doc.data.length; i++) {
          var json = doc.data[i];
          var col = '';
          for (var x = 0; x < fields.length; x++) {
            var val = json[fields[x]];
            if (val) {
              val = val.toString().replace(/,/g, ' ').replace(/"/g, ' ');
            }
            if (val == '' || typeof (val) == 'undefined' || val == null) { val = ' '; };
            if (fields[x] == 'sync_datetime') { val = moment(val).format('YYYY-MM-DD HH:mm:ss ').toString() };
            if (col == '') {
              col = val;
            } else {
              col = col + ',' + val;
            }
          };
          if (row == '') { row = col; }
          else { row = row + '\r\n' + col; }
        };
        res.write('\r\n');
        res.write(row);
        pagination();
      } else {
        res.end();
      }
    })
  }
  pagination();
}


// Get list of events logs
var vuscreen_getAllEventsData_Pagination = function (req, cb) {
  var startDate = 'null', endDate = 'null';
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var filter = '';

  if (req.query.device_id) { filter = " AND ve.device_id ='" + req.query.device_id + "'" }
  if (req.query.interface) { filter = " AND ve.interface ='" + req.query.interface + "'" }
  if (req.query.version) { filter = " AND ve.version ='" + req.query.version + "'" }
  if (req.query.session_id) { filter = " AND ve.session_id ='" + req.query.session_id + "'" }
  if (req.query.user) { filter = " AND ve.user ='" + req.query.user + "'" }
  if (req.query.event) { filter = " AND ve.event ='" + req.query.event + "'" }
  if (req.query.vehicle_no) { filter = " AND vr.vehicle_no ='" + req.query.vehicle_no + "'" }
  if (req.query.reg_id) { filter = " AND vr.reg_id ='" + req.query.reg_id + "'" }

  var query = "select "
    + " ve.reg_id,ve.session_id,ve.device_id,ve.user,ve.event,ve.model,ve.interface,ve.version,ve.view_datetime,ve.sync_datetime,vr.source,vr.destination,vr.vehicle_no"
    + " from vuscreen_events ve LEFT JOIN vuscreen_content_package vc ON ve.view_id = vc.content_id"
    + " LEFT JOIN vuscreen_registration vr ON ve.reg_id = vr.reg_id"
    + " where ve.partner = '" + req.user.partner_id + "' AND ve.sync_date >= '" + startDate + "' AND ve.sync_date <= '" + endDate + "'" + filter
    + " order by ve.sync_datetime desc"

  var query = "select "
    + " ve.partner,"
    + " ve.reg_id,"
    + " ve.session_id,"
    + " ve.device_id,"
    + " ve.user,"
    + " ve.event,"
    + " ve.view_type,"
    + " ve.model,"
    + " ve.interface,"
    + " ve.package,"
    + " ve.version,"
    + " ve.view_datetime,"
    + " ve.sync_datetime,"
    + " ve.view_date,"
    + " DATE_FORMAT(ve.view_datetime, '%H:%i:%s') view_time,"
    + " ve.sync_date,"
    + " DATE_FORMAT(ve.sync_datetime, '%H:%i:%s') sync_time,"
    + " vr.source,"
    + " vr.destination,"
    + " vr.vehicle_no,"
    + " ve.view_id,"
    + " ve.tracking_id,"
    + " ve.latitude,"
    + " ve.longitude,"
    + " ve.sync_latitude,"
    + " ve.sync_longitude,"
    + " ve.journey_id,"
    + " ve.sync_type,"
    + " ve.unique_mac_address"
    + " from"
    + " vuscreen_events ve"
    + " LEFT JOIN"
    + " vuscreen_registration vr ON ve.reg_id = vr.reg_id"
    + " where"
    + " ve.partner = '" + req.user.partner_id + "'"
    + " AND ve.sync_date >= '" + startDate + "' AND ve.sync_date <= '" + endDate + "'" + filter
    + " order by ve.view_datetime desc,ve.sync_datetime"
  var option = { draw: req.query.draw, start: req.query.start, length: req.query.length };
  db.pagination(query, option, function (err, doc) {
    return cb(err, doc);
  })
};

// Get list of event bottom logs
exports.vuscreen_getEventData_Bottom = function (req, res) {
  var startDate = 'null', endDate = 'null';
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var query = "select (SELECT count(distinct device_id) FROM spicescreen.vuscreen_events where sync_date>='" + startDate + "' AND sync_date<='" + endDate + "' ) totalhost,"
    + "(SELECT count(distinct mac) FROM spicescreen.vuscreen_events where  sync_date>='" + startDate + "' AND sync_date<='" + endDate + "' ) totaluser,"
    + "(SELECT COUNT(DISTINCT a.journey_id) FROM spicescreen.vuscreen_events a  JOIN vuscreen_registration b ON a.device_id = b.device_id WHERE a.sync_date>='" + startDate + "' AND a.sync_date<='" + endDate + "'  and a.event like '%start%')StartCycle,"
    + "(SELECT COUNT(DISTINCT a.journey_id) FROM spicescreen.vuscreen_events a  JOIN vuscreen_registration b ON a.device_id = b.device_id WHERE a.sync_date>='" + startDate + "' AND a.sync_date<='" + endDate + "'  and a.event like '%stop%')StopCycle"

  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};
// Get list of events logs
exports.vuscreen_events_index = function (req, res) {
  vuscreen_getAllEventsData_Pagination(req, function (err, doc) {
    if (err) { return handleError(res, err); }
    else
      return res.status(200).json(doc);

  })
};


//export csv function for  events logs
exports.vuscreen_events_export_csv = function (req, res) {
  // var fields = ["journey_id", "vehicle_no", "reg_id", "user", "event", "model", "view_date", "view_time", "sync_date", "sync_time", "latitude", "longitude", "sync_latitude", "sync_longitude", "sync_type"];
  // var fieldversions = ["journey_id", "vehicle_no", "reg_id", "user", "event", "model", "view_date", "view_time", "sync_date", "sync_time", "latitude", "longitude", "sync_latitude", "sync_longitude", "sync_type"];
  var fields = ["vehicle_no", "source", "destination", "sync_date", "view_date", "event", "journey_id", "unique_mac_address", "sync_time", "view_time", "battery", "userConnected", "latitude", "longitude", "sync_latitude", "sync_longitude", "sync_type", "reg_id", "model"];
  var fieldversions = ["vehicle_no", "source", "destination", "sync_date", "view_date", "event", "journey_id", "unique_mac_address", "sync_time", "view_time", "battery", "userConnected", "latitude", "longitude", "sync_latitude", "sync_longitude", "sync_type", "reg_id", "model"];

  var name = 'events_' + (moment(new Date()).format('YYYY-MM-DD')).toString()
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-disposition', 'attachment;filename=' + name + '.csv');
  res.write(fields.join(","));

  function pagination() {
    vuscreen_getAllEventsData_Pagination(req, function (err, doc) {
      if (doc.data.length > 0) {
        req.query.start = parseInt(req.query.start) + parseInt(req.query.length);
        var row = '';
        for (var i = 0; i < doc.data.length; i++) {

          var sp = doc.data[i].event.split("|");

          if (sp.length == 1) {
            doc.data[i].event = sp[0];
            doc.data[i].battery = "-";
            doc.data[i].userConnected = "-";
          }
          if (sp.length == 2) {
            doc.data[i].event = sp[0];
            doc.data[i].battery = sp[1];
            doc.data[i].userConnected = "-";
          }
          if (sp.length == 3) {
            doc.data[i].event = sp[0];
            doc.data[i].battery = sp[1];
            doc.data[i].userConnected = sp[2];
          }
          var json = doc.data[i];

          var col = '';
          for (var x = 0; x < fields.length; x++) {
            var val = json[fields[x]];
            if (val) {
              val = val.toString().replace(/,/g, ' ').replace(/"/g, ' ');
            }
            if (val == '' || typeof (val) == 'undefined' || val == null) { val = ' '; };
            if (fields[x] == 'sync_datetime') { val = moment(val).format('YYYY-MM-DD HH:mm:ss ').toString() };
            if (col == '') {
              col = val;
            } else {
              col = col + ',' + val;
            }
          };
          if (row == '') { row = col; }
          else { row = row + '\r\n' + col; }
        };
        res.write('\r\n');
        res.write(row);
        pagination();
      } else {
        res.end();
      }
    })
  }
  pagination();
}

// Get list of tracker logs
var vuscreen_getAlTrackerData_Pagination = function (req, cb) {
  var startDate = 'null', endDate = 'null';
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var filter = '';
  if (req.query.mac) { filter = " AND vst.mac ='" + req.query.mac + "'" }
  if (req.query.device_id) { filter = " AND vst.device_id ='" + req.query.device_id + "'" }
  if (req.query.interface) { filter = " AND vst.interface ='" + req.query.interface + "'" }
  if (req.query.version) { filter = " AND vst.version ='" + req.query.version + "'" }
  if (req.query.session_id) { filter = " AND vst.session_id ='" + req.query.session_id + "'" }
  if (req.query.genre) { filter = " AND vc.genre ='" + req.query.genre + "'" }
  if (req.query.type) { filter = " AND vst.type ='" + req.query.type + "'" }
  if (req.query.vehicle_no) { filter = " AND vr.vehicle_no ='" + req.query.vehicle_no + "'" }
  if (req.query.reg_id) { filter = " AND vr.reg_id ='" + req.query.reg_id + "'" }

  var query = "select "
    + " vc.title,"
    + " vc.thumbnail,"
    + " vst.type,"
    + " vc.genre,"
    + " vf.folder,"
    + " am.login_id,"
    + " vst.session_id,"
    + " vst.view_android_id,"
    + " vst.device_id,"
    + " vst.version,"
    + " vst.interface,"
    + " vst.model,"
    + " vst.mac,"
    + " vst.reg_id,"
    + " vst.sync_date,"
    + " DATE_FORMAT(vst.sync_datetime, '%H:%i:%s') sync_time,"
    + " vst.view_model,"
    + " vst.view_duration view_duration,"
    + " vst.view_datetime,"
    + " vst.view_date,"
    + " DATE_FORMAT(vst.view_datetime, '%H:%i:%s') view_time,"
    + " vst.source,"
    + " vst.destination,"
    + " vr.vehicle_no,"
    + " vst.sync_datetime,"
    + " vst.user_agent,"
    + " vst.play_duration,"
    + " vst.sync_type,"
    + " vst.platform_duration"
    + " from"
    + " vuscreen_tracker vst"
    + " LEFT JOIN"
    + " vuscreen_content_package vc ON vst.view_id = vc.content_id"
    + " LEFT JOIN "
    + " vuscreen_folders vf ON vf.id = vc.folder_id"
    + " LEFT JOIN"
    + " account_management am ON vst.partner = am.id"
    + " LEFT JOIN "
    + " vuscreen_registration vr ON vst.reg_id = vr.reg_id"
    + " where vst.type IN ('video','brand-video') AND vst.sync_date>='" + startDate + "' AND vst.sync_date<='" + endDate + "' AND vst.partner = '" + req.user.partner_id + "'" + filter
    + " order by vst.view_datetime desc,vst.sync_datetime"
  console.log(query)
    var option = { draw: req.query.draw, start: req.query.start, length: req.query.length };
  db.pagination(query, option, function (err, doc) {
    return cb(err, doc);
  })
};
// Get list of tracker bottom logs
exports.vuscreen_getplayData_Bottom = function (req, res) {
  var startDate = 'null', endDate = 'null';
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var query = "select (SELECT count(distinct device_id) FROM spicescreen.vuscreen_tracker where menu='WATCH' and sync_date>='" + startDate + "' AND sync_date<='" + endDate + "' ) totalhost,"
    + "(SELECT count(distinct mac) FROM spicescreen.vuscreen_tracker where menu='WATCH' and sync_date>='" + startDate + "' AND sync_date<='" + endDate + "' ) Totaluser,"
    + "(SELECT ROUND(sum(view_duration/3600)) FROM spicescreen.vuscreen_tracker where menu='WATCH' and sync_date>='" + startDate + "' AND sync_date<='" + endDate + "' ) totalviewDuration,"
    + "(SELECT ROUND(sum(platform_duration/3600)) FROM spicescreen.vuscreen_tracker where menu='WATCH' and sync_date>='" + startDate + "' AND sync_date<='" + endDate + "' ) TotalPlatformDuration"

  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};

// Get list of tracker logs
exports.vuscreen_tracker_index = function (req, res) {
  vuscreen_getAlTrackerData_Pagination(req, function (err, doc) {
    if (err) { return handleError(res, err); }
    else
      return res.status(200).json(doc);

  })
};


//export csv function for  tracker logs
exports.vuscreen_tracker_export_csv = function (req, res) {
  // var fields = ["reg_id", "mac", "vehicle_no", "session_id", "title", "genre", "view_duration", "model", "view_date", "view_time", "sync_date", "sync_time", "user_agent","play_duration","sync_type","platform_duration"];
  // var fieldversions = ["reg_id", "mac", "vehicle_no", "session_id", "title", "genre", "view_duration", "model", "view_date", "view_time", "sync_date", "sync_time", "user_agent","play_duration","sync_type","platform_duration"];


  var fields = ["vehicle_no", "source", "destination", "title", "view_datetime", "sync_date", "view_duration", "play_duration", "platform_duration", "user_agent", "sync_time", "view_date", "view_time", "mac", "sync_type", "genre", "model", "reg_id", "session_id"];
  var fieldversions = ["vehicle_no", "source", "destination", "title", "view_datetime", "sync_date", "view_duration", "play_duration", "platform_duration", "user_agent", "sync_time", "view_date", "view_time", "mac", "sync_type", "genre", "model", "reg_id", "session_id"];

  var name = 'tracker' + (moment(new Date()).format('YYYY-MM-DD')).toString()
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-disposition', 'attachment;filename=' + name + '.csv');
  res.write(fieldversions.join(","));

  function pagination() {
    vuscreen_getAlTrackerData_Pagination(req, function (err, doc) {
      if (doc.data.length > 0) {
        req.query.start = parseInt(req.query.start) + parseInt(req.query.length);
        var row = '';
        for (var i = 0; i < doc.data.length; i++) {
          var json = doc.data[i];
          var col = '';
          for (var x = 0; x < fields.length; x++) {
            var val = json[fields[x]];
            if (val) {
              val = val.toString().replace(/,/g, ' ').replace(/"/g, ' ');
            }
            if (val == '' || typeof (val) == 'undefined' || val == null) { val = ' '; };
            if (fields[x] == 'sync_datetime') { val = moment(val).format('YYYY-MM-DD HH:mm:ss ').toString() };
            if (col == '') {
              col = val;
            } else {
              col = col + ',' + val;
            }
          };
          if (row == '') { row = col; }
          else { row = row + '\r\n' + col; }
        };
        res.write('\r\n');
        res.write(row);
        pagination();
      } else {
        res.end();
      }
    })
  }
  pagination();
}

// Get list of game   logs
var vuscreen_getGameData_Pagination = function (req, cb) {
  var startDate = 'null', endDate = 'null';
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var filter = '';
  if (req.query.mac) { filter = " AND vst.mac ='" + req.query.mac + "'" }
  if (req.query.device_id) { filter = " AND vst.device_id ='" + req.query.device_id + "'" }
  if (req.query.interface) { filter = " AND vst.interface ='" + req.query.interface + "'" }
  if (req.query.version) { filter = " AND vst.version ='" + req.query.version + "'" }
  if (req.query.session_id) { filter = " AND vst.session_id ='" + req.query.session_id + "'" }
  if (req.query.genre) { filter = " AND vc.genre ='" + req.query.genre + "'" }
  if (req.query.type) { filter = " AND vst.type ='" + req.query.type + "'" }
  if (req.query.vehicle_no) { filter = " AND vr.vehicle_no ='" + req.query.vehicle_no + "'" }
  if (req.query.reg_id) { filter = " AND vr.reg_id ='" + req.query.reg_id + "'" }

  var query = "select "
    + " vc.title,"
    + " vc.thumbnail,"
    + " vst.type,"
    // + " vc.genre,"
    + " am.login_id,"
    + " vst.session_id,"
    + " vst.view_android_id,"
    + " vst.device_id,"
    + " vst.version,"
    + " vst.interface,"
    + " vst.model,"
    + " vst.mac,"
    + " vst.reg_id,"
    + " vst.view_date,"
    + " DATE_FORMAT(vst.view_datetime, '%H:%i:%s') view_time,"
    + " vst.sync_date,"
    + " DATE_FORMAT(vst.sync_datetime, '%H:%i:%s') sync_time,"
    + " vst.view_model,"
    + " vst.view_duration view_duration,"
    + " vst.view_datetime,"
    + " vst.source,"
    + " vst.destination,"
    + " vr.vehicle_no,"
    + " vst.sync_datetime,"
    + " vst.user_agent,"
    + " vst.play_duration,"
    + " vst.sync_type"
    + " from"
    + " vuscreen_tracker vst"
    + " LEFT JOIN"
    + " vuscreen_store_content vc ON vst.view_id = vc.content_id"
    + " LEFT JOIN"
    + " account_management am ON vst.partner = am.id"
    + " LEFT JOIN "
    + " vuscreen_registration vr ON vst.reg_id = vr.reg_id"
    + " where vst.type = 'zip' AND vst.sync_date>='" + startDate + "' AND vst.sync_date<='" + endDate + "' AND vst.partner = '" + req.user.partner_id + "'" + filter
    + " order by vst.view_datetime desc,vst.sync_datetime"
  var option = { draw: req.query.draw, start: req.query.start, length: req.query.length };
  db.pagination(query, option, function (err, doc) {
    return cb(err, doc);
  })
};

// Get list of game bottom logs
exports.vuscreen_getGameData_Bottom = function (req, res) {
  var startDate = 'null', endDate = 'null';
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var query = "select (SELECT count(distinct device_id) FROM spicescreen.vuscreen_tracker where menu='STORE' and sync_date>='" + startDate + "' AND sync_date<='" + endDate + "' ) gamehost,"
    + "(SELECT count(distinct mac) FROM spicescreen.vuscreen_tracker where menu='STORE' and sync_date>='" + startDate + "' AND sync_date<='" + endDate + "' ) gameuser"
  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};
// Get list of game logs
exports.vuscreen_game_index = function (req, res) {
  vuscreen_getGameData_Pagination(req, function (err, doc) {
    if (err) { return handleError(res, err); }
    else


      return res.status(200).json(doc);


    // return res.status(200).json(doc);
  })
};


//export csv function for game logs
exports.vuscreen_game_export_csv = function (req, res) {
  var fields = ["vehicle_no", "source", "destination", "title", "view_datetime", "user_agent", "sync_date", "view_duration", "sync_time", "view_date", "view_time", "mac", "genre", "model", "reg_id", "session_id"];
  var fieldversions = ["vehicle_no", "source", "destination", "title", "view_datetime", "user_agent", "sync_date", "view_duration", "sync_time", "view_date", "view_time", "mac", "genre", "model", "reg_id", "session_id"];

  var name = 'game' + (moment(new Date()).format('YYYY-MM-DD')).toString()
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-disposition', 'attachment;filename=' + name + '.csv');
  res.write(fieldversions.join(","));

  function pagination() {
    vuscreen_getGameData_Pagination(req, function (err, doc) {
      if (doc.data.length > 0) {
        req.query.start = parseInt(req.query.start) + parseInt(req.query.length);
        var row = '';
        for (var i = 0; i < doc.data.length; i++) {
          var json = doc.data[i];
          var col = '';
          for (var x = 0; x < fields.length; x++) {
            var val = json[fields[x]];
            if (val) {
              val = val.toString().replace(/,/g, ' ').replace(/"/g, ' ');
            }
            if (val == '' || typeof (val) == 'undefined' || val == null) { val = ' '; };
            if (fields[x] == 'sync_datetime') { val = moment(val).format('YYYY-MM-DD HH:mm:ss ').toString() };
            if (col == '') {
              col = val;
            } else {
              col = col + ',' + val;
            }
          };
          if (row == '') { row = col; }
          else { row = row + '\r\n' + col; }
        };
        res.write('\r\n');
        res.write(row);
        pagination();
      } else {
        res.end();
      }
    })
  }
  pagination();
}

// Get list of ads logs
var vuscreen_getAdsData_Pagination = function (req, cb) {
  var startDate = 'null', endDate = 'null';
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var filter = '';
  if (req.query.mac) { filter = " AND vst.mac ='" + req.query.mac + "'" }
  if (req.query.device_id) { filter = " AND vst.device_id ='" + req.query.device_id + "'" }
  if (req.query.interface) { filter = " AND vst.interface ='" + req.query.interface + "'" }
  if (req.query.version) { filter = " AND vst.version ='" + req.query.version + "'" }
  if (req.query.session_id) { filter = " AND vst.session_id ='" + req.query.session_id + "'" }
  if (req.query.type) { filter = " AND vst.type ='" + req.query.type + "'" }
  if (req.query.vehicle_no) { filter = " AND vr.vehicle_no ='" + req.query.vehicle_no + "'" }
  if (req.query.reg_id) { filter = " AND vr.reg_id ='" + req.query.reg_id + "'" }

  var query = "select "
    + " vc.title,"
    + " vc.thumbnail,"
    + " vst.type,"
    + " am.login_id,"
    + " vst.session_id,"
    + " vst.view_android_id,"
    + " vst.device_id,"
    + " vst.version,"
    + " vst.interface,"
    + " vst.model,"
    + " vst.mac,"
    + " vst.reg_id,"
    + " vst.view_model,"
    + " vst.view_duration view_duration,"
    + " vst.view_datetime,"
    + " vst.source,"
    + " vst.destination,"
    + " vr.vehicle_no,"
    + " vst.sync_datetime,"
    + " vst.user_agent,"
    + " vst.play_duration,"
    + " vst.sync_type"
    + " from"
    + " vuscreen_tracker vst"
    + " LEFT JOIN"
    + " vuscreen_advertise_content vc ON vst.view_id = vc.id"
    + " LEFT JOIN"
    + " account_management am ON vst.partner = am.id"
    + " LEFT JOIN "
    + " vuscreen_registration vr ON vst.reg_id = vr.reg_id"
    + " where vst.type IN ('banner-ad','banner-adgames','banner-adtravel','banner-admall','banner-adfnb','banner-ad','video-ad','interstitial') AND vst.sync_date>='" + startDate + "' AND vst.sync_date<='" + endDate + "' AND vst.partner = '" + req.user.partner_id + "'" + filter
    + " order by vst.view_datetime desc,vst.sync_datetime"

  var option = { draw: req.query.draw, start: req.query.start, length: req.query.length };
  db.pagination(query, option, function (err, doc) {
    return cb(err, doc);
  })
};

// Get list of ads logs
exports.vuscreen_ads_index = function (req, res) {
  vuscreen_getAdsData_Pagination(req, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};


//export csv function for  ads logs
exports.vuscreen_ads_export_csv = function (req, res) {
  var fields = ["vehicle_no", "title", "view_datetime", "view_duration", "source", "destination", "mac", "type", "view_model", "model", "device_id", "view_android_id", "interface", "version", "reg_id", "session_id"];
  var fieldversions = ["vehicle_no", "title", "view_datetime", "view_duration", "source", "destination", "mac", "type", "view_model", "model", "device_id", "view_android_id", "interface", "version", "reg_id", "session_id"];
  var name = 'ads' + (moment(new Date()).format('YYYY-MM-DD')).toString()
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-disposition', 'attachment;filename=' + name + '.csv');
  res.write(fieldversions.join(","));

  function pagination() {
    vuscreen_getAdsData_Pagination(req, function (err, doc) {
      if (doc.data.length > 0) {
        req.query.start = parseInt(req.query.start) + parseInt(req.query.length);
        var row = '';
        for (var i = 0; i < doc.data.length; i++) {
          var json = doc.data[i];
          var col = '';
          for (var x = 0; x < fields.length; x++) {
            var val = json[fields[x]];
            if (val) {
              val = val.toString().replace(/,/g, ' ').replace(/"/g, ' ');
            }
            if (val == '' || typeof (val) == 'undefined' || val == null) { val = ' '; };
            if (fields[x] == 'sync_datetime') { val = moment(val).format('YYYY-MM-DD HH:mm:ss ').toString() };
            if (col == '') {
              col = val;
            } else {
              col = col + ',' + val;
            }
          };
          if (row == '') { row = col; }
          else { row = row + '\r\n' + col; }
        };
        res.write('\r\n');
        res.write(row);
        pagination();
      } else {
        res.end();
      }
    })
  }
  pagination();
}

// Get list of read logs
var vuscreen_getReadData_Pagination = function (req, cb) {
  var startDate = 'null', endDate = 'null';
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var filter = '';
  if (req.query.mac) { filter = " AND vst.mac ='" + req.query.mac + "'" }
  if (req.query.device_id) { filter = " AND vst.device_id ='" + req.query.device_id + "'" }
  if (req.query.interface) { filter = " AND vst.interface ='" + req.query.interface + "'" }
  if (req.query.version) { filter = " AND vst.version ='" + req.query.version + "'" }
  if (req.query.session_id) { filter = " AND vst.session_id ='" + req.query.session_id + "'" }
  if (req.query.genre) { filter = " AND vc.genre ='" + req.query.genre + "'" }
  if (req.query.type) { filter = " AND vst.type ='" + req.query.type + "'" }
  if (req.query.vehicle_no) { filter = " AND vr.vehicle_no ='" + req.query.vehicle_no + "'" }
  if (req.query.reg_id) { filter = " AND vr.reg_id ='" + req.query.reg_id + "'" }

  var query = "select "
    + " vc.title,"
    + " vc.thumbnail,"
    + " vst.type,"
    // + " vc.genre,"
    + " am.login_id,"
    + " vst.session_id,"
    + " vst.view_android_id,"
    + " vst.device_id,"
    + " vst.version,"
    + " vst.interface,"
    + " vst.model,"
    + " vst.mac,"
    + " vst.reg_id,"
    + " vst.sync_date,"
    + " vst.view_model,"
    + " vst.view_duration view_duration,"
    + " vst.view_datetime,"
    + " vst.source,"
    + " vst.destination,"
    + " vr.vehicle_no,"
    + " vst.sync_datetime,"
    + " vst.user_agent,"
    + " vst.play_duration,"
    + " vst.sync_type"
    + " from"
    + " vuscreen_tracker vst"
    + " LEFT JOIN"
    + " vuscreen_read_content vc ON vst.view_id = vc.content_id"
    + " LEFT JOIN"
    + " account_management am ON vst.partner = am.id"
    + " LEFT JOIN "
    + " vuscreen_registration vr ON vst.reg_id = vr.reg_id"
    + " where vst.menu= 'READ' AND vst.trackingDetails != 'click' AND vst.sync_date>='" + startDate + "' AND vst.sync_date<='" + endDate + "' AND vst.partner = '" + req.user.partner_id + "'" + filter
    + " order by vst.view_datetime desc,vst.sync_datetime"
  console.log(query)
  var option = { draw: req.query.draw, start: req.query.start, length: req.query.length };
  db.pagination(query, option, function (err, doc) {
    return cb(err, doc);
  })
};

// Get list of read bottom logs
exports.vuscreen_getreadData_Bottom = function (req, res) {
  var startDate = 'null', endDate = 'null';
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var query = "select (SELECT count(1) FROM spicescreen.vuscreen_tracker where type='audio' and sync_date>='" + startDate + "' AND sync_date<='" + endDate + "' ) audioclick,"
    + "(SELECT count(distinct mac) FROM spicescreen.vuscreen_tracker where type='audio' and sync_date>='" + startDate + "' AND sync_date<='" + endDate + "' ) audiouser,"
    + "(SELECT count(1) FROM spicescreen.vuscreen_tracker where type='pdf' and sync_date>='" + startDate + "' AND sync_date<='" + endDate + "' ) magzineclick,"
    + "(SELECT count(distinct mac) FROM spicescreen.vuscreen_tracker where type='pdf' and sync_date>='" + startDate + "' AND sync_date<='" + endDate + "' ) magzineuser,"
    + "(SELECT count(distinct device_id) FROM spicescreen.vuscreen_tracker where type='pdf' and  sync_date>='" + startDate + "' AND sync_date<='" + endDate + "') magzinedevice,"
    + "(SELECT count(distinct device_id) FROM spicescreen.vuscreen_tracker where type='audio' and  sync_date>='" + startDate + "' AND sync_date<='" + endDate + "') audiodevice,"
    + "(SELECT count(distinct device_id) FROM spicescreen.vuscreen_tracker where type in ('audio','pdf') and  sync_date>='" + startDate + "' AND sync_date<='" + endDate + "') TotalHOst,"
    + "(SELECT count(distinct mac) FROM spicescreen.vuscreen_tracker where type in ('audio','pdf') and  sync_date>='" + startDate + "' AND sync_date<='" + endDate + "') TotalUser"
  db.get().query(query, function (err, doc) {
    console.log(doc);
    console.log(err);
    return res.status(200).json(doc);
  })
};
// Get list of read logs
exports.vuscreen_read_index = function (req, res) {
  vuscreen_getReadData_Pagination(req, function (err, doc) {
    if (err) { return handleError(res, err); }
    else

      return res.status(200).json(doc);

  })
};


//export csv function for read logs
exports.vuscreen_read_export_csv = function (req, res) {
  var fields = ["vehicle_no", "source", "destination", "title", "view_datetime", "view_duration", "type", "user_agent", "sync_date", "mac", "device_id", "genre", "view_model", "model", "view_android_id", "interface", "version", "session_id", "reg_id"];
  var fieldversions = ["vehicle_no", "source", "destination", "title", "view_datetime", "view_duration", "type", "user_agent", "sync_date", "mac", "device_id", "genre", "view_model", "model", "view_android_id", "interface", "version", "session_id", "reg_id"];
  var name = 'read' + (moment(new Date()).format('YYYY-MM-DD')).toString()
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-disposition', 'attachment;filename=' + name + '.csv');
  res.write(fieldversions.join(","));

  function pagination() {
    vuscreen_getReadData_Pagination(req, function (err, doc) {
      if (doc.data.length > 0) {
        req.query.start = parseInt(req.query.start) + parseInt(req.query.length);
        var row = '';
        for (var i = 0; i < doc.data.length; i++) {
          var json = doc.data[i];
          var col = '';
          for (var x = 0; x < fields.length; x++) {
            var val = json[fields[x]];
            if (val) {
              val = val.toString().replace(/,/g, ' ').replace(/"/g, ' ');
            }
            if (val == '' || typeof (val) == 'undefined' || val == null) { val = ' '; };
            if (fields[x] == 'sync_datetime') { val = moment(val).format('YYYY-MM-DD HH:mm:ss ').toString() };
            if (col == '') {
              col = val;
            } else {
              col = col + ',' + val;
            }
          };
          if (row == '') { row = col; }
          else { row = row + '\r\n' + col; }
        };
        res.write('\r\n');
        res.write(row);
        pagination();
      } else {
        res.end();
      }
    })
  }
  pagination();
}

// Get list of travel logs
var vuscreen_getTravelData_Pagination = function (req, cb) {
  var startDate = 'null', endDate = 'null';
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var filter = '';
  if (req.query.mac) { filter = " AND vst.mac ='" + req.query.mac + "'" }
  if (req.query.device_id) { filter = " AND vst.device_id ='" + req.query.device_id + "'" }
  if (req.query.interface) { filter = " AND vst.interface ='" + req.query.interface + "'" }
  if (req.query.version) { filter = " AND vst.version ='" + req.query.version + "'" }
  if (req.query.session_id) { filter = " AND vst.session_id ='" + req.query.session_id + "'" }
  if (req.query.genre) { filter = " AND vc.genre ='" + req.query.genre + "'" }
  if (req.query.type) { filter = " AND vst.type ='" + req.query.type + "'" }
  if (req.query.vehicle_no) { filter = " AND vr.vehicle_no ='" + req.query.vehicle_no + "'" }
  if (req.query.reg_id) { filter = " AND vr.reg_id ='" + req.query.reg_id + "'" }

  var query = "select "
    + " vc.title,"
    + " vc.thumbnail,"
    + " vst.type,"
    // + " vc.genre,"
    + " am.login_id,"
    + " vst.session_id,"
    + " vst.view_android_id,"
    + " vst.device_id,"
    + " vst.version,"
    + " vst.interface,"
    + " vst.model,"
    + " vst.mac,"
    + " vst.reg_id,"
    + " vst.sync_date,"
    + " vst.view_model,"
    + " vst.view_duration view_duration,"
    + " vst.view_datetime,"
    + " vst.source,"
    + " vst.destination,"
    + " vr.vehicle_no,"
    + " vst.sync_datetime,"
    + " vst.user_agent,"
    + " vst.play_duration,"
    + " vst.sync_type"
    + " from"
    + " vuscreen_tracker vst"
    + " LEFT JOIN"
    + " vuscreen_travel_content vc ON vst.view_id = vc.content_id"
    + " LEFT JOIN"
    + " account_management am ON vst.partner = am.id"
    + " LEFT JOIN "
    + " vuscreen_registration vr ON vst.reg_id = vr.reg_id"
    + " where vst.menu= 'TRAVEL' AND vst.trackingDetails != 'click' AND vst.sync_date>='" + startDate + "' AND vst.sync_date<='" + endDate + "' AND vst.partner = '" + req.user.partner_id + "'" + filter
    + " order by vst.view_datetime desc,vst.sync_datetime"
  console.log(query)
  var option = { draw: req.query.draw, start: req.query.start, length: req.query.length };
  db.pagination(query, option, function (err, doc) {
    return cb(err, doc);
  })
};

// Get list of travel logs
exports.vuscreen_travel_index = function (req, res) {
  vuscreen_getTravelData_Pagination(req, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};


//export csv function for travel logs
exports.vuscreen_travel_export_csv = function (req, res) {
  var fields = ["vehicle_no", "title", "view_datetime", "sync_date", "view_duration", "source", "destination", "mac", "type", "device_id", "genre", "view_model", "model", "view_android_id", "interface", "version", "user_agent", "reg_id", "session_id"];
  var fieldversions = ["vehicle_no", "title", "view_datetime", "sync_date", "view_duration", "source", "destination", "mac", "type", "device_id", "genre", "view_model", "model", "view_android_id", "interface", "version", "user_agent", "reg_id", "session_id"];
  var name = 'travel' + (moment(new Date()).format('YYYY-MM-DD')).toString()
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-disposition', 'attachment;filename=' + name + '.csv');
  res.write(fieldversions.join(","));

  function pagination() {
    vuscreen_getTravelData_Pagination(req, function (err, doc) {
      if (doc.data.length > 0) {
        req.query.start = parseInt(req.query.start) + parseInt(req.query.length);
        var row = '';
        for (var i = 0; i < doc.data.length; i++) {
          var json = doc.data[i];
          var col = '';
          for (var x = 0; x < fields.length; x++) {
            var val = json[fields[x]];
            if (val) {
              val = val.toString().replace(/,/g, ' ').replace(/"/g, ' ');
            }
            if (val == '' || typeof (val) == 'undefined' || val == null) { val = ' '; };
            if (fields[x] == 'sync_datetime') { val = moment(val).format('YYYY-MM-DD HH:mm:ss ').toString() };
            if (col == '') {
              col = val;
            } else {
              col = col + ',' + val;
            }
          };
          if (row == '') { row = col; }
          else { row = row + '\r\n' + col; }
        };
        res.write('\r\n');
        res.write(row);
        pagination();
      } else {
        res.end();
      }
    })
  }
  pagination();
}

// Get list of mall logs
var vuscreen_getMallData_Pagination = function (req, cb) {
  var startDate = 'null', endDate = 'null';
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var filter = '';
  if (req.query.mac) { filter = " AND vst.mac ='" + req.query.mac + "'" }
  if (req.query.device_id) { filter = " AND vst.device_id ='" + req.query.device_id + "'" }
  if (req.query.interface) { filter = " AND vst.interface ='" + req.query.interface + "'" }
  if (req.query.version) { filter = " AND vst.version ='" + req.query.version + "'" }
  if (req.query.session_id) { filter = " AND vst.session_id ='" + req.query.session_id + "'" }
  if (req.query.genre) { filter = " AND vc.genre ='" + req.query.genre + "'" }
  if (req.query.type) { filter = " AND vst.type ='" + req.query.type + "'" }
  if (req.query.vehicle_no) { filter = " AND vr.vehicle_no ='" + req.query.vehicle_no + "'" }
  if (req.query.reg_id) { filter = " AND vr.reg_id ='" + req.query.reg_id + "'" }

  var query = "select "
    + " vc.title,"
    + " vc.thumbnail,"
    + " vst.type,"
    // + " vc.genre,"
    + " am.login_id,"
    + " vst.session_id,"
    + " vst.view_android_id,"
    + " vst.device_id,"
    + " vst.version,"
    + " vst.interface,"
    + " vst.model,"
    + " vst.mac,"
    + " vst.reg_id,"
    + " vst.sync_date,"
    + " vst.view_model,"
    + " vst.view_duration view_duration,"
    + " vst.view_datetime,"
    + " vst.source,"
    + " vst.destination,"
    + " vr.vehicle_no,"
    + " vst.sync_datetime,"
    + " vst.user_agent,"
    + " vst.play_duration,"
    + " vst.sync_type"
    + " from"
    + " vuscreen_tracker vst"
    + " LEFT JOIN"
    + " vuscreen_mall_content vc ON vst.view_id = vc.content_id"
    + " LEFT JOIN"
    + " account_management am ON vst.partner = am.id"
    + " LEFT JOIN "
    + " vuscreen_registration vr ON vst.reg_id = vr.reg_id"
    + " where vst.menu= 'MALL' AND vst.trackingDetails != 'click' AND vst.sync_date>='" + startDate + "' AND vst.sync_date<='" + endDate + "' AND vst.partner = '" + req.user.partner_id + "'" + filter
    + " order by vst.view_datetime desc,vst.sync_datetime"
  console.log(query)
  var option = { draw: req.query.draw, start: req.query.start, length: req.query.length };
  db.pagination(query, option, function (err, doc) {
    return cb(err, doc);
  })
};

// Get list of mall logs
exports.vuscreen_mall_index = function (req, res) {
  vuscreen_getMallData_Pagination(req, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};


//export csv function for mall logs
exports.vuscreen_mall_export_csv = function (req, res) {
  var fields = ["reg_id", "source", "destination", "mac", "vehicle_no", "session_id", "device_id", "title", "genre", "type", "view_model", "view_duration", "model", "view_android_id", "interface", "version", "view_datetime", "sync_date", "user_agent"];
  var fieldversions = ["reg_id", "source", "destination", "mac", "vehicle_no", "session_id", "device_id", "title", "genre", "type", "view_model", "view_duration(seconds)", "model", "client_id", "interface", "version", "view_datetime", "sync_date", "user_agent"];

  var name = 'mall' + (moment(new Date()).format('YYYY-MM-DD')).toString()
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-disposition', 'attachment;filename=' + name + '.csv');
  res.write(fieldversions.join(","));

  function pagination() {
    vuscreen_getMallData_Pagination(req, function (err, doc) {
      if (doc.data.length > 0) {
        req.query.start = parseInt(req.query.start) + parseInt(req.query.length);
        var row = '';
        for (var i = 0; i < doc.data.length; i++) {
          var json = doc.data[i];
          var col = '';
          for (var x = 0; x < fields.length; x++) {
            var val = json[fields[x]];
            if (val) {
              val = val.toString().replace(/,/g, ' ').replace(/"/g, ' ');
            }
            if (val == '' || typeof (val) == 'undefined' || val == null) { val = ' '; };
            if (fields[x] == 'sync_datetime') { val = moment(val).format('YYYY-MM-DD HH:mm:ss ').toString() };
            if (col == '') {
              col = val;
            } else {
              col = col + ',' + val;
            }
          };
          if (row == '') { row = col; }
          else { row = row + '\r\n' + col; }
        };
        res.write('\r\n');
        res.write(row);
        pagination();
      } else {
        res.end();
      }
    })
  }
  pagination();
}

// Get list of FnB logs
var vuscreen_getFnBData_Pagination = function (req, cb) {
  var startDate = 'null', endDate = 'null';
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var filter = '';
  if (req.query.mac) { filter = " AND vst.mac ='" + req.query.mac + "'" }
  if (req.query.device_id) { filter = " AND vst.device_id ='" + req.query.device_id + "'" }
  if (req.query.interface) { filter = " AND vst.interface ='" + req.query.interface + "'" }
  if (req.query.version) { filter = " AND vst.version ='" + req.query.version + "'" }
  if (req.query.session_id) { filter = " AND vst.session_id ='" + req.query.session_id + "'" }
  if (req.query.genre) { filter = " AND vc.genre ='" + req.query.genre + "'" }
  if (req.query.type) { filter = " AND vst.type ='" + req.query.type + "'" }
  if (req.query.vehicle_no) { filter = " AND vr.vehicle_no ='" + req.query.vehicle_no + "'" }
  if (req.query.reg_id) { filter = " AND vr.reg_id ='" + req.query.reg_id + "'" }

  var query = "select "
    + " vc.title,"
    + " vc.thumbnail,"
    + " vst.type,"
    // + " vc.genre,"
    + " am.login_id,"
    + " vst.session_id,"
    + " vst.view_android_id,"
    + " vst.device_id,"
    + " vst.version,"
    + " vst.interface,"
    + " vst.model,"
    + " vst.mac,"
    + " vst.reg_id,"
    + " vst.sync_date,"
    + " vst.view_model,"
    + " vst.view_duration view_duration,"
    + " vst.view_datetime,"
    + " vst.source,"
    + " vst.destination,"
    + " vr.vehicle_no,"
    + " vst.sync_datetime,"
    + " vst.user_agent,"
    + " vst.play_duration,"
    + " vst.sync_type,"
    + " vst.trackingDetails"
    + " from"
    + " vuscreen_tracker vst"
    + " LEFT JOIN"
    + " vuscreen_fnb_content vc ON vst.view_id = vc.content_id"
    + " LEFT JOIN"
    + " account_management am ON vst.partner = am.id"
    + " LEFT JOIN "
    + " vuscreen_registration vr ON vst.reg_id = vr.reg_id"
    + " where vst.menu= 'F&B' AND vst.trackingDetails != 'click' AND vst.sync_date>='" + startDate + "' AND vst.sync_date<='" + endDate + "' AND vst.partner = '" + req.user.partner_id + "'" + filter
    + " order by vst.view_datetime desc,vst.sync_datetime"
  console.log(query)
  var option = { draw: req.query.draw, start: req.query.start, length: req.query.length };
  db.pagination(query, option, function (err, doc) {
    return cb(err, doc);
  })
};
// Get list of read bottom logs
exports.vuscreen_getfnbData_Bottom = function (req, res) {
  var startDate = 'null', endDate = 'null';
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var query = "select (SELECT count(distinct device_id) FROM spicescreen.vuscreen_tracker where menu='fnb' and sync_date>='" + startDate + "' AND sync_date<='" + endDate + "' ) TotalHost,"
    + "(SELECT count(distinct mac) FROM spicescreen.vuscreen_tracker where menu='fnb' and sync_date>='" + startDate + "' AND sync_date<='" + endDate + "' ) Totaluser,"
    + "(SELECT count(1) FROM spicescreen.vuscreen_tracker as a join vuscreen_fnb_content as b on a.view_id=b.content_id WHERE  menu ='f&b' and b.type='Veg' and a.sync_date>='" + startDate + "' AND a.sync_date<='" + endDate + "')Veg,"
    + "(SELECT count(1) FROM spicescreen.vuscreen_tracker as a join vuscreen_fnb_content as b on a.view_id=b.content_id WHERE menu ='f&b'and b.type='Non-Veg' and a.sync_date>='" + startDate + "' AND a.sync_date<='" + endDate + "')Non_veg"
  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};
// Get list of FnB logs
exports.vuscreen_FnB_index = function (req, res) {
  vuscreen_getFnBData_Pagination(req, function (err, doc) {
    if (err) { return handleError(res, err); }
    else

      return res.status(200).json(doc);

  })
};


//export csv function for FnB logs
exports.vuscreen_FnB_export_csv = function (req, res) {
  var fields = ["vehicle_no", "source", "destination", "title", "view_datetime", "sync_date", "type", "user_agent", "view_duration", "play_duration", "mac", "view_model", "model", "view_android_id", "interface", "version", "sync_type", "device_id", "genre", "reg_id", "session_id"];
  var fieldversions = ["vehicle_no", "source", "destination", "title", "view_datetime", "sync_date", "type", "user_agent", "view_duration", "play_duration", "mac", "view_model", "model", "view_android_id", "interface", "version", "sync_type", "device_id", "genre", "reg_id", "session_id"];
  var name = 'FnB' + (moment(new Date()).format('YYYY-MM-DD')).toString()
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-disposition', 'attachment;filename=' + name + '.csv');
  res.write(fieldversions.join(","));

  function pagination() {
    vuscreen_getFnBData_Pagination(req, function (err, doc) {
      if (doc.data.length > 0) {
        req.query.start = parseInt(req.query.start) + parseInt(req.query.length);
        var row = '';
        for (var i = 0; i < doc.data.length; i++) {
          var json = doc.data[i];
          var col = '';
          for (var x = 0; x < fields.length; x++) {
            var val = json[fields[x]];
            if (val) {
              val = val.toString().replace(/,/g, ' ').replace(/"/g, ' ');
            }
            if (val == '' || typeof (val) == 'undefined' || val == null) { val = ' '; };
            if (fields[x] == 'sync_datetime') { val = moment(val).format('YYYY-MM-DD HH:mm:ss ').toString() };
            if (col == '') {
              col = val;
            } else {
              col = col + ',' + val;
            }
          };
          if (row == '') { row = col; }
          else { row = row + '\r\n' + col; }
        };
        res.write('\r\n');
        res.write(row);
        pagination();
      } else {
        res.end();
      }
    })
  }
  pagination();
}

// Get list of tracker logs for FOR FOG
var vuscreen_getAlTracker1Data_Pagination = function (req, cb) {
  var startDate = 'null', endDate = 'null';
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var filter = '';

  if (req.query.mac) { filter = " AND vst.mac ='" + req.query.mac + "'" }
  if (req.query.session_id) { filter = " AND vst.session_id ='" + req.query.session_id + "'" }
  if (req.query.genre) { filter = " AND vc.genre ='" + req.query.genre + "'" }
  if (req.query.type) { filter = " AND vst.type ='" + req.query.type + "'" }

  var query = "select "
    + " vc.title,"
    + " vc.thumbnail,"
    + " vst.type,"
    + " vc.genre,"
    + " vst.session_id,"
    + " vst.view_android_id,"
    + " vst.mac,"
    + " vst.view_duration view_duration,"
    + " vst.sync_datetime"
    + " from"
    + " vuscreen_tracker vst"
    + " LEFT JOIN"
    + " vuscreen_content_package vc ON vst.view_id = vc.content_id"
    + " LEFT JOIN"
    + " account_management am ON vst.partner = am.id"
    + " LEFT JOIN "
    + " vuscreen_registration vr ON vst.reg_id = vr.reg_id"
    + " where vst.sync_date>='" + startDate + "' AND vst.sync_date<='" + endDate + "' AND vst.partner = '" + req.user.partner_id + "'" + filter
    + " order by sync_datetime desc"
  var option = { draw: req.query.draw, start: req.query.start, length: req.query.length };
  db.pagination(query, option, function (err, doc) {
    return cb(err, doc);
  })
};

// Get list of tracker1 logs
exports.vuscreen_tracker1_index = function (req, res) {
  vuscreen_getAlTracker1Data_Pagination(req, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};


//export csv function for  tracker logs
exports.vuscreen_tracker1_export_csv = function (req, res) {
  var fields = ["title", "sync_datetime", "view_duration", "type", "mac", "genre", "view_android_id", "session_id"];
  var fieldversions = ["title", "sync_datetime", "view_duration", "type", "mac", "genre", "view_android_id", "session_id"];
  var name = 'tracker' + (moment(new Date()).format('YYYY-MM-DD')).toString()
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-disposition', 'attachment;filename=' + name + '.csv');
  res.write(fieldversions.join(","));

  function pagination() {
    vuscreen_getAlTracker1Data_Pagination(req, function (err, doc) {
      if (doc.data.length > 0) {
        req.query.start = parseInt(req.query.start) + parseInt(req.query.length);
        var row = '';
        for (var i = 0; i < doc.data.length; i++) {
          var json = doc.data[i];
          var col = '';
          for (var x = 0; x < fields.length; x++) {
            var val = json[fields[x]];
            if (val) {
              val = val.toString().replace(/,/g, ' ').replace(/"/g, ' ');
            }
            if (val == '' || typeof (val) == 'undefined' || val == null) { val = ' '; };
            if (fields[x] == 'sync_datetime') { val = moment(val).format('YYYY-MM-DD HH:mm:ss ').toString() };
            if (col == '') {
              col = val;
            } else {
              col = col + ',' + val;
            }
          };
          if (row == '') { row = col; }
          else { row = row + '\r\n' + col; }
        };
        res.write('\r\n');
        res.write(row);
        pagination();
      } else {
        res.end();
      }
    })
  }
  pagination();
}


// Get list of memory tracker logs
var vuscreen_getAllMemoryData_Pagination = function (req, cb) {
  var startDate = 'null', endDate = 'null';
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var filter = '';

  if (req.query.interface) { filter = " AND vst.interface ='" + req.query.interface + "'" }
  if (req.query.version) { filter = " AND vst.version ='" + req.query.version + "'" }
  if (req.query.reg_id) { filter = " AND vst.session_id ='" + req.query.session_id + "'" }

  var query = "select"
    + " android_id,sync_timestamp,device_total_memory,device_remaining_memory,interface,model,version,package,reg_id"
    + " from"
    + " vuscreen_device_memory_tracker"
    + " where sync_date>='" + startDate + "' AND sync_date<='" + endDate + "'" + filter
    + " order by sync_timestamp desc"
  var option = { draw: req.query.draw, start: req.query.start, length: req.query.length };
  db.pagination(query, option, function (err, doc) {
    return cb(err, doc);
  })
};

// Get list of memory tracker logs
exports.memory_tracker_index = function (req, res) {
  vuscreen_getAllMemoryData_Pagination(req, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};


//export csv function for memory tracker logs
exports.memory_tracker_export_csv = function (req, res) {
  var fields = ["android_id", "sync_timestamp", "device_total_memory", "device_remaining_memory", "interface", "model", "version", "package", "reg_id"];
  var fieldversions = ["android_id", "sync_timestamp", "device_total_memory", "device_remaining_memory", "interface", "model", "version", "package", "reg_id"];

  var name = 'memory_tracker' + (moment(new Date()).format('YYYY-MM-DD')).toString()
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-disposition', 'attachment;filename=' + name + '.csv');
  res.write(fieldversions.join(","));

  function pagination() {
    vuscreen_getAllMemoryData_Pagination(req, function (err, doc) {
      if (doc.data.length > 0) {
        req.query.start = parseInt(req.query.start) + parseInt(req.query.length);
        var row = '';
        for (var i = 0; i < doc.data.length; i++) {
          var json = doc.data[i];
          var col = '';
          for (var x = 0; x < fields.length; x++) {
            var val = json[fields[x]];
            if (val) {
              val = val.toString().replace(/,/g, ' ').replace(/"/g, ' ');
            }
            if (val == '' || typeof (val) == 'undefined' || val == null) { val = ' '; };
            if (fields[x] == 'sync_timestamp') { val = moment(val).format('YYYY-MM-DD HH:mm:ss ').toString() };
            if (col == '') {
              col = val;
            } else {
              col = col + ',' + val;
            }
          };
          if (row == '') { row = col; }
          else { row = row + '\r\n' + col; }
        };
        res.write('\r\n');
        res.write(row);
        pagination();
      } else {
        res.end();
      }
    })
  }
  pagination();
}

exports.top_10_content = function (req, res) {
  var startDate, endDate;
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var query = '';
  if (req.query.vehicle_no == "undefined" || req.query.vehicle_no == "") {
    query = "select "
      + " vc.title,"
      + " vc.genre,"
      + " count(1) count,"
      + " count(distinct vst.mac) uniqueviwers,"
      + " ROUND(sum(vst.view_duration/60000),2) duration"
      + " from"
      + " vuscreen_tracker vst"
      + " LEFT JOIN"
      + " vuscreen_content_package vc ON vst.view_id = vc.content_id"
      + " LEFT JOIN"
      + " vuscreen_registration vr ON vst.reg_id = vr.reg_id"
      + " where vst.partner = '" + req.user.partner_id + "'"
      + " AND vst.sync_date>='" + startDate + "'AND vst.sync_date<='" + endDate + "'"
      // +" AND vehicle_no IN ('DL1VC2892','DL1VC2871' , 'DL1VC2900',"
      // +" 'DL1VC2861',"
      // +" 'DL1VC2888',"
      // +" 'DL1VC2893',"
      // +" 'DL1VC2942',"
      // +" 'DL1VC2887',"
      // +" 'DL1VC2738')"
      + " group by vc.title"
      + " order by count desc "
    // +" limit 15";
  } else {
    query = "select "
      + " vc.title,"
      + " vc.genre,"
      + " count(1) count,"
      + " count(distinct vst.mac) uniqueviwers,"
      + " ROUND(sum(vst.view_duration/60000),2) duration"
      + " from"
      + " vuscreen_tracker vst"
      + " LEFT JOIN"
      + " vuscreen_content_package vc ON vst.view_id = vc.content_id"
      + " LEFT JOIN"
      + " vuscreen_registration vr ON vst.reg_id = vr.reg_id"
      + " where vst.partner = '" + req.user.partner_id + "' AND vr.vehicle_no = '" + req.query.vehicle_no + "'"
      + " AND vst.sync_date>='" + startDate + "'AND vst.sync_date<='" + endDate + "'"
      + " group by vc.title"
      + " order by count desc "
    //limit 15";
  }
  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};



exports.top_10_genre = function (req, res) {
  var startDate, endDate;
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var query = "select "
    + " vc.genre,"
    + " count(1) count,"
    + " count(distinct vst.mac) uniqueviwers"
    + " from"
    + " vuscreen_tracker vst"
    + " JOIN"
    + " vuscreen_content_package vc ON vst.view_id = vc.content_id"
    + " where vst.partner = '" + req.user.partner_id + "' AND"
    + " vst.sync_date>='" + startDate + "'AND vst.sync_date<='" + endDate + "'"
    + " group by vc.genre"
    + " order by count desc limit 15";
  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};


exports.top_clicks_by_hosts = function (req, res) {
  var startDate, endDate;
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var query = "SELECT vr.vehicle_no, vst.menu, COUNT(1) COUNT "
    + " FROM vuscreen_tracker vst LEFT JOIN vuscreen_registration vr ON vst.device_id = vr.device_id"
    + " WHERE vst.trackingDetails = 'click' AND"
    + " vst.sync_date>='" + startDate + "'AND vst.sync_date<='" + endDate + "'"
    + " group by vst.menu,vr.vehicle_no"
    + " order by count desc";
  console.log(query)
  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};

exports.top_clicks = function (req, res) {
  var startDate, endDate;
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var query = "select "
    + " menu,"
    + " count(1) count"
    + " from"
    + " vuscreen_tracker"
    + " where trackingDetails = 'click' AND"
    + " sync_date>='" + startDate + "'AND sync_date<='" + endDate + "'"
    + " group by menu"
    + " order by count desc";
  console.log(query)
  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};

/*  Get list of top buses by time spent.
    @Authentication ----> by session key
    @Authorization ----> Access Controll Logic
    Author : Kedar Gadre
    Date : 29/01/2018
    Modified_by : Kedar Gadre
    Modification Date : 29/01/2018
*/
exports.busSummary = function (req, res) {
  var startDate, endDate;
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }

  var query = "select "
    + " B.vehicle_no bus,ROUND(sum(A.view_duration/60000),2) count,count(1) views, count(distinct A.mac) uniqueviwers"
    + " from"
    + " vuscreen_tracker A Left Join vuscreen_registration B ON A.reg_id = B.reg_id"
    + " where "
    + " A.sync_date>='" + startDate + "' AND A.sync_date<='" + endDate + "' AND B.vehicle_no != ''"
    + " AND A.partner = '" + req.user.partner_id + "' group by B.vehicle_no order by count desc"
  // 
  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};

/*  Get list of top content played on bus.
    @Authentication ----> by session key
    @Authorization ----> Access Controll Logic
    Author : Kedar Gadre
    Date : 29/01/2018
    Modified_by : Kedar Gadre
    Modification Date : 29/01/2018
*/
exports.busSummaryDetails = function (req, res) {
  var startDate, endDate;
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }

  var query = "select "
    + " B.title,"
    + " ROUND(sum(A.view_duration/60000),2) count,"
    + " count(1) views,"
    + " count(distinct A.mac) uniqueviwers"
    + " from"
    + " vuscreen_tracker A"
    + " Left Join"
    + " vuscreen_content_package B ON A.view_id = B.content_id"
    + " Join vuscreen_registration C ON A.reg_id = C.reg_id"
    + " where"
    + " A.sync_date >= '" + startDate + "'"
    + " AND A.sync_date <= '" + endDate + "'"
    + " AND A.partner = '" + req.user.partner_id + "'"
    + " AND C.vehicle_no = '" + req.params.cat + "'"
    + " group by B.title"
    + " order by count desc limit 15"
  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};


/*  Get list of top genre by time spent.
    @Authentication ----> by session key
    @Authorization ----> Access Controll Logic
    Author : Kedar Gadre
    Date : 29/01/2018
    Modified_by : Kedar Gadre
    Modification Date : 29/01/2018
*/
exports.genreSummary = function (req, res) {
  var startDate, endDate;
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }

  var query = "select "
    + " B.genre,ROUND(sum(A.view_duration/60000),2) count,count(1) views, count(distinct A.mac) uniqueviwers"
    + " from"
    + " vuscreen_tracker A Left Join vuscreen_content_package B ON A.view_id = B.content_id"
    + " where "
    + " A.sync_date>='" + startDate + "' AND A.sync_date<='" + endDate + "' AND B.genre != ''"
    + " AND A.partner = '" + req.user.partner_id + "' group by B.genre order by count desc"
  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};

/*  Get list of top content played on genre.
    @Authentication ----> by session key
    @Authorization ----> Access Controll Logic
    Author : Kedar Gadre
    Date : 29/01/2018
    Modified_by : Kedar Gadre
    Modification Date : 29/01/2018
*/
exports.genreSummaryDetails = function (req, res) {
  var startDate, endDate;
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }

  var query = "select "
    + " B.title,"
    + " ROUND(sum(A.view_duration/60000),2) count,"
    + " count(1) views,"
    + " count(distinct A.mac) uniqueviwers"
    + " from"
    + " vuscreen_tracker A"
    + " Left Join"
    + " vuscreen_content_package B ON A.view_id = B.content_id"
    + " where"
    + " A.sync_date >= '" + startDate + "'"
    + " AND A.sync_date <= '" + endDate + "'"
    + " AND A.partner = '" + req.user.partner_id + "'"
    + " AND B.genre = '" + req.params.cat + "'"
    + " group by B.title"
    + " order by count desc limit 15"
  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};

//Cron For shuttl morning
exports.server_session_mor_cron = function () {
  get_cached_data(['server_session_mor_cronStatus'], function (e, doc) {
    if (!e) {
      console.log(doc.server_session_mor_cronStatus)
      if (!doc.server_session_mor_cronStatus || doc.server_session_mor_cronStatus == 'closed') {
        set_key_value('server_session_mor_cronStatus', 'in progress', function (err, data) {
          if (!err) {
            var d = new Date();
            // d.setDate(d.getDate()-1);
            var Today = moment(d).format('YYYY-MM-DD').toString();
            var query = " select "
              + " B.server_started,B.downloaded, D.connected, D.videoPlayed, D.total_duration"
              + " from"
              + " (select "
              + " partner,"
              + " sum(case"
              + " when user = 'server' and event = 'start' then 1"
              + " else 0"
              + " end) server_started,"
              + " sum(case"
              + " when user = 'server' and event = 'download' then 1"
              + " else 0"
              + " end) downloaded"
              + " FROM"
              + " vuscreen_events"
              + " where"
              + " partner = 'bae7qdg69sg9qat28s83l7d203'"
              + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d %H:%i:%s') >= '" + Today + " 04:00:00'"
              + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d %H:%i:%s') <= '" + Today + " 12:00:00'"
              + " AND device_id  IN ('ad9984c046b9badc','fba31520cd0f5bdb','3e1d3aecab0ccbb6','7dcde8cac5e634cb','5046317ef5bfe6d3','a8d3ec420c6bbec2','d47f79d3ffb4c8ef','9b2622bc6a4da8cd','66f9446c0c87fe73')"
              + " GROUP BY partner) B"
              + " LEFT JOIN"
              + " (select "
              + " partner,"
              + " count(distinct mac) connected,"
              + " count(1) videoPlayed,"
              + " ROUND(SUM(view_duration /60000)) total_duration"
              + " FROM"
              + " vuscreen_tracker"
              + " where"
              + " partner = 'bae7qdg69sg9qat28s83l7d203'"
              + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d %H:%i:%s') >= '" + Today + " 04:00:00'"
              + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d %H:%i:%s') <= '" + Today + " 12:00:00'"
              + " AND view_android_id NOT IN ('9a0209e38d5bfedd','cfdd5506e2f58e4f','51462ef452fad10d','d10071453b632204','73d75427d424e798',"
              + " '18f7f09d5efee7e3','e317fde3d03d9389','662ad887625aa4ad','91a0eb36cf2aed0','2d4429fafd426a67','1291937e381c7ca0','4e1032c963a28618',"
              + " '8f52378ef5a2075a','8df0d1591807c4be','b6f80bd7ff557844','3e6e84b6bc66a243','7a81dc2424d0a90b','81e9bb95a7ee0dd7','9c7ca8a26d43834f',"
              + " '9ad5c97386dc17fd','a3f05ca36f4a34d2','61328ca45aebbf60','dabf02140f597ade','22ee29b339b968da','11c28a04727b02d8','b1c3c08db5c8144','9785b80b223ea559','cc9e62aae8c49aab')"
              + " GROUP BY partner) D ON D.partner = B.partner"
            db.get().query(query, function (err, result) {
              if (err) {
                set_key_value('server_session_mor_cronStatus', 'closed', function (err, data) {
                  if (err) {
                    console.error(err);
                  }
                  else {
                    console.log('server_session_mor_cronStatus ' + data)
                  }
                })
              } else {
                var d = new Date();
                d.setDate(d.getDate() - 1);
                var YesterdayHalf = moment(d).format('YYYY-MM-DD').toString();
                var query1 = " select "
                  + " B.server_started,B.downloaded, D.connected, D.videoPlayed, D.total_duration"
                  + " from"
                  + " (select "
                  + " partner,"
                  + " sum(case"
                  + " when user = 'server' and event = 'start' then 1"
                  + " else 0"
                  + " end) server_started,"
                  + " sum(case"
                  + " when user = 'server' and event = 'download' then 1"
                  + " else 0"
                  + " end) downloaded"
                  + " FROM"
                  + " vuscreen_events"
                  + " where"
                  + " partner = 'bae7qdg69sg9qat28s83l7d203'"
                  + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d %H:%i:%s') >= '" + YesterdayHalf + " 04:00:00'"
                  + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d %H:%i:%s') <= '" + YesterdayHalf + " 12:00:00'"
                  + " AND device_id  IN ('ad9984c046b9badc','fba31520cd0f5bdb','3e1d3aecab0ccbb6','7dcde8cac5e634cb','5046317ef5bfe6d3','a8d3ec420c6bbec2','d47f79d3ffb4c8ef','9b2622bc6a4da8cd','66f9446c0c87fe73')"
                  + " GROUP BY partner) B"
                  + " LEFT JOIN"
                  + " (select "
                  + " partner,"
                  + " count(distinct mac) connected,"
                  + " count(1) videoPlayed,"
                  + " ROUND(SUM(view_duration /60000)) total_duration"
                  + " FROM"
                  + " vuscreen_tracker"
                  + " where"
                  + " partner = 'bae7qdg69sg9qat28s83l7d203'"
                  + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d %H:%i:%s') >= '" + YesterdayHalf + " 04:00:00'"
                  + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d %H:%i:%s') <= '" + YesterdayHalf + " 12:00:00'"
                  + " AND view_android_id NOT IN ('9a0209e38d5bfedd','cfdd5506e2f58e4f','51462ef452fad10d','d10071453b632204','73d75427d424e798',"
                  + " '18f7f09d5efee7e3','e317fde3d03d9389','662ad887625aa4ad','91a0eb36cf2aed0','2d4429fafd426a67','1291937e381c7ca0','4e1032c963a28618',"
                  + " '8f52378ef5a2075a','8df0d1591807c4be','b6f80bd7ff557844','3e6e84b6bc66a243','7a81dc2424d0a90b','81e9bb95a7ee0dd7','9c7ca8a26d43834f',"
                  + " '9ad5c97386dc17fd','a3f05ca36f4a34d2','61328ca45aebbf60','dabf02140f597ade','22ee29b339b968da','11c28a04727b02d8','b1c3c08db5c8144','9785b80b223ea559','cc9e62aae8c49aab')"
                  + " GROUP BY partner) D ON D.partner = B.partner"
                db.get().query(query1, function (err1, result1) {
                  if (err1) {
                    console.log(err1)
                    set_key_value('server_session_mor_cronStatus', 'closed', function (err, data) {
                      if (err) {
                        console.error(err);
                      }
                      else {
                        console.log('server_session_mor_cronStatus ' + data)
                      }
                    })
                  } else {
                    var d = new Date();
                    d.setDate(d.getDate() - 1);
                    var Yesterday = moment(d).format('YYYY-MM-DD').toString();
                    var query2 = " select "
                      + " B.server_started,B.downloaded, D.connected, D.videoPlayed, D.total_duration"
                      + " from"
                      + " (select "
                      + " partner,"
                      + " sum(case"
                      + " when user = 'server' and event = 'start' then 1"
                      + " else 0"
                      + " end) server_started,"
                      + " sum(case"
                      + " when user = 'server' and event = 'download' then 1"
                      + " else 0"
                      + " end) downloaded"
                      + " FROM"
                      + " vuscreen_events"
                      + " where"
                      + " partner = 'bae7qdg69sg9qat28s83l7d203'"
                      + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d') >= '" + Yesterday + "'"
                      + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d') <= '" + Yesterday + "'"
                      + " AND device_id  IN ('ad9984c046b9badc','fba31520cd0f5bdb','3e1d3aecab0ccbb6','7dcde8cac5e634cb','5046317ef5bfe6d3','a8d3ec420c6bbec2','d47f79d3ffb4c8ef','9b2622bc6a4da8cd','66f9446c0c87fe73')"
                      + " GROUP BY partner) B"
                      + " LEFT JOIN"
                      + " (select "
                      + " partner,"
                      + " count(distinct mac) connected,"
                      + " count(1) videoPlayed,"
                      + " ROUND(SUM(view_duration /60000)) total_duration"
                      + " FROM"
                      + " vuscreen_tracker"
                      + " where"
                      + " partner = 'bae7qdg69sg9qat28s83l7d203'"
                      + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d') >= '" + Yesterday + "'"
                      + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d') <= '" + Yesterday + "'"
                      + " AND view_android_id NOT IN ('9a0209e38d5bfedd','cfdd5506e2f58e4f','51462ef452fad10d','d10071453b632204','73d75427d424e798',"
                      + " '18f7f09d5efee7e3','e317fde3d03d9389','662ad887625aa4ad','91a0eb36cf2aed0','2d4429fafd426a67','1291937e381c7ca0','4e1032c963a28618',"
                      + " '8f52378ef5a2075a','8df0d1591807c4be','b6f80bd7ff557844','3e6e84b6bc66a243','7a81dc2424d0a90b','81e9bb95a7ee0dd7','9c7ca8a26d43834f',"
                      + " '9ad5c97386dc17fd','a3f05ca36f4a34d2','61328ca45aebbf60','dabf02140f597ade','22ee29b339b968da','11c28a04727b02d8','b1c3c08db5c8144','9785b80b223ea559','cc9e62aae8c49aab')"
                      + " GROUP BY partner) D ON D.partner = B.partner"
                    db.get().query(query2, function (err2, result2) {
                      if (err2) {
                        set_key_value('server_session_mor_cronStatus', 'closed', function (err, data) {
                          if (err) {
                            console.error(err);
                          }
                          else {
                            console.log('server_session_mor_cronStatus ' + data)
                          }
                        })
                      } else {
                        var sms = ""
                        for (var i = 0; i < result.length; i++) {
                          if (result[i].server_started == null) {
                            result[i].server_started = 0
                          }
                          if (result[i].connected == null) {
                            result[i].connected = 0
                          }
                          if (result[i].videoPlayed == null) {
                            result[i].videoPlayed = 0
                          }
                          if (result[i].total_duration == null) {
                            result[i].total_duration = 0
                          }
                          if (result[i].downloaded == null) {
                            result[i].downloaded = 0
                          }
                          sms += "Date: " + Today + " M\n"
                          sms += "Srvr/Clnt: " + result[i].server_started + "/" + result[i].connected + "\n"
                          sms += "Vid: " + result[i].videoPlayed + "\n"
                          sms += "Dur: " + result[i].total_duration + "\n"
                          // sms += "DtaSync: "+result[i].downloaded+"\n"
                        }
                        for (var j = 0; j < result1.length; j++) {
                          if (result1[j].connected == null) {
                            result1[j].connected = 0
                          }
                          if (result1[j].videoPlayed == null) {
                            result1[j].videoPlayed = 0
                          }
                          if (result1[j].total_duration == null) {
                            result1[j].total_duration = 0
                          }
                          sms += "Ytdy M clnt/vid/dur: " + result1[j].connected + "/" + result1[j].videoPlayed + "/" + result1[j].total_duration + "\n"
                        }
                        for (var k = 0; k < result2.length; k++) {
                          if (result2[k].connected == null) {
                            result2[k].connected = 0
                          }
                          if (result2[k].videoPlayed == null) {
                            result2[k].videoPlayed = 0
                          }
                          if (result2[k].total_duration == null) {
                            result2[k].total_duration = 0
                          }
                          sms += "Ytdy C clnt/vid/dur: " + result2[k].connected + "/" + result2[k].videoPlayed + "/" + result2[k].total_duration
                        }
                        // var Numbers = [7042854343,9810772396,9717860113,9582340204,9873412238,9650379456,9811852125,9999878459]
                        var Numbers = [7042854343]
                        for (var i = 0; i < Numbers.length; i++) {
                          var message = 'http://www.myvaluefirst.com/smpp/sendsms?username=Mobiservehttp1&password=mobi1234&to=' + Numbers[i] + '&from=VUINFO&text=Dear Recipients,\n' + sms
                          request(message, function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                              console.log("Alert has been " + body) // Show the HTML for the Google homepage. 
                            }
                          })
                        }
                      }
                    })
                  }
                })
              }
            })
          }
        })
      }
    }
  })
}

//Cron For shuttl evening
exports.server_session_eve_cron = function () {
  get_cached_data(['server_session_eve_cronStatus'], function (e, doc) {
    if (!e) {
      console.log(doc.server_session_eve_cronStatus)
      if (!doc.server_session_eve_cronStatus || doc.server_session_eve_cronStatus == 'closed') {
        set_key_value('server_session_eve_cronStatus', 'in progress', function (err, data) {
          if (!err) {
            var d = new Date();
            // d.setDate(d.getDate()-1);
            var Today = moment(d).format('YYYY-MM-DD').toString();
            var query = " select "
              + " B.server_started,B.downloaded, D.connected, D.videoPlayed, D.total_duration"
              + " from"
              + " (select "
              + " partner,"
              + " sum(case"
              + " when user = 'server' and event = 'start' then 1"
              + " else 0"
              + " end) server_started,"
              + " sum(case"
              + " when user = 'server' and event = 'download' then 1"
              + " else 0"
              + " end) downloaded"
              + " FROM"
              + " vuscreen_events"
              + " where"
              + " partner = 'bae7qdg69sg9qat28s83l7d203'"
              + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d %H:%i:%s') >= '" + Today + " 15:00:00'"
              + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d %H:%i:%s') <= '" + Today + " 23:55:00'"
              + " AND device_id  IN ('ad9984c046b9badc','fba31520cd0f5bdb','3e1d3aecab0ccbb6','7dcde8cac5e634cb','5046317ef5bfe6d3','a8d3ec420c6bbec2','d47f79d3ffb4c8ef','9b2622bc6a4da8cd','66f9446c0c87fe73')"
              + " GROUP BY partner) B"
              + " LEFT JOIN"
              + " (select "
              + " partner,"
              + " count(distinct mac) connected,"
              + " count(1) videoPlayed,"
              + " ROUND(SUM(view_duration /60000)) total_duration"
              + " FROM"
              + " vuscreen_tracker"
              + " where"
              + " partner = 'bae7qdg69sg9qat28s83l7d203'"
              + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d %H:%i:%s') >= '" + Today + " 15:00:00'"
              + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d %H:%i:%s') <= '" + Today + " 23:55:00'"
              + " AND view_android_id NOT IN ('9a0209e38d5bfedd','cfdd5506e2f58e4f','51462ef452fad10d','d10071453b632204','73d75427d424e798',"
              + " '18f7f09d5efee7e3','e317fde3d03d9389','662ad887625aa4ad','91a0eb36cf2aed0','2d4429fafd426a67','1291937e381c7ca0','4e1032c963a28618',"
              + " '8f52378ef5a2075a','8df0d1591807c4be','b6f80bd7ff557844','3e6e84b6bc66a243','7a81dc2424d0a90b','81e9bb95a7ee0dd7','9c7ca8a26d43834f',"
              + " '9ad5c97386dc17fd','a3f05ca36f4a34d2','61328ca45aebbf60','dabf02140f597ade','22ee29b339b968da','11c28a04727b02d8','b1c3c08db5c8144','9785b80b223ea559','cc9e62aae8c49aab')"
              + " GROUP BY partner) D ON D.partner = B.partner"
            db.get().query(query, function (err, result) {
              if (err) {
                set_key_value('server_session_eve_cronStatus', 'closed', function (err, data) {
                  if (err) {
                    console.error(err);
                  }
                  else {
                    console.log('server_session_eve_cronStatus ' + data)
                  }
                })
              } else {
                var d = new Date();
                d.setDate(d.getDate() - 1);
                var YesterdayHalf = moment(d).format('YYYY-MM-DD').toString();
                var query1 = " select "
                  + " B.server_started,B.downloaded, D.connected, D.videoPlayed, D.total_duration"
                  + " from"
                  + " (select "
                  + " partner,"
                  + " sum(case"
                  + " when user = 'server' and event = 'start' then 1"
                  + " else 0"
                  + " end) server_started,"
                  + " sum(case"
                  + " when user = 'server' and event = 'download' then 1"
                  + " else 0"
                  + " end) downloaded"
                  + " FROM"
                  + " vuscreen_events"
                  + " where"
                  + " partner = 'bae7qdg69sg9qat28s83l7d203'"
                  + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d %H:%i:%s') >= '" + YesterdayHalf + " 15:00:00'"
                  + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d %H:%i:%s') <= '" + YesterdayHalf + " 23:55:00'"
                  + " AND device_id  IN ('ad9984c046b9badc','fba31520cd0f5bdb','3e1d3aecab0ccbb6','7dcde8cac5e634cb','5046317ef5bfe6d3','a8d3ec420c6bbec2','d47f79d3ffb4c8ef','9b2622bc6a4da8cd','66f9446c0c87fe73')"
                  + " GROUP BY partner) B"
                  + " LEFT JOIN"
                  + " (select "
                  + " partner,"
                  + " count(distinct mac) connected,"
                  + " count(1) videoPlayed,"
                  + " ROUND(SUM(view_duration /60000)) total_duration"
                  + " FROM"
                  + " vuscreen_tracker"
                  + " where"
                  + " partner = 'bae7qdg69sg9qat28s83l7d203'"
                  + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d %H:%i:%s') >= '" + YesterdayHalf + " 15:00:00'"
                  + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d %H:%i:%s') <= '" + YesterdayHalf + " 23:55:00'"
                  + " AND view_android_id NOT IN ('9a0209e38d5bfedd','cfdd5506e2f58e4f','51462ef452fad10d','d10071453b632204','73d75427d424e798',"
                  + " '18f7f09d5efee7e3','e317fde3d03d9389','662ad887625aa4ad','91a0eb36cf2aed0','2d4429fafd426a67','1291937e381c7ca0','4e1032c963a28618',"
                  + " '8f52378ef5a2075a','8df0d1591807c4be','b6f80bd7ff557844','3e6e84b6bc66a243','7a81dc2424d0a90b','81e9bb95a7ee0dd7','9c7ca8a26d43834f',"
                  + " '9ad5c97386dc17fd','a3f05ca36f4a34d2','61328ca45aebbf60','dabf02140f597ade','22ee29b339b968da','11c28a04727b02d8','b1c3c08db5c8144','9785b80b223ea559','cc9e62aae8c49aab')"
                  + " GROUP BY partner) D ON D.partner = B.partner"
                db.get().query(query1, function (err1, result1) {
                  if (err1) {
                    console.log(err1)
                    set_key_value('server_session_eve_cronStatus', 'closed', function (err, data) {
                      if (err) {
                        console.error(err);
                      }
                      else {
                        console.log('server_session_eve_cronStatus ' + data)
                      }
                    })
                  } else {
                    var d = new Date();
                    d.setDate(d.getDate() - 1);
                    var Yesterday = moment(d).format('YYYY-MM-DD').toString();
                    var query2 = " select "
                      + " B.server_started,B.downloaded, D.connected, D.videoPlayed, D.total_duration"
                      + " from"
                      + " (select "
                      + " partner,"
                      + " sum(case"
                      + " when user = 'server' and event = 'start' then 1"
                      + " else 0"
                      + " end) server_started,"
                      + " sum(case"
                      + " when user = 'server' and event = 'download' then 1"
                      + " else 0"
                      + " end) downloaded"
                      + " FROM"
                      + " vuscreen_events"
                      + " where"
                      + " partner = 'bae7qdg69sg9qat28s83l7d203'"
                      + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d') >= '" + Yesterday + "'"
                      + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d') <= '" + Yesterday + "'"
                      + " AND device_id  IN ('ad9984c046b9badc','fba31520cd0f5bdb','3e1d3aecab0ccbb6','7dcde8cac5e634cb','5046317ef5bfe6d3','a8d3ec420c6bbec2','d47f79d3ffb4c8ef','9b2622bc6a4da8cd','66f9446c0c87fe73')"
                      + " GROUP BY partner) B"
                      + " LEFT JOIN"
                      + " (select "
                      + " partner,"
                      + " count(distinct mac) connected,"
                      + " count(1) videoPlayed,"
                      + " ROUND(SUM(view_duration /60000)) total_duration"
                      + " FROM"
                      + " vuscreen_tracker"
                      + " where"
                      + " partner = 'bae7qdg69sg9qat28s83l7d203'"
                      + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d') >= '" + Yesterday + "'"
                      + " AND DATE_FORMAT(sync_datetime, '%Y-%m-%d') <= '" + Yesterday + "'"
                      + " AND view_android_id NOT IN ('9a0209e38d5bfedd','cfdd5506e2f58e4f','51462ef452fad10d','d10071453b632204','73d75427d424e798',"
                      + " '18f7f09d5efee7e3','e317fde3d03d9389','662ad887625aa4ad','91a0eb36cf2aed0','2d4429fafd426a67','1291937e381c7ca0','4e1032c963a28618',"
                      + " '8f52378ef5a2075a','8df0d1591807c4be','b6f80bd7ff557844','3e6e84b6bc66a243','7a81dc2424d0a90b','81e9bb95a7ee0dd7','9c7ca8a26d43834f',"
                      + " '9ad5c97386dc17fd','a3f05ca36f4a34d2','61328ca45aebbf60','dabf02140f597ade','22ee29b339b968da','11c28a04727b02d8','b1c3c08db5c8144','9785b80b223ea559','cc9e62aae8c49aab')"
                      + " GROUP BY partner) D ON D.partner = B.partner"
                    db.get().query(query2, function (err2, result2) {
                      if (err2) {
                        set_key_value('server_session_eve_cronStatus', 'closed', function (err, data) {
                          if (err) {
                            console.error(err);
                          }
                          else {
                            console.log('server_session_eve_cronStatus ' + data)
                          }
                        })
                      } else {
                        var sms = ""
                        for (var i = 0; i < result.length; i++) {
                          if (result[i].server_started == null) {
                            result[i].server_started = 0
                          }
                          if (result[i].connected == null) {
                            result[i].connected = 0
                          }
                          if (result[i].videoPlayed == null) {
                            result[i].videoPlayed = 0
                          }
                          if (result[i].total_duration == null) {
                            result[i].total_duration = 0
                          }
                          if (result[i].downloaded == null) {
                            result[i].downloaded = 0
                          }
                          sms += "Date: " + Today + " E\n"
                          sms += "Srvr/Clnt: " + result[i].server_started + "/" + result[i].connected + "\n"
                          sms += "Vid: " + result[i].videoPlayed + "\n"
                          sms += "Dur: " + result[i].total_duration + "\n"
                          // sms += "DtaSync: "+result[i].downloaded+"\n"
                        }
                        for (var j = 0; j < result1.length; j++) {
                          if (result1[j].connected == null) {
                            result1[j].connected = 0
                          }
                          if (result1[j].videoPlayed == null) {
                            result1[j].videoPlayed = 0
                          }
                          if (result1[j].total_duration == null) {
                            result1[j].total_duration = 0
                          }
                          sms += "Ytdy E clnt/vid/dur: " + result1[j].connected + "/" + result1[j].videoPlayed + "/" + result1[j].total_duration + "\n"
                        }
                        for (var k = 0; k < result2.length; k++) {
                          if (result2[k].connected == null) {
                            result2[k].connected = 0
                          }
                          if (result2[k].videoPlayed == null) {
                            result2[k].videoPlayed = 0
                          }
                          if (result2[k].total_duration == null) {
                            result2[k].total_duration = 0
                          }
                          sms += "Ytdy C clnt/vid/dur: " + result2[k].connected + "/" + result2[k].videoPlayed + "/" + result2[k].total_duration
                        }
                        var Numbers = [7042854343]
                        // var Numbers = [7042854343,9810772396,9717860113,9582340204,9873412238,9650379456,9811852125,9999878459]
                        for (var i = 0; i < Numbers.length; i++) {
                          var message = 'http://www.myvaluefirst.com/smpp/sendsms?username=Mobiservehttp1&password=mobi1234&to=' + Numbers[i] + '&from=VUINFO&text=Dear Recipients,\n' + sms
                          request(message, function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                              console.log("Alert has been " + body) // Show the HTML for the Google homepage. 
                            }
                          })
                        }
                      }
                    })
                  }
                })
              }
            })
          }
        })
      }
    }
  })
}


//Cron For zimindara
exports.zimindara_cron = function () {
  get_cached_data(['zimindara_cronStatus'], function (e, doc) {
    if (!e) {
      console.log(doc.zimindara_cronStatus)
      if (!doc.zimindara_cronStatus || doc.zimindara_cronStatus == 'closed') {
        set_key_value('zimindara_cronStatus', 'in progress', function (err, data) {
          if (!err) {
            var d = new Date();
            // d.setDate(d.getDate()-1);
            var Today = moment(d).format('YYYY-MM-DD').toString();
            var query = " select "
              + " B.server_started,D.connected, D.videoPlayed, D.total_duration"
              + " from"
              + " (select "
              + " partner,"
              + " count(distinct reg_id) server_started"
              + " FROM"
              + " vuscreen_events"
              + " where"
              + " partner = 'jvvqiose6ivd2ihmcsncf4od3b'"
              + " AND sync_date = '" + Today + "'"
              + " AND user = 'client' AND event = 'connected'"
              + " GROUP BY partner) B"
              + " LEFT JOIN"
              + " (select "
              + " partner,"
              + " count(distinct mac) connected,"
              + " count(1) videoPlayed,"
              + " ROUND(SUM(view_duration /60000)) total_duration"
              + " FROM"
              + " vuscreen_tracker"
              + " where"
              + " partner = 'jvvqiose6ivd2ihmcsncf4od3b'"
              + " AND sync_date = '" + Today + "'"
              + " GROUP BY partner) D ON D.partner = B.partner"
            db.get().query(query, function (err, result) {
              if (err) {
                set_key_value('zimindara_cronStatus', 'closed', function (err, data) {
                  if (err) {
                    console.error(err);
                  }
                  else {
                    console.log('zimindara_cronStatus ' + data)
                  }
                })
              } else {
                var d = new Date();
                d.setDate(d.getDate() - 1);
                var Yesterday = moment(d).format('YYYY-MM-DD').toString();
                var query1 = " select "
                  + " B.server_started, D.connected, D.videoPlayed, D.total_duration"
                  + " from"
                  + " (select "
                  + " partner,"
                  + " count(distinct reg_id) server_started"
                  + " FROM"
                  + " vuscreen_events"
                  + " where"
                  + " partner = 'jvvqiose6ivd2ihmcsncf4od3b'"
                  + " AND sync_date = '" + Yesterday + "'"
                  + " AND user = 'client' AND event = 'connected'"
                  + " GROUP BY partner) B"
                  + " LEFT JOIN"
                  + " (select "
                  + " partner,"
                  + " count(distinct mac) connected,"
                  + " count(1) videoPlayed,"
                  + " ROUND(SUM(view_duration /60000)) total_duration"
                  + " FROM"
                  + " vuscreen_tracker"
                  + " where"
                  + " partner = 'jvvqiose6ivd2ihmcsncf4od3b'"
                  + " AND sync_date= '" + Yesterday + "'"
                  + " GROUP BY partner) D ON D.partner = B.partner"
                db.get().query(query1, function (err1, result1) {
                  if (err1) {
                    console.log(err1)
                    set_key_value('zimindara_cronStatus', 'closed', function (err, data) {
                      if (err) {
                        console.error(err);
                      }
                      else {
                        console.log('zimindara_cronStatus ' + data)
                      }
                    })
                  } else {
                    var sms = ""
                    if (result.length > 0) {
                      for (var i = 0; i < result.length; i++) {
                        if (result[i].server_started == null) {
                          result[i].server_started = 0
                        }
                        if (result[i].connected == null) {
                          result[i].connected = 0
                        }
                        if (result[i].videoPlayed == null) {
                          result[i].videoPlayed = 0
                        }
                        if (result[i].total_duration == null) {
                          result[i].total_duration = 0
                        }
                        sms += "Zimindara - Date: " + Today + "\n"
                        sms += "Srvr/Clnt: " + result[i].server_started + "/" + result[i].connected + "\n"
                        sms += "Vid: " + result[i].videoPlayed + "\n"
                        sms += "Dur(M): " + result[i].total_duration + "\n"
                        // sms += "DtaSync: "+result[i].downloaded+"\n"
                      }
                    }
                    if (result1.length > 0) {
                      for (var j = 0; j < result1.length; j++) {
                        if (result1[j].connected == null) {
                          result1[j].connected = 0
                        }
                        if (result1[j].videoPlayed == null) {
                          result1[j].videoPlayed = 0
                        }
                        if (result1[j].total_duration == null) {
                          result1[j].total_duration = 0
                        }
                        sms += "Ytdy srvr/clnt/vid/dur: " + result1[j].server_started + "/" + result1[j].connected + "/" + result1[j].videoPlayed + "/" + result1[j].total_duration + "\n"
                      }
                    }
                    if (sms) {
                      // var Numbers =       owner ,      driver              sahil,     deepak   varun goyal   manoj gupta    gunjan    subodh   kedar
                      var Numbers = [req.body.owner_no, req.body.driver_no, 9582340204, 9650379456, 9818436189, 9810772396, 9899116084, 8826614109, 7042854343]
                      // var Numbers = [7042854343]
                      for (var i = 0; i < Numbers.length; i++) {
                        var message = 'http://www.myvaluefirst.com/smpp/sendsms?username=Mobiservehttp1&password=mobi1234&to=' + Numbers[i] + '&from=VUINFO&text=Dear Recipients,\n' + sms
                        request(message, function (error, response, body) {
                          if (!error && response.statusCode == 200) {
                            console.log("Alert has been " + body) // Show the HTML for the Google homepage. 
                          }
                        })
                      }
                    } else {
                      console.log("No sms Found.")
                      set_key_value('zimindara_cronStatus', 'closed', function (err, data) {
                        if (err) {
                          console.error(err);
                        }
                        else {
                          console.log('zimindara_cronStatus ' + data)
                        }
                      })
                    }
                  }
                })
              }
            })
          }
        })
      }
    }
  })
}


//Cron For indocanadian
exports.indocanadian_cron = function () {
  get_cached_data(['indocanadian_cronStatus'], function (e, doc) {
    if (!e) {
      console.log(doc.indocanadian_cronStatus)
      if (!doc.indocanadian_cronStatus || doc.indocanadian_cronStatus == 'closed') {
        set_key_value('indocanadian_cronStatus', 'in progress', function (err, data) {
          if (!err) {
            var d = new Date();
            // d.setDate(d.getDate()-1);
            var Today = moment(d).format('YYYY-MM-DD').toString();
            var query = " select "
              + " B.server_started,D.connected, D.videoPlayed, D.total_duration"
              + " from"
              + " (select "
              + " partner,"
              + " count(distinct reg_id) server_started"
              + " FROM"
              + " vuscreen_events"
              + " where"
              + " partner = 'l83gpm7eh9o4lsmqj1s6cvbvnd'"
              + " AND sync_date = '" + Today + "'"
              + " AND user = 'client' AND event = 'connected'"
              + " GROUP BY partner) B"
              + " LEFT JOIN"
              + " (select "
              + " partner,"
              + " count(distinct mac) connected,"
              + " count(1) videoPlayed,"
              + " ROUND(SUM(view_duration /60000)) total_duration"
              + " FROM"
              + " vuscreen_tracker"
              + " where"
              + " partner = 'l83gpm7eh9o4lsmqj1s6cvbvnd'"
              + " AND sync_date = '" + Today + "'"
              + " GROUP BY partner) D ON D.partner = B.partner"
            db.get().query(query, function (err, result) {
              if (err) {
                set_key_value('indocanadian_cronStatus', 'closed', function (err, data) {
                  if (err) {
                    console.error(err);
                  }
                  else {
                    console.log('indocanadian_cronStatus ' + data)
                  }
                })
              } else {
                var d = new Date();
                d.setDate(d.getDate() - 1);
                var Yesterday = moment(d).format('YYYY-MM-DD').toString();
                var query1 = " select "
                  + " B.server_started, D.connected, D.videoPlayed, D.total_duration"
                  + " from"
                  + " (select "
                  + " partner,"
                  + " count(distinct reg_id) server_started"
                  + " FROM"
                  + " vuscreen_events"
                  + " where"
                  + " partner = 'l83gpm7eh9o4lsmqj1s6cvbvnd'"
                  + " AND sync_date = '" + Yesterday + "'"
                  + " AND user = 'client' AND event = 'connected'"
                  + " GROUP BY partner) B"
                  + " LEFT JOIN"
                  + " (select "
                  + " partner,"
                  + " count(distinct mac) connected,"
                  + " count(1) videoPlayed,"
                  + " ROUND(SUM(view_duration /60000)) total_duration"
                  + " FROM"
                  + " vuscreen_tracker"
                  + " where"
                  + " partner = 'l83gpm7eh9o4lsmqj1s6cvbvnd'"
                  + " AND sync_date= '" + Yesterday + "'"
                  + " GROUP BY partner) D ON D.partner = B.partner"
                db.get().query(query1, function (err1, result1) {
                  if (err1) {
                    console.log(err1)
                    set_key_value('indocanadian_cronStatus', 'closed', function (err, data) {
                      if (err) {
                        console.error(err);
                      }
                      else {
                        console.log('indocanadian_cronStatus ' + data)
                      }
                    })
                  } else {
                    var sms = ""
                    if (result.length > 0) {
                      for (var i = 0; i < result.length; i++) {
                        if (result[i].server_started == null) {
                          result[i].server_started = 0
                        }
                        if (result[i].connected == null) {
                          result[i].connected = 0
                        }
                        if (result[i].videoPlayed == null) {
                          result[i].videoPlayed = 0
                        }
                        if (result[i].total_duration == null) {
                          result[i].total_duration = 0
                        }
                        sms += "Indo Canadian - Date: " + Today + "\n"
                        sms += "Srvr/Clnt: " + result[i].server_started + "/" + result[i].connected + "\n"
                        sms += "Vid: " + result[i].videoPlayed + "\n"
                        sms += "Dur(M): " + result[i].total_duration + "\n"
                        // sms += "DtaSync: "+result[i].downloaded+"\n"
                      }
                    }
                    if (result1.length > 0) {
                      for (var j = 0; j < result1.length; j++) {
                        if (result1[j].connected == null) {
                          result1[j].connected = 0
                        }
                        if (result1[j].videoPlayed == null) {
                          result1[j].videoPlayed = 0
                        }
                        if (result1[j].total_duration == null) {
                          result1[j].total_duration = 0
                        }
                        sms += "Ytdy srvr/clnt/vid/dur: " + result1[j].server_started + "/" + result1[j].connected + "/" + result1[j].videoPlayed + "/" + result1[j].total_duration + "\n"
                      }
                    }
                    if (sms) {
                      // var Numbers =       owner ,      driver              sahil,     deepak   varun goyal   manoj gupta    gunjan    subodh   kedar
                      var Numbers = [req.body.owner_no, req.body.driver_no, 9582340204, 9650379456, 9818436189, 9810772396, 9899116084, 8826614109, 7042854343]
                      // var Numbers = [7042854343]
                      for (var i = 0; i < Numbers.length; i++) {
                        var message = 'http://www.myvaluefirst.com/smpp/sendsms?username=Mobiservehttp1&password=mobi1234&to=' + Numbers[i] + '&from=VUINFO&text=Dear Recipients,\n' + sms
                        request(message, function (error, response, body) {
                          if (!error && response.statusCode == 200) {
                            console.log("Alert has been " + body) // Show the HTML for the Google homepage. 
                          }
                        })
                      }
                    } else {
                      console.log("No sms Found.")
                      set_key_value('indocanadian_cronStatus', 'closed', function (err, data) {
                        if (err) {
                          console.error(err);
                        }
                        else {
                          console.log('indocanadian_cronStatus ' + data)
                        }
                      })
                    }
                  }
                })
              }
            })
          }
        })
      }
    }
  })
}



//Cron For bus wise usage  csv
exports.buswisecsv_cron = function () {
  get_cached_data(['buswisecsv_cronStatus'], function (e, doc) {
    if (!e) {
      console.log(doc.buswisecsv_cronStatus)
      if (!doc.buswisecsv_cronStatus || doc.buswisecsv_cronStatus == 'closed') {
        set_key_value('buswisecsv_cronStatus', 'in progress', function (err, data) {
          if (!err) {
            var d = new Date();
            d.setDate(d.getDate() - 1);
            var Yesterday = moment(d).format('YYYY-MM-DD').toString();
            var query = " SELECT"
              + "   vr.reg_id,"
              + "   vr.vehicle_no,"
              + "   vr.source,"
              + "   vr.destination,"
              + "   COUNT(1) total_played,"
              + "   COUNT(DISTINCT vst.mac) total_uesr,"
              + "   ROUND(SUM(vst.view_duration / 60000), 2) total_duration,"
              + "   ROUND(SUM(vst.view_duration / 60000)/COUNT(DISTINCT vst.mac), 2) avg_content_dur,"
              + "   ROUND(COUNT(1)/COUNT(DISTINCT vst.mac)) avg_content_played,"
              + "   vr.owner_name,"
              + "   vr.driver_name,"
              + "   vr.driver_no,"
              + "   vr.helper_name,"
              + "   vr.helper_no,"
              + " vr.location installed_location"
              + " FROM"
              + " vuscreen_tracker vst"
              + " JOIN"
              + " vuscreen_registration vr ON vst.reg_id = vr.reg_id"
              + " WHERE"
              + " vst.sync_date = '" + Yesterday + "' group by vst.reg_id"
            db.get().query(query, function (err, result) {
              if (err) {
                set_key_value('buswisecsv_cronStatus', 'closed', function (err, data) {
                  if (err) {
                    console.error(err);
                  }
                  else {
                    console.log('buswisecsv_cronStatus ' + data)
                  }
                })
              } else {
                var d = new Date();
                d.setDate(d.getDate() - 2);
                var DBYesterday = moment(d).format('YYYY-MM-DD').toString();
                var query1 = " SELECT"
                  + " vr.reg_id,"
                  + " vr.vehicle_no,"
                  + "   vr.source,"
                  + "   vr.destination,"
                  + "   COUNT(1) total_played,"
                  + "   COUNT(DISTINCT vst.mac) total_uesr,"
                  + "   ROUND(SUM(vst.view_duration / 60000), 2) total_duration,"
                  + "   ROUND(SUM(vst.view_duration / 60000)/COUNT(DISTINCT vst.mac), 2) avg_content_dur,"
                  + "   ROUND(COUNT(1)/COUNT(DISTINCT vst.mac)) avg_content_played,"
                  + "   vr.owner_name,"
                  + "   vr.driver_name,"
                  + "   vr.driver_no,"
                  + "   vr.helper_name,"
                  + "   vr.helper_no,"
                  + " vr.location installed_location"
                  + " FROM"
                  + " vuscreen_tracker vst"
                  + " JOIN"
                  + " vuscreen_registration vr ON vst.reg_id = vr.reg_id"
                  + " WHERE"
                  + " vst.sync_date = '" + DBYesterday + "' group by vst.reg_id"
                db.get().query(query1, function (err1, result1) {
                  if (err1) {
                    console.log(err1)
                    set_key_value('buswisecsv_cronStatus', 'closed', function (err, data) {
                      if (err) {
                        console.error(err);
                      }
                      else {
                        console.log('buswisecsv_cronStatus ' + data)
                      }
                    })
                  } else {
                    var fields = ['reg_id', 'vehicle_no', 'source', 'destination', 'total_played', 'total_uesr', 'total_duration', 'avg_content_dur', 'avg_content_played', 'owner_name', 'driver_name', 'helper_name', 'installed_location'];
                    var csvyesterday = json2csv({ data: result, fields: fields });
                    // var fields1 = ['title', 'count'];
                    var csvdbyesterday = json2csv({ data: result1, fields: fields });
                    var array = []
                    array.push({ key: 'yesterday', value: csvyesterday }, { key: 'dbyesterday', value: csvdbyesterday })
                    for (var i = 0; i < array.length; i++) {
                      // fs.writeFile('/home/kedar/VuLiv-Analytics-NewDB-2017-10-10/server/api/views/banner/'+array[i].key+'.csv' , array[i].value, function(err) {
                      fs.writeFile(config.root + '/server/api/vuscreen/' + array[i].key + '.csv', array[i].value, function (err) {
                        if (err) {
                          set_key_value('buswisecsv_cronStatus', 'closed', function (err, data) {
                            if (err) {
                              console.error(err);
                            }
                            else {
                              console.log('buswisecsv_cronStatus ' + data)
                            }
                          })
                        } else {
                          console.log('file saved');
                        }
                      });
                    }
                    var email = 'manoj.gupta@vuliv.com,gunjan.jain@vuliv.com,kedar.gadre@vuliv.com,varun.goyal@vuliv.com,deepak.kumar@vuliv.com,sahil.sachdeva@vuliv.com,subodh.sharma@vuliv.com,barun.kundu@vuliv.com,indu.sharma@vuliv.com'
                    // var email = 'kedar.gadre@vuliv.com'
                    EM.dispatchEmail(email, 'Bus Report - ' + DBYesterday + '-' + Yesterday, function (e) {
                      set_key_value('buswisecsv_cronStatus', 'closed', function (err, data) {
                        if (err) {
                          console.error(err);
                        }
                        else {
                          console.log('buswisecsv_cronStatus ' + data)
                          console.log(e)
                        }
                      })
                    })
                  }
                })
              }
            })
          }
        })
      }
    }
  })
}


function set_key_value(keys, value, cb) {
  // body...
  cachedData.set(keys, value, function (err, success) {
    cb(err, value);
  });
}
function get_cached_data(keys, cb) {
  // body...
  cachedData.mget(keys, function (err, value) {
    cb(err, value);
  });
}



// leaderboard data
exports.leaderboard = function (req, res) {
  var startDate, endDate;
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var query = "SELECT "
    + " rank,"
    + " vehicle_no,"
    + " SUM(points) AS points,"
    + " SUM(view_id) AS content_watched,"
    + " ROUND(SUM((view_duration / 60000))) AS view_duration,"
    + " COUNT(device_id) AS connections,"
    + " COUNT(IF(unique_device = 1, 1, NULL)) AS unique_connections"
    + " FROM"
    + " vuscreen_driver_points"
    + " WHERE"
    + " date >= '" + startDate + "'"
    + " AND date <= '" + endDate + "'"
    + " AND uploaded_by = '" + req.user.partner_id + "'"
    // +" AND package = 'com.vuscreen.shuttl.driver'"
    // +" AND vehicle_no IN ('DL1VC2892','DL1VC2871' , 'DL1VC2900',"
    // +" 'DL1VC2861',"
    // +" 'DL1VC2888',"
    // +" 'DL1VC2893',"
    // +" 'DL1VC2942',"
    // +" 'DL1VC2887',"
    // +" 'DL1VC2738')"
    + " GROUP BY vehicle_no"
    + " ORDER BY rank;";
  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};

// get registration details
exports.get_partner_detaills = function (req, res) {
  var query = "select * "
    + " from"
    + " vuscreen_registration"
    + " where "
    + " reg_id='" + req.params.id + "'"
  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
}

// save registration details after edit
exports.edit_registration = function (req, res) {
  var query = "Update "
    + " vuscreen_registration SET "
    + "    vehicle_no = '" + req.body.vehicle_no + "',"
    + "    source = '" + req.body.source + "',"
    + "    destination = '" + req.body.destination + "',"
    + "    owner_email = '" + req.body.owner_email + "',"
    + "    owner_name = '" + req.body.owner_name + "',"
    + "    owner_no = '" + req.body.owner_no + "',"
    + "    driver_name = '" + req.body.driver_name + "',"
    + "    driver_no = '" + req.body.driver_no + "',"
    + "    helper_name = '" + req.body.helper_name + "',"
    + "    helper_no = '" + req.body.helper_no + "',"
    + "    location = '" + req.body.location + "'"
    + " where "
    + " reg_id='" + req.body.reg_id + "'"
  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    else {
      var sms = 'Mr ' + req.body.owner_name + ',\n'
        + req.user.fname + ',\n'
        + 'VuScreen System is INSTALLED in ' + req.body.vehicle_no + ' on '
        + moment(new Date()).format("YYYY-MM-DD HH:mm:ss") + ' at ' + req.body.location + ' and is VERIFIED by '
        + req.body.driver_name + ' with mobile no ' + req.body.driver_no + '.'
      // var number =       owner ,      driver              sahil,     deepak   varun goyal   manoj gupta    gunjan    subodh   kedar
      var number = [req.body.owner_no, req.body.driver_no, 9582340204, 9650379456, 9818436189, 9810772396, 9899116084, 8826614109, 7042854343]
      // var number = [req.body.owner_no]
      for (var i = 0; i < number.length; i++) {
        var message = 'http://www.myvaluefirst.com/smpp/sendsms?username=Mobiservehttp1&password=mobi1234&to=' + number[i] + '&from=VUINFO&text=Dear ' + sms
        request(message, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log("Alert has been " + body) // Show the HTML for the Google homepage.
          } else {
            return handleError(res, err);
          }
        })
      }
      return res.status(200).json(doc);
    }

  })
}


// send sms
exports.send_sms = function (req, res) {
  var number = req.query.number;
  generateSecureVal(function (secureVal) {
    var message = 'http://www.myvaluefirst.com/smpp/sendsms?username=Mobiservehttp1&password=mobi1234&to=' + number + '&from=VUINFO&text=Dear Recipients,\nYour OTP is -' + secureVal
    request(message, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log("Alert has been " + body) // Show the HTML for the Google homepage.
        return res.status(200).send({ "body": body, "response": response, "secureVal": secureVal });
      } else {
        return handleError(res, err);
      }
    })
  })
}


var crypto = require('crypto');
const { map } = require('lodash');
const { json } = require('body-parser');
const { host } = require('../../config/email-settings');
var secureVal = 0;

function generateSecureVal(cb) {
  crypto.randomBytes(3, function (err, buffer) {
    secureVal = parseInt(buffer.toString('hex'), 16);
    if (secureVal > 999999 || secureVal < 100000) {
      generateSecureVal(cb);
    } else {
      cb(secureVal);
    }
  });
}

// play real time logs
exports.play_real_time = function (req, res) {
  var filter = "";
  var limit = 10;
  if (req.query.id) {
    filter = " Where vst.id >" + req.query.id;
    limit = 1000;
    if (req.query.device_id) {
      filter = filter + " AND vst.view_android_id = '" + req.query.device_id + "'";
    }
  } else {
    if (req.query.device_id) {
      filter = " Where vst.view_android_id = '" + req.query.device_id + "'";
    }
  }
  var query = "select "
    + " vc.title,"
    + " vc.thumbnail,"
    + " vst.type,"
    + " vc.genre,"
    + " am.login_id,"
    + " vst.session_id,"
    + " vst.id,"
    + " vst.view_android_id,"
    + " vst.device_id,"
    + " vst.version,"
    + " vst.interface,"
    + " vst.model,"
    + " vst.mac,"
    + " vst.reg_id,"
    + " vst.view_model,"
    + " vst.view_duration/60000 view_duration,"
    + " vst.view_datetime,"
    + " vr.source,"
    + " vr.destination,"
    + " vr.vehicle_no,"
    + " vst.sync_datetime"
    + " from"
    + " vuscreen_tracker vst"
    + " LEFT JOIN"
    + " vuscreen_content_package vc ON vst.view_id = vc.content_id"
    + " LEFT JOIN"
    + " account_management am ON vst.partner = am.id"
    + " LEFT JOIN "
    + " vuscreen_registration vr ON vst.reg_id = vr.reg_id" + filter
    + " AND vst.partner = '" + req.user.partner_id + "'"
    + " order by vst.id DESC limit " + limit.toString();
  // var query = "select * from stream_tracker " + filter + " ORDER BY id DESC limit "+ limit.toString();
  // 
  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};




function handleError(res, err) {
  return res.status(500).send(err);
}


/////////////////// fnb item logs

var vuscreen_getFnBIemData_Pagination = function (req, cb) {
  console.log(req.query);
  if (req.query.startDate) { var startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { var endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var query = "SELECT device_id,sync_date, menu, trackingDetails, COUNT(1) as totalRecords, b.title FROM spicescreen.vuscreen_tracker a JOIN vuscreen_fnb_content b ON a.view_id = b.content_id WHERE trackingDetails LIKE '%f&b%' AND a.sync_date>='" + startDate + "' AND a.sync_date<='" + endDate + "' GROUP BY sync_date ,menu , b.title,device_id ORDER BY id DESC";
  var option = { draw: req.query.draw, start: req.query.start, length: req.query.length };
  db.pagination(query, option, function (err, doc) {
    console.log(doc);
    return cb(err, doc);
  })
};
//////////////////// fnb item clicks csv 

exports.vuscreen_FnB_items_export_csv = function (req, res) {
  var fields = ["device_id", "title", "menu", "trackingDetails", "sync_date", "totalRecords"];
  var fieldversions = ["device_id", "title", "menu", "trackingDetails", "sync_date", "totalRecords"];

  var name = 'FnB' + (moment(new Date()).format('YYYY-MM-DD')).toString()
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-disposition', 'attachment;filename=' + name + '.csv');
  res.write(fieldversions.join(","));
  // console.log(req);
  function pagination() {
    vuscreen_getFnBIemData_Pagination(req, function (err, doc) {
      console.log(doc);
      if (doc.data.length > 0) {
        req.query.start = parseInt(req.query.start) + parseInt(req.query.length);
        var row = '';
        for (var i = 0; i < doc.data.length; i++) {
          var json = doc.data[i];
          var col = '';
          for (var x = 0; x < fields.length; x++) {
            var val = json[fields[x]];
            if (val) {
              val = val.toString().replace(/,/g, ' ').replace(/"/g, ' ');
            }
            if (val == '' || typeof (val) == 'undefined' || val == null) { val = ' '; };
            if (fields[x] == 'sync_datetime') { val = moment(val).format('YYYY-MM-DD HH:mm:ss ').toString() };
            if (col == '') {
              col = val;
            } else {
              col = col + ',' + val;
            }
          };
          if (row == '') { row = col; }
          else { row = row + '\r\n' + col; }
        };
        res.write('\r\n');
        res.write(row);
        pagination();
      } else {
        res.end();
      }
    })
  }
  pagination();
}





exports.vuscreen_getFnBmail = function (req, cb) {
  //  var vuscreen_getFnBmail = function (req, cb) {
  console.log("vishal");
  var currentDate = moment(new Date()).format('YYYY-MM-DD');
  var d = new Date();
  d.setDate(d.getDate() - 1);
  var Yesterday = moment(d).format('YYYY-MM-DD').toString()
  var query = "SELECT "
    + "(SELECT COUNT(1) FROM spicescreen.vuscreen_tracker a LEFT JOIN vuscreen_fnb_content b ON a.view_id = b.content_id JOIN vuscreen_registration c ON a.device_id = c.device_id LEFT JOIN vuscreen_fnb_folders AS d ON b.folder_id = d.id WHERE a.view_date = '" + Yesterday + "' AND a.menu LIKE '%f&b%' ORDER BY a.id DESC) total_clicks,"
    + " (SELECT COUNT(DISTINCT a.mac) FROM spicescreen.vuscreen_tracker a LEFT JOIN vuscreen_fnb_content b ON a.view_id = b.content_id JOIN vuscreen_registration c ON a.device_id = c.device_id LEFT JOIN vuscreen_fnb_folders AS d ON b.folder_id = d.id WHERE a.view_date = '" + Yesterday + "' AND a.menu LIKE '%f&b%' ORDER BY a.id DESC) total_unique_user,"
    + " (SELECT COUNT(1) FROM spicescreen.vuscreen_tracker a LEFT JOIN vuscreen_fnb_content b ON a.view_id = b.content_id JOIN vuscreen_registration c ON a.device_id = c.device_id LEFT JOIN vuscreen_fnb_folders AS d ON b.folder_id = d.id WHERE a.view_date = '" + Yesterday + "' AND a.menu LIKE '%FNB - DemoesticBOB%' ORDER BY a.id DESC) tc_domestic_bob,"
    + " (SELECT COUNT(1) FROM spicescreen.vuscreen_tracker a LEFT JOIN vuscreen_fnb_content b ON a.view_id = b.content_id JOIN vuscreen_registration c ON a.device_id = c.device_id LEFT JOIN vuscreen_fnb_folders AS d ON b.folder_id = d.id WHERE a.view_date = '" + Yesterday + "' AND a.menu LIKE '%FNB - PreBook%' ORDER BY a.id DESC) tc_prebooking,"
    + " (SELECT COUNT(1) FROM spicescreen.vuscreen_tracker a LEFT JOIN vuscreen_fnb_content b ON a.view_id = b.content_id JOIN vuscreen_registration c ON a.device_id = c.device_id LEFT JOIN vuscreen_fnb_folders AS d ON b.folder_id = d.id WHERE a.view_date = '" + Yesterday + "' AND a.menu LIKE '%FNB - Service Guildlines%' ORDER BY a.id DESC) tc_service_Guidlines,"
    + " (SELECT COUNT(1) FROM spicescreen.vuscreen_tracker a LEFT JOIN vuscreen_fnb_content b ON a.view_id = b.content_id JOIN vuscreen_registration c ON a.device_id = c.device_id LEFT JOIN vuscreen_fnb_folders AS d ON b.folder_id = d.id WHERE a.view_date = '" + Yesterday + "' AND a.menu LIKE '%FNB - InternationlBOB%' ORDER BY a.id DESC) tc_Inter_BOB,"
    + " (SELECT COUNT(1) FROM spicescreen.vuscreen_tracker a LEFT JOIN vuscreen_fnb_content b ON a.view_id = b.content_id JOIN vuscreen_registration c ON a.device_id = c.device_id LEFT JOIN vuscreen_fnb_folders AS d ON b.folder_id = d.id WHERE a.view_date = '" + Yesterday + "' AND a.menu LIKE '%FNB - SpiceMax%' ORDER BY a.id DESC) tc_spice,"
    + " (SELECT COUNT(1) FROM spicescreen.vuscreen_tracker a LEFT JOIN vuscreen_fnb_content b ON a.view_id = b.content_id JOIN vuscreen_registration c ON a.device_id = c.device_id LEFT JOIN vuscreen_fnb_folders AS d ON b.folder_id = d.id WHERE a.view_date = '" + Yesterday + "' AND a.menu LIKE '%FNB - Buy On Board%' ORDER BY a.id DESC)  tc_BOB,"
    + " (SELECT COUNT(Distinct mac) FROM spicescreen.vuscreen_tracker a LEFT JOIN vuscreen_fnb_content b ON a.view_id = b.content_id JOIN vuscreen_registration c ON a.device_id = c.device_id LEFT JOIN vuscreen_fnb_folders AS d ON b.folder_id = d.id WHERE a.view_date = '" + Yesterday + "' AND a.menu LIKE '%FNB - DemoesticBOB%' ORDER BY a.id DESC) tc_domestic_bob,"
    + " (SELECT COUNT(Distinct mac) FROM spicescreen.vuscreen_tracker a LEFT JOIN vuscreen_fnb_content b ON a.view_id = b.content_id JOIN vuscreen_registration c ON a.device_id = c.device_id LEFT JOIN vuscreen_fnb_folders AS d ON b.folder_id = d.id WHERE a.view_date = '" + Yesterday + "' AND a.menu LIKE '%FNB - PreBook%' ORDER BY a.id DESC) tuu_prebooking,"
    + " (SELECT COUNT(Distinct mac) FROM spicescreen.vuscreen_tracker a LEFT JOIN vuscreen_fnb_content b ON a.view_id = b.content_id JOIN vuscreen_registration c ON a.device_id = c.device_id LEFT JOIN vuscreen_fnb_folders AS d ON b.folder_id = d.id WHERE a.view_date = '" + Yesterday + "' AND a.menu LIKE '%FNB - Service Guildlines%' ORDER BY a.id DESC) tuu_service_Guidlines,"
    + " (SELECT COUNT(Distinct mac) FROM spicescreen.vuscreen_tracker a LEFT JOIN vuscreen_fnb_content b ON a.view_id = b.content_id JOIN vuscreen_registration c ON a.device_id = c.device_id LEFT JOIN vuscreen_fnb_folders AS d ON b.folder_id = d.id WHERE a.view_date = '" + Yesterday + "' AND a.menu LIKE '%FNB - InternationlBOB%' ORDER BY a.id DESC) tuu_Inter_BOB,"
    + " (SELECT COUNT(Distinct mac) FROM spicescreen.vuscreen_tracker a LEFT JOIN vuscreen_fnb_content b ON a.view_id = b.content_id JOIN vuscreen_registration c ON a.device_id = c.device_id LEFT JOIN vuscreen_fnb_folders AS d ON b.folder_id = d.id WHERE a.view_date = '" + Yesterday + "' AND a.menu LIKE '%FNB - SpiceMax%' ORDER BY a.id DESC) tuu_spice,"
    + " (SELECT COUNT(Distinct mac) FROM spicescreen.vuscreen_tracker a LEFT JOIN vuscreen_fnb_content b ON a.view_id = b.content_id JOIN vuscreen_registration c ON a.device_id = c.device_id LEFT JOIN vuscreen_fnb_folders AS d ON b.folder_id = d.id WHERE a.view_date = '" + Yesterday + "' AND a.menu LIKE '%FNB - Buy On Board%' ORDER BY a.id DESC)  tuu_BOB,"
    + " (SELECT COUNT(Distinct mac) FROM spicescreen.vuscreen_tracker a LEFT JOIN vuscreen_fnb_content b ON a.view_id = b.content_id JOIN vuscreen_registration c ON a.device_id = c.device_id LEFT JOIN vuscreen_fnb_folders AS d ON b.folder_id = d.id WHERE a.view_date = '" + Yesterday + "' AND a.menu LIKE '%FNB - DemoesticBOB%' ORDER BY a.id DESC) tuu_domestic_BOB";
  var query1 = "SELECT b.title, count(1) count, count(distinct mac) users, a.view_date FROM spicescreen.vuscreen_tracker a LEFT JOIN vuscreen_fnb_content b ON a.view_id = b.content_id JOIN vuscreen_registration c ON a.device_id = c.device_id LEFT JOIN vuscreen_fnb_folders AS d ON b.folder_id = d.id WHERE a.view_date='" + Yesterday + "' AND a.menu LIKE '%f&b%' ANd b.ftype='domestic' group by b.title ORDER BY count(1) DESC limit 5";
  var query2 = "SELECT b.title, count(1) count, count(distinct mac) users, a.view_date FROM spicescreen.vuscreen_tracker a LEFT JOIN vuscreen_fnb_content b ON a.view_id = b.content_id JOIN vuscreen_registration c ON a.device_id = c.device_id LEFT JOIN vuscreen_fnb_folders AS d ON b.folder_id = d.id WHERE a.view_date='" + Yesterday + "' AND a.menu LIKE '%f&b%' ANd b.ftype='INTERNATIONAL' group by b.title ORDER BY count(1) DESC limit 5";
  var query3 = "SELECT b.title, count(1) count, count(distinct mac) users, a.view_date FROM spicescreen.vuscreen_tracker a LEFT JOIN vuscreen_fnb_content b ON a.view_id = b.content_id JOIN vuscreen_registration c ON a.device_id = c.device_id LEFT JOIN vuscreen_fnb_folders AS d ON b.folder_id = d.id WHERE a.view_date='" + Yesterday + "' AND a.menu LIKE '%f&b%' ANd b.ftype='Prebooking' group by b.title ORDER BY count(1) DESC limit 5";
  var query4 = "SELECT b.title, COUNT(*) count, count(DISTINCT a.mac) users ,d.folder FROM spicescreen.vuscreen_tracker a LEFT JOIN vuscreen_fnb_content b ON a.view_id = b.content_id LEFT JOIN vuscreen_fnb_folders AS d ON b.folder_id = d.id WHERE a.view_date='" + Yesterday + "'  ANd d.status=1 group by d.folder,b.title ORDER BY folder";
  //var option = { draw: req.query.draw, start: 0, length: 500 };
  db.get().query(query, function (error, doc) {
    if (error) {
      console.log(error)
    } else {
      db.get().query(query1, function (err, doc1) {
        if (err) { console.log(err); }
        else {
          db.get().query(query2, function (err2, doc2) {
            if (err2) { console.log(err2); }
            else {
              db.get().query(query3, function (err3, doc3) {
                if (err3) { console.log(err3); }
                else {
                  db.get().query(query4, function (err4, doc4) {
                    if (err4) { console.log(err4); }
                    else {

                      var html = "<html><head>"
                      html += "<style>"
                      html += "table {font-family: arial, sans-serif;border-collapse: collapse;width: 100%;}"
                      html += "td, th {border: 2px solid black;text-align: center;padding: 8px;}"
                      html += "tr:nth-child(even) {background-color: #dddddd;}</style></head>"
                      html += "<h4>Dear Recipients,</h4>"
                      html += "<h4>Please find below reports.</h4>"
                      html += "<table>"
                      html += "<thead><tr>"
                      html += "<th colspan='2' >FNB Section</th>"
                      html += "</tr></thead><tbody>"
                      html += "<tr>"
                      html += "<td><b>Total Unique Users</b></td>"
                      html += "<td>" + doc[0].total_unique_user + "</td>"
                      html += "</tr>"
                      html += "<tr>"
                      html += "<td><b>Total Clicks</b></td>"
                      html += "<td>" + doc[0].total_clicks + "</td>"
                      html += "</tr>"
                      html += "<tr>"
                      html += "<td><b>Avg click/user</b></td>"
                      html += "<td>" + (doc[0].total_clicks / doc[0].total_unique_user).toFixed(1); + "</td>"
                      html += "</tr>"
                      html += "</tbody></table>";
                      html += "<br>"
                      html += "<table>"
                      html += "<thead><tr>"
                      html += "<th colspan='4' > Summary</th>"
                      html += "</tr></thead><tbody>"
                      html += "<tr>"
                      html += "<td><b></b></td>"
                      html += "<td>Total Unique Users</td>"
                      html += "<td>Total Clicks </td>"
                      html += "<td>Avg Clicks/User</td>"
                      html += "</tr>"
                      html += "<tr>"
                      html += "<td><b>BuyonBoard</b></td>"
                      html += "<td>" + doc[0].tuu_BOB + "</td>"
                      html += "<td>" + doc[0].tc_BOB + "</td>"
                      html += "<td>" + (doc[0].tc_BOB / doc[0].tuu_BOB).toFixed(1); + "</td>"
                      html += "</tr>"
                      html += "<tr>"
                      html += "<td><b>PreBooking</b></td>"
                      html += "<td>" + doc[0].tuu_prebooking + "</td>"
                      html += "<td>" + doc[0].tc_prebooking + "</td>"
                      html += "<td>" + (doc[0].tc_prebooking / doc[0].tuu_prebooking).toFixed(1); + "</td>"
                      html += "</tr>"
                      html += "<tr>"
                      html += "<td><b>BuyonBoard(Domestic)</b></td>"
                      html += "<td>" + doc[0].tuu_domestic_BOB + "</td>"
                      html += "<td>" + doc[0].tc_domestic_bob + "</td>"
                      html += "<td>" + (doc[0].tc_domestic_bob / doc[0].tuu_domestic_BOB).toFixed(1); + "</td>"
                      html += "</tr>"
                      html += "<tr>"
                      html += "<td><b>BuyonBoard(International)</b></td>"
                      html += "<td>" + doc[0].tuu_Inter_BOB + "</td>"
                      html += "<td>" + doc[0].tc_Inter_BOB + "</td>"
                      html += "<td>" + (doc[0].tc_Inter_BOB / doc[0].tuu_Inter_BOB).toFixed(1); + "</td>"
                      html += "</tr>"
                      html += "<tr>"
                      html += "<td><b>SpiceMax</b></td>"
                      html += "<td>" + doc[0].tuu_spice + "</td>"
                      html += "<td>" + doc[0].tc_spice + "</td>"
                      html += "<td>" + (doc[0].tc_spice / doc[0].tuu_spice).toFixed(1); + "</td>"
                      html += "</tr>"
                      html += "<tr>"
                      html += "<td><b>Guidelines</b></td>"
                      html += "<td>" + doc[0].tuu_service_Guidlines + "</td>"
                      html += "<td>" + doc[0].tc_service_Guidlines + "</td>"
                      html += "<td>" + (doc[0].tc_service_Guidlines / doc[0].tuu_service_Guidlines).toFixed(1); + "</td>"
                      html += "</tr>"
                      html += "</tbody></table>";
                      html += "<br>"
                      html += "<table>"
                      html += "<thead><tr>"
                      html += "<th colspan='4' > BuyOnBoard (Domestic)</th>"
                      html += "</tr></thead><tbody>"
                      html += "<tr>"
                      html += "<th>Item</th>"
                      html += "<th>Unique Users</th>"
                      html += "<th>Total Clicks</th>"
                      html += "<th>Avg Clicks/User</th>"
                      html += "</tr></thead><tbody>"
                      for (let indexs = 0; indexs < doc1.length; indexs++) {
                        const elements = doc1[indexs];
                        html += "<tr>"

                        html += "<td><b>" + elements.title + "</b></td>"
                        html += "<td>" + elements.users + "</td>"
                        html += "<td>" + elements.count + "</td>"
                        html += "<td>" + (elements.count / elements.users).toFixed(1) + "</td>"
                        html += "</tr>"
                      }
                      html += "</tbody></table>";
                      html += "<br>"
                      html += "<table>"
                      html += "<thead><tr>"
                      html += "<th colspan='4' > BuyOnBoard (International)</th>"
                      html += "</tr></thead><tbody>"
                      html += "<tr>"
                      html += "<th>Item</th>"
                      html += "<th>Unique Users</th>"
                      html += "<th>Total Clicks</th>"
                      html += "<th>Avg Clicks/User</th>"
                      html += "</tr></thead><tbody>"
                      for (let index = 0; index < doc2.length; index++) {
                        const element = doc2[index];
                        html += "<tr>"
                        html += "<td><b>" + element.title + "</b></td>"
                        html += "<td>" + element.users + "</td>"
                        html += "<td>" + element.count + "</td>"
                        html += "<td>" + (element.count / element.users).toFixed(1) + "</td>"
                        html += "</tr>"
                      }
                      html += "</tbody></table>";
                      html += "<br>"
                      html += "<table>"
                      html += "<thead><tr>"
                      html += "<th colspan='4' > PreBooking</th>"
                      html += "</tr></thead><tbody>"
                      html += "<tr>"
                      html += "<th>Item</th>"
                      html += "<th>Unique Users</th>"
                      html += "<th>Total Clicks</th>"
                      html += "<th>Avg Clicks/User</th>"
                      html += "</tr></thead><tbody>"
                      for (let index = 0; index < doc3.length; index++) {
                        const element = doc3[index];
                        html += "<tr>"
                        html += "<td><b>" + element.title + "</b></td>"
                        html += "<td>" + element.users + "</td>"
                        html += "<td>" + element.count + "</td>"
                        html += "<td>" + (element.count / element.users).toFixed(1) + "</td>"
                        html += "</tr>"
                      }
                      html += "</tbody></table>";
                      html += "<br>"
                      const finalArray = [];
                      let menuMap = new Map()
                      for (let index = 0; index < doc4.length; index++) {
                        const element = doc4[index];
                        if (!menuMap.has(element.folder)) {
                          let obj = {
                            "category": element.folder,
                            "title": element.title,
                            "users": element.users,
                            "clicks": element.count

                          }
                          menuMap.set(element.folder, obj)
                        }
                        if (doc4.length == index + 1) {
                          function logMapElements(value, key, map) {
                            finalArray.push(value)
                          }
                          menuMap.forEach(logMapElements);
                        }
                      }
                      html += "<table>"
                      html += "<thead><tr>"
                      html += "<th colspan='5' >Category Wise Summary</th>"
                      html += "</tr></thead><tbody>"
                      html += "<tr>"
                      html += "<th>Category</th>"
                      html += "<th>Most Clicked Item</th>"
                      html += "<th>Total Unique Users</th>"
                      html += "<th>Total Clicks</th>"
                      html += "<th>Avg Clicks/User</th>"
                      html += "</tr></thead><tbody>"
                      for (let index = 0; index < finalArray.length; index++) {
                        const element = finalArray[index];
                        html += "<tr>"
                        html += "<td><b>" + element.category + "</b></td>"
                        html += "<td>" + element.title + "</td>"
                        html += "<td>" + element.users + "</td>"
                        html += "<td>" + element.clicks + "</td>"
                        html += "<td>" + (element.clicks / element.users).toFixed(1) + "</td>"
                        html += "</tr>"
                      }
                      html += "</tbody></table>";
                      html += "<br>"
                      html += "<br><br><h5>Thanks & Regards</h5><h5>Mobi Sign Pvt Ltd.</h5></html>"
                      let subject = "Spicescreen FNB Usage Report"
                      var email = 'manoj.gupta@mobisign.co.in,deepak.kumar@mobisign.co.in,monali.monalisa@mobisign.co.in,product@mobisign.co.in,ashyin.thakral@mobisign.co.in,kedargdr@gmail.com,vishal.garg@mobisign.co.in,tushar.mehta@mobisign.co.in,ataul.khan001@gmail.com'
                      //  var email = 'anurag.kumar@spicejet.com,puneet.angrish@spicejet.com,sapna.kumar@spicejet.com,jitendra.gautam@spicejet.com,prashant.mishra4@spicejet.com,sushant.madhab@spicejet.com,manoj.gupta@mobisign.co.in,deepak.kumar@mobisign.co.in,monali.monalisa@mobisign.co.in,product@mobisign.co.in,ashyin.thakral@mobisign.co.in,kedargdr@gmail.com,amajit.das@spicejet.com,nidhi.sinha@spicejet.com'
                      //  var email = 'kedargdr@gmail.com,vishal.garg@mobisign.co.in'
                      EM.dispatchEmail(email, subject, html, "timeSpent", function (e) {
                        console.log(e)
                      })
                    }

                  })
                }
              })
            }
          })
        }
      })
    }
  })
};

// vuscreen_getFnBmail();


exports.vuscreen_FnB_items_export_csv = function (req, res) {
  var fields = ["device_id", "title", "menu", "trackingDetails", "sync_date", "totalRecords"];
  var fieldversions = ["device_id", "title", "menu", "trackingDetails", "sync_date", "totalRecords"];

  var name = 'FnB' + (moment(new Date()).format('YYYY-MM-DD')).toString()
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-disposition', 'attachment;filename=' + name + '.csv');
  res.write(fieldversions.join(","));
  // console.log(req);
  function pagination() {
    vuscreen_getFnBIemData_Pagination(req, function (err, doc) {
      console.log(doc);
      if (doc.data.length > 0) {
        req.query.start = parseInt(req.query.start) + parseInt(req.query.length);
        var row = '';
        for (var i = 0; i < doc.data.length; i++) {
          var json = doc.data[i];
          var col = '';
          for (var x = 0; x < fields.length; x++) {
            var val = json[fields[x]];
            if (val) {
              val = val.toString().replace(/,/g, ' ').replace(/"/g, ' ');
            }
            if (val == '' || typeof (val) == 'undefined' || val == null) { val = ' '; };
            if (fields[x] == 'sync_datetime') { val = moment(val).format('YYYY-MM-DD HH:mm:ss ').toString() };
            if (col == '') {
              col = val;
            } else {
              col = col + ',' + val;
            }
          };
          if (row == '') { row = col; }
          else { row = row + '\r\n' + col; }
        };
        res.write('\r\n');
        res.write(row);
        pagination();
      } else {
        res.end();
      }
    })
  }
  pagination();
}



exports.vuscreen_getplaydtail = function (req, cb) {
  // var vuscreen_getplaydtmail = function (req, cb) {

  var currentDate = moment(new Date()).format('YYYY-MM-DD');
  var d = new Date();
  d.setDate(d.getDate() - 1);
  var Yesterday = moment(d).format('YYYY-MM-DD').toString()
  var query = "SELECT menu, COUNT(1) count, vehicle_no,count(distinct mac) as mac FROM vuscreen_tracker  as a join vuscreen_registration as b on a.device_id=b.device_id WHERE trackingDetails = 'click' and a.sync_date='" + Yesterday + "' AND menu IN ('WATCH','F&B','STORE') GROUP BY a.menu,b.vehicle_no order by vehicle_no";
  var query1 = "SELECT event,c.vehicle_no from spicescreen.vuscreen_events a join vuscreen_registration  c on a.device_id=c.device_id where event like '%stop%'and a.sync_date='" + Yesterday + "' order by a.id desc";
  var query2 = "SELECT c.vehicle_no, COUNT(DISTINCT a.view_date) AS dats FROM spicescreen.vuscreen_events a JOIN vuscreen_registration c ON a.device_id=c.device_id WHERE a.event LIKE '%stop%' AND a.sync_date='" + Yesterday + "' GROUP BY c.vehicle_no ORDER BY a.id DESC";

  db.get().query(query, function (error, doc) {
    if (error) {
      console.log(error)
    } else {
      db.get().query(query1, function (err, doc1) {
        if (err) { console.log(err); }
        else {
          db.get().query(query2, function (err, doc2) {
            if (err) { console.log(err); }
            else {

              var html = "<html><head>"
              html += "<style>"
              html += "table {font-family: arial, sans-serif;border-collapse: collapse;width: 100%;}"
              html += "td, th {border: 2px solid black;text-align: center;padding: 8px;}"
              html += "tr:nth-child(even) {background-color: #dddddd;}</style></head>"
              html += "<h4>Dear Recipients,</h4>"
              html += "<h4>Please find below reports.</h4>"

              html += "<br>"

              var wifidata = []
              var temp = {}
              for (let i in doc1) {
                temp = {}
                let sp = doc1[i].event.split("|");

                if (sp.length == 3) {
                  if (sp[2] != NaN) {
                    temp.HostID = doc1[i].vehicle_no;
                    temp.conn = sp[2];
                  }

                  wifidata.push(temp);
                }

              }

              const finalArray = [];
              let menuMap = new Map()
              for (let index = 0; index < wifidata.length; index++) {
                const element = wifidata[index];
                if (!menuMap.has(element.HostID)) {

                  let obj = {
                    "host": element.HostID,
                    "WIFI_Connected": element.conn,
                    "daysc": 0
                  }
                  menuMap.set(element.HostID, obj)
                }
                else {
                  let arr = menuMap.get(element.HostID)
                  // console.log(arr);

                  arr.WIFI_Connected = parseInt(arr.WIFI_Connected) + parseInt(element.conn)
                  // finalArray.push(element);
                  // menuMap.set(arr.WIFI_Connected, arr)
                }
                if (wifidata.length == index + 1) {
                  function logMapElements(value, key, map) {
                    finalArray.push(value)
                  }
                  menuMap.forEach(logMapElements);
                }
              }



              for (let dt in doc2) {
                for (let hst in finalArray) {
                  if (doc2[dt].vehicle_no == finalArray[hst].host) {
                    finalArray[hst].daysc = doc2[dt].dats;
                    break;
                  }
                }

              }
              console.log(finalArray);

              finalArray.sort((a, b) => b.WIFI_Connected - a.WIFI_Connected)
              console.log(finalArray);
              html += "<table>"
              html += "<thead><tr>"
              html += "<th colspan='6' >User Report</th>"
              html += "</tr></thead><tbody>"
              html += "<tr>"
              html += "<th>Host NO</th>"
              html += "<th>Wi-Fi Connected</th>"
              html += "<th> Count Of Days</th>"
              html += "<th>Login</th>"
              html += "<th>Game Played</th>"
              html += "<th>FNB List</th>"
              html += "</tr></thead><tbody>"
              var total = {
                wifi: 0,
                day: 0,
                log: 0,
                game: 0,
                fnb: 0
              }
              for (let index = 0; index < finalArray.length; index++) {
                var finalData = { fnb: 0, game: 0, login: 0 };
                const element = finalArray[index];
                for (let key in doc) {


                  if (element.host == doc[key].vehicle_no && doc[key].menu == "F&B") {
                    finalData.fnb = doc[key].mac
                  }
                  else if (element.host == doc[key].vehicle_no && doc[key].menu == "STORE") {
                    finalData.game = doc[key].mac
                  }
                  else if (element.host == doc[key].vehicle_no && doc[key].menu == "WATCH") {
                    finalData.login = doc[key].mac
                  }

                }
                html += "<tr>"
                html += "<td><b>" + element.host + "</b></td>"
                html += "<td>" + element.WIFI_Connected + "</td>"
                html += "<td>" + element.daysc + "</td>"
                html += "<td>" + finalData.login + "</td>"
                html += "<td>" + finalData.game + "</td>"
                html += "<td>" + finalData.fnb + "</td>"
                html += "</tr>"
                if (element.WIFI_Connected != NaN) {
                  total.wifi = parseInt(total.wifi) + parseInt(element.WIFI_Connected);

                  total.log = parseInt(total.log) + parseInt(finalData.login);
                  total.game = parseInt(total.game) + parseInt(finalData.game);
                  total.fnb = parseInt(total.fnb) + parseInt(finalData.fnb);

                  if (total.day < element.daysc) {
                    total.day = element.daysc;
                  }

                }

              }
              html += "<tr>"
              html += "<td><b> Total </b></td>"
              html += "<td>" + total.wifi + "</td>"
              html += "<td>" + total.day + "</td>"
              html += "<td>" + total.log + "</td>"
              html += "<td>" + total.game + "</td>"
              html += "<td>" + total.fnb + "</td>"
              html += "</tr>"
              html += "</tbody></table>";
              /////////
              html += "<br>"
              html += "<br><br><h5>Thanks & Regards</h5><h5>Mobi Sign Pvt Ltd.</h5></html>"
              let subject = "Spicescreen User Report"
              var email = 'manoj.gupta@mobisign.co.in,deepak.kumar@mobisign.co.in,monali.monalisa@mobisign.co.in,product@mobisign.co.in,ashyin.thakral@mobisign.co.in,kedargdr@gmail.com,vishal.garg@mobisign.co.in,tushar.mehta@mobisign.co.in'
              //  var email = 'anurag.kumar@spicejet.com,puneet.angrish@spicejet.com,sapna.kumar@spicejet.com,jitendra.gautam@spicejet.com,prashant.mishra4@spicejet.com,sushant.madhab@spicejet.com,manoj.gupta@mobisign.co.in,deepak.kumar@mobisign.co.in,monali.monalisa@mobisign.co.in,product@mobisign.co.in,ashyin.thakral@mobisign.co.in,kedargdr@gmail.com,amajit.das@spicejet.com,nidhi.sinha@spicejet.com'
              // var email = 'vishal.garg@mobisign.co.in,deepak.kumar@mobisign.co.in,kedargdr@gmail.com'
              EM.dispatchEmail(email, subject, html, "timeSpent", function (e) {
                console.log(e)
              })

            }
          })
        }
      })
    }
  })
};

// vuscreen_getplaydtmail();

// Voot
// Akash.Banerji@viacom18.com
// Akash@viacom18

// Paramjeet.Bhalla@viacom18.com
// Paramjeet@viacom18

// Arpit.Awasthi@viacom18.com
// Arpit@viacom18

// Disney
// Cyril.Ferry@disney.com
// Cyril@disney

// Nirbhaay.Sharma@disney.com
// Nirbhaay@disney


// FOG
// vijay@funongo.com
// vijay@funongo

// devender@funongo.com
// devender@funongo

const ids = [
  {
    device_id: "1b65cae1eaeba474",
    vehicle_no: 1
  },
  {
    device_id: "75538609177e4152",
    vehicle_no: 2
  },
  {
    device_id: "a8e1abf97c693cc",
    vehicle_no: 3
  },
  {
    device_id: "2fc266ab5dcc26b0",
    vehicle_no: 4
  },
  {
    device_id: "104147a818ac3808",
    vehicle_no: 5
  },
  {
    device_id: "a2cecc94e3a04d",
    vehicle_no: 6
  },
  {
    device_id: "a06f76beb4584cd4",
    vehicle_no: 7
  },
  {
    device_id: "5f0f7aaeeec78eda",
    vehicle_no: 8
  },
  {
    device_id: "98d0a028c618f251",
    vehicle_no: 9
  },
  {
    device_id: "8e23f6922c211e65",
    vehicle_no: 10
  },
  {
    device_id: "b5d565ca52d63a09",
    vehicle_no: 11
  },
  {
    device_id: "c11ff66984c85cfb",
    vehicle_no: 12
  },
  {
    device_id: "5d5bd83375b23bc0",
    vehicle_no: 13
  },
  {
    device_id: "60e31f73b31bca6",
    vehicle_no: 14
  },
  {
    device_id: "38bac22273350d51",
    vehicle_no: 15
  },
  {
    device_id: "ceea700a44bb59cf",
    vehicle_no: 16
  },
  {
    device_id: "42ca32afd8c1c554",
    vehicle_no: 17
  },
  {
    device_id: "f65dab259c60f4b6",
    vehicle_no: 18
  },
  {
    device_id: "712df6fe834672b9",
    vehicle_no: 19
  },
  {
    device_id: "5207d65a46c250b0",
    vehicle_no: 20
  },
  {
    device_id: "d459bedf9f1b3f3e",
    vehicle_no: 21
  },
  {
    device_id: "24e6d10c1598d94b",
    vehicle_no: 22
  },
  {
    device_id: "42a928ec331e744c",
    vehicle_no: 23
  },
  {
    device_id: "11403e6c296230a1",
    vehicle_no: 24
  },
  {
    device_id: "8d7958a14d65f348",
    vehicle_no: 25
  },
  {
    device_id: "2e64ae9b5d477ff6",
    vehicle_no: 26
  },
  {
    device_id: "7f02912065618881",
    vehicle_no: 27
  },
  {
    device_id: "29d6c2c7e82ea1d5",
    vehicle_no: 28
  },
  {
    device_id: "2046db62bc9a390e",
    vehicle_no: 29
  },
  {
    device_id: "94b86fa76130a773",
    vehicle_no: 30
  },
  {
    device_id: "ee499b1f0afff81a",
    vehicle_no: 31
  },
  {
    device_id: "16fa92d30cc71229",
    vehicle_no: 32
  }
]

/*  Get Daily Email with last seven days file payed.
    @Authentication ----> by session key
    @Authorization ----> Access Controll Logic
    Author : Kedar Gadre
    Date : 20/07/2020
*/
exports.vehicleUpdate_Cron = function () {
  // var d = new Date();
  // d.setDate(d.getDate()-1);
  // var Yesterday = moment(d).format('YYYY-MM-DD').toString();
  // console.log(Yesterday)
  for (let i = 0; i < ids.length; i++) {
    const element = ids[i];
    let query = "Update "
      + " vuscreen_registration SET "
      + "    vehicle_no = '" + element.vehicle_no + "'"
      + " where "
      + " device_id='" + element.device_id + "'"
    db.get().query(query, function (err, result) {
      if (err) {
        console.log(err)
      } else {
        console.log(result)
      }
    })
  }
}

/*  Get Daily Email with last seven days DAU, file payed.
    @Authentication ----> by session key
    @Authorization ----> Access Controll Logic
    Author : Kedar Gadre
    Date : 28/07/2020
    Modified_by : Kedar Gadre
    Modification Date : 30/07/2020
*/
exports.dauEmailCron = function () {
  let d = new Date();
  let d1 = d.setDate(d.getDate() - 1);
  let d2 = d.setDate(d.getDate() - 6);
  d1 = moment(d1).format('YYYY-MM-DD').toString();
  d2 = moment(d2).format('YYYY-MM-DD').toString();
  d1 = d1 + " 06:10:00";
  d2 = d2 + " 06:10:00";
  var firstDate = moment(new Date()).format('YYYY-MM') + '-01';
  let query = "SELECT vr.vehicle_no as HostID, vst.view_date, COUNT(DISTINCT vst.mac) COUNT"
    + " FROM vuscreen_tracker vst"
    + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = vr.reg_id"
    + " WHERE vst.view_date >= '" + d2 + "' AND vst.view_date <= '" + d1 + "'"
    + " AND vr.vehicle_no In (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 18, 21, 22, 23, 24, 26, 27, 28, 29, 30, 31, 33, 32, 34, 35, 36, 37, "
    + " 38,39,43,44,48,55,59,65,69,70,74,75,83,85,87,89,94,95,96,97,98,100,102,103,104,105,106,"
    + " 108,110,111,112,113,114,115,116,117,118,119,120,121,"
    + " 122,125,126,127,128,129,130,131,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,"
    + " 161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,"
    + " 201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,220,14,15,40,41,45,46,47,49,51,52,53,54,56,57,60,61,62,63,64,66,67,68,71,72,76,78,79,90,91,92,93,190,191,192,193,194,195,196,197,198,199,88,99,82,84,217,218,219,221,132,189,200,301,302,303,304,305,124,123,306,58,20)"
    // + " AND vr.vehicle_no NOT REGEXP '[A-Z ]'"
    + " GROUP BY vr.vehicle_no, vst.view_date"
    + " ORDER BY vst.view_date, vr.vehicle_no"
  let query1 = "SELECT vr.vehicle_no as HostID, vst.view_date, COUNT(1) COUNT"
    + " FROM vuscreen_tracker vst"
    + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = vr.reg_id"
    + " WHERE vst.view_date >= '" + d2 + "' AND vst.view_date <= '" + d1 + "'"
    + " AND vr.vehicle_no In (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 18, 21, 22, 23, 24, 26, 27, 28, 29, 30, 31, 33, 32, 34, 35, 36, 37, "
    + " 38,39,43,44,48,55,59,65,69,70,74,75,83,85,87,89,94,95,96,97,98,100,102,103,104,105,106,"
    + " 108,110,111,112,113,114,115,116,117,118,119,120,121,"
    + " 122,125,126,127,128,129,130,131,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,"
    + " 161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,"
    + " 201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,220,14,15,40,41,45,46,47,49,51,52,53,54,56,57,60,61,62,63,64,66,67,68,71,72,76,78,79,90,91,92,93,190,191,192,193,194,195,196,197,198,199,88,99,82,84,217,218,219,221,132,189,200,301,302,303,304,305,124,123,306,58,20)"
    + " AND vst.type = 'video'"
    + " GROUP BY vr.vehicle_no, vst.view_date"
    + " ORDER BY vst.view_date, vr.vehicle_no"
  let query4 = "SELECT vr.vehicle_no as HostID, vst.view_date, COUNT(1) COUNT"
    + " FROM vuscreen_tracker vst"
    + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = vr.reg_id"
    + " WHERE vst.view_date >= '" + d2 + "' AND vst.view_date <= '" + d1 + "'"
    + " AND vr.vehicle_no In (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 18, 21, 22, 23, 24, 26, 27, 28, 29, 30, 31, 33, 32, 34, 35, 36, 37, "
    + " 38,39,43,44,48,55,59,65,69,70,74,75,83,85,87,89,94,95,96,97,98,100,102,103,104,105,106,"
    + " 108,110,111,112,113,114,115,116,117,118,119,120,121,"
    + " 122,125,126,127,128,129,130,131,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,"
    + " 161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,"
    + " 201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,220,14,15,40,41,45,46,47,49,51,52,53,54,56,57,60,61,62,63,64,66,67,68,71,72,76,78,79,90,91,92,93,190,191,192,193,194,195,196,197,198,199,88,99,82,84,217,218,219,221,132,189,200,301,302,303,304,305,124,123,306,58,20)"
    + " AND vst.type = 'zip'"
    + " GROUP BY vr.vehicle_no, vst.view_date"
    + " ORDER BY vst.view_date, vr.vehicle_no"
  let query2 = "SELECT vst.view_date, COUNT(1) Views, COUNT(DISTINCT vst.mac) Sessions, ROUND(COUNT(DISTINCT vst.device_id)/ 72 * 100) AS 'percentage',"
    + " COUNT(DISTINCT vst.device_id) Hubs"
    + " FROM vuscreen_tracker vst"
    + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = "
    + " vr.reg_id"
    + " WHERE vst.type IN ('video','brand-video') AND vst.view_date >= '" + firstDate + "' AND vst.view_date <= '" + d1 + "'"
    + " AND vr.vehicle_no In (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 18, 21, 22, 23, 24, 26, 27, 28, 29, 30, 31, 33, 32, 34, 35, 36, 37, "
    + " 38,39,43,44,48,55,59,65,69,70,74,75,83,85,87,89,94,95,96,97,98,100,102,103,104,105,106,"
    + " 108,110,111,112,113,114,115,116,117,118,119,120,121,"
    + " 122,125,126,127,128,129,130,131,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,"
    + " 161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,"
    + " 201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,220,14,15,40,41,45,46,47,49,51,52,53,54,56,57,60,61,62,63,64,66,67,68,71,72,76,78,79,90,91,92,93,190,191,192,193,194,195,196,197,198,199,88,99,82,84,217,218,219,221,132,189,200,301,302,303,304,305,124,123,306,58,20)"
    // + " AND vr.vehicle_no NOT REGEXP '[A-Z ]'"
    + " GROUP BY vst.view_date"
  let query3 = "SELECT DATE_FORMAT(vst.view_date, '%Y-%m') YEAR , DATE_FORMAT(vst.view_date, '%M-%y') Month,"
    + " COUNT(1) Views, COUNT(DISTINCT vst.mac) Sessions, ROUND(COUNT(DISTINCT vst.device_id)/ 72 * 100) AS percentage,"
    + " COUNT(DISTINCT vst.device_id) Hubs"
    + " FROM vuscreen_tracker vst"
    + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = "
    + "  vr.reg_id"
    + " WHERE "
    + " vr.vehicle_no In (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 18, 21, 22, 23, 24, 26, 27, 28, 29, 30, 31, 33, 32, 34, 35, 36, 37, "
    + " 38,39,43,44,48,55,59,65,69,70,74,75,83,85,87,89,94,95,96,97,98,100,102,103,104,105,106,"
    + " 108,110,111,112,113,114,115,116,117,118,119,120,121,"
    + " 122,125,126,127,128,129,130,131,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,"
    + " 161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,"
    + " 201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,220,14,15,40,41,45,46,47,49,51,52,53,54,56,57,60,61,62,63,64,66,67,68,71,72,76,78,79,90,91,92,93,190,191,192,193,194,195,196,197,198,199,88,99,82,84,217,218,219,221,132,189,200,301,302,303,304,305,124,123,306,58,20)"
    // + " vr.vehicle_no NOT REGEXP '[A-Z ]'"
    + " GROUP BY MONTH ORDER BY YEAR DESC LIMIT 2"
  let query5 = "SELECT vst.view_date, COUNT(DISTINCT vst.device_id) wifi_started, ROUND(COUNT(DISTINCT vst.device_id)/ 144 * 100) AS 'percentage'"
    + " FROM vuscreen_events vst"
    + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = "
    + " vr.reg_id"
    + " WHERE vst.view_date >= '" + firstDate + "' AND vst.view_date <= '" + d1 + "'"
    + " AND vr.vehicle_no In (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 18, 21, 22, 23, 24, 26, 27, 28, 29, 30, 31, 33, 32, 34, 35, 36, 37, "
    + " 38,39,43,44,48,55,59,65,69,70,74,75,83,85,87,89,94,95,96,97,98,100,102,103,104,105,106,"
    + " 108,110,111,112,113,114,115,116,117,118,119,120,121,"
    + " 122,125,126,127,128,129,130,131,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,"
    + " 161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,"
    + " 201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,220,14,15,40,41,45,46,47,49,51,52,53,54,56,57,60,61,62,63,64,66,67,68,71,72,76,78,79,90,91,92,93,190,191,192,193,194,195,196,197,198,199,88,99,82,84,217,218,219,221,132,189,200,301,302,303,304,305,124,123,306,58,20)"
    + " GROUP BY vst.view_date"
  db.get().query(query, function (error, dataArray) {
    if (error) {
      console.log(error)
    } else {
      db.get().query(query1, function (err, doc) {
        if (err) { console.log(err); }
        else {
          db.get().query(query2, function (err2, doc2) {
            if (err2) { console.log(err2); }
            else {
              db.get().query(query4, function (err4, doc4) {
                if (err4) { console.log(err4); }
                else {
                  db.get().query(query3, function (err3, doc3) {
                    if (err3) { console.log(err3); }
                    else {
                      db.get().query(query5, function (err5, doc5) {
                        if (err5) { console.log(err5); }
                        else {
                          let userMap = new Map();
                          let usageMap = new Map();
                          let gameMap = new Map();
                          function formatDate(date) {
                            let dd = date.getDate();
                            let mm = date.getMonth() + 1;
                            let yyyy = date.getFullYear();
                            if (dd < 10) { dd = '0' + dd }
                            if (mm < 10) { mm = '0' + mm }
                            date = yyyy + '-' + mm + '-' + dd;
                            return date
                          }
                          let Last7Days = [];
                          let obj = {}
                          let usageobj = {}
                          let gameobj = {}
                          for (let i = 0; i < 7; i++) {
                            let d = new Date();
                            d.setDate(d.getDate() - i - 1);
                            Last7Days.push(formatDate(d))
                            let da = formatDate(d)
                            obj[da] = 0;
                            obj["rowSum"] = 0;
                            usageobj[da] = 0;
                            usageobj["rowSum"] = 0;
                            gameobj[da] = 0;
                            gameobj["rowSum"] = 0;

                          }

                          Last7Days.reverse().join(',');
                          let finalArr = []
                          let usageArr = []
                          let gameArr = []
                          for (let i = 0; i < dataArray.length; i++) {
                            const element = dataArray[i];
                            if (!userMap.has(element.HostID)) {
                              let arr = []
                              arr.push(element)
                              let kg = Object.assign({ HostID: element.HostID }, obj)
                              finalArr.push(kg)
                              userMap.set(element.HostID, arr)
                              // if (i == 0) {
                              //     let kg = Object.assign({ vehicle_no: "total" }, obj)
                              //     finalArr.push(kg)
                              // }

                            } else {
                              let arr = userMap.get(element.HostID)
                              arr.push(element)
                              userMap.set(element.HostID, arr)
                            }
                            if (dataArray.length == i + 1) {
                              userMap.forEach((value, key, map, index) => {
                                for (let d = 0; d < finalArr.length; d++) {
                                  const data = finalArr[d];
                                  let count = 0;
                                  for (let val = 0; val < value.length; val++) {
                                    const obj = value[val];
                                    if (obj["HostID"] == data.HostID) {
                                      count = count + parseInt(obj.COUNT)
                                      data[obj.view_date] = obj.COUNT
                                      data["rowSum"] = count;
                                    }
                                  }
                                }
                              });
                            }
                          }

                          for (let i = 0; i < doc.length; i++) {
                            const element = doc[i];
                            if (!usageMap.has(element.HostID)) {
                              let arr = []
                              arr.push(element)
                              let kg = Object.assign({ HostID: element.HostID }, usageobj)
                              usageArr.push(kg)
                              usageMap.set(element.HostID, arr)
                              // if (i == 0) {
                              //     let kg = Object.assign({ vehicle_no: "total" }, obj)
                              //     finalArr.push(kg)
                              // }

                            } else {
                              let arr = usageMap.get(element.HostID)
                              arr.push(element)
                              usageMap.set(element.HostID, arr)
                            }
                            if (doc.length == i + 1) {
                              usageMap.forEach((value, key, map, index) => {
                                for (let d = 0; d < usageArr.length; d++) {
                                  const data = usageArr[d];
                                  let count = 0;
                                  for (let val = 0; val < value.length; val++) {
                                    const obj = value[val];
                                    if (obj["HostID"] == data.HostID) {
                                      count = count + parseInt(obj.COUNT)
                                      data[obj.view_date] = obj.COUNT
                                      data["rowSum"] = count;
                                    }
                                  }
                                }
                              });
                            }
                          }
                          for (let i = 0; i < doc4.length; i++) {
                            const element = doc4[i];
                            if (!gameMap.has(element.HostID)) {
                              let arr = []
                              arr.push(element)
                              let kg = Object.assign({ HostID: element.HostID }, gameobj)
                              gameArr.push(kg)
                              gameMap.set(element.HostID, arr)
                              // if (i == 0) {
                              //     let kg = Object.assign({ vehicle_no: "total" }, obj)
                              //     finalArr.push(kg)
                              // }

                            } else {
                              let arr = gameMap.get(element.HostID)
                              arr.push(element)
                              gameMap.set(element.HostID, arr)
                            }
                            if (doc4.length == i + 1) {
                              gameMap.forEach((value, key, map, index) => {
                                for (let d = 0; d < gameArr.length; d++) {
                                  const data = gameArr[d];
                                  let count = 0;
                                  for (let val = 0; val < value.length; val++) {
                                    const obj = value[val];
                                    if (obj["HostID"] == data.HostID) {
                                      count = count + parseInt(obj.COUNT)
                                      data[obj.view_date] = obj.COUNT
                                      data["rowSum"] = count;
                                    }
                                  }
                                }
                              });
                            }
                          }
                          finalArr.sort((a, b) => b.rowSum - a.rowSum)
                          usageArr.sort((a, b) => b.rowSum - a.rowSum)
                          gameArr.sort((a, b) => b.rowSum - a.rowSum)
                          var fields = ["HostID", Last7Days[0], Last7Days[1], Last7Days[2], Last7Days[3], Last7Days[4], Last7Days[5], Last7Days[6], 'rowSum'];
                          var csvDau = json2csv({ data: finalArr, fields: fields });
                          var csvPlay = json2csv({ data: usageArr, fields: fields });
                          var csvGame = json2csv({ data: gameArr, fields: fields });
                          var array = []
                          array.push({ key: 'Last7DaysDau', value: csvDau }, { key: 'Last7DaysPlay', value: csvPlay }, { key: 'Last7DaysGame', value: csvGame })
                          for (var i = 0; i < array.length; i++) {
                            fs.writeFile(config.root + '/server/api/vuscreen/' + array[i].key + '.csv', array[i].value, function (err) {
                              if (err) {
                                throw err;
                              } else {
                                console.log('file saved');
                              }
                            });
                          }
                          var html = "<html><head>"
                          html += "<style>"
                          html += "table {font-family: arial, sans-serif;border-collapse: collapse;width: 100%;}"
                          html += "td, th {border: 1px solid #dddddd;text-align: left;padding: 8px;}"
                          html += "tr:nth-child(even) {background-color: #dddddd;}</style></head>"
                          html += "<h4>Dear Recipients,</h4>"
                          html += "<h4>Please find below report.</h4><table>"
                          html += "<thead><tr>"
                          html += "<th>Date</th><th>Video Views</th><th>Viewers</th>"
                          html += "<th>% of Sync VS Total Hub</th>"
                          html += "<th>Wi-Fi Hub Started</th>"
                          html += "<th>Wi-Fi Hub Used</th>"
                          html += "<th>Wi-Fi Hub Provided</th>"
                          html += "</tr></thead><tbody>"
                          let monthTotal = 0;
                          let monthAvg = 0;
                          let hub_array = JSON.parse(JSON.stringify(doc2))
                          let synced_array = JSON.parse(JSON.stringify(doc5))
                          for (let i = 0; i < hub_array.length; i++) {
                            const element = hub_array[i];
                            synced_array.map(item => {
                              if (element.view_date == item.view_date) {
                                element.percentage = item.percentage;
                                element.wifi_started = item.wifi_started;
                              }
                            });
                          }
                          for (let i = 0; i < hub_array.length; i++) {
                            const element = hub_array[i];
                            monthTotal += element.Views;
                            monthAvg += element.Hubs;
                            html += "<tr>"
                            html += "<td>" + element.view_date + "</td>"
                            html += "<td>" + element.Views + "</td>"
                            html += "<td>" + element.Sessions + "</td>"
                            html += "<td>" + element.percentage + "%</td>"
                            html += "<td>" + element.wifi_started + "</td>"
                            html += "<td>" + element.Hubs + "</td>"
                            html += "<td>144</td>"
                            html += "</tr>"
                          }
                          monthAvg = Math.round(monthAvg / doc2.length)
                          for (let i = 0; i < doc3.length; i++) {
                            const element = doc3[i];
                            html += "<tr>"
                            html += "<td><b>" + element.Month + "</b></td>"
                            if (i == 0) {
                              html += "<td><b>" + monthTotal + "</b></td>"
                            } else {
                              html += "<td><b>" + element.Views + "</b></td>"
                            }
                            html += "<td><b>" + element.Sessions + "</b></td>"
                            html += "<td></td>"
                            html += "<td></td>"
                            html += "<td><b>" + element.Hubs + "</b></td>"
                            html += "<td>144</td>"
                            html += "</tr>"
                          }
                          // var html = "<html><head>"
                          // html += "<style>"
                          // html += "table {font-family: arial, sans-serif;border-collapse: collapse;width: 100%;}"
                          // html += "td, th {border: 1px solid #dddddd;text-align: left;padding: 8px;}"
                          // html += "tr:nth-child(even) {background-color: #dddddd;}</style></head>"
                          // html += "<h4>Dear Recipients,</h4>"
                          // html += "<h4>Please find below table for DAU.</h4><table>"
                          // html += "<thead><tr>"
                          // html += "<th>Box No</th><th>" + Last7Days[0] + "</th><th>" + Last7Days[1] + "</th>"
                          // html += "<th>" + Last7Days[2] + "</th><th>" + Last7Days[3] + "</th>"
                          // html += "<th>" + Last7Days[4] + "</th><th>" + Last7Days[5] + "</th><th>" + Last7Days[6] + "</th><th>Total</th>"
                          // html += "</tr></thead><tbody>"
                          // let col0 = 0;
                          // let col1 = 0;
                          // let col2 = 0;
                          // let col3 = 0;
                          // let col4 = 0;
                          // let col5 = 0;
                          // let col6 = 0;
                          // let finalSum = 0;
                          // for (let index = 0; index < finalArr.length; index++) {
                          //   const element = finalArr[index];
                          //   col0 = col0 + element[Last7Days[0]];
                          //   col1 = col1 + element[Last7Days[1]];
                          //   col2 = col2 + element[Last7Days[2]];
                          //   col3 = col3 + element[Last7Days[3]];
                          //   col4 = col4 + element[Last7Days[4]];
                          //   col5 = col5 + element[Last7Days[5]];
                          //   col6 = col6 + element[Last7Days[6]];
                          //   html += "<tr>"
                          //   html += "<td><b>" + element.vehicle_no + "</b></td>"
                          //   html += "<td>" + element[Last7Days[0]] + "</td>"
                          //   html += "<td>" + element[Last7Days[1]] + "</td>"
                          //   html += "<td>" + element[Last7Days[2]] + "</td>"
                          //   html += "<td>" + element[Last7Days[3]] + "</td>"
                          //   html += "<td>" + element[Last7Days[4]] + "</td>"
                          //   html += "<td>" + element[Last7Days[5]] + "</td>"
                          //   html += "<td>" + element[Last7Days[6]] + "</td>"
                          //   html += "<td><b>" + element.rowSum + "</b></td>"
                          //   html += "</tr>"
                          // }
                          // finalSum = col0 + col1 + col2 + col3 + col4 + col5 + col6;
                          // html += "<tr><td><b>Total</b></td><td><b>" + col0 + "</b></td><td><b>" + col1 + "</b></td><td><b>" + col2 + "</b></td>"
                          // html += "<td><b>" + col3 + "</b></td><td><b>" + col4 + "</b></td>"
                          // html += "<td><b>" + col5 + "</b></td><td><b>" + col6 + "</b></td><td><b>" + finalSum + "</b></td></tr>";
                          // html += "</tbody></table>";
                          // html += "<h4>Please find below table for file played.</h4><table>"
                          // html += "<thead><tr>"
                          // html += "<th>Box No</th><th>" + Last7Days[0] + "</th><th>" + Last7Days[1] + "</th>"
                          // html += "<th>" + Last7Days[2] + "</th><th>" + Last7Days[3] + "</th>"
                          // html += "<th>" + Last7Days[4] + "</th><th>" + Last7Days[5] + "</th><th>" + Last7Days[6] + "</th><th>Total</th>"
                          // html += "</tr></thead><tbody>"
                          // let col7 = 0;
                          // let col8 = 0;
                          // let col9 = 0;
                          // let col10 = 0;
                          // let col11 = 0;
                          // let col12 = 0;
                          // let col13 = 0;
                          // let usageSum = 0;
                          // for (let index = 0; index < usageArr.length; index++) {
                          //   const element = usageArr[index];
                          //   col7 = col7 + element[Last7Days[0]];
                          //   col8 = col8 + element[Last7Days[1]];
                          //   col9 = col9 + element[Last7Days[2]];
                          //   col10 = col10 + element[Last7Days[3]];
                          //   col11 = col11 + element[Last7Days[4]];
                          //   col12 = col12 + element[Last7Days[5]];
                          //   col13 = col13 + element[Last7Days[6]];
                          //   html += "<tr>"
                          //   html += "<td><b>" + element.vehicle_no + "</b></td>"
                          //   html += "<td>" + element[Last7Days[0]] + "</td>"
                          //   html += "<td>" + element[Last7Days[1]] + "</td>"
                          //   html += "<td>" + element[Last7Days[2]] + "</td>"
                          //   html += "<td>" + element[Last7Days[3]] + "</td>"
                          //   html += "<td>" + element[Last7Days[4]] + "</td>"
                          //   html += "<td>" + element[Last7Days[5]] + "</td>"
                          //   html += "<td>" + element[Last7Days[6]] + "</td>"
                          //   html += "<td><b>" + element.rowSum + "</b></td>"
                          //   html += "</tr>"
                          // }
                          // usageSum = col7 + col8 + col9 + col10 + col11 + col12 + col13;
                          // html += "<tr><td><b>Total</b></td><td><b>" + col7 + "</b></td><td><b>" + col8 + "</b></td><td><b>" + col9 + "</b></td>"
                          // html += "<td><b>" + col10 + "</b></td><td><b>" + col11 + "</b></td>"
                          // html += "<td><b>" + col12 + "</b></td><td><b>" + col13 + "</b></td><td><b>" + usageSum + "</b></td></tr>";
                          html += "</tbody></table>";
                          html += "<br><br><h5>Thanks & Regards</h5><h5>Mobi Sign Pvt Ltd.</h5></html>"
                          let subject = "Spicescreen Usage Report"
                          // var email = 'manoj.gupta@mobisign.co.in,deepak.kumar@mobisign.co.in,monali.monalisa@mobisign.co.in,product@mobisign.co.in,ashyin.thakral@mobisign.co.in,kedargdr@gmail.com'
                          //var email = 'anurag.kumar@spicejet.com,puneet.angrish@spicejet.com,sapna.kumar@spicejet.com,jitendra.gautam@spicejet.com,prashant.mishra4@spicejet.com,sushant.madhab@spicejet.com,manoj.gupta@mobisign.co.in,deepak.kumar@mobisign.co.in,monali.monalisa@mobisign.co.in,product@mobisign.co.in,ashyin.thakral@mobisign.co.in,kedargdr@gmail.com,amajit.das@spicejet.com,nidhi.sinha@spicejet.com,vishal.garg@mobisign.co.in,tushar.mehta@mobisign.co.in'
                          var email = 'vishal.garg@mobisign.co.in'
                          EM.dispatchEmail(email, subject, html, "count", function (e) {
                            console.log(e)
                          })
                        }
                      })
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  })
}

/*  Get Daily Email with last seven days file payed.
    @Authentication ----> by session key
    @Authorization ----> Access Controll Logic
    Author : Kedar Gadre
    Date : 03/08/2020
    Modified_by : Kedar Gadre
    Modification Date : 03/08/2020
*/
exports.playEmailCron = function () {
  let d = new Date();
  let d1 = d.setDate(d.getDate() - 1);
  let d2 = d.setDate(d.getDate() - 6);
  d1 = moment(d1).format('YYYY-MM-DD').toString();
  d2 = moment(d2).format('YYYY-MM-DD').toString();
  let query = "SELECT vc.title as vehicle_no, vst.sync_date, COUNT(1) COUNT"
    + " FROM vuscreen_tracker vst"
    + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = vr.reg_id"
    + " LEFT JOIN vuscreen_content_package vc ON vst.view_id = vc.content_id"
    + " WHERE vst.sync_date>='" + d2 + "' AND vst.sync_date<='" + d1 + "' AND vr.vehicle_no NOT REGEXP '[A-Z ]' AND vst.type='video'"
    + " GROUP BY vc.title, vst.sync_date"
    + " ORDER BY vst.sync_date, vc.title"
  db.get().query(query, function (err, dataArray) {
    if (err) {
      console.log(err)
    } else {
      let userMap = new Map();
      function formatDate(date) {
        let dd = date.getDate();
        let mm = date.getMonth() + 1;
        let yyyy = date.getFullYear();
        if (dd < 10) { dd = '0' + dd }
        if (mm < 10) { mm = '0' + mm }
        date = yyyy + '-' + mm + '-' + dd;
        return date
      }
      let Last7Days = [];
      let obj = {}
      for (let i = 0; i < 7; i++) {
        let d = new Date();
        d.setDate(d.getDate() - i - 1);
        Last7Days.push(formatDate(d))
        let da = formatDate(d)
        obj[da] = 0;
        obj["rowSum"] = 0;
      }

      Last7Days.reverse().join(',');
      let finalArr = []
      for (let i = 0; i < dataArray.length; i++) {
        const element = dataArray[i];
        if (!userMap.has(element.vehicle_no)) {
          let arr = []
          arr.push(element)
          let kg = Object.assign({ vehicle_no: element.vehicle_no }, obj)
          finalArr.push(kg)
          userMap.set(element.vehicle_no, arr)
          // if (i == 0) {
          //     let kg = Object.assign({ vehicle_no: "total" }, obj)
          //     finalArr.push(kg)
          // }

        } else {
          let arr = userMap.get(element.vehicle_no)
          arr.push(element)
          userMap.set(element.vehicle_no, arr)
        }
        if (dataArray.length == i + 1) {
          userMap.forEach((value, key, map, index) => {
            for (let d = 0; d < finalArr.length; d++) {
              const data = finalArr[d];
              let count = 0;
              for (let val = 0; val < value.length; val++) {
                const obj = value[val];
                if (obj["vehicle_no"] == data.vehicle_no) {
                  count = count + parseInt(obj.COUNT)
                  data[obj.sync_date] = obj.COUNT
                  data["rowSum"] = count;
                }
              }
            }
          });
        }
      }
      finalArr.sort((a, b) => b.rowSum - a.rowSum)
      var html = "<html><head>"
      html += "<style>"
      html += "table {font-family: arial, sans-serif;border-collapse: collapse;width: 100%;}"
      html += "td, th {border: 1px solid #dddddd;text-align: left;padding: 8px;}"
      html += "tr:nth-child(even) {background-color: #dddddd;}</style></head>"
      html += "<h4>Dear Recipients,</h4>"
      html += "<h4>Please find below table for file played.</h4><table>"
      html += "<thead><tr>"
      html += "<th>Title</th><th>" + Last7Days[0] + "</th><th>" + Last7Days[1] + "</th>"
      html += "<th>" + Last7Days[2] + "</th><th>" + Last7Days[3] + "</th>"
      html += "<th>" + Last7Days[4] + "</th><th>" + Last7Days[5] + "</th><th>" + Last7Days[6] + "</th><th>Total</th>"
      html += "</tr></thead><tbody>"
      let col0 = 0;
      let col1 = 0;
      let col2 = 0;
      let col3 = 0;
      let col4 = 0;
      let col5 = 0;
      let col6 = 0;
      let finalSum = 0;
      for (let index = 0; index < finalArr.length; index++) {
        const element = finalArr[index];
        col0 = col0 + element[Last7Days[0]];
        col1 = col1 + element[Last7Days[1]];
        col2 = col2 + element[Last7Days[2]];
        col3 = col3 + element[Last7Days[3]];
        col4 = col4 + element[Last7Days[4]];
        col5 = col5 + element[Last7Days[5]];
        col6 = col6 + element[Last7Days[6]];
        html += "<tr>"
        html += "<td><b>" + element.vehicle_no + "</b></td>"
        html += "<td>" + element[Last7Days[0]] + "</td>"
        html += "<td>" + element[Last7Days[1]] + "</td>"
        html += "<td>" + element[Last7Days[2]] + "</td>"
        html += "<td>" + element[Last7Days[3]] + "</td>"
        html += "<td>" + element[Last7Days[4]] + "</td>"
        html += "<td>" + element[Last7Days[5]] + "</td>"
        html += "<td>" + element[Last7Days[6]] + "</td>"
        html += "<td><b>" + element.rowSum + "</b></td>"
        html += "</tr>"
      }
      finalSum = col0 + col1 + col2 + col3 + col4 + col5 + col6;
      html += "<tr><td><b>Total</b></td><td><b>" + col0 + "</b></td><td><b>" + col1 + "</b></td><td><b>" + col2 + "</b></td>"
      html += "<td><b>" + col3 + "</b></td><td><b>" + col4 + "</b></td>"
      html += "<td><b>" + col5 + "</b></td><td><b>" + col6 + "</b></td><td><b>" + finalSum + "</b></td></tr>";
      html += "</tbody></table>";
      html += "<br><br><h5>Thanks & Regards</h5><h5>Mobi Sign Pvt Ltd.</h5></html>"
      let subject = "Video Content Ranking Report"
      let email = 'kedargdr@gmail.com,manoj.gupta@mobisign.co.in,deepak.kumar@mobisign.co.in,monali.monalisa@mobisign.co.in,ashyin.thakral@mobisign.co.in,product@mobisign.co.in,vishal.garg@mobisign.co.in,tushar.mehta@mobisign.co.in'
      // let email = 'kedargdr@gmail.com,deepak.kumar@mobisign.co.in'monali.monalisa@mobisign.co.in,
      EM.dispatchEmail(email, subject, html, "play", function (e) {
        console.log(e)
      })
    }
  })
}

exports.monthly_usage = function (req, res) {
  var query = "SELECT DATE_FORMAT(sync_date, '%Y') YEAR, DATE_FORMAT(sync_date, '%m-%Y') MONTH, "
    + " COUNT(1) Views, COUNT(DISTINCT mac) Users, ROUND(SUM(view_duration/3600)) Duration"
    + " FROM vuscreen_tracker"
    + " WHERE DATE_FORMAT(sync_date, '%Y') > '2019'"
    + " GROUP BY MONTH"
    + " ORDER BY MONTH DESC";
  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(doc);
  })
};

exports.usage_bucket = async function (req, res) {
  function formatDate(date) {
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    let yyyy = date.getFullYear();
    if (dd < 10) { dd = '0' + dd }
    if (mm < 10) { mm = '0' + mm }
    date = yyyy + '-' + mm + '-' + dd;
    return date
  }
  let Last7Days = [];
  for (let i = 0; i < 7; i++) {
    let d = new Date();
    d.setDate(d.getDate() - i - 1);
    Last7Days.push(formatDate(d))
  }

  Last7Days.reverse().join(',');
  // const bucket = ["SUM(view_duration/60) >= 0 AND SUM(view_duration/60) <= 30",
  //   "SUM(view_duration/60) >= 31 AND SUM(view_duration/60) <= 60",
  //   "SUM(view_duration/60) >= 61 AND SUM(view_duration/60) <= 90",
  //   "SUM(view_duration/60) >= 91",
  //   "Total User",
  //   "Avg Time Spent",
  //   "Total Time Spent",
  //   "Total Host"
  // ]
  const bucket = ["Thirty",
    "Sixty",
    "Ninty",
    "Gninty",
    "TotalUser",
    "AvgTimeSpent",
    "TotalTimeSpent",
    "TotalHost"
  ]
  const finalResult = []
  let bucketMap = new Map();
  for (let i = 0; i < Last7Days.length; i++) {
    const element = Last7Days[i];
    let obj = { "date": element };
    for (let j = 0; j < bucket.length; j++) {
      let query = ""
      if (bucket[j] == "Thirty") {
        try {
          query = "SELECT mac,ROUND(SUM(view_duration/60)) duration "
            + " FROM vuscreen_tracker"
            + " WHERE sync_date = '" + element + "' AND mac!= ''"
            + " GROUP BY mac"
            + " HAVING SUM(view_duration/60) >= 0 AND SUM(view_duration/60) <= 30";
          db.get().query(query, function (err, data) {
            if (!err) {
              obj[bucket[j]] = data.length;
            } else {
              console.log(err)
            }
          })
        } catch (error) {
          console.log(error)
        }
      }
      else if (bucket[j] == "Sixty") {
        try {
          query = "SELECT mac,ROUND(SUM(view_duration/60)) duration "
            + " FROM vuscreen_tracker"
            + " WHERE sync_date = '" + element + "' AND mac!= ''"
            + " GROUP BY mac"
            + " HAVING SUM(view_duration/60) >= 31 AND SUM(view_duration/60) <= 60";
          db.get().query(query, function (err, data) {
            if (!err) {
              obj[bucket[j]] = data.length;
            } else {
              console.log(err)
            }
          })
        } catch (error) {
          console.log(error)
        }
      } else if (bucket[j] == "Ninty") {
        try {
          query = "SELECT mac,ROUND(SUM(view_duration/60)) duration "
            + " FROM vuscreen_tracker"
            + " WHERE sync_date = '" + element + "' AND mac!= ''"
            + " GROUP BY mac"
            + " HAVING SUM(view_duration/60) >= 61 AND SUM(view_duration/60) <= 90";
          db.get().query(query, function (err, data) {
            if (!err) {
              obj[bucket[j]] = data.length;
            } else {
              console.log(err)
            }
          })
        } catch (error) {
          console.log(error)
        }
      } else if (bucket[j] == "Gninty") {
        try {
          query = "SELECT mac,ROUND(SUM(view_duration/60)) duration "
            + " FROM vuscreen_tracker"
            + " WHERE sync_date = '" + element + "' AND mac!= ''"
            + " GROUP BY mac"
            + " HAVING SUM(view_duration/60) >= 91";
          db.get().query(query, function (err, data) {
            if (!err) {
              obj[bucket[j]] = data.length;
            } else {
              console.log(err)
            }
          })
        } catch (error) {
          console.log(error)
        }
      } else if (bucket[j] == "TotalUser") {
        try {
          query = "SELECT COUNT(DISTINCT mac) users from vuscreen_tracker WHERE sync_date = '" + element + "' AND mac!= ''"
          db.get().query(query, function (err, data) {
            if (!err) {
              obj[bucket[j]] = data[0].users;
            } else {
              console.log(err)
            }
          })
        } catch (error) {
          console.log(error)
        }
      } else if (bucket[j] == "AvgTimeSpent") {
        try {
          query = "SELECT ROUND(Sum(view_duration/60)/COUNT(DISTINCT mac),2) avg_time from vuscreen_tracker WHERE sync_date = '" + element + "' AND mac!= ''"
          db.get().query(query, function (err, data) {
            if (!err) {
              obj[bucket[j]] = data[0].avg_time;

            } else {
              console.log(err)
            }
          })
        } catch (error) {
          console.log(error)
        }
      } else if (bucket[j] == "TotalTimeSpent") {
        try {
          query = "SELECT ROUND(Sum(view_duration/60),2) total_time from vuscreen_tracker WHERE sync_date = '" + element + "' AND mac!= ''"
          db.get().query(query, function (err, data) {
            if (!err) {
              obj[bucket[j]] = data[0].total_time;
            } else {
              console.log(err)
            }
          })
        } catch (error) {
          console.log(error)
        }
      } else {
        try {
          query = "SELECT COUNT(DISTINCT device_id) total_host from vuscreen_tracker WHERE sync_date = '" + element + "' AND device_id!= ''"
          db.get().query(query, function (err, data) {
            if (!err) {
              obj[bucket[j]] = data[0].total_host;
            } else {
              console.log(err)
            }
          })
        } catch (error) {
          console.log(error)
        }
      }
      if (j + 1 == bucket.length) {
        finalResult.push(obj)

      }
    }

    if (i + 1 == Last7Days.length) {
      setTimeout(() => {
        return res.status(200).json(`finalResult`);
      }, 12000);
      //return res.status(200).json(finalResult);

    }
  }
  // for (let index = 0; index < bucketMap.length; index++) {
  //   const element = bucketMap[index];
  //   console.log(element)
  // }
  //setTimeout(() => {
  //  return res.status(200).json(finalResult);
  //}, 10000);

};

//////////////   /
exports.dauEmailTempCron = function () {
  // var daussEmailCron = function () {
  let d = new Date();
  let d1 = d.setDate(d.getDate() - 1);
  let d2 = d.setDate(d.getDate() - 6);
  d1 = moment(d1).format('YYYY-MM-DD').toString();
  d2 = moment(d2).format('YYYY-MM-DD').toString();
  d1 = d1 + " 06:10:00";
  d2 = d2 + " 06:10:00";
  var firstDate = moment(new Date()).format('YYYY-MM') + '-01';
  var data1 = "(";
  var data2 = [];
  var data3 = [];
  var hubused = 0;
  var host1count = 0;
  var host2count = 0;
  console.log(d1);
  console.log(firstDate);
  let queryy = "SELECT  host1, host2 FROM spicescreen.vuscreen_ife_data WHERE date <= '" + d1 + "' AND date >= '" + firstDate + "'";
  db.get().query(queryy, function (error, dataArrays) {
    if (error) {
      console.log(error)
    } else {

      data2 = dataArrays;
      // console.log(data2);

      for (let index = 0; index < data2.length; index++) {
        var element = data2[index];
        host1count = 0;
        host2count = 0;
        // console.log(element);
        for (let i = 0; i < data3.length; i++) {
          // console.log(element.host1);
          // console.log(data3[i]);
          if (element.host1 == data3[i]) {
            // console.log("dfadh");
            // console.log(element.host1);
            // console.log(data3[i]);
            // console.log("dfahkf");
            host1count = 1;
          }
          if (element.host2 == data3[i]) {
            host2count = 1;
          }
        }

        if (host1count == 0) {

          data1 += (element.host1.toString());

          data1 += ',';
          data3.push(element.host1);
        }
        if (host2count == 0) {
          data1 += (element.host2.toString());
          if (index != data2.length - 1) {
            data1 += ',';
            data3.push(element.host2);
          }

        }
        // console.log(data3);
        if (index == data2.length - 1) {
          let abc = data1.length - 1;
          // console.log(data1[abc]);
          if (data1[abc] == ',') {
            let data4 = data1.slice(0, -1) + ')';
            data1 = data4;
          }
          else
            data1 += ')';

        }
      }
      console.log(data1);
      let val = data1.split(',');
      hubused = val.length;
      var hubpro = 178;
      let querys = "SELECT  count(distinct host1) as host1, count(distinct host2)as host2,date FROM spicescreen.vuscreen_ife_data WHERE date <= '" + d1 + "' AND date >= '" + firstDate + "' group by date";
      db.get().query(querys, function (error, dataArr) {
        if (error) {
          console.log(error)
        } else {
          console.log(dataArr);
          let query = "SELECT vr.vehicle_no as HostID, vst.view_date, COUNT(DISTINCT vst.mac) COUNT"
            + " FROM vuscreen_tracker vst"
            + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = vr.reg_id"
            + " WHERE vst.view_date >= '" + d2 + "' AND vst.view_date <= '" + d1 + "'"
            + " AND vr.vehicle_no In " + data1 + " "
            // + " AND vr.vehicle_no NOT REGEXP '[A-Z ]'"
            + " GROUP BY vr.vehicle_no, vst.view_date"
            + " ORDER BY vst.view_date, vr.vehicle_no";
          db.get().query(query, function (error, dataArray) {
            if (error) {
              console.log(error)
            } else {
              // console.log(query)
              // console.log(dataArray);
              let query1 = "SELECT vr.vehicle_no as HostID, vst.view_date, COUNT(1) COUNT"
                + " FROM vuscreen_tracker vst"
                + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = vr.reg_id"
                + " WHERE vst.view_date >= '" + d2 + "' AND vst.view_date <= '" + d1 + "'"
                + " AND vst.type = 'video'"
                + " AND vr.vehicle_no In " + data1 + " "
                + " GROUP BY vr.vehicle_no, vst.view_date"
                + " ORDER BY vst.view_date, vr.vehicle_no"
              db.get().query(query1, function (err, doc) {
                if (err) { console.log(err); }
                else {

                  // console.log(doc);
                  let query2 = "SELECT vst.view_date, COUNT(1) Views, COUNT(DISTINCT vst.mac) Sessions, ROUND(COUNT(DISTINCT vst.device_id)/ '" + hubpro + "' * 100) AS 'percentage',"
                    + " COUNT(DISTINCT vst.device_id) Hubs"
                    + " FROM vuscreen_tracker vst"
                    + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = "
                    + " vr.reg_id"
                    + " WHERE  vst.view_date >= '" + firstDate + "' AND vst.view_date <= '" + d1 + "'"
                    + " AND vr.vehicle_no In " + data1 + " "
                    // + " AND vr.vehicle_no NOT REGEXP '[A-Z ]'"
                    + " GROUP BY vst.view_date"
                  db.get().query(query2, function (err2, doc2) {
                    if (err2) { console.log(err2); }
                    else {
                      let query4 = "SELECT vr.vehicle_no as HostID, vst.view_date, COUNT(1) COUNT"
                        + " FROM vuscreen_tracker vst"
                        + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = vr.reg_id"
                        + " WHERE vst.view_date >= '" + d2 + "' AND vst.view_date <= '" + d1 + "'"
                        + " AND vr.vehicle_no In " + data1 + " "
                        + " AND vst.type = 'zip'"
                        + " GROUP BY vr.vehicle_no, vst.view_date"
                        + " ORDER BY vst.view_date, vr.vehicle_no"
                      db.get().query(query4, function (err4, doc4) {
                        if (err4) { console.log(err4); }
                        else {
                          let query3 = "SELECT DATE_FORMAT(vst.view_date, '%Y-%m') YEAR , DATE_FORMAT(vst.view_date, '%M-%y') Month,"
                            + " COUNT(1) Views, COUNT(DISTINCT vst.mac) Sessions, ROUND(COUNT(DISTINCT vst.device_id)/'" + hubpro + "' * 100) AS percentage,"
                            + " COUNT(DISTINCT vst.device_id) Hubs"
                            + " FROM vuscreen_tracker vst"
                            + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = "
                            + "  vr.reg_id"
                            + " WHERE "
                            + " vr.vehicle_no In " + data1 + " "
                            // + " vr.vehicle_no NOT REGEXP '[A-Z ]'"
                            + " GROUP BY MONTH ORDER BY YEAR DESC LIMIT 2"
                          db.get().query(query3, function (err3, doc3) {
                            if (err3) { console.log(err3); }
                            else {
                              let query5 = "SELECT vst.view_date, COUNT(DISTINCT vst.device_id) wifi_started, ROUND(COUNT(DISTINCT vst.device_id)/'" + hubpro + "' * 100) AS 'percentage'"
                                + " FROM vuscreen_events vst"
                                + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = "
                                + " vr.reg_id"
                                + " WHERE vst.view_date >= '" + firstDate + "' AND vst.view_date <= '" + d1 + "'"
                                + " AND vr.vehicle_no In " + data1 + " "
                                + " GROUP BY vst.view_date"
                              db.get().query(query5, function (err5, doc5) {
                                if (err5) { console.log(err5); }
                                else {
                                  let userMap = new Map();
                                  let usageMap = new Map();
                                  let gameMap = new Map();

                                  function formatDate(date) {
                                    let dd = date.getDate();
                                    let mm = date.getMonth() + 1;
                                    let yyyy = date.getFullYear();
                                    if (dd < 10) { dd = '0' + dd }
                                    if (mm < 10) { mm = '0' + mm }
                                    date = yyyy + '-' + mm + '-' + dd;
                                    return date
                                  }
                                  let Last7Days = [];
                                  let obj = {}
                                  let usageobj = {}
                                  let gameobj = {}

                                  for (let i = 0; i < 7; i++) {
                                    let d = new Date();
                                    d.setDate(d.getDate() - i - 1);
                                    Last7Days.push(formatDate(d))
                                    let da = formatDate(d)
                                    obj[da] = 0;
                                    obj["rowSum"] = 0;
                                    usageobj[da] = 0;
                                    usageobj["rowSum"] = 0;
                                    gameobj[da] = 0;
                                    gameobj["rowSum"] = 0;


                                  }

                                  Last7Days.reverse().join(',');
                                  let finalArr = []
                                  let usageArr = []
                                  let gameArr = []

                                  for (let i = 0; i < dataArray.length; i++) {
                                    const element = dataArray[i];
                                    if (!userMap.has(element.HostID)) {
                                      let arr = []
                                      arr.push(element)
                                      let kg = Object.assign({ HostID: element.HostID }, obj)
                                      finalArr.push(kg)
                                      userMap.set(element.HostID, arr)
                                      // if (i == 0) {
                                      //     let kg = Object.assign({ vehicle_no: "total" }, obj)
                                      //     finalArr.push(kg)
                                      // }

                                    } else {
                                      let arr = userMap.get(element.HostID)
                                      arr.push(element)
                                      userMap.set(element.HostID, arr)
                                    }
                                    if (dataArray.length == i + 1) {
                                      userMap.forEach((value, key, map, index) => {
                                        for (let d = 0; d < finalArr.length; d++) {
                                          const data = finalArr[d];
                                          let count = 0;
                                          for (let val = 0; val < value.length; val++) {
                                            const obj = value[val];
                                            if (obj["HostID"] == data.HostID) {
                                              count = count + parseInt(obj.COUNT)
                                              data[obj.view_date] = obj.COUNT
                                              data["rowSum"] = count;
                                            }
                                          }
                                        }
                                      });
                                    }
                                  }

                                  for (let i = 0; i < doc.length; i++) {
                                    const element = doc[i];
                                    if (!usageMap.has(element.HostID)) {
                                      let arr = []
                                      arr.push(element)
                                      let kg = Object.assign({ HostID: element.HostID }, usageobj)
                                      usageArr.push(kg)
                                      usageMap.set(element.HostID, arr)
                                      // if (i == 0) {
                                      //     let kg = Object.assign({ vehicle_no: "total" }, obj)
                                      //     finalArr.push(kg)
                                      // }

                                    } else {
                                      let arr = usageMap.get(element.HostID)
                                      arr.push(element)
                                      usageMap.set(element.HostID, arr)
                                    }
                                    if (doc.length == i + 1) {
                                      usageMap.forEach((value, key, map, index) => {
                                        for (let d = 0; d < usageArr.length; d++) {
                                          const data = usageArr[d];
                                          let count = 0;
                                          for (let val = 0; val < value.length; val++) {
                                            const obj = value[val];
                                            if (obj["HostID"] == data.HostID) {
                                              count = count + parseInt(obj.COUNT)
                                              data[obj.view_date] = obj.COUNT
                                              data["rowSum"] = count;
                                            }
                                          }
                                        }
                                      });
                                    }
                                  }

                                  for (let i = 0; i < doc4.length; i++) {
                                    const element = doc4[i];
                                    if (!gameMap.has(element.HostID)) {
                                      let arr = []
                                      arr.push(element)
                                      let kg = Object.assign({ HostID: element.HostID }, gameobj)
                                      gameArr.push(kg)
                                      gameMap.set(element.HostID, arr)
                                      // if (i == 0) {
                                      //     let kg = Object.assign({ vehicle_no: "total" }, obj)
                                      //     finalArr.push(kg)
                                      // }

                                    } else {
                                      let arr = gameMap.get(element.HostID)
                                      arr.push(element)
                                      gameMap.set(element.HostID, arr)
                                    }
                                    if (doc4.length == i + 1) {
                                      gameMap.forEach((value, key, map, index) => {
                                        for (let d = 0; d < gameArr.length; d++) {
                                          const data = gameArr[d];
                                          let count = 0;
                                          for (let val = 0; val < value.length; val++) {
                                            const obj = value[val];
                                            if (obj["HostID"] == data.HostID) {
                                              count = count + parseInt(obj.COUNT)
                                              data[obj.view_date] = obj.COUNT
                                              data["rowSum"] = count;
                                            }
                                          }
                                        }
                                      });
                                    }
                                  }

                                  finalArr.sort((a, b) => b.rowSum - a.rowSum)
                                  usageArr.sort((a, b) => b.rowSum - a.rowSum)
                                  gameArr.sort((a, b) => b.rowSum - a.rowSum)
                                  var fields = ["HostID", Last7Days[0], Last7Days[1], Last7Days[2], Last7Days[3], Last7Days[4], Last7Days[5], Last7Days[6], 'rowSum'];
                                  var csvDau = json2csv({ data: finalArr, fields: fields });
                                  var csvPlay = json2csv({ data: usageArr, fields: fields });
                                  var csvGame = json2csv({ data: gameArr, fields: fields });
                                  var array = []
                                  array.push({ key: 'Last7DaysDau', value: csvDau }, { key: 'Last7DaysPlay', value: csvPlay }, { key: 'Last7DaysGame', value: csvGame })
                                  for (var i = 0; i < array.length; i++) {
                                    fs.writeFile(config.root + '/server/api/vuscreen/' + array[i].key + '.csv', array[i].value, function (err) {
                                      if (err) {
                                        throw err;
                                      } else {
                                        console.log('file saved');
                                      }
                                    });
                                  }
                                  var html = "<html><head>"
                                  html += "<style>"
                                  html += "table {font-family: arial, sans-serif;border-collapse: collapse;width: 100%;}"
                                  html += "td, th {border: 1px solid #dddddd;text-align: left;padding: 8px;}"
                                  html += "tr:nth-child(even) {background-color: #dddddd;}</style></head>"
                                  html += "<h4>Dear Recipients,</h4>"
                                  html += "<h4>Please find below report.</h4><table>"
                                  html += "<thead><tr>"
                                  html += "<th>Date</th>"
                                  html += "<th>Wi-Fi Hub Provided< (A)/th>"
                                  html += "<th>Wi-Fi Hub Placed BY EFB Team (B)</th>"
                                  html += "<th>Wi-Fi Hub Started (C)</th>"
                                  html += "<th>Wi-Fi Hub Used(D)</th>"
                                  html += " <th>Login Users(E)</th>"
                                  html += "<th>Clicks(F)</th>"
                                  html += "<th>% of Started VS Total Hub (C/A)</th>"
                                  html += "<th>% of Placed VS Provided(B/A)</th>"
                                  html += "</tr></thead><tbody>"
                                  let monthTotal = 0;
                                  let monthAvg = 0;
                                  let hub_array = JSON.parse(JSON.stringify(doc2))
                                  let synced_array = JSON.parse(JSON.stringify(doc5))
                                  for (let i = 0; i < hub_array.length; i++) {
                                    const element = hub_array[i];
                                    synced_array.map(item => {
                                      if (element.view_date == item.view_date) {
                                        element.percentage = item.percentage;
                                        element.wifi_started = item.wifi_started;
                                      }

                                    });
                                    for (let jk = 0; jk < dataArr.length; jk++) {
                                      if (element.view_date == dataArr[jk].date) {
                                        element.wifiplaced = parseInt(dataArr[jk].host1 + parseInt(dataArr[jk].host2));
                                        element.sync = Math.round((parseInt(dataArr[jk].host1 + parseInt(dataArr[jk].host2)) / hubpro * 100));
                                      }
                                    }
                                  }
                                  console.log(hub_array);
                                  for (let i = 0; i < hub_array.length; i++) {
                                    const element = hub_array[i];
                                    monthTotal += element.Views;
                                    monthAvg += element.Hubs;
                                    html += "<tr>"
                                    html += "<td>" + element.view_date + "</td>"
                                    html += "<td>" + hubpro + "</td>"
                                    html += "<td>" + element.wifiplaced + "</td>"
                                    html += "<td>" + element.wifi_started + "</td>"
                                    html += "<td>" + element.Hubs + "</td>"
                                    html += "<td>" + element.Sessions + "</td>"
                                    html += "<td>" + element.Views + "</td>"
                                    html += "<td>" + element.percentage + "%</td>"
                                    html += "<td>" + element.sync + "%</td>"
                                    html += "</tr>"
                                  }
                                  monthAvg = Math.round(monthAvg / doc2.length)
                                  for (let i = 0; i < doc3.length - 1; i++) {
                                    const element = doc3[i];
                                    html += "<tr>"
                                    html += "<td><b>" + element.Month + "</b></td>"
                                    html += "<td>" + hubpro + "</td>"
                                    html += "<td></td>"
                                    html += "<td></td>"
                                    html += "<td><b>" + element.Hubs + "</b></td>"
                                    if (i == 0) {
                                      html += "<td><b>" + monthTotal + "</b></td>"
                                    } else {
                                      html += "<td><b>" + element.Views + "</b></td>"
                                    }
                                    html += "<td><b>" + element.Sessions + "</b></td>"
                                    html += "<td></td>"
                                    html += "<td></td>"


                                    html += "</tr>"
                                  }
                                  // var html = "<html><head>"
                                  // html += "<style>"
                                  // html += "table {font-family: arial, sans-serif;border-collapse: collapse;width: 100%;}"
                                  // html += "td, th {border: 1px solid #dddddd;text-align: left;padding: 8px;}"
                                  // html += "tr:nth-child(even) {background-color: #dddddd;}</style></head>"
                                  // html += "<h4>Dear Recipients,</h4>"
                                  // html += "<h4>Please find below table for DAU.</h4><table>"
                                  // html += "<thead><tr>"
                                  // html += "<th>Box No</th><th>" + Last7Days[0] + "</th><th>" + Last7Days[1] + "</th>"
                                  // html += "<th>" + Last7Days[2] + "</th><th>" + Last7Days[3] + "</th>"
                                  // html += "<th>" + Last7Days[4] + "</th><th>" + Last7Days[5] + "</th><th>" + Last7Days[6] + "</th><th>Total</th>"
                                  // html += "</tr></thead><tbody>"
                                  // let col0 = 0;
                                  // let col1 = 0;
                                  // let col2 = 0;
                                  // let col3 = 0;
                                  // let col4 = 0;
                                  // let col5 = 0;
                                  // let col6 = 0;
                                  // let finalSum = 0;
                                  // for (let index = 0; index < finalArr.length; index++) {
                                  //   const element = finalArr[index];
                                  //   col0 = col0 + element[Last7Days[0]];
                                  //   col1 = col1 + element[Last7Days[1]];
                                  //   col2 = col2 + element[Last7Days[2]];
                                  //   col3 = col3 + element[Last7Days[3]];
                                  //   col4 = col4 + element[Last7Days[4]];
                                  //   col5 = col5 + element[Last7Days[5]];
                                  //   col6 = col6 + element[Last7Days[6]];
                                  //   html += "<tr>"
                                  //   html += "<td><b>" + element.vehicle_no + "</b></td>"
                                  //   html += "<td>" + element[Last7Days[0]] + "</td>"
                                  //   html += "<td>" + element[Last7Days[1]] + "</td>"
                                  //   html += "<td>" + element[Last7Days[2]] + "</td>"
                                  //   html += "<td>" + element[Last7Days[3]] + "</td>"
                                  //   html += "<td>" + element[Last7Days[4]] + "</td>"
                                  //   html += "<td>" + element[Last7Days[5]] + "</td>"
                                  //   html += "<td>" + element[Last7Days[6]] + "</td>"
                                  //   html += "<td><b>" + element.rowSum + "</b></td>"
                                  //   html += "</tr>"
                                  // }
                                  // finalSum = col0 + col1 + col2 + col3 + col4 + col5 + col6;
                                  // html += "<tr><td><b>Total</b></td><td><b>" + col0 + "</b></td><td><b>" + col1 + "</b></td><td><b>" + col2 + "</b></td>"
                                  // html += "<td><b>" + col3 + "</b></td><td><b>" + col4 + "</b></td>"
                                  // html += "<td><b>" + col5 + "</b></td><td><b>" + col6 + "</b></td><td><b>" + finalSum + "</b></td></tr>";
                                  // html += "</tbody></table>";
                                  // html += "<h4>Please find below table for file played.</h4><table>"
                                  // html += "<thead><tr>"
                                  // html += "<th>Box No</th><th>" + Last7Days[0] + "</th><th>" + Last7Days[1] + "</th>"
                                  // html += "<th>" + Last7Days[2] + "</th><th>" + Last7Days[3] + "</th>"
                                  // html += "<th>" + Last7Days[4] + "</th><th>" + Last7Days[5] + "</th><th>" + Last7Days[6] + "</th><th>Total</th>"
                                  // html += "</tr></thead><tbody>"
                                  // let col7 = 0;
                                  // let col8 = 0;
                                  // let col9 = 0;
                                  // let col10 = 0;
                                  // let col11 = 0;
                                  // let col12 = 0;
                                  // let col13 = 0;
                                  // let usageSum = 0;
                                  // for (let index = 0; index < usageArr.length; index++) {
                                  //   const element = usageArr[index];
                                  //   col7 = col7 + element[Last7Days[0]];
                                  //   col8 = col8 + element[Last7Days[1]];
                                  //   col9 = col9 + element[Last7Days[2]];
                                  //   col10 = col10 + element[Last7Days[3]];
                                  //   col11 = col11 + element[Last7Days[4]];
                                  //   col12 = col12 + element[Last7Days[5]];
                                  //   col13 = col13 + element[Last7Days[6]];
                                  //   html += "<tr>"
                                  //   html += "<td><b>" + element.vehicle_no + "</b></td>"
                                  //   html += "<td>" + element[Last7Days[0]] + "</td>"
                                  //   html += "<td>" + element[Last7Days[1]] + "</td>"
                                  //   html += "<td>" + element[Last7Days[2]] + "</td>"
                                  //   html += "<td>" + element[Last7Days[3]] + "</td>"
                                  //   html += "<td>" + element[Last7Days[4]] + "</td>"
                                  //   html += "<td>" + element[Last7Days[5]] + "</td>"
                                  //   html += "<td>" + element[Last7Days[6]] + "</td>"
                                  //   html += "<td><b>" + element.rowSum + "</b></td>"
                                  //   html += "</tr>"
                                  // }
                                  // usageSum = col7 + col8 + col9 + col10 + col11 + col12 + col13;
                                  // html += "<tr><td><b>Total</b></td><td><b>" + col7 + "</b></td><td><b>" + col8 + "</b></td><td><b>" + col9 + "</b></td>"
                                  // html += "<td><b>" + col10 + "</b></td><td><b>" + col11 + "</b></td>"
                                  // html += "<td><b>" + col12 + "</b></td><td><b>" + col13 + "</b></td><td><b>" + usageSum + "</b></td></tr>";
                                  html += "</tbody></table>";
                                  html += "<br><br><h5>Thanks & Regards</h5><h5>Mobi Sign Pvt Ltd.</h5></html>"
                                  let subject = "Spicescreen Usage Report"
                                  var email = 'manoj.gupta@mobisign.co.in,deepak.kumar@mobisign.co.in,monali.monalisa@mobisign.co.in,product@mobisign.co.in,ashyin.thakral@mobisign.co.in,kedargdr@gmail.com,vishal.garg@mobisign.co.in,tushar.mehta@mobisign.co.in,ataul.khan001@gmail.com'
                                  //var email = 'anurag.kumar@spicejet.com,puneet.angrish@spicejet.com,sapna.kumar@spicejet.com,jitendra.gautam@spicejet.com,prashant.mishra4@spicejet.com,sushant.madhab@spicejet.com,manoj.gupta@mobisign.co.in,deepak.kumar@mobisign.co.in,monali.monalisa@mobisign.co.in,product@mobisign.co.in,ashyin.thakral@mobisign.co.in,kedargdr@gmail.com,amajit.das@spicejet.com,nidhi.sinha@spicejet.com,vishal.garg@mobisign.co.in,tushar.mehta@mobisign.co.in'
                                  // var email = 'vishal.garg@mobisign.co.in,deepak.kumar@mobisign.co.in,tushar.mehta@mobisign.co.in'
                                  EM.dispatchEmail(email, subject, html, "count", function (e) {
                                    console.log(e)
                                  })
                                }
                              })
                            }
                          })
                        }
                      })
                    }
                  })
                }
              })
            }
          })
        }

      })

    }
  })
}
// daussEmailCron();



exports.vuscreen_analyticsReport = function (req, cb) {
  //  var vuscreen_analyticsReport = function (req, cb) {
  // console.log("vishal");
  var currentDate = moment(new Date()).format('YYYY-MM-DD');
  var d = new Date();

  d.setDate(d.getDate() - 1);
  var Yesterday = moment(d).format('YYYY-MM-DD').toString()
  var query = "SELECT "
    + "(SELECT SUM(play_duration) FROM spicescreen.vuscreen_tracker a JOIN spicescreen.vuscreen_content_package b ON a.view_id = b.content_id WHERE trackingDetails = 'video' AND sync_date = '" + Yesterday + "' ORDER BY a.id DESC) actual_time_video,"
    + " (SELECT sum(view_duration) FROM spicescreen.vuscreen_tracker a JOIN spicescreen.vuscreen_store_content b ON a.view_id = b.content_id WHERE trackingDetails = 'store' AND sync_date = '" + Yesterday + "'  ORDER BY a.id DESC) actual_time_game,"
    + " (SELECT count(distinct mac) FROM spicescreen.vuscreen_tracker a JOIN spicescreen.vuscreen_store_content b ON a.view_id = b.content_id WHERE trackingDetails = 'store' AND sync_date = '" + Yesterday + "'  ORDER BY a.id DESC) unique_user_game,"
    + "(SELECT  count(distinct mac) FROM spicescreen.vuscreen_tracker a JOIN spicescreen.vuscreen_content_package b ON a.view_id = b.content_id WHERE trackingDetails = 'video' AND sync_date = '" + Yesterday + "' ORDER BY a.id DESC) unique_user_video,"
    + " (SELECT count(distinct mac) FROM spicescreen.vuscreen_tracker where sync_date='" + Yesterday + "') unique_users,"
    + " (SELECT count(distinct a.journey_id)  FROM spicescreen.vuscreen_events a join vuscreen_registration b on a.device_id=b.device_id where a.sync_date='" + Yesterday + "' ) start_stop_cycle,"
    + "(SELECT COUNT(DISTINCT a.mac) AS uniqueUser FROM vuscreen_tracker AS a JOIN vuscreen_registration AS b ON a.device_id = b.device_id WHERE a.sync_date = '" + Yesterday + "')homePage_login,"
    + "(SELECT count(distinct device_id) FROM spicescreen.vuscreen_tracker WHERE sync_date='" + currentDate + "')today_sync,"
    + "(SELECT count(distinct device_id) FROM spicescreen.vuscreen_tracker WHERE sync_date='" + Yesterday + "')yest_sync"
  var query1 = " SELECT distinct  a.view_datetime,a.event,a.journey_id FROM spicescreen.vuscreen_events a JOIN vuscreen_registration b ON a.device_id = b.device_id WHERE a.sync_date = '" + Yesterday + "' and a.event!='download' and a.event!='charging' order by a.id desc ";
  var query2 = "SELECT menu, COUNT(1) count, COUNT(DISTINCT mac) AS mac FROM vuscreen_tracker AS a JOIN vuscreen_registration AS b ON a.device_id = b.device_id WHERE trackingDetails = 'click' AND a.sync_date = '" + Yesterday + "' AND menu IN ('WATCH' , 'FnB', 'STORE') GROUP BY a.menu order by menu";
  var query3 = "SELECT b.vehicle_no, count(distinct a.journey_id) as cycle FROM spicescreen.vuscreen_events a join vuscreen_registration b on a.device_id=b.device_id where a.sync_date='" + Yesterday + "' group by b.device_id";
  var query4 = "SELECT b.title, COUNT(1) count, COUNT(DISTINCT mac) users FROM spicescreen.vuscreen_tracker a LEFT JOIN vuscreen_fnb_content b ON a.view_id = b.content_id JOIN vuscreen_registration c ON a.device_id = c.device_id LEFT JOIN vuscreen_fnb_folders AS d ON b.folder_id = d.id WHERE a.sync_date = '" + Yesterday + "' AND a.menu LIKE '%f&b%' GROUP BY b.title ORDER BY COUNT(1) DESC LIMIT 5";
  //var option = { draw: req.query.draw, start: 0, length: 500 };
  db.get().query(query, function (error, doc) {
    if (error) {
      console.log(error)
    } else {
      db.get().query(query1, function (err, doc1) {
        if (err) { console.log(err); }
        else {
          db.get().query(query2, function (err2, doc2) {
            if (err2) { console.log(err2); }
            else {
              db.get().query(query3, function (err3, doc3) {
                if (err3) { console.log(err3); }
                else {
                  db.get().query(query4, function (err4, doc4) {
                    if (err4) { console.log(err4); }
                    else {
                      var html = "<html><head>"
                      html += "<style>"
                      html += "table {font-family: arial, sans-serif;border-collapse: collapse;width: 100%;}"
                      html += "td, th {border: 2px solid black;text-align: center;padding: 8px;}"
                      html += "tr:nth-child(even) {background-color: #dddddd;}</style></head>"
                      html += "<h4>Dear Recipients,</h4>"
                      html += "<h4>Please find below reports.</h4>"



                      var temp = 0
                      var startBattery = 0;
                      var startEvent = 0;
                      var stopBattery = 0;
                      var stopEvent = 0;
                      var bat = 0;
                      for (let i in doc1) {

                        let sp = doc1[i].event.split("|");

                        if (sp.length == 2) {
                          let bt = sp[1].split(":");
                          let bts = bt[1].split("%");
                          // console.log(bts)
                          stopBattery += parseInt(bts[0]);
                          stopEvent += 1;
                        }

                        else if (sp.length == 3) {
                          if (sp[2] != NaN) {

                            temp += parseInt(sp[2]);
                            let bt = sp[1].split(":");
                            let bts = bt[1].split("%");
                            // console.log(bts)
                            startBattery += parseInt(bts[0]);
                            startEvent += 1;
                          }


                        }

                      }

                      console.log(temp);
                      html += "<table>"
                      html += "<tbody>"

                      html += "<tr>"
                      html += "<td  colspan='2'><b>Actual </b></td>"
                      html += "<td colspan='2'><b>Prorated Monthly</b></td>"
                      html += "<td colspan='2'><b>Prorated Yearly</b></td>"
                      html += "</tr>"
                      html += "</tr>"

                      html += "<tr>"
                      html += "<td><b>Wifi Login  </b></td>"
                      html += "<td>" + temp + "</td>"
                      let mwpage = parseInt(temp) * 30;
                      html += "<td><b>Wifi Login </b></td>"
                      html += "<td>" + mwpage + "</td>"
                      let ywpage = parseInt(mwpage) * 12;
                      html += "<td><b> WifiLogin</b></td>"
                      html += "<td>" + ywpage + "</td>"
                      html += "</tr>"
                      html += "</tr>"



                      html += "<tr>"
                      html += "<td><b>Home Page Login</b></td>"
                      html += "<td>" + doc[0].homePage_login + "</td>"
                      let mHpage = parseInt(doc[0].homePage_login) * 30;
                      html += "<td><b>Home Page Login </b></td>"
                      html += "<td>" + mHpage + "</td>"
                      let yhpage = parseInt(mHpage) * 12;
                      html += "<td><b>Home Page Login </b></td>"
                      html += "<td>" + yhpage + "</td>"
                      html += "</tr>"


                      html += "<tr>"
                      html += "<td><b>Total FNB Click</b></td>"
                      html += "<td>" + doc2[0].count + "</td>"
                      let TFC = parseInt(doc2[0].count) * 30;
                      html += "<td><b>Total FNB Click</b></td>"
                      html += "<td>" + TFC + "</td>"
                      let TFCY = parseInt(TFC) * 12;
                      html += "<td><b>Total FNB Click</b></td>"
                      html += "<td>" + TFCY + "</td>"
                      html += "</tr>"

                      html += "<tr>"

                      html += "<td><b>Total FNB Unique Users</b></td>"
                      html += "<td>" + doc2[0].mac + "</td>"
                      let TFu = parseInt(doc2[0].mac) * 30;
                      html += "<td><b>Total FNB Unique Users</b></td>"
                      html += "<td>" + TFu + "</td>"
                      let TFuY = parseInt(TFu) * 12;
                      html += "<td><b>Total FNB Unique Users</b></td>"
                      html += "<td>" + TFuY + "</td>"
                      html += "</tr>"


                      let a = (parseInt(doc[0].actual_time_game))
                      let b = parseInt(doc[0].unique_user_game);
                      let At_game = ((a / 60) / b).toFixed(2);
                      let c = parseInt(doc[0].actual_time_video);
                      let d = parseInt(doc[0].unique_user_video);
                      let At_video = ((c / 60) / d).toFixed(2);


                      html += "<tr>"
                      html += "<td><b>Total Game Click</b></td>"
                      html += "<td>" + doc2[1].count + "</td>"
                      let Tgc = parseInt(doc2[1].count) * 30;
                      html += "<td><b>Total Game Click</b></td>"
                      html += "<td>" + Tgc + "</td>"
                      let TgcY = parseInt(Tgc) * 12;
                      html += "<td><b>Total Game Click</b></td>"
                      html += "<td>" + TgcY + "</td>"
                      html += "</tr>"


                      html += "<tr>"
                      html += "<td><b>Total Game Users</b></td>"
                      html += "<td>" + doc2[1].mac + "</td>"
                      let TgU = parseInt(doc2[1].mac) * 30;
                      html += "<td><b>Total Game Users</b></td>"
                      html += "<td>" + TgU + "</td>"
                      let TguY = parseInt(Tgc) * 12;
                      html += "<td><b>Total Game Users</b></td>"
                      html += "<td>" + TguY + "</td>"
                      html += "</tr>"

                      html += "<tr>"
                      html += "<td><b>Average Game duration/User</b></td>"
                      html += "<td>" + At_game + ' Min' + "</td>"
                      let TgUd = parseFloat(At_game) * 30;
                      html += "<td><b>Average Game duration/User</b></td>"
                      html += "<td>" + At_game + ' Min' + "</td>"
                      let TgUY = parseFloat(TgUd) * 12;
                      html += "<td><b>Average Game duration/User</b></td>"
                      html += "<td>" + At_game + ' Min' + "</td>"
                      html += "</tr>"


                      html += "<tr>"
                      html += "<td><b>Total Watch Click</b></td>"
                      html += "<td>" + doc2[2].count + "</td>"
                      let Twcd = parseInt(doc2[2].count) * 30;
                      html += "<td><b>Total Watch Click</b></td>"
                      html += "<td>" + Twcd + "</td>"
                      let TwcY = parseInt(Twcd) * 12;
                      html += "<td><b>Total Watch Click</b></td>"
                      html += "<td>" + TwcY + "</td>"
                      html += "</tr>"


                      html += "<tr>"
                      html += "<td><b>Total Watch Users</b></td>"
                      html += "<td>" + doc2[2].mac + "</td>"
                      let Twud = parseInt(doc2[2].mac) * 30;
                      html += "<td><b>Total Watch Users</b></td>"
                      html += "<td>" + Twud + "</td>"
                      let TwuY = parseInt(Twud) * 12;
                      html += "<td><b>Total Watch Users</</b></td>"
                      html += "<td>" + TwuY + "</td>"
                      html += "</tr>"



                      html += "<tr>"
                      html += "<td><b>Average Video Duration/User</b></td>"
                      html += "<td>" + At_video + ' Min' + "</td>"
                      let Awud = parseInt(doc2[2].mac) * 30;
                      html += "<td><b>Average Video Duration/User</b></td>"
                      html += "<td>" + At_video + ' Min' + "</td>"
                      let AwuY = parseInt(Awud) * 12;
                      html += "<td><b>Average Video Duration/User</b></td>"
                      html += "<td>" + At_video + ' Min' + "</td>"
                      html += "</tr>"



                      html += "</tbody></table>";
                      html += "<br>"
                      html += "<table>"
                      html += "<thead><tr>"
                      html += "<th colspan='4' > Host data</th>"
                      html += "</tr></thead><tbody>"






                      html += "<tr>"
                      html += "<td><b>Wifi Sync Today</b></td>"
                      html += "<td>" + doc[0].today_sync + "</td>"
                      html += "<td><b>Wifi Sync Yesterday</b></td>"
                      html += "<td>" + doc[0].yest_sync + "</td>"
                      html += "</tr>"

                      let sscAvg = parseInt(doc[0].start_stop_cycle) / parseInt(doc[0].today_sync);


                      html += "<tr>"
                      html += "<td><b>Start Stop Cycle</b></td>"
                      html += "<td>" + doc[0].start_stop_cycle + "</td>"
                      html += "<td><b>AVG Start Stop Cycle/Host </b></td>"
                      html += "<td>" + sscAvg.toFixed(2) + "</td>"
                      html += "</tr>"

                      // console.log(startEvent);
                      // console.log(startBattery);
                      // console.log(stopEvent);
                      // console.log(stopBattery);
                      let batteryStart = startBattery / startEvent;
                      let batteryStop = stopBattery / stopEvent;
                      let batteryDran = batteryStart - batteryStop;
                      console.log(batteryDran);


                      html += "<tr>"
                      html += "<td><b>Avg Battery Dranage</b></td>"
                      html += "<td>" + batteryDran.toFixed(2) + "</td>"
                      // html += "<td><b>AVG Start Stop Cycle/Host </b></td>"
                      // html += "<td>" + sscAvg.toFixed(2) + "</td>"
                      html += "</tr>"


                      html += "</tbody></table>";
                      html += "<br>"
                      html += "<table>"
                      html += "<thead><tr>"
                      html += "<th colspan='4' > Top 5 F&B</th>"
                      html += "</tr></thead><tbody>"
                      html += "<tr>"
                      html += "<th>Item</th>"
                      html += "<th>Total Clicks</th>"
                      html += "<th>Unique Users</th>"
                      html += "<th>Avg Clicks/User</th>"
                      html += "</tr></thead><tbody>"
                      for (let indexs = 0; indexs < doc4.length; indexs++) {
                        const elements = doc4[indexs];
                        html += "<tr>"

                        html += "<td><b>" + elements.title + "</b></td>"
                        html += "<td>" + elements.count + "</td>"
                        html += "<td>" + elements.users + "</td>"
                        html += "<td>" + (elements.count / elements.users).toFixed(2) + "</td>"
                        html += "</tr>"
                      }
                      html += "</tbody></table>";

                      html += "<br>"
                      html += "<table>"
                      html += "<thead><tr>"
                      html += "<th colspan='2' >Host Wise Start Stop</th>"
                      html += "</tr></thead><tbody>"
                      html += "<tr>"
                      html += "<th>Host </th>"
                      html += "<th>Start Stop Cycle</th>"
                      html += "</tr></thead><tbody>"
                      for (let indexs = 0; indexs < doc3.length; indexs++) {
                        const elements = doc3[indexs];
                        html += "<tr>"
                        html += "<td><b>" + elements.vehicle_no + "</b></td>"
                        html += "<td>" + elements.cycle + "</td>"

                        html += "</tr>"
                      }
                      html += "</tbody></table>";

                      html += "<br><br><h5>Thanks & Regards</h5><h5>Mobi Sign Pvt Ltd.</h5></html>"
                      let subject = "Spicescreen Analytics Report"
                      var email = 'manoj.gupta@mobisign.co.in,deepak.kumar@mobisign.co.in,monali.monalisa@mobisign.co.in,product@mobisign.co.in,ashyin.thakral@mobisign.co.in,kedargdr@gmail.com,vishal.garg@mobisign.co.in,tushar.mehta@mobisign.co.in,ataul.khan001@gmail.com'
                      //  var email = 'anurag.kumar@spicejet.com,puneet.angrish@spicejet.com,sapna.kumar@spicejet.com,jitendra.gautam@spicejet.com,prashant.mishra4@spicejet.com,sushant.madhab@spicejet.com,manoj.gupta@mobisign.co.in,deepak.kumar@mobisign.co.in,monali.monalisa@mobisign.co.in,product@mobisign.co.in,ashyin.thakral@mobisign.co.in,kedargdr@gmail.com,amajit.das@spicejet.com,nidhi.sinha@spicejet.com,'
                      // var email = 'vishal.garg@mobisign.co.in,deepak.kumar@mobisign.co.in,monali.monalisa@mobisign.co.in,kedargdr@gmail.com,tushar.mehta@mobisign.co.in'
                      // var email = 'vishal.garg@mobisign.co.in,tushar.mehta@mobisign.co.in'
                      EM.dispatchEmail(email, subject, html, "timeSpent", function (e) {
                        console.log(e)
                      })
                    }

                  })
                }
              })
            }
          })
        }
      })
    }
  })
};

// vuscreen_analyticsReport();
/*  Get server session details
    @Authentication ----> by session key
    @Authorization ----> Access Controll Logic
    Author : Kedar Gadre
    Date : 06/01/2021
*/
exports.serverSessionDetails = function (req, res) {
  var startDate, endDate;
  if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  let query = "SELECT distinct DATE_FORMAT(convert(ve.view_datetime,datetime), '%Y-%m-%d %H:%i') as ts ,ve.sync_date,vr.vehicle_no as HostID,ve.event"
    + " FROM vuscreen_events ve"
    + " LEFT JOIN vuscreen_registration vr ON ve.device_id = vr.device_id"
    + " WHERE ve.sync_date >= '" + startDate + "' AND ve.sync_date <= '" + endDate + "' AND ve.user = 'server'"
    + " AND ve.event NOT IN ('start', 'download', 'stop', 'delete') AND ve.event NOT Like 'charging%'"
    + " AND vr.vehicle_no != '' GROUP BY ve.view_datetime, vr.vehicle_no, ve.event ORDER BY ve.sync_datetime"
  console.log(query)
  db.get().query(query, function (error, dataArray) {
    if (error) {
      console.log(error)
    } else {
      let finalArr = []
      let dataObj = {
        sync_date: null, HostID: null, cycle: null, wifiLogin: null, start_date: null, start_time: null, start_battery: null,
        stop_date: null, stop_time: null, stop_battery: null, start_stop_duration: null, battery_consumed: null
      }
      let deviceMap = new Map();
      console.log(dataArray.length)
      for (let i = 0; i < dataArray.length; i++) {
        const element = dataArray[i];
        try {
          let eventType = element.event.split("|")[0]
          let batteryPer = element.event.split(":")[1].split("%")[0]
          let wifiLogin = element.event.split("% |")[1]
          if (dataObj.sync_date == null) {
            if (eventType.trim() == "start") {
              dataObj.sync_date = element.sync_date
              dataObj.HostID = element.HostID;
              var startDate = element.ts
              dataObj.start_date = element.ts.split(" ")[0]
              dataObj.start_time = element.ts.split(" ")[1]
              dataObj.start_battery = batteryPer + "%"
              dataObj.wifiLogin = wifiLogin
              if (deviceMap.has(element.sync_date + '_' + element.HostID)) {
                let value = deviceMap.get(element.sync_date + '_' + element.HostID)
                dataObj.cycle = value + 1
                deviceMap.set(element.sync_date + '_' + element.HostID, value + 1)
              } else {
                deviceMap.set(element.sync_date + '_' + element.HostID, 1)
                dataObj.cycle = 1
              }
            }
          } else {
            if (dataObj.HostID == element.HostID) {
              let endDate = element.ts
              dataObj.stop_date = element.ts.split(" ")[0]
              dataObj.stop_time = element.ts.split(" ")[1]
              dataObj.stop_battery = batteryPer + "%"
              dataObj.wifiLogin = wifiLogin
              // need to cal time duration & battery consumed
              let difference = diff_minutes(new Date(startDate), new Date(endDate))
              dataObj.start_stop_duration = difference
              let battery_consumed = dataObj.start_battery.replace("%", "") - dataObj.stop_battery.replace("%", "")
              dataObj.battery_consumed = battery_consumed + "%"
              finalArr.push(dataObj)
              dataObj = {
                sync_date: null, HostID: null, cycle: null, wifiLogin: null, start_date: null, start_time: null, start_battery: null,
                stop_date: null, stop_time: null, stop_battery: null, start_stop_duration: null, battery_consumed: null
              }
            }
          }
        } catch (error) {
          console.log(error)
        }
        
        if (i + 1 >= dataArray.length) {
          // return res.status(200).json(finalArr);
          setTimeout(() => {
            console.log("finalArr.length")
            console.log(finalArr.length)
            return res.status(200).json(finalArr);
          }, 12000);
        }
      }
      console.log(finalArr.length)
    }
  })
}

function diff_minutes(dt2, dt1) {
  var diff = (dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60;
  return Math.abs(Math.round(diff));

}




exports.wifi_login_view = function (req, res) {
  // var startDate = 'null', endDate = 'null';
  // if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  // if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var currentDate = moment(new Date()).format('YYYY-MM-DD');
  var d = new Date();

  d.setDate(d.getDate() - 1);
  var Yesterday = moment(d).format('YYYY-MM-DD').toString()
  var query = "SELECT distinct b.vehicle_no, a.event, a.view_datetime, a.journey_id,unique_mac_address FROM spicescreen.vuscreen_events a JOIN vuscreen_registration b ON a.device_id = b.device_id WHERE a.view_date = '"+Yesterday+"' AND a.event != 'download' AND a.event != 'charging' ORDER BY a.id DESC";
  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    else {


      var data = ""
      let wifiMap = new Map();
      let a =  []
      var count=0;
      for (let i = 0; i < doc.length; i++) {
        data += doc[i].unique_mac_address + ",";
        // console.log(doc[i].unique_mac_address)

        if (doc.length == i + 1) {
          var data1 = data.split(',');
          console.log(data1.length);

          for (let j = 0; j < data1.length; j++) {
            const element = data1[j];

            wifiMap.set(element, element)
           
            if (data1.length == j + 1) {
              console.log(wifiMap.size)
            count=wifiMap.size
              function logMapElements(value, key, map) {

                a.push({"macaddress":value})
                // console.log(`m[${key}] = ${value}`);
              }
              wifiMap.forEach(logMapElements);
            }
            
          }
          // console.log(wifiMap);
          // console.log(wifiMap.size)
        }
      }
      
      var fields = ["macaddress"];
      var csvDau = json2csv({ data: a, fields: fields });
      // console.log(csvDau);
      fs.writeFile(config.root + '/server/api/vuscreen/' +   'wifiloginview.csv', csvDau, function (err) {
        if (err) {
          throw err;
        } else {
          console.log('file saved');
        }
      });
     var  html = "Total WiFi Login:"+ count ;
      html += " According To Sync Date"
      let subject = "WiFI Login  Report"
          var email = 'manoj.gupta@mobisign.co.in,deepak.kumar@mobisign.co.in,vishal.garg@mobisign.co.in,tushar.mehta@mobisign.co.in,ataul.khan001@gmail.com'
          //var email = 'anurag.kumar@spicejet.com,puneet.angrish@spicejet.com,sapna.kumar@spicejet.com,jitendra.gautam@spicejet.com,prashant.mishra4@spicejet.com,sushant.madhab@spicejet.com,manoj.gupta@mobisign.co.in,deepak.kumar@mobisign.co.in,monali.monalisa@mobisign.co.in,product@mobisign.co.in,ashyin.thakral@mobisign.co.in,kedargdr@gmail.com,amajit.das@spicejet.com,nidhi.sinha@spicejet.com,vishal.garg@mobisign.co.in,tushar.mehta@mobisign.co.in'
          // var email = 'vishal.garg@mobisign.co.in,deepak.kumar@mobisign.co.in,tushar.mehta@mobisign.co.in'
          EM.dispatchEmail(email, subject, html, "wifiview", function (e) {
            console.log(e)
          })
      // return res.status(200).json(doc);
    }
  })
};
exports.wifi_login_sync = function (req, res) {
  // var startDate = 'null', endDate = 'null';
  // if (req.query.startDate) { startDate = moment(req.query.startDate).format('YYYY-MM-DD'); }
  // if (req.query.endDate) { endDate = moment(req.query.endDate).format('YYYY-MM-DD'); }
  var query = "SELECT distinct b.vehicle_no, a.event, a.view_datetime, a.journey_id,unique_mac_address FROM spicescreen.vuscreen_events a JOIN vuscreen_registration b ON a.device_id = b.device_id WHERE a.sync_date = '"+Yesterday+"' AND a.event != 'download' AND a.event != 'charging' ORDER BY a.id DESC";
  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    else {


      var data = ""
      let wifiMap = new Map();
      let a =  []
      var count=0;
      for (let i = 0; i < doc.length; i++) {
        data += doc[i].unique_mac_address + ",";
        // console.log(doc[i].unique_mac_address)

        if (doc.length == i + 1) {
          var data1 = data.split(',');
          console.log(data1.length);

          for (let j = 0; j < data1.length; j++) {
            const element = data1[j];

            wifiMap.set(element, element)
           
            if (data1.length == j + 1) {
              console.log(wifiMap.size)
            count=wifiMap.size
              function logMapElements(value, key, map) {

                a.push({"macaddress":value})
                // console.log(`m[${key}] = ${value}`);
              }
              wifiMap.forEach(logMapElements);
            }
            
          }
          // console.log(wifiMap);
          // console.log(wifiMap.size)
        }
      }
      
      var fields = ["macaddress"];
      var csvDau = json2csv({ data: a, fields: fields });
      // console.log(csvDau);
      fs.writeFile(config.root + '/server/api/vuscreen/' +   'wifiloginsync.csv', csvDau, function (err) {
        if (err) {
          throw err;
        } else {
          console.log('file saved');
        }
      });
     var  html = "Total WiFi Login:"+ count ;
      html += " According To Sync Date"
      let subject = "WiFI Login  Report"
          var email = 'manoj.gupta@mobisign.co.in,deepak.kumar@mobisign.co.in,vishal.garg@mobisign.co.in,tushar.mehta@mobisign.co.in,ataul.khan001@gmail.com'
          //var email = 'anurag.kumar@spicejet.com,puneet.angrish@spicejet.com,sapna.kumar@spicejet.com,jitendra.gautam@spicejet.com,prashant.mishra4@spicejet.com,sushant.madhab@spicejet.com,manoj.gupta@mobisign.co.in,deepak.kumar@mobisign.co.in,monali.monalisa@mobisign.co.in,product@mobisign.co.in,ashyin.thakral@mobisign.co.in,kedargdr@gmail.com,amajit.das@spicejet.com,nidhi.sinha@spicejet.com,vishal.garg@mobisign.co.in,tushar.mehta@mobisign.co.in'
          // var email = 'vishal.garg@mobisign.co.in,deepak.kumar@mobisign.co.in,tushar.mehta@mobisign.co.in'
          EM.dispatchEmail(email, subject, html, "wifisync", function (e) {
            console.log(e)
          })
      // return res.status(200).json(doc);
    }
  })
};
