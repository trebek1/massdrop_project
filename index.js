var express = require("express"),
    ejs = require("ejs"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    app = express(),
    request = require('request'),
    db = require('./models'); 

// Set the view engine to be "EJS"
app.set('view engine', 'ejs');

// Set up body parser
app.use(bodyParser.urlencoded({extended: true}));

// Set up method override to work with POST requests that have the parameter "_method=DELETE"
app.use(methodOverride('_method'));


// Let's add some routes here together:
app.get('/', function(req, res){
	res.redirect('/tickets');
});

app.get('/tickets', function(req, res){
	res.render('index'); 
})

app.post('/tickets', function(req,res){

	var url = req.body.address;

	console.log("this is url ", url);
	request(url, function(err, response, body) {
		
		db.Record.create({
			address: url, 
			data: body
		}).then(function(record){
			res.render('ticket', {id: record.id});	
		});
		
		});

	
	
});

// Start the server on port 3000
app.listen(3000);