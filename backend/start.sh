#!/bin/bash

# Start the Express.js server in the background
node app.js &

# Capture the PID of the Express.js server
NODE_PID=$!

# Start the Python server in the background
python3 python_server/app.py &

# Capture the PID of the Python server
PYTHON_PID=$!

# Wait for any process to exit
wait -n $NODE_PID $PYTHON_PID

# Exit with the status of the process that exited first
exit $?
