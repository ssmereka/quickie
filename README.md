# Deprecated

I combined all my efforts into [Fox-js](https://github.com/ssmereka/fox-js).  You should check it out.


--------------------------

# quickie [![Build Status](https://secure.travis-ci.org/ssmereka/quickie.png)](http://travis-ci.org/ssmereka/quickie)


A node.js template to get you started quickly so you can focus on your application, rather than configuration.

## Getting Started

1. Clone this repository

    git clone https://github.com/ssmereka/quickie.git

2. Start the server

    ./start.sh -l -t

3. Start coding.  No need to restart the server, changes will be live when you save a file.


## Config
Settings for your node application can be stored in the config file.  The config file produces a single JSON object that gets passed around your node application.  You can even configure different settings for different enviorments your appliction will run in.  The preconfigured enviorments are local, development, and production.

Before starting your server in a non-local enviorment, you may want to take a minute and update your configuration file.


## Model, View, Controller
The template is already setup to use the MVC pattern.  Looking at the code you will see folders labeled as model, view, and controller.

### Model
Everything related to storing your data can be found in the models directory.  Database schemas, functions, and so on.  Although you can use many different types of databases node, this template is currently setup to use the following:

#### MongoDB and Mongoose
MongoDB is a "semi" non-relational database that stores data in documents.  These documents are basically JSON objects and arrays, which works perfectly with the way node.js was designed.  When combined with Mongoose.JS it becomes very easy to store and retrieve data.

The template is preconfigured to work with MongoDB and Mongoose.  If you want to use these, your work is already done.

...todo: explain structure and example models here.

### Controller
These files are the backend of the database.  They should respond to the restfull structure of Node.JS by defining routes.

### View

## Middleware


## Errors


## Enviorment Modes

The server is preconfigured with 3 different modes: local, development, and production.  You can always add more or reconfigured them to meet your needs.

### Local
Designed for development on your personal computer, or local host.  If you are working on a team, local mode will make sure you don't mess up everyone elses data because it uses a local database.  Access the server at the address localhost:3000.
    
    ./start.sh -l

### Development
Are you testing your server in a production enviorment, but need to see extra debug information and logs?  This is the mode for you.  Development all of the production settings, but has all of these logs and debug messages turned on.  It uses a development database, but it is recommened make the development database a copy of the production database.

    ./start.sh -d

### Production
Once you are done testing your server and are ready to deploy it, this is the mode you should choose.  This will force the server to use the production database, SSL, all authentication, and turn off debug messages.

    ./start.sh -p


## Start Script

Use the this script to start your node app.  It will handle installation of all the server's dependencies and then start the server.  It can also start the server in different enviorment modes.  The node.js template and start script are preconfigured with three different modes local, development, and production. 

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

## Stop Script
To stop the server from running.

    ./kill.sh

## Best Practices
