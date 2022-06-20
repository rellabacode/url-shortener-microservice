require('dotenv').config();
// import dotenv from 'dotenv';

// dotenv.config();

const express = require('express');
// import express from 'express';
const cors = require('cors');
// import cors from 'cors';

var corsOptions = {
    origin: function (origin, callback) {
        callback(null, true);
    }
}

const app = express();
const bodyParser = require("body-parser");
// import bodyParser from "body-parser";

// Basic Configuration
const port = process.env.PORT || 3000;
const dns = require("dns");
// import dns from "dns";


// const XMLHttpRequest = require('xhr2');
// const fetch = require('node-fetch');
// import fetch from 'node-fetch';


// async function fetchUrl(uri){
//     const response = await fetch(uri);
//     console.log(response.status);
//     return response.status;
// }
//
// fetchUrl();

// const http = require("http");
// const https = require("https");
// import http from "http";
const Url = require('url');
// import {URL, parse} from 'url';
// import validUrl from 'valid-url';

const urlId = [];
let urlIdInd = 0;

// https://github.com/sindresorhus/is-url-superb/blob/main/index.js
function isUrl(str) {
    if (typeof str !== 'string') {
        return false;
    }

    const trimmedStr = str.trim();
    if (trimmedStr.includes(' ')) {
        return false;
    }

    try {
        new Url.URL(str); // eslint-disable-line no-new
        console.log("isurl true");
        return true;
    } catch (e) {
        console.log(e);
        console.log("isurl false");
        return false;
    }
}

// https://github.com/Richienb/url-exist/blob/master/index.js
function urlExists(url) {
    return new Promise(function (resolve) {
        if (!isUrl(url)) {
            resolve(false);
        }

        console.log(Url.parse(url));
        const parsed = Url.parse(url);
        dns.lookup(parsed.host, {all: true},
            function (err, addresses) {
                console.log("validando url post");
                console.log(addresses);
                console.log(err);
                if (err || !addresses || !addresses.length) resolve(false);
                resolve(true);
            }
        );
        // const options = {
        //     method: 'GET',
        //     host: parse.host,
        //     path: parse.path,
        //     port: parse.protocol === 'https:' ? 443 : 80,
        // };
        //
        // console.log(options);
        //
        // // if (!options.host)
        // //     resolve(false);
        //
        //
        // const req = http.request(url, {method: 'HEAD'}, (res) => {
        //     console.log("resolviendo segun codigo de estado " + res.statusCode);
        //     resolve(res.statusCode < 400 || res.statusCode >= 500);
        // });
        //
        // req.on("error", function (err) {
        //     console.log("error http request");
        //     console.log(err);
        //     resolve(false);
        // });


        // req.end();
    });
}


// function makeRequest(method, url) {
//     return new Promise(function (resolve, reject) {
//         let xhr = new XMLHttpRequest();
//         xhr.open(method, url);
//         xhr.onload = function () {
//             if (this.status >= 200 && this.status < 300) {
//                 resolve(xhr.response);
//             } else {
//                 reject({
//                     status: this.status,
//                     statusText: xhr.statusText
//                 });
//             }
//         };
//         xhr.onerror = function () {
//             reject({
//                 status: this.status,
//                 statusText: xhr.statusText
//             });
//         };
//         xhr.send();
//     });
// }

// async function doAjaxThings(url) {
//     // await code here
//     let result = await makeRequest("GET", url);
//     // code below here will only execute when await makeRequest() finished loading
//     return result;
// }


// app.use(cors());
app.use(bodyParser.urlencoded({extended: "false"}));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
    res.json({greeting: 'hello API'});
});

app.get('/api/shorturl/:index([0-9]{1,})', function (req, res) {
    console.log("param indexx " + req.params.index);
    console.log("indexes " + urlId.length);
    console.log("index " + urlIdInd);

    let index = parseInt(req.params.index);
    if (isNaN(index) || index >= urlIdInd) return res.status(404).json({error: "Invalid URL"});

    console.log("redirigiendo a " + urlId[index]);
    return res.status(301).redirect(urlId[index]);
});

// function httpGet(theUrl)
// {
//     var xmlHttp = new XMLHttpRequest();
//     xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
//     xmlHttp.send( null );
//     return xmlHttp.responseText;
// }


app.post('/api/shorturl', function (req, res) {
    let url = req.body.url;
    console.log("url " + url);
    urlExists(url).then(function (value) {
        console.log("tras urlExists");
        if (!value) {
            console.log("no existe la url");
            return res.status(401).json({error: "Invalid URL"});
        }

        const urlParts = Url.parse(url);
        console.log(urlParts);

        let index = urlId.indexOf(url);
        if (index > -1) return res.json({original_url: url, short_url: index});
        console.log("storing " + url);
        urlId.push(url);
        return res.json({original_url: url, short_url: urlIdInd++});
    });
});


app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
