node-red-contrib-can
==============================
<a href="http://nodered.org" target="_new">Node-RED</a> node based on <a href="https://github.com/sebi2k1/node-can">socketcan</a> for reading a KCD file and handeling CAN-messages sent and received for this.

Install
-------
Run the following command in your Node-RED user directory - typically `~/.node-red`

        npm install node-red-contrib-can

Usage
-----
You will need to have can-utils installed on your machine. Since this package is only available for unix systems you will need a unix machine to run this. `sudo apt-get install can-utils` should work in ubuntu.

The node can be 'enabled' or 'disabled' by sending a 'msg.can' message of 'enable' or 'disable'. This makes it easy to to halt or start can messages while the flow is running or based of external logic.

Tips
-----
Since this only works with kayak (kcd) files I would recommend having a look at <a href="https://github.com/ebroecker/canmatrix">canmatrix</a> which is a python tool to convert between different standards.

Acknowledgements
==============================

Thanks to <a href="https://github.com/sebi2k1/node-can">sebi2k1</a> for his excellent NodeJs wrapper around socketcan. <a href="https://github.com/ebroecker/canmatrix">ebroecker</a> for his canmatrix convertion tool.
