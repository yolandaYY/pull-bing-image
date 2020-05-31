'use strict'
const fs = require('fs');
const https = require('https');
const qs = require('querystring');
// const later = require('later');

// 日志地址
const logPath = __dirname + '\\' + 'log.txt';
// 图片下载地址
const downloadPath = "D:\\Pictures\\Camera Roll" + "\\";

// 图片列表地址
const imageList = "https://cn.bing.com/HPImageArchive.aspx?";
// 图片列表参数 n：数量  idx：前几天
const queryString = qs.stringify({ format: "js", idx: 0, n: 7, mkt: "zh-CN" });
// 图片源
const imageOrigin = "https://cn.bing.com/";

// 拉取时间
// const schedules = later.parse.cron('43 16 * * *');


function main() {
    // 单次
    pull()

    // 定时
    // later.date.localTime(); 
    // later.setInterval(() => pull(), schedules);
}

function pull() {
    var request = https.get(imageList + queryString, {}, (respone) => {
        log("XHR", respone.statusCode);

        let responeJson = ""
        respone.on('data', (data) => {
            responeJson += data;
        });
        respone.on('end', () => {
            const data = JSON.parse(responeJson);
            downloadImage(data);
        });
    })
    request.on('error', onError);
    request.end();
}

function downloadImage(data) {
    data.images.forEach(element => {
        let requestImage = https.get(imageOrigin + element.url, (responeImage) => {
            log("IMG", responeImage.statusCode + " " + element.copyright);

            let imageData = "";
            responeImage.setEncoding("binary");
            responeImage.on('data', (image) => {
                imageData += image;
            });
            responeImage.on('end', () => {
                fs.writeFile(downloadPath + element.copyright.replace(/\//g, "") + ".png", imageData, 'binary', onError);
            });
        })
        requestImage.on('error', onError);
        requestImage.end();
    });
}

function onError(err) {
    if (err) {
        log("Error", err);
    }
}

function log(type, data) {
    const time = new Date().toLocaleString();
    console.log(`${time} [${type}] ${data}`);

    fs.appendFile(logPath, `${time} [${type}] ${data} \n`, (err) => {
        if (err) throw err;
    });
}

main();