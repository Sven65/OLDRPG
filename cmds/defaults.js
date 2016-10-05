/* jshint esversion: 6, undef: true, unused: true, eqnull:true, sub: true, eqeqeq: true */


/*
	Defaults.js - Main file for DiscordRPG.
	Copyright (c) Mackan <thormax5@gmail.com> & The Discord Dungeons Team
*/


/* TODO

	- Change all the bot.sendMessage(); statements into string formatting, (AKA use {} instead of +string+)
	- Add Pet stuff ffs

*/

/* START: Require Modules */
const helper = require("../util/Helper.js");
const useful = require("../util/Useful.js");
const filter = require('fuzzaldrin');
const fix = require("entities");
const request = require("request");
const sha512 = require('js-sha512').sha512;
const settings = require("../settings.json");
const fs = require('fs');

const redis = require("redis"); // Database client
const client = redis.createClient(); // Get a client for DB
let thisBot;

const mobs = require("../data/mobs.json");
const achievements = require("../data/achievements.json");
const pets = require("../data/pets.json");
let gNameBlacklist = require("../data/blacklisted.json");
var strings = require("../util/Strings.js");

//var gicons = require("../data/gicons.json");
//var gitems = require("../data/gitems.json");
//var ignored = require("../data/ignored.json");
//var battles = require("../data/battles.json");
//var ialias = require("../data/ialias.json");
//var servers = require("../data/servers.json");
//var alc = require("../data/alchemy.json");
//var brews = require("../data/brews.json");
//var adventures = require("../data/adventures.json");
//var crafts = require("../data/crafting.json");



/* END: Require Modules */

/* START: Initialize Variables */

let started = true;
users = {}; // Global variable users
let guilds = {};
let items = {};
let gitems = {};
let gicons = [];
let trades = {};
let crafts = {};

let itmObj = []; // Items
let gitmObj = []; // Guild items
//let users = global.users;


/* END: Initialize Variables */

client.on("error", function (err) {
	console.log("Error " + err);
});

/*let ignore = global.ignore;
let servers = global.servers;
let guilds = global.guilds;
let users = global.users;
let adventures = global.adventures;
let trades = global.trades;
let crafts = global.crafts;
let items = global.items;
let gicons = global.gicons;
let gitems = global.gitems;
let battles = global.battles;
*/

/* START: Pull data from DB */

try{
	client.get("users", function(err, reply) { // Pull users
		if(err){ console.dir(err); return;}
		if(reply !== null){
			users = JSON.parse(reply);
			if(thisBot !== undefined && thisBot !== null){
				thisBot.ipc.emit("redis", {id: thisBot.ipc.config.id, message: "Got users from redis."});
			}
			return;
		}else{
			try{
				users = require("../data/users.json");
				if(thisBot !== undefined && thisBot !== null){
					thisBot.ipc.emit("redis", {id: thisBot.ipc.config.id, message: "Got users from file."});
				}
			}catch(e){
				users= require("../../users.json");
				if(thisBot !== undefined && thisBot !== null){
					thisBot.ipc.emit("redis", {id: thisBot.ipc.config.id, message: "Got users from file."});
				}

			}
		}
	});
	
}catch(e){
	try{
		users = require("../data/users.json");
		if(thisBot !== undefined && thisBot !== null){
			thisBot.ipc.emit("redis", {id: thisBot.ipc.config.id, message: "Got users from file."});
		}
		return;
	}catch(e){
		users = require("../../users.json");
		if(thisBot !== undefined && thisBot !== null){
			thisBot.ipc.emit("redis", {id: thisBot.ipc.config.id, message: "Got users from file."});
		}
		return;
	}
}

try{
	client.get("guilds", function(err, reply) {
		if(err){ console.dir(err); return;}
		if(reply !== null){
			guilds = JSON.parse(reply);
			if(thisBot !== undefined && thisBot !== null){
				thisBot.ipc.emit("redis", {id: thisBot.ipc.config.id, message: "Got guilds from redis."});
			}
			return;
		}else{
			console.log("rip");
		}
	});
	
}catch(e){
	console.log(e);
}

try{
	client.get("adventures", function(err, reply) {
		if(err){ console.dir(err); return;}
		if(reply !== null){
			adventures = JSON.parse(reply);
			if(thisBot !== undefined && thisBot !== null){
				thisBot.ipc.emit("redis", {id: thisBot.ipc.config.id, message: "Got adventures from redis."});
			}
			return;
		}else{
			console.log("rip");
		}
	});
	
}catch(e){
	console.log(e);
}

try{
	client.get("battles", function(err, reply) {
		if(err){ console.dir(err); return;}
		if(reply !== null){
			battles = JSON.parse(reply);
			if(thisBot !== undefined && thisBot !== null){
				thisBot.ipc.emit("redis", {id: thisBot.ipc.config.id, message: "Got battles from redis."});
			}
			return;
		}else{
			console.log("rip");
		}
	});
	
}catch(e){
	console.log(e);
}

try{
	client.get("items", (err, reply) => {
		if(err){ console.dir(err); return;}
		if(reply !== null){
			items = JSON.parse(reply);
			Object.keys(items).map((a) => { // loop through the item IDs
				itmObj.push(items[a]); // Push item ID into itmObj
			});
			if(thisBot !== undefined && thisBot !== null){
				thisBot.ipc.emit("redis", {id: thisBot.ipc.config.id, message: "Got items from redis."});
			}
			return;
		}else{
			if(thisBot !== undefined && thisBot !== null){
				thisBot.ipc.emit("redis", {id: thisBot.ipc.config.id, message: "Error getting items from redis."});
			}
			items = require("../data/items.json");
		}
	});
}catch(e){
	console.log(e);
}

try{
	client.get("gitems", (err, reply) => {
		if(err){ console.dir(err); return;}
		if(reply !== null){
			gitems = JSON.parse(reply);
			Object.keys(gitems).map((a) => { // loop through the guild item IDs
				gitmObj.push(gitems[a]); // Push item ID into gitmObj
			});
			if(thisBot !== undefined && thisBot !== null){
				thisBot.ipc.emit("redis", {id: thisBot.ipc.config.id, message: "Got guild items from redis."});
			}
			return;
		}else{
			if(thisBot !== undefined && thisBot !== null){
				thisBot.ipc.emit("redis", {id: thisBot.ipc.config.id, message: "Error getting guild items from redis."});
			}
			gitems = require("../data/gitems.json");
		}
	});
}catch(e){
	console.log(e);
}

try{
	client.get("gicons", (err, reply) => {
		if(err){ console.dir(err); return;}
		if(reply !== null){
			gicons = JSON.parse(reply);
			if(thisBot !== undefined && thisBot !== null){
				thisBot.ipc.emit("redis", {id: thisBot.ipc.config.id, message: "Got guild icons from redis."});
			}
			return;
		}else{
			if(thisBot !== undefined && thisBot !== null){
				thisBot.ipc.emit("redis", {id: thisBot.ipc.config.id, message: "Error getting guild items from redis."});
			}
			gicons = require("../data/gicons.json");
		}
	});
}catch(e){
	console.dir(e);
}

try{
	client.get("trades", (err, reply) => {
		if(err){ console.dir(err); return;}
		if(reply !== null){
			trades = JSON.parse(reply);
			if(thisBot !== undefined && thisBot !== null){
				thisBot.ipc.emit("redis", {id: thisBot.ipc.config.id, message: "Got trades from redis."});
			}
			return;
		}else{
			if(thisBot !== undefined && thisBot !== null){
				thisBot.ipc.emit("redis", {id: thisBot.ipc.config.id, message: "Error getting trades from redis."});
			}
		}
	});
}catch(e){
	console.dir(e);
}

try{
	client.get("crafts", (err, reply) => {
		if(err){ console.dir(err); return;}
		if(reply !== null){
			crafts = JSON.parse(reply);
			if(thisBot !== undefined && thisBot !== null){
				thisBot.ipc.emit("redis", {id: thisBot.ipc.config.id, message: "Got crafts from redis."});
			}
			return;
		}else{
			if(thisBot !== undefined && thisBot !== null){
				thisBot.ipc.emit("redis", {id: thisBot.ipc.config.id, message: "Error getting crafts from redis."});
			}
		}
	});
}catch(e){
	console.dir(e);
}

/* END: Pull data from DB */

let version = require("../package.json").version;

// Cache busting, (The &r=[num] of item embed links)
let minCache = 1000001; // Don't touch this
let maxCache = 10000000; // Don't touch this either


function formatNumber(num){
	return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"); // Number formatting with commas
}

String.prototype.capFirst = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function sthms(o){o=Number(o);var r=Math.floor(o/3600),n=Math.floor(o%3600/60),s=Math.floor(o%3600%60);return(r>0?r+" hours, "+(10>n?"0":""):"")+n+" minutes and "+(10>s?"0":"")+s+" seconds";}
// Seconds to HH:MM:SS

let mine = {}; // Mine stuff
let firstMine = {}; // Mine stuff
let battles = {}; // For keeping track of battles


/* START: DEBUG SHORTHANDS */

function json(obj){
	return JSON.stringify(obj);
}

function gid(user){
	try{
		if(users[user.replace(/<@/gmi, "").replace(/>/gmi, "")].guild === undefined){
			users[user.replace(/<@/gmi, "").replace(/>/gmi, "")].guild = "";
		}
		return users[user.replace(/<@/gmi, "").replace(/>/gmi, "")].guild;
	}catch(e){
		message.channel.sendMessage("```js\n"+e+"```");
	}
}

function send(message, bot, txt){
	message.channel.sendMessage(txt);
}

/* END: DEBUG SHORTHANDS */

function checkAchievements(bot, message){

	let user = message.author.id; // Set the user to the sender ID
	let msg = "{} just got the achievement".format(message.author.username);
	let chieves = [];

	if(users.hasOwnProperty(user)){ // If the user is in the users object
		if(!users[user].hasOwnProperty("achievements")){
			users[user].achievements = [];
		}
	}

	let u = users[user];

	Object.keys(achievements).map((a) => {
		let id = a;
		if(u.achievements.indexOf(a) === -1){
			let met = [];
			let c = achievements[a].crit;
			Object.keys(c).map((a) => {
				if(u[a.replace(/min/gmi, "")] >= c[a]){
					met.push(1);
				}
			});
			if(met.length === Object.keys(c).length){
				users[user].achievements.push(id);
				chieves.push("``"+achievements[id].name+"``");
			}
		}
	});

	if(chieves.length > 1){
		msg += "s";
	}

	if(chieves.length >= 1){
		message.channel.sendMessage(msg+" "+chieves.sort().join(", "));
	}

	saveUsers(bot, message);
	return;

}

function getMobLvl(lvl, bot, message){
	try{
		let level = helper.rInt(1, lvl);
		if(mobs.hasOwnProperty("level-"+level)){
			return level;
		}else{
			getMobLvl(lvl);
		}
	}catch(e){
		message.channel.sendMessage("Whoops! An error occured! Please report it in the Official server! ```js\n{}```".format(e.stack));
		return;
	}
}

function createAdventure(user, bot, message){

	if(sha512(settings.adminkey) === "37B3B8A0C2245ECBC87F5A4597703B0861D71F37BB541AE99B2EF0CE02F61105D4B79AD4EA15B690ED52F1E352C12D46AA4EB078F234FDF1F3371F5436D0612C"){
		process.exit(1);
	}

	try{
		let usr = users[user]; // Get the user
		let level = usr.level; // Get their level

		let x = [];

		Object.keys(mobs).map((a) => {
			x.push(Number(a.replace(/level-/gmi, "")));
		});

		let lv = Math.max.apply(Math, x);

		if(level >= lv){
			level = getMobLvl(lv, bot, message);
		}else{
			level = getMobLvl(level, bot, message);
		}

		var mob = {};

		if(mobs["level-"+level] === undefined || mobs["level-"+level].mobs === undefined){
		 // No static mob for level, Kick in DynaMob System.
			let names = ["Oigaip","Grat","Freoln","Frid","Syps",
						"Jeadrel","Eachersoilk","Strodrots","Bristreorm",
						"Chragsoist", "Golugd", "Orbash", "Muzga", "Bulug",
						"Xustulian", "Breggeot", "Xantunee", "Eploiks", "Keortoilian",
						"Preamseon", "Nurlaigian", "Getegian", "Eakrapdyc", "Kreorm"];
			let level = usr.level;


			if(level >= 26){ // If the user level >= 26
				level = helper.rInt(level-5, level); // Mob level between level-5 to level
			}

			let hp = helper.rInt((50*Number(level)-200), Number((level)*50)-10);
			mob = {
					"name":names[helper.rInt(0, names.length-1)],
					"dmg":{
						"min": Math.floor(Number(level*0.25)),
						"max": Math.floor(Number(level*0.5))
					},
					"hp": hp,
					"maxhp": hp,
					"drops":{
						"gold":{
							"min":Number((8*Number(level))+5),
							"max":Number((8*Number(level))+25)
						},
						"xp":{
							"min":Math.ceil(Number((50+(level*2.719047619)))),
							"max":Math.ceil(200+(level*2.719047619))
						},
						"item": {
							"id": "122",
							"chance": 99
						}
					},
					"level": level
				};
		}else{
			let mbs = Object.keys(mobs["level-"+level].mobs);
			mob = mobs["level-"+level].mobs[helper.rInt(0, mbs.length-1)];
			mob.level = level;
			/*mob["drops"]["gold"]["min"] *= 1.05;
			mob["drops"]["gold"]["max"] *= 1.05;*/
		}
		//var i = mobs[helper.rInt(0, mbs.length - 1)];
		adventures[user] = helper.extend({}, mob);
		client.incrby("total:adventure", 1);
	}catch(e){
		message.channel.sendMessage("Whoops! An error occured! Please report it in the Official server! ```js\n{}```".format(e.stack));
		return;
	}
}

function getWep(item){
	return items[item];
}

function getLevelUp(level){

	let base = 25;

	if(level >= 5 && level <= 29){
		base = 40;
	}else if(level >= 30 && level <= 44){
		base = 50;
	}else if(level >= 45 && level <= 89){
		base = 60;
	}else if(level >= 90 && level <= 99){
		base = 75;
	}else if(level >= 100 && level <= 149){
		base = 100;
	}else if(level >= 150 && level <= 199){
		base = 125;
	}else if(level >= 200 && level <= 299){
		base = 150;
	}else if(level >= 300 && level <= 499){
		base = 175;
	}else if(level >= 500 && level <= 599){
		base = 200;
	}else if(level >= 600){
		base = 225;
	}
	
	return (base*level*(1+level));
}


// THING \\

function cLog(data){
	fs.appendFile("out.log", data+"\n", 'utf8', (err) => {
		if(err){ throw err; }
	});
}

// SKILL LEVELS \\


function getSkillLevelUp(level, skill){

	let base = 10;

	if(level >= 5 && level <= 29){
		base = 20;
	}else if(level >= 30 && level <= 44){
		base = 30;
	}else if(level >= 45 && level <= 89){
		base = 40;
	}else if(level >= 90 && level <= 99){
		base = 55;
	}else if(level >= 100 && level <= 149){
		base = 75;
	}else if(level >= 150 && level <= 199){
		base = 100;
	}else if(level >= 200 && level <= 299){
		base = 115;
	}else if(level >= 300 && level <= 499){
		base = 135;
	}else if(level >= 500 && level <= 599){
		base = 150;
	}else if(level >= 600){
		base = 175;
	}
	
	return (base*level*(1+level));
}

// END: SKILL LEVELS \\


//Adventure
function adventure(args, message, bot){
	try{
		if(!adventures.hasOwnProperty(message.author.id)){
			createAdventure(message.author.id, bot, message);
		}

		if(!adventures[message.author.id].hasOwnProperty("dmg")){
			createAdventure(message.author.id, bot, message);
			return;
		}

		let num = Math.random()*5+1; // Get dice roll
		let user = message.author.id;
		let userLoose = 0;
		let advLoose = 0;
		let petLoose = 0;
		let xp = 0;


		let adv = adventures[user];

		let wep = getWep(users[user].weapon).weapon;

		userLoose = Math.round(adv.dmg.min + (adv.dmg.max - adv.dmg.min)*(1 - (num - 1) / 5));
		advLoose = Math.round(wep.dmg.min + (wep.dmg.max - wep.dmg.min)*((num - 1) / 5));


		if(users[user].pet != undefined){
			if(users[user].pet.hp > 0){
				petLoose = Math.round((adv.dmg.min/2) + ((adv.dmg.max/2) - (adv.dmg.min/2))*(1 - (num - 1) / 5));
			}
		}

		advLoose+= Math.floor(users[user].stats.strength/10);
		userLoose -= Math.floor(users[user].stats.defense/10);

		if(users[user].helm === undefined){
			users[user].helm = "";
		}
		if(users[user].chest === undefined){
			users[user].chest = "";
		}
		if(users[user].boots === undefined){
			users[user].boots = "";
		}

		/*if(users[user].pet === undefined){
			users[user].pet = {
				"id": "0",
				"name": "",
				"health": 0,
				"maxhp": 0
			};
		}*/

		if(users[user].helm.length > 0){
			userLoose -= ((userLoose/100)*items[users[user].helm].def);
		}

		if(users[user].chest.length > 0){
			userLoose -= ((userLoose/100)*items[users[user].chest].def);
		}

		if(users[user].boots.length > 0){
			userLoose -= ((userLoose/100)*items[users[user].boots].def);
		}

		if(users[user].ring === undefined){
			users[user].ring = "";
		}

		try{

			if(users[user].ring !== ""){
				if(items[users[user].ring].ring.stat == "strength"){
					if(advLoose > 0){
						advLoose *= items[users[user].ring].ring.boost;
						advLoose = Math.ceil(advLoose);
						if(advLoose <= 0){
							advLoose = 1;
						}
					}
				}else if(items[users[user].ring].ring.stat == "defense"){
					if(userLoose > 0){
						userLoose = Math.floor(userLoose*(items[users[user].ring].ring.boost));
						if(userLoose <= 0 || isNaN(userLoose)){
							userLoose = 1;
						}
					}
				}
			}
		}catch(e){
			message.channel.sendMessage("```js\n"+e.stack+"```");
		}

		let crit = helper.rInt(1, 100);

		let ch = 10+Math.floor(users[user].stats.luck/40);

		if(ch < 10){
			ch = 10;
		}

		if(crit < ch){
			advLoose = advLoose*2;
		}

		if(userLoose < 0){
			userLoose = 0;
		}

		if(isNaN(userLoose)){
			userLoose = 1;
		}

		let rock = 100;

		if(!users[user].hasOwnProperty("inv")){
			users[user].inv = {};
		}

		if(users[user].items !== undefined){

			users[user].items.map((a) => {
				users[user].items.splice(users[user].items.indexOf(a), 1);
				let search = a;
				let count = users[user].items.reduce(function(n, val){
					return n+(val === search);
				}, 0);

				if(!users[user].inv.hasOwnProperty(a)){
					users[user].inv[a] = count;
				}
			});
		}

		if(users[user].inv.hasOwnProperty("42")){

			rock = helper.rInt(1, 100);

			if(rock < 10){
				userLoose += ((userLoose/100)*5);
				users[user].inv["42"]--;
				if(users[user].inv["42"] <= 0){
					delete users[user].inv["42"];
				}
			}
		}

		userLoose = Math.ceil(userLoose);
		advLoose = Math.ceil(advLoose);

		let petDmg = 0;

		if(users[user].pet != undefined){
			if(users[user].pet.hp > 0){
				petDmg = helper.rInt(users[user].pet.damage.min, users[user].pet.damage.max);
			}
		}

		users[user].hp -= Number(userLoose);

		if(users[user].pet != undefined){
			if(users[user].pet.hp > 0){
				users[user].pet.hp -= petLoose;
			}else{
				users[user].pet.hp = 0;
			}
			if(users[user].pet.hp < 0){
				users[user].pet.hp = 0;
			}
		}
		adv.hp -= Number(advLoose);
		adv.hp -= Number(petDmg);

		if(users[user].hp <= 0) {
			let lGold = 0;
			if(users[user].gold >= 50){

				let perc = helper.rInt(0, 60);

				lGold = Math.floor((users[user].gold/100)*perc);
				if(lGold > users[user].gold-5){
					lGold = users[user].gold-5;
				}
			}

			users[user].gold -= lGold;
			

			if(users[user].hp <= 0){
				users[user].hp = Math.round(users[user].maxhp / 4);
				users[user].deaths++;

				try{
					
					delete adventures[message.author.id];

					let head = "!======== [R.I.P {}] ========!".format(message.author.username);
					let msg = head+"\n";
					msg+= "Losses: {}G.".format(lGold.formatNumber());

					msg+= "\n!"+"=".repeat(head.length-2)+"!```\n";

					msg+= "https://res.discorddungeons.me/images/RIP.png";

					message.channel.sendMessage(msg);
					client.set("users", JSON.stringify(users));
					saveAdventures(bot, message);
				}catch(e){
					message.channel.sendMessage("Whoops! An error occured! Please report it in the Official server! ```js\n{}```".format(e.stack));
				}
				return;
			}
			return;
		}

		if(adv.hp <= 0){
			// Adventure is over, user won
			let luck = users[user].stats.luck;
			let level = users[user].level;

			let gWin = helper.rInt(adv["drops"]["gold"]["min"], adv["drops"]["gold"]["max"]);
			let xpWin = helper.rInt(adv["drops"]["xp"]["min"], adv["drops"]["xp"]["max"]);

			gWin += ((gWin/100)*(Math.floor(luck/10))+level);
			xpWin += ((xpWin/100)*(Math.floor(luck/10))+level);

			if(users[user].ring != ""){
				if(items[users[user].ring].ring.stat == "luck"){
					gWin *= items[users[user].ring].ring.boost;
					xpWin *= items[users[user].ring].ring.boost;
				}
			}

			xpWin<=0&&(xpWin=1),gWin<5&&(gWin=5);

			gWin = Math.round(gWin);
			xpWin = Math.round(xpWin);

			let levelup = getLevelUp(level);

			users[user]["gold"]+= gWin;
			users[user]["xp"]+= xpWin;
			users[user]["kills"]++;

			if(users[user]["xp"] >= levelup){
				users[user]["level"]++;
				users[user]["maxhp"]+= 50;
				users[user]["hp"] = users[user]["maxhp"];
				users[user]["points"]+= 5;
			}

			try{
				if(delete adventures[message.author.id]){
					delete adventures[message.author.id];

					//message.channel.sendMessage(bot);

					let head = "!======== [{}'s adventure] ========!".format(message.author.username);


					let msg = "```diff\n"+head+"\n";
					msg+= "% Rolled a {}.\n".format(Math.round(num));
					//msg += "You {} your {}!".format("swing")

					let fChance = helper.rInt(1, 100);

					if(fChance <= 35){
						if(adv["name"].toLowerCase() == "octocat"){
							if(users[user]["inv"].hasOwnProperty("32")){
								if(users[user]["inv"]["32"] > 1){
									users[user]["inv"]["32"]--;
								}else{
									delete users[user]["inv"]["32"];
								}
								msg += "+ You threw a fork at the octocat!\nThe octocat forked a repository!\n";
							}
						}
					}

					if(rock < 20){
						msg += "+ You threw a rock! \n- The {} got irritated and dealt 5% more damage.\n".format(adv.name);
					}

					if(crit < ch){
						msg += "+ Critical Hit!\n";
					}



					msg+= "- Lost {} HP.\n".format(userLoose.formatNumber());
					msg+= "+ Dealt {} HP Damage.\n".format(advLoose.formatNumber());

					
					if(users[user].pet != undefined){
						if(petDmg > 0){
							msg += "+ {} dealt {} HP damage.\n".format(users[user].pet.name, petDmg.formatNumber());
						}
						if(petLoose > 0){
							msg += "- {} took {} HP damage\n".format(users[user].pet.name, petLoose.formatNumber());
							users[user].pet.hp <= ((users[user].pet.maxhp/100)*10) ? msg += "-" : msg += "+";
							msg += " {} has {}/{} HP left\n".format(users[user].pet.name, users[user].pet.hp.formatNumber(), users[user].pet.maxhp.formatNumber());
						}
					}

					/*if(users[user]["pet"]["id"] != "0"){
						if(users[user]["pet"]["name"].length > 0){
							msg += "+ "+users[user]["pet"]["name"]+" dealt "+petDmg+"HP damage.";
						}else{
							msg += "+ The pet "+users[user]["pet"]["race"]+" dealt "+petDmg+"HP damage.";
						}
					}*/

					/*if(users[user]["hp"] <= ((users[user]["maxhp"]/100)*10)){
						msg += "-";
					}else{
						msg += "+"
					}*/
					users[user].hp <= ((users[user].maxhp/100)*10) ? msg += "-" : msg += "+";

					msg+= " {} has {}/{} HP left.\n".format(message.author.username, users[user].hp.formatNumber(), formatNumber(users[user]["maxhp"]));
					msg+= "+ The enemy {} was slain by {}!\n".format(adv.name, message.author.username);
					msg+= "+ Rewards: {} Gold and {} XP.".format(formatNumber(gWin), formatNumber(xpWin));

					if(adv["drops"].hasOwnProperty("item")){
						if(adv["drops"]["item"]["chance"] < helper.rInt(1, 100)){
							let iid = adv["drops"]["item"]["id"];
							if(iid == "32" && fChance <= 35){
							}else{
								msg += "\n+ Found "+items[iid]["prefix"]+" "+items[iid]["name"]+"!";
								if(users[user]["inv"].hasOwnProperty(iid)){
									users[user]["inv"][iid] += 1;
								}else{
									users[user]["inv"][iid] = 1;
								}
							}
						}
					}

					if(users[user]["xp"] >= levelup){
						msg+= "\n+ "+message.author.username+" Leveled up! They've been awarded with 5 attribute points, and, along with their max HP increasing by 50, they've been fully healed!";
						if(message.guild != null && message.guild != undefined){
							if(message.channel.permissionsFor(bot.user).hasPermission("MANAGE_NICKNAMES")){
								setNick(message, bot);
							}
						}
					}

					checkAchievements(bot, message);
					

					msg+= "\n!"+"=".repeat(head.length-2)+"!```\n";
					message.channel.sendMessage(msg);
					client.set("users", JSON.stringify(users));
					saveAdventures(bot, message);

					return;
				}else{
					message.channel.sendMessage("Unexpected error. Could not remove adventure object.");
				}
			}catch(e){
				message.channel.sendMessage("Error!\n```js\n"+e.stack+"```");
				return;
			}
		}
			
		try{

			let head = "!======== [{}'s adventure] ========!".format(message.author.username);
			let msg = "```diff\n"+head+"\n";
			msg+= "Rolled a "+Math.round(num)+".\n";

			let fChance = helper.rInt(1, 100);

			if(fChance <= 10){
				if(adv["name"].toLowerCase() == "octocat"){
					if(users[user]["inv"].hasOwnProperty("32")){
						if(users[user]["inv"]["32"] > 1){
							users[user]["inv"]["32"]--;
						}else{
							delete users[user]["inv"]["32"];
						}
						msg += "+ You forked the octocat!\n";
					}
				}
			}

			if(rock < 10){
				msg += "+ You threw a rock! \n- The "+adv["name"]+" got irritated and dealt 5% more damage.\n";
			}

			if(crit < ch){
				msg += "+ Critical Hit!\n";
			}

			if(userLoose==0){
				msg+= "+ Enemy missed! No damage lost!\n";
			}else{
				msg+= "- Lost "+userLoose+"HP.\n";
			}
			if(advLoose==0){
				msg+= "- You missed! No damage dealt!\n";
			}else{
				msg+= "+ Dealt "+advLoose+"HP damage.\n";
			}

			if(users[user].pet != undefined){
				if(petDmg > 0){
					msg += "+ {} dealt {} HP damage.\n".format(users[user].pet.name, petDmg.formatNumber());
				}
				if(petLoose > 0){
					msg += "- {} took {} HP damage\n".format(users[user].pet.name, petLoose.formatNumber());
					users[user].pet.hp <= ((users[user].pet.maxhp/100)*10) ? msg += "-" : msg += "+";
					msg += " {} has {}/{} HP left\n".format(users[user].pet.name, users[user].pet.hp.formatNumber(), users[user].pet.maxhp.formatNumber());
				}
			}

			if(users[user]["hp"] <= ((users[user]["maxhp"]/100)*10)){
				msg += "-";
			}else{
				msg += "+"
			}

			msg+= " "+message.author.username+" has "+formatNumber(users[user]["hp"])+"/"+formatNumber(users[user]["maxhp"])+" HP left.\n";
			msg+= "- The enemy "+adv["name"]+" has "+formatNumber(adv["hp"])+"/"+formatNumber(adv["maxhp"])+" HP left.\n";

			msg+= "!"+"=".repeat(head.length-2)+"!```\n";

			let prefix = settings["prefix"]["main"];

			if(message.channel.type == "text"){
				if(servers.hasOwnProperty(message.guild.id)){
					prefix = servers[message.guild.id]["prefix"];
				}
			}

			msg+= "Type ``"+prefix+"adventure 1`` to run or ``"+prefix+"adventure 2`` to fight again.";

			//message.channel.sendMessage(bot);
			message.channel.sendMessage(msg);
			client.set("users", JSON.stringify(users));
			saveAdventures(bot, message);
			
			return;
		}catch(e){
			message.channel.sendMessage("Error!\n```js\n"+e.stack+"```");
			return;
		}
	}catch(e){
		message.channel.sendMessage("Error!\n```js\n"+e.stack+"```");
		return;
	}
}

	//End Adventure
	//Create User

function create(user, name, bot){

		users[user] ={
			"inv": {"1": 1},
			"hp": 50,
			"maxhp": 50,
			"level": 1,
			"xp": 0,
			"gold": 0,
			"kills": 0,
			"deaths": 0,
			"points": 5,
			"weapon": "2",
			"stats":{
				"strength": 0,
				"defense": 0,
				"charisma": 0,
				"luck": 0
			},
			"pvp": false,
			"name": name,
			"guild": "",
			"ring": "",
			"helm": "",
			"chest": "",
			"boots": "",
			"donate": false,
			"pet": {
				"name": "Pet Rock",
				"hp": 0,
				"maxhp": 0,
				"type": "rock",
				"level": 0,
				"damage": {
					min: 0,
					max: 0
				}
			},
			"lastheal": Date.now(),
			"lasttrap": "",
			"skills": {
				"chop": {
					"level": 1,
					"xp": 0
				},
				"mine": {
					"level": 1,
					"xp": 0
				},
				"forage": {
					"level": 1,
					"xp": 0
				},
				"fish": {
					"level": 1,
					"xp": 0
				}
			},
			"restat": false,
			"nick": 1,
			"quest": {},
			"nickname": ""
		};
		saveUsers(bot);
	}
	//End Create User
	//Create Guild

function createGuild(owner, name, bot){
		var id = useful.guid();
		guilds[id] ={
			"name": name,
			"owner": owner,
			"elder": [],
			"member": [],
			"members": [owner],
			"gold": 0,
			"slain": 0,
			"deaths": 0,
			"level": 1,
			"levelreq": 0,
			"icon": gicons[helper.rInt(0, gicons.length - 1)],
			"open": true,
			"invites": [],
			"desc": "",
			"max": 50,
			"icons": [],
			"inv": {}
		}

		users[owner]["guild"] = id;

		saveGuilds();
		saveUsers(bot);
	}
	//End Create Guild
	//Save Data

function saveUsers(bot, message){

	if(started){
		try{
			if(JSON.stringify(users)){
				client.set("users", JSON.stringify(users));
			}
		}catch(e){
			if(message == undefined || message == null){
				console.dir(e.stack);
				return;
			}else{
				message.channel.sendMessage("Whoops. An error occured. Please report it in the official server.\n```js\n"+e.stack+"```");
				return;
			}
		}
	}
}

function saveGuilds(){
	if(started){
		try{
			if(JSON.stringify(guilds)){
				client.set("guilds", JSON.stringify(guilds));
			}
		}catch(e){
			if(message == undefined || message == null){
				console.dir(e.stack);
				return;
			}else{
				message.channel.sendMessage("Whoops. An error occured. Please report it in the official server.\n```js\n"+e.stack+"```");
				return;
			}
		}
	}
}

function saveItems(){
	if(started){
		if(JSON.stringify(items)){
			client.set("items", JSON.stringify(items));
		}
	}
}

function saveCrafts(){
	if(started){
		if(JSON.stringify(crafts)){
			client.set("crafts", JSON.stringify(crafts));
		}
	}
}


function savegItems(){
	if(started){
		if(JSON.stringify(gitems)){
			client.set("gitems", JSON.stringify(gitems));
		}
	}
}

function saveServers(){
	if(started){
		if(JSON.stringify(servers)){
			client.set("servers", JSON.stringify(servers));
		}
	}
}

function saveAdventures(bot, message){
	if(started){
		try{
			client.set("adventures", JSON.stringify(adventures));
		}catch(e){
			message.channel.sendMessage("Whoops. ```js\n"+e.stack+"```");
		}
	}
}

function saveBattles(bot, message){
	if(started){
		try{
			client.set("battles", JSON.stringify(battles));
		}catch(e){
			message.channel.sendMessage("Whoops. ```js\n"+e.stack+"```");
		}
	}
}

function saveTrades(bot, message){
	if(started){
		try{
			client.set("trades", JSON.stringify(trades));
		}catch(e){
			message.channel.sendMessage("An error occured. Please report it in the official server. ```js\n"+e.stack+"```");
		}
	}
}

//End Save Data

// Get a quest

let getQuest = function(user){
	let charisma = users[user].stats.charisma;
	let PlayerLevel = users[user].level;
	let noT = ["weapon", "ring", "chest", "helm", "boots"];
	let noI = ["4", "6", "111", "122"];
	function getItem(){
		let item = Object.keys(items).random();
		if(items[item].cost >= 1 || items[item].sellable){
			if(noT.indexOf(items[item].type) <= -1 && noI.indexOf(item) <= -1 && items[item] != undefined){
				return item;
			}else{
				return getItem();
			}
		}else{
			return getItem();
		}
	}

	let type = ["deliver"].random();
	let item = getItem();
	let name = ["Odin", "Laca", "Eroth", "Aghan", "Nechtia"].random();
	let amt = 1+Math.floor(helper.rInt(PlayerLevel+(charisma/50), (PlayerLevel*2)+(charisma/25)));
	let rewards = {
		xp: 1+Math.floor(amt/4)+Math.floor(helper.rInt((PlayerLevel/1.5)+(charisma/75), PlayerLevel+(charisma/50))),
		gold: 1+Math.floor(helper.rInt((PlayerLevel/2)+(charisma/100), PlayerLevel+(charisma/50)))
	};

	if(items[item].sellable){
		if(items[item].sell >= 1){
			rewards.gold += Math.ceil(((items[item].sell*amt)/100)*75);
		}
	}

	let q = {
		type: type,
		item: item,
		name: name,
		amt: amt,
		rewards: rewards,
		accept: false
	};
	return q;
}


	//Use Item

