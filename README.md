quickie
=======

A node.js template to get you started quickly so you can focus on your application, rather than configuration.


Start Script
============
The start script will handle installation of all the server dependencies and then start the server. 

    :::bash
    ./start.sh

You can use the help flag to see how to use the script.

    :::bash
    ./start.sh -h

    usage:  start.sh [options]

    options:
       -n   node               starts the server using node instead of forever.
       -d   development mode   forces the node server to start in development mode.
       -p   production mode    forces the node server to start in production mode.
       -l   local mode         forces the node server to start in local mode.
       -h   help               displays this menu.

    Script Variables:
        root permission:         false
        mode                     development
        node version             v0.8.4
        forever version          not installed
        nginx version            not required
        ssl certs required       false
        modules installed        false
        apache running           false
        nginx running            false
        operating system         linux