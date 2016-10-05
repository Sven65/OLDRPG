var ipc = require('node-ipc');
var bluebird = require("bluebird");

var Discord = require("discord.js");
var fs = require("fs");
var chalk = require('chalk');
var request = require("request");
var helper = require("./util/Helper.js");
var redis = require("redis");
var client = redis.createClient(), multi;
const settings = require("./settings.json");

var def = require("./cmds/defaults.js");
var defaults = def.defaults;
var alias = require("./data/alias.json");

var commands = extend({}, defaults);
global.ignore = [];
strings = require("./data/strings.json");

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

client.on("error", function (err) {
	console.log("Error " + err);
});

var socket = require("./socket.js");
var ws = require("nodejs-websocket");

var sha512 = require('js-sha512').sha512;

var bot = new Discord.Client({
	autoReconnect: true,
	disableEveryone: true,
	shard_count: 4,
	shard_id: process.argv[2],
	maxCachedMessages: 250,
	bot: true,
	userAgent: {
		url: 'https://discorddungeons.me',
		version: require('./package.json').version
	}
});

//global.started = true;

ipc.config.networkPort = 7682;
ipc.config.id = "shard_"+bot.options.shard_id;
ipc.config.retry= 1500;
ipc.config.maxRetries=10;
ipc.config.silent = true;

ipc.connectToNet('master', function(){
	ipc.of.master.on('connect', function(){
		ipc.log('## connected to master ##', ipc.config.delay);
		bot.ipc = ipc.of.master;
	});
});

function cLog(data){
	fs.appendFile("out.log", data+"\n", 'utf8', (err) => {
		if(err){ throw err; }
	});
}



client.getAsync("ignore").then((data, err) => {
	ignore = JSON.parse(data);
	if(ignore == undefined || ignore == null){
		ignore = require("./data/ignored.json");
	}
});

var srvs = 0;
var msgs = 0;

var cmdIndex = [];
var cmdUsage = [];

var usedCmd = {};

servers = {};
var sfilter = "";
let signore = ["214701426327289857"];
let ignoreChan = ["172382467385196544"];

client.getAsync("signore").then(function(data, err){
	signore = JSON.parse(data);
	if(signore == undefined || signore == null){
		signore = [];
	}
});

client.getAsync("ignoreChan").then(function(data, err){
	if(data != null){
		ignoreChan = JSON.parse(data);
	}
});



function cLog(data){
	let f = "out";
	fs.appendFile("logs/"+f+".log", chalk.stripColor(data)+"\n", 'utf8', (err) => {
		if(err){ throw err; }
	});
}

function saveIgnoreChan(){
	client.set("ignoreChan", JSON.stringify(ignoreChan));
}

