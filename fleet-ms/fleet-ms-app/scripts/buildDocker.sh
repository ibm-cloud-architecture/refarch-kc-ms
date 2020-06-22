

if [[ $PWD = */scripts ]]; then
 cd ..
fi
if [[ $# -eq 0 ]];then
  kcenv="LOCAL"
else
  kcenv=$1
fi

source ../../scripts/setenv.sh $kcenv
msname="fleetms"
chart=$(ls ./chart/| grep $msname)
kname="kcontainer-fleet-ms"
ns="greencompute"

echo "##########################################"
echo " Build Fleet and Ship simulator $kcenv"
echo "##########################################"


find target -iname "*SNAPSHOT*" -print | xargs rm -rf
rm -rf target/liberty/wlp/usr/servers/defaultServer/apps/expanded
tools=$(docker images | grep javatools)
if [[ -z "$tools" ]]
then
   echo "### ->  Build uses your maven to build"
   mvn install -DskipITs
else
   echo "### ->  Build uses a docker image with java and maven to build"
   docker run -v $(pwd):/home -ti ibmcase/javatools bash -c "cd /home && mvn install -DskipITs"
fi

echo "### ->  Build docker image for $kname "
if [[ "$kcenv" = "LOCAL" ]]
then
   echo "docker build -f Dockerfile-local -t ibmcase/$kname ."
   docker build -f Dockerfile -t ibmcase/$kname .
else
   docker build -f Dockerfile -t us.icr.io/ibmcaseeda/$kname .
fi
docker images | grep $kname
