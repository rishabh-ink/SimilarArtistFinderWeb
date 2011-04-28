/*
Similar Artist Finder (SAF) application
version 1.0.0 (beta)

Developed by Rishabh Rao

rishabhsrao@gmail.com
rishabhsrao.blogspot.com
twitter.com/rishabhsrao
facebook.com/rishabhsrao

This file is a part of SAF.

SAF is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

SAF is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with SAF.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * This <code>Application</code>'s <code>main</code> method handles the processing flow.
 */
function Application()
{
	/**
	 * This <code>main</code> method handles the processing flow. This privileged method is called by <code>jQuery</code>'s <code>ready</code> method, when the HTML is completely processed.
	 */
	this.main = function ()
	{
		setupButton();
		setupTextbox(10, 500);
		showStatus("info", "Please enter an artist's name and click Find. You'll then get a list of artists who are similar to the given artist.");
	}
	
	/**
	 * Fetches the artist information by sending out an AJAX request using jQuery.
	 */
	function getArtistInfo()
	{	
		// clear everything and start a new search
		jQuery("#artistNameAutocomplete").value = "";
		jQuery("#selectedArtistInfo").html("");
	
		showStatus("info", "Searching...");
		
		var an = jQuery("#artistNameAutocomplete").val();
		
		if(an == "")
		{
			showStatus("alert", "You must provide an artist's name.");
			return;
		}		
		
		var yahooPipesBaseURL = new String("http://pipes.yahoo.com/pipes/pipe.run");
	
		jQuery.ajax(
		{			
			url: yahooPipesBaseURL,
			
			data:
			{
				_id: "a1f7b1e60ad0c5881db7fa9ff2f3698a",
				_render: "json",
				artistName: an				
			},
			
			// ... expecting a JSON with Padding (JSONP) (also solves the "same origin policy" (see http://en.wikipedia.org/wiki/Same_origin_policy))...
			dataType: "jsonp",
			
			// ... and also Yahoo! Pipes expects "_callback" instead of jQuery's default "callback" in the 'callback=?' (read more at http://api.jquery.com/jQuery.ajax)...
			jsonp: "_callback",
			
			success: function (returnedData)
			{
				if(returnedData.count == 0)
				{
					showStatus("info", "No artist was found by that name. Please try again.");
				}
				else
				{								
					clearStatus();
					displayArtists(returnedData);				
				}
			},
			
			error: function(xhr, status)
			{
				// FIXME this is not being called when no internet connection is available
				showStatus("alert", "Oops, something went very wrong! See if you can make sense of this error: " + status);
			}
		});
	}
	
	/**
	 * Resets to original view.
	 */
	function resetDisplay()
	{		
		jQuery("#artistNameAutocomplete").value = "";
		jQuery("#selectedArtistInfo").html("");
		jQuery("#artistList").html("");
		clearStatus();
	}
	
	/**
	 * Clears the status bar.
	 */	
	function clearStatus()
	{
		jQuery("#statusBar").html("");
	}
	
	/**
	 * Displays a info status using jQuery UI.
	 * @param {String} type The type of status, alert or info.
	 * @param {String} text The text content of the information message.
	 */
	function showStatus (type, text)
	{
		clearStatus();
		
		if(type == "alert")
		{
			typeClass = "ui-state-error";
		}
		else
		{
			typeClass = "ui-state-highlight";
		}
		
		jQuery("#statusBar").html(
			"<div class='ui-corner-all " + typeClass + "'>" 					+
		  		"<p>&nbsp;" 													+
			    	"<span class='ui-icon ui-icon-" + type + "'> </span>" 		+
			    	"<strong>&nbsp;" + text + "</strong>" 						+
		  		"</p>" 															+
			"</div>"
		);
	}
	
	/**
	 * Creates a jQuery button out of the HTML <code>button</code> element and creates a <code>onclick</code> handler for it.
	 */
	function setupButton ()
	{
		// setup the Find button
		jQuery("#findSimilarButton").button().click(getArtistInfo);
		jQuery("#resetButton").button().click(resetDisplay);
		
		// setup enter key handler
		jQuery("#artistNameAutocomplete").keyup(function (e)
		{		
			if(e.keyCode == 13)
			{
    			jQuery("#findSimilarButton").click();
  			}
		});
	}
	
	/**
	 * Fetches the the list of artists for the auto-complete text box.
	 * @param {Number} tl The number of tags to be fetched.
	 * @param {Number} al The number of artists to be fetched for the auto-complete text box.
	 */
	function setupTextbox (tl, al)
	{			
		var yahooPipesBaseURL = new String("http://pipes.yahoo.com/pipes/pipe.run");
	
		jQuery.ajax(
		{			
			url: yahooPipesBaseURL,

			data:
			{
				_id: "3ec4c6de219cadd5b71709794eaeb779",
				_render: "json",
				tagLimit: tl,
				artistLimit: al				
			},
			
			// ... expecting a JSON with Padding (JSONP) (also solves the "same origin policy" (see http://en.wikipedia.org/wiki/Same_origin_policy))...
			dataType: "jsonp",
			
			// ... and also Yahoo! Pipes expects "_callback" instead of jQuery's default "callback" in the 'callback=?' (read more at http://api.jquery.com/jQuery.ajax)...
			jsonp: "_callback",
			
			success: function (returnedData)
			{
				var artistsList = [];
				for (var i = 0; i < returnedData.count; i++)
				{
					artistsList.push(returnedData.value.items[i].content);
				}
				
				// removes the duplicates				
				var scrapedArtistsList = new Array();
				o:for(var i = 0, n = artistsList.length; i < n; i++)
				{
					for(var x = 0, y = scrapedArtistsList.length; x < y; x++)
					{
						if(scrapedArtistsList[x]==artistsList[i]) continue o;
					}
					scrapedArtistsList[scrapedArtistsList.length] = artistsList[i];
				}
				
				jQuery("#artistNameAutocomplete").autocomplete({"source": scrapedArtistsList, "max": 4, "scrollHeight": 60, "minChars": 3});
			},
			
			error: function(xhr, status)
			{
				// FIXME this is not being called when no internet connection is available
				showStatus("alert", "Oops, something went very wrong! See if you can make sense of this error: " + status);
			}
		});
	}
	
	/**
	 * Upon successfully retrieving the artists, display the similar artists in an elegant manner.
	 * @param {Object} artistData The JSON data which contains the artist info as well as info about the similar artists. 
	 */
	function displayArtists(artistData)
	{
		var similarArtistsHTML = [displaySimilarArtist(artistData, 0), displaySimilarArtist(artistData, 1), displaySimilarArtist(artistData, 2), displaySimilarArtist(artistData, 3), displaySimilarArtist(artistData, 4)];
		
		var artistSummary = new String(artistData.value.items[0].artist.bio.summary);
		
		if(artistSummary == "null")
		{
			artistSummary = " ";
		}
		
		jQuery("#selectedArtistInfo").html(
			"<table>" +
				"<tr>" +					
					"<td id='selectedArtistImage'>" +
						"<a href='" + artistData.value.items[0].artist.url + "'>" +					
							"<img src='" + artistData.value.items[0].artist.image[3].content + "' alt='" + artistData.value.items[0].artist.name + "' />" +
						"</a>" +
					"</td>" +
					"<td id='selectedArtistName'>" +
						"<a href='" + artistData.value.items[0].artist.url + "'>" +
							"<h2>" + artistData.value.items[0].artist.name + "</h2>" +
						"</a>" +
						"<p>" + artistSummary + "</p>" +						
					"</td>" +					
				"</tr>" +			
				
				similarArtistsHTML[0] +
				similarArtistsHTML[1] +
				similarArtistsHTML[2] +
				similarArtistsHTML[3] +
				similarArtistsHTML[4] +
			"</table>"
		);	
		
		styleUp();
	}
	
	/**
	 * Adds some extra eye-candy CSS styling using jQuery.
	 */
	function styleUp()
	{		
		jQuery("#selectedArtistName").addClass("ui-state-error ui-corner-all");
		jQuery(".similarArtistsImage").css({"text-align": "right"});
		jQuery(".similarArtistsName").addClass("ui-corner-all ui-state-hover");		
		
		jQuery(".similarArtistsName").hover(
			function (){
				jQuery(this).removeClass("ui-state-hover");
            	jQuery(this).addClass("ui-state-active");
        	},
			function (){
            	jQuery(this).removeClass("ui-state-active");
				jQuery(this).addClass("ui-state-hover");
        });
		
		
	}
	
	/**
	 * Creats a string of HTML content to display the similar artist with the given index.
	 * * @param {Object} artistData The JSON data which contains the artist info as well as info about the similar artists.
	 * @param {Number} whichOne The index of the similar artist in the JSON data.
	 */
	function displaySimilarArtist(artistData, whichOne)
	{
		var htmlData =
				"<tr>" +
					"<td class='similarArtistsImage similarArtistsList'>" +
						"<a href='" + artistData.value.items[0].artist.similar.artist[whichOne].url + "'>" +
							"<img src='" + artistData.value.items[0].artist.similar.artist[whichOne].image[2].content + "' alt='" + artistData.value.items[0].artist.similar.artist[whichOne].name + "' />" +
						"</a>" +
					"</td>" +					
						"<td class='similarArtistsName similarArtistsList'>" +
							"<a href='" + artistData.value.items[0].artist.similar.artist[whichOne].url + "'>" +
								"<h3>" + artistData.value.items[0].artist.similar.artist[whichOne].name + "</h3>" +
							"</a>" +						
						"</td>" +											
				"</tr>";
				
		return htmlData;
	}
}