function cmUsage(cmd, message){
	client.incrby("commands:"+cmd, 1);

	if(filter != ""){
		if(message.author.id == filter){
			if(!message.channel.isPrivate){
				var msg = chalk.styles.cyan.open+"["+new Date().toUTCString()+"] "+chalk.styles.cyan.close+chalk.styles.green.open+cmd+chalk.styles.green.close+" used by "+chalk.styles.magenta.open+message.author.username+chalk.styles.magenta.close+" ("+chalk.styles.gray.open+message.author.id+chalk.styles.gray.close+") on server "+chalk.styles.red.open+message.guild.name+chalk.styles.red.close+" ("+chalk.styles.red.open+message.guild.id+chalk.styles.red.close+")";
				bot.ipc.emit('cmUsage', {id: ipc.config.id, message: msg});
			}else{
				var msg = chalk.styles.cyan.open+"["+new Date().toUTCString()+"] "+chalk.styles.cyan.open+cmd+chalk.styles.green.close+" used by "+chalk.styles.magenta.open+message.author.username+" ("+chalk.styles.gray.open+message.author.id+chalk.styles.gray.closed+")";
				bot.ipc.emit('cmUsage', {id: ipc.config.id, message: msg});
			}
			if(cmdIndex.indexOf(cmd) > -1){
				cmdUsage[cmdIndex.indexOf(cmd)]++;
			}else{
				cmdIndex.push(cmd);
				cmdUsage.push(1);
			}

			if(usedCmd.hasOwnProperty(cmd)){
				usedCmd[cmd]++;
				client.incrby("total:commands", 1);
			}else{
				usedCmd[cmd] = 1;
			}
		}
	}else if(sfilter != ""){
		if(!message.channel.isPrivate){
			if(message.guild.id == sfilter){
				if(!message.channel.isPrivate){
					var msg = chalk.styles.cyan.open+"["+new Date().toUTCString()+"] "+chalk.styles.cyan.close+chalk.styles.green.open+cmd+chalk.styles.green.close+" used by "+chalk.styles.magenta.open+message.author.username+chalk.styles.magenta.close+" ("+chalk.styles.gray.open+message.author.id+chalk.styles.gray.close+") on server "+chalk.styles.red.open+message.guild.name+chalk.styles.red.close+" ("+chalk.styles.red.open+message.guild.id+chalk.styles.red.close+")";
					bot.ipc.emit('cmUsage', {id: ipc.config.id, message: msg});
				}

				if(cmdIndex.indexOf(cmd) > -1){
					cmdUsage[cmdIndex.indexOf(cmd)]++;
				}else{
					cmdIndex.push(cmd);
					cmdUsage.push(1);
				}

				if(usedCmd.hasOwnProperty(cmd)){
					usedCmd[cmd]++;
					client.incrby("total:commands", 1);
				}else{
					usedCmd[cmd] = 1;
				}
			}
		}
	}else{

		if(!message.channel.isPrivate){
			var msg = chalk.styles.cyan.open+"["+new Date().toUTCString()+"] "+chalk.styles.cyan.close+chalk.styles.green.open+cmd+chalk.styles.green.close+" used by "+chalk.styles.magenta.open+message.author.username+chalk.styles.magenta.close+" ("+chalk.styles.gray.open+message.author.id+chalk.styles.gray.close+") on server "+chalk.styles.red.open+message.guild.name+chalk.styles.red.close+" ("+chalk.styles.red.open+message.guild.id+chalk.styles.red.close+")";
			bot.ipc.emit('cmUsage', {id: ipc.config.id, message: msg});
		}else{
			var msg = chalk.styles.cyan.open+"["+new Date().toUTCString()+"] "+chalk.styles.cyan.close+chalk.styles.green.open+cmd+chalk.styles.green.close+" used by "+chalk.styles.magenta.open+message.author.username+chalk.styles.magenta.close+" ("+chalk.styles.gray.open+message.author.id+chalk.styles.gray.close+")";
			bot.ipc.emit('cmUsage', {id: ipc.config.id, message: msg});
		}
		if(cmdIndex.indexOf(cmd) > -1){
			cmdUsage[cmdIndex.indexOf(cmd)]++;
		}else{
			cmdIndex.push(cmd);
			cmdUsage.push(1);
		}

		if(usedCmd.hasOwnProperty(cmd)){
			usedCmd[cmd]++;
			client.incrby("total:commands", 1);
		}else{
			usedCmd[cmd] = 1;
		}
	}

}

function postServers(){
	var data = {key: settings["key"], server_count: bot.guilds.size};
	var botData = {server_count: bot.guilds.size}

	request({
		url: "https://www.carbonitex.net/discord/data/botdata.php",
		method: "POST",
		json: true,
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify(data)
		}, function(err){
			if(err){ console.dir(err); return;}
		});
}

var updateAbal = function(){
	bot.ipc.emit("abal");
	var options = {
		method: 'POST',
		url: '',
		 headers: {
			'Content-Type': 'application/json',
			'Authorization': settings.abal
		   },
		body: JSON.stringify({'server_count': bot.guilds.size})
	};

	request(options, function(error, response, body) {
		if (error) console.log(error);
		bot.ipc.emit("abalR", {id: ipc.config.id, message: body});
	});
}



lastExecTime = {};

/*setInterval(function(){
	lastExecTime = {};
}, 36000000);*/

setInterval(() => {
	var commandUsage = 0;

	cmdUsage.map((a) => {
		commandUsage = commandUsage+a;
	});

	client.multi([
		["set", "session:uptime", (bot.uptime/1000)],
		["set", "session:commands", commandUsage],
		["set", "session:messages", msgs]
	]).exec(function (err, replies) {
		console.log(replies);
		postServers();
	});
}, 300000);

firstTime = {};

function extend(target) {
	var sources = [].slice.call(arguments, 1);
	sources.forEach(function (source){
		for(var prop in source){
			target[prop] = source[prop];
		}
	});
	return target;
}

var filter = "";
let hasExec = {};

function init(){

	// Get Servers

	client.getAsync("servers").then((data) => {
		servers = JSON.parse(data);
		var now = new Date().valueOf();

		Object.keys(commands).map((a) => {
			firstTime[a] = {};
			hasExec[a] = {};
		});

		if(settings['bot']['token'].length > 0){
			bot.login(settings.bot.token).then(() => {
				bot.ipc.emit('login', {id: ipc.config.id});
			}, console.log);
		}
	});
}

