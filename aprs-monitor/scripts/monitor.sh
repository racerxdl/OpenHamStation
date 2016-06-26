#!/bin/bash

# Should be at /usr/local/openhamstation/bin/aprs-monitor

FREQ="145.570M"
BW="350e3"
PORT=6666

nohup rtl_fm -f $FREQ -s 22050 -w $BW 2>>/var/log/aprs-monitor |multimon-ng -t raw -a AFSK1200 -f alpha -A /dev/stdin 2>>/var/log/aprs-monitor | netcat -q -1 -l $PORT &

