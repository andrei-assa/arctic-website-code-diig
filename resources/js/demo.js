
var inputType = "string";
var stepped = 0, rowCount = 0, errorCount = 0, firstError;
var start, end;
var firstRun = true;
var maxUnparseLength = 10000;

// Anonymous function is passed to JQuery.
$(function()
{
	// The function deals with each situation for each tab separately.
	// This function sets up the display of the page as it should appear before any data has actually been uploaded.
	// Tabs
	$('#tab-string').click(function()
	{
		// When the 'String' tab is clicked, all tabs bearing the 'active' class have the class removed, then the target of the click event has the 'active' class appended.
		//
		$('.tab').removeClass('active');
		$(this).addClass('active');
		// .input-area exists primarily as a utility class to make it easy to clear the page when one of the other tabs is clicked.
		// Hide the previous input-area, show the markup for "input-string"
		$('.input-area').hide();
		$('#input-string').show();

		// The submit button has its text changed to parse (compare to 'JSON to CSV' option, where the submit button is labeled 'Unparse').
		$('#submit').text("Parse");
		// The inputType variable is changed to "string"
		inputType = "string";
	});

	// If the tab-local id is clicked; all elements with the 'tab' class have their 'active' class removed, then the tab with id 'tab-local' has a class of 'active' appended.
	$('#tab-local').click(function()
	{
		$('.tab').removeClass('active');
		$(this).addClass('active');
		// Again, input-area class is hidden.
		$('.input-area').hide();
		// input-local class is displayed.
		$('#input-local').show();
		// The submit button has its name changed to "Parse"
		$('#submit').text("Parse");
		// The inputType is changed to local
		inputType = "local";
	});

	$('#tab-remote').click(function()
		// The remote tab is clicked.
	{
		// All tabs have the active class removed.
		$('.tab').removeClass('active');
		// The currently-selected tab has the 'active' class appeneded.
		$(this).addClass('active');
		// The input-area is hidden.
		$('.input-area').hide();
		// input-remote class is shown.
		$('#input-remote').show();
		$('#submit').text("Parse");
		inputType = "remote";
	});

	$('#tab-unparse').click(function()
	{
		$('.tab').removeClass('active');
		$(this).addClass('active');
		$('.input-area').hide();
		$('#input-unparse').show();
		$('#submit').text("Unparse");
		inputType = "json";
	});



	// Sample files
	// When remote-normal-file clicked; element with id url is obtained
	$('#remote-normal-file').click(function() {
		// #remote-normal-file is a li element in the Remote File tab; clicking on this file changes the address displayed in the input box above. 
		console.log("Remote normal file was clicked")
		$('#url').val($('#local-normal-file').attr('href'));
	});
	$('#remote-large-file').click(function() {
		$('#url').val($('#local-large-file').attr('href'));
	});
	$('#remote-malformed-file').click(function() {
		$('#url').val($('#local-malformed-file').attr('href'));
	});


	// Demo invoked
	$('#submit').click(function()
	{
		if ($(this).prop('disabled') == "true")
			return;
		
		stepped = 0;
		rowCount = 0;
		errorCount = 0;
		firstError = undefined;

		// Gets a configuration object from the buildConfig function (JSON format)
		var config = buildConfig();
		// Get the value of the #input element	
		// assumes that the baseline source will be the "input" element
		var input = $('#input').val();

		// Use the inputType variable that was set based on the tab that is selected.
		if (inputType == "remote")
			input = $('#url').val();
		else if (inputType == "json")
			input = $('#json').val();

		// Allow only one parse at a time
		$(this).prop('disabled', true);

		if (!firstRun)
			// If no the first run, add a line separator
			console.log("--------------------------------------------------");
		else
			firstRun = false;

		// if inputType is local check to make sure the user has selected a file for parsing.
		if (inputType == "local")
		{
			// If at least one file has not been selected, prompt the user to select at least one file.
			if (!$('#files')[0].files.length)
			{
				alert("Please choose at least one file to parse.");
				return enableButton();
			}
			
			$('#files').parse({
				// get the files from the #files input element
				// parse the files using the configuration above.
				config: config,
				before: function(file, inputElem)
				{
					// start is used for timing the function
					start = now();
					console.log("Parsing file...", file);
				},
				error: function(err, file)
				{
					console.log("ERROR:", err, file);
					firstError = firstError || err;
					errorCount++;
				},
				complete: function()
				{
					end = now();
					printStats("Done with all files");
				}
			});
		}
		else if (inputType == "json")
		{
			if (!input)
			{
				alert("Please enter a valid JSON string to convert to CSV.");
				return enableButton();
			}

			start = now();
			var csv = Papa.unparse(input, config);
			end = now();

			console.log("Unparse complete");
			console.log("Time:", (end-start || "(Unknown; your browser does not support the Performance API)"), "ms");
			
			if (csv.length > maxUnparseLength)
			{
				csv = csv.substr(0, maxUnparseLength);
				console.log("(Results truncated for brevity)");
			}

			console.log(csv);

			setTimeout(enableButton, 100);	// hackity-hack
		}
		else if (inputType == "remote" && !input)
		{
			alert("Please enter the URL of a file to download and parse.");
			return enableButton();
		}
		else
		{
			start = now();
			var results = Papa.parse(input, config);
			console.log("Synchronous results:", results);
			if (config.worker || config.download)
				console.log("Running...");
		}
	});

	$('#insert-tab').click(function()
	{
		$('#delimiter').val('\t');
	});
});




