FROM websphere-liberty:webProfile7
LABEL maintainer="IBM Cloud Architecture Solution Engineering team"

# Next three lines need to be there to avoid NPE on javametrics-rest, javametrics-dash, fleetms
COPY /target/liberty/wlp/usr/servers/defaultServer /config/
COPY /target/liberty/wlp/usr/shared/resources /config/resources/
COPY /src/main/liberty/config/jvmbx.options /config/jvm.options

# Adding permissions
USER root

RUN apt-get update -q -y && apt-get dist-upgrade -q -y && chmod g+w /config/apps

USER 1001

RUN \
   if [ "$envkc"  == "ICP" ]; then \
    echo yes | keytool -importcert -alias startssl -keystore \
      $JAVA_HOME/lib/security/cacerts -storepass changeit -file /tmp/es-cert.der; \
   fi

USER 1001

# Install required features if not present, install APM Data Collector
RUN installUtility install  defaultServer apmDataCollector-7.4 openapi-3.0 --acceptLicense

# Upgrade to production license if URL to JAR provided
ARG LICENSE_JAR_URL
ENV KAFKA_BROKERS kafka03-prod02.messagehub.services.us-south.bluemix.net:9093,kafka01-prod02.messagehub.services.us-south.bluemix.net:9093,kafka02-prod02.messagehub.services.us-south.bluemix.net:9093,kafka04-prod02.messagehub.services.us-south.bluemix.net:9093,kafka05-prod02.messagehub.services.us-south.bluemix.net:9093
ENV KAFKA_ENV IBMCLOUD
RUN \
  if [ $LICENSE_JAR_URL ]; then \
    wget $LICENSE_JAR_URL -O /tmp/license.jar \
    && java -jar /tmp/license.jar -acceptLicense /opt/ibm \
    && rm /tmp/license.jar; \
  fi
