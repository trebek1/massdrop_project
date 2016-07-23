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
	res.render('index', {message: ''}); 
});

app.patch('/tickets/data', function(req,res){
	db.Record.all().then(function(results){
		// look at each record 
		for(var i =0; i<results.length; i++){
				// if the queue has something in it
				var newAddressesLength
				if(results[i].dataValues.addressQueue){
					newAddressesLength = results[i].dataValues.addressQueue.length;	
				}else{
					newAddressesLength = 0; 
				}
				
			if(newAddressesLength>0){
					// loop through it 
				for(var j=0; j<newAddressesLength; j++){
					(function(j){

						var id = results[i].dataValues.id; 
					console.log('do I get here? ', id) 
						// each address in the queue should be unique 
					var url = results[i].dataValues.addressQueue[j]; 
					// get data from new url 
					 request(url, function(err, response, body){

						// find the individual record corresponding to the id found before 
						
					 	db.Record.findById(id).then(function(record){
					 		console.log("What is id? ", id); 
					 		var queue = record.addressQueue; 
					 		var responses = record.responses;
					 		var addresses = record.addresses; 
					 		// shift the queue 
					 		queue.shift(); 
					 		record.addressQueue = queue;
					 		// add the response data to the record 
					 		if(!responses){
					 			if(body){
					 				responses = [body];	
					 			}else{
					 				responses = []; 
					 			}
					 			
					 		}else{
					 			if(body){
					 				responses.push(body); 	
					 			}else{
					 				responses = []; 
					 			}
					 			
					 		}
					 		record.responses = responses; 
					 		//update addresses with responses 
					 		if(!addresses){
					 			addresses = [url];
					 		}else{
					 			addresses.push(url); 	
					 		}
					 		record.addresses = addresses; 
					 		//save
					 		//db.Record.update(record); 

					 		record.save(function(data){});

					 	});
					 });

					})(j)
						// id should be unique to result

					
				}
			}
		} // loop for each result in database;
		res.redirect('index', {message: ''}); 
	});
});


app.patch('/tickets/:id', function(req,res){
	
	var id = req.params.id; 
	var url = req.body._method;

	db.Record.findById(id).then(function(record){
		var queue = record.addressQueue;
			if(url.slice(0,3) === 'www'){
				url = 'http://' + url; 
		} 
			queue.push(url);
		record.addressQueue = queue; 
		record.save(function(data){});
		
		res.render('data', {id: id, queue: record.addressQueue,addresses: record.addresses, data: record.responses}); 	
		
	});
}); 


app.post('/tickets/form2', function(req, res){
	
	var id = req.body.id;
	db.Record.findById(id).then(function(result){
		if(result){
			res.redirect('/tickets/' +id);
		}else{
			res.render('index', {message: "invalid ticket number"});
		}
		
	});	
		
});

app.get('/tickets/:id', function(req,res){
	var id = req.params.id; 
	db.Record.findById(id).then(function(result){
		res.render('data', {id: id, queue: result.addressQueue,addresses: result.addresses, data: result.responses}); 	
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

});

// Start the server on port 3000
app.listen(3000, function(){
	console.log("running on 3000")
})