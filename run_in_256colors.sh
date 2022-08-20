#!/bin/sh
# Xephyr :2 -screen 640x400x8 -title xDOOM &
# sleep 1 # ugly!! waiting for Xephyr to start.
# DISPLAY=:2 "${1}" -2

# We're using SSH X11 forwarding from a server (guest VM) to Xephyr window on
# the host. So, we do it differently than the original script above.
"${1}" -2