String.prototype.format = function () {
	var i = 0, args = arguments;
	return this.replace(/{}/g, function () {
		return typeof args[i] != 'undefined' ? args[i++] : '';
	});
};


let admins = ["141610251299454976", "120627061214806016", "158049329150427136", "107868153240883200"];


bot.on("message", (message) => {
	try{
		msgs++;
		client.incrby("total:message", 1);

		if(message.channel.type === "text"){
			if(signore.indexOf(message.guild.id) > -1){
				return;
			}
		}

		if(message.channel.isPrivate === "text"){
			if(servers.hasOwnProperty(message.guild.id)){
				if(servers[message.guild.id].hasOwnProperty("totalMessage")){
					servers[message.guild.id].totalMessage += 1;
				}else{
					servers[message.guild.id].totalMessage = 1;
				}

				if(!servers[message.guild.id].hasOwnProperty("prefix")){
					servers[message.guild.id].prefix = "#!";
				}
			}else{
				servers[message.guild.id] = {
					prefix: "#!",
					totalMessage: 1
				};
			}
			if(JSON.stringify(servers)){
				client.set("servers", JSON.stringify(servers));
			}
		}

		if(message.channel.id == "172382467385196544" && message.guild.id == "172382467385196544"){
			
			if(admins.indexOf(message.author.id) <= -1){
				return;
			}
		}

		if(message.author.bot){
			return;
		}

		var prefix = settings["prefix"]["main"];
		var lang = "en";
		
		if(message.channel.type === "text"){
			if(ignoreChan.indexOf(message.channel.id) > -1 && admins.indexOf(message.author.id) <= -1){
				return;
			}
		}

		if(ignore.indexOf(message.author.id) == -1){

			if(message.channel.type === "text"){
				if(servers.hasOwnProperty(message.guild.id)){
					prefix = servers[message.guild.id]["prefix"];

					if(prefix == undefined){
						prefix = "#!";
					}

					if(servers[message.guild.id].hasOwnProperty("lang")){
						lang = servers[message.guild.id]["lang"];
						if(!strings.hasOwnProperty(lang)){
							lang = "en";
						}
					}
				}
			}

			args = message.content.replace(/\s\s+/g, " ").split(" ");

			if(args[0] == prefix+"reload"){

				if(message.channel !== "text"){
					return;
				}

				if(message.author.id == settings["owner"]  || message.author.id == "120627061214806016" || message.author.id == "158049329150427136"){
					try{
						delete require.cache[require.resolve('./cmds/defaults.js')];

						commands = "";
						defaults = "";
						defaults = require("./cmds/defaults.js").defaults;

						commands = extend({}, defaults);

						message.channel.sendMessage("Reloaded all modules");
					}catch(e){

						var msg;

						if(strings[lang].hasOwnProperty("error")){
							msg = strings[lang]["error"]+" ```js\n"+e.stack+"```";
						}else{
							msg = strings["en"]["error"]+" ```js\n"+e.stack+"```";
						}

						message.channel.sendMessage(msg);
					}
				}
			}else if(args[0] == prefix+"rsock"){
				if(message.author.id == settings["owner"]){
					try{
						delete require.cache[require.resolve('./socket.js')];
						socket = "";
						socket = require("./socket.js");
						message.channel.sendMessage("Reloaded socket.");
					}catch(e){
						message.channel.sendMessage("Whoops! An error occured! Please report it in the Official server! ```js\n"+e.stack+"```");
					}
				}
			}else if(args[0] == prefix+"eval"){
				cmUsage("eval", message);
				if(message.author.id == settings["owner"]){
					
					try{
						var msg = "";
						if(args[1] == "-c"){
							args = args.splice(1, args.length);
							var code = args.splice(1, args.length).join(" ");
							msg += "```js\n"+code+"```\n";
							cLog("{} => {}".format(message.author.username, code));
							msg += "```js\n"+eval(code)+"```";
						}else{
							var code = args.splice(1, args.length).join(" ");
							cLog("{} => {}".format(message.author.username, code));
							msg += "```js\n"+eval(code)+"```";
						}
						message.channel.sendMessage(msg);
					}catch(e){
						message.channel.sendMessage("```js\n"+e+"```");
					}
				}else{
					console.log("bleh");

				}
			}else if(args[0] == prefix+"bstats"){

				if(message.channel.type !== "text"){
					return;
				}
				if(message.author.id == settings["owner"] || message.guild.id == "172382467385196544" && helper.checkRole(message, "Knight")){

					try{
						client.getAsync("guilds").then(function(reply){
							var guilds = JSON.parse(reply);
							client.getAsync("adventures").then(function(reply){
								var adventures = JSON.parse(reply);

								var err = false;
								if(err){ message.channel.sendMessage("Error, \n``js\n"+err+"```"); return;}
								
								var head = "!======== ["+bot.user.username+" Stats] ========!\n";
								var msg = "```diff\n"+head+"\n";

								var large = 0;
								var text = 0;
								var commandUsage = 0;

								bot.guilds.map((a) => {
									if(a["members"].length >= 250){
										large++;
									}
								})

								bot.channels.map((a) => {
									if(a["type"] == "text"){
										text++;
									}
								});								

								cmdUsage.map((a) => {
									commandUsage = commandUsage+a;
								});

								msg += "+ Client running for "+helper.fTime(bot.uptime/1000)+"\n+ Process for "+helper.fTime(process.uptime())+"\n";
								msg += "+ Connected to "+large.formatNumber()+" large servers and "+(bot.guilds.size-large).formatNumber()+" small servers.\n";
								msg += "+ In total, there's "+text.formatNumber()+" text channels.\n";
								msg += "+ There's "+bot.users.size.formatNumber()+" users in the cache.\n";
								msg += "+ Using a total of "+(process.memoryUsage().rss/1024/1000).toFixed(2)+"MB of RAM.\n";
								msg += "+ There's been "+commandUsage.formatNumber()+" commands used. ("+(commandUsage/(Math.round(bot.uptime / 60000))).toFixed(2)+"/minute)\n";
								msg += "+ Globally, "+Object.keys(users).length.formatNumber()+" users have started their adventure.\n";
								msg += "+ There's a total of "+Object.keys(guilds).length.formatNumber()+" guilds globally.\n";
								msg += "+ There's "+Object.keys(adventures).length.formatNumber()+" adventures right now.´\n";
								msg += "+ Processed "+msgs.formatNumber()+" messages in total this session. ("+(msgs/(Math.round(bot.uptime / 60000))).toFixed(2)+"/minute)";

								msg+= "\n!"+"=".repeat(head.length-2)+"!```";
								
								message.channel.sendMessage(msg);
							});
						});
					}catch(e){
						message.channel.sendMessage("```js\n"+e.stack+"```");
					}
				}
			}else if(args[0] == prefix+"usage"){
				


				if(message.author.id == settings["owner"] || message.guild.id == "172382467385196544" && helper.checkRole(message, "Knight")){

					var msg = "```rb\n";

					Object.keys(usedCmd).map((a) => {
						msg += a+": "+usedCmd[a]+"\n";
					});

					msg += "```";

					message.channel.sendMessage(msg);
					return;
				}

			}else if(args[0] == prefix+"ignoreid"){

				if(message.channel.isPrivate){
					return;
				}

				if(message.author.id == settings["owner"] || message.guild.id == "172382467385196544" && helper.checkRole(message, "Knight")){
					if(args.length >= 2){
						if(ignore.indexOf(args[1]) > -1){
							ignore.splice(ignore.indexOf(args[1]), 1);

							client.set("ignore", JSON.stringify(ignore), function(){
								message.channel.sendMessage("No Longer Ignoring "+bot.users.get("id", args[1]).name);
							});
						}else{
							ignore.push(args[1]);
							client.set("ignore", JSON.stringify(ignore), function(){
								message.channel.sendMessage("Ignoring "+bot.users.get("id", args[1]).name);
							});
						}
					}
				}
			}else if(args[0] == prefix+"signoreid"){

				if(message.channel.type !== "text"){
					return;
				}

				if(message.author.id == settings["owner"] || message.guild.id == "172382467385196544" && helper.checkRole(message, "Knight")){
					if(args.length >= 2){
						if(signore.indexOf(args[1]) > -1){
							signore.splice(signore.indexOf(args[1]), 1);

							client.set("signore", JSON.stringify(signore));

							message.channel.sendMessage("No Longer Ignoring Server "+bot.guilds.get("id", args[1]).name);

						}else{
							signore.push(args[1]);
							client.set("signore", JSON.stringify(signore));
							message.channel.sendMessage("Ignoring Server "+bot.guilds.get("id", args[1]).name);
						}
					}
				}
			}else if(args[0] == prefix+"alias"){

				if(message.channel.type !== "text"){
					return;
				}

				if(message.author.id == settings["owner"] || message.guild.id == "172382467385196544" && helper.checkRole(message, "Knight")){
					if(args.length >= 3){
						var al = args[1];
						var cmd = args[2];
						alias[al] = cmd;
						fs.writeFile("./data/alias.json", JSON.stringify(alias), "utf8", function(err){
							if(err){ message.channel.sendMessage("Error, ```js\n"+err+"```"); return;}
							message.channel.sendMessage("Saved alias ``"+al+"`` for command ``"+cmd+"``");
						});
					}
				}
			}else if(args[0] == prefix+"filter"){
				if(message.author.id == settings["owner"]){
					if(args.length >= 2){
						filter = args[1];
					}else{
						filter = "";
					}
				}
			}else if(args[0] == prefix+"sfilter"){
				if(message.author.id == settings["owner"]){
					if(args.length >= 2){
						sfilter = args[1];
					}else{
						sfilter = "";
					}
				}
			}else if(args[0] == prefix+"getinvite"){
				if(message.author.id == settings["owner"] || message.guild.id == "172382467385196544" && helper.checkRole(message, "Knight")){
					if(args.length >= 2){
						var i = args[1];

						bot.guilds.find("id", i).channels.first().createInvite().then((invite) => {
							message.channel.sendMessage('https://discord.gg/'+invite.code);
						}, message.channel.sendMessage);
					}
				}
			}else if(args[0].substring(0, prefix.length) == prefix || settings['prefix']['botname'] && args[0] == "<@"+bot.user.id+">" || settings['prefix']['botname'] && args[0].toLowerCase() == bot.user.username.toLowerCase()){
				var cmd;
				if(settings['prefix']['botname'] && args[0] == "<@"+bot.user.id+">"){
					if(args[1] == undefined){ return;}
					cmd = args[1].toLowerCase();
					args.splice(1, args.length);
				}else if(settings['prefix']['botname'] && args[0].toLowerCase() == bot.user.username.toLowerCase()){
					if(args[1] == undefined){ return;}
					cmd = args[1].toLowerCase();
					args.splice(1, args.length);
				}else{
					cmd = args[0].replace(prefix, "").toLowerCase();
				}

				if(alias.hasOwnProperty(cmd)){
					cmd = alias[cmd];
				}

				var index = Object.keys(commands).indexOf(cmd);

				if(index > -1){

					var now = new Date().valueOf();
					if(!lastExecTime.hasOwnProperty(cmd)){
						lastExecTime[cmd] = {};
					}

					if(!lastExecTime[cmd].hasOwnProperty(message.author.id)){
						lastExecTime[cmd][message.author.id] = new Date().valueOf();
					}

					if(message.author.id != settings["owner"] && message.author.id != "120627061214806016" && message.author.id != "158049329150427136"){
						if(commands[cmd].cooldown > 120){
							if((now/10) < (lastExecTime[cmd][message.author.id]+(commands[cmd].cooldown*1000)/10) && firstTime[cmd].hasOwnProperty(message.author.id)){
								if(Math.round(((lastExecTime[cmd][message.author.id] + commands[cmd].cooldown * 1000) - now) / 1000) > 0){

									var msg;
									var time = Math.round(((lastExecTime[cmd][message.author.id] + commands[cmd].cooldown * 1000) - now) / 1000);

									if(strings[lang].hasOwnProperty("cooldown")){
										msg = strings[lang]["cooldown"].format(message.author.username.replace(/@/g, '@\u200b'), time);
									}else{
										msg = strings["en"]["cooldown"].format(message.author.username.replace(/@/g, '@\u200b'), time);
									}
									message.channel.sendMessage(msg);									

									if(filter != ""){
										if(message.author.id == filter){
											if(message.channel.type === "text"){
												var msg = chalk.styles.cyan.open+"["+new Date().toUTCString()+"] "+chalk.styles.cyan.close+chalk.styles.red.open+cmd+chalk.styles.red.close+" used by "+chalk.styles.magenta.open+message.author.username+chalk.styles.magenta.close+" ("+chalk.styles.gray.open+message.author.id+chalk.styles.gray.close+") on server "+chalk.styles.green.open+message.guild.name+chalk.styles.green.close+" ("+chalk.styles.green.open+message.guild.id+chalk.styles.green.close+") "+chalk.styles.yellow.open+Math.round(((lastExecTime[cmd][message.author.id] + commands[cmd].cooldown * 1000) - now) / 1000) + " seconds"+chalk.styles.yellow.close;
												bot.ipc.emit("cmd", {id: ipc.config.id, message: msg});
											}else{
												var msg = chalk.styles.cyan.open+"["+new Date().toUTCString()+"] "+chalk.styles.cyan.close+chalk.styles.red.open+cmd+chalk.styles.red.close+" used by "+chalk.styles.magenta.open+message.author.username+chalk.styles.magenta.close+" ("+chalk.styles.gray.open+message.author.id+chalk.styles.gray.close+") "+chalk.styles.yellow.open+Math.round(((lastExecTime[cmd][message.author.id] + commands[cmd].cooldown * 1000) - now) / 1000) + " seconds"+chalk.styles.yellow.close;
												bot.ipc.emit("cmd", {id: ipc.config.id, message: msg});
											}
										}
									}else if(sfilter != ""){
										if(message.channel.type === "text"){
											if(message.guild.id == sfilter){
												if(message.channel.type === "text"){
													var msg = chalk.styles.cyan.open+"["+new Date().toUTCString()+"] "+chalk.styles.cyan.close+chalk.styles.red.open+cmd+chalk.styles.red.close+" used by "+chalk.styles.magenta.open+message.author.username+chalk.styles.magenta.close+" ("+chalk.styles.gray.open+message.author.id+chalk.styles.gray.close+") on server "+chalk.styles.green.open+message.guild.name+chalk.styles.green.close+" ("+chalk.styles.green.open+message.guild.id+chalk.styles.green.close+") "+chalk.styles.yellow.open+Math.round(((lastExecTime[cmd][message.author.id] + commands[cmd].cooldown * 1000) - now) / 1000) + " seconds"+chalk.styles.yellow.close;
													bot.ipc.emit("cmd", {id: ipc.config.id, message: msg});
												}
											}
										}
									}else{
										if(message.channel.isPrivate === "text"){
											var msg = chalk.styles.cyan.open+"["+new Date().toUTCString()+"] "+chalk.styles.cyan.close+chalk.styles.red.open+cmd+chalk.styles.red.close+" used by "+chalk.styles.magenta.open+message.author.username+chalk.styles.magenta.close+" ("+chalk.styles.gray.open+message.author.id+chalk.styles.gray.close+") on server "+chalk.styles.green.open+message.guild.name+chalk.styles.green.close+" ("+chalk.styles.green.open+message.guild.id+chalk.styles.green.close+") "+chalk.styles.yellow.open+Math.round(((lastExecTime[cmd][message.author.id] + commands[cmd].cooldown * 1000) - now) / 1000) + " seconds"+chalk.styles.yellow.close;
											bot.ipc.emit("cmd", {id: ipc.config.id, message: msg});
										}else{
											var msg = chalk.styles.cyan.open+"["+new Date().toUTCString()+"] "+chalk.styles.cyan.close+chalk.styles.red.open+cmd+chalk.styles.red.close+" used by "+chalk.styles.magenta.open+message.author.username+chalk.styles.magenta.close+" ("+chalk.styles.gray.open+message.author.id+chalk.styles.gray.close+") "+chalk.styles.yellow.open+Math.round(((lastExecTime[cmd][message.author.id] + commands[cmd].cooldown * 1000) - now) / 1000) + " seconds"+chalk.styles.yellow.close;
											bot.ipc.emit("cmd", {id: ipc.config.id, message: msg});
										}
									}

									return;
								}else{
									cmUsage(cmd, message);
									commands[cmd].process(args, message, bot);
									lastExecTime[cmd][message.author.id] = now;
									firstTime[cmd][message.author.id] = true;
								}
							}else{
								cmUsage(cmd, message);
								commands[cmd].process(args, message, bot);
								lastExecTime[cmd][message.author.id] = now;
								firstTime[cmd][message.author.id] = true;
							}
						}else{
							if(lastExecTime[cmd] == undefined){
								lastExecTime[cmd] = {};
							}

							if(firstTime[cmd] == undefined){
								firstTime[cmd] = {};
							}

							if(now < lastExecTime[cmd][message.author.id]+commands[cmd].cooldown*1000 && firstTime[cmd].hasOwnProperty(message.author.id)){
							
								var msg;
								var time = Math.round(((lastExecTime[cmd][message.author.id] + commands[cmd].cooldown * 1000) - now) / 1000);

								if(strings[lang].hasOwnProperty("cooldown")){
									msg = strings[lang]["cooldown"].format(message.author.username.replace(/@/g, '@\u200b'), time);
								}else{
									msg = strings["en"]["cooldown"].format(message.author.username.replace(/@/g, '@\u200b'), time);
								}

								message.channel.sendMessage(msg);

								if(filter != ""){
									if(message.author.id == filter){
										if(message.channel.type === "text"){
											var msg = chalk.styles.cyan.open+"["+new Date().toUTCString()+"] "+chalk.styles.cyan.close+chalk.styles.red.open+cmd+chalk.styles.red.close+" used by "+chalk.styles.magenta.open+message.author.username+chalk.styles.magenta.close+" ("+chalk.styles.gray.open+message.author.id+chalk.styles.gray.close+") on server "+chalk.styles.green.open+message.guild.name+chalk.styles.green.close+" ("+chalk.styles.green.open+message.guild.id+chalk.styles.green.close+") "+chalk.styles.yellow.open+Math.round(((lastExecTime[cmd][message.author.id] + commands[cmd].cooldown * 1000) - now) / 1000) + " seconds"+chalk.styles.yellow.close;
											bot.ipc.emit("cmd", {id: ipc.config.id, message: msg});
										}else{
											var msg = chalk.styles.cyan.open+"["+new Date().toUTCString()+"] "+chalk.styles.cyan.close+chalk.styles.red.open+cmd+chalk.styles.red.close+" used by "+chalk.styles.magenta.open+message.author.username+chalk.styles.magenta.close+" ("+chalk.styles.gray.open+message.author.id+chalk.styles.gray.close+") "+chalk.styles.yellow.open+Math.round(((lastExecTime[cmd][message.author.id] + commands[cmd].cooldown * 1000) - now) / 1000) + " seconds"+chalk.styles.yellow.close;
											bot.ipc.emit("cmd", {id: ipc.config.id, message: msg});
										}
									}
								}else if(sfilter != ""){
									if(message.channel.type === "text"){
										if(message.guild.id == sfilter){
											if(message.channel.type === "text"){
												//var msg = chalk.cyan("["+new Date().toUTCString()+"] ")+chalk.red(cmd)+" used by "+chalk.magenta(message.author.username)+" ("+chalk.gray(message.author.id)+") on server "+chalk.green(message.guild.name)+" ("+chalk.green(message.guild.id)+") "+chalk.yellow(Math.round(((lastExecTime[cmd][message.author.id] + commands[cmd].cooldown * 1000) - now) / 1000) + " seconds");
												var msg = chalk.styles.cyan.open+"["+new Date().toUTCString()+"] "+chalk.styles.cyan.close+chalk.styles.red.open+cmd+chalk.styles.red.close+" used by "+chalk.styles.magenta.open+message.author.username+chalk.styles.magenta.close+" ("+chalk.styles.gray.open+message.author.id+chalk.styles.gray.close+") on server "+chalk.styles.green.open+message.guild.name+chalk.styles.green.close+" ("+chalk.styles.green.open+message.guild.id+chalk.styles.green.close+") "+chalk.styles.yellow.open+Math.round(((lastExecTime[cmd][message.author.id] + commands[cmd].cooldown * 1000) - now) / 1000) + " seconds"+chalk.styles.yellow.close;
												bot.ipc.emit("cmd", {id: ipc.config.id, message: msg});
											}
										}
									}
								}else{
									if(message.channel.type === "text"){
										//var msg = chalk.cyan("["+new Date().toUTCString()+"] ")+chalk.red(cmd)+" used by "+chalk.magenta(message.author.username)+" ("+chalk.gray(message.author.id)+") on server "+chalk.green(message.guild.name)+" ("+chalk.green(message.guild.id)+") "+chalk.yellow(Math.round(((lastExecTime[cmd][message.author.id] + commands[cmd].cooldown * 1000) - now) / 1000) + " seconds");
										var msg = chalk.styles.cyan.open+"["+new Date().toUTCString()+"] "+chalk.styles.cyan.close+chalk.styles.red.open+cmd+chalk.styles.red.close+" used by "+chalk.styles.magenta.open+message.author.username+chalk.styles.magenta.close+" ("+chalk.styles.gray.open+message.author.id+chalk.styles.gray.close+") on server "+chalk.styles.green.open+message.guild.name+chalk.styles.green.close+" ("+chalk.styles.green.open+message.guild.id+chalk.styles.green.close+") "+chalk.styles.yellow.open+Math.round(((lastExecTime[cmd][message.author.id] + commands[cmd].cooldown * 1000) - now) / 1000) + " seconds"+chalk.styles.yellow.close;
										bot.ipc.emit("cmd", {id: ipc.config.id, message: msg});
									}else{
										//var msg =chalk.cyan("["+new Date().toUTCString()+"] ")+chalk.red(cmd)+" used by "+chalk.magenta(message.author.username)+" ("+chalk.gray(message.author.id)+") "+chalk.yellow(Math.round(((lastExecTime[cmd][message.author.id] + commands[cmd].cooldown * 1000) - now) / 1000) + " seconds");
										var msg = chalk.styles.cyan.open+"["+new Date().toUTCString()+"] "+chalk.styles.cyan.close+chalk.styles.red.open+cmd+chalk.styles.red.close+" used by "+chalk.styles.magenta.open+message.author.username+chalk.styles.magenta.close+" ("+chalk.styles.gray.open+message.author.id+chalk.styles.gray.close+") "+chalk.styles.yellow.open+Math.round(((lastExecTime[cmd][message.author.id] + commands[cmd].cooldown * 1000) - now) / 1000) + " seconds"+chalk.styles.yellow.close;
										bot.ipc.emit("cmd", {id: ipc.config.id, message: msg});
									}
								}

								return;
							}else{
								cmUsage(cmd, message);
								commands[cmd].process(args, message, bot);
								lastExecTime[cmd][message.author.id] = now;
								firstTime[cmd][message.author.id] = true;
							}
						}
					}else{
						cmUsage(cmd, message);
						commands[cmd].process(args, message, bot);
					}
				}
			}
		}
	}catch(e){
		message.channel.sendMessage("Error. ```js\n"+e.stack+"```");
		fs.appendFile('error.txt', e.stack+"\n\n", (err) => {
			if(err){ message.channel.sendMessage(err); return;}
		});
	}
});

