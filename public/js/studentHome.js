function generateScores(name) {
  $('#scores').append("<div id='loading-spinner'></div>");
  $('#loading-spinner').jmspinner('large');
  $.getJSON("/student?name="+name, function(jsonData) {
    if(jsonData == null) {
      $('#scores').empty();
      $('#scores').append("<h5 id='not-found'>No RAP scores found</h5>");
    } else {

      $('#stats').empty().append("<div class='ml-5'><h5>Long Term Average: <strong>" + jsonData.longTermAverage + "</strong></h4></div>");

      // Sort the Data from newest to oldest
      jsonData.rap.sort((a, b) => {
        if (a.year < b.year) {
          return 1;
        }
        if (a.year > b.year) {
          return -1;
        }
        if (a.term < b.term) {
          return 1;
        }
        if (a.term > b.term) {
          return -1;
        }
        if (a.week < b.week) {
          return 1;
        }
        if (a.week > b.week) {
          return -1;
        }
        return 0;
      });

      $('#scores').empty();
      $('#scores').append("<div id='accordion' role='tablist'>");
      var show = "show";
      $.each(jsonData.rap, function(key,rapPeriod) {
        var rapID = rapPeriod.year + "_" + rapPeriod.term + "_" + rapPeriod.week;
        if(rapPeriod.scores.length == 0) {
          $('#accordion').append(
            "<div class='card mb-2'>" +
              "<div id='heading_" + rapID + "' class='card-header' role='tab'>" +
                "<div class='row'>" +
                  "<div class='col-sm-8'>" +
                    "<h5 class='mb-0'>" +
                      "Week " + rapPeriod.week + ", Term " + rapPeriod.term + ", " + rapPeriod.year +
                    "</h5>" +
                  "</div>" +
                  "<div class='col-sm-4'>" +
                    "<h5 class='text-right'>Average: " + parseFloat(Math.round(rapPeriod.average * 100) / 100).toFixed(2) + "</h5>" +
                  "</div>" +
                "</div>" +
              "</div>" +
            "</div>"
          );
        } else {
          $('#accordion').append(
            "<div class='card mb-2'>" +
              "<div id='heading_" + rapID + "' class='card-header' role='tab'>" +
                "<div class='row'>" +
                  "<div class='col-sm-8'>" +
                    "<h5 class='mb-0'>" +
                      "<a href='#collapse_" + rapID + "' data-toggle='collapse' aria-expanded='true' aria-controls='collapse_" + rapID + "'>" +
                        "Week " + rapPeriod.week + ", Term " + rapPeriod.term + ", " + rapPeriod.year +
                      "</a>" +
                    "</h5>" +
                  "</div>" +
                  "<div class='col-sm-4'>" +
                    "<h5 class='text-right'>Average: " + parseFloat(Math.round(rapPeriod.average * 100) / 100).toFixed(2) + "</h5>" +
                  "</div>" +
                "</div>" +
              "</div>" +
              "<div id='collapse_" + rapID + "' class='collapse " + show + " scores-collapse' role='tabpanel' aria-labbelledby='heading_" + rapID + "' data-parent='#accordion'>" +
                "<div class='card-body scores-container'>" +
                  "<table class='table table-striped scores-table'>" +
                    "<thead>" +
                      "<tr>" +
                        "<th scope='col'>Subject</th>" +
                        "<th scope='col'>Class</th>" +
                        "<th scope='col'>Teacher</th>" +
                        "<th scope='col' class='score-column'>Score</th>" +
                      "</tr>" +
                    "</thead>" +
                    "<tbody id='" + rapID + "'>" +
                    "</tbody>" +
                  "</table>" +
                "</div>" +
              "</div>" +
            "</div>"
          );
        }
        $.each(rapPeriod.scores, function(key,subjectScore) {
          let currentScore = subjectScore.value;
          if(subjectScore.value == 0) { currentScore = "No Score"; }
          $('#' + rapID).append(
            "<tr>" +
              "<td>" + subjectScore.subject + "</td>" +
              "<td>" + subjectScore.code + "</td>" +
              "<td>" + subjectScore.teacher + "</td>" +
              "<td class='score-column'>" + currentScore + "</td>" +
            "</tr>"
          );
        });
        if(show == "show") {
          show = "";
        }
      });
    }
  });
}

// Find out if the page was accessed with a GET parameter
var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    sURLVariables = sPageURL.split('&'), sParameterName, i;
  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
};

$(document).ready(function() {
  // If we are on the student search page
  if ($('#student-form').length) {
    // Autocomplete for Student text box
    $.getJSON("/autocompleteStudents", function(students) {
      $("#studentName").autocomplete({
        source:[students]
      });
      $('#studentName').focus();
    });
    // On student search form submit
    $("#student-form" ).submit(function( event ) {
      var name = $('#studentName').val();
      generateScores(name);
      window.history.pushState("", "", '/check/single?name=' + name);
      event.preventDefault();
    });

    var name = getUrlParameter('name');

    if(name != null) {
      $('#studentName').val(name);
      generateScores(name);
    }

  // Otherwise we are on the student home page
  } else {
    // Grab name and generate scores
    var name = $('#studentNameHeading').html();
    generateScores(name);
  }
});
