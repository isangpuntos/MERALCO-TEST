'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const restService = express();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var Promise = require('promise');
var MongoClient = require('mongodb').MongoClient;

restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.use(bodyParser.json());

restService.post('/webhook', function(req, res) {
    var command = req.body.result && req.body.result.parameters && req.body.result.parameters.command? req.body.result.parameters.command : "";	
    var defaultText = req.body.result && req.body.result.parameters && req.body.result.parameters.defaultText? req.body.result.parameters.defaultText : "";	
    
	var outerRes = res;
	console.log(command);
	if(command.toLowerCase().trim() === "help") {
		var displayOptions = "Say anything will added to your records. Say \"show records\" will display records";
		res.send(JSON.stringify({ 'speech': displayOptions, 'displayText': displayOptions }));
	} else if(command.toLowerCase().trim() === "show record") {
		MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
		    if (err) {
				res.send(JSON.stringify({ 'speech': "Unable to show records", 'displayText': "Unable to show records" }));
		       	throw err;
			}
			var arr = [];
			var speech = "" + arr;
		    db.collection("record").find().toArray(function(err, result) {
			 if (err) {
				res.send(JSON.stringify({ 'speech': "Unable to show records", 'displayText': "Unable to show records" }));
			    throw err;
			}
			console.log("result:" + result);
			res.send(JSON.stringify({ 'speech': JSON.stringify(result), 'displayText': JSON.stringify(result) }));
			db.close();
		  });
		}); 
	} else if (defaultText !== ""){
			
		MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
			if (err) {
				res.send(JSON.stringify({ 'speech': "Unable to open record", 'displayText': "Unable to open record" }));
			    throw err;
			} else {
				db.createCollection("record",  function(err, res) {
					if (err) {
						console.log("Collection exists");
					} else
						console.log("Collection created!");
				});
			}
		    db.close();
		});
		
		MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
			if (err) {
				res.send(JSON.stringify({ 'speech': "Unable to open record", 'displayText': "Unable to open record" }));
			    throw err;
			} else {
				var myobj = {record: defaultText};
				db.collection("record").insertOne(myobj, function(err, res) {
					if (err) {
						res.send(JSON.stringify({ 'speech': "Unable to add to record", 'displayText': "Unable to add to record" }));
						throw err;
					}
					var speech = defaultText + " was added to record";
					outerRes.send(JSON.stringify({ 'speech': speech, 'displayText': speech }));
					db.close();
				});
			}
		}); 
	}
});

restService.post('/testFrom', function(req, res) {
    console.log(req.body.test);
    var from = ["Bacolod", "Bato, Leyte", "CDO", "Cebu", "Camotes", "Dipolog", "Iligan", "Ilo-ilo"]; 

    var fromList = [];
    for (var i = 0; i < from.length; i++) {
         fromList.push({          
              "title": from[i],
                  "block_names": ["To2"],
                  "set_attributes": 
                  {
                    "travel_from": from[i]
                  },
         });
    } 

    fromList.push({          
         "title": "NEXT>>",
         "block_names": ["NEXT>>"],
         "set_attributes": 
          {
              "travel_from": "NEXT>>"
          },
    });

    var fromJson = {
                    "messages": [
                        {
                            "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "button",
                                "text": "Travel from?",
                                "buttons": [
                                {
                                    "type": "show_block",
                                    "block_names": ["Search"],
                                    "title": "Back"
                                }
                              ]
                            }
                          },
                          "quick_replies": ""
                        }
                    ]
                };

    fromJson.messages[0].quick_replies = fromList;
    res.send(fromJson);
});

restService.post('/testTo', function(req, res) {
    var toArr = ["Camotes", "Iligan"]; 

    var toList = [];
    for (var i = 0; i < toArr.length; i++) {
         toList.push({          
              "title": toArr[i],
                  "block_names": ["Date2"],
                  "set_attributes": 
                  {
                    "travel_to": toArr[i]
                  },
         });
    } 

    /*fromList.push({          
         "title": "NEXT>>",
         "block_names": ["NEXT>>"],
         "set_attributes": 
          {
              "travel_from": "NEXT>>"
          },
    });*/

    var toJson = {
                    "messages": [
                        {
                            "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "button",
                                "text": "Travel to?",
                                "buttons": [
                                {
                                    "type": "show_block",
                                    "block_names": ["Search"],
                                    "title": "Back"
                                }
                              ]
                            }
                          },
                          "quick_replies": ""
                        }
                    ]
                };

    toJson.messages[0].quick_replies = toList;
    res.send(toJson);
});

restService.listen((process.env.PORT || 8000), function() {
    console.log("Server up and listening");
});
