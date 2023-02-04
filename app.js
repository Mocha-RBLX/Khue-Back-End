const { getAverageColor } = require('fast-average-color-node');

async function printAverageColor(ImageURL) {
    if (ImageURL === null) {
        return false
    }

    const color = await getAverageColor(ImageURL);
    return color;
};

const Color = printAverageColor("https://static0.gamerantimages.com/wordpress/wp-content/uploads/2020/10/arthur-morgan-rdr2-closeup.jpg");
Color.then(function(Result) {
    console.log(Result);
});

var connectedUser = []

var pushConnectedUser = function(name) {
    if (connectedUser.includes(name))
        return;

    connectedUser.push(name)
}

var removeConnectedUser = function(name) {
    const index = connectedUser.indexOf(name);

    if (index > -1) { 
        connectedUser.splice(index, 1);
        return true
    } else {
        console.log(`${name} not found!`);
        return false
    }
}

const serverPort = process.env.PORT || 3000;
console.log(serverPort);

const express = require("express");
const WebSocket = require("ws");
const SocketServer = require("ws").Server;

const server = express().listen(serverPort);

const wss = new SocketServer({server});
console.log("WS");

wss.on('connection', (ws) => {
    console.log("A user just connected");
    ws.on('message',(message)=>{
        console.log('Message recieved. (%s)', message);

        var _message = message.toString()
        if (_message.includes(" => ")) {
            if (_message.startsWith("IMAGEAPI")) {
                var _messageArgs = _message.split(" => ");
                
                var apiMethod = _messageArgs[1];
                var imageURL = _messageArgs[2];

                console.log(apiMethod)
                console.log(imageURL);

                if (apiMethod === "GetDominantColor") {
                    const api = printAverageColor(imageURL.toString());
                    api.then(function(Result) {
                        console.log(Result);
                        ws.send(`{R: ${Result.value[0]}, G: ${Result.value[1]}, B: ${Result.value[2]}}`);
                    });
                }
            }

            if (message.toString().startsWith("CHECKUSER")) {
                const args = message.toString().split(" => ");
                
                if (connectedUser.includes(`${args[1]}`)) {
                    console.log(`${args[1]} is connected.`);
                    ws.send(`${args[1]} => CONNECTED`)
                } else {
                    console.log(`${args[1]} is not connected.`);
                    ws.send(`${args[1]} => NOT_CONNECTED`)
                }
            }

            if (message.toString().startsWith("CONNECTING")) {
                const args = message.toString().split(" => ");
                console.log(`${args[1]} is connected.`);
    
                pushConnectedUser(args[1])
            }
    
            if (message.toString().startsWith("LEAVING")) {
                const args = message.toString().split(" => ");
                console.log(`${args[1]} is disconnecting.`);
    
                removeConnectedUser(args[1])
            }
        }
    });
})
