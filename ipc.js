const ipc = require('node-ipc');
const chalk = require('chalk');
const fs = require('fs');

String.prototype.format = function(){
    var i = 0, args = arguments;
    return this.replace(/{}/g, function(){
        return typeof args[i] != 'undefined' ? args[i++] : '';
    });
}

var totalServerCount = 0;
let tempservers = 0;

ipc.config.networkPort = 7682;
ipc.config.id = 'master';
ipc.config.silent = true;

const log = function(data){

	if(console != undefined){
		console.log(data);
	}

	var d = new Date();
	var f = "{}-{}-{}".format(d.getDate(), (d.getMonth()+1), d.getFullYear());
	fs.appendFile("logs/"+f+".log", chalk.stripColor(data)+"\n", 'utf8', (err) => {
		if(err){ throw err; }
	});
}

const saveServerCount = function(){
	fs.writeFile("./count", totalServerCount, 'utf8', (err) => {
		if(err){ throw err; }
	})
}

const getServerCount = function(){
	fs.readFile('./count', (err, data) => {
		totalServerCount = Number(data);
	});
}

//ipc.server.emit('getServers');

ipc.serveNet(function(){
	ipc.server.on('join', function(data,socket){
		var msg = chalk.cyan("["+new Date().toUTCString()+"] ")+" "+chalk.yellow("<Shard "+data.shard+"> ")+chalk.green("Joined server ")+chalk.magenta(data.message.name)+" ("+chalk.red(data.message.id)+")";
		log(msg);
		totalServerCount += 1;
		saveServerCount();
	});

	ipc.server.on('leave', function(data,socket){
		var msg = chalk.cyan("["+new Date().toUTCString()+"] ")+" "+chalk.yellow("<Shard "+data.shard+"> ")+chalk.red("Left server ")+chalk.magenta(data.message.name)+" ("+chalk.red(data.message.id)+")";
		log(msg);
		totalServerCount -= 1;
		saveServerCount();
	});

	ipc.server.on('cmUsage', function(data,socket){
		log(data.message);
	});

	ipc.server.on('cmd', function(data,socket){
		log(data.message);
	});

	ipc.server.on('login', function(data,socket){
		log(chalk.green("Shard "+data.id+" logged in."));
	});

	ipc.server.on("addServer", function(data, socket){
		totalServerCount += data.count;
		saveServerCount();
	});

	ipc.server.on("abal", function(data, socket){
		log("Updating Abal's Trash");
	});

	ipc.server.on("abalR", function(data, socket){
		log(data.message);
	});

	ipc.server.on("redis", function(data, socket){
		log(data.message);
	});

	ipc.server.on('error', (data, socket) => {
		log(chalk.red("[ERROR] "+data.message));
	});

	ipc.server.on('warn', (data, socket) => {
		log(chalk.yellow("[WARNING] "+data.message));
	});

	ipc.server.on('ready', (data, socket) => {
		log(chalk.green("Shard "+data.id+" ready"));
	})

	ipc.server.on("totalServers", (data, socket) => {
		log("Total servers: "+totalServerCount);
	});

	ipc.server.on("updateTotal", (d, s) => {
		getServerCount();
	});
});

ipc.server.start();
