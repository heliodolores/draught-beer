// import dependencies
var HTTP = require('http');
var FS = require('fs');
var PATH = require('path');
var IO = require('socket.io');
var OPEN = require('open');
var OS = require('os');

// Create a simple web server for both pages (cup and table)
var server = HTTP.createServer(function (request, response) {

    // Serve different pages for Phone (cup) and Desktop/Tablet (table)
    var filePath = '.' + request.url;

    if (request.url === '/' || request.url.startsWith('/?')) {
        filePath = './' + (request.url.startsWith('/?') ? 'cup.html' : 'table.html');
    }

    // Handle different file requests (just the required for this demo)
    var extname = PATH.extname(filePath);
    var contentType = 'text/html';

    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.png':
            contentType = 'image/png';
            break;      
        case '.svg':
            contentType = 'image/svg+xml';
            break;   
    }

    FS.readFile(filePath, function(error, content) {
        if (error) {
            console.log("Resource not found: " + filePath + " from request: " + request.url );
            response.writeHead(404);
            response.end();
        } else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
});


// HTTP server will listen on port 8080
server.listen(8080);

// create a WebSocket listener for the same server
var realtimeListener = IO.listen(server); 

// object to store table sockets
var tableSockets = {};

realtimeListener.on('connection', function (socket) {

    // receives a connect message from the table
    socket.on("table-connect", function (tableId) {
        // ...  and stores the table socket
        tableSockets[tableId] = socket;
        socket.tableId = tableId;
    });

    // receives a connect message from a phone
    socket.on("phone-connect", function (tableId) {
        var tableSocket = tableSockets[tableId];
        if (tableSocket) {
            // ... informs table that a phone has connected
            tableSocket.emit('phone-connect');
        }
    });

    // receives a send beer message from a phone
    socket.on("beer-start", function (tableId) {
        var tableSocket = tableSockets[tableId];
        if (tableSocket) {
            // ... informs table that a phone has connected
            tableSocket.emit('beer-start');
        }
    });

    // receives a stop beer message from a phone
    socket.on("beer-end", function (tableId) {
        var tableSocket = tableSockets[tableId];
        if (tableSocket) {
            // ... informs table that a phone has connected
            tableSocket.emit('beer-end');
        }
    });

    // device disconnected
    socket.on('disconnect', function () {
        // if it's a table
        if(socket.tableId) {
            // remove table socket
            delete tableSockets[socket.tableId];
        }
    });
});

// Get all internal IP addresses and open the Demo with that IP

var interfaces = OS.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
            console.log("Found internal IP address: " + address.address);
        }
    }
}

console.log('Opening: http://' + addresses.sort()[0] + ':8080');

// Open Demo on default browser:

OPEN('http://' + addresses.sort()[0] + ':8080');



