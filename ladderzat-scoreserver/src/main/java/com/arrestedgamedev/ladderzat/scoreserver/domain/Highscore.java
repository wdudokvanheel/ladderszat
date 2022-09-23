package com.arrestedgamedev.ladderzat.scoreserver.domain;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

/**
 * @Author Wesley Dudok van Heel
 */
@Entity
public class Highscore{
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@GenericGenerator(
			name = "native",
			strategy = "native"
	)
	private long id;
	private String name;
	private long score;
	private long created;
	private String ip;

	public long getId(){
		return id;
	}

	public void setId(long id){
		this.id = id;
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

	public long getCreated(){
		return created;
	}

	public void setCreated(long created){
		this.created = created;
	}

	public String getIp(){
		return ip;
	}

	public void setIp(String ip){
		this.ip = ip;
	}
}
