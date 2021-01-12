'use strict';

var _ = require('lodash');
var db = require('../../config/mysql')
var db_vp = require('../../config/mysql_vp')
var moment = require('moment');


exports.get_server_static_count = function (req, res) {
    var currentDate = moment(new Date()).format('YYYY-MM-DD');
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var Yesterday = moment(d).format('YYYY-MM-DD').toString()
    var query = "select "
        + " (select count(distinct mac) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' ) total_client,"
        + " (select count(distinct device_id) FROM vuscreen_events where partner = '" + req.user.partner_id + "' AND user = 'server' AND event like 'start%') total_server,"
        + " (select count(distinct mac ) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + currentDate + "') today_client,"
        + " (select count(distinct reg_id) FROM vuscreen_events where partner = '" + req.user.partner_id + "'  AND sync_date = '" + currentDate + "' AND user = 'server' AND event like 'start%') today_server,"
        + " (select count(distinct mac ) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + Yesterday + "') y_client,"
        + " (select count(distinct reg_id) FROM vuscreen_events where partner = '" + req.user.partner_id + "'  AND sync_date = '" + Yesterday + "' AND user = 'server' AND event like 'start%') y_server"
    db.get().query(query, function (err, doc) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(doc);
    })
}


exports.get_vp_server_static_count = function (req, res) {
    var currentDate = moment(new Date()).format('YYYY-MM-DD');
    var query = "select "
        + " (select count(distinct android_id) FROM vupoint_file where partner = '" + req.user.partner_id + "' AND tracking_type='tracking_conn') total_client,"
        + " (select count(distinct reg_id) FROM vupoint_file where partner = '" + req.user.partner_id + "') total_server,"
        + " (select count(distinct android_id ) FROM vupoint_file where partner = '" + req.user.partner_id + "' AND sync_date = '" + currentDate + "' AND tracking_type='tracking_conn') today_client,"
        + " (select count(distinct reg_id) FROM vupoint_file where partner = '" + req.user.partner_id + "'  AND sync_date = '" + currentDate + "') today_server"
    db_vp.get().query(query, function (err, doc) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(doc);
    })
}

exports.get_played_static_count = function (req, res) {
    var currentDate = moment(new Date()).format('YYYY-MM-DD');
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var Yesterday = moment(d).format('YYYY-MM-DD').toString()
    var query = "select "
        + " (select count(1) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "') total_played,"
        + " (select count(1) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + currentDate + "') today_played,"
        + " (select count(1) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + Yesterday + "') y_played"
    db.get().query(query, function (err, doc) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(doc);
    })
}

exports.get_vp_played_static_count = function (req, res) {
    var currentDate = moment(new Date()).format('YYYY-MM-DD');
    var query = "select "
        + " (select count(1) FROM vupoint_file where partner = '" + req.user.partner_id + "' AND duration>0) total_played,"
        + " (select count(1) FROM vupoint_file where partner = '" + req.user.partner_id + "' AND sync_date = '" + currentDate + "' AND duration>0) today_played"
    db_vp.get().query(query, function (err, doc) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(doc);
    })
}


exports.get_duration_static_count = function (req, res) {
    var currentDate = moment(new Date()).format('YYYY-MM-DD');
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var Yesterday = moment(d).format('YYYY-MM-DD').toString()
    var query = "select "
        + " (select sum(platform_duration / 3600) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "') total_duration,"
        + " (select sum(platform_duration / 3600) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + currentDate + "') today_duration,"
        + " (select sum(platform_duration / 3600) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + Yesterday + "') y_duration"
    db.get().query(query, function (err, doc) {
    
        if (err) { return handleError(res, err); }
        return res.status(200).json(doc);
    })
}

exports.get_vp_duration_static_count = function (req, res) {
    var currentDate = moment(new Date()).format('YYYY-MM-DD');
    var query = "select "
        + " (select sum(duration / 3600) FROM vupoint_file where partner = '" + req.user.partner_id + "') total_duration,"
        + " (select sum(duration / 3600) FROM vupoint_file where partner = '" + req.user.partner_id + "' AND sync_date = '" + currentDate + "') today_duration"
    db_vp.get().query(query, function (err, doc) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(doc);
    })
}


