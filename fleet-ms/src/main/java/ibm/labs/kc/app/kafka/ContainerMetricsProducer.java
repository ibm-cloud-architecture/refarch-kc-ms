package ibm.labs.kc.app.kafka;

import java.util.Properties;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;

import ibm.labs.kc.event.model.ContainerMetric;

public class ContainerMetricsProducer extends BaseProducer{
	
	private static  KafkaProducer<String, String> kafkaProducer;
	private static ContainerMetricsProducer instance;
	
	private ContainerMetricsProducer() {
		 Properties p = getConfig().buildProducerProperties(getConfig().getProperties().getProperty(ApplicationConfig.KAFKA_PRODUCER_CLIENTID)+"_container");
		 System.out.println("Producer properties " + p);
		 kafkaProducer = new KafkaProducer<String, String>(p);
	     topic = getConfig().getProperties().getProperty(ApplicationConfig.KAFKA_CONTAINER_TOPIC_NAME);
	     System.out.println("Producing to " + topic);
	}
	
	public static ContainerMetricsProducer getInstance() {
		if (instance == null) instance = new ContainerMetricsProducer();
		return instance;
	}
	
	public void publishContainerMetric(ContainerMetric c) {
		 try {
			 String eventAsJson = parser.toJson(c);
			 ProducerRecord<String, String> record = new ProducerRecord<String, String>(
               topic,null,eventAsJson);
       
			 // Send record asynchronously
			 Future<RecordMetadata> future = getKafkaProducer().send(record);
			 RecordMetadata recordMetadata = future.get(5000, TimeUnit.MILLISECONDS);
			 System.out.println("@@@ Container Event " + eventAsJson + " sent -> offset:" + recordMetadata.offset() + " on partition:" + recordMetadata.partition() );
    
		} catch (InterruptedException | ExecutionException | TimeoutException e) {
			e.printStackTrace();
		} 
	}
	
	public void close() {
		 kafkaProducer.close(5000, TimeUnit.MILLISECONDS);
	}
	
	public KafkaProducer<String, String> getKafkaProducer() {
		return kafkaProducer;
	}
	
}
