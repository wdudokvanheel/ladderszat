package com.arrestedgamedev.ladderzat.scoreserver;

import com.arrestedgamedev.ladderzat.scoreserver.model.HighScoreRankingResult;
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
class HighscoreRepoTest{
	private Logger logger = LoggerFactory.getLogger(HighscoreRepoTest.class);

	@Autowired
	private HighscoreRepository repo;

	@BeforeAll
	static void setEnvFile(){
		System.setProperty("conf", "/Users/wesley/workspace/ladderzat/server.conf");
	}

	@Test
	void injectedComponentsAreNotNull(){
		assertNotNull(repo);
	}

	@Test
	void testGetRankById(){
		long rank = repo.getRank(400);
		logger.info("rank: {}", rank);
	}

	@Test
	void getWorseThanRank(){
		List<HighScoreRankingResult> worseScores = repo.getWorseScores(400);
		for(HighScoreRankingResult score : worseScores){
			logger.info("#{} {}: {}", score.getRanking(), score.getName(), score.getScore());
		}
	}

	@Test
	void getBetterThanRank(){
		List<HighScoreRankingResult> betterScores = repo.getBetterScores(400);
		for(HighScoreRankingResult score : betterScores){
			logger.info("#{} {}: {}", score.getRanking(), score.getName(), score.getScore());
		}
	}

	@Test
	void getTop10(){
		List<HighScoreRankingResult> top10 = repo.getTop10();
		for(HighScoreRankingResult score : top10){
			logger.info("#{} {}: {}", score.getRanking(), score.getName(), score.getScore());
		}
	}
}