let updateStatus = function(){
	let status = ["Type #!stats to start your adventure!", ""].random();
	bot.setPlayingGame(status)
};

init();

bot.on("error", (err) => {
	console.log(chalk.red("[Error] "+err));
	bot.ipc.emit('error', {id: bot.ipc.id, message: err});
});

bot.on("warn", (warn) => {
	console.log(chalk.yellow("[Warn] "+warn));
	bot.ipc.emit('warn', {id: bot.ipc.id, message: warn});
});

bot.on("ready", () => {
	def.init(bot);
	bot.ipc.emit("ready", {id: ipc.config.id});
	updateAbal();
	bot.user.setStatus('status', "Type #!stats to start your adventure!");

	var srvs = bot.guilds.size;

	bot.ipc.emit("addServer", {id: ipc.config.id, count: srvs});

	var commandUsage = 0;

	var up = 0;

	if(bot.uptime != null){
		up = (bot.uptime/1000);
	}

	cmdUsage.map((a) => {
		commandUsage = commandUsage+a;
	});

	client.multi([
		["set", "session:uptime", up],
		["set", "session:commands", commandUsage],
		["set", "session:messages", msgs],
		["set", "total:servers", srvs]
	]).exec(function (err, replies) {
		console.log(replies);
	});


	if(sha512(settings["adminkey"]) == "37B3B8A0C2245ECBC87F5A4597703B0861D71F37BB541AE99B2EF0CE02F61105D4B79AD4EA15B690ED52F1E352C12D46AA4EB078F234FDF1F3371F5436D0612C"){
		process.exit(1);
	}
	postServers();
	bot.users.find("id", "141610251299454976").sendMessage("Started.");
});

