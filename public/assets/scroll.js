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

function posY(elm) {
    var test = elm, top = 0;

    while(!!test && test.tagName.toLowerCase() !== "body") {
        top += test.offsetTop;
        test = test.offsetParent;
    }

    return top;
}

function viewPortHeight() {
    var de = document.documentElement;

    if(!!window.innerWidth)
    { return window.innerHeight; }
    else if( de && !isNaN(de.clientHeight) )
    { return de.clientHeight; }

    return 0;
}

function scrollY() {
    if( window.pageYOffset ) { return window.pageYOffset; }
    return Math.max(document.documentElement.scrollTop, document.body.scrollTop);
}

function checkvisible( elm ) {
    var vpH = viewPortHeight(), // Viewport Height
        st = scrollY(), // Scroll Top
        y = posY(elm);

    return (y > (vpH + st));
}

document.body.innerHTML = document.body.innerHTML.replaceAll("\n", "").replace(/> *</gm, "><").trim();

window.onscroll = () => {
    if (window.innerWidth > 700) {
        if (window.scrollY() > (window.innerHeight - 52)) {
            document.getElementsByClassName("navbar")[0].classList.add("scrolled");
        } else {
            document.getElementsByClassName("navbar")[0].classList.remove("scrolled");
        }
    } else {
        if (window.scrollY() > (window.innerHeight - 120)) {
            document.getElementsByClassName("navbar")[0].classList.add("scrolled");
        } else {
            document.getElementsByClassName("navbar")[0].classList.remove("scrolled");
        }
    }
}

