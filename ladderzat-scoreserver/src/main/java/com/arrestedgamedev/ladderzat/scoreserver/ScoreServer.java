package com.arrestedgamedev.ladderzat.scoreserver;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @Author Wesley Dudok van Heel
 */
@SpringBootApplication
public class ScoreServer{
	private static Logger logger = LoggerFactory.getLogger(ScoreServer.class);

	public static void main(String[] args){

		String conf = System.getProperty("conf");
		logger.debug("{}", conf);
		if(conf == null || conf.length() < 0){
			System.setProperty("conf", "/server.conf");
		}

		SpringApplication.run(ScoreServer.class, args);
	}
}
