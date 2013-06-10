#!/bin/bash

# -------------------------------------------------------- #
# Install, Configure, and Start Script
# -------------------------------------------------------- #
# Use this script to start the node server.  It will make 
# sure everything is installed and configured properly.  
# Then it will start the server in the correct mode.
#
#
# Currently designed to work on the following platforms:
#    1. Ubuntu 12.04 LTS
# -------------------------------------------------------- #


# -------------------------------------------------------- #
# Running the Script
# -------------------------------------------------------- #
# Run the script with the help flag (-h) for information 
# on how to use it.

# ./start.sh -h


# -------------------------------------------------------- #
# Configure Script's variables
# -------------------------------------------------------- #
# You can configure the script to work how you want it to.
# Simply modify the vairables in this section.

# Default Mode for all devices.
# If your enviorment mode is not set, then this mode will
# be enforced.
env_default="development"


# Default Log folder.
# The place where all the logs will be stored.
# Don't place logs within in the applications root
# directory or anywhere below it.  Otherwise forever will
# restart everytime a log is written.
log_folder="/var/log/keys"


# Default Mac OS Enviorment
# If your enviorment mode is not set manually, then this 
# mode will be enforced for all Mac computers.
# Leave the value blank if you don't want
# to set a default value.
#
# Optional values: local, development, or production
macOsEnv=""


# Default Linux OS Enviorment
# If your enviorment mode is not set manually, then this 
# mode will be enforced for all Linux computers.
# Leave the value blank if you don't want
# to set a default value.
#
# Optional values: local, development, or production
linuxOsEnv=""


# MongoDB
# If you use MongoDB as your database, then set this 
# variable to true so the script knows to install and
# configure it.
# You can specify the modes where MongoDB is required 
# and the script will handle installation and 
# configuration of MongoDB only when using those modes.
useMongodb=true

mongodbRequiredInModes[0]="local"
# mongodbRequiredInModes[1]="development"
# mongodbRequiredInModes[2]="production"


# Nginx
# If you use Nginx, then set this variable to true so the
# script knows to install and configure it.
# You can specify the modes where nginx is required and the 
# script will handle installation and configuration of 
# nginx only when using those modes.
useNginx=true

# nginxRequiredInModes[0]="local"
nginxRequiredInModes[1]="development"
nginxRequiredInModes[2]="production"

# Apache
# TODO: Make this work with apache
useApache=false

# apacheRequiredInModes[0]="local"
apacheRequiredInModes[0]="development"
apacheRequiredInModes[0]="production"


# SSL
# TODO: Configure ssl

# -------------------------------------------------------- #
# STOP -- You Don't Need to Change Anything Below  -- STOP
# -------------------------------------------------------- #




# -------------------------------------------------------- #
# Setup Default Values for Global Variables
# -------------------------------------------------------- #

dir=`pwd`                     # Get the directory that ran the script.
env=""                        # Node.JS Enviorment (local, development, production, etc.)
printHelpMenu=false           # Was there a request to print the help menu?
useForever=true               # Is the script going to use forever to execute the node server.
useTail=false                 # Is the user going to view or tail the node log file.
debug=false                   # Is this script in debug mode?
isForceScript=false           # Should we force the script to run, even if it is not recommended to.


# -------------------------------------------------------- #
# Detect Supported Operating Enviorment
# -------------------------------------------------------- #

envUname=`uname`
envNodeName=`uname -n`
envOsName=`uname -o`
envKernalName=`uname -s`
envMachineName=`uname -m`
envProcessor=`uname -p`
envHardwarePlatform=`uname -i`
envKernalVersion=`uname -v`
envKernalRelease=`uname -r`

