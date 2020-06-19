package util;
import java.util.ArrayList;
import java.util.List;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import ibm.labs.kc.app.kafka.ApplicationConfig;
import ibm.labs.kc.app.kafka.BaseKafkaConsumer;
import ibm.labs.kc.event.model.ShipPosition;

public class ShipEventConsumer extends BaseKafkaConsumer {

    public ShipEventConsumer() {
        super();
        prepareConsumer(ApplicationConfig.getProperties().getProperty(ApplicationConfig.KAFKA_SHIP_TOPIC_NAME),"BW-container-consumer");
    }

    public List<ShipPosition>  consume() {
    	List<ShipPosition> buffer = new ArrayList<ShipPosition>();
    	ConsumerRecords<String, String> records = kafkaConsumer.poll(
    			Long.parseLong(ApplicationConfig.getProperties().getProperty(ApplicationConfig.KAFKA_POLL_DURATION)));
    	
	    for (ConsumerRecord<String, String> record : records) {
	    	ShipPosition a = gson.fromJson(record.value(), ShipPosition.class);
	    	buffer.add(a);
	    }
    	return buffer;
    }
	
	public static void main(String[] args) {
		System.out.println("#########################################");
		System.out.println("# Consume ship events                   #");
		System.out.println("#########################################");
		ShipEventConsumer consumer = new ShipEventConsumer();
		while (true) {
			for ( ShipPosition p : consumer.consume()) {
				System.out.println(p.toString());
			}
			try {
				Thread.sleep(2000);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
	}
}