exports.get_currmonth_static_count = function (req, res) {
    var currentDate = moment(new Date()).format('YYYY-MM-DD');
    var firstDate = moment(new Date()).format('YYYY-MM') + '-01';
    var query = "select "
        + " (select count(distinct mac) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date >= '" + firstDate + "' AND sync_date <= '" + currentDate + "') month_mau,"
        + " (select count(distinct mac) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + currentDate + "') today_dau"
    db.get().query(query, function (err, doc) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(doc);
    })
}

exports.get_vp_currmonth_static_count = function (req, res) {
    var currentDate = moment(new Date()).format('YYYY-MM-DD');
    var firstDate = moment(new Date()).format('YYYY-MM') + '-01';
    var query = "select "
        + " (select count(distinct android_id) FROM vupoint_file where partner = '" + req.user.partner_id + "' AND sync_date >= '" + firstDate + "' AND sync_date <= '" + currentDate + "') month_mau,"
        + " (select count(distinct android_id) FROM vupoint_file where partner = '" + req.user.partner_id + "' AND sync_date = '" + currentDate + "') today_dau"
    db_vp.get().query(query, function (err, doc) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(doc);
    })
}

exports.get_premonth_static_count = function (req, res) {
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var Yesterday = moment(d).format('YYYY-MM-DD').toString()
    var prevMonthLastDate = moment(new Date(d.getFullYear(), d.getMonth(), 0)).format('YYYY-MM-DD').toString();
    var prevMonthFirstDate = moment(new Date(d.getFullYear() - (d.getMonth() > 0 ? 0 : 1), (d.getMonth() - 1 + 12) % 12, 1)).format('YYYY-MM-DD').toString()
    var query = "select "
        + " (select count(distinct mac) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date >= '" + prevMonthFirstDate + "' AND sync_date <= '" + prevMonthLastDate + "') premonth_mau,"
        + " (select count(distinct mac) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + Yesterday + "') yesterday_dau"
    db.get().query(query, function (err, doc) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(doc);
    })
}

exports.get_vp_premonth_static_count = function (req, res) {
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var Yesterday = moment(d).format('YYYY-MM-DD').toString()
    var prevMonthLastDate = moment(new Date(d.getFullYear(), d.getMonth(), 0)).format('YYYY-MM-DD').toString();
    var prevMonthFirstDate = moment(new Date(d.getFullYear() - (d.getMonth() > 0 ? 0 : 1), (d.getMonth() - 1 + 12) % 12, 1)).format('YYYY-MM-DD').toString()
    var query = "select "
        + " (select count(distinct android_id) FROM vupoint_file where partner = '" + req.user.partner_id + "' AND sync_date >= '" + prevMonthFirstDate + "' AND sync_date <= '" + prevMonthLastDate + "') premonth_mau,"
        + " (select count(distinct android_id) FROM vupoint_file where partner = '" + req.user.partner_id + "' AND sync_date = '" + Yesterday + "') yesterday_dau"
    db_vp.get().query(query, function (err, doc) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(doc);
    })
}

exports.get_totaClick_peruser_count = function (req, res) {
    var currentDate = moment(new Date()).format('YYYY-MM-DD');
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var Yesterday = moment(d).format('YYYY-MM-DD').toString()
    var query = "select "
        + " (select IFNULL(ROUND(count(1)/ COUNT(DISTINCT mac), 1),0)  FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' ) total_fpu,"
        + " (select IFNULL(ROUND(count(1)/ COUNT(DISTINCT mac), 1),0) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + currentDate + "') t_fpu,"
        + " (select IFNULL(ROUND(count(1)/ COUNT(DISTINCT mac), 1),0) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + Yesterday + "') y_fpu"
    db.get().query(query, function (err, doc) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(doc);
    })
}

exports.get_fileplayed_peruser_count = function (req, res) {
    var currentDate = moment(new Date()).format('YYYY-MM-DD');
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var Yesterday = moment(d).format('YYYY-MM-DD').toString()
    var query = "select "
        + " (select IFNULL(ROUND(count(1)/ COUNT(DISTINCT mac), 1),0)  FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND TYPE = 'video') total_fpu,"
        + " (select IFNULL(ROUND(count(1)/ COUNT(DISTINCT mac), 1),0) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + currentDate + "' AND TYPE = 'video') t_fpu,"
        + " (select IFNULL(ROUND(count(1)/ COUNT(DISTINCT mac), 1),0) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + Yesterday + "' AND TYPE = 'video') y_fpu"
    db.get().query(query, function (err, doc) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(doc);
    })
}

