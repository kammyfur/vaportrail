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

const dns = require("dns");
const superagent = require("superagent");

function resolveDNSAsync(domain) {
    return new Promise((res, rej) => {
        if (!/([\--z]+\.)?([\--z]+)\.([A-z]+)/g.test(domain)) return rej("Not a valid domain");

        const options = {
            family: 4,
            hints: dns.ADDRCONFIG | dns.V4MAPPED
        };
        dns.lookup(domain, options, (err, address) => {
            if (err) return rej(err);
            res(address);
        });
    });
}

function roundToTwo(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}

function createReadableUptime(timestamp) {
    let minutes = Math.floor(timestamp / 1000 / 60 % 60);
    let hours = Math.floor(timestamp / 1000 / 60 / 60 % 24);
    let days = Math.floor(timestamp / 1000 / 60 / 60 / 24);

    let daysString = " Day";
    if(days == 0) daysString = "";
    if(days > 1) daysString = daysString + "s";
    if(days != 0) daysString = days + daysString + ", ";

    let hoursString = " Hour";
    if(hours == 0) hoursString = "";
    if(hours > 1) hoursString = hoursString + "s";
    if(hours != 0) hoursString = hours + hoursString + ", ";

    let andString = "";
    if((hours != 0) || (days != 0)) andString = "and ";

    let minutesString = " Minute";
    if(minutes == 0) minutesString = "";
    if(minutes > 1) minutesString = minutes + minutesString + "s";

    return daysString + hoursString + andString + minutesString;
}

module.exports = () => {
    // Code entered here will be run every 5 minutes
    return new Promise(async (res) => {
        let servers = {
            canterlot: [await resolveDNSAsync("canterlot.equestria.dev"), 52937],
            bridlewood: [await resolveDNSAsync("bridlewood.equestria.dev"), 52937],
            zephyrheights: [await resolveDNSAsync("zephyrheights-ipv4.equestria.dev"), 52938],
            maretimebay: [await resolveDNSAsync("maretimebay-ipv4.equestria.dev"), 52937],
            ponyville: [await resolveDNSAsync("maretimebay.equestria.dev"), 52939],
        }

        let stats = servers;

        for (let key in Object.keys(servers)) {
            key = Object.keys(servers)[key];
            let status = {
                cpu: null,
                processes: null,
                swapmemory: null,
                physicalmemory: null,
                os: null,
                uptime: null
            }

            superagent.get(`http://${servers[key][0]}:${servers[key][1]}/json`)
                .timeout({
                    response: 5000,
                })
                .then(data => data = data.body)
                .then(data => {
                    status.cpu = data.cpu;
                    status.cpu.speed = data.cpu.speed + "GHz";
                    status.cpu.load = Math.floor(data.cpu.load * 100) + "%";
                    if(data.cpu.temperature != null)
                        status.cpu.temperature = data.cpu.temperature + "°C";
                    status.processes = data.processes;
                    status.swapmemory = data.swapmemory;
                    status.swapmemory.used = roundToTwo(data.swapmemory.used / 1073741824) + "GB";
                    status.swapmemory.free = roundToTwo(data.swapmemory.free / 1073741824) + "GB";
                    status.swapmemory.total = roundToTwo(data.swapmemory.total / 1073741824) + "GB";
                    status.physicalmemory = data.physicalmemory;
                    status.physicalmemory.used = roundToTwo(data.physicalmemory.used / 1073741824) + "GB";
                    status.physicalmemory.free = roundToTwo(data.physicalmemory.free / 1073741824) + "GB";
                    status.physicalmemory.total = roundToTwo(data.physicalmemory.total / 1073741824) + "GB";
                    status.os = data.os;
                    status.uptime = createReadableUptime(data.uptime);
                })
                .catch(reason => {
                    if (reason.timeout) {
                        // We timed out.
                        status = null;
                    } else {
                        if(reason.code === "ECONNREFUSED") {
                            status = null;
                            console.warn(`Server ${key} refused our connection. `)
                        } else {
                            status = null;
                            console.error(reason);
                        }
                    }
                })
                .finally(() => {
                    stats[key] = status;

                    if(Object.keys(stats).length === Object.keys(servers).length) {
                        res(stats);
                    }
                });
        }
    });
}
