/*
This project uses code from this example:
Tim Ruby - "CSS Animated Beer Pour (Forked from CSS Beaker Pen)" - https://codepen.io/TimRuby/pen/jcLia
*/

var socket = null;
var serverURL = window.location.hostname + ":" +  window.location.port;
var tableId = window.location.search.substring(4);
var isPouring = false;

var cupHeight = 0;
var pourHeight = 0;

var POURING_VEL = 10;
var CUP_VEL = 0.3;
var MAX_BEER = 85;

var ANIMATION_CYCLE = 20;

// on ready
document.addEventListener( 'DOMContentLoaded', function () {
    
    // connect to websocket server
    socket = io.connect(serverURL);

    // register phone connection
    socket.emit('phone-connect', tableId);   

}, false);



function togglePouring() {
    if(isPouring){
        socket.emit("beer-end", tableId);   
    } else {
        if(cupHeight < MAX_BEER) {
            socket.emit("beer-start", tableId);   
        }
    }
    isPouring = !isPouring;
}

// BEER CYCLE
var interval = setInterval(
    function() {
        if(isPouring) {

            pourHeight = Math.min(pourHeight + POURING_VEL, 100);

            $('.pour').height((pourHeight-cupHeight)+"%");

            if(pourHeight + cupHeight >= 100) {

                cupHeight = Math.min(cupHeight + CUP_VEL, MAX_BEER);

                $('#liquid').height(cupHeight + "%");
                $('.beer-foam').height(cupHeight + "%");

                if(cupHeight === MAX_BEER) {
                    togglePouring();
                }
            }
        } else {
            if(cupHeight === MAX_BEER && pourHeight === 0) {
                window.clearInterval(interval);
            }
            pourHeight = Math.max(pourHeight - POURING_VEL, 0);
            $('.pour').height((pourHeight-cupHeight) + "%");
        }
    },
    ANIMATION_CYCLE
);

