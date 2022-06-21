require('dotenv').config();

const express = require('express');
const cors = require('cors');

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
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

// https://github.com/Richienb/url-exist/blob/master/index.js
function urlExists(url) {
    return new Promise(function (resolve) {
        if (!isUrl(url)) {
            resolve(false);
        }

        const parsed = Url.parse(url);
        dns.lookup(parsed.host, {all: true},
            function (err, addresses) {
                if (err || !addresses || !addresses.length) resolve(false);
                resolve(parsed);
            }
        );
    });
}

app.use(cors({
    origin: function (origin, callback) {
        callback(null, true);
    }
}));
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

const urlDb = [];
let urlInd = 0;
app.get('/api/shorturl/:index([0-9]{1,})', function (req, res) {
    let index = parseInt(req.params.index);
    if (isNaN(index) || index >= urlInd) return res.json({error: "Invalid URL"});
    return res.redirect(urlDb[index]);
});

app.post('/api/shorturl', function (req, res) {
    let url = req.body.url;
    urlExists(url).then(function (value) {
        if (!value) return res.json({error: "Invalid URL"});

        let index = urlDb.indexOf(url);
        if (index > -1) return res.json({original_url: url, short_url: index});
        urlDb.push(url);
        return res.json({original_url: url, short_url: urlInd++});
    });
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});