function printStats(msg)
{
	if (msg)
		console.log(msg);
	console.log("       Time:", (end-start || "(Unknown; your browser does not support the Performance API)"), "ms");
	console.log("  Row count:", rowCount);
	if (stepped)
		console.log("    Stepped:", stepped);
	console.log("     Errors:", errorCount);
	if (errorCount)
		console.log("First error:", firstError);
}


// Function that sets the configuration of the parser
function buildConfig()
{
	// get the value of the delimiter from the delimiter field
	// get the value of the header checkbox (checked or unchecked)
	// get the value of the "skip empty lines" checkbox
	// get the value of the preview box; if it is greater than 0, use this value.
	// get the value of the stream checkbox; if it is checked, use a step function, otherwise leave undefined.
	// get the value of the encoding; usually UTF-8.
	// get the value of the worker checkbox 
	// get the value of the comments checkbox
	// when complete, use completeFn
	// if error, use errorFn
	// download: for inputType == "remote"
	return {
		delimiter: $('#delimiter').val(),
		header: $('#header').prop('checked'),
		dynamicTyping: $('#dynamicTyping').prop('checked'),
		skipEmptyLines: $('#skipEmptyLines').prop('checked'),
		preview: parseInt($('#preview').val() || 0),
		step: $('#stream').prop('checked') ? stepFn : undefined,
		encoding: $('#encoding').val(),
		worker: $('#worker').prop('checked'),
		comments: $('#comments').val(),
		complete: completeFn,
		error: errorFn,
		download: inputType == "remote"
	};
}

function stepFn(results, parser)
{
	stepped++;
	if (results)
	{
		if (results.data)
			rowCount += results.data.length;
		if (results.errors)
		{
			errorCount += results.errors.length;
			firstError = firstError || results.errors[0];
		}
	}
}

function completeFn(results)
{
	end = now();

	if (results && results.errors)
	{
		if (results.errors)
		{
			errorCount = results.errors.length;
			firstError = results.errors[0];
		}
		if (results.data && results.data.length > 0)
			rowCount = results.data.length;
	}

	printStats("Parse complete");
	console.log("    Results:", results);

	// icky hack
	setTimeout(enableButton, 100);
}

function errorFn(err, file)
{
	end = now();
	console.log("ERROR:", err, file);
	enableButton();
}

function enableButton()
// enables the #submit button
{
	$('#submit').prop('disabled', false);
}

function now()
{
	return typeof window.performance !== 'undefined'
			? window.performance.now()
			: 0;
}



