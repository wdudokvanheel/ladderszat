package com.arrestedgamedev.ladderzat.scoreserver;

import com.arrestedgamedev.ladderzat.scoreserver.domain.Highscore;
import com.arrestedgamedev.ladderzat.scoreserver.model.HighScoreRankingResult;
import com.arrestedgamedev.ladderzat.scoreserver.model.HighscoreModel;
import com.arrestedgamedev.ladderzat.scoreserver.model.SubmissionResultModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * @Author Wesley Dudok van Heel
 */
@Service
public class HighscoreService{
	private Logger logger = LoggerFactory.getLogger(HighscoreService.class);

	@Autowired
	private HighscoreRepository repo;

	public SubmissionResultModel submitScore(String name, long score, String ip){
		SubmissionResultModel result = new SubmissionResultModel();
		result.score = addNewScore(name.trim().toUpperCase(), score, ip);
		result.top10 = getTop10();

		if(result.score.rank > 10){
			result.better = getBetterScores(result.score.rank);
			result.worse = getWorseScores(result.score.rank);
		}

		return result;
	}

	public List<HighscoreModel> getTop10(){
		ArrayList<HighscoreModel> results = new ArrayList<>();
		for(HighScoreRankingResult score : repo.getTop10())
			results.add(new HighscoreModel(score));

		return results;
	}

	public HighscoreModel addNewScore(String name, long score, String ip){
		logger.info("New score from {} by {}: {}", ip, name, score);
		Highscore obj = new Highscore();
		obj.setCreated(System.currentTimeMillis());
		obj.setScore(score);
		obj.setName(name.substring(0, Math.min(8, name.length())));
		obj.setIp(ip);
		repo.save(obj);
		long rank = repo.getRank(obj.getId());
		return new HighscoreModel(obj.getName(), score, rank);
	}

	public List<HighscoreModel> getBetterScores(long rank){
		List<HighscoreModel> result = new ArrayList<>();
		List<HighScoreRankingResult> scores = repo.getBetterScores(rank);
		Collections.reverse(scores);
		for(HighScoreRankingResult score : scores){
			result.add(new HighscoreModel(score));
		}

		return result;
	}

	public List<HighscoreModel> getWorseScores(long rank){
		List<HighscoreModel> result = new ArrayList<>();
		List<HighScoreRankingResult> scores = repo.getWorseScores(rank);
		for(HighScoreRankingResult score : scores){
			result.add(new HighscoreModel(score));
		}

		return result;
	}

	public long getRank(Highscore score){
		return repo.getRank(score.getId());
	}
}
