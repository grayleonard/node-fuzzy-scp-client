var prompt = require('prompt');
var http = require('http');
var scp = require('scp');
var term_list = require('term-list');

var remote = "";
var ssh_alias = "ssh-alias";
var query = "";

var url = "";

var scp_options = {};
var dir = "/files"
prompt.start();

prompt.get(['remote', 'query'], function(err, result) {
	if (err) { return err; }
	remote = result.remote;
	query = result.query;
	url = "http://" + remote + "/search/" + query;	
	console.log(url);
	var req = http.get(url, function(res) {
		var response = "";
		res.on('data', function(chunk) {
			response += chunk;
		});
		res.on('end', function() {
			var json_response = JSON.parse(response);
			console.log(JSON.parse(response)[0]);
			var list = new term_list({ marker: '\033[36m› \033[0m', markerLength: 2 });
			for(var i = 0; i < json_response.length; i++) {
				list.add(json_response[i], json_response[i]);
			}
			list.start();
			list.on('keypress', function(key, item) {
				switch(key.name) {	
					case 'return':
						scp_options = {
							file: dir + item,
							host: ssh_alias,
							port: 22,
							path: './downloads/' + item + '/'
						}
						console.log(scp_options);
						scp.get(scp_options, function() {
							console.log(arguments);
						});
						list.stop();
					break;
					case 'escape':
						list.stop();
					break;
					}
				});	
		});
	});
});

