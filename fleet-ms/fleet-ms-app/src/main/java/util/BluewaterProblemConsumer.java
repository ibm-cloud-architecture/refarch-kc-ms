package util;

import java.util.ArrayList;
import java.util.List;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;

import ibm.labs.kc.app.kafka.ApplicationConfig;
import ibm.labs.kc.app.kafka.BaseKafkaConsumer;
import ibm.labs.kc.event.model.BluewaterProblem;

public class BluewaterProblemConsumer extends BaseKafkaConsumer {
	
	public BluewaterProblemConsumer() {
		super();
		prepareConsumer(ApplicationConfig.getProperties().getProperty(ApplicationConfig.KAFKA_BW_PROBLEM_TOPIC_NAME),"BW-problem-consumer");
	}

	public List<BluewaterProblem>  consume() {
    	List<BluewaterProblem> buffer = new ArrayList<BluewaterProblem>();
    	ConsumerRecords<String, String> records = kafkaConsumer.poll(
    			Long.parseLong(ApplicationConfig.getProperties().getProperty(ApplicationConfig.KAFKA_POLL_DURATION)));
    	
	    for (ConsumerRecord<String, String> record : records) {
	    	BluewaterProblem a = gson.fromJson(record.value(), BluewaterProblem.class);
	    	buffer.add(a);
	    }
    	return buffer;
    }
	
	public static void main(String[] args) {
		System.out.println("#########################################");
		System.out.println("# Consume Bluewater event / problems    #");
		System.out.println("#########################################");
		BluewaterProblemConsumer consumer = new BluewaterProblemConsumer();
		while (true) {
			for ( BluewaterProblem p : consumer.consume()) {
				System.out.println(p.toString());
			}
			try {
				Thread.sleep(2000);
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}

}
