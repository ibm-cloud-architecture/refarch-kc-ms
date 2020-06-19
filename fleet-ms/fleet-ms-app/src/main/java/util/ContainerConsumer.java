package util;

import java.util.ArrayList;
import java.util.List;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;

import ibm.labs.kc.app.kafka.ApplicationConfig;
import ibm.labs.kc.app.kafka.BaseKafkaConsumer;
import ibm.labs.kc.event.model.ContainerMetric;

/**
 * Simple Kafka topic consumer to get container metrics
 * 
 * @author jerome boyer
 *
 */
public class ContainerConsumer extends BaseKafkaConsumer {
	
	public ContainerConsumer() {
		super();
		prepareConsumer(ApplicationConfig.getProperties().getProperty(ApplicationConfig.KAFKA_CONTAINER_TOPIC_NAME),"BW-container-consumer");
	}

	public List<ContainerMetric>  consume() {
    	List<ContainerMetric> buffer = new ArrayList<ContainerMetric>();
    	ConsumerRecords<String, String> records = kafkaConsumer.poll(
    			Long.parseLong(ApplicationConfig.getProperties().getProperty(ApplicationConfig.KAFKA_POLL_DURATION)));
    	
	    for (ConsumerRecord<String, String> record : records) {
	    	ContainerMetric a = gson.fromJson(record.value(), ContainerMetric.class);
	    	buffer.add(a);
	    }
    	return buffer;
    }
	
	public static void main(String[] args) {
		System.out.println("#########################################");
		System.out.println("# Consume container metrics events    #");
		System.out.println("#########################################");
		ContainerConsumer consumer = new ContainerConsumer();
		System.out.print("@@@ topic:"+ApplicationConfig.getProperties().getProperty(ApplicationConfig.KAFKA_CONTAINER_TOPIC_NAME));
		boolean cont = true;
		while (cont) {
			for ( ContainerMetric p : consumer.consume()) {
				System.out.println(p.toString());
			}
			try {
				Thread.sleep(2000);
			} catch (InterruptedException e) {
				e.printStackTrace();
				cont = false;
			}
		}
	}

}
