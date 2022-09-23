package com.arrestedgamedev.ladderzat.scoreserver;

import com.arrestedgamedev.ladderzat.scoreserver.domain.Highscore;
import com.arrestedgamedev.ladderzat.scoreserver.model.HighScoreRankingResult;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @Author Wesley Dudok van Heel
 */
@Repository
public interface HighscoreRepository extends CrudRepository<Highscore, Long>{

	@Query(
			value = "WITH scores AS (SELECT name, score, RANK() OVER (ORDER BY score DESC, created ASC) ranking FROM highscore) " +
					"SELECT name, score, ranking FROM scores LIMIT 10",
			nativeQuery = true)
	List<HighScoreRankingResult> getTop10();

	@Query(
			value = "WITH scores AS (SELECT id, RANK() OVER (ORDER BY score DESC, created ASC) rnk FROM highscore) " +
					"SELECT rnk FROM scores WHERE id = ?1",
			nativeQuery = true)
	long getRank(long id);

	@Query(
			value = "WITH scores AS (SELECT name, score, RANK() OVER (ORDER BY score DESC, created ASC) ranking FROM highscore) " +
					"SELECT name, score, ranking FROM scores WHERE ranking < ?1 ORDER BY ranking DESC LIMIT 2",
			nativeQuery = true)
	List<HighScoreRankingResult> getBetterScores(long rank);

	@Query(
			value = "WITH scores AS (SELECT name, score, RANK() OVER (ORDER BY score DESC, created ASC) ranking FROM highscore) " +
					"SELECT name, score, ranking FROM scores WHERE ranking > ?1 LIMIT 2",
			nativeQuery = true)
	List<HighScoreRankingResult> getWorseScores(long rank);
}
