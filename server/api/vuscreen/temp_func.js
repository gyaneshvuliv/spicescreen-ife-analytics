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
    var firstDate = moment(new Date()).format('YYYY-MM') + '-01';
    let query = "SELECT vr.vehicle_no as HostID, vst.sync_date, COUNT(DISTINCT vst.mac) COUNT"
        + " FROM vuscreen_tracker vst"
        + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = vr.reg_id"
        + " WHERE vst.sync_date >= '" + d2 + "' AND vst.sync_date <= '" + d1 + "'"
        + " AND vr.vehicle_no In (10,11,12,13,16,17,18,21,22,23,24,26,27,28,29,30,31,32,34,35,36,37,"
        + " 38,94,95,96,97,98,100,"
        + " 108,121,"
        + " 122,125,126,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,"
        + " 161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,"
        + " 201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216)"
        // + " AND vr.vehicle_no NOT REGEXP '[A-Z ]'"
        + " GROUP BY vr.vehicle_no, vst.sync_date"
        + " ORDER BY vst.sync_date, vr.vehicle_no"
    let query1 = "SELECT vr.vehicle_no as HostID, vst.sync_date, COUNT(1) COUNT"
        + " FROM vuscreen_tracker vst"
        + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = vr.reg_id"
        + " WHERE vst.sync_date >= '" + d2 + "' AND vst.sync_date <= '" + d1 + "'"
        + " AND vr.vehicle_no In (10,11,12,13,16,17,18,21,22,23,24,26,27,28,29,30,31,32,34,35,36,37,"
        + " 38,94,95,96,97,98,100,"
        + " 108,121,"
        + " 122,125,126,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,"
        + " 161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,"
        + " 201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216)"
        + " AND vst.type = 'video'"
        + " GROUP BY vr.vehicle_no, vst.sync_date"
        + " ORDER BY vst.sync_date, vr.vehicle_no"
    let query4 = "SELECT vr.vehicle_no as HostID, vst.sync_date, COUNT(1) COUNT"
        + " FROM vuscreen_tracker vst"
        + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = vr.reg_id"
        + " WHERE vst.sync_date >= '" + d2 + "' AND vst.sync_date <= '" + d1 + "'"
        + " AND vr.vehicle_no In (10,11,12,13,16,17,18,21,22,23,24,26,27,28,29,30,31,32,34,35,36,37,"
        + " 38,94,95,96,97,98,100,"
        + " 108,121,"
        + " 122,125,126,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,"
        + " 161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,"
        + " 201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216)"
        + " AND vst.type = 'zip'"
        + " GROUP BY vr.vehicle_no, vst.sync_date"
        + " ORDER BY vst.sync_date, vr.vehicle_no"
    let query2 = "SELECT vst.sync_date, COUNT(1) Views, COUNT(DISTINCT vst.mac) Sessions, ROUND(COUNT(DISTINCT vst.device_id)/ 72 * 100) AS 'percentage',"
        + " COUNT(DISTINCT vst.device_id) Hubs"
        + " FROM vuscreen_tracker vst"
        + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = "
        + " vr.reg_id"
        + " WHERE vst.sync_date >= '" + firstDate + "' AND vst.sync_date <= '" + d1 + "'"
        + " AND vr.vehicle_no In (10,11,12,13,16,17,18,21,22,23,24,26,27,28,29,30,31,32,34,35,36,37,"
        + " 38,94,95,96,97,98,100,"
        + " 108,121,"
        + " 122,125,126,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,"
        + " 161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,"
        + " 201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216)"
        // + " AND vr.vehicle_no NOT REGEXP '[A-Z ]'"
        + " GROUP BY vst.sync_date"
    let query3 = "SELECT DATE_FORMAT(vst.sync_date, '%Y-%m') YEAR , DATE_FORMAT(vst.sync_date, '%M-%y') Month,"
        + " COUNT(1) Views, COUNT(DISTINCT vst.mac) Sessions, ROUND(COUNT(DISTINCT vst.device_id)/ 72 * 100) AS percentage,"
        + " COUNT(DISTINCT vst.device_id) Hubs"
        + " FROM vuscreen_tracker vst"
        + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = "
        + "  vr.reg_id"
        + " WHERE "
        + " vr.vehicle_no In (10,11,12,13,16,17,18,21,22,23,24,26,27,28,29,30,31,32,34,35,36,37,"
        + " 38,94,95,96,97,98,100,"
        + " 108,121,"
        + " 122,125,126,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,"
        + " 161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,"
        + " 201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216)"
        // + " vr.vehicle_no NOT REGEXP '[A-Z ]'"
        + " GROUP BY MONTH ORDER BY YEAR DESC LIMIT 2"
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
                                                                    data[obj.sync_date] = obj.COUNT
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
                                                                    data[obj.sync_date] = obj.COUNT
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
                                                                    data[obj.sync_date] = obj.COUNT
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
                                            html += "<th>% of Sync vs Total Hub</th><th>Wi-Fi Hub Sync</th>"
                                            html += "<th>No of Wi-Fi Hub Provided</th>"
                                            html += "</tr></thead><tbody>"
                                            let monthTotal = 0;
                                            let monthAvg = 0;
                                            for (let i = 0; i < doc2.length; i++) {
                                                const element = doc2[i];
                                                monthTotal += element.Views;
                                                monthAvg += element.Hubs;
                                                html += "<tr>"
                                                html += "<td>" + element.sync_date + "</td>"
                                                html += "<td>" + element.Views + "</td>"
                                                html += "<td>" + element.Sessions + "</td>"
                                                html += "<td>" + element.percentage + "%</td>"
                                                html += "<td>" + element.Hubs + "</td>"
                                                html += "<td>72</td>"
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
                                                if (i == 0) {
                                                    html += "<td><b>" + monthAvg + "%</b></td>"
                                                } else {
                                                    html += "<td><b></b></td>"
                                                }
                                                html += "<td><b>" + element.Hubs + "</b></td>"
                                                html += "<td>72</td>"
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
                                            html += "<br><br><h5>Thanks & Regards</h5><h5>Mobi Serve Pvt Ltd.</h5></html>"
                                            let subject = "Last 7 days dau & usage activity"
                                            var email = 'anurag.kumar@spicejet.com,puneet.angrish@spicejet.com,sapna.kumar@spicejet.com,jitendra.gautam@spicejet.com,prashant.mishra4@spicejet.com,sushant.madhab@spicejet.com,manoj.gupta@vuliv.com,deepak.kumar@vuliv.com,shivam.nehra@vuliv.com,kedargdr@gmail.com,rajat.arora@vuliv.com,himanshu.gupta@vuliv.com,vikash.kumar@vuliv.com'
                                            // var email = 'kedargdr@gmail.com'
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
    var firstDate = moment(new Date()).format('YYYY-MM') + '-01';
    let query = "SELECT vr.vehicle_no as HostID, vst.sync_date, COUNT(DISTINCT vst.mac) COUNT"
        + " FROM vuscreen_tracker vst"
        + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = vr.reg_id"
        + " WHERE vst.sync_date >= '" + d2 + "' AND vst.sync_date <= '" + d1 + "'"
        + " AND vr.vehicle_no In (10,11,12,13,16,17,18,21,22,23,24,26,27,28,29,30,31,32,34,35,36,37,"
        + " 38,94,95,96,97,98,100,"
        + " 108,121,"
        + " 122,125,126,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,"
        + " 161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,"
        + " 201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216)"
        // + " AND vr.vehicle_no NOT REGEXP '[A-Z ]'"
        + " GROUP BY vr.vehicle_no, vst.sync_date"
        + " ORDER BY vst.sync_date, vr.vehicle_no"
    let query1 = "SELECT vr.vehicle_no as HostID, vst.sync_date, COUNT(1) COUNT"
        + " FROM vuscreen_tracker vst"
        + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = vr.reg_id"
        + " WHERE vst.sync_date >= '" + d2 + "' AND vst.sync_date <= '" + d1 + "'"
        + " AND vr.vehicle_no In (10,11,12,13,16,17,18,21,22,23,24,26,27,28,29,30,31,32,34,35,36,37,"
        + " 38,94,95,96,97,98,100,"
        + " 108,121,"
        + " 122,125,126,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,"
        + " 161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,"
        + " 201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216)"
        + " AND vst.type = 'video'"
        + " GROUP BY vr.vehicle_no, vst.sync_date"
        + " ORDER BY vst.sync_date, vr.vehicle_no"
    let query4 = "SELECT vr.vehicle_no as HostID, vst.sync_date, COUNT(1) COUNT"
        + " FROM vuscreen_tracker vst"
        + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = vr.reg_id"
        + " WHERE vst.sync_date >= '" + d2 + "' AND vst.sync_date <= '" + d1 + "'"
        + " AND vr.vehicle_no In (10,11,12,13,16,17,18,21,22,23,24,26,27,28,29,30,31,32,34,35,36,37,"
        + " 38,94,95,96,97,98,100,"
        + " 108,121,"
        + " 122,125,126,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,"
        + " 161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,"
        + " 201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216)"
        + " AND vst.type = 'zip'"
        + " GROUP BY vr.vehicle_no, vst.sync_date"
        + " ORDER BY vst.sync_date, vr.vehicle_no"
    let query2 = "SELECT vst.sync_date, COUNT(1) Views, COUNT(DISTINCT vst.mac) Sessions, ROUND(COUNT(DISTINCT vst.device_id)/ 72 * 100) AS 'percentage',"
        + " COUNT(DISTINCT vst.device_id) Hubs"
        + " FROM vuscreen_tracker vst"
        + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = "
        + " vr.reg_id"
        + " WHERE vst.sync_date >= '" + firstDate + "' AND vst.sync_date <= '" + d1 + "'"
        + " AND vr.vehicle_no In (10,11,12,13,16,17,18,21,22,23,24,26,27,28,29,30,31,32,34,35,36,37,"
        + " 38,94,95,96,97,98,100,"
        + " 108,121,"
        + " 122,125,126,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,"
        + " 161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,"
        + " 201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216)"
        // + " AND vr.vehicle_no NOT REGEXP '[A-Z ]'"
        + " GROUP BY vst.sync_date"
    let query3 = "SELECT DATE_FORMAT(vst.sync_date, '%Y-%m') YEAR , DATE_FORMAT(vst.sync_date, '%M-%y') Month,"
        + " COUNT(1) Views, COUNT(DISTINCT vst.mac) Sessions, ROUND(COUNT(DISTINCT vst.device_id)/ 72 * 100) AS percentage,"
        + " COUNT(DISTINCT vst.device_id) Hubs"
        + " FROM vuscreen_tracker vst"
        + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = "
        + "  vr.reg_id"
        + " WHERE "
        + " vr.vehicle_no In (10,11,12,13,16,17,18,21,22,23,24,26,27,28,29,30,31,32,34,35,36,37,"
        + " 38,94,95,96,97,98,100,"
        + " 108,121,"
        + " 122,125,126,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,"
        + " 161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,"
        + " 201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216)"
        // + " vr.vehicle_no NOT REGEXP '[A-Z ]'"
        + " GROUP BY MONTH ORDER BY YEAR DESC LIMIT 2"
    let query5 = "SELECT vst.sync_date, COUNT(DISTINCT vst.device_id) synced_devices,"
        + " (COUNT(DISTINCT vst.device_id)/ 94 * 100) AS 'synced_percnt',(94 - COUNT(DISTINCT vst.device_id)) not_synced_devices,"
        + " ((94 - COUNT(DISTINCT vst.device_id))/ 94 * 100) AS 'not_synced_percnt'"
        + " FROM vuscreen_events vst"
        + " LEFT JOIN vuscreen_registration vr ON vst.reg_id = "
        + " vr.reg_id"
        + " WHERE vst.sync_date >= '" + firstDate + "' AND vst.sync_date <= '" + d1 + "'"
        + " AND EVENT LIKE 'start%' AND vr.vehicle_no In (10,11,12,13,16,17,18,21,22,23,24,26,27,28,29,30,31,32,34,35,36,37,"
        + " 38,94,95,96,97,98,100,"
        + " 108,121,"
        + " 122,125,126,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,"
        + " 161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,"
        + " 201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216)"
        + " AND vst.event = 'start'"
        + " GROUP BY vst.sync_date"
        console.log(query5)
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
                                                                            data[obj.sync_date] = obj.COUNT
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
                                                                            data[obj.sync_date] = obj.COUNT
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
                                                                            data[obj.sync_date] = obj.COUNT
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
                                                    html += "<th>No of Wifi hub Provided</th><th>Devices Synced</th><th>% of Sync VS Total Hub</th>"
                                                    html += "<th>Number of Hub Used in Aircraft</th><th>Usage Rcvd from the devices</th><th>% Usage from Hub Vs Aircraft</th>"
                                                    html += "<th>Usage Not rcvd from devices</th><th>% Usage not rcvd Hub Vs Aircraft</th>"
                                                    html += "</tr></thead><tbody>"
                                                    let monthTotal = 0;
                                                    let monthAvg = 0;
                                                    let hub_array = JSON.parse(JSON.stringify(doc2))
                                                    let synced_array = JSON.parse(JSON.stringify(doc5))
                                                    for (let i = 0; i < hub_array.length; i++) {
                                                        const element = hub_array[i];
                                                        synced_array.map(item => {
                                                            if (element.sync_date == item.sync_date) {
                                                                element.synced_devices = item.synced_devices;
                                                                element.synced_percnt = item.synced_percnt;
                                                                element.not_synced_devices = item.not_synced_devices;
                                                                element.not_synced_percnt = item.not_synced_percnt;
                                                            }
                                                        });
                                                    }
                                                    console.log(hub_array)
                                                    for (let i = 0; i < hub_array.length; i++) {
                                                        const element = hub_array[i];
                                                        monthTotal += element.Views;
                                                        monthAvg += element.Hubs;
                                                        html += "<tr>"
                                                        html += "<td>" + element.sync_date + "</td>"
                                                        html += "<td>" + element.Views + "</td>"
                                                        html += "<td>" + element.Sessions + "</td>"
                                                        html += "<td>94</td>"
                                                        html += "<td>" + element.synced_devices + "</td>"
                                                        html += "<td>" + element.synced_percnt + "%</td>"
                                                        html += "<td>72</td>"
                                                        html += "<td>" + element.Hubs + "</td>"
                                                        html += "<td>" + element.percentage + "%</td>"
                                                        html += "<td>" + element.not_synced_devices + "</td>"
                                                        html += "<td>" + element.not_synced_percnt + "%</td>"
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
                                                        html += "<td>94</td>"
                                                        html += "<td></td>"
                                                        html += "<td></td>"
                                                        html += "<td>72</td>"
                                                        html += "<td><b>" + element.Hubs + "</b></td>"
                                                        if (i == 0) {
                                                            html += "<td><b>" + monthAvg + "%</b></td>"
                                                        } else {
                                                            html += "<td><b></b></td>"
                                                        }
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
                                                    html += "<br><br><h5>Thanks & Regards</h5><h5>Mobi Serve Pvt Ltd.</h5></html>"
                                                    let subject = "Last 7 days dau & usage activity"
                                                    // var email = 'anurag.kumar@spicejet.com,puneet.angrish@spicejet.com,sapna.kumar@spicejet.com,jitendra.gautam@spicejet.com,prashant.mishra4@spicejet.com,sushant.madhab@spicejet.com,manoj.gupta@vuliv.com,deepak.kumar@vuliv.com,shivam.nehra@vuliv.com,kedargdr@gmail.com,rajat.arora@vuliv.com,himanshu.gupta@vuliv.com,vikash.kumar@vuliv.com'
                                                    var email = 'kedargdr@gmail.com'
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

