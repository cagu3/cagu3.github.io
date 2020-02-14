
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

document.getElementById("defaultOpen").click();


$(document).ready(function() {
	var submitButton = $("#bballSubmit");
	console.log(submitButton);

	$("#bballSubmit").click(function(e) {
		$('#img').show();
		e.preventDefault();
		var playerName = $("#playerName").val();
		var date = $("#date").val();
		console.log("Name:", playerName, "- Date:", date);

		if (playerName == "" || date == "") {
			console.log("Missing value(s)")
			$("#bball").html("<p>Please refresh the page and supply the missing value(s).</p>");
		}
		else {

			var dates = [];
			const FIFTY_YEARS = 50;
			var today = new Date();
			var dd = date.substring(3,5);
			var mm = date.substring(0,2);
			var yyyy = today.getFullYear();

			for (i = 0; i < FIFTY_YEARS; i++) {
				var newYear = yyyy - i;
				today = '\'' + newYear + '-' + mm + '-' + dd + '\'';
				dates[i] = today;
			}

			var playerurl = "https://www.balldontlie.io/api/v1/players?search=" + playerName;
			console.log(encodeURI(playerurl));
			var playerId;
			$.ajax({
				url : playerurl,
				async : false,
				dataType : "json",
					success : function(json) {
						playerId = json.data[0].id;
					}
			});
			console.log("player ID:", playerId);

			var gameurl = "https://www.balldontlie.io/api/v1/stats?player_ids[]=" + playerId;
			for (i = 0; i < FIFTY_YEARS; i++) {
				gameurl += "&dates[]=" + dates[i];
			}
			console.log(encodeURI(gameurl));

			$.ajax({
				url : gameurl,
				dataType : "json",
					success : function(json) {
						var results = "";

						if (json.data.length < 1) {
							results += '<h3 align="center">Sorry, that player did not play on this day.</h3>';
						}
						else {
							var totalPts = 0;
							results += '<p align="center" class="upper">' + json.data[0].player.first_name + ' ' + 
										json.data[0].player.last_name + ' scored</p align="center" class="upper">';

							var i = 0;
							var nullVal = false;

							var gameStats = [];
							var points = 0;
							var year = 0;
							while (i < json.data.length) {
								totalPts += json.data[i].pts;
								if (json.data[i].pts == null) {
									nullVal = true;
								}

								year = json.data[i].game.date.substring(0,4);

								var teamurl = "https://www.balldontlie.io/api/v1/teams/" + json.data[i].game.visitor_team_id;
								console.log(encodeURI(teamurl));
								var awayTeam;
								$.ajax({
									url : teamurl,
									async : false,
									dataType : "json",
										success	: function(json) {
											awayTeam = json.full_name;
										}
								});

								points = json.data[i].pts;
								gameStats[i] = [year, points, awayTeam];

								i++;
							}

							gameStats.sort(function(a,b) {
								return a[0] - b[0];
							});

							results += '<p align="center" class="upper"><strong>' + totalPts
							if (nullVal == true) results += '*'
							results += '</strong> total points</p align="center" class="upper">';
							results += '<p align="center" class="upper"> On ' + mm + '/' + dd + ' throughout his career</p align="center" class="upper">';

							var j = 0;
							var graphData = [];
							while (j < json.data.length) {
								results += '<p align="center">';
								if (gameStats[j][1] == null) {
									results += '*Sorry, we\'re not sure how many points he scored ';
								}
								else {
									results += gameStats[j][1] + ' pts ';
									graphData.push([gameStats[j][0], gameStats[j][1]]);
								}

								results += 'vs the ' + gameStats[j][2] + ' in ' + gameStats[j][0] + '</p>';
								j++;
							}

							graphData.sort(function(a,b) {
								return a[0] - b[0];
							});

							var chart = anychart.line();
						   var series = chart.line(graphData);
						    
						   chart.title("Points on This Day");

						   var xAxis = chart.xAxis();
						   xAxis.title("Year");
						   var yAxis = chart.yAxis();
						   yAxis.title("Points");

						   chart.container("bballGraph");
						   chart.draw();

						   $('#bballGraph').show(); // TODO: figure out how to make this disappear when going back to the Main tab
						}
						$('#img').hide();
						$("#bball").html(results);
					}
			});
		}
	});
});