envPrettyName=`cat /etc/*-release 2> /dev/null | grep PRETTY_NAME`
envPrettyName=${envPrettyName#PRETTY_NAME=}

envDistribId=`cat /etc/*-release 2> /dev/null | grep ^ID=`
envDistribId=${envDistribId#ID=}

envVersionId=`cat /etc/*-release 2> /dev/null | grep VERSION_ID`
envVersionId=${envVersionId#VERSION_ID=}

isEnviormentSupported=false
# Linux
if [[ "$envUname" == "Linux" ]]; then
  
  # Set the default linux node.js enviorment.
  if [[ "$env" == "" ]]; then
    env=$linuxOsEnv
  fi

  # Ubuntu
  if [[ "$envDistribId" == "ubuntu" ]]; then
    # 12.04.x is supported.
    if [[ "$envVersionId" == *"12.04"* ]]; then
      isEnviormentSupported=true
    fi
  fi
fi

# Windows (Cygwin)
if [[ "$envOsName" == "Cygwin" ]]; then
  
  # Windows is not supported because of becrypt.
  isEnviormentSupported=false
  
  # Windows 7 x64
  if [[ "$envKernalName" == "CYGWIN_NT-6.1-WOW64" ]]; then
    envPrettyName="Windows 7 x64, Cygwin"
  fi
fi


# Mac OS
if [[ "$envUname" == 'Darwin' ]]; then
  # Set the default mac node.js enviorment.
  if [[ "$env" == "" ]]; then
    env=$macOsEnv
  fi

  isEnviormentSupported=true
fi


# -------------------------------------------------------- #
# Command Line User Input
# -------------------------------------------------------- #

# Handle script input from command line.
for var in "$@"
do
  case "$var" in
    
    # Set the node flag
    -n | -node | [node])
      useForever=false
      ;;

    # Tail the node log file when using forever.
    -t | -tail | [tail])
      useTail=true
      ;;

    # Set the enviorment to local.
    -l | [local] | -local)
      env="local"
      ;;

    # Set the enviorment to development.
    -d | [development] | [dev] | -development | -dev)
      env="development"
      ;;

    # Set the enviorment to production.
    -p | [production] | [pro] | -production | -pro) 
      env="production"
      ;;
    
    # Print the help menu.
    -h | [help] | -help | --help)
      printHelpMenu=true
      ;;

    # Enable debug mode for the script.
    -debug | [debug] | --debug | --d)
      debug=true
      ;;

    # Force the script to run, even if it is recommended not to.
    -f | [force] | -force | --f)
      isForceScript=true
      ;;
    esac
done


# -------------------------------------------------------- #
# Default Node.JS Enviorment Mode
# -------------------------------------------------------- #

# Force the default mode if one was not yet set.
if [[ "$env" == "" ]]; then
  env=$env_default
fi


# -------------------------------------------------------- #
#  Verify Required Components and Settings
# -------------------------------------------------------- #

# Root
# -------------------------------------------------------- #
# The user must be root to perform some tasks, so lets
# check and see if they are.
isUserRoot=false                                           # Stores if the user is root or not, assume that they are not.

# Is User Root
# Checks to see if the user has root permissions.
if [[ $UID == 0 ]]; then
  isUserRoot=true;
fi

# Node
# -------------------------------------------------------- #
# Node.JS must be installed to run the server, this will
# check to see if node is installed and what version.
nodeVersion=`node -v 2> /dev/null`                         # Get the node version number
isNodeInstalled=false

if [[ "$nodeVersion" == "" ]]; then                        # If the version number is blank, we know it is not installed.
  isNodeInstalled=true;
else
  nodeVersion="not installed."
fi

# MongoDB
# -------------------------------------------------------- #
# Mongo and MongoDB may need to be installed and
# configured.  This will check to see if we need mongo, 
# if mongo is install, and if mongo is running.

mongoVersion="not required"                                # Holds the current mongo version, but assume it is not required.
isMongodbInstalled=false                                   # Is mongo install?  Lets assume it is not.

# Is MongoDB Required
# Check if MongoDB is required before we start the node 
# server.
if $useMongodb ; then
  isMongodbRequired=false
  for mode in $mongodbRequiredInModes
  do
    if [[ "$env" == "$mode" ]]; then
      isMongodbRequired=true
    fi
  done
  if ! $isMongodbRequired ; then
    useMongodb=true
  fi
