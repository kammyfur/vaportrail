// noinspection JSDeprecatedSymbols,JSPrimitiveTypeWrapperUsage

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

const superagent = require("superagent");
module.exports = () => {
    // Code entered here will be run every 5 minutes
    return new Promise(async (res) => {
        let systems = [
            "gdapd", // Raindrops System
            "ynmuc"  // Cloudburst System
        ]

        let stats = {}

        for (let system of systems) {
            let status = {
                available: true,
                general: null,
                members: null,
                fronters: null,
                switches: null
            }

            superagent.get(`https://pluralkit.equestria.dev/v2/systems/${system}`)
                .timeout({
                    response: 5000,
                })
                .then(data => data = JSON.parse(data.text))
                .then(data => {
                    status.general = data;
                    superagent.get(`https://pluralkit.equestria.dev/v2/systems/${system}/members`)
                        .timeout({
                            response: 5000,
                        })
                        .then(data => data = JSON.parse(data.text))
                        .then(data => {
                            status.members = data.filter((i) => {
                                return i.name !== "unknown" && i.name !== "fusion" && !i.name.endsWith("-travelling");
                            });
                            superagent.get(`https://pluralkit.equestria.dev/v2/systems/${system}/fronters`)
                                .timeout({
                                    response: 5000,
                                })
                                .then(data => data = JSON.parse(data.text))
                                .then(data => {
                                    status.fronters = data;
                                })
                                .catch(reason => {
                                    if (reason.timeout) {
                                        // We timed out.
                                        status.available = false;
                                    } else {
                                        if (reason.code === "ECONNREFUSED") {
                                            status.available = false;
                                            console.warn("Error querying PluralKit API.")
                                        } else {
                                            console.error(reason);
                                        }
                                    }
                                })
                                .finally(() => {
                                    stats[system] = status;

                                    if (Object.keys(stats).length === systems.length) {
                                        res(stats);
                                    }
                                });
                        })
                        .catch(reason => {
                            if (reason.timeout) {
                                // We timed out.
                                status.available = false;
                            } else {
                                if (reason.code === "ECONNREFUSED") {
                                    status.available = false;
                                    console.warn("Error querying PluralKit API.")
                                } else {
                                    console.error(reason);
                                }
                            }
                        })
                })
                .catch(reason => {
                    if (reason.timeout) {
                        // We timed out.
                        status.available = false;
                    } else {
                        if (reason.code === "ECONNREFUSED") {
                            status.available = false;
                            console.warn("Error querying PluralKit API.")
                        } else {
                            console.error(reason);
                        }
                    }
                })
        }
    });
}
