package com.arrestedgamedev.ladderzat.scoreserver.model;

import java.util.List;

/**
 * @Author Wesley Dudok van Heel
 */
public class SubmissionResultModel{
	public List<HighscoreModel> top10;
	public HighscoreModel score;
	public List<HighscoreModel> better;
	public List<HighscoreModel> worse;
}
