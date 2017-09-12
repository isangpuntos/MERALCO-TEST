'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const restService = express();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var Promise = require('promise');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.use(bodyParser.json());

restService.post('/webhook', function(req, res) {
    var command = req.body.result && req.body.result.parameters && req.body.result.parameters.command? req.body.result.parameters.command : "";	
    var defaultText = req.body.result && req.body.result.parameters && req.body.result.parameters.defaultText? req.body.result.parameters.defaultText : "";	
    
	if(command.toLowerCase().trim() === "help") {
		var displayOptions = "Say anything will added to your records. Say \"show records\" will display records";
		res.send(JSON.stringify({ 'speech': displayOptions, 'displayText': displayOptions }));
	} else if(command.toLowerCase().trim() === "show records") {
		MongoClient.connect(url, function(err, db) {
		  if (err) {
				res.send(JSON.stringify({ 'speech': "Unable to show records", 'displayText': "Unable to show records" }));
		       	throw err;
			}
		     db.collection("record").find({}).toArray(function(err, result) {
			 if (err) {
				res.send(JSON.stringify({ 'speech': "Unable to show records", 'displayText': "Unable to show records" }));
			    throw err;
			}
			res.send(JSON.stringify({ 'speech': result, 'displayText': result }));
			db.close();
		  });
		}); 
	} else if (defaultText !== ""){
			
		MongoClient.connect(url, function(err, db) {
			if (err) {
				res.send(JSON.stringify({ 'speech': "Unable to open record", 'displayText': "Unable to open record" }));
			    throw err;
			} else {
				if(!db.getCollection('record').exists()) {
					db.createCollection("record",  function(err, res) {
					if (err) {
						res.send(JSON.stringify({ 'speech': "Unable to create record", 'displayText': "Unable to create record" }));
			            throw err;
					} else
					    console.log("Collection created!");
					});
				}
			}
		    db.close();
		});
		
		MongoClient.connect(url, function(err, db) {
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
					speech = defaultText + "was added to record";
					res.send(JSON.stringify({ 'speech': speech, 'displayText': speech }));
					db.close();
				});
			}
		}); 
	}
});

restService.listen((process.env.PORT || 8000), function() {
    console.log("Server up and listening");
});