exports.get_fnbClick_peruser_count = function (req, res) {
    var currentDate = moment(new Date()).format('YYYY-MM-DD');
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var Yesterday = moment(d).format('YYYY-MM-DD').toString()
    var query = "select "
        + " (select IFNULL(ROUND(count(1)/ COUNT(DISTINCT mac), 1),0)  FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND menu = 'fnb') total_fpu,"
        + " (select IFNULL(ROUND(count(1)/ COUNT(DISTINCT mac), 1),0) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + currentDate + "' AND menu = 'fnb') t_fpu,"
        + " (select IFNULL(ROUND(count(1)/ COUNT(DISTINCT mac), 1),0) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + Yesterday + "' AND menu = 'fnb') y_fpu"
    db.get().query(query, function (err, doc) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(doc);
    })
}

exports.get_audioClick_peruser_count = function (req, res) {
    var currentDate = moment(new Date()).format('YYYY-MM-DD');
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var Yesterday = moment(d).format('YYYY-MM-DD').toString()
    var query = "select "
        + " (select IFNULL(ROUND(count(1)/ COUNT(DISTINCT mac), 1),0)  FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND TYPE = 'audio') total_fpu,"
        + " (select IFNULL(ROUND(count(1)/ COUNT(DISTINCT mac), 1),0) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + currentDate + "'  AND TYPE = 'audio') t_fpu,"
        + " (select IFNULL(ROUND(count(1)/ COUNT(DISTINCT mac), 1),0) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + Yesterday + "' AND TYPE = 'audio') y_fpu"
    db.get().query(query, function (err, doc) {
        
        if (err) { return handleError(res, err); }
        return res.status(200).json(doc);
    })
}

exports.get_magzineClick_peruser_count = function (req, res) {
    var currentDate = moment(new Date()).format('YYYY-MM-DD');
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var Yesterday = moment(d).format('YYYY-MM-DD').toString()
    var query = "select "
        + " (select IFNULL(ROUND(count(1)/ COUNT(DISTINCT mac), 1),0)  FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND TYPE = 'pdf') total_fpu,"
        + " (select IFNULL(ROUND(count(1)/ COUNT(DISTINCT mac), 1),0) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + currentDate + "' AND TYPE = 'pdf') t_fpu,"
        + " (select IFNULL(ROUND(count(1)/ COUNT(DISTINCT mac), 1),0) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + Yesterday + "' AND TYPE = 'pdf') y_fpu"
    db.get().query(query, function (err, doc) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(doc);
    })
}

exports.get_gameplayed_peruser_count = function (req, res) {
    var currentDate = moment(new Date()).format('YYYY-MM-DD');
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var Yesterday = moment(d).format('YYYY-MM-DD').toString()
    var query = "select "
        + " (select IFNULL(ROUND(count(1)/ COUNT(DISTINCT mac), 1),0)  FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND TYPE = 'zip') total_gpu,"
        + " (select IFNULL(ROUND(count(1)/ COUNT(DISTINCT mac), 1),0) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + currentDate + "' AND TYPE = 'zip') t_gpu,"
        + " (select IFNULL(ROUND(count(1)/ COUNT(DISTINCT mac), 1),0) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + Yesterday + "' AND TYPE = 'zip') y_gpu"
    db.get().query(query, function (err, doc) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(doc);
    })
}

exports.get_watch_login_count = function (req, res) {
    var currentDate = moment(new Date()).format('YYYY-MM-DD');
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var Yesterday = moment(d).format('YYYY-MM-DD').toString()
    var query = "select "
        + " (select count(distinct mac) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "') total_played,"
        + " (select count(distinct mac) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + currentDate + "') today_played,"
        + " (select count(distinct mac) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + Yesterday + "') y_played"
    db.get().query(query, function (err, doc) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(doc);
    })
}

