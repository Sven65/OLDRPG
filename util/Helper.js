module.exports = {
	rInt: function(min, max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	fTime: function(seconds){
		var sec_num = parseInt(seconds, 10);
    var days = Math.floor(sec_num / 86400);
    sec_num %= 86400;
		var hours   = Math.floor(sec_num / 3600);
		var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
		var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (days < 10){ days = "0"+days;}
		if (hours   < 10) {hours   = "0"+hours;}
		if (minutes < 10) {minutes = "0"+minutes;}
		if (seconds < 10) {seconds = "0"+seconds;}
		var time    = days+' Days '+hours+' Hours '+minutes+' Minutes '+seconds+" seconds";
		return time;
	},
	indexx: function(array, query){
		index = -1;
		array.some(function(element, i){
	    	if(query === element.toLowerCase()){
		        index = i;
	    	}
		});
		return index;
	},
	// Changes XML to JSON
	xmlToJson: function(xml) {
    var attr,
        child,
        attrs = xml.attributes,
        children = xml.childNodes,
        key = xml.nodeType,
        obj = {},
        i = -1;

    if (key == 1 && attrs.length) {
      obj[key = '@attributes'] = {};
      while (attr = attrs.item(++i)) {
        obj[key][attr.nodeName] = attr.nodeValue;
      }
      i = -1;
    } else if (key == 3) {
      obj = xml.nodeValue;
    }
    while (child = children.item(++i)) {
      key = child.nodeName;
      if (obj.hasOwnProperty(key)) {
        if (obj.toString.call(obj[key]) != '[object Array]') {
          obj[key] = [obj[key]];
        }
        obj[key].push(xmlToJson(child));
      }
      else {
        obj[key] = xmlToJson(child);
      }
    }
    return obj;
  },
  spliceArguments: function(msg, after) {
    after = after || 1;
    var rest = msg.split(' ');
    var removed = rest.splice(0, after);
    return [removed.join(' '), rest.join(' ')];
  },
  base: function(str, fromBase, toBase){ // Base conversion
    var num = parseInt(str, fromBase); // Parse the string into fromBase
    return num.toString(toBase); // Return the string as new base
  },
  getPropertyByRegex: function(obj,propName){
   var re = new RegExp("^"+propName+"(\\[\\d*\\])?$");
   var key;
   for(key in obj){
      if (re.test(key)){
         return obj[key];
      }
   }
   return propName;
  },
  extend: function(target){
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source){
        for(var prop in source){
            target[prop] = source[prop];
        }
    });
    return target;
  },
  checkRole: function(message, role){
    if(!message.channel.isPrivate){
      var roles = message.channel.server.rolesOfUser(message.author);
      for(i=0;i<roles.length;i++){
        if(roles[i].name == role){
          return true;
        }
      }
      return false;
    }else{
      return false;
    }
  },
  getCode: function(){
    var r = this.rInt(100000000, 999999999);
    return (r).toString(36).toLowerCase();
  },
  capFirst: function(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  randomDate: function(start, end, startHour, endHour) {
    var date = new Date(+start + Math.random() * (end - start));
    var hour = startHour + Math.random() * (endHour - startHour) | 0;
    date.setHours(hour);
    return date;
  }

};
