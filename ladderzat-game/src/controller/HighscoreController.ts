import Highscore from '../model/Highscore';
import HighscoreSubmission from '../model/HighscoreSubmission';

export default class HighscoreController {
	private scores: Highscore[];
	private local = false;
	private url = "https://sirkris.trampelon.com/api"

	constructor() {
		this.scores = this.loadFromStorage();
		this.getJSON(`${this.url}/top10`).then(data => {
			this.scores = data;
		}).catch(error => {
			this.local = true;
		});
	}


	public submitScore(name: string, score: number, callback: Function) {
		if (this.local) {
			callback(this.submitScoreLocal(name, score));
			return;
		} else {
			this.submitScoreOnline(name, score, callback);
		}
	}

	private submitScoreOnline(name: string, score: number, callback: Function){
		this.postScore(name, score).then(data => {
			const score = data as HighscoreSubmission;
			this.scores = score.top10;
			callback(score);
		}).catch(error => {
			if(!this.local){
				this.local = true;
				callback(this.submitScoreLocal(name, score));
			}
		});
	}

	private submitScoreLocal(name: string, score: number): HighscoreSubmission {
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
		this.persistLocalScores(this.scores);

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
			this.persistLocalScores(scores);
			return scores;
		}
	}

	private persistLocalScores(scores: Highscore[]) {
		localStorage.setItem('highscores', JSON.stringify(scores));
	}

	public getTop(): Highscore[] {
		return this.scores;
	}

	private async postScore(name: string, score: number){
		const data = {name, score};
		try {
			const config = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data)
			}
			const response = await fetch(`${this.url}/submit`, config)
			if (response.ok) {
				return response.json();
			} else {
				this.local = true;
			}
		} catch (error) {
			this.local = true;
		}
	}

	private async getJSON(url) {
		const response = await fetch(url);
		if (!response.ok)
			throw new Error(response.statusText);

		const data = response.json();
		return data;
	}
}
