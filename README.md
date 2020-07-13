# IBM Garage Event-Driven Reference Architecture

## Reefer Container Shipment Voyage and Fleet Simulation

This project is a component of the [Reefer Container Shipment reference implementation](https://ibm-cloud-architecture.github.io/refarch-kc/) of the [IBM Garage Event-Driven Architecture](https://ibm-cloud-architecture.github.io/refarch-eda/) reference architecture. The [Fleet microservice](https://github.com/ibm-cloud-architecture/refarch-kc-ms/tree/master/fleet-ms) - implemented with Java, the MicroProfile framework, and OpenLiberty runtime - is responsible to manage fleet of container carrier ships. The [Voyages microservice](https://github.com/ibm-cloud-architecture/refarch-kc-ms/tree/master/voyages-ms) - implemented with NodeJS - keeps track of each voyage of a container ship, being loaded with containers at a source port, sailing to a destination port and having onboard containers unloaded there.

For complete documentation on this project and its peer microservices, reference the **[Fleet](https://ibm-cloud-architecture.github.io/refarch-kc/microservices/fleet/)** and **[Voyages](https://ibm-cloud-architecture.github.io/refarch-kc/microservices/voyages/)** microservice pages in the [Reefer Container Shipment reference implementation](https://ibm-cloud-architecture.github.io/refarch-kc/) gitbook.

---

## Build & Run

This project is built using the [Appsody](https://appsody.dev/) development framework. For a full understanding of Appsody applications, reference the Appsody [documentation](https://appsody.dev/docs) and [getting started](https://appsody.dev/docs/getting-started/) material respectively.

Specific deployment parameters are exposed in the `app-deploy.yaml` file for both [Fleet](https://github.com/ibm-cloud-architecture/refarch-kc-ms/blob/master/fleet-ms/app-deploy.yaml) and [Voyages](https://github.com/ibm-cloud-architecture/refarch-kc-ms/blob/master/voyages-ms/app-deploy.yaml).

For complete documentation on the necessary deployment configuration and parameters, reference the **[Fleet](https://ibm-cloud-architecture.github.io/refarch-kc/microservices/fleet/)** and **[Voyages](https://ibm-cloud-architecture.github.io/refarch-kc/microservices/voyages/)** microservice pages in the [Reefer Container Shipment reference implementation](https://ibm-cloud-architecture.github.io/refarch-kc/) gitbook.

---

## Contribute

As this reference implementation is part of the Event-Driven Architeture reference architecture, the overall [contribution policies](./CONTRIBUTING.md) apply here.

**Maintainers:**
* [Jerome Boyer](https://www.linkedin.com/in/jeromeboyer/)
* [Jesus Almaraz](https://www.linkedin.com/in/jesus-almaraz-hernandez/)
* [Rick Osowski](https://www.linkedin.com/in/rosowski/)

**Contributors:**
* [Edoardo Comar](https://www.linkedin.com/in/edoardo-comar/)
* [Hemankita Perabathini](https://www.linkedin.com/in/hemankita-perabathini/)
* [Mickael Maison](https://www.linkedin.com/in/mickaelmaison/)
