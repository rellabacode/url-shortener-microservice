const pactum = require("pactum");
const ENDPOINT = "http://localhost:3000/api/shorturl";
const uris = ["http://www.google.es",
    "http://www.freecodecamp.com",
    "http://www.20minutos.com",
    "http://www.20minutos.es"];

it('should return invalid url', async function () {
    await pactum.spec().post(ENDPOINT).withBody({url: "www.google.es"}).expectStatus(401).expectJsonMatch('error', 'invalid url');
    await pactum.spec().post(ENDPOINT).withBody({url: "www.freecodecamp.com"}).expectStatus(401).expectJsonMatch('error', 'invalid url');
    await pactum.spec().post(ENDPOINT).withBody({url: "ftp:/john-doe.invalidTLD"}).expectStatus(401).expectJsonMatch('error', 'invalid url');
    await pactum.spec().post(ENDPOINT).withBody({url: "sftp:/john-doe.invalidTLD"}).expectStatus(401).expectJsonMatch('error', 'invalid url');
});

it('should return short_url', async function () {
    await pactum.spec().post(ENDPOINT).withBody({url: uris[0]}).expectStatus(200).expectJsonMatch({
        original_url: uris[0],
        short_url: 0
    });
    await pactum.spec().post(ENDPOINT).withBody({url: uris[1]}).expectStatus(200).expectJsonMatch({
        original_url: uris[1],
        short_url: 1
    });
    await pactum.spec().post(ENDPOINT).withBody({url: uris[2]}).expectStatus(200).expectJsonMatch({
        original_url: uris[2],
        short_url: 2
    });
    await pactum.spec().post(ENDPOINT).withBody({url: uris[3]}).expectStatus(200).expectJsonMatch({
        original_url: uris[3],
        short_url: 3
    });
});

it('should visit the website', async function () {
    await pactum.spec().get(ENDPOINT + "/0").expectHeader('location', uris[0]);
    await pactum.spec().get(ENDPOINT + "/1").expectHeader('location', uris[1]);
    await pactum.spec().get(ENDPOINT + "/2").expectHeader('location', uris[2]);
    await pactum.spec().get(ENDPOINT + "/3").expectHeader('location', uris[3]);
    await pactum.spec().get(ENDPOINT + "/4").expectJsonMatch({error: "invalid url"});
});