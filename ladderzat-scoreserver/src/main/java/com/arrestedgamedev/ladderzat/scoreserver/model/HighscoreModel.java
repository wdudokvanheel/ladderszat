package com.arrestedgamedev.ladderzat.scoreserver.model;

/**
 * @Author Wesley Dudok van Heel
 */
public class HighscoreModel{
	public String name;
	public long score;
	public long rank;

	public HighscoreModel(HighScoreRankingResult result){
		this.name = result.getName().substring(0, Math.min(8, result.getName().length()));
		this.score = result.getScore();
		this.rank = result.getRanking();
	}

	public HighscoreModel(String name, long score, long rank){
		this.name = name;
		this.score = score;
		this.rank = rank;
	}

	public String getName(){
		return name;
	}

	public void setName(String name){
		this.name = name;
	}

	public long getScore(){
		return score;
	}

	public void setScore(long score){
		this.score = score;
	}

	@Override
	public String toString(){
		return "HighscoreModel{" +
				"name='" + name + '\'' +
				", score=" + score +
				", rank=" + rank +
				'}';
	}
}