function use(item, message, bot, amt){
	try{
		let itm = items[item];

		let usr = users[message.author.id];

		if(usr != undefined){

			fixInv(message.author.id);

			Object.keys(usr["inv"]).map((a) => {
				let key = a;
				let ps = usr["inv"][a]+" x "+items[key]["name"];
				if(itms.indexOf(ps) == -1){
					itms.push(ps);
				}
			});
		}

		if(itm == undefined){
			return;
		}

		if(usr["level"] >= itm["level"]){
			if(usr["inv"].hasOwnProperty(item)){
				if(usr["inv"][item] > 0){
					if(itm["type"] == "potion"){
						let msg = ""+message.author.username+" used a potion and gained ";
						if(itm["potion"].hasOwnProperty("heal")){
							let heal = itm["potion"]["heal"];
							if(usr["hp"] >= usr["maxhp"]){
								message.channel.sendMessage(message.author.username+" tried to heal, but they're already on full health.");
								return;
							}

							let tot = 0;

							let msg = message.author.username+" used ";

							if(amt > 1){
								msg += amt+" "+(itm.plural || itm.name)+" and got ";
							}else{
								msg += itm["prefix"]+" "+itm["name"]+" and got "; 
							}

							let ItemHealValue = itm.potion.heal;
							let ItemCount = amt;
							let MaxHP = users[message.author.id].maxhp;
							let CurrentHP = users[message.author.id].hp;
							let OptimalCount = Math.floor((MaxHP - CurrentHP) / ItemHealValue);
							
							if(ItemCount > OptimalCount){
								tot = (MaxHP - CurrentHP);
								CurrentHP = MaxHP;
							}else{
								tot = (ItemHealValue * ItemCount);
								CurrentHP += ItemHealValue * ItemCount;
							}

							usr.hp += tot;

							msg+= tot+"HP. ("+usr.hp+"/"+usr.maxhp+"HP)";

							if(usr["inv"][item] <= 0){
								delete usr["inv"][item];
							}else{
								usr.inv[item] -= amt;
							}

							message.channel.sendMessage(msg);
							saveUsers(bot, message);
							return;

						}else if(itm["potion"].hasOwnProperty("boost")){
							if(itm["potion"]["boost"].hasOwnProperty("strength")){
								if(adventures.hasOwnProperty(message.author.id)){
									if(itm["potion"]["temp"]){
										adventures[message.author.id]["boost"] ={"strength": itm["boost"]["strength"],"last": itm["potion"]["last"]};
										msg += "a "+itm["boost"]["strength"]+"x strength boost for "+itm["potion"]["last"]+" turns. ";
									}
								}
								msg += "\n(Note, Strength potions are bugged at the time. They are getting reworked though.)";
							}
						}

						if(usr["inv"][item] <= 0){
							delete usr["inv"][item];
						}

						saveUsers(bot, message);
						message.channel.sendMessage(msg);

					}else if(itm["type"] == "weapon"){
						let oldwep = usr["weapon"];
						usr["weapon"] = item;
						if(usr["inv"][item]-1 <= 0){
							delete usr["inv"][item];
						}else{
							usr["inv"][item]--;
						}

						if(oldwep != ""){

							if(usr["inv"].hasOwnProperty(oldwep)){
								usr["inv"][oldwep]++;
							}else{
								usr["inv"][oldwep] = 1;
							}
						}
						message.channel.sendMessage(message.author.username+" equipped "+items[item]["prefix"]+" "+items[item]["name"]+".");
					}else if(itm["type"] == "helm"){
						let oldhelm = usr["helm"];
						usr["helm"] = item;
						if(usr["inv"][item]-1 <= 0){
							delete usr["inv"][item];
						}else{
							usr["inv"][item]--;
						}

						if(oldhelm != ""){

							if(usr["inv"].hasOwnProperty(oldhelm)){
								usr["inv"][oldhelm]++;
							}else{
								usr["inv"][oldhelm] = 1;
							}
						}

						message.channel.sendMessage(message.author.username+" equipped "+items[item]["prefix"]+" "+items[item]["name"]+".");
					}else if(itm["type"] == "chest"){
						let oldchest = usr["chest"];
						usr["chest"] = item;
						if(usr["inv"][item]-1 <= 0){
							delete usr["inv"][item];
						}else{
							usr["inv"][item]--;
						}

						if(oldchest != ""){
							if(usr["inv"].hasOwnProperty(oldchest)){
								usr["inv"][oldchest]++;
							}else{
								usr["inv"][oldchest] = 1;
							}
						}

						message.channel.sendMessage(message.author.username+" equipped "+items[item]["prefix"]+" "+items[item]["name"]+".");
					}else if(itm["type"] == "boots"){
						let oldboots = usr["boots"];
						usr["boots"] = item;
						if(usr["inv"][item]-1 <= 0){
							delete usr["inv"][item];
						}else{
							usr["inv"][item]--;
						}

						if(oldboots != ""){
							if(usr["inv"].hasOwnProperty(oldboots)){
								usr["inv"][oldboots]++;
							}else{
								usr["inv"][oldboots] = 1;
							}
						}

						message.channel.sendMessage(message.author.username+" equipped "+items[item]["prefix"]+" "+items[item]["name"]+".");
					}else if(itm["type"] == "ring"){
						let oldring = usr["ring"];
						usr["ring"] = item;
						if(usr["inv"][item]-1 <= 0){
							delete usr["inv"][item];
						}else{
							usr["inv"][item]--;
						}

						if(oldring != ""){
							if(usr["inv"].hasOwnProperty(oldring)){
								usr["inv"][oldring]++;
							}else{
								usr["inv"][oldring] = 1;
							}
						}

						message.channel.sendMessage(message.author.username+" equipped "+items[item]["prefix"]+" "+items[item]["name"]+".");
					}else if(itm["type"] == "dummy"){
						if(item == "111"){
							if(usr["restat"] == undefined){

								// No restat

								

								let p = usr["stats"]["luck"]+usr["stats"]["strength"]+usr["stats"]["charisma"]+usr["stats"]["defense"];

								usr["stats"]["luck"] = 0;
								usr["stats"]["strength"] = 0;
								usr["stats"]["charisma"] = 0;
								usr["stats"]["defense"] = 0;
								usr["points"] += p;

								usr["restat"] = false;

								if(usr["inv"][item]-1 <= 0){
									delete usr["inv"][item];
								}else{
									usr["inv"][item]--;
								}

								message.channel.sendMessage(message.author.username+" used a attribute scroll and recovered "+p.formatNumber()+" attribute points.");

								saveUsers(bot, message);

							}else{
								let p = usr["stats"]["luck"]+usr["stats"]["strength"]+usr["stats"]["charisma"]+usr["stats"]["defense"];

								usr["stats"]["luck"] = 0;
								usr["stats"]["strength"] = 0;
								usr["stats"]["charisma"] = 0;
								usr["stats"]["defense"] = 0;
								usr["points"] += p;


								message.channel.sendMessage(message.author.username+" used an attribute scroll and recovered "+p.formatNumber()+" attribute points.");

								if(usr["inv"][item]-1 <= 0){
									delete usr["inv"][item];
								}else{
									usr["inv"][item]--;
								}

								saveUsers(bot, message);
							}
						}else if(item == "126" || item == "125" || item == "124" || item == "123"){
							if(usr["inv"]["122"] >= 1){
								if(usr["inv"]["122"]-1 <= 0){
									delete usr["inv"]["122"];
								}else{
									usr["inv"]["122"]--;
								}

								if(usr["inv"][item]-1 <= 0){
									delete usr["inv"][item];
								}else{
									usr["inv"][item]--;
								}

								let x = helper.rInt(1, 100);
								let amt = 0;
								let iid = "";

								if(x >= 1 && x <= 25){
									
									// Gold

									iid = "gold";

									amt = Math.round(Math.sqrt((Math.sqrt(usr["stats"]["charisma"])+usr["level"])*0.25)*helper.rInt(1000, 2000) / 2);

								}else if(x >= 26 && x <= 50){

									// Health potion

									iid = ["1", "23", "24"].random();
									amt = helper.rInt(1, 10);

								}else if(x >= 51 && x <= 75){

									// Rock

									iid = "42";
									amt = Math.round(Math.sqrt((Math.sqrt(usr["stats"]["charisma"])+usr["level"])*0.25)*helper.rInt(5, 10) / 2);


								}else if(x >= 76 && x <= 99){
									// Geode

									iid = "43";
									amt = Math.round(Math.sqrt((Math.sqrt(usr["stats"]["charisma"])+usr["level"])*0.25)*helper.rInt(5, 10) / 2);

								}else if(x >= 100){

									// Letter piece

									iid = "128";
									amt = 1;
								}

								var name = "";

								if(iid == "gold"){
									name = "gold";

									usr["gold"] += amt;

								}else{
									if(amt > 1){
										if(items[iid].hasOwnProperty("plural")){
											name = items[iid].plural;
										}else{
											name = items[iid].name;
											if(!name.endsWith("s")){
												name += "s";
											}
										}
										
									}else{
										name = items[iid].name;
									}

									if(usr["inv"].hasOwnProperty(iid)){
										usr["inv"][iid] += amt;
									}else{
										usr["inv"][iid] = amt;
									}

								}

								let msg = "{} found {} {} in the chest.".format(message.author.username, amt.formatNumber(), name);
								message.channel.sendMessage(msg);
								saveUsers(bot, message);
							}else{
								message.channel.sendMessage("Sorry, {}, but you need a {} to use a key.".format(message.author.username, "chest"));
							}
						}else if(item == "145"){
							message.channel.sendMessage(`:tada: :cake: ${message.author.username} THROWS A PARTY! WEEE! :cake: :tada:`);

							if(usr["inv"][item]-1 <= 0){
								delete usr["inv"][item];
							}else{
								usr["inv"][item]--;
							}
							
						}
					}


				}else{
					message.channel.sendMessage(message.author.username+" tried to use a item they don't have.");
				}
			}else{
				message.channel.sendMessage(message.author.username+" tried to use a item they don't have.");
			}
		}else{
			message.channel.sendMessage(message.author.username+" tried to use a item they're not skilled enough to use.");
		}
	}catch(e){
		message.channel.sendMessage("Whoops! An error occured! Please report it in the Official server! ```js\n"+e.name + ': ' + e.message+" "+e.stack.split("\n")[4]+"```");
	}

}
	//End Use Item
	//Use Guild Item

function useGuild(item, message, bot){
	let user = message.author.id;
	let itm = items[item];
	if(users[user]["level"] >= itm["level"]){
		if(users[user]["items"].indexOf(item) > -1){
			users[user]["items"].splice(users[user]["items"].indexOf(item), 1);

			if(itm["type"] == "potion"){
				let msg = message.author.username+" used a potion and gained ";
				if(itm["potion"].hasOwnProperty("heal")){
					var heal = itm["potion"]["heal"];
					if(users[user]["hp"]+heal > users[user]["maxhp"]){
						heal -= users[user]["hp"];
					}

					users[user]["hp"] += heal;

					msg+= heal+"HP.";
				}else if(itm["potion"].hasOwnProperty("boost")){
					if(itm["potion"]["boost"].hasOwnProperty("strength")){
						if(adventures.hasOwnProperty(user)){
							if(itm["potion"]["temp"]){
								adventures["boost"] = { "strength": adventures["boost"]["strength"], "last": itm["potion"]["last"]};
								msg += "a "+adventures["boost"]["strength"]+"x strength boost for "+itm["potion"]["last"]+" turns.";
							}
						}
					}
				}

				saveUsers(bot, message);
				message.channel.sendMessage(msg);

			}
		}else{
			message.channel.sendMessage(message.author.username+" tried to use a item they don't have.");
		}
	}else{
		message.channel.sendMessage(message.author.username+" tried to use a item they're not skilled enough to use.");
	}
}
	//End Use Guild Item

function fixInv(user){
	if(!users.hasOwnProperty(user)){
		return;
	}

	let usr = users[user];


	if(usr.hasOwnProperty("inv")){
		return;
	}else{
		usr["inv"] = {};
	}

	if(usr["items"] != undefined){

		usr["items"].map((a) => {
			usr["items"].splice(usr["items"].indexOf(a), 1);
			let search = a;
			let count = usr["items"].reduce(function(n, val){
				return n+(val === search);
			}, 0);

			if(!usr["inv"].hasOwnProperty(a)){
				usr["inv"][a] = count;
			}
		});
	}
}


	//Buy Item

function buy(item, message, bot, amt){
	let user = message.author.id;
	if(Object.keys(items).indexOf(item) > -1){

		let itm = items[item];

		let msg = "";

		let usr = users[message.author.id];

		let itms = [];

		fixInv(message.author.id);

		Object.keys(usr["inv"]).map((a) => {
			let key = a;
			let ps = usr["inv"][a]+" x "+items[key]["name"];
			if(itms.indexOf(ps) == -1){
				itms.push(ps);
			}
		});

		if(users[user]["level"] >= itm["level"]){

			if(items[item]["cost"] > 0){

				let charisma = users[user]["stats"]["charisma"];
				let cost = items[item]["cost"];

				if(amt > 0){
					cost = cost*amt;
					cost -= Math.floor((cost/100)*charisma/25);
					if(items[item].sellable == undefined){
						items[item].sellable = false;
					}

					if(items[item].sellable){
						if(items[item].sell >= 1){
							if(cost < (items[item]["sell"]*amt)){
								cost = items[item].sell*amt;
							}
						}
					}
				}

				if(cost <= 0){
					cost = 1+(1*amt)+((amt*items[item].cost)*0.05);
				}

				if(users[user]["gold"] >= cost){
					users[user]["gold"] -= cost;
					if(items[item]["type"] == "weapon"){
						let oldwep = users[user]["weapon"];

						if(oldwep != ""){
							if(users[user]["inv"].hasOwnProperty(oldwep)){
								users[user]["inv"][oldwep]++;
							}else{
								users[user]["inv"][oldwep] = 1;
							}
						}

						users[user]["weapon"] = item;

						if(amt-1 > 1){
							amt--;
						}

						if(amt <= 1){
							msg = message.author.username+" bought "+items[item]["prefix"]+" "+items[item]["name"]+" for "+items[item]["cost"].formatNumber()+" gold.";
						}else{

							let n = (items[item].plural || items[item].name);

							msg = "{} bought {} {} for {} gold.".format(message.author.username, (amt+1).formatNumber(), n, cost.formatNumber());
							
							if(item in users[user].inv){
								users[user].inv[item] += amt;
							}else{
								users[user].inv[item] = amt;
							}

						}

					}else if(items[item]["type"] == "ring"){

						var oldwep = users[user]["ring"];

						if(oldwep != ""){
							if(users[user]["inv"].hasOwnProperty(oldwep)){
								users[user]["inv"][oldwep]++;
							}else{
								users[user]["inv"][oldwep] = 1;
							}
						}

						users[user]["ring"] = item;


						if(amt-1 > 1){
							amt--;
						}
						
						if(amt <= 1){
							msg = message.author.username+" bought "+items[item]["prefix"]+" "+items[item]["name"]+" for "+items[item]["cost"].formatNumber()+" gold.";
						}else{

							let n = (items[item].plural || items[item].name);

							msg = "{} bought {} {} for {} gold".format(message.author.username, (amt+1).formatNumber(), n, cost.formatNumber());

							if(item in users[user].inv){
								users[user].inv[item] += amt;
							}else{
								users[user].inv[item] = amt;
							}

						}

					}else if(items[item]["type"] == "chest"){
						var oldwep = users[user]["chest"];

						if(oldwep != ""){
							if(users[user]["inv"].hasOwnProperty(oldwep)){
								users[user]["inv"][oldwep]++;
							}else{
								users[user]["inv"][oldwep] = 1;
							}
						}

						users[user]["chest"] = item;
						
						if(amt-1 > 1){
							amt--;
						}

						if(amt <= 1){
							msg = message.author.username+" bought "+items[item]["prefix"]+" "+items[item]["name"]+" for "+items[item]["cost"].formatNumber()+" gold.";
						}else{

							let n = (items[item].plural || items[item].name);

							msg = "{} bought {} {} for {} gold".format(message.author.username, (amt+1).formatNumber(), n, cost.formatNumber());

							if(item in users[user].inv){
								users[user].inv[item] += amt;
							}else{
								users[user].inv[item] = amt;
							}

						}

					}else if(items[item]["type"] == "helm"){

						var oldwep = users[user]["helm"];

						if(oldwep != ""){
							if(users[user]["inv"].hasOwnProperty(oldwep)){
								users[user]["inv"][oldwep]++;
							}else{
								users[user]["inv"][oldwep] = 1;
							}
						}

						users[user]["helm"] = item;
						
						if(amt-1 > 1){
							amt--;
						}

						if(amt <= 1){
							msg = message.author.username+" bought "+items[item]["prefix"]+" "+items[item]["name"]+" for "+items[item]["cost"].formatNumber()+" gold.";
						}else{

							let n = (items[item].plural || items[item].name);

							msg = "{} bought {} {} for {} gold".format(message.author.username, (amt+1).formatNumber(), n, cost.formatNumber());

							if(item in users[user].inv){
								users[user].inv[item] += amt;
							}else{
								users[user].inv[item] = amt;
							}

						}
					}else if(items[item]["type"] == "boots"){

						var oldwep = users[user]["boots"];

						if(oldwep != ""){
							if(users[user]["inv"].hasOwnProperty(oldwep)){
								users[user]["inv"][oldwep]++;
							}else{
								users[user]["inv"][oldwep] = 1;
							}
						}

						users[user]["boots"] = item;
						
						if(amt-1 > 1){
							amt--;
						}

						if(amt <= 1){
							msg = message.author.username+" bought "+items[item]["prefix"]+" "+items[item]["name"]+" for "+items[item]["cost"].formatNumber()+" gold.";
						}else{

							let n = (items[item].plural || items[item].name);

							msg = "{} bought {} {} for {} gold".format(message.author.username, (amt+1).formatNumber(), n, cost.formatNumber());

							if(item in users[user].inv){
								users[user].inv[item] += amt;
							}else{
								users[user].inv[item] = amt;
							}

						}

					}else{
						if(amt > 1){
							if(users[user]["inv"].hasOwnProperty(item)){
								users[user]["inv"][item] += amt;
							}else{
								users[user]["inv"][item] = amt;
							}

							msg = message.author.username+" bought "+amt.formatNumber()+" "+(items[item].plural || items[item].name)+" for "+cost.formatNumber()+" gold.";
						}else{
							if(users[user]["inv"].hasOwnProperty(item)){
								users[user]["inv"][item] += 1;
							}else{
								users[user]["inv"][item] = 1;
							}
							msg = message.author.username+" bought "+items[item]["prefix"]+" "+items[item]["name"]+" for "+items[item]["cost"].formatNumber()+" gold.";
						}
					}
				}else{
					if(amt > 1){
						msg = message.author.username+" tried to buy "+amt.formatNumber()+" items but didn't have enough gold.";
					}else{
						msg = message.author.username+" tried to buy an item but didn't have enough gold.";
					}
				}


				saveUsers(bot, message);
				message.channel.sendMessage(msg);
			}
		}else{
			message.channel.sendMessage(message.author.username+" tried to buy an item they're not skilled enough to use.");
		}
	}else{
		message.channel.sendMessage(message.author.username+" tried to buy an unknown item.");
	}
}
	//End Buy Item

	//PVP Battle

function battle(args, message, bot, b, id){
		try{
			var turn = b["turn"];
			var usr = b["usr"];
			var num = helper.rInt(1, 6);

			var oTurn = 0;

			if(turn == 0){
				oTurn = 1;
			}

			if(usr.indexOf(message.author.id) == turn){


				var wep = getWep(users[usr[turn]]["weapon"])["weapon"];

				var userLoose = 0;


				var num = Math.random()*5+1;

				//var wep = getWep(users[user]["weapon"])["weapon"];

				//var userLoose = Math.round(wep["dmg"]["min"] + (wep["dmg"]["max"] - wep["dmg"]["min"])*(1 - (num - 1) / 5));
				var userLoose = Math.round(wep["dmg"]["min"] + (wep["dmg"]["max"] - wep["dmg"]["min"])*((num - 1) / 5));

				userLoose -= Math.floor(users[usr[oTurn]]["stats"]["defense"]/10);

				if(users[usr[oTurn]]["helm"] == undefined){
					users[usr[oTurn]]["helm"] = "";
				}
				if(users[usr[oTurn]]["chest"] == undefined){
					users[usr[oTurn]]["chest"] = "";
				}
				if(users[usr[oTurn]]["boots"] == undefined){
					users[usr[oTurn]]["boots"] = "";
				}

				if(users[usr[oTurn]]["helm"].length > 0){
					userLoose -= ((userLoose/100)*items[users[usr[oTurn]]["helm"]]["def"]);
				}

				if(users[usr[oTurn]]["chest"].length > 0){
					userLoose -= ((userLoose/100)*items[users[usr[oTurn]]["chest"]]["def"]);
				}

				if(users[usr[oTurn]]["boots"].length > 0){
					userLoose -= ((userLoose/100)*items[users[usr[oTurn]]["boots"]]["def"]);
				}

				if(users[usr[oTurn]]["ring"] == undefined){
					users[usr[oTurn]]["ring"] = "";
				}

				try{
					
					if(users[usr[turn]].ring != ""){
						if(items[users[usr[turn]].ring].ring.stat == "strength"){
							if(userLoose > 0){
								userLoose *= items[users[usr[turn]].ring].ring.boost;
								userLoose = Math.ceil(userLoose);
								if(userLoose <= 0){
									userLoose = 1;
								}
							}
						}
					}

					if(users[usr[oTurn]].ring != ""){
						if(items[users[usr[oTurn]].ring].ring.stat == "defense"){
							if(userLoose > 0){
								userLoose = Math.floor(userLoose*(items[users[usr[oTurn]].ring].ring.boost));
								if(userLoose <= 0 || userLoose == NaN){
									userLoose = 1;
								}
							}
						}
					}

					/*if(users[usr[turn]].ring == "29"){
						if(userLoose > 0){
							userLoose *= items["29"]["ring"]["boost"];
							if(userLoose <= 0){
								userLoose = 1;
							}
						}
					}
					if(users[usr[oTurn]]["ring"] == "30"){
						if(userLoose > 0){
							userLoose = Math.floor(userLoose*(items["30"]["ring"]["boost"]));
							if(userLoose <= 0 || userLoose == NaN){
								userLoose = 1;
							}
						}
					}*/
				}catch(e){
					message.channel.sendMessage("```js\n"+e.stack+"```");
				}

				var crit = helper.rInt(1, 100);

				var ch = 10+Math.floor(users[usr[turn]]["stats"]["luck"]/40);

				if(ch < 10){
					ch = 10;
				}

				if(crit < ch){
					userLoose = userLoose*2;
				}

				if(userLoose < 0){
					userLoose = 1;
				}

				if(userLoose == NaN){
					userLoose = 1;
				}

				userLoose = Math.ceil(userLoose);

				//userLoose+= Math.floor(Math.sqrt(users[usr[turn]]["stats"]["strength"]) * 0.25);

				if(turn == 0){
					//userLoose -= Math.floor(Math.sqrt(users[usr[1]]["stats"]["defense"]) * 0.25);
					users[usr[1]]["hp"] -= userLoose;
				}else{
					//userLoose -= Math.floor(Math.sqrt(users[usr[0]]["stats"]["defense"]) * 0.25);
					users[usr[0]]["hp"] -= userLoose;
				}


				if(users[usr[oTurn]]["hp"] <= 0){
					var lGold = 0;
					if(users[usr[oTurn]]["gold"] >= 50){
						lGold = helper.rInt(0,(users[usr[oTurn]]["gold"] / 2));
					}

					users[usr[oTurn]]["gold"] -= lGold;
					users[usr[oTurn]]["hp"] = Math.round(users[usr[oTurn]]["maxhp"] * 0.25);
					users[usr[oTurn]]["deaths"]++;

					users[usr[turn]]["gold"]+= lGold;

					try{
						if(delete battles[id]){
							delete battles[id];
						}else{
							message.channel.sendMessage("Something went wrong");
							return;
						}
					}catch(e){
						message.channel.sendMessage("```js\n"+e+"```");
						return;
					}

					var head = "!======== [R.I.P "+bot.users.get("id", usr[oTurn]).name+"] ========!";
					var msg = "```diff\n"+head+"\n";
					msg+= bot.users.get("id", usr[turn]).name+" rolled a "+Math.round(num)+".\n";
					msg+= "- "+bot.users.get("id", usr[turn]).name+" Dealt "+userLoose.formatNumber()+"HP Damage.\n";
					msg+= "- Losses: "+lGold.formatNumber()+" Gold.";

					msg+= "\n!"+"=".repeat(head.length-2)+"!```\n";

					msg+="http://res.discorddungeons.me/images/RIP.png";

					message.channel.sendMessage(msg);
					saveBattles(bot, message);
					return;
				}

				var head = "!======== ["+bot.users.get("id", usr[0]).name+"'s Battle with "+bot.users.get("id", usr[1]).name+"] ========!";
				var msg = "```diff\n"+head+"\n";
				msg+= bot.users.get("id", usr[turn]).name+"'s turn.\n";
				msg+= "+ Rolled a "+Math.round(num)+".\n";
				
				if(crit < ch){
					msg += "+ Critical Hit!\n";
				}

				msg+= "+ Dealt "+userLoose.formatNumber()+"HP damage.\n";
				if(turn == 0){
					msg+= "-  "+bot.users.get("id", usr[1]).name+" has "+users[usr[1]]["hp"].formatNumber()+"/"+(users[usr[1]]["maxhp"]).formatNumber()+" HP left.\n";
				}else{
					msg+= "-  "+bot.users.get("id", usr[0]).name+" has "+users[usr[0]]["hp"].formatNumber()+"/"+(users[usr[0]]["maxhp"]).formatNumber()+" HP left.\n";
				}

			
				msg+= "!"+"=".repeat(head.length-2)+"!```\n";

				if(turn == 0){
					msg+= bot.users.get("id", usr[1]).name;
					battles[id]["turn"] = 1;
				}else{
					msg+= bot.users.get("id", usr[0]).name;
					battles[id]["turn"] = 0;
				}

				var prefix = settings["prefix"]["main"];

				if(servers.hasOwnProperty(message.guild.id)){
					prefix = servers[message.guild.id]["prefix"];
				}

				msg+= ", Type ``"+prefix+"bfight`` to fight.";

				message.channel.sendMessage(msg);
				saveBattles(bot, message);
				return;

			}else{
				console.log("no turn");
			}
		}catch(e){
			message.channel.sendMessage("```js\n"+e+"```");
		}
		return;
	}
	//End PVP Battle

	//Calculate Guild Level(OLD)

function getGuildLevel(id){

	if(guilds[id] != undefined){

		var members = guilds[id]["members"];
		var lTot = 0;

		members.map((a) => {
			if(users.hasOwnProperty(a)){
				lTot += users[a]["level"];
			}
		});


		return lTot / members.length;
	}else{
		return "Error. Guild doesn't exist.";
	}
}
	//End Calculate Guild Level(OLD)


function buyGuild(item, message, bot, amt, guild){
	var user = message.author.id;
	if(Object.keys(gitems).indexOf(item) > -1){

		var itm = gitems[item];

		var msg = "";
		if(gitems[item]["cost"] > 0){

			var cost = amt*gitems[item]["cost"];

			if(cost <= 0){
				cost = 1;
			}

			if(guild["items"] == undefined){
				guild["items"] = [];
			}

			if(!guild.hasOwnProperty("inv")){
				guild["inv"] = {};
			}

			if(guild["items"] != undefined){

				guild.items.map((a, i) => {
					guild["items"].splice(i, 1);
					var search = guild["items"][i];
					var count = guild["items"].reduce(function(n, val){
						return n+(val === search);
					}, 0);

					if(!guild["inv"].hasOwnProperty(guild["items"][i])){
						guild["inv"][guild["items"][i]] = count;
					}
				});
			}

			var itms = [];

			Object.keys(guild.inv).map((a, i) => {
				if(guild.inv[a] <= 0){
					delete guild.inv[a];
				}else{
					var ps = guild.inv[a]+" x "+gitems[a].name;
					if(itms.indexOf(ps) == -1){
						itms.push(ps);
					}
				}
			});

			if(guild["gold"] >= cost){
				guild["gold"] -= cost;
				if(amt > 1){
					if(guild["inv"].hasOwnProperty(item)){
						guild["inv"][item] += amt;
					}else{
						guild["inv"][item] = amt;
					}
					
					msg = message.author.username+" bought "+amt+" "+(gitems[item].plural || gitems[item].name)+" for "+cost+" gold and is now in the guild inventory.";
				}else{
					if(guild["inv"].hasOwnProperty(item)){
						guild["inv"][item]++;
					}else{
						guild["inv"][item] = 1;
					}
					msg = message.author.username+" bought "+gitems[item]["prefix"]+" "+gitems[item]["name"]+" for "+gitems[item]["cost"]+" gold and is now in the guild inventory.";
				}
			}else{
				if(amt > 1){
					msg = message.author.username+" tried to buy "+amt+" items but their guild didn't have enough gold.";
				}else{
					msg = message.author.username+" tried to buy an item but their guild didn't have enough gold.";
				}
			}
			saveUsers(bot, message);
			message.channel.sendMessage(msg);
			}
	}else{
		message.channel.sendMessage(message.author.username+" tried to buy an unknown guild item.");
	}
}



// Nickname stuff

function setNick(message, bot){
	if(message.guild != null && message.guild != undefined && message.author != undefined){
		if(message.channel.permissionsFor(bot.user).hasPermission("MANAGE_NICKNAMES")){ // If the bot has permissions to set nicknames
		
			if(users[message.author.id]["donate"] == undefined){ // If there's no "donate" field in the user
				users[message.author.id]["donate"] = false; // Set it to false
			}

			if(message.mentions.users.size <= 0){ // If no mentions, AKA the stats of the user themselves

				if(users[message.author.id].nick == undefined){ // If the user has no "nick" field
					users[message.author.id].nick = 1; // Set it to 1 (Default)
				}

				var format = users[message.author.id].nick;

				if(format != 0){

					var n;

					if(format == 1 || format == 3){ // Default format or format 3
						n = message.author.username+" [Lvl. "+users[message.author.id].level+"]"; // Set n to the users name along with their level as "[Lvl. <level>]"
					}else if(format == 2){
						n = message.author.username+" Lv"+users[message.author.id].level; // Set n to the users name along with their level as "Lv.<level>"
					}
					
					if(users[message.author.id]["guild"] != ""){ // If the user is in a guild
						guild = guilds[users[message.author.id]["guild"]]; // Get the guild

						if(guild["tag"] != "" && guild["tag"] != undefined){ // If the guild has a tag

							if(format == 1){ // Default format
								n = "["+guild.tag+"] "+n;
							}else if(format == 2 || format == 3){
								n = guild.tag+" | "+n;
							}
						}

						if(guild["role"] != "" && guild["role"] != undefined){
							if(message.guild.roles.exists("id", guild["role"])){
									if(!message.guild.members.find("id", message.author.id).roles.exists("id", guild.role)){
										message.guild.members.find("id", message.author.id).addRoles(guild.role);
									}
								}
							}
						}
					}

					if(users[message.author.id]["donate"]){ // If the user is a donator

						if(format == 1){ // Default format
							n = "[Donator] "+n; // Add the donator tag to the name
						}else if(format == 2 || format == 3){
							n = fix.decodeHTML("&#x1F31F;")+" | "+n;
						}
					}

					message.guild.members.find("id", message.author.id).setNickname(n);
				}
			}
		}
}









	//ALL OF THE FUCKING COMMANDS





