var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', function(request, response) {
	response.sendFile('public/index.html')
});


app.listen(process.env.PORT || 3000, function() {
	if (process.env.PORT) {
		console.log("Server running on " + process.env.PORT);	
	} else {
		console.log("Server running on port 3000");
	}
})