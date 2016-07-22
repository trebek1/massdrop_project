var express = require("express"),
    ejs = require("ejs"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    app = express(),
    request = require('request'),
    db = require('./models'); 

// Set the view engine to ejs 
app.set('view engine', 'ejs');

// Set up body parser
app.use(bodyParser.urlencoded({extended: true}));

// Set up method override to work with POST requests that have the parameter "_method=DELETE"
app.use(methodOverride('_method'));

// Start on Tickets Page 
app.get('/', function(req, res){
	res.render('index'); 
});

app.patch('/tickets/:id', function(req,res){
	
	var id = req.params.id; 
	var url = req.body._method;

	db.Record.findById(id).then(function(record){
		var queue = record.addressQueue;
			queue.push(url);
		record.addressQueue = queue; 
		record.save(function(data){});
		
		res.render('data', {id: id, queue: record.addressQueue, data: record.responses}); 	
		
	});
}); 


app.post('/tickets/form2', function(req, res){
	
	var id = req.body.id;	
		res.redirect('/tickets/' +id);
});

app.get('/tickets/:id', function(req,res){
	var id = req.params.id; 
	db.Record.findById(id).then(function(result){
		res.render('data', {id: id, queue: result.addressQueue,addresses: result.addresses, data: result.responses}); 	
	});
	
});

app.post('/tickets/data', function(req,res){
	db.Record.all().then(function(results){
		for(var i =0; i<results.length; i++){
			if(results[i].addressQueue.length >0){
				for(var j=0; j<results[i].addressQueue.length; j++){
					var id = results[i].id; 
					var url = results[i].addressQueue[j]; 
					 request(url, function(err, response, body){	
					 	db.Record.findById(id).then(function(record){
					 		var queue = record.addressQueue; 
					 		var responses = record.responses;
					 		var addresses = record.addresses; 
					 		// shift the queue 
					 		queue.shift(); 
					 		record.addressQueue = queue;
					 		// add the response data to the record 
					 		if(!responses){
					 			responses = [body];
					 		}else{
					 			responses.push(body); 	
					 		}
					 		record.responses = responses; 
					 		//update addresses with responses 
					 		if(!addresses){
					 			addresses = [url]
					 		}else{
					 			addresses.push(url); 	
					 		}
					 		record.addresses = addresses; 
					 		//save
					 		record.save(function(data){}); 

					 	})
					 });
				}
			}
		}
		res.redirect('index'); 
	});
});

app.post('/tickets', function(req,res){

	var url = req.body.address + ''; 
	var id = req.body.id; 

	if(url.slice(0,3) === 'www'){
		url = 'http://' + url; 
	} 

	
		db.Record.create({
			addressQueue : [url],
			addresses : [], 
			response: []
		}).then(function(record){
			res.render('ticket', {id: record.id});	
		}); 

	// request(url, function(err, response, body){	

	// 	if(!body){
	// 		db.Record.create({
	// 		address: url, 
	// 		data: 'No Data Found'
	// 	}).then(function(record){
	// 		res.render('ticket', {id: record.id});	
	// 		});		
	// 	}else{
	// 		db.Record.create({
	// 		address: url, 
	// 		data: body
	// 	}).then(function(record){
	// 		res.render('ticket', {id: record.id});	
	// 		});			
	// 	}
		
	// });

});

// Start the server on port 3000
app.listen(3000, function(){
	console.log("running on 3000")
})