fi

# Is MongoDB Installed
# If MongoDB is required, find out if it is installed.
if $useMongodb ; then    
  mongoVersion=`mongo --version 2> /dev/null`
  if [[ "$mongoVersion" == "" ]] || [[ "$mongoVersion" == *"unrecognized"* ]] || [[ "$mongoVersion" == *"found"* ]] || [[ "$mongoVersion" == *"not installed"* ]]; then
    mongoVersion="not installed"
  else
    isMongodbInstalled=true
  fi
else
  mongoVersion="not required"
fi

# Is MongoDB Running
# Check to see if MongoDB is already running.
isMongodbRunning=false
if $useMongodb && $isMongodbInstalled ; then
  type -P service mongodb &>/dev/null && isMongodbCommandAvailable=true || isMongodbCommandAvailable=false
  if [[ $isMongodbCommandAvailable == true ]]; then
    isMongodbRunningTxt=`service mongodb status` > /dev/null 2>&1
    if [[ "isMongodbRunningTxt" != "" ]]; then
      isMongodbRunning=true
    fi
  fi
fi

# Forever 
# -------------------------------------------------------- #
# In order to run the server in certain modes or enviorments
# we must make sure forever is installed.
# For now, we want to make sure it is installed globally.

foreverVersionTxt="not required"                           # Stores the version of forever.
isForeverInstalled=false                                   # Stores if forever is installed or not.

