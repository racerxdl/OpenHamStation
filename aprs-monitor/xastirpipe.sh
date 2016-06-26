#!/bin/bash
MYCALL=NOCALL
MYPASS=12960
PIPE=aprs.fifo

while true
do
  if read line <$PIPE; then
    echo $line
    if [[ $line == APRS* ]]; then
      xastir_udp_client localhost 2023 $MYCALL $MYPASS "${line:6}"
    fi
  fi
done
