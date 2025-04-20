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
const SERVER_API = "/api/servers";

const idsToReadable = {
    "data-cpu": "CPU",
    "data-cpu-processors": "Processor Count",
    "data-cpu-model": "Model",
    "data-cpu-cores": "Core Count",
    "data-cpu-speed": "Clock Speed",
    "data-cpu-temperature": "Temperature",
    "data-cpu-load": "Usage",
    "data-processes": "Processes",
    "data-processes-total": "Total",
    "data-processes-running": "Running",
    "data-processes-sleeping": "Sleeping",
    "data-processes-blocked": "Blocked",
    "data-processes-unknown": "Unknown",
    "data-swapmemory": "Swap RAM",
    "data-swapmemory-used": "Used",
    "data-swapmemory-free": "Free",
    "data-swapmemory-total": "Total",
    "data-physicalmemory": "Physical RAM",
    "data-physicalmemory-used": "Used",
    "data-physicalmemory-free": "Free",
    "data-physicalmemory-total": "Total",
    "data-os": "OS",
    "data-os-name": "Name",
    "data-os-version": "Version"
}

function isObject(obj) {
    return obj === Object(obj);
}

function iterateAndSetData(data, previous, element, server) {
    for(var key in data) {
        console.log(key);
        console.log("iterateAndSetData: "+previous.join("-"));
        if(isObject(data[key])) {
            // Call self again but with this object as the input
            console.log("iterateAndSetData: Calling self!")
            let newPrevious = previous.join("-").split("-");
            newPrevious.push(key);

            console.log(newPrevious.join("-"));

            let category = document.createElement("div");
            category.classList.add("category");
            category.classList.add(key);

            let title = document.createElement("h4");
            title.classList.add("name");
            title.innerHTML = idsToReadable[newPrevious.join("-")];

            category.appendChild(title);
            server.appendChild(category);

            iterateAndSetData(data[key], newPrevious, category, server);
        } else {
            // We're at a value, we can set stuff
            if(key == "online") continue;

            console.log("interateAndSetData: Setting data!");

            console.log(previous.join("-")+"-"+key);
            let value = data[key];
            if(value == null || value == undefined) value = "No Data";

            let item = document.createElement("div");
            item.classList.add("item");

            let title = document.createElement("p");
            title.innerHTML = idsToReadable[previous.join("-")+"-"+key];

            let content = document.createElement("span");
            content.innerHTML = value;

            item.appendChild(title);
            item.appendChild(content);

            element.appendChild(item);

            //document.getElementById(server).getElementsByClassName(previous.join("-")+"-"+key)[0].innerHTML = value;
        }
    }
}

// apparently document.onload is never called???
function a() {
    console.log("a");
    fetch(SERVER_API)
        .then(data => data = data.json())
        .then(data => {
            console.log(data);
            for(let server in data) {
                if(data[server] == null) {
                    document.getElementById(server).getElementsByClassName("category-container")[0].remove();
                    document.getElementById(server).getElementsByTagName("p")[0].innerHTML = "Server Offline";
                    document.getElementById(server).getElementsByTagName("p")[0].style = "color:#ff4444;";
                    continue;
                }
                document.getElementById(server).getElementsByClassName("data-uptime")[0].innerHTML = data[server].uptime;
                delete data[server].uptime;
                iterateAndSetData(data[server], ["data"], null, document.getElementById(server).getElementsByClassName("category-container")[0]);
            }
        });
}

a();