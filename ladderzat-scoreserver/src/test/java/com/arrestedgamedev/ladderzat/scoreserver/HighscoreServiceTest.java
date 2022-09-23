package com.arrestedgamedev.ladderzat.scoreserver;

import com.arrestedgamedev.ladderzat.scoreserver.model.HighscoreModel;
import com.arrestedgamedev.ladderzat.scoreserver.model.SubmissionResultModel;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * @Author Wesley Dudok van Heel
 */
@SpringBootTest
class HighscoreServiceTest{
	private Logger logger = LoggerFactory.getLogger(HighscoreServiceTest.class);

	@Autowired
	private HighscoreService service;

	@BeforeAll
	static void setEnvFile(){
		System.setProperty("conf", "/Users/wesley/workspace/ladderzat/server.conf");
	}

	@Test
	void injectedComponentsAreNotNull(){
		assertNotNull(service);
	}

	@Test
	void testSaveNewRank(){
		HighscoreModel model = service.addNewScore("Test", Math.round(Math.random() * 5000), "127.0.0.1");
		logger.info("Model: {}", model);
	}

	@Test
	void getWorseScores(){
		List<HighscoreModel> scores = service.getWorseScores(400);
		for(HighscoreModel score : scores){
			logger.info("{}", score);
		}
	}

	@Test
	void getBetterScores(){
		List<HighscoreModel> scores = service.getBetterScores(400);
		for(HighscoreModel score : scores){
			logger.info("{}", score);
		}
	}

	@Test
	void submitRandomScore(){
		SubmissionResultModel model = service.submitScore("Test", Math.round(Math.random() * 10000), "127.0.0.1");
		logger.info("{}", model.better);
		logger.info("{}", model.score);
		logger.info("{}", model.worse);
		logger.info("{}", model.top10);
	}

	@Test
	void submitBestScore(){
		long highscore = service.getTop10().get(0).score + 10;
		SubmissionResultModel model = service.submitScore("TestHighScore", highscore, "127.0.0.1");
		logger.info("{}", model.better);
		logger.info("{}", model.score);
		logger.info("{}", model.worse);
		logger.info("{}", model.top10);
	}

	@Test
	void getTop10(){
		for(HighscoreModel score : service.getTop10()){
			logger.info("{}", score);
		}
	}
}