exports.get_wifi_login_count = function (req, res) {
    var currentDate = moment(new Date()).format('YYYY-MM-DD');
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var Yesterday = moment(d).format('YYYY-MM-DD').toString()
    var query = " SELECT distinct a.view_datetime, a.event,a.journey_id FROM spicescreen.vuscreen_events a JOIN vuscreen_registration b ON a.device_id = b.device_id WHERE a.sync_date = '" + currentDate + "' and a.event!='download' and a.event!='charging' order by a.id desc"
    db.get().query(query, function (err, today) {
        if (err) { return handleError(res, err); }
        else{
            var query1 = " SELECT distinct a.view_datetime, a.event,a.journey_id FROM spicescreen.vuscreen_events a JOIN vuscreen_registration b ON a.device_id = b.device_id WHERE a.sync_date = '" + Yesterday + "' and a.event!='download' and a.event!='charging' order by a.id desc"
        db.get().query(query1, function (err, yday) {
        if (err) { return handleError(res, err); }
        else{
            
            var today_user = 0
            var yday_user = 0
            for (let i in today) {
                let sp = today[i].event.split("|");
                if (sp.length == 3) {
                  if (sp[2] != NaN) {
                   today_user += parseInt(sp[2]);                   
                  }
                }
              }
              for (let ij in yday) {
                let sp = yday[ij].event.split("|");
                if (sp.length == 3) {
                  if (sp[2] != NaN) {
                    yday_user += parseInt(sp[2]);                   
                  }
                }
              }
                var doc={
                    tlogin:today_user,
                    ylogin:yday_user
                }
               
            return res.status(200).json(doc);
        }
        })
    }
        
      
    })
}
 
exports.get_gametime_peruser_count = function (req, res) {
    var currentDate = moment(new Date()).format('YYYY-MM-DD');
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var Yesterday = moment(d).format('YYYY-MM-DD').toString()
    var query = "select "
        + " (select IFNULL(ROUND(SUM(view_duration/60)/ COUNT(DISTINCT mac), 1),0)  FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND TYPE = 'zip') total_gtpu,"
        + " (select IFNULL(ROUND(SUM(view_duration/60)/ COUNT(DISTINCT mac), 1),0) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + currentDate + "' AND TYPE = 'zip') t_gtpu,"
        + " (select IFNULL(ROUND(SUM(view_duration/60)/ COUNT(DISTINCT mac), 1),0) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + Yesterday + "' AND TYPE = 'zip') y_gtpu,"
        + " (select IFNULL(ROUND(SUM(view_duration/60)/ COUNT(DISTINCT mac), 1),0)  FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND TYPE = 'video') total_ptpu,"
        + " (select IFNULL(ROUND(SUM(view_duration/60)/ COUNT(DISTINCT mac), 1),0) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + currentDate + "' AND TYPE = 'video') t_ptpu,"
        + " (select IFNULL(ROUND(SUM(view_duration/60)/ COUNT(DISTINCT mac), 1),0) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + Yesterday + "' AND TYPE = 'video') y_ptpu"
    console.log(query)
    db.get().query(query, function (err, doc) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(doc);
    })
}

exports.get_gameplay_overlap_count = function (req, res) {
    var currentDate = moment(new Date()).format('YYYY-MM-DD');
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var Yesterday = moment(d).format('YYYY-MM-DD').toString()
    var query = "select "
        + " (select count(DISTINCT mac)  FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND TYPE IN ('video','zip')) total_gpolap,"
        + " (select count(DISTINCT mac) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + currentDate + "' AND TYPE = 'zip') t_golap,"
        + " (select count(DISTINCT mac) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + Yesterday + "' AND TYPE = 'zip') y_golap,"
        + " (select count(DISTINCT mac) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + currentDate + "' AND TYPE = 'video') t_polap,"
        + " (select count(DISTINCT mac) FROM vuscreen_tracker where partner = '" + req.user.partner_id + "' AND sync_date = '" + Yesterday + "' AND TYPE = 'video') y_polap"
    db.get().query(query, function (err, doc) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(doc);
    })
}

function handleError(res, err) {
    return res.status(500).send(err);
}
