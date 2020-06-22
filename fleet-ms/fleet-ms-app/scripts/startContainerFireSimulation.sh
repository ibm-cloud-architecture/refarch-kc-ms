#!/bin/bash

if [ $# -eq 1 ]
then
  hostn=$1
else
  hostn="localhost:9080"
fi
url="http://$hostn/fleetms/ships/simulate"

curl -v -H "accept: */*" -H "Content-Type: application/json" -d @./shipCtlFire.json $url