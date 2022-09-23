package com.arrestedgamedev.ladderzat.scoreserver;

import com.arrestedgamedev.ladderzat.scoreserver.model.HighscoreModel;
import com.arrestedgamedev.ladderzat.scoreserver.model.HighscoreSubmissionModel;
import com.arrestedgamedev.ladderzat.scoreserver.model.SubmissionResultModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * @Author Wesley Dudok van Heel
 */
@RestController
public class WebController{
	@Autowired
	private HighscoreService service;

	@GetMapping("top10")
	@ResponseBody
	public List<HighscoreModel> getTop10(){
		return service.getTop10();
	}

	@PostMapping("submit")
	@ResponseBody
	public SubmissionResultModel submitScore(@RequestBody HighscoreSubmissionModel model, HttpServletRequest request){
		return service.submitScore(model.name, model.score, request.getRemoteAddr());
	}
}
