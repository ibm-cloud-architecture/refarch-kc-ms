# Voyage Management Service

!!! Abstract
        This service keeps track of each scheduled, current or completed voyage of container carreer vessels, being loaded with containers at a source port, sailing to a destination port and having onboard containers unloaded there.


## Build

The script `.script/buildDocker.sh` build the docker image for this service.

## Run locally as Node.js application

This is more for development purpose in your sandbox.

```bash
npm install
npm test
npm start
```

## Deployment prerequisites

Regardless of specific deployment targets (OCP, IKS, k8s), the following prerequisite Kubernetes artifacts need to be created to support the deployments of application components.  These artifacts need to be created once per unique deployment of the entire application and can be shared between application components in the same overall application deployment.

1. Create `kafka-brokers` ConfigMap
  - Command: `kubectl create configmap kafka-brokers --from-literal=brokers='<replace with comma-separated list of brokers>' -n <namespace>`
  - Example: `kubectl create configmap kafka-brokers --from-literal=brokers='broker-3-j7fxtxtp5fs84205.kafka.svc01.us-south.eventstreams.cloud.ibm.com:9093,broker-2-j7fxtxtp5fs84205.kafka.svc01.us-south.eventstreams.cloud.ibm.com:9093,broker-1-j7fxtxtp5fs84205.kafka.svc01.us-south.eventstreams.cloud.ibm.com:9093,broker-5-j7fxtxtp5fs84205.kafka.svc01.us-south.eventstreams.cloud.ibm.com:9093,broker-0-j7fxtxtp5fs84205.kafka.svc01.us-south.eventstreams.cloud.ibm.com:9093,broker-4-j7fxtxtp5fs84205.kafka.svc01.us-south.eventstreams.cloud.ibm.com:9093' -n eda-refarch`
2. Create optional `eventstreams-apikey` Secret, if you are using Event Streams as your Kafka broker provider.
  - Command: `kubectl create secret generic eventstreams-apikey --from-literal=binding='<replace with api key>' -n <namespace>`
  - Example: `kubectl create secret generic eventstreams-apikey --from-literal=binding='z...12345...notanactualkey...67890...a' -n eda-refarch`
3. If you are using Event Streams as your Kafka broker provider and it is deployed via the IBM Cloud Pak for Integration (ICP4I), you will need to create an additional Secret to store the generated Certificates & Truststores.
  - From the "Connect to this cluster" tab on the landing page of your Event Streams installation, download both the **Java truststore** and the **PEM certificate**.
  - Create the Java truststore Secret:
    - Command: `oc create secret generic <secret-name> --from-file=/path/to/downloaded/file.jks`
    - Example: `oc create secret generic es-truststore-jks --from-file=/Users/osowski/Downloads/es-cert.jks`
  - Create the PEM certificate Secret:
    - Command: `oc create secret generic <secret-name> --from-file=/path/to/downloaded/file.pem`
    - Example: `oc create secret generic es-ca-pemfile --from-file=/Users/osowski/Downloads/es-cert.pem`

## Deploy to OpenShift Container Platform (OCP)

### Deploy to OCP 3.11

**Cross-component deployment prerequisites:** _(needs to be done once per unique deployment of the entire application)_
1. If desired, create a non-default Service Account for usage of deploying and running the K Container reference implementation.  This will become more important in future iterations, so it's best to start small:
  - Command: `oc create serviceaccount -n <target-namespace> kcontainer-runtime`
  - Example: `oc create serviceaccount -n eda-refarch kcontainer-runtime`
2. The target Service Account needs to be allowed to run containers as `anyuid` for the time being:
  - Command: `oc adm policy add-scc-to-user anyuid -z <service-account-name> -n <target-namespace>`
  - Example: `oc adm policy add-scc-to-user anyuid -z kcontainer-runtime -n eda-refarch`
  - NOTE: This requires `cluster-admin` level privileges.

**Perform the following for the `voyages-ms` microservice:**
1. Build and push the Docker image by one of the two options below:
  - Create a Jenkins project, pointing to the remote GitHub repository for the `voyages-ms` microservice, and manually creating the necessary parameters.  Refer to the individual microservice's [`Jenkinsfile.NoKubernetesPlugin`](../voyages-ms/Jenkinsfile.NoKubernetesPlugin) for appropriate parameter values.
  - Manually build the Docker image and push it to a registry that is accessible from your cluster (Docker Hub, IBM Cloud Container Registry, manually deployed Quay instance):
    - `docker build -t <private-registry>/<image-namespace>/kc-voyages-ms:latest order-command-ms/`
    - `docker login -u <user> -p $(oc whoami -t) <private-registry>`
    - `docker push <private-registry>/<image-namespace>/kc-voyages-ms:latest`
2. Generate application YAMLs via `helm template`:
  - Parameters:
    - `--set image.repository=<private-registry>/<image-namespace>/<image-repository>`
    - `--set image.pullSecret=<private-registry-pullsecret>` (only required if pulling from an external private registry)
    - `--set kafka.brokersConfigMap=<kafka brokers ConfigMap name>`
    - `--set eventstreams.enabled=(true/false)` (`true` when connecting to Event Streams of any kind, `false` when connecting to Kafka directly)
    - `--set eventstreams.apikeyConfigMap=<kafka api key Secret name>`
    - `--set eventstreams.caPemFileRequired=(true/false)` (`true` when connecting to Event Streams via ICP4I)
    - `--set eventstreams.caPemSecretName=<eventstreams ca pem file secret name>` (only used when connecting to Event Streams via ICP4I)
    - `--set serviceAccountName=<service-account-name>`
    - `--namespace <target-namespace>`
    - `--output-dir <local-template-directory>`
  - Example using Event Streams via ICP4I:
   ```
   helm template --set image.repository=rhos-quay.internal-network.local/browncompute/kc-voyages-ms --set kafka.brokersConfigMap=es-kafka-brokers --set eventstreams.enabled=true --set eventstreams.apikeyConfigMap=es-eventstreams-apikey --set serviceAccountName=kcontainer-runtime --set eventstreams.caPemFileRequired=true --set eventstreams.caPemSecretName=es-ca-pemfile --output-dir templates --namespace eda-refarch chart/voyagesms
   ```
  - Example using Event Streams hosted on IBM Cloud:
  ```
  helm template --set image.repository=rhos-quay.internal-network.local/browncompute/kc-voyages-ms --set kafka.brokersConfigMap=kafka-brokers --set eventstreams.enabled=true --set eventstreams.apikeyConfigMap=eventstreams-apikey --set serviceAccountName=kcontainer-runtime --output-dir templates --namespace eda-refarch chart/voyagesms
  ```
3. Deploy application using `oc apply`:
  - `oc apply -f templates/voyagesms/templates`
