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
		    db.collection("record").find({}, function (err, docs) {
            docs.each(function (err, doc) {
					if (doc) {
						console.log(doc);
						arr.push(doc);

					} else {
						res.end();
					}
				});
				console.log("result:" + arr);
				outerRes.send(JSON.stringify({ 'speech': "test", 'displayText': "test" }));
				//outerRes.send(JSON.stringify({ 'speech': arr.toString(), 'displayText': arr.toString()}));
			});
		/* .find().toArray(function(err, result) {
			 if (err) {
				res.send(JSON.stringify({ 'speech': "Unable to show records", 'displayText': "Unable to show records" }));
			    throw err;
			}
			console.log("result:" + result);
			res.send(JSON.stringify({ 'speech': result, 'displayText': result })); */
			db.close();
		  //});
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

restService.listen((process.env.PORT || 8000), function() {
    console.log("Server up and listening");
});
