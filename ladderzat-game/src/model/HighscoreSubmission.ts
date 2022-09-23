import Highscore from './Highscore';

export default class HighscoreSubmission {
	constructor(public score: Highscore, public top10: Highscore[], public better: Highscore[] = null, public worse: Highscore[] = null) {}
}
