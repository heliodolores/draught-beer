var serverURL = window.location.host;
var tableId = generateID();
var isPouring = false;

// on ready
document.addEventListener( 'DOMContentLoaded', function () {

    // connect to websocket server
    var socket = io.connect(serverURL);

    // register card table socket
    socket.emit('table-connect', tableId);

    // listen to phone connections
    socket.on('phone-connect', phoneConnected);
    socket.on('beer-start', beerStart);
    socket.on('beer-end', beerEnd);

    // set the qrcode
    qrCodeGenerator("http://" + serverURL + "/?id=" + tableId, "placeholder");

    // and the URL
    document.getElementById("url").innerHTML = "http://" + serverURL + "/?id=" + tableId;


    /////////////////////////////////////////////

    function hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }

    function addClass(element, cls) {
        if (!hasClass(element, cls)) {
            element.className += " " + cls;
        }
    }

    function removeClass(element, cls) {
        if (hasClass(element, cls)) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            element.className = element.className.replace(reg, ' ');
        }
    }

    var pouringLiquid = document.getElementById('beer-pouring-liquid');
    var beerTap = document.getElementById('beer-tap-top');
    var beerTapShadow = document.getElementById('beer-tap-top-shadow');

    var liquidAnimation = function(el, speed) {
        var liquidBackgroundPositionArr = getComputedStyle(el).getPropertyValue('background-position').split(" ");
        var liquidBackgroudPosition = parseFloat(liquidBackgroundPositionArr[1]);
        if (liquidBackgroudPosition > 0) {
            el.style.backgroundPosition = "50% " + ((liquidBackgroudPosition - speed) + "%");
            el.style.msBackgroundPositionY = (liquidBackgroudPosition - speed) + "%";
        } else {
            el.style.backgroundPosition = "50% " + "100%";
            el.style.msBackgroundPositionY = "100%";
        }
    };

    var render = function() {
        if (isPouring) {
            liquidAnimation(pouringLiquid, 0.5);
            addClass(pouringLiquid, 'pouring');
            beerTap.setAttribute("class", "clicked");
            beerTapShadow.setAttribute("class", "clicked");
        } else {
            removeClass(pouringLiquid, 'pouring');
            beerTap.setAttribute("class", "");
            beerTapShadow.setAttribute("class", "");
        }
        requestAnimationFrame(render)
    }

    render();

}, false);


// CALLBACK FUNCTIONS

function phoneConnected() {
    // remove banner when a phone connects
    document.getElementById("waiting-for-device").remove();
}

function beerStart() {
    isPouring = true;
}

function beerEnd() {
    isPouring = false;
}


// HELPERS

function qrCodeGenerator(value, elementid) {
    // generates a qrcode based on a value inside an html element
    var qr = qrcode(4, 'L');
    qr.addData(value);
    qr.make();
    document.getElementById(elementid).innerHTML = qr.createImgTag(4,16);
}

function generateID(){
    // generate random 5 character id for the session
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now();
    }
    var uuid = 'xxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}


