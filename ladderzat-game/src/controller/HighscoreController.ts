import Highscore from '../model/Highscore';
import HighscoreSubmission from '../model/HighscoreSubmission';

export default class HighscoreController {
	private scores: Highscore[];
	private local = true;

	constructor() {
		this.scores = this.loadFromStorage();
	}

	private loadFromStorage(): Highscore[] {
		let storage = localStorage.getItem('highscores');
		if (storage) {
			let scores = JSON.parse(storage);
			return scores;
		} else {
			let scores = new Array();
			scores.push(new Highscore(1, 'SIRKRIS', 5000));
			scores.push(new Highscore(2, 'SIRKRIS', 4000));
			scores.push(new Highscore(3, 'SIRKRIS', 3000));
			scores.push(new Highscore(4, 'SIRKRIS', 2000));
			scores.push(new Highscore(5, 'SIRKRIS', 1500));
			scores.push(new Highscore(6, 'SIRKRIS', 1000));
			scores.push(new Highscore(7, 'SIRKRIS', 750));
			scores.push(new Highscore(8, 'SIRKRIS', 500));
			scores.push(new Highscore(9, 'SIRKRIS', 250));
			scores.push(new Highscore(10, 'SIRKRIS', 100));
			this.saveLocalScores(scores);
			return scores;
		}
	}

	public submitScore(name: string, score: number, callback: Function) {
		if (this.local) {
			callback(this.submitScoreLocally(name, score));
			return;
		} else {

		}
	}

	private saveLocalScores(scores: Highscore[]) {
		localStorage.setItem('highscores', JSON.stringify(scores));
	}

	private submitScoreLocally(name: string, score: number): HighscoreSubmission {
		let index = 0;
		let highscore = new Highscore(0, name, score);
		for (; index < this.scores.length; index++) {
			if (score > this.scores[index].score) {
				highscore.rank = index + 1;
				this.scores.splice(index, 0, highscore);
				break;
			}
		}

		if (highscore.rank == 0) {
			highscore.rank = this.scores.length + 1;
			this.scores.push(highscore);
		} else {
			index++;
			for (; index < this.scores.length; index++) {
				this.scores[index].rank = this.scores[index].rank + 1;
			}
		}
		this.saveLocalScores(this.scores);

		if (highscore.rank <= 10) {
			return new HighscoreSubmission(highscore, this.scores.slice(0, 10));
		} else {
			index = highscore.rank - 1;
			let better = new Array();
			let worse = new Array();

			better.push(this.scores[index - 2]);
			better.push(this.scores[index - 1]);

			if (index < this.scores.length - 1)
				worse.push(this.scores[index + 1]);
			if (index < this.scores.length - 2)
				worse.push(this.scores[index + 2]);

			return new HighscoreSubmission(highscore, null, better, worse);
		}
	}

	public getTop(): Highscore[] {
		return this.scores;
	}
}