# Is Forever Installed
# If we need forever, check if it is already installed.
if $useForever ; then
  if ! $isNodeInstalled ; then
    foreverVersionTxt="not installed."
  else
    foreverVersion=`npm list -g --loglevel silent | grep forever@ 2> /dev/null`
    foreverVersion=${foreverVersion##*@}
    if [[ $foreverVersion == "" ]]; then
      foreverVersionTxt="not installed"
    else
      foreverVersionTxt="v$foreverVersion"
      isForeverInstalled=true
    fi
  fi
else
  foreverVersionTxt="not required"
fi


# Is Modules Installed
# -------------------------------------------------------- #
# Check if the node modules used by this application are
# installed or not.
#
# TODO:  Actually check for each module required, if the
# module is missing then install it.
isModulesInstalled=true

if [[ ! -d $dir'/node_modules' ]]; then
  isModulesInstalled=false
fi

# Nginx
# -------------------------------------------------------- #
# In some cases we do not need nginx, so this will check to
# see if nginx is required, installed, and/or running.

nginxVersion="not required"                                # Stores the current nginx version, assume it is not installed.
isNginxInstalled=false                                     # If nginx is installed or not. 

# Is Nginx Required
# Check to see if we need nginx.
if $useNginx ; then
  isNginxRequired=false
  for mode in $nginxRequiredInModes
  do
    if [[ "$env" == "$mode" ]]; then
      isNginxRequired=true
    fi
  done
  if ! $isNginxRequired ; then
    useNginx=false
  fi
fi

# Is Nginx Installed
# Check to see if nginx is installed.
nginxVersion=`nginx -v 2>&1`
if [[ "$nginxVersion" == *"found"* ]]; then
  nginxVersion="not installed"
else 
  nginxVersion=${nginxVersion##*/}
  nginxVersion="v$nginxVersion"
  isNginxInstalled=true
fi

# Is Nginx Running
# Check to see if nginx is already running.
isNginxRunning=false
if $isNginxInstalled ; then
  type -P service nginx &>/dev/null && isNginxCommandAvailable=true || isNginxCommandAvailable=false
  if [[ $isNginxCommandAvailable == true ]]; then
    isNginxRunningTxt=`service nginx status`
    if [[ "isNginxRunningTxt" != "" ]] && [[ "$isNginxRunningTxt" != *"not"* ]] && [[ "$isNginxRunningTxt" != *"unrecognized"* ]]; then
      isNginxRunning=true
    fi
  fi
fi

# SSL
# -------------------------------------------------------- #
# Check to see if the current mode requires ssl to be 
# configured.  If it does, then set our ssl required flag.
sslRequired=false;

for mode in $sslRequiredInModes
do
  if [[ "$env" == "$mode" ]]; then
    sslRequired=true
  fi
done

# Apache
# -------------------------------------------------------- #
# Instead of using nginx we could use apache.  This will
# check to see if apache is required, installed, and/or
# running.

apacheVersion="not required"
isApacheInstalled=false

# Is Apache Required
# Check to see if we need to use apache.
if $useApache ; then
  isApacheRequired=false
  for mode in $apacheRequiredInModes
  do
    if [[ "$env" == "$mode" ]]; then
      isApacheRequired=true
    fi
  done

  if ! $isApacheRequired ; then
    useApache=false
  fi
fi

# Is Apache Installed
# Check to see if apache is installed.
apacheVersion=`apache2 -v 2>&1`
if [[ "$apacheVersion" == *"found"* ]]; then
  apacheVersion="not installed"
else 
  isApacheInstalled=true
fi

# Is Apache Running
# Check to see if Apache is running or not.
isApacheRunning=false
if $isApacheInstalled ; then
  type -P service apache2 &>/dev/null && isApache2CommandAvailable=true || isApache2CommandAvailable=false
  if [[ $isApache2CommandAvailable == true ]]; then
    isApacheRunningTxt=`service apache2 status`
    if [[ "$isApacheRunningTxt" != *"NOT"* ]] && [[ "$isApacheRunningTxt" != *"unrecognize"* ]] && [[ "$isApacheRunningTxt" != *"not"* ]]; then
      isApacheRunning=true
    fi
  fi
fi


# -------------------------------------------------------- #
# Print Help Menu
# -------------------------------------------------------- #

if [[ $printHelpMenu = true ]]; then

  if $isEnviormentSupported ; then
    isEnviormentSupportedTxt="Supported"
  else
    isEnviormentSupportedTxt="Not Supported"
  fi

  if $isNginxRunning ; then
    isNginxRunningTxt="and is running."
  else
    isNginxRunningTxt="and is not running."
  fi

  if $isApacheRunning ; then
    isApacheRunningTxt="and is running."
  else
    isApacheRunningTxt="and is not running."
  fi

  if $isMongodbRunning ; then
    isMongodbRunningTxt="and is running."
  else
    isMongodbRunningTxt="and is not running."
  fi

  if $sslRequired ; then
    isSslRequiredTxt="is required."
  else
    isSslRequiredTxt="is not required."
  fi

  if $isModulesInstalled ; then
    isModulesInstalledTxt="are installed."
  else
    isModulesInstalledTxt="are not installed."
  fi

  if $useTail ; then
    useTailTxt="use tail."
  else
    useTailTxt="don't use tail."
  fi

  if $isUserRoot ; then
    isUserRootTxt="user is root.";
  else
    isUserRootTxt="user is not root.";
  fi

  echo -e "Starts the node.js server with the correct settings.\n"
  echo -e "usage: \tstart.sh [options]\n"
  echo "options:"
  echo -e "   -n   node \t\t\t starts the server using node instead of forever."
  echo -e "   -d   development mode \t forces the node server to start in development mode."
  echo -e "   -p   production mode \t forces the node server to start in production mode."
  echo -e "   -l   local mode \t\t forces the node server to start in local mode."
  echo -e "   -h   help \t\t\t displays this menu."
  echo -e "\nDetected Enviorment:"
  echo -e "\tOperating System: \t" $envPrettyName "\t" $isEnviormentSupportedTxt
  echo -e "\tNode.JS Enviorment: \t $env mode"
  if $debug ; then
    echo -e "\nScript Variables:"
    echo -e "\tapache:  \t" $apacheVersion $isApacheRunningTxt
    echo -e "\tforever: \t" $foreverVersionTxt
    echo -e "\tmongodb: \t" $mongoVersion $isMongodbRunningTxt
    echo -e "\tnginx:   \t" $nginxVersion $isNginxRunningTxt
    echo -e "\tnode:    \t" $nodeVersion
    echo -e "\troot:    \t" $isUserRootTxt
    echo -e "\tssl:     \t" $isSslRequiredTxt
    echo -e "\tmodules: \t" $isModulesInstalledTxt
    echo -e "\ttail:    \t" $useTailTxt
  fi
  exit
fi


# -------------------------------------------------------- #
#  Ensure the Enviorment is Supported
# -------------------------------------------------------- #

# Check if the OS is supported or not.  If an OS is not
# not supported, it is because of a depenency issue or the
# simple fact that the script has not been tested that
# platform.
if ! $isEnviormentSupported && ! $isForceScript ; then
  echo -e "\n--------------------------------------------------"
  echo "   WARNING --- Operating System Not Supported"
  echo "--------------------------------------------------"
  echo -e "\n$envPrettyName is currently not supported."
  echo -e "You can force the script to run using the -f flag,"
  echo -e "however the results may be unexpected.\n"
  echo -e "   $0 -f $*"
  exit 1
fi


# -------------------------------------------------------- #
#  Ensure User Has Root Permission
# -------------------------------------------------------- #

# Note:  If other platforms are supported in the future, we
#        we will need to update this root check.
if [[ $isUserRoot == false ]]; then
  echo "Please run this script with sudo:"
  echo "sudo $0 $*"
  exit 1
fi


# -------------------------------------------------------- #
#  Install Node.JS and NPM
# -------------------------------------------------------- #

# If node.js is not installed, then install it.
if $isNodeInstalled ; then
  echo "Installing node.js, this could take some time..."
  sudo apt-get update -y --force-yes -qq
  sudo apt-get install -y --force-yes -qq python-software-properties > /dev/null 2>&1
  sudo add-apt-repository -y ppa:chris-lea/node.js > /dev/null 2>&1
  sudo apt-get update -y --force-yes -qq
  sudo apt-get install -y --force-yes -qq nodejs > /dev/null 2>&1

  nodeVersion=`node -v 2> /dev/null`
  if [[ $nodeVersion == "" ]]; then
    echo [ ERROR ] There was a problem installing node.js.
    exit 1
  else
    echo [ OK ] Node.js is now installed.
    isNodeInstalled=true
  fi
else
  echo [ OK ] Node.js is installed.
fi


# -------------------------------------------------------- #
#  Install Modules
# -------------------------------------------------------- #

# If the projects node modules are not installed, then
# install them.
if [[ $isModulesInstalled == false ]]; then
  echo "Installing node application dependency modules, this could take some time..."

  # Bcrypt requires build-essential
  sudo apt-get install -y --force-yes -qq build-essential > /dev/null 2>&1

  # Install all the node application's modules, but only
  # display warning messages to the user.
  sudo npm install --loglevel silent

  # Verify that we were successful.
  if [[ -d $dir'/node_modules' ]]; then
    echo [ OK ] Node modules were installed successfully.
    isModulesInstalled=true
  else
    echo [ ERROR ] Node modules did not install properly.
    exit 1
  fi
else
  echo [ OK ] Node modules are installed.
fi


# -------------------------------------------------------- #
#  Install Forever Globally
# -------------------------------------------------------- #

# Check to see if we need forever installed.
if $useForever ; then

  # Check to make sure forever is installed globally, if it
  # is not, then install it.
  if $isForeverInstalled ; then
    echo "Installing Forever Globally..."
    sudo npm install forever -g --loglevel error

    # Get the forever version
    foreverVersion=`npm list -g --loglevel silent | grep forever@ 2> /dev/null`
    foreverVersion=${foreverVersion##*@}

    # Verify the installation.
    if [[ "$foreverVersion" == "" ]]; then
      echo [ ERROR ] Forever was not installed.
      exit 1
    else
      echo [ OK ] Forever is installed globally.
      isForeverInstalled=true
    fi
  else
    echo [ OK ] Forever is installed globally.
  fi
fi


# -------------------------------------------------------- #
#  Install and Configure MongoDB
# -------------------------------------------------------- #

# Check if MongoDB is installed and install it if we need to.
if $useMongodb && ! $isMongodbInstalled ; then
  echo "Installing MongoDB, this could take some time..."
  sudo apt-key adv -qq --keyserver keyserver.ubuntu.com --recv 7F0CEB10 > /dev/null 2>&1
  
  # TODO: Hide this line from output.
  echo "deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen" | tee -a /etc/apt/sources.list.d/10gen.list > /dev/null 2>&1
  sudo apt-get update -y --force-yes -qq
  sudo apt-get install -y --force-yes -qq mongodb-10gen

  # Verify the installation.
  mongoVersion=`mongo --version 2> /dev/null`
  if [[ "$mongoVersion" == "" ]] || [[ "$mongoVersion" == *"unrecognized"* ]] || [[ "$mongoVersion" == *"found"* ]] || [[ "$mongoVersion" == *"not installed"* ]]; then
    echo [ ERROR ] MongoDB was not installed successfully.
  else
    echo [ OK ] $mongoVersion is now installed.
    isMongodbInstalled=true
    
    # Check if mongodb is running after we did the install.
    type -P service mongodb &>/dev/null && isMongodbCommandAvailable=true || isMongodbCommandAvailable=false
    if [[ $isMongodbCommandAvailable == true ]]; then
      isMongodbRunningTxt=`service mongodb status` > /dev/null 2>&1
      if [[ "isMongodbRunningTxt" != "" ]]; then
        isMongodbRunning=true
      fi
    fi
  fi
else
  echo [ OK ] $mongoVersion is installed.
fi


# -------------------------------------------------------- #
#  Install and Configure Nginx
# -------------------------------------------------------- #

# Check to see if we need to install nginx.
if $useNginx; then
  
  # If nginx is required, ensure it is installed.
  if $isNginxInstalled ; then
    echo "Installing nginx using apt-get, this could take some time..."
    sudo apt-get install -qq -y --force-yes nginx
  else
    echo [ OK ] Nginx is installed.
  fi

  # Check if our install was successfull.
  nginxVersion=`nginx -v 2>&1`
  if [[ "$nginxVersion" == *"found"* ]]; then
    nginxVersion="not installed."
  else 
    nginxVersion=${nginxVersion##*/}
    nginxVersion="v$nginxVersion"
    isNginxInstalled=true
  fi

  # If we are going to run nginx, then we need to make
  # sure apache is not running.
  if $isApacheInstalled && $isApacheRunning ; then
    echo "[ Warning ] Stopping apache, nginx and apache cannot run at the same time."

    sudo /etc/init.d/apache2 stop
  else
    echo [ OK ] Apache is not running.
  fi

  # Make sure nginx is configured to startup on boot and
  # shutdown when the computer turns off.
  if [[ `update-rc.d nginx defaults` == *"already exist." ]]; then
    echo [ OK ] Nginx is configured to startup on boot.
    echo [ OK ] Nginx is configured to stop on shutdown.
  else
    # TODO: Actually configure nginx to startup and shutdown.
    echo [ ERROR ] Nginx is not configured to start on boot.
    echo [ ERROR ] Nginx is not configured to stop on shutdown.
    exit 1
  fi

  # If our nginx config file is not symbolically linked to
  # available sites, then make a link.
  if ! [ -e /etc/nginx/sites-available/keys ]; then
    sudo ln -s $dir/config/nginx /etc/nginx/sites-available/keys

    if ! [ -e /etc/nginx/sites-available/keys ]; then
      echo [ ERROR ] Nginx could not symbolically link $dir/config/nginx to /etc/nginx/sites-available/keys.
      exit 1
    else
      echo [ OK ] Nginx available sites are now configured.
    fi
  else
    echo [ OK ] Nginx available sites are configured.
  fi

  # If our nginx config file is not symbolically linked to
  # enabled sites, then make a link.
  if ! [ -e /etc/nginx/sites-enabled/keys ]; then
    sudo ln -s $dir/config/nginx /etc/nginx/sites-enabled/keys

    if ! [ -e /etc/nginx/sites-enabled/keys ]; then
      echo [ ERROR ] Nginx could not symbolically link $dir/config/nginx to /etc/nginx/sites-enabled/keys.
      exit 1
    else
      echo [ OK ] Nginx enabled sites are now configured.
    fi
  else
    echo [ OK ] Nginx enabled sites are configured.
  fi
fi


# -------------------------------------------------------- #
#  Configure SSL
# -------------------------------------------------------- #

# Check if the enviorment requires us to use SSL.  If it
# does then make sure it is configured.
if $sslRequired ; then

  # If our ssl certificate file is not symbolically linked, 
  # then link it.
  if ! [ -e /etc/ssl/livioconnect.com.pem ]; then
    sudo ln -s $dir/config/livioconnect.com.pem /etc/ssl/livioconnect.com.pem

    if ! [ -e /etc/ssl/livioconnect.com.pem ]; then
      echo [ ERROR ] Could not symbolically link the ssl certificate.
      exit 1
    else
      echo [ OK ] SSL certificate is now configured.
    fi
  else
    echo [ OK ] SSL certificate is configured.
  fi
fi


# -------------------------------------------------------- #
#  Start Nginx
# -------------------------------------------------------- #

# Check to see if we are using nginx.
if $useNginx ; then

  if ! $isNginxRunning ; then
    sudo service nginx start
    
    # Check and see if nginx started successfully.
    type -P service nginx &>/dev/null && isNginxCommandAvailable=true || isNginxCommandAvailable=false
    if [[ $isNginxCommandAvailable == true ]]; then
      isNginxRunningTxt=`service nginx status`
      if [[ "isNginxRunningTxt" != "" ]] && [[ "$isNginxRunningTxt" != *"not"* ]] && [[ "$isNginxRunningTxt" != *"unrecognized"* ]]; then
        echo [ OK ] Nginx is now running.
        isNginxRunning=true
      else
        echo [ Error ] Nginx failed to start.
        exit 1
      fi
    fi  
  else
    echo [ OK ] Nginx is running.
  fi
fi


# -------------------------------------------------------- #
#  Start MongoDB
# -------------------------------------------------------- #
if $useMongodb && $isMongodbInstalled ; then

  if ! $isMongodbRunning ; then
    sleep 3
    sudo service mongodb restart

    # Check to see if MongoDB is running.
    type -P service mongodb &>/dev/null && isMongodbCommandAvailable=true || isMongodbCommandAvailable=false
    if [[ $isMongodbCommandAvailable == true ]]; then
      isMongodbRunningTxt=`service mongodb status` > /dev/null 2>&1
      if [[ "isMongodbRunningTxt" != "" ]]; then
        echo [ OK ] MongoDB is now running.
        isMongodbRunning=true
      else
        echo [ Error ] MongoDB failed to start.
        exit 1
      fi
    fi
  else
    echo [ OK ] MongoDB is running.
  fi
fi

# -------------------------------------------------------- #
# Create Resources & Start the Server
# -------------------------------------------------------- #

# If we are using forever, then make sure we have a log
# folder and clear the old node log file.  Then start the
# server and return.
if $useForever ; then
  
  if [[ ! -d $log_folder ]]; then
    sudo mkdir "$log_folder"

    if [[ ! -d $log_folder ]]; then
      echo [ Error ] Failed to create log folder $log_folder
      exit 1
    else
      echo [ OK ] Created log folder $log_folder.
    fi
  fi

  # Clear the node log file.
  sudo echo "START NODE LOG FILE" > "$log_folder/node.log"

  sudo NODE_ENV="$env" forever --minUptime 1000 --spinSleepTime 1000 -a -w -l "$log_folder/node.log" start server.js 
else 
  
  # Run the server using node.
  NODE_ENV="$env" node server.js
fi

# -------------------------------------------------------- #
# View Logs With Tail
# -------------------------------------------------------- #

# If we want to view the logs being written by node.
if $useTail && $useForever ; then
  tail -F "$log_folder/node.log"
fi