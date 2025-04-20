/*
 * MIT License
 *
 * Copyright (c) 2022- Equestria.dev Developers
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

// noinspection JSUnresolvedVariable,HttpUrlsUsage

// Imports and stuff
const express = require('express');
const fs = require('fs');
const app = express();
const YAML = require('yaml');

// Get version and build numbers
const version = (fs.existsSync("./.git/refs/heads/mane")
    ?
    fs.readFileSync("./.git/refs/heads/mane").toString().trim().substring(0, 8)
    :
    (fs.existsSync("../.git/refs/heads/mane")
    ?
        fs.readFileSync("../.git/refs/heads/mane").toString().trim().substring(0, 8)
        :
        (fs.existsSync("./version.txt")
            ?
            fs.readFileSync("./version.txt").toString().trim().substring(0, 8)
            :
            (fs.existsSync("../version.txt")
                ?
                fs.readFileSync("../version.txt").toString().trim().substring(0, 8)
                :
                "live"))));
const build = (fs.existsSync("./build.txt") ? fs.readFileSync("./build.txt").toString().trim() : (fs.existsSync("../build.txt") ? fs.readFileSync("../build.txt").toString().trim() : "dev"));

// Restart manager
async function restartManager() {
    if (fs.existsSync("./RESTART")) {
        fs.rmSync("./RESTART", { recursive: true });
        console.log("Restart requested.");
        process.exit(14);
    }
}
setInterval(restartManager, 500)

// Public pages
app.get('/', (req, res) => {
    res.render("index", { version, build });
});

app.get('/servers', (req, res) => {
    res.render("servers", { serverCache, version, build });
});

app.get('/broken', (req, res) => {
    res.render("broken", { serverCache, version, build });
});

app.get("/plurality", (req, res) => {
    res.render("plurality", { pluralCache, version, build });
});

app.get("/about", (req, res) => {
    res.render("about", { version, build });
});

app.get("/projects", (req, res) => {
    res.render("projects", { projectCache, version, build });
});

// API
let serverCache = {};
let pluralCache = {};
let projectCache = YAML.parse(fs.readFileSync(__dirname + "/data/projects.yml").toString());

app.get("/api/servers", (req, res) => {
    res.json(serverCache);
});

app.get("/api/plural", (req, res) => {
    res.json(pluralCache);
});

app.get("/api/projects", (req, res) => {
   res.json(projectCache);
});

// Refresh handling
const refresh = require('./refresh/servers');
const pkRefresh = require('./refresh/pluralkit');
setInterval(cacheReload, 300000);

function cacheReload() {
    console.log("Running refresh...");
    projectCache = YAML.parse(fs.readFileSync(__dirname + "/data/projects.yml").toString());
    refresh().then(data => {
        console.log("Refresh halfway done!");
        serverCache = data;
        pkRefresh().then(data => {
            console.log("Refresh totally done!");
            pluralCache = data;
        });
    });
}

// Server
app.use(express.static('public'));
app.set("view engine", "ejs");

const server = app.listen(8099, function () {
    let host = server.address().address
    let port = server.address().port

    console.log("Vapor Trail server listening at http://%s:%s", host, port)
    cacheReload();
})

// Error handling
app.use((req, res) => {
    res.status(404);
    res.render("error", { code: '404', message: 'What are you even looking for?', version, build, process, req, UAParser: require('ua-parser-js') });
})

app.use(function(err, req, res, next) {
    res.status(500);
    res.render("error", { err, code: '500', message: 'Things went pretty downhill.', version, build, process, req, UAParser: require('ua-parser-js') });
});