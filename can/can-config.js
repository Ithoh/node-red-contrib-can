module.exports = function(RED) {
    "use strict";

    var bodyParser = require('body-parser');
    var CanController = require("./can-controller");
    var file = '';
    var socket = '';

    function CanConfigNode(n) {
        RED.nodes.createNode(this, n);

        // Configuration options passed by Node Red
        this.socket = n.socket;
        this.bus = n.bus;
        this.dbFile = n.dbFile;

        file = this.dbFile;
        socket = this.socket;

        // Config node state
        this.refreshRate = 20; //ms
        this.connected = false;
        this.connecting = false;
        this.subscriptions = {};

        this.controller = new CanController(this.socket, this.bus, this.dbFile, this.refreshRate);

        // Define functions called by CAN in and out nodes
        var node = this;
        this.users = {};

        this.register = function(canNode) {
            var name = canNode.name === '' ? canNode.id : canNode.name;
            node.log('Registering '+name);
            node.users[canNode.id] = canNode;
            if (!node.connected) {
                if (Object.keys(node.users).length === 1) {
                    node.connect();
                }    
            } else {
                canNode.connect();
            }
        };

        this.deregister = function(canNode,done) {
            var name = canNode.name === '' ? canNode.id : canNode.name;
            node.log('Deregister '+name);
            node.removeListener(canNode);
            delete node.users[canNode.id];
            done();
        };

        this.connect = function() {
        	if (!node.connected && !node.connecting) {
        		node.connecting = true;
                node.controller.on('connect', function(socketName) {
                    node.log('Connected to can port '+socketName);
                    node.connecting = false;
                    node.connected = true;

                    // Here we should tell all registered nodes that it's ok to listen
                    node.log('We have '+Object.keys(node.users).length+' to connect');
                    for (var user in node.users) {
                        node.log('Trying to connect '+node.users[user]);
                        node.users[user].connect();
                    }
                });
                node.controller.connect();
           }
        };

        this.addListener = function(canNode) {
            if (!node.connected) {
                node.warn('Can not register listener for '+node.controller.socket+' as it is not connected.');
                return;
            }

            if (node.subscriptions[canNode.message] === undefined) {
                node.subscriptions[canNode.message] = {};
                node.subscriptions[canNode.message][canNode.signal] = {};
            }

            var listeners = node.subscriptions[canNode.message][canNode.signal];
            // if we have no listeners (this is the first), register the listener to the can controller
            if (Object.keys(listeners).length === 0) {
            	// register listener
                node.log('Registering real listener for '+canNode.message+' '+canNode.signal);
            	node.controller.registerListener(canNode.message, canNode.signal);
            	node.controller.on('signal', function(message, signal) {
                    // Go trough all listeners and send them updates
                    for (var childNodeId in node.subscriptions[message][signal.name]) {
                        var child = node.subscriptions[message][signal.name][childNodeId];
                        child.update(signal.value);
                    }
            	});
            }

            // Add this can node as a listener
            node.subscriptions[canNode.message][canNode.signal][canNode.id] = canNode;
        };

        this.removeListener = function(canNode) {
            node.log('Removing '+canNode.id+' as lsitener.');
            delete node.subscriptions[canNode.message][canNode.signal][canNode.id];
        }
    }
    
    RED.nodes.registerType("can-config",CanConfigNode);
};
