//convert from am pm format to 24 hours format
function convertTime (heure){
  var nvheure = heure.slice(1,heure.length)
  var liste = nvheure.split(' ');
  if(liste[1] === 'PM'){
    liste[0] = liste[0].split(':')
    if(liste[0][0] === '12'){
			return liste[0]
    }
    else if(liste[0][0] < 12){
      liste[0][0] = parseInt(liste[0][0]) +12;
      liste[0][0] = liste[0][0].toString();
			var joinhoursminutes = liste[0]
		  return joinhoursminutes;
    }
  }
  else if (liste[1] == 'AM'){
    liste[0] = liste[0].split(':')
    if(liste[0][0] === '12'){
      liste[0][0] = '00';
			return liste[0]
    }
    else{
      return liste[0];
    }
  }
}


let diffdate = function (d1,d2){
	var WNbJours = d2.getTime() - d1.getTime();
	return Math.ceil(WNbJours);
}

let parsingdate = function (d1){
  let param = []
  d1 = d1.split(',');
  splitdate=d1[0].split('/')
  for(var i=splitdate.length-1 ; i>=0; i--){
    param.push(splitdate[i]);
  }
  return [param,d1[1]]
}

let tableauOfTime = function(hourmin,datetime){
  let array = datetime[0]
  array.push(hourmin[0])
  array.push(hourmin[1])
  return array
}

module.exports.convertTime = convertTime ;
module.exports.diffdate = diffdate ;
module.exports.parsingdate = parsingdate;
module.exports.tableauOfTime = tableauOfTime;
