require('dotenv').config();

const express = require('express');
const cors = require('cors');

var corsOptions = {
    origin: function (origin, callback) {
        callback(null, true);
    }
}

const app = express();
const bodyParser = require("body-parser");

// Basic Configuration
const port = process.env.PORT || 3000;
const dns = require("dns");
const Url = require('url');

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
                resolve(parsed);
            }
        );
    });
}

app.use(cors(corsOptions));
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

const urlId = [];
let urlIdInd = 0;
app.get('/api/shorturl/:index([0-9]{1,})', function (req, res) {
    console.log("param indexx " + req.params.index);
    console.log("indexes " + urlId.length);
    console.log("index " + urlIdInd);

    let index = parseInt(req.params.index);
    if (isNaN(index) || index >= urlIdInd) return res.json({error: "Invalid URL"});

    console.log("redirigiendo a " + urlId[index]);
    // res.header('Access-Control-Allow-Origin', "*");
    return res.redirect(urlId[index]);
});

app.post('/api/shorturl', function (req, res) {
    let url = req.body.url;
    console.log("url " + url);
    urlExists(url).then(function (value) {
        console.log("tras urlExists");
        if (!value) {
            console.log("no existe la url");
            return res.json({error: "Invalid URL"});
        }

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