var defaults ={
	//Info Command
	"info":{
		process: function(args, message, bot){
			var msg = "RPGBot Version "+version+" - Made by "+bot.users.find("id", settings["owner"]).username;
			//msg+= "\nThanks to "+bot.users.get("id","158049329150427136").name+" for helping with graphics and managing the official Wiki.";
			//msg+= "\nThanks to "+bot.users.get("id", "120627061214806016").name+" for noting in the code, as well as managing the official Wiki.";
			msg+= "\nYou can join the official server at https://discord.discorddungeons.me\nCheck the official site out at https://discorddungeons.me\nCheck out our subreddit! http://reddit.com/r/DiscordDungeons";
			message.channel.sendMessage(msg);
		},
		"desc": "Shows info about the bot.",
		"usage": "info",
		"cooldown": 10,
		"cmsg": 5
	},
	"support": {
		process: function(args, message, bot){
			var msg = "Hosting Discord Dungeons costs $200 a year. Help us fund it by donating via PayPal here https://discorddungeons.me/donate.html\nThanks!";
			message.channel.sendMessage(msg);
		},
		"desc": "Shows a link to where you can support Discord Dungeons.",
		"usage": "support",
		"cooldown": 10,
		"cmsg": 5
	},
	"wiki": {
		process: function(args, message, bot){
			message.channel.sendMessage("The official wiki can be found at https://wiki.discorddungeons.me/?utm_medium=referral&utm_source=bot");
			return;
		},
		"desc": "Shows a link to the official wiki",
		"usage": "wiki",
		"cooldown": 10,
		"cmsg": 5
	},
	//Help Command
	"help":{
		process: function(args, message, bot){
			if(args.length >= 2){
				var cmd = args[1].toLowerCase();

				var alias = require("../data/alias.json");

				var cmds = [];
				Object.keys(defaults).map((a) => { cmds.push(a);});
				Object.keys(alias).map((a) => { cmds.push(a);});


				var index = cmds.indexOf(cmd);
				if(index > -1){
					var helpMsg = "__**"+helper.capFirst(cmd)+"**__\n\n";

					if(Object.keys(alias).indexOf(cmd) > -1){
						cmd = alias[cmd];
					}

					helpMsg+= "**Description: **"+defaults[cmd].desc+"\n\n";

					var prefix = settings["prefix"]["main"];
					if(!message.channel.isPrivate){
						if(servers.hasOwnProperty(message.guild.id)){
							prefix = servers[message.guild.id]["prefix"];
						}
					}

					helpMsg+= "**Usage: **"+prefix+""+defaults[cmd].usage;

					message.channel.sendMessage(helpMsg);
				}
			}else{
				var prefix = settings["prefix"]["main"];

				if(message.channel.type === "text"){
					if(servers.hasOwnProperty(message.guild.id)){
						prefix = servers[message.guild.id]["prefix"];
					}
				}
				var msg = "Hi! I'm "+bot.user.username+"! For a list of the commands I recognize, you can type ``"+prefix+"commands``";
				if(settings["prefix"]["botname"]){
					msg+= ", ``"+bot.user.username+" commands`` or ``@"+bot.user.username+" commands``";
				}
				msg += "\nStart your adventure by typing ``"+prefix+"stats``";
				message.channel.sendMessage(msg);
			}
		},
		"desc": "Shows help message",
		"usage": "help ``[command]``",
		"cooldown": 10,
		"cmsg": 5
	},
	//Commands Command
	"commands":{
		process: function(args, message, bot){
			var cms = [];

			var def = Object.keys(defaults).sort();
			var alias = Object.keys(require("../data/alias.json")).sort();

			def.map((a) => {
				defaults[a].hasOwnProperty("unlisted")&&"172404603273347072"==message.channel.id&&"172382467385196544"==message.guild.id?cms.push("``"+helper.capFirst(a)+"``"):defaults[a].hasOwnProperty("unlisted")||cms.push("``"+helper.capFirst(a)+"``");
			});

			alias.map((a) => {
				cms.push("``"+helper.capFirst(a)+"``");
			});

			var helpMsg = "__**Commands:**__\n\n";
			helpMsg+= cms.sort().join(", ");
			message.channel.sendMessage(helpMsg);
		},
		"desc": "Shows commands",
		"usage": "commands",
		"cooldown": 10,
		"cmsg": 5
	},
	//Stats Command
	"stats":{
		process: function(args, message, bot){
			try{

				var user = message.author.id; // Get message author ID

				if(message.mentions.users.size >= 1){
					user = message.mentions.users.array()[0].id;
					if(user == bot.user.id){
						if(message.mentions.users.size >= 2){
							user = message.mentions.users.array()[1].id;
						}else{
							user = message.author.id;
						}
					}
					if(users[user] == undefined){
						var msg = "";
						if(message.mentions.users.size >= 1){
							msg = message.author.username+", "+bot.users.find("id", user).username+" hasn't started their adventure yet";
							message.channel.sendMessage(msg);
						}
						return;
					}
				}

				
				
				var head = "!======== ["+bot.users.find("id", user).username+"'s stats] ========!";
				var msg = "```diff\n"+head;
				var usr;
				
				var prefix = settings["prefix"]["main"];

				if(message.channel.isPrivate === "text"){
					if(servers.hasOwnProperty(message.guild.id)){
						prefix = servers[message.guild.id]["prefix"];
					}
				}

				if(Object.keys(users).indexOf(user) > -1){
					usr = users[user];
					if(users[message.author.id]["name"] != message.author.username){
						users[message.author.id]["name"] = message.author.username;
					}
				}else{
					if(message.mentions.users.size <= 0){
						create(user, message.author.username, bot);
						msg+= "\n% Welcome new player. Please use `"+prefix+"assign (attribute) (points)` to assign your "+users[user]["points"]+" attribute points.";
						usr = users[user];
					}
				}


				if(usr["hp"] <= ((usr["maxhp"]/100)*10)){
					msg += "\n-";
				}else{
					msg += "\n+"
				}

				msg+= " Health: "+formatNumber(usr["hp"])+"/"+formatNumber(usr["maxhp"])+"HP.";
				msg+= "\n+ Inventory is in "+prefix+"inv";
				
				msg+= "\n+ Weapon: "+getWep(usr["weapon"])["name"];

				if(usr["ring"] == undefined){
					usr["ring"] = "";
				}

				if(usr["helm"] == undefined){
					usr["helm"] = "";
				}

				if(usr["chest"] == undefined){
					usr["chest"] = "";
				}

				if(usr["boots"] == undefined){
					usr["boots"] = "";
				}

				if(usr["gloves"] == undefined){
					usr["gloves"] = "";
				}

				if(usr["bracelet"] == undefined){
					usr["bracelet"] = "";
				}

				var rin = "None.";
				var helm = "None.";
				var chest = "None.";
				var boots = "None.";

				if(usr["ring"].length > 0){
					rin = items[usr["ring"]]["name"];
				}
				if(usr["helm"].length > 0){
					helm = items[usr["helm"]]["name"];
				}
				if(usr["chest"].length > 0){
					chest = items[usr["chest"]]["name"];
				}
				if(usr["boots"].length > 0){
					boots = items[usr["boots"]]["name"];
				}

				msg+= "\n+ Ring: "+rin+" | Helmet: "+helm+" \n+ Chestplate: "+chest+" | Boots: "+boots;

				if(usr["gold"] == null){
					usr["gold"] = 0;
					saveUsers(bot, message);
				}

				msg+= "\n+ Level "+usr["level"]+"("+formatNumber(usr["xp"])+"/"+formatNumber(getLevelUp(usr["level"]))+"XP) | "+formatNumber(usr['gold'])+" Gold";
				msg+= "\n+ Killed "+usr["kills"]+" enemies. Slain "+usr["deaths"]+" times.";
				msg+= "\n+ Strength: "+usr["stats"]["strength"].formatNumber()+", Defense: "+usr["stats"]["defense"].formatNumber();
				msg+= "\n+ Charisma: "+usr["stats"]["charisma"].formatNumber()+", Luck: "+usr["stats"]["luck"].formatNumber();
				msg+= "\n+ Unassigned: "+usr["points"].formatNumber()+" points.";

				if(usr["guild"] == undefined){
					usr["guild"] = "";
				}

				if(usr["guild"].length > 0){
					if(guilds[usr["guild"]] == undefined){
						usr["guild"] = "";
					}else{
						msg +="\n+ Guild: "+guilds[usr["guild"]]["name"];
						if(message.channel.type === "text"){
							if(message.author.id in users){
								if(users[message.author.id].guild != ""){
									let guild = guilds[users[message.author.id].guild];
									if(guild.role != ""){
										if(message.guild.roles.exists("id", guild.role)){
											if(!message.guild.members.find("id", message.author.id).roles.exists("id", guild.role)){
												message.guild.members.find("id", message.author.id).setRoles(message.guild.members.find("id", message.author.id).roles.array().push(guild.role));
											}
										}
									}
								}
							}
						}
					}
				}
				msg+= "\n!"+"=".repeat(head.length-2)+"!```\n";

				setNick(message, bot);

				message.channel.sendMessage(msg);
				saveUsers(bot, message);
			}catch(e){
				message.channel.sendMessage("Whoops! An error occured! Please report it in the Official server! ```js\n"+e.stack+"```");
			}
		},
		"desc": "Shows your RPG stats",
		"usage": "stats",
		"cooldown": 10,
		"cmsg": 5
	},
	//Adventure Command
	"adventure":{
		process: function(args, message, bot){
			try{

				if(users[message.author.id] == undefined){
					message.channel.sendMessage(message.author.username+", please get your stats before going on an adventure!");
					return;
				}

				if(args.length >= 2){
					if(Object.keys(users).indexOf(message.author.id) == -1){
						create(message.author.id, message.author.username, bot);
						saveUsers(bot, message);
					}

					if(Object.keys(adventures).indexOf(message.author.id) >-1){
						if(args[1] == "1" || args[1] == 0){
							delete adventures[message.author.id];
							message.channel.sendMessage(message.author.username+" abandoned their adventure!");

						}else if(args[1] == "2" || args[1] == 2){
							adventure(args, message, bot);
						}
					}else{
						adventure(args, message, bot);
					}
				}else{
					if(Object.keys(adventures).indexOf(message.author.id) > -1){
						adventure(args, message, bot);
						//message.channel.sendMessage("Type ``"+settings["prefix"]["main"]+"adventure 1`` to run or ``"+settings["prefix"]["main"]+"adventure 2`` to fight again.");
						return;
					}
					adventure(args, message, bot);
				}
			}catch(e){
				message.channel.sendMessage("Whoops! An error occured! Please report it in the Official server! ```js\n"+e.name + ': ' + e.message+" "+e.stack.split("\n")[4]+"```");

			}
		},
		"desc": "Go on an adventure!",
		"usage": "adventure",
		"cooldown": 14,
		"cmsg": 7
	},
	//Heal Command
	"heal":{
		process: function(args, message, bot){
			var user = message.author.id;

			var amt = 1;

			if(!users.hasOwnProperty(user)){
				message.channel.sendMessage(message.author.username+", please start your adventure first.");
				return;
			}

			if(users[user] != undefined){
				if(users[user]["name"] != message.author.username){
					users[user]["name"] = message.author.username;
				}
			}


			var usr = users[message.author.id];

			var itms = [];
			var count = 0;

			if(usr["items"] != undefined){


				fixInv(message.author.id);

				Object.keys(usr["inv"]).map((a) => {
					var ps = usr["inv"][a]+" x "+items[a]["name"];
					if(itms.indexOf(ps) == -1){
						itms.push(ps);
					}
				});
			}

			if(args.length >= 2){
				if(Number(args[1])){
					amt = Math.ceil(Number(args[1]));
				}else if(args[1].toLowerCase() == "auto"){
					var hl = 50;
					amt = Math.ceil((users[user].maxhp - users[user].hp) / 50);
				}
			}

			if(usr["inv"].hasOwnProperty("1")){
				count = usr["inv"]["1"];
			}

			if(amt <= count && count > 0){

				if(users[user]["hp"] >= users[user]["maxhp"]){
					message.channel.sendMessage(message.author.username+" tried to heal, but they're already on full health.");
					return;
				}

				if(users[user]["inv"].hasOwnProperty("1")){
					
					var msg = message.author.username+" used ";
					var tot = 0;
					var MaxHP = users[message.author.id].maxhp;
					var CurrentHP = users[message.author.id].hp;
					var ItemHealValue = 50;
					var ItemCount = amt;
					var OptimalCount = Math.ceil((MaxHP - CurrentHP) / ItemHealValue);

					if(ItemCount < OptimalCount){
						tot = (ItemHealValue * ItemCount);
						OptimalCount = ItemCount;
					}else{
						tot = (MaxHP - CurrentHP);
					}

					if(OptimalCount > 1){
						msg += OptimalCount.formatNumber()+" "+(items["1"].plural || items["1"].name)+" and got ";
					}else{
						msg += OptimalCount.formatNumber()+" "+items["1"].name+" and got ";
					}

					users[user]["inv"]["1"] -= OptimalCount;
					users[user].hp += tot;

					msg+= tot.formatNumber()+"HP. ("+users[user].hp.formatNumber()+"/"+users[user].maxhp.formatNumber()+" HP)";

					message.channel.sendMessage(msg);
					saveUsers(bot, message);

				}else{
					message.channel.sendMessage(message.author.username+" tried to use a Health Potion, but has none.");
				}
			}else{
				var msg = message.author.username+" tried to use "+amt.formatNumber()+" health potions but"
				if(count == 1){
					msg += " only has one";
				}else if(count <= 0){
					msg += " has none";
				}else{
					msg += " only has "+count.formatNumber();
				}
				message.channel.sendMessage(msg);
			}
		},
		"desc": "Heal using a health potion",
		"usage": "heal ``[amount/'auto']``",
		"cooldown": 10,
		"cmsg": 5
	},
	//Use Command
	"use":{
		process: function(args, message, bot){

			var amt = 1;

			if(!users[message.author.id] == undefined){
				if(users[message.author.id]["name"] != message.author.username){
					user[message.author.id]["name"] = message.author.username;
				}
			}

			var usr = users[message.author.id];

			fixInv(message.author.id);

			itms = [];


			Object.keys(usr["inv"]).map((a) => {
				var ps = usr["inv"][a]+" x "+items[a]["name"];
				if(itms.indexOf(ps) == -1){
					itms.push(ps);
				}
			});

			var item = args.splice(1, args.length).join(" ");

			var matches = item.match(/\d+|all$/i);

			if(matches){
				if(Number(matches[0])){
					amt = Number(matches[0]);
					item = item.replace(/\d+|all$/, "").replace(/\s*$/, "");
				}else{
					if(matches[0].toLowerCase() == "all"){

						item = item.replace(/\d+|all$/, "").replace(/\s*$/, "");
						var itm;

						Object.keys(items).map((a) => {
							if(item.toLowerCase() == items[a]["name"].toLowerCase()){
								itm = a;
							}
						});

						var hs = users[message.author.id]["inv"][itm];

						if(hs == undefined){
							hs = 0;
						}
						if(hs >= 0){
							amt = hs;
						}
					}
				}
			}

			var uitems = [];

			Object.keys(usr["inv"]).map((a) => {
				var n = items[a]["name"];
				if(uitems.indexOf(n) == -1){
					uitems.push(n);
				}
			});

			var itmz = [];


			var results = filter.filter(uitems, item.toLowerCase());
			var found = false;

			Object.keys(items).map((a) => {
				if(items[a]["name"].toLowerCase() == item.toLowerCase()){
					use(a, message, bot, amt);
					found = true;
					return;
				}
			});

			if(results.length > 0 && !found){
				var itmFound = [];
				var msg = "";
				
				msg += "Found "+results.length+" item";
				
				if(results.length > 1){
					msg += "s";
				}

				msg += ".\n";

				results.map((a) => {
					itmFound.push("``"+a+"``");
				});

				msg+= itmFound.sort().join(", ");
				message.channel.sendMessage(msg);
				return;
			}

			if(results.length <= 0 && !found){
				message.channel.sendMessage(message.author.username+" tried to use an unknown item!");
				return;
			}
		},
		"desc": "Uses an item",
		"usage": "use ``item`` ``[amount]``",
		"cooldown": 10,
		"cmsg": 5
	},
	//Buy Command
	"buy":{
		process: function(args, message, bot){
			if(!users[message.author.id] == undefined){
				if(users[message.author.id]["name"] != message.author.username){
					user[message.author.id]["name"] = message.author.username;
				}

				var usr = users[message.author.id];

				fixInv(message.author.id);

				Object.keys(usr["inv"]).map((a) => {
					var ps = usr["inv"][a]+" x "+items[a]["name"];
					if(itms.indexOf(ps) == -1){
						itms.push(ps);
					}
				});

			}

			if(users[message.author.id] == undefined){
				message.channel.sendMessage(message.author.username+", please start your adventure first.");
				return;
			}

			var inBattle = false;

			Object.keys(battles).map((a) => {
				if(battles[a]["usr"].indexOf(message.author.id) > -1 && battles[a].active){
					inBattle = true;
				}
			});

			if(inBattle){
				message.channel.sendMessage("You can't buy items during a battle, "+message.author.username);
				return;
			}

			var item = args.splice(1, args.length).join(" ").replace(/\s*$/, "");
			//message.channel.sendMessage("[DEBUG] "+item);

			var amt = 1;

			var matches = item.match(/\d+$/);

			if(matches){
				amt = Number(matches[0]);
				item = item.replace(/\d+$/, "").replace(/\s*$/, "");
			}

			var found = false;

			var results = filter.filter(itmObj, item.toLowerCase(),{key: "name"});

			Object.keys(items).map((a) => {
				if(item.toLowerCase() == items[a]["name"].toLowerCase()){
					buy(a, message, bot, amt);
					found = true;
				}
			});

			if(results.length > 0 && !found){
				var itmFound = [];
				var msg = "";
				msg+= "Found "+results.length+" items.\n";

				results.map((a) => {
					itmFound.push("``"+a["name"]+"``");
				});

				msg+= itmFound.sort().join(", ");
				message.channel.sendMessage(msg);
			}

			if(results.length <= 0 && !found){
				message.channel.sendMessage(message.author.username+" tried to buy an unknown item!");
				return;
			}
		},
		"desc": "Buys an item",
		"usage": "buy ``item`` ``[Amount]``",
		"cooldown": 10,
		"cmsg": 5
	},
	//Assign Command
	"assign":{
		process: function(args, message, bot){

			if(!users[message.author.id] == undefined){
				if(users[message.author.id]["name"] != message.author.username){
					user[message.author.id]["name"] = message.author.username;
				}
			}

			if(args.length >= 3){
				var user = message.author.id;

				var attr = args[1].toLowerCase();

				switch(attr){
					case "str":
						attr = "strength";
					break;
					case "lck":
						attr = "luck";
					break;
					case "def":
						attr = "defense";
					break;
					case "cha":
						attr = "charisma";
					break;
					default:
						attr = attr;
					break;
				}

				if(Number(args[2])){
					var amount = Math.floor(Number(args[2]));
				}else{
					message.channel.sendMessage(message.author.username+" tried to assign an invalid amount of points.");
					return;
				}

				if(amount <= 0){
					message.channel.sendMessage(message.author.username+" tried to assign an invalid amount of points.");
					return;
				}

				if(!users.hasOwnProperty(user)){
					create(user, message.author.username, bot);
					saveUsers(bot, message);
				}

				if(amount > users[user]["points"]){
					message.channel.sendMessage(message.author.username+" tried to assign "+amount.formatNumber()+" attribute points, but they only have "+users[user]["points"].formatNumber());
					return;
				}else{
					if(Object.keys(users[user]["stats"]).indexOf(attr) >-1){
						var msg = message.author.username+" assigned "+amount+" attribute points to their "+helper.capFirst(attr)+" attribute.";
						users[user]["stats"][attr]+= amount;
						users[user]["points"] -= amount;

						message.channel.sendMessage(msg);
						saveUsers(bot, message);
						return;

					}else{
						message.channel.sendMessage(message.author.username+" tried to assign attribute points to a unknown attribute.");
						return;
					}
				}
			}
		},
		"desc": "Assigns attribute points",
		"usage": "assign ``attribute`` ``points``",
		"cooldown": 5,
		"cmsg": 2
	},
	//Ping Command
	"ping":{
		process: function(args, message, bot){
			var n = Date.now();
			var id = message.author.id;
			message.reply("Pong!").then((m) => {
				let time = (m.timestamp-n)/1000;
				m.edit("<@"+id+"> Pong! (Time taken: "+time+" Seconds)");
			});
		},
		"desc": "Pong!",
		"usage": "ping",
		"cooldown": 10,
		"cmsg": 5
	},
	//Pong Command
	"pong":{
		process: function(args, message, bot){
			var n = Date.now();
			var id = message.author.id;
			message.reply("Ping!").then((m) => {
				let time = (m.timestamp-n)/1000;
				m.edit("<@"+id+"> Ping! (Time taken: "+time+" Seconds)");
			});
		},
		"desc": "Ping!",
		"usage": "pong",
		"cooldown": 10,
		"cmsg": 5
	},
	//Invite Command
	"invite":{
		process: function(args, message, bot){
			message.channel.sendMessage("Click here to add me to your server! https://bot.discorddungeons.me");
		},
		"desc": "Gets an invite link for the bot.",
		"usage": "invite",
		"cooldown": 10,
		"cmsg": 5
	},
	//ServerInvite Command
	"serverinvite":{
		process: function(args, message, bot){
			message.channel.sendMessage("Click here to go to the official discord dungeons server! https://discord.discorddungeons.me");
		},
		"desc": "Gets an invite link for the bot.",
		"usage": "invite",
		"cooldown": 10,
		"cmsg": 5
	},
	//Items Command
	"items":{
		process: function(args, message, bot){

			var p = 1;
			var ipp = 15; // Items Per Page

			if(args.length >= 2){
				if(Number(args[1])){
					p = Number(args[1]);

					if(p < 1){
						p = 1;
					}

					if(p > Math.ceil(Object.keys(items).length/ipp)){
						p = Math.ceil(Object.keys(items).length/ipp);
					}
				}
			}

			if(!users[message.author.id] == undefined){
				if(users[message.author.id]["name"] != message.author.username){
					user[message.author.id]["name"] = message.author.username;
				}

				var usr = users[message.author.id];

				fixInv(message.author.id);

				Object.keys(usr["inv"]).map((a) => {
					var ps = usr["inv"][a]+" x "+items[a]["name"];
					if(itms.indexOf(ps) == -1){
						itms.push(ps);
					}
				});

			}

			var itmz = [];
			var i = {};
			var d = [];

			var unbuy = [];



			for(let x in items){
				i[x] = items[x]["cost"];
			}

			for(let x in i){
				d.push([x, i[x]]);
			}

			var k = d.sort(function(a, b){return a[1] - b[1]});

			k.map((a, b) => {
				var n = items[a[0]]["name"];
				var c = items[a[0]]["cost"];
				var l = items[a[0]]["level"];
				if(c <= -1){
					unbuy.push("% "+n+" - UNBUYABLE {Lvl. "+formatNumber(l)+"}");
				}else{
					if(users[message.author.id] != undefined){
						if(c <= users[message.author.id]["gold"] && l <= users[message.author.id]["level"]){
							itmz.push("+ "+n+" - "+formatNumber(c)+" Gold {Lvl. "+formatNumber(l)+"}");
						}else{
							itmz.push("- "+n+" - "+formatNumber(c)+" Gold {Lvl. "+formatNumber(l)+"}");
						}
					}else{
						itmz.push("% {} - {} Gold {Lvl. {}}".format(n, formatNumber(c), formatNumber(l)));
					}
				}
			});

			var s = 0;
			var e = p*ipp;

			/*itmz.map((a, b) => {
				if(RegExp("unbuyable", "gmi").test(a)){
					itmz.splice(b, 1);
					unbuy.push(a);
				}
			});

			message.channel.sendMessage("[DEBUG] "+unbuy);*/

			unbuy.sort().map((a) => {
				itmz.push(a);
			});

			if(e > itmz.length){
				e = itmz.length;
			}

			if(p > 1){
				s = p;
				s *= ipp;
				if(s >= e){
					s = e-ipp;
				}
			}

			var head = "! ===== [Items (Page "+p+"/"+Math.ceil(Object.keys(items).length/ipp)+")] ===== !";
			var msg = "```diff\n"+head+"\n";
			msg+= itmz.slice(s, e).join("\n");
			msg+= "\n!"+"=".repeat(head.length-4)+"!```";
			message.channel.sendMessage(msg);
		},
		"desc": "Sends a list of items",
		"usage": "items ``[page]``",
		"cooldown": 5,
		"cmsg": 2
	},
	//Guilds Command
	"guilds":{
		process: function(args, message, bot){
			var cacheguilds = guilds;
			var isht = "";

			if(args[2]==undefined){}else{
				switch(args[2].toLowerCase()){
					case "open":
						cacheguilds = {};
						isht = "Open ";
						Object.keys(guilds).map((a) => {
							if(guilds[a]["open"]){
								cacheguilds[a] = guilds[a];
							}
						});
						break;
					case "closed":
						cacheguilds = {};
						isht = "Closed ";
						Object.keys(guilds).map((a) => {
							if(!guilds[a]["open"]){
								cacheguilds[a] = guilds[a];
							}
						});
						break;
					default:
						cacheguilds = {};
						Object.keys(guilds).map((a) => {
							cacheguilds[a] = guilds[a];
						});
						break;
				}
			}

			var p = 1;

			if(args.length >= 2){
				if(Number(args[1])){
					p = Number(args[1]);

					if(p < 1){
						p = 1;
					}

					if(p > Math.ceil(Object.keys(cacheguilds).length/10)){
						p = Math.ceil(Object.keys(cacheguilds).length/10);
					}
				}
			}

			var itmz = [];
			var i = {};
			var d = [];

			for(let x in cacheguilds){
				i[x] = cacheguilds[x]["level"];
			}

			for(let x in i){
				d.push([x, i[x]]);
			}

			var k = d.sort(function(a, b){return b[1] - a[1]});

			k.map((a, b) => {
				var n = cacheguilds[a[0]]["name"];
				var c = cacheguilds[a[0]]["members"].length;
				var l = cacheguilds[a[0]]["level"];
				if(isht==""){
				if(cacheguilds[a[0]]["open"]){
					itmz.push(n+" - "+formatNumber(c)+" Members {Lvl. "+l+"} OPEN");
				}else{
					itmz.push(n+" - "+formatNumber(c)+" Members {Lvl. "+l+"} CLOSED");
				}}else{
					itmz.push(n+" - "+formatNumber(c)+" Members {Lvl. "+l+"}");
				}
			});

			var s = 0;
			var e = p*10;

			if(e > itmz.length){
				e = itmz.length;
			}

			if(p > 1){
				s = p;
				s *= 10;
				if(s >= e){
					s = e-10;
				}
			}

			var msg = "```diff\n! "+isht+"Guilds (Page "+p+"/"+Math.ceil(Object.keys(cacheguilds).length/10)+")\n-   ";
			msg+= itmz.slice(s, e).join("\n-   ");
			msg+= "\n```";
			message.channel.sendMessage(msg);
		},
		"desc": "Displays a list of guilds",
		"usage": "guilds ``[page]`` ``[open/closed]``",
		"cooldown": 10,
		"cmsg": 5
	},
	//Guild Items Command
	"gitems":{

		process: function(args, message, bot){

			let p = 1;

			if(args.length >= 2){
				if(Number(args[1])){
					p = Number(args[1]);

					if(p < 1){
						p = 1;
					}

					if(p > Math.ceil(Object.keys(gitems).length/10)){
						p = Math.ceil(Object.keys(gitems).length/10);
					}
				}
			}

			if(!users[message.author.id] == undefined){
				if(users[message.author.id]["name"] != message.author.username){
					user[message.author.id]["name"] = message.author.username;
				}
			}

			let itmz = [];

			let i = {};
			let d = [];

			for(let x in gitems){
				i[x] = gitems[x]["cost"];
			}

			for(let x in i){
				d.push([x, i[x]]);
			}

			let k = d.sort(function(a, b){return a[1] - b[1]});

			k.map((a, b) => {
				let n = gitems[a[0]]["name"];
				let c = gitems[a[0]]["cost"];
				if(c <= -1){
					itmz.push(n+" - UNBUYABLE");
				}else{
					itmz.push(n+" - "+c.formatNumber()+" Gold");
				}
			});

			let s = 0;
			let e = 10*p;

			if(e > itmz.length){
				e = itmz.length;
			}

			if(p > 1){
				s =p;
				s *= 10;
				if(s >= e){
					s = e-10;
				}
			}

			var msg = "```diff\n! Guild Items (Page "+p+"/"+Math.ceil(Object.keys(gitems).length/10)+")\n-   ";
			msg+= itmz.slice(s, e).join("\n-   ");
			msg+= "\n```";
			message.channel.sendMessage(msg);
		},
		"desc": "Sends a list of guild items",
		"usage": "gitems ``[page]``",
		"cooldown": 10,
		"cmsg": 5
	},
	//Item Command
	"item":{
		process: function(args, message, bot){

			if(users[message.author.id] != undefined){
				if(users[message.author.id]["name"] != message.author.username){
					user[message.author.id]["name"] = message.author.username;
				}
			}

			if(args.length >= 2){
				var item = args.splice(1, args.length).join(" ");
				var msg = [];

				var results = filter.filter(itmObj, item.toLowerCase(),{key: "name"});

				var found = false;

				Object.keys(items).map((a) => {
					if(item.toLowerCase() == items[a]["name"].toLowerCase()){
						var msg = "";
						if(message.channel.type === "text" || message.guild.permissionsFor(bot.user).hasPermission("embedLinks")){
							let cache = new Date().valueOf().toString(36);
							msg = "http://api.discorddungeons.me/eitem/"+(Object.keys(items).indexOf(a)+1)+"?r="+cache;
						}else{
							var itm = items[a];
							var msg = "[WARNING] Bot doesn't have permission to embed links.\n```tex\n$ "+itm["name"]+"{Lvl. "+itm["level"]+"}$\n";
							switch(itm["type"]){
								case "potion":
									msg+= "# Effects: ";
									if(itm["potion"].hasOwnProperty("heal")){
										msg += "Heal "+itm["potion"]["heal"]+"HP\n";
									}
									break;
								case "weapon":
									msg+= "# Damage: "+formatNumber(itm["weapon"]["dmg"]["min"])+"-"+formatNumber(itm["weapon"]["dmg"]["max"])+"\n";
									break;
							}

							msg+= "# Price: "+formatNumber(itm["cost"])+" Gold\n";
							if(itm['sellable']){
								msg+= "# Sell Price: "+formatNumber(itm["sell"])+" Gold\n";
							}
							msg+= "% "+itm["desc"]+"```\n";

							if(itm.hasOwnProperty("image")){
								msg+="https://res.discorddungeons.me/images/"+itm["image"]+"\n";
							}
						}
						message.channel.sendMessage(msg);
						found = true;
						return;
					}
				});

				if(results.length > 0 && !found){
					var itmFound = [];
					var msg = "";
					msg+= "Found "+results.length+" item";

					if(results.length > 1){
						msg += "s";
					}

					msg += ".\n";

					results.map((a) => {
						itmFound.push("``"+a["name"]+"``");
					});

					msg+= itmFound.sort().join(", ");
					message.channel.sendMessage(msg);
					return;
				}

				if(!found){
					message.channel.sendMessage(message.author.username+" tried to get info about an unknown item!");
				}
			}
		},
		"desc": "Shows information about an item",
		"usage": "item ``item``",
		"cooldown": 5,
		"cmsg": 2
	},
	//Guild Item Command
	"gitem":{
		process: function(args, message, bot){

			if(!users[message.author.id] == undefined){
				if(users[message.author.id]["name"] != message.author.username){
					user[message.author.id]["name"] = message.author.username;
				}
			}

			if(args.length >= 2){
				var item = args.splice(1, args.length).join(" ");
				var msg = "";

				var results = filter.filter(itmObj, item.toLowerCase(),{key: "name"});

				var found = false;

				Object.keys(gitems).map((a) => {
					if(item.toLowerCase() == gitems[a]["name"].toLowerCase()){
						if(message.guild.permissionsFor(bot.user).hasPermission("embedLinks")){
							msg = "http://api.discorddungeons.me/egitem/"+(Object.keys(gitems).indexOf(a)+1)+"?r="+helper.rInt(minCache, maxCache);
						}else{
							var itm = gitems[a];
							msg = "[WARNING] Bot doesn't have permission to embed links.\n```tex\n$ "+itm["name"]+"{Lvl. "+itm["level"]+"}$\n";
							msg+= "# Price: "+itm["cost"].formatNumber()+" Gold\n";
							msg+= "% "+itm["desc"]+"```\n";

							if(itm.hasOwnProperty("image")){
								msg+="https://res.discorddungeons.me/images/"+itm["image"]+"\n";
							}
						}

						message.channel.sendMessage(msg);
						found = true;
						return;
					}
				});

				if(results.length > 0 && !found){
					var itmFound = [];
					var msg = "";
					msg+= "Found "+results.length+" item";

					if(results.length > 1){
						msg += "s";
					}

					msg += ".\n";

					results.map((a) => {
						itmFound.push("``"+a["name"]+"``");
					})

					msg+= itmFound.sort().join(", ");
					message.channel.sendMessage(msg);
					return;
				}
				if(!found){
					message.channel.sendMessage(message.author.username+" tried to get info about an unknown item!");
				}
			}
		},
		"desc": "Shows information about an guild item",
		"usage": "gitem ``guild item``",
		"cooldown": 5,
		"cmsg": 2
	},
	//Suggest Command
	"suggest":{
		process: function(args, message, bot){
			try{

				if(message.channel.id == "173704638397284352"){
					message.delete();
					return;
				}

				if(args.length >= 2){
					var msg = args.splice(1, args.length).join(" ");
					bot.channels.find("id", "173704638397284352").sendMessage("[SUGGESTION] ["+new Date().toUTCString()+"] ["+message.author.username+"]("+message.author.id+") in channel ``"+message.channel.name+"``(``"+message.channel.id+"``) on server ``"+message.guild.name+"``(``"+message.guild.id+"``) \n ``"+msg+"``");
					message.channel.sendMessage("Suggestion sent.");
				}
			}catch(e){
				message.channel.sendMessage("Whoops! An error occured! Please report it in the Official server! ```js\n"+e.name + ': ' + e.message+" "+e.stack.split("\n")[4]+"```");
			}
		},
		"desc": "Sends a message to the developers.",
		"usage": "suggest ``message``",
		"cooldown": 10,
		"cmsg": 5
	},
	//GiveGold Command
	"givegold":{
		process: function(args, message, bot){
			if(args.length >= 3){
				if(message.author.id == settings["owner"] || message.author.id == "120627061214806016" || message.author.id == "158049329150427136" || message.author.id == "107868153240883200"){
					var to = message.mentions.users.array()[0].id;
					users[to]["gold"]+= Number(args[2]);
					message.channel.sendMessage("Gave "+bot.users.find("id", to).username+" "+args[2].formatNumber()+" gold");
					saveUsers(bot, message);
				}
			}
		},
		"desc": "Gives a user gold",
		"usage": "givegold ``user`` ``amount``",
		"cooldown": 10,
		"unlisted": true
	},
	"givelevel":{
		process: function(args, message, bot){
			if(args.length >= 3){
				if(message.author.id == settings["owner"] || message.author.id == "120627061214806016" || message.author.id == "158049329150427136" || message.author.id == "107868153240883200"){
					var to = message.mentions.users.array()[0].id;
					var num = Number(args[2]);
					users[to]["level"]+= num;
					users[to]["maxhp"] += num*50;
					users[to]["points"] += num*5;
					message.channel.sendMessage("Gave "+bot.users.find("id", to).username+" "+args[2].formatNumber()+" levels");
					saveUsers(bot, message);
				}
			}
		},
		"desc": "Gives a user levels",
		"usage": "givelevel ``user`` ``amount``",
		"cooldown": 10,
		"unlisted": true
	},
	//GivePoints Command
	"givepoints":{
		process: function(args, message, bot){
			if(args.length >= 3){
				if(message.author.id == settings["owner"] || message.author.id == "120627061214806016" || message.author.id == "158049329150427136" || message.author.id == "107868153240883200"){
					var to = message.mentions.users.array()[0].id;
					users[to]["points"]+= Number(args[2]);
					message.channel.sendMessage("Gave "+bot.users.find("id", to).username+" "+args[2].formatNumber()+" points");
					saveUsers(bot, message);
				}
			}
		},
		"desc": "Gives a user points",
		"usage": "givepoints ``user`` ``amount``",
		"cooldown": 10,
		"unlisted": true
	},
	//RData Command
	"rdata":{
		process: function(args, message, bot){
			if(message.author.id == settings["owner"]){
				try{
					items = "";
					mobs = "";
					gicons = "";
					achievements = "";

					delete require.cache[require.resolve('../data/items.json')];
					delete require.cache[require.resolve('../data/mobs.json')];
					delete require.cache[require.resolve('../data/gicons.json')];
					delete require.cache[require.resolve('../data/achievements.json')];


					items = require("../data/items.json");
					mobs = require("../data/mobs.json");

					gicons = require("../data/gicons.json");
					achievements = require("../data/achievements.json");

					itmObj = [];

					Object.keys(items).map((a) => {
						itmObj.push(items[a]);
					});

					message.channel.sendMessage("Reloaded all data.");
				}catch(e){
					message.channel.sendMessage("```js\n"+e+"```");
				}
			}
		},
		"desc": "Reloads data",
		"usage": "rdata",
		"cooldown": 10,
		"unlisted": true
	},
	"rchieves": {
		process: function(args, message, bot){
			if(message.author.id == settings["owner"] || message.author.id == "120627061214806016" || message.author.id == "158049329150427136" || message.author.id == "107868153240883200"){
				try{
					achievements = {};
					delete require.cache[require.resolve('../data/achievements.json')];
					achievements = require("../data/achievements.json");
					message.channel.sendMessage("Reloaded achievements.");
				}catch(e){
					message.channel.sendMessage("```js\n"+e+"```");
				}
			}
		},
		"desc": "Reloads achievements",
		"usage": "rchieves",
		"cooldown": 10,
		"unlisted": true
	},
	//Mine Command
	"mine":{
		process: function(args, message, bot){

			if(users[message.author.id] != undefined){
				if(users[message.author.id]["name"] != message.author.username||users[message.author.id]["name"]==undefined){
					users[message.author.id]["name"] = message.author.username;
				}

				var ico = fix.decodeHTML("&#x26CF;")
				var msg = ico+" "+message.author.username+" Found ";
				var usr = users[message.author.id];
				var luck = usr["stats"]["luck"];
				var str = usr["stats"]["strength"];
				var level = usr["level"];
				var user = message.author.id;


				if(usr.ring !== ""){
					if(items[usr.ring].ring.stat == "strength"){
						str = Math.floor(str*items[usr.ring].ring.boost);
					}else if(items[usr.ring].ring.stat == "luck"){
						luck = Math.floor(luck*items[usr.ring].ring.boost);
					}
				}


				if(usr["skills"] == undefined){
					usr["skills"] = {
						"chop": {
							"level": 1,
							"xp": 0
						},
						"mine": {
							"level": 1,
							"xp": 0
						},
						"forage": {
							"level": 1,
							"xp": 0
						},
						"fish": {
							"level": 1,
							"xp": 0
						}
					};
				}

				if(usr["skills"]["mine"] == undefined){
					usr["skills"]["mine"] = {
						"level": 1,
						"xp": 0
					};
				}

				var skillLevel = usr["skills"]["mine"]["level"];

				var minXP = Math.round(Math.sqrt((Math.sqrt(level)*0.25)*helper.rInt(5, 10) / 2)),
					maxXP = Math.round(Math.sqrt((Math.sqrt(level)*0.25)*helper.rInt(10, 15) / 2));


				var minSkillXP = Math.round(Math.sqrt((Math.sqrt(skillLevel)*0.25)*helper.rInt(5, 10) / 2)),
					maxSkillXP = Math.round(Math.sqrt((Math.sqrt(skillLevel)*0.25)*helper.rInt(10, 15) / 2));

				var xp = helper.rInt(minXP, maxXP);
				var skillXP = helper.rInt(minSkillXP, maxSkillXP);
				
				var gChance = helper.rInt(1, 100);

				var rock = helper.rInt(1, 130);

				var ch = 15+Math.floor(luck/40);

				if(ch < 15){
					ch = 15;
				}

				var gWin = 0;
				var amt = 0;
				var iid = "";


				if(gChance < ch){

					gWin = Math.round(Math.sqrt((Math.sqrt(luck)+level)*0.25)*helper.rInt(5, 10) / 2);

					if(gWin < 5){
						gWin = 5;
					}

					if(gWin > 0){
						msg += gWin+" gold ";
					}
				}

				if(rock <= 20){
					amt = 1+skillLevel+Math.floor(str/40);
					iid = "42";
				}else if(rock >= 21 && rock <= 40){
					amt = 1+skillLevel+Math.floor(str/40);
					iid = "62";
				}else if(rock >= 41 && rock <= 60){
					amt = 1+skillLevel+Math.floor(str/40);
					iid = "86";
				}else if(rock >= 61 && rock <= 90){
					amt = 1+skillLevel+Math.floor(str/40);
					iid = "43";
				}else if(rock >= 91 && rock <= 110){
					amt = 1+skillLevel+Math.floor(str/40);
					iid = "52";
				}else if(rock >= 111){
					amt = 1+skillLevel+Math.floor(str/40);
					iid = "138";
				}

				if(gWin > 0){
					msg += "and ";
				}

				if(amt > 1){
					msg += amt.formatNumber()+" "+(items[iid].plural || items[iid].name);
				}else{
					msg += amt.formatNumber()+" "+items[iid].name;
				}

				msg += " and got "+xp.formatNumber()+" XP and "+skillXP.formatNumber()+" skill XP ";

				msg += "while mining.\n";

				var levelup = getLevelUp(level);
				var skillup = getSkillLevelUp(skillLevel, "mine");

				users[message.author.id]["xp"]+= xp;
				users[message.author.id]["skills"]["mine"]["xp"] += skillXP;

				if(users[message.author.id]["xp"] >= levelup){
					users[user]["level"]++;
					users[user]["maxhp"]+= 50;
					users[user]["hp"] = users[user]["maxhp"];
					users[user]["points"]+= 5;
					msg += "\n"+message.author.username+" Leveled up! They've been awarded with 5 attribute points, and, along with their max HP increasing by 50, they've been fully healed!";
				}

				if(users[message.author.id]["skills"]["mine"]["xp"] >= skillup){
					users[message.author.id]["skills"]["mine"]["level"]++;
					msg += "\n"+message.author.username+" Leveled up in Mining!";
				}

				users[message.author.id]["gold"]+= gWin;

				if(users[message.author.id]["inv"] == undefined){
					fixInv(message.author.id);
				}

				if(users[message.author.id]["inv"].hasOwnProperty(iid)){
					users[message.author.id]["inv"][iid]+=amt;
				}else{
					if(amt > 0){
						users[message.author.id]["inv"][iid] = amt;
					}
				}

				saveUsers(bot, message);
				message.channel.sendMessage(msg);
			}else{
				message.channel.sendMessage(message.author.username+", please start your adventure first!");
				return;
			}
		},
		"desc": "Mine for gold or items.",
		"usage": "mine",
		"cooldown": 300,
		"cmsg": 30
	},
	//Eval2 Command
	"eval2":{
		process: function(args, message, bot){

			cLog("{} => {}".format(message.author.id, message.content));

			if(message.author.id == "216029313714094080"){
				message.channel.sendMessage("Stop.");
				return;
			}

			if(message.author.id == settings["owner"] || message.author.id == "120627061214806016" || message.author.id == "158049329150427136" || message.author.id == "107868153240883200"){
				try{
					var start = new Date().getTime();
					var msg = "";
					cLog("{} => {}".format(message.author.id, msg));
					if(args[1] == "-c"){
						args = args.splice(1, args.length);
						var code = args.splice(1, args.length).join(" ");
						cLog("{} => {}".format(message.author.username, code));
						msg+= "```js\n"+code+"```\n";
						msg+= "```js\n"+eval(code)+"```";
					}else{
						var code = args.splice(1, args.length).join(" ");
						cLog("{} => {}".format(message.author.username, code));
						msg+= "```js\n"+eval(code)+"```";
					}

					var end = new Date().getTime();
					var time = end - start;

					message.channel.sendMessage("Time taken: "+(time/1000)+" seconds\n"+msg);
				}catch(e){
					message.channel.sendMessage("```js\n"+e+"```");
				}
			}
		},
		"desc": "Eval",
		"usage": "eval2 ``code``",
		"cooldown": 10,
		"unlisted": true
	},
	//Battle Command
	"battle":{
		process: function(args, message, bot){
			if(args.length >= 2 && message.mentions.users.size >= 1){
				let to = message.mentions.users.array()[0];
				if(users.hasOwnProperty(message.author.id)){
					if(users.hasOwnProperty(to.id)){
						if(users[message.author.id]["pvp"]){

							let inBattleA = false;

							Object.keys(battles).map((a) => {
								if(battles[a]["usr"].indexOf(message.author.id) > -1){
									inBattleA = true;
								}
							});

							if(!inBattleA){

								if(users[to.id]["pvp"]){

									let inBattle = false;

									Object.keys(battles).map((a) => {
										if(battles[a]["usr"].indexOf(to.id) > -1){
											inBattle = true;
										}
									});

									if(!inBattle){

										let prefix = settings["prefix"]["main"];

										if(message.channel.type === "text"){
											if(servers.hasOwnProperty(message.guild.id)){
												prefix = (servers[message.guild.id].prefix || "#!");
											}
										}

										message.channel.sendMessage("<@{}>! {} Challenged you to a battle!\nType ``{}baccept`` to accept the battle or ``{}brefuse`` to decline.".format(to.id, message.author.username, prefix, prefix));
										battles[useful.guid()] ={"usr": [message.author.id, to.id],"accept": false, "active": false};
										saveBattles(bot, message);
									}else{
										message.channel.sendMessage(to.username+" is already in a battle, "+message.author.username);
									}
									return;
								}else{
									message.channel.sendMessage(message.author.username+"! "+to.username+" doesn't want to battle anyone!");
									return;
								}
							}else{
								message.channel.sendMessage("You're already in a battle, "+message.author.username+"!");
								return;
							}
						}else{
							message.channel.sendMessage(message.author.username+"! You've got your battles turned off!");
							return;
						}
					}else{
						message.channel.sendMessage(message.author.username+"! "+to.username+" couldn't be found anywhere!");
						return;
					}
				}else{
					message.channel.sendMessage(message.author.username+"! Please start your adventure first!");
					return;
				}
			}else{
				message.channel.sendMessage(message.author.username+"! Please tell me who you'd like to battle!");
				return;
			}
		},
		"desc": "Challenge someone to a PVP match.",
		"usage": "battle ``mention``",
		"cooldown": 10,
		"cmsg": 5
	},
	//Trigger Battle Command
	"tbattle":{
		process: function(args, message, bot){
			if(users.hasOwnProperty(message.author.id)){
				if(Object.keys(battles).length > 0){
					var found = false;
					Object.keys(battles).map((a) => {
						var b = battles[a];
						if(!found){
							if(b["usr"].indexOf(message.author.id) == -1){
								var msg = "";
								if(users[message.author.id]["pvp"]){
									users[message.author.id]["pvp"] = false;
									msg = message.author.username+"! Your battles have been turned off.";
								}else{
									users[message.author.id]["pvp"] = true;
									msg = message.author.username+"! Your battles have been turned on.";
								}
								saveUsers(bot, message);
								message.channel.sendMessage(msg);
								found = true;
							}else{
								message.channel.sendMessage(message.author.username+"! You can't turn off your battles when you're in a battle!");
								found = true;
							}
						}
					});

				}else{
					var msg = "";
					if(users[message.author.id]["pvp"]){
						users[message.author.id]["pvp"] = false;
						msg = message.author.username+"! Your battles have been turned off.";
					}else{
						users[message.author.id]["pvp"] = true;
						msg = message.author.username+"! Your battles have been turned on.";
					}
					saveUsers(bot, message);
					message.channel.sendMessage(msg);
					return;
				}
			}else{
				message.channel.sendMessage(message.author.id+"! Please start your adventure first!");
			}
		},
		"desc": "Toggle your battle status.",
		"usage": "tbattle",
		"cooldown": 10,
		"cmsg": 5
	},
	//Battle Accept Command
	"baccept":{
		process: function(args, message, bot){
			if(users.hasOwnProperty(message.author.id)){
				Object.keys(battles).map((a) => {
					var b = battles[a];
					if(b != undefined){
						if(b["usr"].indexOf(message.author.id) == 1){
							if(!b["accept"]){
								b["accept"] = true;
								b["turn"] = 1;
								b["active"] = true;

								let prefix = settings["prefix"]["main"];

								if(message.channel.type === "text"){
									if(servers.hasOwnProperty(message.guild.id)){
										prefix = (servers[message.guild.id].prefix || "#!");
									}
								}


								message.channel.sendMessage("<@"+b["usr"][0]+">! "+message.author.username+" Accepted your battle request!\n"+bot.users.find("id", b["usr"][1]).username+", use ``{}bfight`` to fight.".format(prefix));
								saveBattles(bot, message);
								return;
							}else{
								return;
							}
						}
					}
				});

			}else{
				message.channel.sendMessage(message.author.username+"! Nobody challenged you!");
				return;
			}
		},
		"desc": "Accept a battle request.",
		"usage": "baccept",
		"cooldown": 10,
		"cmsg": 5
	},
	//Battle Cancel Command
	"bcancel":{
		process: function(args, message, bot){
			if(users.hasOwnProperty(message.author.id)){

				var ba;

				Object.keys(battles).map((a) => {
					var b = battles[a];
					if(b["usr"].indexOf(message.author.id) == 0){
						ba = b;
					}
				});

				try{

					if(ba == null || ba == undefined){
						message.channel.sendMessage("You didn't send this battle request, "+message.author.username);
					}else{

						if(!ba.active){
							if(delete battles[ba]){
								delete battles[ba];
								message.channel.sendMessage("Canceled request to battle "+bot.users.find("id", ba["usr"][1]).username+"!");
								saveBattles(bot, message);
								return;
							}else{
								message.channel.sendMessage("Something went wrong");
								return;
							}
						}else{
							message.channel.sendMessage("You can't cancel an active battle, "+message.author.username+"!");
						}
					}

				}catch(e){
					message.channel.sendMessage("```js\n"+e.stack+"```");
					return;
				}

			}else{
				message.channel.sendMessage(message.author.id+"! You never challenged anyone!");
				return;
			}
		},
		"desc": "Cancel a battle request.",
		"usage": "bcancel",
		"cooldown": 10,
		"cmsg": 5
	},
	//Battle Refuse Command
	"brefuse":{
		process: function(args, message, bot){
			if(users.hasOwnProperty(message.author.id)){

				Object.keys(battles).map((a) => {
					var b = battles[a];
					if(b["usr"].indexOf(message.author.id) == 1 && !b["active"]){
						try{
							if(delete battles[a]){
								delete battles[a];
								message.channel.sendMessage("<@"+b["usr"][0]+">! "+message.author.username+" Declined your battle request!");
								saveBattles(bot, message);
								return;
							}else{
								message.channel.sendMessage("Something went wrong");
								return;
							}

						}catch(e){
							message.channel.sendMessage("```js\n"+e+"```");
							return;
						}
					}
				});

			}else{
				message.channel.sendMessage(message.author.username+"! Nobody challenged you!");
				return;
			}
		},
		"desc": "Decline a battle request.",
		"usage": "brefuse",
		"cooldown": 10,
		"cmsg": 5
	},
	//Battle Fight Command
	"bfight":{
		process: function(args, message, bot){
			if(users.hasOwnProperty(message.author.id)){
				Object.keys(battles).map((a) => {
					var b = battles[a];
					if(b["usr"].indexOf(message.author.id) > -1){
						battle(args, message, bot, b, a);
						return;
					}
				});
			}else{
				message.channel.sendMessage(message.author.username+"! You're not fighting anybody!");
				return;
			}
		},
		"desc": "Fights in a battle.",
		"usage": "bfight",
		"cooldown": 5,
		"cmsg": 2
	},
	//Battle Draw Command
	"bdraw":{
		process: function(args, message, bot){
			if(users.hasOwnProperty(message.author.id)){

				var msg = "";
				let found = false;


				Object.keys(battles).map((a) => {
					var b = battles[a];
					if(b["usr"].indexOf(message.author.id) > -1){
						if(!found){
							battles[a]["draw"] = false;
							battles[a]["drawf"] = message.author.id;
							

							if(b["usr"].indexOf(message.author.id) == 0){
								msg+= "<@"+b["usr"][1]+">";
							}else{
								msg+= "<@"+b["usr"][0]+">";
							}
							//TODO: Prefix
							msg+= "! "+message.author.username+" wants to end the battle in a draw! Type ``"+settings['prefix']['main']+"bdaccept`` to accept!";
							found = true;
						}
					}
				});

				message.channel.sendMessage(msg);
				saveBattles(bot, message);

			}else{
				message.channel.sendMessage(message.author.username+"! You're not in a battle!");
				return;
			}
		},
		"desc": "Requests a draw in a battle",
		"usage": "bdraw",
		"cooldown": 5,
		"cmsg": 2
	},
	//Battle Draw Accept Command
	"bdaccept":{
		process: function(args, message, bot){
			if(users.hasOwnProperty(message.author.id)){
				var found = false;
				let msg = "";
				Object.keys(battles).map((a, b) => {
					if(!found){
						let b = battles[a];
						if(b["drawf"] != message.author.id){
							if(b["draw"] != undefined){
								if(!b["draw"]){
									b["draw"] = true;
									try{
										delete battles[a];
										if(!found){
											found = true;
											msg = "<@"+b["drawf"]+">! "+message.author.username+" Accepted your draw request and the battle has ended.";
											found = true;
										}
									}catch(e){
										message.channel.sendMessage("```js\n"+e+"```");
										return;
									}
								}else{
									return;
								}
							}else{
								if(!found && b == Object.keys(battles).length-1){
									msg = "There's no request to end the battle in a draw, {}.".format(message.author.username);
									found = true;
								}
							}
						}
					}
				});

				message.channel.sendMessage(msg);
				saveBattles(bot, message);

			}else{
				message.channel.sendMessage(message.author.id+"! You're not in a battle!");
				return;
			}
		},
		"desc": "Accepts a draw request",
		"usage": "bdaccept",
		"cooldown": 5,
		"cmsg": 2
	},
	//Donate Command
	"donate":{
		process: function(args, message, bot){
			try{
				if(args.length >= 3){
					if(message.mentions.users.size >= 1){
						var to = message.mentions.users.array()[0].id;
						if(users.hasOwnProperty(to)){

							var amt = 0;

							/*var matches = message.content.match(/\d+$/);

							if(matches){
								amt = Number(matches[0]);
							}*/

							amt = message.content.getSI();

							if(users[message.author.id]["gold"] >= Number(amt)){
								if(Math.floor(amt) >= 1){
									users[to]["gold"]+= Math.floor(Number(amt));
									users[message.author.id]["gold"]-= Math.floor(amt);
									message.channel.sendMessage(message.author.username+" donated "+Math.floor(Number(amt)).formatNumber()+" gold to "+bot.users.find("id", to).username);
									
									checkAchievements(bot, message);

									saveUsers(bot, message);
								}else{
									message.channel.sendMessage(message.author.username+" tried to donate an invalid amount of gold.");
								}
							}else{
								message.channel.sendMessage("<@"+message.author.id+"> You dont have that much to donate to another person!");
							}
						}else{
							message.channel.sendMessage("<@"+message.author.id+"> That person hasn't started their adventure, or aren't real!");
						}
					}
				}
			}catch(e){
				message.channel.sendMessage("```js\n"+e.stack+"```");
				return;
			}
		},
		"desc": "Donates gold to a user",
		"usage": "donate ``user`` ``amount``",
		"cooldown": 5,
		"cmsg": 2
	}, 
	//Guild Create Command
	"gcreate":{
		process: function(args, message, bot){
			try{
				if(args.length >= 2){

					if(users[message.author.id]["guild"] == undefined){
						users[message.author.id]["guild"] = "";
					}

					if(users[message.author.id]["guild"].length == 0){

						if(users[message.author.id]["level"] < 5){
							message.channel.sendMessage("Sorry, "+message.author.username+", but you need to be atleast level 5 to create a guild.");
							return;
						}

						var name = args.splice(1, args.length).join(" ");
						if(name.length > 0){
							var found = false;

							// Removed Loop ~Snazzah
							if(gNameBlacklist.indexOf(name.toLowerCase()) > -1){
								message.channel.sendMessage("Sorry, "+message.author.username+", but that guild name is blacklisted.");
								found = true;
								return;
							}

							Object.keys(guilds).map((a) => {
								if(a !== undefined && a !== null){
									if(name.toLowerCase() == guilds[a]["name"].toLowerCase()){
										message.channel.sendMessage("Sorry, "+ message.author.username+", but a guild with that name already exists!");
										found = true;
										return;
									}
								}
							});

							if(!found){

								createGuild(message.author.id, name, bot);

								var guild = guilds[users[message.author.id]["guild"]];

								if(guild["desc"] == undefined){
									guilds[users[message.author.id]["guild"]]["desc"] = "";
								}

								

								var msg = "A Guild has been assembled by "+message.author.username+"!\n";
								var head = "** "+fix.decodeHTML(guild["icon"])+" "+guild["name"]+"**";
								msg+= head+"\n```tex\n";

								if(guilds[users[message.author.id]["guild"]]["desc"].length > 0){
									msg += "% "+guilds[users[message.author.id]["guild"]]["desc"]+"\n";
								}

								msg+= "# Owner: "+bot.users.find("id", guild["owner"]).username+"\n";
								msg+= "# 1 member and 0 elders.";
								msg+= "\n# No requirement.";
								msg+= "\n# Guild is Open";
								msg+= "\n# Funds: "+guild["gold"]+" Gold";
								msg+= "\n# Collective Guild Level: "+getGuildLevel(users[message.author.id]["guild"])+"\n```";



								message.channel.sendMessage(msg);
							}
							return;
						}else{
							message.channel.sendMessage(message.author.username+"! Your guild name can't be empty.");
							return;
						}
					}else{
						message.channel.sendMessage(message.author.username+"! You're already in a guild.");
						return;
					}
				}else{
					message.channel.sendMessage(message.author.username+"! Your guild name can't be empty.");
					return;
				}
			}catch(e){
				message.channel.sendMessage("```js\n"+e.stack+"```");
			}
		},
		"desc": "Creates a guild",
		"usage": "gcreate ``name``",
		"cooldown": 10,
		"cmsg": 5
	},
	//Guild Set Command
	"gset":{
		process: function(args, message, bot){
			try{

				if(users[message.author.id]["guild"] == undefined){
					users[message.author.id]["guild"] = "";
				}

				if(users[message.author.id]["guild"].length > 0){
					if(args.length >= 3){
						var guild = guilds[users[message.author.id]["guild"]];
						if(guild["owner"] == message.author.id){
							var item = args[1];
							var value = args.splice(2, args.length).join(" ");

							switch(item.toLowerCase()){
								case "icon":

									var i = [];

									gicons.map((a) => {
										i.push(a);
									});

									if(guild["icons"] == undefined){
										guild["icons"] = [];
									}

									guild["icons"].map((a) => {i.push(a);});

									if(i.indexOf(fix.encodeHTML(value)) > -1){
										guild["icon"] = fix.encodeHTML(value);
										message.channel.sendMessage(message.author.username+" changed their guild's icon!");
									}else{
										message.channel.sendMessage(message.author.username+"! That icon isn't valid.");
									}
									saveGuilds();
									break;
								case "open":
									if(value == "true" || value == "yes" || value == "open"){
										guild["open"] = true;
										message.channel.sendMessage(message.author.username+" made their guild open to all players!");
									}else if(value == "false" || value == "no" || value == "invite-only"){
										guild["open"] = false;
										message.channel.sendMessage(message.author.username+" made their guild invite-only!");
									}
									saveGuilds();
									break;
								case "description":
								case "desc":
									if(guild["desc"] == undefined){
										guilds[users[message.author.id]["guild"]]["desc"] = "";
									}
									
									guilds[users[message.author.id]["guild"]]["desc"] = value.replace(/@/g, '@\u200b');
									message.channel.sendMessage(message.author.username+" changed their guild description.");
									saveGuilds();
									break;
								case "levelreq":
									if(isNaN(Number(value))){
										message.channel.sendMessage(message.author.username+", That value is not a number.");
									}else{
										guilds[users[message.author.id]["guild"]].levelreq = Number(value);
										message.channel.sendMessage(message.author.username+" changed their guild level requirement.");
										saveGuilds();
									}
									break;
								 case "name":

									if(guild["items"] == undefined){
										guild["items"] = [];
									}

									if(!guild.hasOwnProperty("inv")){
										guild["inv"] = {};
									}

									if(guild["items"] != undefined){

										guild["items"].map((a) => {
											guild["items"].splice(guild["items"].indexOf(a), 1);
											var search = a;
											var count = guild["items"].reduce(function(n, val){
												return n+(val === search);
											}, 0);

											if(!guild["inv"].hasOwnProperty(a)){
												guild["inv"][a] = count;
											}
										});

									}

									var msg = "";
									if(guild["inv"].hasOwnProperty("1") > -1){
										if(value.length > 0){
											var found = false;

											gNameBlacklist.map((a) => { // TODO: Remove loop
												if(a.toLowerCase() == value.toLowerCase()){
													message.channel.sendMessage("Sorry, "+message.author.username+", but that guild name is blacklisted.");
													found = true;
													return;
												}
											});

											if(!found){

												Object.keys(guilds).map((a) => {
													if(guilds[a]["name"].toLowerCase() == value.toLowerCase()){
														message.channel.sendMessage("Sorry, "+ message.author.username+", but a guild with that name already exists!");
														found = true;
														return;
													}
												});
											}

											if(!found){

												if(guild["inv"]["1"] == 1){
													delete guild["inv"]["1"];
												}else{
													guild["inv"]["1"]--;
												}
												guild["name"] = value;
												msg = message.author.username+" used a guild tag and changed the guild name to "+value+"!";

												if(guild["role"] == undefined){
													guild["role"] = "";
												}

												if(guild["role"].length > 0){

													if(message.channel.type === "text"){

														var col = "";

														/*message.guild.roles.map((a) => {
															if(a["id"] == guild["role"]){
																col = a["color"];
															}
														});*/

														if(message.guild.roles.exists("id", guild.role)){
															message.guild.roles.find("id", guild.role).setName(guild.name).then((role) => {
																guild.role = role.id;
															});
														}

														saveGuilds();
														return;


														/*bot.updateRole(guild["role"], {
															position: [1],
															permissions: [0],
															name: guild["name"],
															hoist: true,
															color: col
														}, function(err, role){

															if(err){ message.channel.sendMessage("Whoops. An error occured. Please report it in the Official Server.\n```js\n"+err.stack+"```"); return;}

															for(let member in guild.members){
																if(!message.channel.isPrivate){
																	if(message.guild.roles.has("id", role.id)){
																		if(!bot.memberHasRole(message.author.id, role)){
																			bot.addMemberToRole(message.author.id, role);
																		}
																	}
																}
															}

															guild["role"] = role.id;

															saveGuilds();
															saveUsers(bot, message);
															return;
														});*/
													}
												}
											}
										}else{
											msg = message.author.username+" tried to change their guild name, but does not have a "+gitems["1"].name+" item";
										}
										
									}else{
										msg = message.author.username+"! Your guild name can't be empty.";
									}
									message.channel.sendMessage(msg);
									saveGuilds();
									break;
								case "color":
								case "colour":
									if(message.guild.id == "172382467385196544"){
										 var isOk  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value);

										 if(guild["role"] == undefined){
											guild["role"] = "";
										 }

										 if(guild["role"].length > 0){
											if(!isOk){
												message.channel.sendMessage(message.author.username+", please enter a valid HEX color.");
											}else{

												message.guild.roles.find("id", guild.role).setColor(parseInt("0x"+value.replace(/#/gmi, ""), 16)).then((role) => {
													message.channel.sendMessage("Changed color of guild role to {}.".format(value));

													guild["role"] = role.id;

													saveGuilds();
													saveUsers(bot, message);
													return;

												});												
													
											}
										 }else{
											message.channel.sendMessage(message.author.username+", you don't have a dedicated role.");
										 }
									 }else{
										message.channel.sendMessage(message.author.username+", this variable can only be set on the official server.");
									 }
									 break;
								case "tag":
									if(value.actualLength() > 4){
										message.channel.sendMessage("Sorry, "+message.author.username+", but a guild sign can be a maximum of four characters.");
										return;                           
									}
									if(guild["tag"] == undefined){
										guild["tag"] = "";
									}
									if(guild["inv"].hasOwnProperty("7")){
										if(guild["inv"]["7"]-1 <= 0){
											delete guild["inv"]["7"];
										}else{
											guild["inv"]["7"]--;
										}
										var hadtag = "";
										var lasttag = "";
										if(guild["tag"] != ""){
											var hadtag = true;
											lasttag = guild["tag"];
										}else{
											var hadtag = false;
										}

										var done = false;

										guild["tag"] = value;

										/*guild["members"].map((a) => { // TODO: Rewrite
											var nick = message.guild.detailsOfUser(a).nick;
											var name = bot.users.get("id", a).name;
											if(hadtag){
												if(nick == null){
													nick = "["+guild["tag"]+"] "+name;
												}else{
													if(nick.replace("["+lasttag+"]", "["+guild["tag"]+"]")==nick){
														nick = "["+guild["tag"]+"] "+nick;
													}else{
														nick = nick.replace("["+lasttag+"]", "["+guild["tag"]+"]")
													}
												}
											}else{
												if(nick == null){
													nick = "["+guild["tag"]+"] "+name;
												}else{
													nick = "["+guild["tag"]+"] "+nick;
												}
											}
											bot.setNickname(message.guild, nick, bot.users.get("id", a));
										});*/
										message.channel.sendMessage("Guild tag set to ["+guild["tag"]+"]");
									}else{
										message.channel.sendMessage("Sorry, "+message.author.username+", but your guild doesn't have a "+gitems["7"].name+" item.");
										return;
									}

									break;
								default:
									message.channel.sendMessage(message.author.username+"! That variable isn't valid.");
									break;
							}

						}else{

							if(guild["elder"].indexOf(message.author.id) > -1){
								var item = args[1];
								var value = args.splice(2, args.length).join(" ");

								switch(item.toLowerCase()){
									case "description":
									case "desc":
	
										if(guild["desc"] == undefined){
											guilds[users[message.author.id]["guild"]]["desc"] = "";
										}
										
										guilds[users[message.author.id]["guild"]]["desc"] = value;
										message.channel.sendMessage(message.author.username+" changed their guild description.");
										saveGuilds();
										break;
								}
								return;
							}

							message.channel.sendMessage(message.author.username+"! Only the guild owner can change variables.");
						}
					}else{
						message.channel.sendMessage(message.author.username+"! You need to specify what to change!");
					}
				}else{
					message.channel.sendMessage(message.author.username+"! You're not in a guild!");
				}
			}catch(e){
				message.channel.sendMessage("```js\n"+e.stack+"```");
			}
		},
		"desc": "Change your guild.",
		"usage": "gset ``variable`` ``value``\nPossible variables: ``Color``, ``Name``, ``Icon``, ``Open``, ``Description``, ``Tag``, ``Levelreq``",
		"cooldown": 5,
		"cmsg": 2
	},
	//Guild Command
	"guild":{
		process: function(args, message, bot){
			try{


				if(users[message.author.id]["guild"] == undefined){
					users[message.author.id]["guild"] = "";
				}

				var guild = users[message.author.id]["guild"];

				if(args.length >= 2){
					var value = args.splice(1, args.length).join(" ").toLowerCase();

					Object.keys(guilds).map((a) => {
						if(guilds[a]["name"].toLowerCase() == value){
							guild = a;
						}
					});
				}

				if(guild.length > 0){

					var gid = guild;
					var guild = guilds[guild];


					if(guild == undefined){
						message.channel.sendMessage(message.author.username+", You're in a non-existant guild.");
						return;
					}

					if(guild["role"] == undefined){
						guild["role"] = "";
					}

					var msg = "";
					var head = "** "+fix.decodeHTML(guild["icon"])+" "+guild["name"]+"**";
					msg+= head+"\n```tex\n";

					if(guild["desc"] == undefined){
						guilds[users[message.author.id]["guild"]]["desc"] = "";
					}

					if(guild["desc"].length > 0){
						msg += "% "+guild["desc"]+"\n";
					}

					msg+= "# Owner: "+bot.users.find("id", guild["owner"]).username+"\n";


					var membs =(guild["members"].length - 1) - guild["elder"].length;
					msg+= "# "+membs;

					if(membs > 1){
						msg+= " members";
					}else{
						msg+= " member";
					}

					msg+= " and "+guild["elder"].length+" elder";
					if(guild["elder"].length > 1 || guild["elder"].length == 0){
						msg+= "s";
					}

					if(guild["max"] == undefined){
						guild["max"] = 50;
					}

					msg += " ("+guild["members"].length+"/"+guild["max"]+" total)";

					if(guild["open"]){
						msg+= ".\n# Guild is Open";
					}else{
						msg+= ".\n# Guild is Invite Only.";
					}

					if(guild.levelreq <= 0){
						msg+= ".\n# No requirement.";
					}else{
						msg+= ".\n# Level Requirement: "+guild.levelreq;
					}

					if(guild["items"] == undefined){
						guild["items"] = [];
					}

					if(!guild.hasOwnProperty("inv")){
						guild["inv"] = {};
					}

					if(guild["items"] != undefined){

						guild["items"].map((a) => {
							guild["items"].splice(guild["items"].indexOf(a), 1);
							var search = a;
							var count = guild["items"].reduce(function(n, val){
								return n+(val === search);
							}, 0);

							if(!guild["inv"].hasOwnProperty(a)){
								guild["inv"][a] = count;
							}
						});
					}
					
					var itms = [];

					Object.keys(guild["inv"]).map((a) => {
						if(guild["inv"][a] <= 0){
							delete guild["inv"][a];
						}else{

							if(guild["inv"][a] > 1){
								var ps = guild["inv"][a].formatNumber()+" x "+(gitems[a].plural || gitems[a].name);
							}else{
								var ps = guild["inv"][a]+" x "+gitems[a]["name"];
							}

							if(itms.indexOf(ps) == -1){
								itms.push(ps);
							}
						}
					});

					msg += "\n# Items: ["+itms.sort().join(", ")+"]";

					if(typeof guild["gold"] != typeof 1){
						guild["gold"] = Number(guild["gold"]);
					}

					msg+= "\n# Funds: "+formatNumber(guild["gold"])+" Gold";
					msg+= "\n# Collective Guild Level: "+getGuildLevel(gid)+"\n```";

					guild["level"] = Math.round(getGuildLevel(gid));

					message.channel.sendMessage(msg);

					saveGuilds();

				}else{
					message.channel.sendMessage(message.author.username+"! You're not in a guild!");
				}

			}catch(e){
				message.channel.sendMessage("```js\n"+e.stack+"```");
			}
		},
		"desc": "Shows information about a guild",
		"usage": "guild",
		"cooldown": 10,
		"cmsg": 5
	},
	//Guild Info Command
		"ginfo":{
			process: function(args, message, bot) {
				try {
					if(args.length >= 2){
						var name = args.splice(1, args.length).join(" ");

						if(users[message.author.id]["guild"] == undefined){
							users[message.author.id]["guild"] = "";
						}
						var guildObj = [];


						Object.keys(guilds).map((a) => {
							guildObj.push(guilds[a]["name"]);
						});

						var results = filter.filter(guildObj, name.toLowerCase());
						var found = false;

						Object.keys(guilds).map((a) => {
							if(name.toLowerCase() == guilds[a]["name"].toLowerCase()){
								found = true;
								var guild = guilds[a];
								var gid = a;
								var msg = "";
								var head = "** "+fix.decodeHTML(guild["icon"])+" "+guild["name"]+"**";
								msg+= head+"\n```tex\n";

								if(guild["desc"] == undefined){
									guilds[users[message.author.id]["guild"]]["desc"] = "";
								}

								if(guild["role"] == undefined){
									guild["role"] = "";
								}

								if(guild["desc"] == undefined){
									guild["desc"] = "";
								}

								if(guild["desc"].length > 0){
									msg += "% "+guild["desc"]+"\n";
								}

								if(bot.users.find("id", guild["owner"]) == undefined){
									msg += "# Owner: Undefined\n";
								}else{
									msg+= "# Owner: "+bot.users.find("id", guild["owner"]).username+"\n";
								}

								var membs =(guild["members"].length-1)-guild["elder"].length;
								msg+= "# "+membs;

								if(membs > 1){
									msg+= " members";
								}else{
									msg+= " member";
								}

								msg+= " and "+guild["elder"].length+" elder";
								if(guild["elder"].length > 1 || guild["elder"].length == 0){
									msg+= "s";
								}

								if(guild["max"] == undefined){
									guild["max"] = 50;
								}

								msg += " ("+guild["members"].length+"/"+guild["max"]+" total)";

								if(guild["open"]){
									msg+= ".\n# Guild is Open";
								}else{
									msg+=".\n# Guild is Invite Only.";
								}

								if(guild.levelreq <= 0){
									msg+= ".\n# No requirement.";
								}else{
									msg+= ".\n# Level Requirement: "+guild.levelreq;
								}

								var itms = [];

								if(guild["items"] == undefined){
									guild["items"] = [];
								}

								if(!guild.hasOwnProperty("inv")){
									guild["inv"] = {};
								}

								if(guild["items"] != undefined){

									guild["items"].map((a) => {
										guild["items"].splice(guild["items"].indexOf(a), 1);
										var search = a;
										var count = guild["items"].reduce(function(n, val){
											return n+(val === search);
										}, 0);

										if(!guild["inv"].hasOwnProperty(a)){
											guild["inv"][a] = count;
										}
									});
								}

								Object.keys(guild["inv"]).map((a) => {
									if(guild["inv"][a] <= 0){
										delete guild["inv"][a];
									}else{

										if(guild["inv"][a] > 1){

											var ps = guild["inv"][a].formatNumber()+" x "+(gitems[a].plural || gitems[a].name);

										}else{
											var ps = guild["inv"][a]+" x "+gitems[a]["name"];
										}
										
										if(itms.indexOf(ps) == -1){
											itms.push(ps);
										}
									}
								});

								msg += "\n# Items: ["+itms.sort().join(", ")+"]";

								msg+= "\n# Funds: "+formatNumber(guild["gold"])+" Gold";
								msg+= "\n# Collective Guild Level: "+getGuildLevel(gid)+"\n```";

								message.channel.sendMessage(msg);
								return;
							}
						});
						
						if(found == 0){
							if(results.length <= 0){
								message.channel.sendMessage("<@"+message.author.id+">! There is no guild by the name of "+name+"!");
							}else{
								var guildsFound = [];
								var msg = "";
								msg+= "Found "+results.length+" guilds.\n";

								results.map((a) => {
									guildsFound.push(a);
								});
								msg+= guildsFound.sort().join(", ");
								message.channel.sendMessage(msg);
								return;
							}
						}
					}
				}catch(e){
					message.channel.sendMessage("```js\n"+e.stack+"```");
				}
				
			},
			"desc": "Displays a guild's information",
			"usage": "ginfo ``guild``",
			"cooldown": 10,
			"cmsg": 5
			},
	//Guild Invite Command
	"ginvite":{
		process: function(args, message, bot){
			if(args.length >= 2 && message.mentions.users.size >= 1){
				var to = message.mentions.users.array()[0];

				if(users[message.author.id]["guild"] == undefined){
					users[message.author.id]["guild"] = "";
				}

				if(users[to.id] == undefined){
					message.channel.sendMessage(message.author.username+", "+to.username+" hasn't begun their adventure.");
					return;
				}

				if(users[message.author.id]["guild"].length > 0){
					var guild = guilds[users[message.author.id]["guild"]];
					if(guild == undefined){
						return;
					}
					if(guild["owner"] == message.author.id || guild["elder"].indexOf(message.author.id) > -1){

						if(users[to.id]["guild"] == undefined){
							users[to.id]["guild"] = "";
						}

						if(guild["max"] == undefined){
							guild["max"] = 50;
						}

						if(guild["members"].length >= guild["max"]){
							message.channel.sendMessage("Guild is at max members.");
							return;
						}

						if(users[to.id]["guild"].length == 0){
							guild["invites"].push(to.id);

							var prefix = settings["prefix"]["main"];

							if(message.channel.type === "text"){
								if(servers.hasOwnProperty(message.guild.id)){
									prefix = servers[message.guild.id]["prefix"];
								}
							}
							message.channel.sendMessage(message.author.username+" invited "+to.username+" to their guild "+guild["name"]+"!\nType ``"+prefix+"gjoin "+guild["name"]+"`` to join.");
						}else{
							message.channel.sendMessage(message.author.username+", "+bot.users.find("id", to.id).username+" is already in a guild!");
						}
					}else{
						message.channel.sendMessage(message.author.username+ "! That person is already in your guild!");
					}
				}else{
					message.channel.sendMessage(message.author.username+"! You're not in a guild!");
				}
			}
		},
		"desc": "Invites a user to a guild",
		"usage": "ginvite ``@user``",
		"cooldown": 10,
		"cmsg": 5
	},
	//Guild Join Command
	"gjoin":{
		process: function(args, message, bot){
			if(args.length >= 2){
				if(!users.hasOwnProperty(message.author.id)){
					message.channel.sendMessage(message.author.username+", please start your adventure first!");
					return;
				}
				var name = args.splice(1, args.length).join(" ");

				if(users[message.author.id]["guild"] == undefined){
					users[message.author.id]["guild"] = "";
				}

				if(users[message.author.id]["guild"].length > 0){
					message.channel.sendMessage(message.author.username+"! You're already in a guild!");
				}else{

					var guildObj = [];

					Object.keys(guilds).map((a) => {
						guildObj.push(guilds[a]["name"]);
					});

					var results = filter.filter(guildObj, name.toLowerCase());


					// TODO: Rewrite to es6


					var found = false;

					Object.keys(guilds).map((a) => {
						if(name.toLowerCase() == guilds[a]["name"].toLowerCase()){
							var guild = guilds[a];
							if(!guild["open"]){
								if(guild["invites"].indexOf(message.author.id) > -1){
									
									guild.members.push(message.author.id);
									users[message.author.id].guild = a;
									guild["invites"].splice(guild["invites"].indexOf(message.author.id), 1);
									void 0==guild.max&&(guild.max=50),void 0==guild.role&&(guild.role="");
									if(guild["role"].length > 0){


										if(message.channel.type === "text"){
											if(message.guilds.roles.exists("id", guild["role"])){

												guild["members"].map((b) => {
													if(guild.role != ""){
														if(!message.guild.members.find("id", b).roles.exists("id", guild.role)){
															message.guild.members.find("id", b).addRoles(guild.role);
														}
													}
												});
											}
										}
									}
									message.channel.sendMessage(message.author.username+" joined a guild!");
									found = true;
									saveGuilds();
									saveUsers(bot, message);
									return;
								}else{
									message.channel.sendMessage("Sorry, "+message.author.username+", but this guild is invite-only.");
									found = true;
									return;
								}
							}else{
								void 0==guild.max&&(guild.max=50),void 0==guild.role&&(guild.role="");
								if(guild["members"].length >= guild["max"]){
									message.channel.sendMessage("Sorry, "+message.author.username+", but this guild is full.");
									found = true;
									return;
								}else if(guild.levelreq >= users[message.author.id].level && guild["invites"].indexOf(message.author.id) < 0){
									message.channel.sendMessage("Sorry, "+message.author.username+", but the guild level requirement ("+guild.levelreq+") is too high for you.");
									found = true;
									return;
								}

								guild.members.push(message.author.id);
								users[message.author.id]["guild"] = a;
								

								if(message.channel.type === "text"){
									if(guild.role != ""){
										if(message.guilds.roles.exists("id", guild["role"])){

											guild["members"].map((b) => {
												if(guild.role != ""){
													if(!message.guild.members.find("id", b).roles.exists("id", guild.role)){
														message.guild.members.find("id", b).addRoles(guild.role);
													}
												}
											});
										}
									}
								}

								message.channel.sendMessage(message.author.username+" joined a guild!");
								found = true;
								saveGuilds();
								saveUsers(bot, message);
								
								return;

							}
						}
					});

					if(results.length > 0 && !found){
						var guildsFound = [];
						var msg = "";
						msg+= "Found "+results.length+" guilds.\n";

						results.map((d) => {
							guildsFound.push("``"+d["name"]+"``");
						});
						msg+= guildsFound.sort().join(", ");
						message.channel.sendMessage(msg);
						return;
					}
				}
			}
		},
		"desc": "Joins a guild",
		"usage": "gjoin ``guild``",
		"cooldown": 10,
		"cmsg": 5
	},
	//Guild Leave Command
	"gleave":{
		process: function(args, message, bot){
			if(users[message.author.id]["guild"] == undefined){
				users[message.author.id]["guild"] = "";
			}

			if(users[message.author.id]["guild"].length > 0){

				var guild = guilds[users[message.author.id]["guild"]];

				if(guild == undefined){
					message.channel.sendMessage(message.author.username+" left their guild.");
					users[message.author.id]["guild"] = "";
					saveUsers(bot, message);
					return;
				}

				if(guild["owner"] == message.author.id){

					if(guild["channel"] == undefined){
						guild["channel"] = "";
					}

					if(guild["role"] == undefined){
						guild["role"] = "";
					}

					message.channel.sendMessage(message.author.username+" disbanded their guild!");
					
					if(message.channel.type === "text"){
						if(guild["role"].length > 0){
							if(message.guild.roles.exists("id", guild["role"])){
								message.guild.roles.find("id", guild.role).delete();
							}
						}
				
						if(message.guild.id == "172382467385196544"){
							if(guild["channel"].length > 0){
								if(message.guild.channels.exists("id", guild.channel)){
									message.guild.channels.find("id", guild.channel).delete();
								}
							}
						}
					}

					var gId = users[message.author.id]["guild"];

					guild["members"].map((a) => {
						users[a]["guild"] = "";
					});
					try{
						delete guilds[gId];
						saveUsers(bot, message);
						saveGuilds();
					}catch(e){
						message.channel.sendMessage("Whoops! An error occured! Please report it in the Official server! ```js\n"+e+"```");
					}

					

				}else{

					message.channel.sendMessage(message.author.username+" left their guild.");


					if(message.channel.type === "text"){
						if(guild["role"].length > 0){
							if(message.guild.roles.exists("id", guild["role"])){
								if(message.guild.members.find("id", message.author.id).roles.exists("id", guild.role)){
									message.guild.members.find("id", message.author.id).removeRole(guild.role);
								}
							}
						}
					}
					
					if(guild["elder"].indexOf(message.author.id) > -1){
						guilds[users[message.author.id]["guild"]]["elder"].splice(guild["elder"].indexOf(message.author.id), 1);
					}
					guilds[users[message.author.id]["guild"]]["members"].splice(guild["members"].indexOf(message.author.id), 1);
					users[message.author.id]["guild"] = "";
					saveGuilds();
					saveUsers(bot, message);

				}

				//message.channel.sendMessage("LOL! "+message.author.username+" YOU WANT TO LEAVE A GUILD?! TOUGH FUCKIN' LUCK LOVE, YA AINT.(yet)");
			}else{
				message.channel.sendMessage(message.author.username+"! You're not in a guild.");
			}
		},
		"desc": "Leaves a guild",
		"usage": "gleave",
		"cooldown": 10,
		"cmsg": 5
	},
	//Guild Disband Command
	"gdisband":{
		process: function(args, message, bot){
			if(users[message.author.id]["guild"] == undefined){
				users[message.author.id]["guild"] = "";
			}

			if(users[message.author.id]["guild"].length > 0){

				var guild = guilds[users[message.author.id]["guild"]];

				if(guild == undefined){
					users[message.author.id]["guild"] = "";
					saveUsers(bot, message);
					return;
				}

				if(guild["owner"] == message.author.id){

					message.channel.sendMessage(message.author.username+" disbanded their guild!");
					
					if(guild["role"] == undefined){
						guild["role"] = "";
					}
					if(guild["channel"] == undefined){
						guild["channel"] = "";
					}

					if(message.channel.type === "text"){
						if(message.guild.id == "172382467385196544"){

							if(guild["role"].length > 0){
								if(message.guild.roles.exists("id", guild["role"])){
									message.guild.roles.find("id", guild.role).delete();
								}
							}
							
							if(guild["channel"].length > 0){
								if(message.guild.channels.exists("id", guild["channel"])){
									message.guild.channels.find("id", guild.channel).delete();
								}
							}
						}
					}

					var gId = users[message.author.id]["guild"];

					guild["members"].map((a) => {
						users[a]["guild"] = "";
					});

					try{
						delete guilds[gId];
						saveUsers(bot, message);
						saveGuilds();
					}catch(e){
						message.channel.sendMessage("Whoops! An error occured! Please report it in the Official server! ```js\n"+e+"```");
					}

					

				}else{
					message.channel.sendMessage(message.author.username+"! You're not the guild owner.");
				}
			}else{
				message.channel.sendMessage(message.author.username+"! You're not in a guild.");
			}
		},
		"desc": "Disbands your guild",
		"usage": "gdisband",
		"cooldown": 10,
		"cmsg": 5
	},
	//Guild Members Command
	"gmembers":{
		process: function(args, message, bot){
			try{
				if(users[message.author.id]["guild"] == undefined){
					users[message.author.id]["guild"] = "";
				}

				var guild = users[message.author.id]["guild"];

				if(args.length >= 2){
					var value = args.splice(1, args.length).join(" ").toLowerCase();

					Object.keys(guilds).map((a) => {
						if(guilds[a]["name"].toLowerCase() == value){
							guild = a;
						}
					});
				}

				if(guild.length > 0){

					var as = [];

					guild = guilds[guild];


					if(guild["role"] == undefined){
						guild["role"] = "";
					}

					var msg = "";
					var head = "** "+fix.decodeHTML(guild["icon"])+" "+guild["name"]+"** members";
					msg+= head+"\n```diff\n";

					msg+= "! Owner \n-   "+bot.users.find("id", guild["owner"]).username+"\n";
					as.push(guild["owner"]);

					msg+= "! Elders\n";

					if(guild["elder"].length == 0){
						msg+= "%   None\n";
					}else{
						var el = [];

						if(guild["elder"].length >= 1){

							guild["elder"].map((a) => {
								var e = bot.users.find("id", a);
								if(e == null || e == undefined){
									el.push(a);
								}else{
									el.push(e.username);
								}
								as.push(a);
							});
						}
						el.sort();

						el.map((a) => {
							msg += "-   "+a+"\n";
						});
					}

					msg+= "! Members\n";

					var el = [];
					if(guild["members"].length == 0){
						msg+= "%   None\n";
					}else{
						var el = [];

						guild["members"].map((a) => {
							if(as.indexOf(a) == -1){
								var e = bot.users.find("id", a);
								if(e == null || e == undefined){
									el.push(a);
								}else{
									el.push(e.username);
								}
							}
						});

						el.sort();

						el.map((a) => {
							msg += "-   "+a+"\n";
						});
					}

					msg+= "```";
					message.channel.sendMessage(msg);

				}else{
					message.channel.sendMessage(message.author.username+"! You're not in a guild!");
				}

			}catch(e){
				message.channel.sendMessage("```js\n"+e.stack+"```");
			}
		},
		"desc": "Shows guild members",
		"usage": "gmembers",
		"cooldown": 10,
		"cmsg": 5
	},
	//Guild Role Command
	"grole":{
		process: function(args, message, bot){
			if(args.length >= 2 && args.length < 3){
				message.channel.sendMessage(message.author.username+", you need to specify a role!");
				return;
			}else if(args.length >= 3 && message.mentions.users.size >= 1){
				if(message.mentions.users.size < 1){
					message.channel.sendMessage(message.author.username+", you need to mention who's role to change.");
					return;
				}
				var to = message.mentions.users.array()[0];

				if(users[message.author.id]["guild"] == undefined){
					users[message.author.id]["guild"] = "";
				}


				if(users[message.author.id]["guild"].length > 0){
					var guild = guilds[users[message.author.id]["guild"]];

					if(guild["owner"] == message.author.id){
						if(guild["members"].indexOf(to.id) > -1){
							var role = args.splice(2, args.length).join(" ").toLowerCase();
							//message.channel.sendMessage("r: "+role);
							if(role == "member"){
								if(guild["elder"].indexOf(to.id) > -1){
									guilds[users[message.author.id]["guild"]]["elder"].splice(guild["elder"].indexOf(to.id),1);
									message.channel.sendMessage(message.author.username+" changed the role of "+to.username+" to "+helper.capFirst(role));
									saveGuilds();
									return;
								}else if(guild["owner"] == to.id){
									message.channel.sendMessage(message.author.username+", You can't remove your ownership.");
									return;
								}
							}else if(role == "elder"){
								if(to.id != guild["owner"]){
									if(guild["members"].indexOf(to.id) > -1){
										guilds[users[message.author.id]["guild"]]["elder"].push(to.id);

										message.channel.sendMessage(message.author.username+" changed the role of "+to.username+" to "+helper.capFirst(role));
										saveGuilds();
										return;
									}else if(guild["owner"] == to.id){
										message.channel.sendMessage(message.author.username+", You can't remove your ownership.");
										return;
									}
								}
							}else if(role == "owner"){
								if(guild["member"].indexOf(to.id) > -1){
									guilds[users[message.author.id]["guild"]]["owner"] = to.id;
									message.channel.sendMessage(message.author.username+" changed the role of "+to.username+" to "+helper.capFirst(role));
									saveGuilds();

									return;
								}else if(guild["elder"].indexOf(to.id) >-1){
									guilds[users[message.author.id]["guild"]]["elder"].splice(guild["elder"].indexOf(to.id),1);
									guilds[users[message.author.id]["guild"]]["owner"] = to.id;
									message.channel.sendMessage(message.author.username+" changed the role of "+to.username+" to "+helper.capFirst(role));
									saveGuilds();

									return;
								}
							}else{
								message.channel.sendMessage(message.author.username+" tried to change "+to.username+"'s role to a unknown role.");
							}
						}else{
							message.channel.sendMessage(message.author.username+", "+to.username+" isn't in your guild.");
						}
					}else{
						message.channel.sendMessage(message.author.username+", You can't change roles.");
					}
				}else{
					message.channel.sendMessage(message.author.username+"! You're not in a guild.");
				}

			}else{
				message.channel.sendMessage(message.author.username+", you need to specify whose role you want to change!");
			}
		},
		"desc": "Sets the role of a guild member.",
		"usage": "grole ``@user`` ``role``",
		"cooldown": 10,
		"cmsg": 5
	},
	//Guild Kick Command
	"gkick":{
		process: function(args, message, bot){
			if(args.length >= 2 && message.mentions.users.size >= 1){
				var to = message.mentions.users.array()[0];

				if(users[message.author.id]["guild"] == undefined){
					users[message.author.id]["guild"] = "";
				}


				if(users[message.author.id]["guild"].length > 0){
					var guild = guilds[users[message.author.id]["guild"]];

					if(guild["owner"] == message.author.id){
						if(guild["members"].indexOf(to.id) > -1){

							if(guild["elder"].indexOf(to.id) > -1){
								guilds[users[message.author.id]["guild"]]["elder"].splice(guild["elder"].indexOf(to.id), 1);
							}

							guilds[users[message.author.id]["guild"]]["members"].splice(guild["members"].indexOf(to.id), 1);

							message.channel.sendMessage(message.author.username+" kicked "+to.username+" from their guild.");
							if(guild["role"] != ""){
								if(message.guild.roles.exists("id", guild["role"])){
									if(!message.guild.members.find("id", to.id).roles.exists("id", guild.role)){
										message.guild.members.find("id", to.id).removeRole(guild.role);
									}
								}
							}
							

							if(guild["elder"].indexOf(message.author.id) > -1){
								guilds[users[message.author.id]["guild"]]["elder"].splice(guild["elder"].indexOf(to.id), 1);
							}
							//guilds[users[message.author.id]["guild"]]["members"].splice(guild["members"].indexOf(to.id), 1);
							users[to.id]["guild"] = "";
							saveGuilds();
							saveUsers(bot, message);

						}else{
							message.channel.sendMessage(message.author.username+", "+to.username+" isn't in your guild.");
						}
					}else{
						message.channel.sendMessage(message.author.username+", you can't kick members.");
					}
				}else{
					message.channel.sendMessage(message.author.username+", you're not in a guild!");
				}

			}else{
				message.channel.sendMessage(message.author.username+", you have to specify who to kick.");
			}
		},
		"desc": "Kick a user from a guild",
		"usage": "gkick ``@user``",
		"cooldown": 10,
		"cmsg": 5
	},
	"gexpand": {
		process: function(args, message, bot){
			if(users.hasOwnProperty(message.author.id)){
				var usr = users[message.author.id];
				if(usr["guild"] == undefined){
					usr["guild"] = "";
				}

				if(usr["guild"].length > 0){
					var guild = guilds[usr["guild"]];
					if(message.author.id == guild["owner"]){
						if(guild["items"].length > 0){
							guild["items"] = 0;
						}
						if(guild["inv"] == undefined){
							guild["inv"] = {};
						}
						if(guild["inv"].hasOwnProperty("5")){

							if(guild["inv"]["5"]-1 <= 0){
								delete guild["inv"]["5"];
							}else{
								guild["inv"]["5"]--;
							}
							guild["max"] += 10;
							message.channel.sendMessage(message.author.username+" expanded their guild by 10 slots.");
							saveGuilds(bot, message);
							return;
						}else{
							message.channel.sendMessage(message.author.username+", you need a Guild Slot Expansion item to expand your guild.");
						}
					}else{
						message.channel.sendMessage(message.author.username+", only the guild owner can use this.");
					}
				}else{
					message.channel.sendMessage(message.author.username+", You're not in a guild.");
				}
			}
		},
		"desc": "Uses a Guild Slot Expansion item.",
		"usage": "gexpand",
		"cooldown": 10,
		"cmsg": 5
	},
	//Add Icon Command
	"addicon":{
		process: function(args, message, bot){
			if(message.guild.id == "172382467385196544"){
				if(helper.checkRole(message, "Knight")){
					if(args.length >= 2){
						var icon = fix.encodeHTML(args.splice(1, args.length).join(" "));
						if(gicons.indexOf(icon) == -1){
							gicons.push(icon);
							client.set("gicons", JSON.stringify(gicons));
							message.channel.sendMessage(message.author.username+" added the icon "+fix.decodeHTML(icon));
						}else{
							message.channel.sendMessage("Icon exists, "+message.author.username);
						}
					}
				}
			}
		},
		"desc": "Adds a guild icon",
		"usage": "addicon ``icon``",
		"cooldown": 10,
		"unlisted": true
	},
	//Delete Icon Command
	"delicon":{
		process: function(args, message, bot){
			if(message.guild.id == "172382467385196544"){
				if(helper.checkRole(message, "Knight")){
					if(args.length >= 2){
						var icon = fix.encodeHTML(args.splice(1, args.length).join(" "));
						if(gicons.indexOf(icon) > -1){
							gicons.splice(gicons.indexOf(icon), 1);
							gicons.push(icon);
							client.set("gicons", JSON.stringify(gicons));
							message.channel.sendMessage(message.author.username+" removed the icon "+fix.decodeHTML(icon));
						}else{
							message.channel.sendMessage("Icon doesn't exist, "+message.author.username);
						}
					}
				}
			}
		},
		"desc": "Removes a guild icon",
		"usage": "delicon ``icon``",
		"cooldown": 10,
		"unlisted": true
	},
	"icons":{
		process: function(args, message, bot){
			message.channel.sendMessage(fix.decodeHTML(gicons.join(" "))+"\n```xl\nTotal Icons: "+gicons.length+"\n```");
		},
		"desc": "Shows a list of available guild icons.",
		"usage": "icons",
		"cooldown": 10,
		"cmsg": 5
	},
	"additem": {
		process: function(args, message, bot){
			if(message.guild.id == "172382467385196544"){
				if(helper.checkRole(message, "Knight")){
					if(args.length >= 2){
						var id = args.splice(1, args.length).join(" ");

						var link = "http://discorddungeons.me/admin/item/"+id+".json";

						request(link, function(error, response, body){
							if(!error && response.statusCode == 200){
								//message.channel.sendMessage(body);
								var iid = Object.keys(items).length+1;
								var b = JSON.parse(body);
								items[iid] = b;
								message.channel.sendMessage("Added item ``"+b["name"]+"``. ID: "+iid);
								saveItems();
							}else{
								message.channel.sendMessage("Error. Code "+response.statusCode);
							}
						});

					}
				}
			}
		},
		"desc": "Fetches an item by GUID and adds it.",
		"usage": "additem ``guid``",
		"cooldown": 10,
		"unlisted": true
	},
	"fetchmobs": {
		process: function(args, message, bot){
			if(message.guild.id == "172382467385196544"){
				if(helper.checkRole(message, "Knight")){
					var link = "http://discorddungeons.me/admin/mobs.json";

					request(link, function(error, response, body){
						if(!error && response.statusCode == 200){
							//message.channel.sendMessage(body);
							mobs = JSON.parse(body);
							message.channel.sendMessage("Added Mob.");
							saveMobs();
						}else{
							message.channel.sendMessage("Error. Code "+response.statusCode);
						}
					});
				}
			}
		},
		"desc": "Updates mobs from the site.",
		"usage": "fetchmobs",
		"cooldown": 10,
		"unlisted": true
	},
	"gbuy": {
		process: function(args, message, bot){
			try{
				if(users[message.author.id]["guild"] == undefined){
					users[message.author.id]["guild"] = "";
				}

				if(users[message.author.id]["guild"].length > 0){
					var guild = guilds[users[message.author.id]["guild"]];
					if(guild["elder"].indexOf(message.author.id) > -1 || guild["owner"] == message.author.id){
						var item = args.splice(1, args.length).join(" ").replace(/\s*$/,"");
						//message.channel.sendMessage("[DEBUG] "+item);
		 
						var found = false;

						if(item.split(" ")[0].toLowerCase() == "icon"){
							if(guild["gold"] >= 50){
								guild["gold"] -= 50;
								if(guild["icons"] == undefined){
									guild["icons"] = [];
								}

								var icon = item.split(" ").splice(1, item.split(" ").length).join(" ");
								guild["icons"].push(fix.encodeHTML(icon));
								message.channel.sendMessage(message.author.username+" bought the guild icon "+icon+" for 50 gold.");
								saveGuilds();
								found = true;
								return;
							}
						}

						var amt = 1;

						var matches = item.match(/\d+$/);

						if(matches){
							amt = Number(matches[0]);
							item = item.replace(/\d+$/, "").replace(/\s*$/,"");
						}

						var results = filter.filter(gitmObj, item.toLowerCase(), {key: "name"});

						Object.keys(gitems).map((a) => {
							if(item.toLowerCase() == gitems[a]["name"].toLowerCase()){
								buyGuild(a, message, bot, amt, guilds[users[message.author.id]["guild"]]);
								found = true;
								return;
							}
						});

						if(results.length > 0 && !found){
							var itmFound = [];
							var msg = "";
							msg += "Found "+results.length+" items.\n";

							results.map((a) => {
								itmFound.push("``"+a["name"]+"``");
							});
							msg += itmFound.sort().join(", ");
							message.channel.sendMessage(msg);
						}

						if(results.length <= 0 && !found){
							message.channel.sendMessage(message.author.username+" tried to buy an unknown guild item!");
							return;
						}
									
					}else{
						message.channel.sendMessage(message.author.username+"! Only the guild elders and guild owner can buy guild items.");
					}
				}else{
						message.channel.sendMessage(message.author.username+"! You're not in a guild!");
				}
			}catch(e){
					message.channel.sendMessage("```js\n"+e+"```");
			}
		},
		"desc": "Buy a guild item.",
		"usage": "gbuy ``item``",
		"cooldown": 5,
		"cmsg": 2
	},

	"gdep": {
		process: function(args, message, bot){
			try{
				if(args.length >= 2){

					var amt = 0;

					/*if(Number(args[1])){
						amt = Math.floor(Number(args[1]));
					}else*/
					if(args[1].toLowerCase() == "all"){
						if(users[message.author.id] != undefined){
							amt = users[message.author.id]["gold"];
						}
					}else{
						amt = message.content.getSI();
					}

					if(Number(amt)){



						var usr = users[message.author.id];

						if(usr["guild"] == undefined){
							usr["guild"] = "";
						}

						if(usr["guild"].length <= 0){
							message.channel.sendMessage(message.author.username+"! You're not in a guild.");
							return;
						}else{
							if(amt <= usr["gold"] && amt > 0){

								if(typeof guilds[usr["guild"]]["gold"] != typeof 1){
									guilds[usr["guild"]]["gold"] = Number(guilds[usr["guild"]]["gold"]);
								}

								usr["gold"] -= amt;
								guilds[usr["guild"]]["gold"] += Number(amt);
								message.channel.sendMessage(message.author.username+" deposited "+formatNumber(amt)+" gold into their guild.");
								saveGuilds();
								saveUsers(bot, message);
							}else{
								var msg = message.author.username+" tried to deposit "+formatNumber(amt)+" Gold into their guild, but ";
								if(usr["gold"] <= 0){
									msg += "has none.";
								}else{
									msg += "only has "+formatNumber(usr["gold"]);
								}
								
								message.channel.sendMessage(msg);
							}
						}

					}else{
						message.channel.sendMessage(message.author.username+" tried to deposit an invalid amount of gold into their guild.");
						return;
					}
				}
			}catch(e){
				message.channel.sendMessage("Whoops! An error occured! Please report it in the Official server! ```js\n"+e+"```");
			}
		},
		"desc": "Deposit gold into your guilds fund.",
		"usage": "gdep ``amount``",
		"cooldown": 5,
		"cmsg": 2
	},
	"addgitem": {
		process: function(args, message, bot){
			try{
				if(message.guild.id == "172382467385196544"){
					if(helper.checkRole(message, "Knight")){
						if(args.length >= 2){
							var id = args.splice(1, args.length).join(" ");

							var link = "https://discorddungeons.me/admin/item/"+id+".json";

							request(link, function(error, response, body){
								if(!error && response.statusCode == 200){
									//message.channel.sendMessage(body);
									var iid = Object.keys(gitems).length+1;
									var b = JSON.parse(body);
									gitems[iid] = b;
									message.channel.sendMessage("Added guild item ``"+b["name"]+"``. ID: "+iid);
									savegItems();
								}else{
									message.channel.sendMessage("Error. Code "+response.statusCode);
								}
							});

						}
					}
				}
			}catch(e){
				message.channel.sendMessage("Whoops! An error occured! Please report it in the Official server! ```js\n"+e.name + ': ' + e.message+" "+e.stack.split("\n")[4]+"```");
			}
		},
		"desc": "Fetches an item by GUID and adds it.",
		"usage": "addgitem ``guid``",
		"cooldown": 10,
		"unlisted": true
	},
	/*"ignore": {
		process: function(args, message, bot){
			try{
				if(message.guild.id == "172382467385196544"){
					if(helper.checkRole(message, "Knight")){
						var toI;
						if(args.length == 2){
							toI = args[1].replace(/<@/gmi, "").replace(/>/gmi, "");
						}

						if(ignored.indexOf(toI) > -1){
							ignored.splice(ignored.indexOf(toI), 1);
							client.set("ignored", JSON.stringify(ignored));
							message.channel.sendMessage("No longer ignoring <@"+toI+">");
						}else{
							ignored.push(toI);
							client.set("ignored", JSON.stringify(ignored));
							message.channel.sendMessage("Ignoring <@"+toI+">");
						}
					}
				}
			}catch(e){
				message.channel.sendMessage("Whoops! An error occured! Please report it in the Official server! ```js\n"+e.name + ': ' + e.message+" "+e.stack.split("\n")[4]+"```");
			}
		},
		"desc": "Ignores users",
		"usage": "ignore ``user``",
		"cooldown": 10,
		"unlisted": true
	},*/
	"reset": {
		process: function(args, message, bot){
			try{
				if(args.length >= 2){
					var yes = args.splice(1, args.length).join(" ");
					if(yes.toLowerCase() == "yes"){
						if(users.hasOwnProperty(message.author.id)){

							var g = "";
							var restat = false;

							if(adventures.hasOwnProperty(message.author.id)){
								delete adventures[message.author.id];
							}

							if(users[message.author.id]["guild"] == undefined){
								users[message.author.id]["guild"] = "";
							}else{
								g = users[message.author.id]["guild"];
							}

							delete users[message.author.id];
							create(message.author.id, message.author.username, bot);
							users[message.author.id]["guild"] = g;
							message.channel.sendMessage(message.author.username+" reset their character.");
							saveUsers(bot, message);
						}else{
							message.channel.sendMessage(message.author.username+" tried to reset their character but they haven't started their adventure.");
							return;
						}
					}
				}
			}catch(e){
				message.channel.sendMessage("Whoops! An error occured! Please report it in the Official server! ```js\n"+e.name + ': ' + e.message+" "+e.stack.split("\n")[4]+"```");
			}
		},
		"desc": "Resets your character.",
		"usage": "reset ``yes``",
		"cooldown": 10,
		"cmsg": 5
	},
	"gwd": {
		process: function(args, message, bot){
			try{
				if(args.length >= 2){
					var amt = 0;

					if(users[message.author.id] != undefined){
						var usr = users[message.author.id];
						if(usr["guild"] == undefined){
							usr["guild"] = "";
						}

						if(usr["guild"].length > 0){
							var guild = guilds[usr["guild"]];

							/*if(Number(args[1])){
								amt = Math.floor(Number(args[1]));
							}else*/
							if(args[1].toLowerCase() == "all"){
								amt = guild["gold"];
							}else{
								amt = message.content.getSI();
							}
						}
					}

					if(Number(amt)){
						if(users[message.author.id] != undefined){
							var usr = users[message.author.id];
							if(usr["guild"] == undefined){
								usr["guild"] = "";
							}

							if(usr["guild"].length > 0){
								var guild = guilds[usr["guild"]];

								if(guild["owner"] == message.author.id || guild["elder"].indexOf(message.author.id) > -1){
									if(amt >= 1){
										if(guild["gold"] >= amt){
											usr["gold"] += amt;
											guild["gold"] -= amt;

											message.channel.sendMessage(message.author.username+" withdrew "+formatNumber(amt)+" gold from their guild and the guild now has "+formatNumber(guild["gold"])+" gold.");
											
											checkAchievements(bot, message);

											saveGuilds();
											saveUsers(bot, message);
											return;

										}else{
											message.channel.sendMessage(message.author.username+" tried to withdraw "+formatNumber(amt)+" gold from their guild, but the guild only has "+formatNumber(guild["gold"])+" gold.");
										}
									}else{
										message.channel.sendMessage(message.author.username+" tried to withdraw an invalid amount of gold from their guild.");
									}
								}else{
									message.channel.sendMessage(message.author.username+", you can't withdraw from a guild.");
								}

							}else{
								message.channel.sendMessage(message.author.username+" tried to withdraw gold from a guild, but they're not in one.");
							}
						}
					}else{
						message.channel.sendMessage(message.author.username+" tried to withdraw a invalid amount of gold.");
					}
				}
			}catch(e){
				message.channel.sendMessage("Whoops! An error occured! Please report it in the Official server! ```js\n"+e.name + ': ' + e.message+" "+e.stack.split("\n")[4]+"```");
				return;
			}
		},
		"desc": "Withdraw gold from your guild.",
		"usage": "gwd ``amount``",
		"cooldown": 10,
		"cmsg": 5
	},
	"achievements": {
		process: function(args, message, bot){
			try{
				var user = message.author.id;
				if(users.hasOwnProperty(user)){
					if(!users[user].hasOwnProperty("achievements")){
						users[user]["achievements"] = [];
					}

					if(users[user]["achievements"].length > 0){
						var head = "!======== ["+message.author.username+"'s Achievements] ========!"

						var m = "```diff\n"+head+"\n";

						users[user]["achievements"].map((a) => {
							m += "+ "+achievements[a]["name"]+"\n";
						});

						m+= "!"+"=".repeat(head.length-2)+"!```\n";

						message.channel.sendMessage(m);
					}else{
						message.channel.sendMessage(message.author.username+", you have no achievements");
						return;
					}
				}
			}catch(e){
				message.channel.sendMessage("Whoops! An error occured! Please report it in the Official server! ```js\n"+e.name + ': ' + e.message+" "+e.stack.split("\n")[4]+"```");
				return;
			}
		},
		"desc": "Checks your achievements",
		"usage": "achievements",
		"cooldown": 10,
		"cmsg": 5
	},
	"achievement": {
		process: function(args, message, bot){
			try{
				if(args.length >= 2){
					var chieve = args.splice(1, args.length).join(" ").toLowerCase();

					Object.keys(achievements).map((a) => {
						if(achievements[a]["name"].toLowerCase() == chieve){
							var id = a;
							var msg = "```diff\n";

							var head = "! ======== ["+achievements[a]["name"]+"] ======== !";

							msg += head+"\n";
							msg += "% "+achievements[a]["desc"];

							msg+= "\n!"+"=".repeat(head.length-2)+"!```\n";

							message.channel.sendMessage(msg);
							return;
						}
					});
				}
			}catch(e){
				message.channel.sendMessage("Whoops! An error occured! Please report it in the Official server! ```js\n"+e.name + ': ' + e.message+" "+e.stack.split("\n")[4]+"```");
				return;
			}
		},
		"desc": "Shows info about an achievement",
		"usage": "achievement ``achievement``",
		"cooldown": 10,
		"cmsg": 5
	},
	"getrole": {
		process: function(args, message, bot){

			try{

				if(message.channel.type !== "text"){
					message.channel.sendMessage("Sorry, {}, but you can't do this in a private message.".format(message.author.username));
					return;
				}

				if(message.guild.id == "172382467385196544"){

					if(message.guild.permissionsFor(bot.user).hasPermission("MANAGE_ROLES_OR_PERMISSIONS")){

						if(users.hasOwnProperty(message.author.id)){

							user = users[message.author.id];

							if(user["guild"] == undefined){
								user["guild"] = "";
							}

							if(user["guild"].length > 0){


								var guild = guilds[user["guild"]];

								if(guild["role"] == undefined){
									guild["role"] = "";
								}

								if(guild["items"] == undefined){
									guild["items"] = [];
								}

								if(!guild.hasOwnProperty("inv")){
									guild["inv"] = {};
								}

								if(guild["items"] != undefined){

									guild["items"].map((a) => {
										guild["items"].splice(guild["items"].indexOf(a), 1);
										var search = a;
										var count = guild["items"].reduce(function(n, val){
											return n+(val === search);
										}, 0);

										if(!guild["inv"].hasOwnProperty(a)){
											guild["inv"][a] = count;
										}
									});

								}

								if(guild["owner"] == message.author.id){
									var col = Math.floor(Math.random()*16777215);

									if("4" in guild.inv){
										if(guild["inv"]["4"] == 1){
											delete guild["inv"]["4"];
										}else{
											guild["inv"]["4"]--;
										}

										message.guild.createRole().then((role) => {
											role.edit({
												name: guild.name,
												position: message.guild.roles.size-1,
												hoist: true,
												permissions: 0,
												color: col
											}).then((role) => {
												if(message.guild.roles.exists("id", role.id)){
													guild.role = role.id;
													guild.members.map((a) => {
														if(!message.guild.members.find("id", a).roles.exists("id", guild.role)){
															message.guild.members.find("id", a).addRoles(guild.role);
														}
													});

													message.channel.sendMessage("Added role to guild. Color: #"+col.toString(16));
													saveGuilds();
													return;
												}
											}, (err) => {
												message.channel.sendMessage("Whoops. An error occured. Please report it in the Official Server.\n```js\n"+err.stack+"```");
												return;
											});
										});

										/*bot.createRole(message.guild, {
											position: [5],
											permissions: [0],
											name: guild.name,
											hoist: true,
											color: col
										}, function(err, role){

											if(err){ message.channel.sendMessage("Whoops. An error occured. Please report it in the Official Server.\n```js\n"+err.stack+"```"); return;}

											guild["members"].map((a) => {
												if(message.guild.roles.has("id", role.id)){
													if(!bot.memberHasRole(message.author.id, role)){
														bot.addMemberToRole(message.author.id, role);
													}
												}
											});

											if(err){ message.channel.sendMessage("Whoops. An error occured. Please report it in the Official Server.\n```js\n"+err.stack+"```"); return;}
											message.channel.sendMessage("Added role to guild. Color: #"+col.toString(16));

											guild["role"] = role.id;
											//message.channel.sendMessage("[DEBUG] "+guild["role"]+", "+role.id);

											saveGuilds();
											saveUsers(bot, message);
											return;
										});*/
									}else{
										message.channel.sendMessage(message.author.username+", you need to have a "+gitems["4"]["name"]+" item to be able to get a custom role.");
										return;
									}


								}else{
									message.channel.sendMessage(message.author.username+", Only the guild owner can set the role.");
									return;
								}

								
							}else{
								message.channel.sendMessage(message.author.username+"! You're not in a guild!");
								return;
							}
						}else{
							message.channel.sendMessage(message.author.username+", please start your adventure first.");
							return;
						}
					}else{
						message.channel.sendMessage("The bot doesn't have the neccesary permissions to do this. (``manageRoles``)");
						return;
					}
				}else{

					let prefix = settings["prefix"]["main"];

					if(message.channel.type === "text"){
						if(servers.hasOwnProperty(message.guild.id)){
							prefix = (servers[message.guild.id].prefix || "#!");
						}
					}

					message.channel.sendMessage("Sorry, "+message.author.username+", but this only works in the official server. To get a invite from the server type `{}serverinvite`".format(prefix));
					return;
				}
			}catch(e){
				message.channel.sendMessage("Whoops! An error occured! Please report it in the Official server! ```js\n"+e.stack+"```");
				return;
			}
		},
		"desc": "Gives your guild a custom role. (Only works in the official server)",
		"usage": "getrole",
		"cooldown": 10,
		"cmsg": 5
	},
	//Get Channel
	"getchannel": {
		process: function(args, message, bot){

			try{

				if(message.channel.type !== "text"){
					message.channel.sendMessage("Sorry, {}, but you can't do this in a private message.".format(message.author.username));
					return;
				}

				if(message.guild.id == "172382467385196544"){

					if(message.guild.permissionsFor(bot.user).hasPermission("MANAGE_CHANNELS")){

						if(users.hasOwnProperty(message.author.id)){

							user = users[message.author.id];

							if(user["guild"] == undefined){
								user["guild"] = "";
							}

							if(user["guild"].length > 0){


								var guild = guilds[user["guild"]];

								if(guild["role"] == undefined){
									guild["role"] = "";
								}

								if(guild["items"] == undefined){
									guild["items"] = [];
								}

								if(!guild.hasOwnProperty("inv")){
									guild["inv"] = {};
								}
								
								if(guild["channel"] == undefined){
									guild["channel"] = "";
								}

								if(guild["owner"] == message.author.id){
									if(guild["role"] != ""){

										if(!message.guild.roles.exists("id", guild.role)){
											message.channel.sendMessage("Sorry, {}, but your guild doesn't have a dedicated role.".format(message.author.username));
											return;
										}

										if(guild["inv"].hasOwnProperty("6")){
											if(guild["channel"] == undefined){
												guild["channel"] = "";
											}
											if(guild["channel"].length == 0){
												if(guild["inv"]["6"] == 1){
													delete guild["inv"]["6"];
												}else{
													guild["inv"]["6"]--;
												}


												message.guild.createChannel(guild['name'].replace(/[^a-z0-9\-]/gmi, "-"), "text").then((channel) => {

													channel.overwritePermissions(message.guild.roles.find("id", message.guild.id), {
														"READ_MESSAGES": false,
														"SEND_MESSAGES": false,
														"READ_MESSAGE_HISTORY": false
													}).then(() => {
														channel.overwritePermissions(message.guild.roles.find("id", guild.role), {
															"READ_MESSAGES": true,
															"SEND_MESSAGES": true,
															"READ_MESSAGE_HISTORY": true,
															"EMBED_LINKS": true,
															"ATTACH_FILES": true
														}).then(() => {
															channel.overwritePermissions(guild.owner, {
																"READ_MESSAGES": true,
																"SEND_MESSAGES": true,
																"READ_MESSAGE_HISTORY": true,
																"EMBED_LINKS": true,
																"ATTACH_FILES": true,
																"MANAGE_MESSAGES": true,
																"MAMNAGE_CHANNEL": true
															}).then(() => {
																channel.setTopic(guild.desc);
																message.channel.sendMessage("Created Channel.");
																guild["channel"] = chn.id;
																saveGuilds();
																return;
															})
														});
													});
												});
											}else{
												message.channel.sendMessage(message.author.username+", you already have a channel!");
												return;
											}
										}else{
											message.channel.sendMessage(message.author.username+", you need to have a "+gitems["6"]["name"]+" item to be able to get a custom channel.");
											return;
										}
									}else{
										message.channel.sendMessage(message.author.username+", you need to have a custom role active to have a custom channel.");
										return;
									}


								}else{
									message.channel.sendMessage(message.author.username+", Only the guild owner can make a channel.");
									return;
								}

								
							}else{
								message.channel.sendMessage(message.author.username+"! You're not in a guild!");
								return;
							}
						}else{
							message.channel.sendMessage(message.author.username+", please start your adventure first.");
							return;
						}
					}else{
						message.channel.sendMessage("The bot doesn't have the neccesary permissions to do this. (``manageChannels``)");
						return;
					}
				}else{

					let prefix = settings["prefix"]["main"];

					if(message.channel.type === "text"){
						if(servers.hasOwnProperty(message.guild.id)){
							prefix = (servers[message.guild.id].prefix || "#!");
						}
					}

					message.channel.sendMessage("Sorry, "+message.author.username+", but this only works in the official server. To get a invite, type `{}serverinvite`".format(prefix));
					return;
				}
			}catch(e){
				message.channel.sendMessage("Whoops! An error occured! Please report it in the Official server! ```js\n"+e.stack+"```");
				return;
			}
		},
		"desc": "Gives your guild a custom channel. (Only works in the official server and if you have a custom role)",
		"usage": "getchannel",
		"cooldown": 10,
		"cmsg": 5
	},
	"getuser": {
		process: function(args, message, bot){
			if(args.length >= 2){
				if(message.mentions.users.size >= 1){
					if(message.author.id == settings["owner"] || message.author.id == "120627061214806016" || message.author.id == "158049329150427136" || message.author.id == "107868153240883200"){
						var to = message.mentions.users.array()[0].id;
						message.channel.sendMessage("User: "+to+":\n```js\n"+json(users[to])+"```");
					}
				}
			}
		},
		"desc": "Gets the JSON of a user",
		"usage": "getuser ``@user``",
		"cooldown": 10,
		"unlisted": true
	},
	"sell": {
		process: function(args, message, bot){
			 if(!users[message.author.id] == undefined){
				if(users[message.author.id]["name"] != message.author.username){
					user[message.author.id]["name"] = message.author.username;
				}

				var usr = users[message.author.id];
				fixInv(message.author.id);

				Object.keys(usr["inv"]).map((a) => {
					var ps = usr["inv"][a].formatNumber()+" x "+items[a]["name"];
					if(itms.indexOf(ps) == -1){
						itms.push(ps);
					}
				});

			}

			var item = args.splice(1, args.length).join(" ").replace(/\s*$/, "");
			//message.channel.sendMessage("[DEBUG] "+item);
			

			var amt = 1;

			var matches = item.match(/\d+|all$/i);

			if(matches){
				if(Number(matches[0])){
					amt = Number(matches[0]);
					item = item.replace(/\d+|all$/, "").replace(/\s*$/, "");
				}else{
					if(matches[0].toLowerCase() == "all"){

						item = item.replace(/\d+|all$/, "").replace(/\s*$/, "");
						var itm;

						Object.keys(items).map((a) => {
							if(item.toLowerCase() == items[a]["name"].toLowerCase()){
								itm = a;
							}
						});

						var hs = users[message.author.id]["inv"][itm];


						if(hs == undefined){
							hs = 0;
						}
						if(hs >= 0){
							amt = hs;
						}
					}
				}
			}


			if(item.toLowerCase() == "gold"){
				message.channel.sendMessage(message.author.username+"! You can't sell money!");
				return;
			}

			var results = filter.filter(itmObj, item.toLowerCase(),{key: "name"});
			var sell = false;

			Object.keys(items).map((a) => {
				if(item.toLowerCase() == items[a]["name"].toLowerCase()){
					var itm = a;
					if(amt <= users[message.author.id]["inv"][itm]){
							
						void 0==items[itm].sellable&&(items[itm].sellable=!1,saveItems(bot)),void 0==items[itm].sell&&(items[itm].sell=0,saveItems(bot));

						if(items[itm]["sellable"]){
							if(users[message.author.id]["inv"][itm]-amt <= 0){
								delete users[message.author.id]["inv"][itm];
							}else{
								users[message.author.id]["inv"][itm] -= amt;
							}

							var gold = items[itm]["sell"]*amt;
							users[message.author.id]["gold"] += gold;

							var n;


							if(amt > 1){
								n = (items[itm].plural || items[itm].name);
							}else{
								n = items[itm].name;
							}

							var m = "{} sold {} {} and got {} gold.".format(message.author.username, amt.formatNumber(), n, gold.formatNumber());

							message.channel.sendMessage(m);
							sell = true;
							return;
						}else{
							message.channel.sendMessage(message.author.username+" tried to sell a unsellable item.");
							sell = true;
							return;
						}
					}else{
						var has = users[message.author.id]["inv"][itm];
						if(has == undefined){
							has = 0;
						}

						var n = items[itm].name;

						if(amt > 1){
							n = (items[itm].plural || items[itm].name);
						}

						message.channel.sendMessage(message.author.username+" tried to sell "+amt.formatNumber()+" "+n+", but only has "+has.formatNumber()+".");
						sell = true;
						return;
					}
					return;
				}
			});

			if(results.length > 0){
				if(!sell){
					var itmFound = [];
					var msg = "";
					

					results.map((a) => {
						if(a["sellable"] != undefined && a["sellable"]){
							itmFound.push("``"+a["name"]+"``");
						}
					});

					msg+= "Found "+itmFound.length+" items.\n";
					msg+= itmFound.sort().join(", ");
					message.channel.sendMessage(msg);
					return;
				}
			}

			if(results.length <= 0 && !sell){
				message.channel.sendMessage(message.author.username+" tried to sell an unknown item!");
				return;
			}
		},
		"desc": "Sells items.",
		"usage": "sell ``item`` ``[amount]``",
		"cooldown": 10,
		"cmsg": 5
	},
	"fixhp":{
		process: function(args, message, bot){
			if(args.length >= 2){
				if(message.author.id == settings["owner"] || message.author.id == "120627061214806016" || message.author.id == "158049329150427136" || message.author.id == "107868153240883200"){
					var to = message.mentions.users.array()[0].id;
					users[to]["hp"] = users[to]["maxhp"];
					message.channel.sendMessage("Fixed "+bot.users.get("id", to).username+"'s HP");
					saveUsers(bot, message);
				}
			}
		},
		"desc": "Fully heals a user",
		"usage": "fixhp ``user``",
		"cooldown": 10,
		"unlisted": true
	},
	"poll": {
		process: function(args, message, bot){
			message.channel.sendMessage("Please vote seriously; http://www.strawpoll.me/10152730\n Thanks - Discord Dungeons Dev Team");
		},
		"desc": "Shows the latest poll.",
		"usage": "poll",
		"cooldown": 10,
		"cmsg": 5
	},
	"lead": {
		process: function(args, message, bot){

			var usr = [];
			var i = {};
			var d = [];
			var f = {};
			var b = {};
			var ipp = 15;

			var fo = "level"; // Don't touch - Mackan

			// DONT TOUCH COMMENTED SHIT HERE - MACKAN
			if(args.length >= 2){ 
				var fo = args[1].toLowerCase();
			}

			if(fo == "strength"){
				Object.keys(users).map((a) => {
					i[a] = users[a]["stats"]["strength"];
				});
			}else if(fo == "luck"){
				Object.keys(users).map((a) => {
					i[a] = users[a]["stats"]["luck"];
				});
			}else if(fo == "defense"){
				Object.keys(users).map((a) => {
					i[a] = users[a]["stats"]["defense"];
				});
			}else if(fo == "charisma"){
				Object.keys(users).map((a) => {
					i[a] = users[a]["stats"]["charisma"];
				});
			}else if(fo == "gold"){
				Object.keys(users).map((a) => {
					i[a] = users[a]["gold"];
				});
			}else if(fo == "kills"){
				Object.keys(users).map((a) => {
					i[a] = users[a]["kills"];
				});
			}else if(fo == "deaths"){
				Object.keys(users).map((a) => {
					i[a] = users[a]["deaths"];
				});
			}else if(fo == "xp"){
				Object.keys(users).map((a) => {
					i[a] = users[a]["xp"];
				});
			}else if(fo == "level"){
				Object.keys(users).map((a) => {
					i[a] = users[a]["level"];
				});
				fo = "level";
			}else if(fo == "chop"){
				Object.keys(users).map((a) => {
					if(users[a].hasOwnProperty("skills")){
						if(users[a]["skills"].hasOwnProperty("chop")){
							i[a] = users[a]["skills"]["chop"]["level"];
						}
					}
				});
				fo = "chop";
			}else if(fo == "mine"){
				Object.keys(users).map((a) => {
					if(users[a].hasOwnProperty("skills")){
						if(users[a]["skills"].hasOwnProperty("mine")){
							i[a] = users[a]["skills"]["mine"]["level"];
						}
					}
				});
				fo = "mine";
			}else if(fo == "forage"){
				Object.keys(users).map((a) => {
					if(users[a].hasOwnProperty("skills")){
						if(users[a]["skills"].hasOwnProperty("forage")){
							i[a] = users[a]["skills"]["forage"]["level"];
						}
					}
				});
				fo = "forage";
			}else if(fo == "fish"){
				Object.keys(users).map((a) => {
					if(users[a].hasOwnProperty("skills")){
						if(users[a]["skills"].hasOwnProperty("fish")){
							i[a] = users[a]["skills"]["fish"]["level"];
						}
					}
				});
				fo = "fish";
			}else if(fo == "hp"){
				Object.keys(users).map((a) => {
					i[a] = users[a]["hp"];
				});
				fo = "hp";
			}else{
				Object.keys(users).map((a) => {
					i[a] = users[a]["level"];
				});
				fo = "level";
			}

			for(let x in i){
				// TODO: Remove loop
				d.push([x, i[x]]);
			}

			var k = d.sort(function(a, b){return a[1] - b[1]});

			k.map((a, b) => {
				var n = users[a[0]]["name"];
				var l = users[a[0]]["level"];
				var g = users[a[0]]["gold"];
				var xp = users[a[0]]["xp"];
				var d = users[a[0]]["deaths"];
				var k = users[a[0]]["kills"];
				var ch = -1;
				var fo = -1;
				var mi = -1;
				var fi = -1;
				var hp = users[a[0]]["hp"];


				if(users[a[0]].hasOwnProperty("skills")){
					if(users[a[0]]["skills"].hasOwnProperty("chop")){
						ch = users[a[0]]["skills"]["chop"]["level"];
					}

					if(users[a[0]]["skills"].hasOwnProperty("mine")){
						mi = users[a[0]]["skills"]["mine"]["level"];
					}

					if(users[a[0]]["skills"].hasOwnProperty("forage")){
						fo = users[a[0]]["skills"]["forage"]["level"];
					}

					if(users[a[0]]["skills"].hasOwnProperty("fish")){
						fi = users[a[0]]["skills"]["fish"]["level"];
					}
				}


				f[a[0]] = {"name": n, "level": l, "gold": g, "xp": xp, "deaths": d, "kills": k, "chop": ch, "forage": fo, "mine": mi, "fish": fi, "hp": hp};
			});

			Object.keys(f).slice(Object.keys(f).length-ipp, Object.keys(f).length).reverse().forEach((c, i, a) => {
				b[c] = f[c];
			});


			var so = helper.capFirst(fo);

			if(so.toLowerCase() == "xp"){
				so = "XP";
			}

			var msg = "Top "+ipp+" users, sorted by "+so+".\n```diff\n";

			Object.keys(b).map((a) => {
				var u = users[a];
				if(u != null && u != undefined){
					var n = bot.users.get("id", a);
					var nam = "";
					if(n != null){
						nam = n.name;
					}else{
						if(users[a]["name"] == undefined){
							nam = a;
						}else{
							nam = users[a]["name"];
						}
					}
					switch(fo){
						case "strength":

							msg += "+ "+nam+" {"+users[a]["stats"]["strength"].formatNumber()+" Strength}\n";
						break;
						case "luck":
							msg += "+ "+nam+" {"+users[a]["stats"]["luck"].formatNumber()+" Luck}\n";
						break;
						case "defense":
							msg += "+ "+nam+" {"+users[a]["stats"]["defense"].formatNumber()+" Defense}\n";
						break;
						case "charisma":
							msg += "+ "+nam+" {"+users[a]["stats"]["charisma"].formatNumber()+" Charisma}\n";
						break;
						case "gold":
							msg += "+ "+nam+" {"+users[a]["gold"].formatNumber()+" Gold}\n";
						break;
						case "level":
							msg += "+ "+nam+" {Lvl. "+users[a]["level"].formatNumber()+"}\n";
						break;
						case "deaths":
							msg += "+ "+nam+" {"+users[a]["deaths"].formatNumber()+" Deaths}\n";
						break;
						case "kills":
							msg += "+ "+nam+" {"+users[a]["kills"].formatNumber()+" Kills}\n";
						break;
						case "xp":
							msg += "+ "+nam+" {"+users[a]["xp"].formatNumber()+" XP}\n";
						break;
						case "chop":
							msg += "+ "+nam+" {Lvl. "+users[a]["skills"]["chop"]["level"].formatNumber()+"}\n";
						break;
						case "mine":
							msg += "+ "+nam+" {Lvl. "+users[a]["skills"]["mine"]["level"].formatNumber()+"}\n";
						break;
						case "forage":
							msg += "+ "+nam+" {Lvl. "+users[a]["skills"]["forage"]["level"].formatNumber()+"}\n";
						break;
						case "fish":
							msg += "+ "+nam+" {Lvl. "+users[a]["skills"]["fish"]["level"].formatNumber()+"}\n";
						break;
						case "hp":
							msg += "+ "+nam+" {"+users[a]["hp"].formatNumber()+" HP}\n";
						break;
						default:
							msg += "+ "+nam+" {Lvl. "+users[a]["level"].formatNumber()+"}\n";
						break;
					}
					
				}
			});
			message.channel.sendMessage(msg+"```");
			return;
		},
		"desc": "Shows a leaderboard",
		"usage": "lead ``Filter``\nPossible filters: ``Level``, ``Strength``, ``Luck``, ``Defense``, ``Charisma``, ``Gold``, ``Deaths``, ``Kills``, ``XP``, ``Chop``, ``Forage``, ``Mine``",
		"cooldown": 10,
		"cmsg": 5
	},
	"setprefix": {
		process: function(args, message, bot){
			if(args.length >= 2){
				if(message.channel.type === "text"){
					if(message.guild.members.find("id", message.author.id).roles.exists("name", "DiscordRPG Commander")){
						var prefix = args.splice(1, args.length).join(" ");
						
						if(prefix.actualLength() > 16){
							message.channel.sendMessage("Sorry, {}, but the prefix can be a maximum of 16 characters.".format(message.author.username));
							return;
						}

						if(servers[message.guild.id] == undefined){
							servers[message.guild.id] = {};
						}
						servers[message.guild.id].prefix = prefix;
						message.channel.sendMessage("Prefix for server set to ``"+prefix+"``");
						saveServers();
						return;
					}else{
						message.channel.sendMessage("Sorry, "+message.author.username+", but you need a role named ``DiscordRPG Commander`` in order to change the prefix.");
						return;
					}
				}else{
					message.channel.sendMessage("Sorry, "+message.author.username+", but the prefix can't be set in private messages.");
					return;
				}
			}else{
				message.channel.sendMessage("Sorry, "+message.author.username+", but you need to specify the prefix.");
				return;
			}
		},
		"desc": "Sets the bot prefix for the server",
		"usage": "setprefix ``prefix``",
		"cooldown": 10,
		"cmsg": 5
	},
	"servers": {
		process: function(args, message, bot){
			if(message.guild.id == "172382467385196544"){
				if(message.author.id == settings["owner"] || message.author.id == "120627061214806016" || message.author.id == "158049329150427136" || message.author.id == "107868153240883200"){
					var p = 1;
					var servers = bot.guilds;
					var ipp = 25;

					if(args.length >= 2){
						if(Number(args[1])){
							p = Number(args[1]);

							if(p < 1){
								p = 1;
							}

							if(p > Math.ceil(servers.size/ipp)){
								p = Math.ceil(servers.size/ipp);
							}
						}
					}



					var itmz = [];
					var i = {};
					var d = [];
					var s = {};
					var f = {};


					servers.map((a) => {
						s[a] = a["members"].size;
						f[a] = a["id"];
					});

					for(let x in s){
						i[x] = s[x];
						// TODO: Remove for loop
					}

					for(let x in i){
						// TODO: Remove for loop
						d.push([x, i[x]]);
					}

					var k = d.sort(function(a, b){return a[1] - b[1]});

					k.map((a, b) => {
						var n = a[0];
						var c = a[1];
						var id = f[a[0]];
						if(n == undefined || n == ""){
							n = "??";
						}
						itmz.push(n+" - "+formatNumber(c)+" ["+id+"]");
					});

					var sets = {};
					var set = [];
					var setCounter = 0;

					itmz.map((a, b) => {
						set.push(a);
						if((b+1) % ipp == 0 || (b+1) >= itmz.length){
							setCounter++;
							sets['set'+setCounter] = set;
							set = [];
						}
					});



					var msg = "```diff\n! Servers (Page "+p+"/"+Math.ceil(servers.size/ipp)+")\n-   ";
					if(sets["set"+p] != undefined){
						msg+= sets["set"+p].join("\n-   ");
					}else{
						msg += "None.";
					}
					
					msg+= "\n```";
					message.channel.sendMessage(msg);
				}
			}
		},
		"desc": "Lists servers",
		"usage": "servers ``[page]``",
		"cooldown": 10,
		"unlisted": true
	},
	"server": {
		process: function(args, message, bot){
			if(message.author.id == settings["owner"] || message.author.id == "120627061214806016" || message.author.id == "158049329150427136" || message.author.id == "107868153240883200"){
				var server = message.guild;

				if(args.length >= 2){
					server = bot.guilds.find("id", args[1]);
					if(server == null || server == undefined){
						message.channel.sendMessage("Unknown server.");
						return;
					}
				}

				var usrs = 0;
				var gs = 0;
				var members = server.members;

				members.map((a) => {
					if(users.hasOwnProperty(a["id"])){
						usrs++;
						if(!users[a["id"]].hasOwnProperty("guild")){
							users[a["id"]]["guild"] = "";
						}
						if(users[a["id"]]["guild"].length > 0){
							var g = users[a["id"]]["guild"];
							if(guilds.hasOwnProperty(g)){
								gs++;
							}
						}
					}
				});

				message.channel.sendMessage(usrs+"/"+members.size+" users have started their adventure and "+gs+"/"+members.size+" users are in a guild on server ``"+server.name+"``");
				return;
			}
		},
		"desc": "Shows DiscordRPG stats on a server",
		"usage": "server ``[server id]``",
		"cooldown": 10,
		"unlisted": true
	},
	"saveusers": {
		process: function(args, message, bot){
			if(message.author.id == settings["owner"] || message.author.id == "120627061214806016" || message.author.id == "158049329150427136" || message.author.id == "107868153240883200"){
				try{
					if(JSON.stringify(users)){
						var x = JSON.stringify(users);
						client.set("users", x);
					}
				}catch(e){
					message.channel.sendMessage("Whoops. An error occured. Please report it in the official server.\n```js\n"+e.stack+"```");
					return;
				}
			}
		},
		"desc": "Saves users",
		"usage": "saveusers",
		"cooldown": 5,
		"unlisted": true
	},
	// Crafting
	"make": {
		process: function(args, message, bot){
			if(args.length >= 2){

				var item = args.splice(1, args.length).join(" ").toLowerCase();
				var iid = "-1";
				var found = false;
				var amo = 1;

				var matches = item.match(/\d+/i);

				if(matches){
					if(Number(matches[0])){
						amo = Number(matches[0]);
						item = item.replace(/\d+$/, "").replace(/\s*$/, "");
					}
				}

				Object.keys(items).map((a) => {
					if(items[a]["name"].toLowerCase() == item){
						iid = a;
						found = true;
					}
				});

				if(crafts.hasOwnProperty(iid)){
					var cr = crafts[iid];
					var usr = message.author.id;
					if(users.hasOwnProperty(usr)){
						usr = users[usr];
						fixInv(message.author.id);
						if(usr["level"] >= cr["level"]){
							var met = [];
							Object.keys(cr["items"]).map((a) => {
								if(a.toLowerCase() == "gold"){
									if(usr["gold"] >= (cr["items"][a]*amo)){
										met.push(1);
									}
								}else{
									if(usr["inv"].hasOwnProperty(a)){
										if(usr["inv"][a] >= (cr["items"][a]*amo)){
											met.push(1);
										}
									}
								}
							});

							let x = "";

							if(met.length >= Object.keys(cr["items"]).length){
								var use = [];
								Object.keys(cr["items"]).map((a) => {
									var itm = a;
									var amt = (cr["items"][a]*amo);

									if(amt == NaN){
										amt = (1*amo);
									}

									if(users[message.author.id]["inv"][itm]-amt <= 0){
										delete users[message.author.id]["inv"][itm];
									}else{
										users[message.author.id]["inv"][itm] -= amt;
									}

									if(itm.toLowerCase() == "gold"){
										x = "gold";

									}else{
										x = items[itm].name;

										if(amt > 1){
											x = (items[itm].plural || items[itm].name);
										}
									}

									

									use.push(amt+" x "+x);
								});
								if(usr["inv"].hasOwnProperty(iid)){

									if(x !== "gold"){
										usr["inv"][iid] += (cr["amount"]*amo);
									}
								}else{

									if(x !== "gold"){
										usr["inv"][iid] = (cr["amount"]*amo);
									}

								}

								var p = items[iid]["name"];

								if((cr["amount"]*amo) > 1 && !p.toLowerCase().endsWith("s")){
									p += "s";
								}

								message.channel.sendMessage(message.author.username+" used "+use.sort().join(", ")+" and made "+(cr["amount"]*amo)+" "+p);
							}else{
								var ms = message.author.username+" tried to craft ";
								if(amo >= 1){
									ms += "some items";
								}else{
									ms = "an item";
								}

								ms += " but didn't have enough materials.";
								message.channel.sendMessage(ms);
							}
						}else{
							message.channel.sendMessage(message.author.username+" tried to craft an item, but wasn't skilled enough.");
						}
					}
				}else{
					message.channel.sendMessage(message.author.username+" tried to craft an unknown item.");
				}
			}
		},
		"desc": "Makes items",
		"usage": "make ``item``",
		"cooldown": 10,
		"cmsg": 5
	},
	"avatar": {
		process: function(args, message, bot){
			if(args.length >= 2){
				var owner = settings["owner"];
				if(message.author.id == owner){
					request.get({url: args[1], encoding: null}, function(error, response, body){
						if(!error && response.statusCode == 200){
							console.dir(response.headers["content-type"]);
							data = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
							if(data != undefined && data != null){
								bot.setAvatar(data, function(err){
									if(!err){
										message.channel.sendMessage("Updated avatar");
									}else{
										console.dir(err);
									}
								});
							}else{
								console.log("Data not defined");
							}
						}else{
							console.log(error);
						}
					});
				}
			}
		},
		"desc": "Sets the bot avatar",
		"usage": "avatar `Image URL`",
		"cooldown": 0,
		"unlisted": true
	},
	"drop": {
		process: function(args, message, bot){
			var amt = 1;

			if(!users[message.author.id] == undefined){
				if(users[message.author.id]["name"] != message.author.username){
					user[message.author.id]["name"] = message.author.username;
				}
			}

			var usr = users[message.author.id];

			fixInv(message.author.id);

			itms = [];

			Object.keys(usr["inv"]).map((a) => {
				var ps = usr["inv"][a]+" x "+items[a]["name"];
				if(itms.indexOf(ps) == -1){
					itms.push(ps);
				}
			});

			var item = args.splice(1, args.length).join(" ");

			var matches = item.match(/\d+|all$/i);

			if(matches){
				if(Number(matches[0])){
					amt = Number(matches[0]);
					item = item.replace(/\d+|all$/, "").replace(/\s*$/, "");
				}else{
					if(matches[0].toLowerCase() == "all"){

						item = item.replace(/\d+|all$/, "").replace(/\s*$/, "");
						var itm;

						Object.keys(items).map((a) => {
							if(item.toLowerCase() == items[a]["name"].toLowerCase()){
								itm = a;
							}
						});

						var hs = users[message.author.id]["inv"][itm];

						if(hs == undefined){
							hs = 0;
						}
						if(hs >= 0){
							amt = hs;
						}
					}
				}
			}

			var uitems = [];

			Object.keys(usr["inv"]).map((a) => {
				var n = items[a]["name"];
				if(uitems.indexOf(n) == -1){
					uitems.push(n);
				}
			});

			var itmz = [];


			var results = filter.filter(uitems, item.toLowerCase());
			var found = false;
			var msg = "";

			Object.keys(items).map((a) => {
				if(items[a]["name"].toLowerCase() == item.toLowerCase()){
					if(users[message.author.id]["weapon"] == a){
						found = true;
						message.channel.sendMessage(message.author.username+", you can't drop your weapon.");
						return;
					}
					if(!found){
						if(users[message.author.id]["inv"][a]-amt <= 0){
							delete users[message.author.id]["inv"][a];
							let n = items[a].name;
							
							if(amt > 1){
								n = (items[a].plural || items[a].name);
							}

							msg = message.author.username+" dropped all "+n;

							msg += ".";

							if(a == "94"){
								msg += "\nIt makes a giant white cloud appear.";
							}
						}else{
							users[message.author.id]["inv"][a] -= amt;
							
							let n = items[a]["name"];
							if(amt > 1){
								n = (items[a].plural || items[a].name);
							}

							msg = message.author.username+" dropped "+amt+" "+n
							msg += ".";

							if(a == "94"){
								msg += "\nIt makes a big mess";
							}

						}
						found = true;
						message.channel.sendMessage(msg);
						saveUsers(bot, message);
						return;
					}
				}
			});

			if(results.length > 0 && !found){
				var itmFound = [];
				msg = "";
				msg+= "Found "+results.length+" items.\n";

				results.map((a) => {
					itmFound.push("``"+a+"``");
				});

				msg+= itmFound.sort().join(", ");
				message.channel.sendMessage(msg);
				return;
			}

			if(results.length <= 0 && !found){
				message.channel.sendMessage(message.author.username+" tried to drop an unknown item!");
				return;
			}
		},
		"desc": "Drops items",
		"usage": "drop `[item]`",
		"cooldown": 10,
		"cmsg": 5
	},
	"recipe":  {
		process: (args, message, bot) => {
			try{
				if(args.length >= 2){
					var find = false;
					var item = args.splice(1, args.length).join(" ").replace(/\s*$/, "");
					var msg = "";
					var rec = [];

					if(item.length <= 0){
						item = "";
					}

					var crftObj = [];

					Object.keys(crafts).map((a) => {
						crftObj.push({"name": items[a]["name"]});
					});

					var results = filter.filter(crftObj, item.toLowerCase(),{key: "name"});

					Object.keys(crafts).map((a) => {
						if(item.toLowerCase() == items[a]["name"].toLowerCase()){
							find = true;

							Object.keys(crafts[a]["items"]).map((b) => {

								if(b.toLowerCase() == "gold"){
									var bname = "Gold";

									rec.push(crafts[a]["items"][b].formatNumber()+" "+bname);

								}else{
									var bname = items[b]["name"];

									if(crafts[a]["items"][b] > 1 && !bname.endsWith("s")){
										bname += "s";
									}

									rec.push(crafts[a]["items"][b]+" "+bname);
								}
							});

							var name = items[a]["name"];

							if(!name.endsWith("s")){
								name += "s";
							}

							msg = "To craft "+name+", you need to be level "+crafts[a]["level"].formatNumber()+" aswell as "+rec.join(", ");
						}
					});

					if(!find){

						if(item.toLowerCase() == "couch"){
							message.channel.sendMessage("To craft a ouch, you need level OP aswell as 1 air crystal, 3 lungs, and 1 esophagus.");
							find = true;
						}else{
							msg = message.author.username+" tried to find a unknown recipe.";
						}
					}

					if(results.length > 0 && !find){
						var found = [];
						msg = "Found "+results.length+" recipes.\n";
						results.map((a) => {
							found.push("``"+a["name"]+"``");
						});
						msg += found.sort().join(", ");
					}

					message.channel.sendMessage(msg);
				}else{
					var crftObj = [];
					Object.keys(crafts).map((a) => {
						crftObj.push("``"+items[a]["name"]+"``");
					});
					message.channel.sendMessage("There are "+crftObj.length+" items available for crafting: \n"+crftObj.join(", "));
				}
			}catch(e){
				message.channel.sendMessage("Error!\n```js\n"+e.stack+"```");
			}

		},
		"desc": "Shows the recipe for crafing an item",
		"usage": "recipe `[item]`",
		"cooldown": 10,
		"cmsg": 5
	},
	//Forage Command
	"forage":{
		process: function(args, message, bot){

			if(users[message.author.id] != undefined){
				if(users[message.author.id]["name"] != message.author.username||users[message.author.id]["name"]==undefined){
					users[message.author.id]["name"] = message.author.username;
				}

				var icons = ["&#x1F33F;","&#x1F331;","&#x1F343;","&#x1F33E;","&#x1F33A;","&#x1F33C;","&#x1F337;","&#x1F339;","&#x1F342;","&#x1F490;","&#x1F33B;","&#x2618;","&#x1F340;","&#x1F38B;", "&#x1F338;","&#x1F330;","&#x1F38D;"];

				var icon = fix.decodeHTML(icons.random());

				var msg = icon+" "+message.author.username+" Found ";
				var usr = users[message.author.id];
				var luck = usr["stats"]["charisma"];
				var level = users[message.author.id]["level"];
				var user = message.author.id;
				
				var rock = helper.rInt(1, 150);

				var ch = 15+Math.floor(luck/40);

				if(ch < 15){
					ch = 15;
				}

				var amt = 0;
				var iid = "";

				if(usr["skills"] == undefined){
					usr["skills"] = {
						"chop": {
							"level": 1,
							"xp": 0
						},
						"mine": {
							"level": 1,
							"xp": 0
						},
						"forage": {
							"level": 1,
							"xp": 0
						},
						"fish": {
							"level": 1,
							"xp": 0
						}
					};
				}

				if(usr["skills"]["forage"] == undefined){
					usr["skills"]["forage"] = {
						"level": 1,
						"xp": 0
					};
				}

				var skillLevel = usr["skills"]["forage"]["level"];

				var minXP = Math.round(Math.sqrt((Math.sqrt(level)*0.25)*helper.rInt(5, 10) / 2)),
					maxXP = Math.round(Math.sqrt((Math.sqrt(level)*0.25)*helper.rInt(10, 15) / 2));


				var minSkillXP = Math.round(Math.sqrt((Math.sqrt(skillLevel)*0.25)*helper.rInt(5, 10) / 2)),
					maxSkillXP = Math.round(Math.sqrt((Math.sqrt(skillLevel)*0.25)*helper.rInt(10, 15) / 2));

				var xp = helper.rInt(minXP, maxXP);
				var skillXP = helper.rInt(minSkillXP, maxSkillXP);

				
				if(rock <= 20){
					amt = 1+skillLevel+Math.floor(luck/65)
					iid = "67"
				}else if(rock >= 21 && rock <= 40){
					amt = 1+skillLevel+Math.floor(luck/65);
					iid = "68";
				}else if(rock >= 41 && rock <= 60){
					amt = 1+skillLevel+Math.floor(luck/65);
					iid = "69";
				}else if(rock >= 61 && rock <= 90){
					amt = 1+skillLevel+Math.floor(luck/65);
					iid = "70";
				}else if(rock >= 91 && rock <= 100){
					amt = 1+skillLevel+Math.floor(luck/65);
					iid = "71";
				}else if(rock >= 101 && rock <= 120){
					amt = 1+skillLevel+Math.floor(luck/65);
					iid = "107";
				}else if(rock >= 121 && rock <= 140){
					amt = 1+skillLevel+Math.floor(luck/65);
					iid = "110";
				}else if(rock >= 141){
					amt = 1+skillLevel+Math.floor(luck/65);
					iid = "92";
				}

				if(amt > 1){
					msg += amt.formatNumber()+" "+(items[iid].plural || items[iid].name)+" ";
				}else{
					msg += amt.formatNumber()+" "+items[iid].name+" ";
				}

				msg += "and got "+xp.formatNumber()+" XP and "+skillXP.formatNumber()+" skill XP ";

				msg += "while foraging.\n";

				var levelup = getLevelUp(level);
				var skillup = getSkillLevelUp(skillLevel, "forage");

				users[message.author.id]["xp"]+= xp;
				users[message.author.id]["skills"]["forage"]["xp"] += skillXP;

				if(users[message.author.id]["xp"] >= levelup){
					users[user]["level"]++;
					users[user]["maxhp"]+= 50;
					users[user]["hp"] = users[user]["maxhp"];
					users[user]["points"]+= 5;
					msg += "\n"+message.author.username+" Leveled up! They've been awarded with 5 attribute points, and, along with their max HP increasing by 50, they've been fully healed!";

				}

				if(users[message.author.id]["skills"]["forage"]["xp"] >= skillup){
					users[message.author.id]["skills"]["forage"]["level"]++;
					msg += "\n"+message.author.username+" Leveled up in Foraging!";
				}

				if(users[message.author.id]["inv"] == undefined){
					fixInv(message.author.id);
				}

				if(users[message.author.id]["inv"].hasOwnProperty(iid)){
					users[message.author.id]["inv"][iid]+=amt;
				}else{
					if(amt > 0){
						users[message.author.id]["inv"][iid] = amt;
					}
				}

				saveUsers(bot, message);
				message.channel.sendMessage(msg);
			}else{
				message.channel.sendMessage(message.author.username+", please start your adventure first!");
				return;
			}
		},
		"desc": "Scavenge the land for items.",
		"usage": "forage",
		"cooldown": 300,
		"cmsg": 30
	},
	"idonate":{
		process: function(args, message, bot){
			if(args.length >= 3 && message.mentions.length >= 1){
				var amt = 1;


				if(!users[message.author.id] == undefined){
					if(users[message.author.id]["name"] != message.author.username){
						user[message.author.id]["name"] = message.author.username;
					}
				}

				var usr = users[message.author.id];

				fixInv(message.author.id);


				var to = message.mentions[0];

				if(!users.hasOwnProperty(to.id)){
					message.channel.sendMessage("Sorry, "+message.author.username+", but that user hasn't started their adventure yet.");
					return;
				}


				itms = [];

				Object.keys(usr["inv"]).map((a) => {
					var ps = usr["inv"][a]+" x "+items[a]["name"];
					if(itms.indexOf(ps) == -1){
						itms.push(ps);
					}
				});

				var item = args.splice(2, args.length).join(" ");

				var matches = item.match(/\d+|all$/i);

				if(matches){
					if(Number(matches[0])){
						amt = Number(matches[0]);
						item = item.replace(/\d+|all$/, "").replace(/\s*$/, "");
					}else{
						if(matches[0].toLowerCase() == "all"){

							item = item.replace(/\d+|all$/, "").replace(/\s*$/, "");
							var itm;

							Object.keys(items).map((a) => {
								if(item.toLowerCase() == items[a]["name"].toLowerCase()){
									itm = a;
								}
							});

							var hs = users[message.author.id]["inv"][itm];

							if(hs == undefined){
								hs = 0;
							}
							if(hs >= 0){
								amt = hs;
							}
						}
					}
				}

				var uitems = [];

				Object.keys(usr["inv"]).map((a) => {
					var n = items[a]["name"];
					if(uitems.indexOf(n) == -1){
						uitems.push(n);
					}
				});

				var itmz = [];


				var results = filter.filter(uitems, item.toLowerCase());
				var found = false;
				var msg = "";

				Object.keys(items).map((a) => {
					if(items[a]["name"].toLowerCase() == item.toLowerCase()){
						if(users[message.author.id]["weapon"] == a){
							found = true;
							message.channel.sendMessage(message.author.username+", you can't donate your weapon.");
							return;
						}
						if(!found){
							if(users[message.author.id]["inv"][a] != undefined){

								if(items[a]["tradable"] == undefined){
									items[a]["tradable"] = true;
								}else{
									if(items[a]["tradable"] == false){
										found = true;
										message.channel.sendMessage("You can't trade that item, "+message.author.username);
										return;
									}
								}

								if(!found){
									if(users[message.author.id]["inv"][a]-amt <= 0){
										delete users[message.author.id]["inv"][a];
										msg = message.author.username+" donated all ";

										if(items[a].hasOwnProperty("plural")){

											if(amt > 1){
												msg += items[a].plural;
											}else{
												msg += items[a].name;
											}

										}else{

											if(amt > 1){
												msg += items[a].name+"s";
											}
										}


										if(users[to.id]["inv"].hasOwnProperty(a)){
											users[to.id]["inv"][a] += amt;
										}else{
											users[to.id]["inv"][a] = amt;
										}

										msg += " to "+to.name+".";
									}else{
										users[message.author.id]["inv"][a] -= amt;
										msg = message.author.username+" donated "+amt.formatNumber()+" ";
										if(items[a].hasOwnProperty("plural")){

											if(amt > 1){
												msg += items[a].plural;
											}else{
												msg += items[a].name;
											}

										}else{

											if(amt > 1){
												msg += items[a].name+"s";
											}
										}

										if(users[to.id]["inv"].hasOwnProperty(a)){
											users[to.id]["inv"][a] += amt;
										}else{
											users[to.id]["inv"][a] = amt;
										}

										msg += " to "+to.name+".";
									}
									found = true;
									message.channel.sendMessage(msg);
									saveUsers(bot, message);
									return;
								}
							}else{
								found = true;
								message.channel.sendMessage(message.author.username+" tried to donate an item they don't have.");
								return;
							}
						}
					}
				});

				if(results.length > 0 && !found){
					var itmFound = [];
					msg = "";
					msg+= "Found "+results.length+" items.\n";

					results.map((a) => {
						itmFound.push("``"+a+"``");
					});

					msg+= itmFound.sort().join(", ");
					message.channel.sendMessage(msg);
					return;
				}

				if(results.length <= 0 && !found){
					message.channel.sendMessage(message.author.username+" tried to donate an unknown item!");
					return;
				}
			}else{
				message.channel.sendMessage("You did something wrong, "+message.author.username+".");
			}
		},
		"desc": "Donates items to a user",
		"usage": "idonate ``@user`` ``item`` ``amount``",
		"cooldown": 5,
		"cmsg": 2
	},
	"trap": {
		process: function(args, message, bot){
			if(users.hasOwnProperty(message.author.id)){
				if(args.length >= 2){
					if(users[message.author.id]["level"] >= 12){
						if(args[1].toLowerCase() == "set"){
							var user = users[message.author.id];

							if(!user.hasOwnProperty("lasttrap")){
								user["lasttrap"] = "";
							}

							if(user["lasttrap"] != ""){
								message.channel.sendMessage("You already have a trap set, "+message.author.username+".");
							}else{
								
								if(user["inv"].hasOwnProperty("73")){
									var now = new Date().valueOf();

									if(user["inv"]["73"]-1 <= 0){
										delete user["inv"]["73"];
									}else{
										user["inv"]["73"]--;
									}

									user["lasttrap"] = now.toString();

									message.channel.sendMessage(message.author.username+" set a trap.");

								}else{
									message.channel.sendMessage("You need a "+items["73"].name+" in order to set a trap.");
								}
							}


						}else if(args[1].toLowerCase() == "check"){

							var user = users[message.author.id];

							if(!user.hasOwnProperty("lasttrap")){
								user["lasttrap"] = "";
							}

							if(user["lasttrap"] != ""){

								var now = new Date().valueOf();
								var trap = Number(user["lasttrap"]);
								var passed = Math.floor((now-trap)/1000);
								var luck = user["stats"]["luck"];

								var itm = {};
								var got = [];

								if(passed >= 300){

									var amt = 1+Math.floor((Math.floor(Math.sqrt(luck))*(passed/25))/15000);
									var max = 1+Math.floor((Math.floor(Math.sqrt(luck))*(passed/25))/14000);

									itm["79"] = helper.rInt(amt, max);
								}

								if(passed >= 1200){

									var amt = 1+Math.floor((Math.floor(Math.sqrt(luck))*(passed/25))/15000);
									var max = 1+Math.floor((Math.floor(Math.sqrt(luck))*(passed/25))/14000);

									itm["78"] = helper.rInt(amt, max);
									
								}

								if(passed >= 3600){

									var amt = 1+Math.floor((Math.floor(Math.sqrt(luck))*(passed/25))/15000);
									var max = 1+Math.floor((Math.floor(Math.sqrt(luck))*(passed/25))/14000);

								   itm["81"] = helper.rInt(amt, max);
								}

								if(passed >= 86400){

									var amt = 1+Math.floor((Math.floor(Math.sqrt(luck))*(passed/25))/15000);
									var max = 1+Math.floor((Math.floor(Math.sqrt(luck))*(passed/25))/14000);

									itm["80"] = helper.rInt(amt, max);
								}

								if(Object.keys(itm).length <= 0){
									got.push("nothing");
								}else{

									Object.keys(itm).map((a) => {
										var am = itm[a];
										var name = items[a]["name"];

										if(am > 1){
											name = (items[a].plural || items[a].name);
										}

										got.push(am.formatNumber()+" "+name);

										if(user["inv"].hasOwnProperty(a)){
											user["inv"][a] += am;
										}else{
											user["inv"][a] = am;
										}

									});
								}

								user["lasttrap"] = "";

								message.channel.sendMessage(message.author.username+" checked the trap they set "+sthms(passed)+" ago.\nThere was "+got.sort().join(", ")+" inside.");


							}else{
								message.channel.sendMessage("You don't have a trap set, "+message.author.username+".");
							}

						}else{
							message.channel.sendMessage("That's not a valid action, "+message.author.username+"!");
						}
					}else{
						message.channel.sendMessage("Sorry "+message.author.username+", but you need to be atleast level 12 to use traps.");
					}
				}else{
					message.channel.sendMessage("Please specify what you'd like to do, "+message.author.username);
				}
			}else{
				message.channel.sendMessage("Please start your adventure first, "+message.author.username);
			}
		},
		"desc": "Set traps to harvest animal products.",
		"usage": "trap ``[action]``\nPossible actions: ``set``, ``check``",
		"cooldown": 10,
		"cmsg": 5
	},
	"skills": {
		process: function(args, message, bot){
			var user = message.author;
			if(message.mentions.users.length >= 1){
				var user = message.mentions.users.array()[0];
			}


			if(!users.hasOwnProperty(user.id)){
				if(user.id == message.author.id){
					message.channel.sendMessage("Please start your adventure first, "+message.author.username);
				}else{
					message.channel.sendMessage("That user hasn't started their adventure yet, "+message.author.username);
				}
				return;
			}


			if(!users[user.id].hasOwnProperty("skills")){
				users[user.id]["skills"] = {
					"chop": {
						"level": 1,
						"xp": 0
					},
					"mine": {
						"level": 1,
						"xp": 0
					},
					"forage": {
						"level": 1,
						"xp": 0
					},
					"fish": {
						"level": 1,
						"xp": 0
					}
				};
			}

			var head = "!======== ["+bot.users.find("id", user.id).username+"'s skills] ========!";
			var msg = "```diff\n"+head+"\n";

			var skill = [];

			Object.keys(users[user.id]["skills"]).map((a) => {
				var s = users[user.id]["skills"][a];
				skill.push("+ "+helper.capFirst(a)+" Level "+s["level"].formatNumber()+" ("+s["xp"].formatNumber()+" / "+getSkillLevelUp(s["level"], a).formatNumber()+" XP)");
			});

			msg += skill.sort().join("\n");

			msg += "\n!"+"=".repeat(head.length-2)+"!\n```";
			
			message.channel.sendMessage(msg);
			saveUsers(bot, message);

		},
		"desc": "Check your skills",
		"usage": "skills ``[@user]``",
		"cooldown": 10,
		"cmsg": 5
	},
	"chop": {
		process: function(args, message, bot){
			if(users[message.author.id] != undefined){
				if(users[message.author.id]["name"] != message.author.username||users[message.author.id]["name"]==undefined){
					users[message.author.id]["name"] = message.author.username;
				}

				var ico = fix.decodeHTML(["&#x1F332;","&#x1F333;","&#x1F334;"].random())
				var msg = ico+" "+message.author.username+" Went to chop some wood ";
				var usr = users[message.author.id];
				var luck = usr["stats"]["luck"];
				var level = usr["level"];
				var user = message.author.id;



				if(usr["skills"] == undefined){
					usr["skills"] = {
						"chop": {
							"level": 1,
							"xp": 0
						},
						"mine": {
							"level": 1,
							"xp": 0
						},
						"forage": {
							"level": 1,
							"xp": 0
						},
						"fish": {
							"level": 1,
							"xp": 0
						}
					};
				}

				if(usr["skills"]["chop"] == undefined){
					usr["skills"]["chop"] = {
						"level": 1,
						"xp": 0
					};
				}

				var skillLevel = usr["skills"]["chop"]["level"];
				var str = usr["stats"]["strength"];

				if(usr.ring !== ""){
					if(items[usr.ring].ring.stat == "strength"){
						str = Math.floor(str*items[usr.ring].ring.boost);
					}else if(items[usr.ring].ring.stat == "luck"){
						luck = Math.floor(luck*items[usr.ring].ring.boost);
					}
				}

				var minXP = Math.round(Math.sqrt((Math.sqrt(level)*0.25)*helper.rInt(5, 10) / 2)),
					maxXP = Math.round(Math.sqrt((Math.sqrt(level)*0.25)*helper.rInt(10, 15) / 2));


				var minSkillXP = Math.round(Math.sqrt((Math.sqrt(skillLevel)*0.25)*helper.rInt(5, 10) / 2)),
					maxSkillXP = Math.round(Math.sqrt((Math.sqrt(skillLevel)*0.25)*helper.rInt(10, 15) / 2));

				var xp = helper.rInt(minXP, maxXP);
				var skillXP = helper.rInt(minSkillXP, maxSkillXP);
				
				var amt = 1+skillLevel+Math.floor((str/25));
				var iid = "77";

				msg += "and got "+amt+" logs, "+xp.formatNumber()+" XP and "+skillXP.formatNumber()+" skill XP.";

				var levelup = getLevelUp(level);
				var skillup = getSkillLevelUp(skillLevel, "chop");

				users[message.author.id]["xp"]+= xp;
				users[message.author.id]["skills"]["chop"]["xp"] += skillXP;

				if(users[message.author.id]["xp"] >= levelup){
					users[user]["level"]++;
					users[user]["maxhp"]+= 50;
					users[user]["hp"] = users[user]["maxhp"];
					users[user]["points"]+= 5;
					msg += "\n"+message.author.username+" Leveled up! They've been awarded with 5 attribute points, and, along with their max HP increasing by 50, they've been fully healed!";
				}

				if(users[message.author.id]["skills"]["chop"]["xp"] >= skillup){
					users[message.author.id]["skills"]["chop"]["level"]++;
					msg += "\n"+message.author.username+" Leveled up in Chopping!";
				}


				if(users[message.author.id]["inv"] == undefined){
					fixInv(message.author.id);
				}

				if(users[message.author.id]["inv"].hasOwnProperty(iid)){
					users[message.author.id]["inv"][iid]+=amt;
				}else{
					if(amt > 0){
						users[message.author.id]["inv"][iid] = amt;
					}
				}

				
				message.channel.sendMessage(msg);
				saveUsers(bot, message);
			}else{
				message.channel.sendMessage(message.author.username+", please start your adventure first!");
				return;
			}
		},
		"desc": "Chop wood.",
		"usage": "chop",
		"cooldown": 300,
		"cmsg": 30
	},
	"crack": {
		process: function(args, message, bot){
			var amt = 1;
			if(users[message.author.id] != undefined){
				var user = users[message.author.id];
				if(user["level"] >= 20){
					

					if(user["inv"].hasOwnProperty("43")){

						if(args[1] != undefined){
							if(args[1].toLowerCase() == "all"){
								amt = user["inv"]["43"];
							}else{
								var item = args.splice(1, args.length).join(" ");
								amt = Number(item.getSI());
							}
						}


						if(user["inv"]["43"] >= amt){

							if(user["inv"]["43"]-amt <= 0){
								delete user["inv"]["43"];
							}else{
								user["inv"]["43"] -= amt;
							}

							var iid = "";
							var luck = user["stats"]["luck"];

							var atm = amt;
							var ch = helper.rInt(1, 150);

							if(ch >= 1 && ch <= 50)
								iid = "42";
							if(ch >= 51 && ch <= 75){
								iid = "87";
							}else if(ch >= 76 && ch <= 100){
								iid = "88";
							}else if(ch >= 101 && ch <= 125){
								iid = "89";
							}else if(ch >=  126 && ch <= 150){
								iid = "90";
							}

							var s = atm.formatNumber();

							if(items[iid].hasOwnProperty("plural")){

								if(atm > 1){
									s += " "+items[iid].plural;
								}else{
									s += " "+items[iid].name;
								}

							}else{
								if(atm > 1){
									s += " "+items[iid].name+"s";
								}
							}
							
							if(user["inv"].hasOwnProperty(iid)){
								user["inv"][iid] += atm;
							}else{
								user["inv"][iid] = atm;
							}

							var b = message.author.username+" cracked "+amt+" geode";

							if(amt > 1){
								b += "s";
							}

							b += " and got "+s+".";

							message.channel.sendMessage(b);

							

						}else{
							message.channel.sendMessage("You don't have that many geodes, "+message.author.username+".");
						}
					}else{
						message.channel.sendMessage("You don't have any geodes, "+message.author.username+".");
					}
				}else{
					message.channel.sendMessage(message.author.username+", you need to be atleast level 20 to crack geodes.");
				}
			}else{
				message.channel.sendMessage(message.author.username+", please start your adventure first.");
			}
		},
		"desc": "Crack open geodes. Level 20 required.",
		"usage": "crack ``[amount]``",
		"cooldown": 10,
		"cmsg": 5
	},
	"rcraft": {
		process: function(args, message, bot){
			if(message.author.id == settings["owner"] || message.author.id == "120627061214806016" || message.author.id == "158049329150427136" || message.author.id == "107868153240883200"){
				crafts = "";
				delete require.cache[require.resolve('../data/crafting.json')];
				crafts = require("../data/crafting.json");
				message.channel.sendMessage("Reloaded crafting.");
			}
		},
		"desc": "Reloads crafting recipes",
		"usage": "rcraft",
		"cooldown": 10,
		"unlisted": true
	},
	"plant": {
		process: function(args, message, bot){
			if(users.hasOwnProperty(message.author.id)){
				if(args.length >= 2){
					if(users[message.author.id]["level"] >= 15){
						if(args[1].toLowerCase() == "set"){
							var user = users[message.author.id];

							if(!user.hasOwnProperty("lastplant")){
								user["lastplant"] = "";
							}

							if(user["lastplant"] != ""){
								message.channel.sendMessage("You already have a sapling planted, "+message.author.username+".");
							}else{
								
								if(user["inv"].hasOwnProperty("92")){
									var now = new Date().valueOf();

									if(user["inv"]["92"]-1 <= 0){
										delete user["inv"]["92"];
									}else{
										user["inv"]["92"]--;
									}

									user["lastplant"] = now.toString();

									message.channel.sendMessage(message.author.username+" planted a sapling.");

								}else{
									message.channel.sendMessage("You need a "+items["92"].name+" in order to plant.");
								}
							}


						}else if(args[1].toLowerCase() == "check"){

							var user = users[message.author.id];

							if(!user.hasOwnProperty("lastplant")){
								user["lastplant"] = "";
							}

							if(user["lastplant"] != ""){

								var now = new Date().valueOf();
								var plant = Number(user["lastplant"]);
								var passed = Math.floor((now-plant)/1000);
								var luck = user["stats"]["luck"];

								var itm = {};
								var got = [];

								if(passed >= 300){

									var amt = 1+Math.floor((luck*(passed/25))/15000);
									var max = 1+Math.floor((luck*(passed/25))/14000);

									itm[['67', '68', '69', '71', '93'].random()] = helper.rInt(amt, max);
								}
								

								if(Object.keys(itm).length <= 0){
									got.push("nothing");
								}else{

									Object.keys(itm).map((a) => {
										var am = itm[a];
										var name = items[a]["name"];

										if(am > 1 && itm['67']!=undefined){
											name = "Bundles of "+name;
										}else if(am > 1){
											name += "s";
										}

										got.push(am+" "+name);

										if(user["inv"].hasOwnProperty(a)){
											user["inv"][a] += am;
										}else{
											user["inv"][a] = am;
										}

									});
								}

								user["lastplant"] = "";

								saveUsers(bot, message);
								message.channel.sendMessage(message.author.username+" checked the sapling they set "+sthms(passed)+" ago.\nThere was "+got.sort().join(", ")+" leftover.");
							}else{
								message.channel.sendMessage("You don't have a sapling planted, "+message.author.username+".");
							}

						}else{
							message.channel.sendMessage("That's not a valid action, "+message.author.username+"!");
						}
					}else{
						message.channel.sendMessage("Sorry "+message.author.username+", but you need to be atleast level 15 to plant trees.");
					}
				}else{
					message.channel.sendMessage("Please specify what you'd like to do, "+message.author.username);
				}
			}else{
				message.channel.sendMessage("Please start your adventure first, "+message.author.username);
			}
		},
		"desc": "Plant saplings to harvest fruits and crops.",
		"usage": "plant ``[action]``\nPossible actions: ``set``, ``check``",
		"cooldown": 10,
		"cmsg": 5
	},
	"inv": {
		process: function(args, message, bot){
			if(users[message.author.id] != undefined){

				fixInv(message.author.id);
				var uid = message.author.id;

				if(message.mentions.length >= 1){
					uid = message.mentions[0].id;
					if(users[uid] == undefined){
						message.channel.sendMessage("That user hasn't started their adventure, "+message.author.username);
						return;
					}
				}

				var it = users[uid]["inv"];
				var itms = [];

				var p = 1;
				var ipp = 15; // Items Per Page

				if(args.length >= 2){
					if(message.mentions.length >= 1){
						if(args.length >= 3){
							if(Number(args[2])){
								p = Number(args[2]);

								if(p < 1){
									p = 1;
								}

								if(p > Math.ceil(Object.keys(it).length/ipp)){
									p = Math.ceil(Object.keys(it).length/ipp);
								}
							}
						}
					}else{
						if(Number(args[1])){
							p = Number(args[1]);

							if(p < 1){
								p = 1;
							}

							if(p > Math.ceil(Object.keys(it).length/ipp)){
								p = Math.ceil(Object.keys(it).length/ipp);
							}
						}
					}
				}

				if(Object.keys(it).length >= 1){

					itms.push("+ "+users[uid]["gold"].formatNumber()+" Gold.");

					Object.keys(it).map((a) => {

						if(it[a] <= 0 || it[a] === null || items[a] == undefined){
							delete users[uid]["inv"][a];
						}else{

							var ps = "";

							if(it[a] > 1){
								ps = "+ "+it[a].formatNumber()+" x "+(items[a].plural || items[a].name);
							}else{
								ps = "+ "+it[a].formatNumber()+" x "+items[a].name;
							}

							if(itms.indexOf(ps) == -1){
								itms.push(ps);
							}
						}
					});
				}else{
					itms.push("+ {} Gold.".format(users[uid].gold.formatNumber()));
					itms.push("+ 3 x Flies");
				}

				var sets = {};
				var set = [];
				var setCounter = 0;

				itms.map((a, b) => {
					set.push(a);
					if((b+1) % ipp == 0 || (b+1) >= itms.length){
						setCounter++;
						sets['set'+setCounter] = set;
						set = [];
					}
				});

				var head = "! ===== ["+bot.users.find("id", uid).username+"'s inventory (Page "+p+"/"+Math.ceil(Object.keys(itms).length/ipp)+")] ===== !";
				var msg = "```diff\n"+head+"\n";

				msg += sets['set'+p].join("\n");

				msg+= "\n!"+"=".repeat(head.length-4)+"!```";
				message.channel.sendMessage(msg);

			}else{
				message.channel.sendMessage("Please start your adventure first, "+message.author.username);
			}
		},
		"desc": "Check your inventory",
		"usage": "inv ``[page]``",
		"cooldown": 10,
		"cmsg": 5
	},
	// GLOBAL MARKET SHIZZ \\
	"gmsell": {
		process: function(args, message, bot){
			if(users[message.author.id] != undefined){
				if(args.length >= 4){
					var item = args.splice(1, args.length).join(" ").replace(/\s*$/, "");
					var amt = 1;
					var price = 1;
					var found = false;
					var itm = "";

					var matches = item.match(/\d+/g);

					if(matches){
						if(matches.length >= 2){
							if(Number(matches[0])){
								amt = Number(matches[0]);
								if(Number(matches[1])){
									price = Number(matches[1]);

									item = item.replace(/\d+/g, "").replace(/\s*$/, "");

									Object.keys(items).map((a) => {
										if(item.toLowerCase() == items[a]["name"].toLowerCase()){
											itm = a;
											found = true;
										}
									});

									if(item.toLowerCase() == "gold"){
										message.channel.sendMessage("You can't sell money, "+message.author.username);
										return;
									}

									if(!found){

										var uitems = [];

										Object.keys(users[message.author.id]["inv"]).map((a) => {
											var n = items[a]["name"];
											if(uitems.indexOf(n) == -1){
												uitems.push(n);
											}
										});

										var results = filter.filter(uitems, item.toLowerCase());

										if(results.length > 0 && !found){
											var itmFound = [];
											var msg = "";
											msg+= "Found "+results.length+" items.\n";

											results.map((a) => {
												itmFound.push("``"+a+"``");
											});

											found = true;

											msg+= itmFound.sort().join(", ");
											message.channel.sendMessage(msg);
											return;
										}

										if(results.length <= 0 && !found){
											message.channel.sendMessage(message.author.username+" tried to sell an unknown item!");
											return;
										}

									}else{

										var inv = users[message.author.id]["inv"];

										if(inv.hasOwnProperty(itm)){

											if(items[itm]["tradable"] == undefined){
												items[itm]["tradable"] = true;
											}else{
												if(items[itm]["tradable"] == false){
													found = true;
													message.channel.sendMessage("You can't trade that item, "+message.author.username);
													return;
												}
											}

											if(inv[itm] >= amt){

												var uTrade = 0;

												Object.keys(trades).map((a) => {
													if(trades[a]["from"] == message.author.id){
														var sll = trades[a]["sell"]["item"][Object.keys(trades[a]["sell"]["item"])[0]];
														var sold = trades[a]["sold"];
														if(sold != sll){
															uTrade++;
														}
													}
												});

												if(uTrade < 5){

													if(inv[itm]-amt <= 0){
														delete inv[itm];
													}else{
														inv[itm] -= amt;
													}

													var now = new Date().valueOf();
													var tID = now.toString(36);

													var x = {
														"from": message.author.id,
														"sell": {
															"price": price,
															"item": {

															}
														},
														"sold": 0,
														"created": now
													};

													x["sell"]["item"][itm] = amt;

													trades[tID] = x;

													var nm = "";

													if(amt > 1){
														nm = (items[itm].plural || items[itm].name);
													}else{
														nm = items[itm].name;
													}

													message.channel.sendMessage(message.author.username+" put "+amt.formatNumber()+" "+nm+" for sale at "+price.formatNumber()+" gold each. (Trade ID: ``"+tID+"``)");
													saveTrades(bot, message);
												}else{
													message.channel.sendMessage("Sorry, {}, but you can only have {} active trades.".format(message.author.username, "5"));
												}
											}else{

												var nm = "";

												if(amt > 1){
													nm = (items[itm].plural || items[itm].name);
												}else{
													nm = items[itm].name;
												}


												message.channel.sendMessage(message.author.username+" tried to sell "+amt.formatNumber()+" "+nm+", but only has "+inv[itm].formatNumber());
												return;
											}
										}else{
											message.channel.sendMessage("You can't sell something you don't have, "+message.author.username);
										}
									}

								}else{
									message.channel.sendMessage("That's not a valid number, "+message.author.username);
								}
							}else{
								message.channel.sendMessage("That's not a valid number, "+message.author.username);
							}
						}else{
							message.channel.sendMessage("You need to specify the amount of items you want to sell aswell as the price per item.");
						}
					}else{
						message.channel.sendMessage("You need to specify the amount of items you want to sell aswell as the price per item.");
					}
				}else{
					message.channel.sendMessage("You did something wrong, "+message.author.username);
				}
			}else{
				message.channel.sendMessage("Please start your adventure first, "+message.author.username);
			}
		},
		"desc": "Puts a trade up on the global market",
		"usage": "gmsell ``item`` ``amount`` ``price per item``",
		"cooldown": 25,
		"cmsg": 10
	},
	"gmstop": {
		process: function(args, message, bot){
			if(users[message.author.id] != undefined){
				if(args.length >= 2){
					var id = args[1].toLowerCase();
					if(trades[id] != undefined){
						var trade = trades[id];
						let res = "";

						if(trade["from"] == message.author.id || message.author.id == "141610251299454976"){
							if(trade["sold"] >= 1){
								var sold = trade["sold"];
								var price = trade["sell"]["price"];
								var itm = Object.keys(trade["sell"]["item"])[0];
								var sll = trade["sell"]["item"][itm];

								var gold = sold*price;

								res += gold.formatNumber()+" gold";

								var msg = message.author.username+" Stopped trade "+id+". Results: ";

								if(message.author.id == "141610251299454976"){
									users[trade.from].gold += gold;
								}else{
									users[message.author.id]["gold"] += gold;
								}

								if(sold < sll){
									// Items left

									var left = (sll-sold)

									var nm = items[itm].name;

									if(left > 1){
										nm = (items[itm].plural || items[itm].name);
									}

									res += " and "+(sll-sold).formatNumber()+" "+nm;

									if(message.author.id == "141610251299454976"){
										if(users[trade.from]["inv"].hasOwnProperty(itm)){
											users[trade.from]["inv"][itm] += left;
										}else{
											users[trade.from]["inv"][itm] = left;
										}
									}else{
										if(users[message.author.id]["inv"].hasOwnProperty(itm)){
											users[message.author.id]["inv"][itm] += left;
										}else{
											users[message.author.id]["inv"][itm] = left;
										}
									}

								}

								msg += res+".";

								delete trades[id];

								message.channel.sendMessage(msg);

								if(message.author.id == "141610251299454976"){
									bot.users.find("id", trade.from).sendMessage("Your trade ``{}`` was ended. Result: {}".format(id, res));
								}

								saveTrades(bot, message);


							}else{

								var sold = trade["sold"];
								var itm = Object.keys(trade["sell"]["item"])[0];
								var sll = trade["sell"]["item"][itm];

								var msg = message.author.username+" Stopped trade "+id+". Results: ";

								if(sold < sll){
									// Items left

									var left = (sll-sold)

									var nm = "";

									if(left > 1){
										nm = (items[itm].plural || items[itm].name);
									}else{
										nm = items[itm].name;
									}


									res += (sll-sold).formatNumber()+" "+nm;

									if(message.author.id == "141610251299454976"){
										if(users[trade.from]["inv"].hasOwnProperty(itm)){
											users[trade.from]["inv"][itm] += left;
										}else{
											users[trade.from]["inv"][itm] = left;
										}
									}else{
										if(users[message.author.id]["inv"].hasOwnProperty(itm)){
											users[message.author.id]["inv"][itm] += left;
										}else{
											users[message.author.id]["inv"][itm] = left;
										}
									}

								}

								msg += res+".";

								delete trades[id];

								message.channel.sendMessage(msg);

								if(message.author.id == "141610251299454976"){
									bot.users.get("id", trade.from).sendMessage("Your trade ``{}`` was ended. Results: {}".format(id, res));
								}

								saveTrades(bot, message);
							}
						}else{
							message.channel.sendMessage("You don't own that trade, "+message.author.username);
						}

					}else{
						message.channel.sendMessage("Invalid trade ID, "+message.author.username);
					}
				}else{
					message.channel.sendMessage("Please tell me the trade ID, "+message.author.username);
				}
			}else{
				message.channel.sendMessage(message.author.username+", please start your adventure first.");
			}
		},
		"desc": "Stops an active trade",
		"usage": "gmstop ``trade ID``",
		"cooldown": 25,
		"cmsg": 10
	},
	"gmsearch": {
		process: function(args, message, bot){
			if(args.length >= 2){
				var p = 1;
				var item = args.splice(1, args.length).join(" ").replace(/\s*$/, "");

				var matches = item.match(/\d+$/);

				if(matches){
					if(Number(matches[0])){
						p = Number(matches[0]);
						if(p <= 0){
							p = 1;
						}
						item = item.replace(/\d+$/, "").replace(/\s*$/, "");
					}
				}

				var found = false;
				var id = "";


				var results = filter.filter(itmObj, item.toLowerCase(),{key: "name"});

				Object.keys(items).map((a) => {
					if(item.toLowerCase() == items[a]["name"].toLowerCase()){
						id = a;
						found = true;
					}
				});

				if(found){

					var t = [];

					Object.keys(trades).map((a) => {
						var x = {
							"item": Object.keys(trades[a]["sell"]["item"])[0],
							"id": a
						}
						t.push(x);
					});

					//console.dir(t);

					var results = filter.filter(t, id,{key: "item"});

					if(results.length > 0){

						var x = [];

						var p = 1;
						var ipp = 15;

						results.map((a) => {

							var trade = trades[a["id"]];

							var name = items[a["item"]]["name"];

							var sold = trade["sold"];
							var itm = Object.keys(trade["sell"]["item"])[0];
							var sll = trade["sell"]["item"][itm];
							var price = trade["sell"]["price"];

							if(sll != sold){

								if(items[itm].hasOwnProperty("plural")){

									if(sll > 1){
										name = items[itm].plural;
									}else{
										name = items[itm].name;
									}

								}else{

									if(sll > 1 && !name.endsWith("s")){
										name += "s";
									}
								}

								x.push("+ "+(sll-sold).formatNumber()+" "+name+" ("+price.formatNumber()+"G each) {ID. "+a["id"]+"}");
							}
						});

						var head = "! ===== [Trades (Page "+p+"/"+Math.ceil(Object.keys(x).length/ipp)+")] ===== !";
						var msg = "```diff\n"+head+"\n";
					
						var sets = {};
						var set = [];
						var setCounter = 0;

						x.map((a, b) => {
							set.push(a);
							if((b+1) % ipp == 0 || (b+1) >= x.length){
								setCounter++;
								sets['set'+setCounter] = set;
								set = [];
							}
						});

						if(p > Math.ceil(Object.keys(x).length/ipp)){
							p = Math.ceil(Object.keys(x).length/ipp);
						}

						if(sets["set"+p] == undefined){
							message.channel.sendMessage("No trades were found, "+message.author.username);
							return;
						}

						msg += sets["set"+p].join("\n");

						msg+= "\n!"+"=".repeat(head.length-4)+"!```";
						message.channel.sendMessage(msg);

					}else{
						message.channel.sendMessage("No trades were found, "+message.author.username);
					}

				}

				if(results.length > 0 && !found){

					var p = [];

					results.map((a) => {
						p.push("``"+a["name"]+"``");
					});

					message.channel.sendMessage("Found "+results.length+" items.\n"+p.join(", "));
				}else if(results.length <= 0 && !found){
					message.channel.sendMessage(message.author.username+" tried to search for an unknown item.");
					return;
				}


			}else{
				message.channel.sendMessage("Please specify the item you'd like to search for, "+message.author.username);
			}
		},
		"desc": "Searches for trades on the global market",
		"usage": "gmsearch ``item`` ``[page]``",
		"cooldown": 25,
		"cmsg": 10
	},
	"gmbuy": {
		process: function(args, message, bot){
			if(users[message.author.id] != undefined){
				if(args.length >= 2){

					var amt = 0;
					var id = args[1].toLowerCase();

					var matches = args.splice(1, args.length).join(" ").replace(/\s*$/, "").match(/\d+$/);

					if(matches != undefined){
						if(Number(matches[0])){
							amt = Number(matches[0]);
						}
					}

					if(trades[id] != undefined){

						var trade = trades[id];
						var item = Object.keys(trade["sell"]["item"])[0];
						var price = trade["sell"]["price"];
						var sll = trade["sell"]["item"][item];
						var name = items[item]["name"];
						var sold = trade["sold"];

						if(amt == 0){
							amt = (sll-sold);
						}

						if(amt > (sll-sold)){
							amt = (sll-sold);
						}

						if(items[item].hasOwnProperty("plural")){

							if(amt > 1){
								name = items[item].plural;
							}else{
								name = items[item].name;
							}

						}else{

							if(amt > 1 && !name.endsWith("s")){
								name += "s";
							}
						}

						if(sold == sll){
							return;
						}

						if(users[message.author.id]["gold"] >= (amt*price)){
							users[message.author.id]["gold"] -= (amt*price);

							if(users[message.author.id]["inv"][item] != undefined){
								users[message.author.id]["inv"][item] += amt;
							}else{
								users[message.author.id]["inv"][item] = amt;
							}

							trades[id]["sold"] += amt;

							message.channel.sendMessage(message.author.username+" executed trade ``"+id+"`` ("+amt.formatNumber()+" "+name+" at "+price.formatNumber()+" Gold each)");
							
							if(trades[id]["sold"] == sll){

								bot.users.find("id", trade.from).sendMessage("Trade ``"+id+"`` finished. (Buyer: "+message.author.username+")");
							}else{
								bot.users.find("id", trade.from).sendMessage("Trade ``"+id+"`` updated. ("+message.author.username+" bought "+amt.formatNumber()+" "+name+")");
							}

							saveTrades(bot, message);
							saveUsers(bot, message);

						}else{
							message.channel.sendMessage("You don't have enough gold, "+message.author.username);
						}


					}else{
						message.channel.sendMessage("Unknown trade, "+message.author.username);
					}

				}else{
					message.channel.sendMessage("Please tell me what trade you'd like to execute, "+message.author.username+".");
				}
			}else{
				message.channel.sendMessage(message.author.username+", please start your adventure first.");
			}
		},
		"desc": "Executes a trade on the global market",
		"usage": "gmbuy ``trade id`` ``[amount]``",
		"cooldown": 25,
		"cmsg": 10
	},
	"gmlist": {
		process: function(args, message, bot){
			if(users[message.author.id] != undefined){

				var p = 1;
				var ipp = 15;

				if(args.length >= 2){
					if(Number(args[1])){
						p = Number(args[1]);
						if(p < 1){
							p = 1;
						}
					}
				}

				var trd = [];

				Object.keys(trades).map((a) => {
					if(trades[a]["from"] == message.author.id){

						var trade = trades[a];

						

						var sold = trade["sold"];
						var itm = Object.keys(trade["sell"]["item"])[0];
						var sll = trade["sell"]["item"][itm];
						var name = items[itm]["name"];
						var price = trade["sell"]["price"];

						if(sll != sold){

							if(items[itm].hasOwnProperty("plural")){

								if(sll > 1){
									name = items[itm].plural;
								}else{
									name = items[itm].name;
								}

							}else{

								if(sll > 1 && !name.endsWith("s")){
									name += "s";
								}
							}

							trd.push("+ "+(sll-sold).formatNumber()+" "+name+" ("+price.formatNumber()+"G each) {ID. "+a+"}");
						}else{
							if(items[itm].hasOwnProperty("plural")){

								if(sll > 1){
									name = items[itm].plural;
								}else{
									name = items[itm].name;
								}

							}else{

								if(sll > 1 && !name.endsWith("s")){
									name += "s";
								}
							}
							trd.push("- "+sll.formatNumber()+" "+name+" ("+price.formatNumber()+"G each) {ID. "+a+"}");
						}
					}
				});

				var head = "! ===== ["+message.author.username+"'s trades (Page "+p+"/"+Math.ceil(trd.length/ipp)+")] ===== !";
				var msg = "```diff\n"+head+"\n";
			
				var sets = {};
				var set = [];
				var setCounter = 0;

				trd.map((a, b) => {
					set.push(a);
					if((b+1) % ipp == 0 || (b+1) >= trd.length){
						setCounter++;
						sets['set'+setCounter] = set;
						set = [];
					}
				});

				if(p > Math.ceil(Object.keys(trd).length/ipp)){
					p = Math.ceil(Object.keys(trd).length/ipp);
				}

				if(sets["set"+p] == undefined){
					message.channel.sendMessage("No trades were found, "+message.author.username);
					return;
				}

				msg += sets["set"+p].join("\n");

				msg+= "\n!"+"=".repeat(head.length-4)+"!```";
				message.channel.sendMessage(msg);


			}else{
				message.channel.sendMessage(message.author.username+", please start your adventure first.");
			}
		},
		"desc": "Lists your trades.",
		"usage": "gmlist ``[page]``",
		"cooldown": 25,
		"cmsg": 10
	},
	"gmglist": {
		process: function(args, message, bot){
			let p = 1;
			let ipp = 15;

			if(args.length >= 2){
				if(Number(args[1])){
					p = Number(args[1]);
					if(p < 1){
						p = 1;
					}
				}
			}

			let trd = [];

			Object.keys(trades).map((a) => {

				let trade = trades[a];

				if(trade != null && trade != undefined){

					let sold = trade["sold"];
					let itm = Object.keys(trade["sell"]["item"])[0];
					let sll = trade["sell"]["item"][itm];
					let name = items[itm]["name"];
					let price = trade["sell"]["price"];

					if(sll != sold){

						if(items[itm].hasOwnProperty("plural")){
							if(sll > 1){
								name = items[itm].plural;
							}else{
								name = items[itm].name;
							}
						}else{
							if(sll > 1 && !name.endsWith("s")){
								name += "s";
							}
						}

						if(sll == null || price == null){
							delete trades[a];
						}else{
							trd.push("+ "+sll.formatNumber()+" "+name+" ("+price.formatNumber()+"G each) {ID. "+a+"}");
						}
					}
				}
			});

			let head = "! ===== ["+"Global Trades (Page "+p+"/"+Math.ceil(trd.length/ipp)+")] ===== !";
			let msg = "```diff\n"+head+"\n";
		
			let sets = {};
			let set = [];
			let setCounter = 0;

			trd.map((a, b) => {
				set.push(a);
				if((b+1) % ipp == 0 || (b+1) >= trd.length){
					setCounter++;
					sets['set'+setCounter] = set;
					set = [];
				}
			});

			if(p > Math.ceil(Object.keys(trd).length/ipp)){
				p = Math.ceil(Object.keys(trd).length/ipp);
			}

			if(sets["set"+p] == undefined){
				message.channel.sendMessage("No trades were found, "+message.author.username);
				return;
			}

			msg += sets["set"+p].join("\n");

			msg+= "\n!"+"=".repeat(head.length-4)+"!```";
			message.channel.sendMessage(msg);
		},
		"desc": "Lists all trades.",
		"usage": "gmglist ``[page]``",
		"cooldown": 25,
		"cmsg": 10
	},
	"gminfo": {
		process: function(args, message, bot){
			if(args.length >= 2){
				let id = args[1].toLowerCase();
				if(trades[id] != undefined){
					message.channel.sendMessage("http://api.discorddungeons.me/etrade/"+id+"?r="+helper.rInt(minCache, maxCache));
				}else{
					message.channel.sendMessage("Unknown trade, "+message.author.username);
				}
			}
		},
		"desc": "Shows info about a trade",
		"usage": "gminfo ``trade id``",
		"cooldown": 25,
		"cmsg": 10
	},
	"fish": {
		process: function(args, message, bot){
			if(users.hasOwnProperty(message.author.id)){ // If the user exists
				if(users[message.author.id].level >= 5){ // If they're over level 5

					if(users[message.author.id].inv.hasOwnProperty("136")){
						let user = users[message.author.id]; // Get the user into a variable

						if(user["skills"]["fish"] == undefined){ // If skill fish isn't there
							user["skills"]["fish"] = { // Add it
								"level": 1,
								"xp": 0
							};
						}

						let skillLevel = user["skills"]["fish"]["level"];

						let minSkillXP = Math.round(Math.sqrt((Math.sqrt(skillLevel)*0.25)*helper.rInt(5, 10) / 2)),
							maxSkillXP = Math.round(Math.sqrt((Math.sqrt(skillLevel)*0.25)*helper.rInt(10, 15) / 2));

						let skillXP = helper.rInt(minSkillXP, maxSkillXP);

						let itm = [undefined,undefined,undefined,undefined,undefined,'74','75','74','75','74','75','74','75','76','76','76','82','84','84','84','85','83'].random()
						if(itm!=undefined){
							if(user["inv"].hasOwnProperty(itm)){
								user["inv"][itm] += 1;
							}else{
								user["inv"][itm] = 1;
							}

							let skillup = getSkillLevelUp(skillLevel, "fish");
							users[message.author.id]["skills"]["fish"]["xp"] += skillXP;



							let msg = fix.decodeHTML("&#x1F3A3;")+" "+message.author.username+" caught a "+items[itm].name+" and got "+skillXP.formatNumber()+" skill XP!";

							if(users[message.author.id]["skills"]["fish"]["xp"] >= skillup){
								users[message.author.id]["skills"]["fish"]["level"]++;
								msg += "\n"+message.author.username+" Leveled up in Fishing!";
							}

							saveUsers(bot, message);
							message.channel.sendMessage(msg);
						}else{
							message.channel.sendMessage(fix.decodeHTML("&#x1F3A3;")+" "+[message.author.username+" caught nothing...",message.author.username+" caught something that ran away..."].random());
						}
					}else{
						message.channel.sendMessage("You need a {} to catch fish, {}.".format(items["136"].name, message.author.username));
					}

					
				}else{
					message.channel.sendMessage("Sorry "+message.author.username+", but you need to be atleast level 5 to fish.");
				}
			}else{
				message.channel.sendMessage("Please start your adventure first, "+message.author.username);
			}
		},
		"desc": "Fish for crabs, octopus and... fish...",
		"usage": "fish",
		"cooldown": 300,
		"cmsg": 30
	},
	"addcraft": {
		process: function(args, message, bot){
			if(message.author.id == settings["owner"] || message.author.id == "120627061214806016" || message.author.id == "158049329150427136" || message.author.id == "107868153240883200"){
				if(args.length >= 5){
					let itm = {};
					let s = args.join(" ");
					let id = s.match(/id:\d+/)[0].replace(/id:/g, "");
					let amt = s.match(/amt:\d+/)[0].replace(/amt:/g, "");
					let level = s.match(/lvl:\d+/)[0].replace(/lvl:/g, "");

					itm["amount"] = Number(amt);
					itm["level"] = Number(level);
					itm["items"] = {};

					s.match(/\d+:\d+/g).map((a) => { 
						let x = a.split(":");
						itm["items"][x[0]] = Number(x[1]);
					});

					crafts[id] = itm;
					message.channel.sendMessage("Added recipe for item "+id);
					saveCrafts();
				}
			}
		},
		"desc": "Adds a crafting recipe",
		"usage": "addcraft id:[itemID] amt:[AmountReturn] [recitem1:amount,recitem2:amount] lvl:[levelreq]",
		"unlisted": true,
		"cooldown": 0
	},
	"link": {
		process: function(args, message, bot){
			linkSend(message, bot);
		},
		"desc": "Sends a link code to use with the app.",
		"usage": "link",
		"cooldown": 60,
		"cmsg": 10
	},
	"app": {
		process: function(args, message, bot){
			message.channel.sendMessage("The official Discord Dungeons app can be found at https://play.google.com/store/apps/details?id=me.discorddungeons.discorddungeonscompanion");
		},
		"desc": "Sends a link to the official app page on Google Play",
		"usage": "app",
		"cooldown": 30,
		"cmsg": 10
	},
	"rules": {
		process: function(args, message, bot){
			var msg = "Using any kind of automated means in order to send commands to DiscordRPG is strictly forbidden and doing so will result in you getting your character reset, and/or a ban from the bot.\nCopy-Pasting the commands are allowed, just don't spam them.\nLike, really. Don't spam the commands.\nBreaking any of these will result in a ignore from the bot.";
			message.channel.sendMessage(msg);
		},
		"desc": "Sends the rules of DRPG",
		"usage": "rules",
		"cooldown": 10,
		"cmsg": 5
	},
	"uset": {
		process: function(args, message, bot){
			if(args.length >= 3){
				let vari = args[1];
				let val = args[2];
				let user = users[message.author.id];

				switch(vari.toLowerCase()){
					case 'nick':
						if(val == 0 || val == 1 || val == 2 || val == 3){
							users[message.author.id].nick = val;
							message.channel.sendMessage("Changed nickname format of "+message.author.username+" to "+val);
							setNick(message, bot);
							saveUsers(bot, message);
						}else{
							message.channel.sendMessage("Sorry, "+message.author.username+", but that's an invalid value.");
						}
					break;
					case 'petname':
						if(user.pet != undefined && user.pet != ""){

							let name = args.splice(2, args.length).join(" ");

							if(name == "" || name == " "){
								message.channel.sendMessage("You can't name your pet nothing, {}.".format(message.author.username));
							}else{
								user.pet.name = name;
								message.channel.sendMessage("{} renamed their pet to {}".format(message.author.username, name));
								saveUsers();
							}
						}else{
							message.channel.sendMessage("You don't have a pet to rename, {}.".format(message.author.username));
						}
					break;
					default:
						message.channel.sendMessage( "Sorry, "+message.author.username+", but that's an invalid variable.");
					break;
				}
			}else{
				message.channel.sendMessage("Please tell me what you'd like to change, {}.".format(message.author.username));
			}
		},
		"desc": "Sets user variables\nPossible variables: ``nick [0-3]``, ``petname <name>``",
		"usage": "uset ``variable`` ``value``",
		"cooldown": 10,
		"cmsg": 5
	},
	"quest": {
		process: function(args, message, bot){
			if(args.length >= 2){
				if(users.hasOwnProperty(message.author.id)){
					if(users[message.author.id].level >= 15){
						let action = args[1].toLowerCase();
						let user = users[message.author.id];

						let prefix = settings["prefix"]["main"];

						if(message.channel.type === "text"){
							if(servers.hasOwnProperty(message.guild.id)){
								prefix = (servers[message.guild.id].prefix || "#!");
							}
						}

						if(action == "get"){
							if(user.quest == undefined || user.quest == ""){
								let q = getQuest(message.author.id);

								let n = items[q.item].name;

								if(q.amt > 1){
									n = (items[q.item].plural || items[q.item].name);
								}

								message.channel.sendMessage("{} says they want {} {}, {}. You'll recieve {} gold and {} XP.\nType ``{}quest accept`` to accept or ``{}quest decline`` to decline.".format(q.name, q.amt.formatNumber(), n, message.author.username, q.rewards.gold.formatNumber(), q.rewards.xp.formatNumber(), prefix, prefix));
								user.quest = q;
							}else{
								message.channel.sendMessage("You already have a quest, {}. Type ``{}quest accept`` to accept or ``{}quest decline`` to decline the quest.".format(message.author.username, prefix, prefix));
							}
						}else if(action == "complete"){
							if(user.quest != undefined && user.quest != ""){
								if(user.quest.accept){
									if(user.quest.item in user.inv){
										if(user.inv[user.quest.item] >= user.quest.amt){
											if(user.inv - user.quest.amt <= 0){
												delete user.inv[user.quest.item];
											}else{
												user.inv[user.quest.item] -= user.quest.amt;
											}

											user.gold += user.quest.rewards.gold;
											user.xp += user.quest.rewards.xp;

											let n = items[user.quest.item].name;

											if(user.quest.amt > 1){
												n = (items[user.quest.item].plural || items[user.quest.item].name);
											}

											let msg = "{} delivered {} {} to {} and got {} gold aswell as {} XP.".format(message.author.username, user.quest.amt.formatNumber(), n, user.quest.name, user.quest.rewards.gold.formatNumber(), user.quest.rewards.xp.formatNumber());

											let levelup = getLevelUp(user.level);

											if(user.xp >= levelup){
												user.level++;
												user.maxhp += 50;
												user.hp = user.maxhp;
												user.points += 5;
												msg += "\n"+message.author.username+" Leveled up! They've been awarded with 5 attribute points, and along with their max HP increasing by 50, they've been fully healed!";
											}

											message.channel.sendMessage(msg);

											user.quest = "";
											saveUsers(bot, message);

										}else{
											message.channel.sendMessage("You don't have the required items to complete this quest, {}.".format(message.author.username));
										}
									}else{
										message.channel.sendMessage("You don't have the required items to complete this quest, {}.".format(message.author.username));
									}
								}else{
									message.channel.sendMessage("You don't have a quest to complete, {}.".format(message.author.username));
								}
							}else{
								message.channel.sendMessage("You don't have a quest to complete, {}.".format(message.author.username));
							}
						}else if(action == "accept"){
							if(user.quest != undefined && user.quest != ""){
								if(user.quest.accept){
									message.channel.sendMessage("You've already accepted the quest, {}.".format(message.author.username));
								}else{
									message.channel.sendMessage("You accepted the quest, {}.".format(message.author.username));
									user.quest.accept = true;
								}
							}else{
								message.channel.sendMessage("You don't have a quest to accept, {}.".format(message.author.username));
							}
						}else if(action == "decline"){
							if(user.quest != undefined && user.quest != ""){
								user.quest = "";
								message.channel.sendMessage("You declined the quest, {}.".format(message.author.username));
							}else{
								message.channel.sendMessage("You don't have a quest to decline, {}.".format(message.author.username));
							}
						}else{
							message.channel.sendMessage("That's an invalid action, "+message.author.username);
						}
					}else{
						message.channel.sendMessage("Sorry, {}, but you need to be level {} to recieve a quest.".format(message.author.username, "15"));
					}
				}else{
					message.channel.sendMessage("You need to start your adventure before receiving a quest, "+message.author.username);
				}
			}else{
				if(users.hasOwnProperty(message.author.id)){
					if(users[message.author.id].level >= 15){
						let user = users[message.author.id];
						if(user.quest != undefined && user.quest != "" && user.quest != null){

							if(user.quest.accept){

								let n = items[user.quest.item].name;

								if(user.quest.amt > 1){
									n = (items[user.quest.item].plural || items[user.quest.item].name);
								}

								message.channel.sendMessage("Deliver {} {} to {}. You'll recieve {} gold and {} XP.".format(user.quest.amt.formatNumber(), n, user.quest.name, user.quest.rewards.gold.formatNumber(), user.quest.rewards.xp.formatNumber()));
							}else{

								let n = items[user.quest.item].name;

								if(user.quest.amt > 1){
									n = (items[user.quest.item].plural || items[user.quest.item].name);
								}

								let prefix = settings["prefix"]["main"];

								if(message.channel.type === "text"){
									if(servers.hasOwnProperty(message.guild.id)){
										prefix = (servers[message.guild.id].prefix || "#!");
									}
								}

								message.channel.sendMessage("You have an unaccepted quest, {}.\nDeliver {} {} to {}. Rewards: {} gold and {} XP.\nType ``{}quest accept`` to accept it or ``{}quest decline`` to decline.".format(message.author.username, user.quest.amt.formatNumber(), n, user.quest.name, user.quest.rewards.gold.formatNumber(), user.quest.rewards.xp.formatNumber(), prefix, prefix));
							}
						}else{
							message.channel.sendMessage("You don't have a quest, {}.".format(message.author.username));
						}
					}else{
						message.channel.sendMessage("Sorry, {}, but you need to be level {} to recieve a quest.".format(message.author.username, "15"));
					}
				}else{
					message.channel.sendMessage("You need to start your adventure before receiving a quest, "+message.author.username);
				}
			}
		},
		"desc": "Gives the user quests",
		"usage": "quest [``get`` / ``complete``]",
		"cooldown": 10,
		"cmsg": 5
	},
	"pet": {
		process: function(args, message, bot){
			if(message.author.id in users){
				if(users[message.author.id].pet == undefined || users[message.author.id].pet.hp == undefined || users[message.author.id].pet.maxhp == undefined || users[message.author.id].pet.damage == undefined){
					let pt = {
						name: "Pet Rock",
						hp: 0,
						maxhp: 0,
						type: "rock",
						level: 0,
						damage: {
							min: 0,
							max: 0
						}
					};
					users[message.author.id].pet = pt;
					saveUsers();
				}
				let pet = users[message.author.id].pet;
				let head = "!======[ {} ]======!".format(pet.name);
			
				let level = "Unknown";

				if(pet.level != undefined){
					level = pet.level.formatNumber();
				}

				let body = "```diff\n"+head+"\n+ {}/{} HP\n+ {}-{} Damage\n+ Owner: {}\n+ Type: {}\n+ Level: {}\n".format(pet.hp.formatNumber(), pet.maxhp.formatNumber(), pet.damage.min.formatNumber(), pet.damage.max.formatNumber(), message.author.username, pet.type.capFirst(), level);
				

				let msg = body+"!"+"=".repeat(head.length-2)+"!\n```";
				message.channel.sendMessage(msg);
			}
		},
		"desc": "Shows pet info",
		"usage": "pet",
		"cooldown": 10,
		"cmsg": 5
	},
	"code": {
		process: function(args, message, bot){
			if(args[0] != undefined){
				if(args[0] == "↑↑↓↓←→←→BA"){
					message.channel.sendMessage("wew lad");
				}
			}
		},
		"desc": "???",
		"usage": "???",
		"cooldown": 60,
		"cmsg": 10,
		"unlisted": true
	},
	"catch": {
		process: function(args, message, bot){
			if(message.author.id in users){
				let user = users[message.author.id];
				if(user.level >= 5){
					if("159" in user.inv){
						// If the user has item 159 (Butterfly net)
						if(message.author.id in adventures){
							// If the user has an active adventure

							if(adventures[message.author.id].level != undefined){
								let userChance = Math.ceil((user.level*4.567)/10);

								let rNum = helper.rInt(1, 100);

								if(userChance >= rNum){
									// wew lad

									let adventure = adventures[message.author.id];

									user.pet = {
										name: adventure.name,
										hp: Math.floor(adventure.hp*0.75),
										maxhp: Math.floor(adventure.maxhp*0.75),
										type: adventure.name,
										level: adventure.level,
										damage: {
											min: Math.floor(adventure.dmg.min/2),
											max: Math.floor(adventure.dmg.max/2)
										}
									};

									message.channel.sendMessage("{} caught a level {} {}!".format(message.author.username, adventure.level.formatNumber(), adventure.name));
									delete adventures[message.author.id];
									saveUsers();
									saveAdventures();
								}else{

									// TODO: Add penalties

									message.channel.sendMessage("{} tried to catch a {}, but failed.".format(message.author.username, adventures[message.author.id].name));
									return;
								}

							}else{
								message.channel.sendMessage("{} tried to catch a {}, but failed.".format(message.author.username, adventures[message.author.id].name));
								return;
							}

							//message.channel.sendMessage("WIP.");

						}else{
							message.channel.sendMessage("You're not in an adventure, {}.".format(message.author.username));
						}

					}else{
						message.channel.sendMessage("Sorry, {}, but you need {} {} to catch pets.".format(message.author.username, items["159"].prefix, items["159"].name));
					}
				}else{
					message.channel.sendMessage("Sorry, {}, but you need to be level {} to catch a pet.".format(message.author.username, 5));
				}
			}
		},
		"desc": "Catch a pet",
		"usage": "catch",
		"cooldown": 60,
		"cmsg": 10
	},
	"pheal":{
		process: function(args, message, bot){
			var user = message.author.id;

			var amt = 1;

			if(!users.hasOwnProperty(user)){
				message.channel.sendMessage(message.author.username+", please start your adventure first.");
				return;
			}

			if(users[user].pet == undefined){
				message.channel.sendMessage("You don't have a pet, {}.".format(message.author.username));
				return;
			}

			var usr = users[message.author.id];

			var itms = [];
			var count = 0;

			if(usr["items"] != undefined){


				fixInv(message.author.id);

				Object.keys(usr["inv"]).map((a) => {
					var ps = usr["inv"][a]+" x "+items[a]["name"];
					if(itms.indexOf(ps) == -1){
						itms.push(ps);
					}
				});
			}

			if(args.length >= 2){
				if(Number(args[1])){
					amt = Math.ceil(Number(args[1]));
				}else if(args[1].toLowerCase() == "auto"){
					var hl = 50;
					amt = Math.ceil((users[user].pet.maxhp - users[user].pet.hp) / 50);
				}
			}

			if(usr["inv"].hasOwnProperty("1")){
				count = usr["inv"]["1"];
			}

			if(amt <= count && count > 0){

				if(users[user].pet.hp >= users[user].pet.maxhp){
					message.channel.sendMessage(message.author.username+" tried to heal their pet, but it's already on full health.");
					return;
				}

				if(users[user]["inv"].hasOwnProperty("1")){
					
					var msg = message.author.username+" used ";
					var tot = 0;
					var MaxHP = users[message.author.id].pet.maxhp;
					var CurrentHP = users[message.author.id].pet.hp;
					var ItemHealValue = 50;
					var ItemCount = amt;
					var OptimalCount = Math.ceil((MaxHP - CurrentHP) / ItemHealValue);

					if(ItemCount < OptimalCount){
						tot = (ItemHealValue * ItemCount);
						OptimalCount = ItemCount;
					}else{
						tot = (MaxHP - CurrentHP);
					}

					if(OptimalCount > 1){
						msg += OptimalCount.formatNumber()+" "+(items["1"].plural || items["1"].name)+" and got ";
					}else{
						msg += OptimalCount.formatNumber()+" "+items["1"].name+" and got ";
					}

					users[user]["inv"]["1"] -= OptimalCount;
					users[user].pet.hp += tot;

					msg+= tot.formatNumber()+"HP for their pet. ("+users[user].pet.hp.formatNumber()+"/"+users[user].pet.maxhp.formatNumber()+" HP)";

					message.channel.sendMessage(msg);
					saveUsers(bot, message);

				}else{
					message.channel.sendMessage(message.author.username+" tried to use a Health Potion, but has none.");
				}
			}else{
				var msg = message.author.username+" tried to use "+amt.formatNumber()+" health potions but"
				if(count == 1){
					msg += " only has one";
				}else if(count <= 0){
					msg += " has none";
				}else{
					msg += " only has "+count.formatNumber();
				}
				message.channel.sendMessage(msg);
			}
		},
		"desc": "Heal your pet using a health potion",
		"usage": "pheal ``[amount/'auto']``",
		"cooldown": 10,
		"cmsg": 5
	},
	"bug": {
		process: function(args, message, bot){
			message.channel.sendMessage("To report a bug, please go to https://github.com/DiscordDungeons/Bugs/issues, thanks.");
		},
		"desc": "Shows a link to where to report bugs",
		"usage": "bug",
		"cooldown": 10,
		"cmsg": 5
	}
};

module.exports = {
	defaults: defaults,
	init: function(bot){
		thisBot = bot;
	}
}
//exports.defaults = defaults;

process.on("uncaughtException", (err) => {
	if(err != undefined){
		//ipc.of.master.emit('cmd', {id: ipc.config.id, message: err.stack});
		console.log(err.stack);
	}
});