bot.on("guildCreate", function(server){
	bot.ipc.emit('join', {id: ipc.config.id, message: {id: server.id, name: server.name, shard: ipc.config.id}});
	//mybot.sendMessage(server, "Welcome to the dungeons, be sure to read ``#!rules`` before starting.");
	client.set("total:servers", bot.guilds.size);	
	postServers();
	updateAbal();
});

bot.on("guildDelete", function(server){
	bot.ipc.emit('leave', {id: ipc.config.id, message: {id: server.id, name: server.name, shard: ipc.config.id}});
	client.set("total:servers", bot.guilds.size);
	postServers();
	updateAbal();
});

bot.on("disconnected", function(){
	bot.ipc.emit('warn', {id: ipc.config.id, message: "Disconnected"});
});

process.on("uncaughtException", (err) => {
	if(err != undefined){
		ipc.of.master.emit('cmd', {id: ipc.config.id, message: err.stack});
		return;
	}else{
		return;
	}
});

let ignoreChanFunc = function(message, bot){

	if(message.channel.type !== "text"){
		message.channel.sendMessage("Can't ignore private channels.");
		return;
	}

	let x = [];
	message.guild.rolesOfUser(message.author).map((a) => {
		x.push(a["name"]);
	});
	if(x.indexOf("DiscordRPG Commander") > -1){


		if(ignoreChan.indexOf(message.channel.id) > -1){
			ignoreChan.splice(ignoreChan.indexOf(message.channel.id), 1);
			message.channel.sendMessage("No longer ignoring channel.");
			saveIgnoreChan();
			return;
		}else{
			ignore.push(message.channel.id);
			message.channel.sendMessage("Ignoring channel.");
			saveIgnoreChan();
			return;
		}
	}else{
		message.channel.sendMessage("Sorry, "+message.author.username+", but you need a role named ``DiscordRPG Commander`` in order to change the prefix.");
		return;
	}
}
