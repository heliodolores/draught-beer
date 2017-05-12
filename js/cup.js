var socket = null;
var serverURL = window.location.hostname + ":" +  window.location.port;
var tableId = window.location.search.substring(4);
var isPouring = false;
var MAX_BEER = 85;
var height = 0;
var pourHeight = 0;

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
        if(height < MAX_BEER) {
            socket.emit("beer-start", tableId);   
        }
    }
    isPouring = !isPouring;
}


var interval = setInterval(
    function() {
        if(isPouring) {

            pourHeight = Math.min(pourHeight + 10, 100);
            $('.pour').height((pourHeight-height)+"%");

            if(pourHeight + height >= 100) {
                height = Math.min(height + 0.3, 85);
                console.log(height);

                $('#liquid').height(height+"%");
                $('.beer-foam').height(height+"%");
                if(height === MAX_BEER) {
                    togglePouring();
                }
            }
        } else {
            if(height === MAX_BEER && pourHeight === 0) {
                window.clearInterval(interval);
            }
            pourHeight = Math.max(pourHeight - 10, 0);
            $('.pour').height((pourHeight-height)+"%");
        }
    },
    20
);

