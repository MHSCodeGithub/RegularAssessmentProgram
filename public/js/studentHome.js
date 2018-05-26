function generateScores(name) {
  $.getJSON("/student?name="+name, function(jsonData) {
    if(jsonData == null) {
      $('#accordion').remove();
      $('#not-found').remove();
      $('#scores').append("<h5 id='not-found'>No RAP scores found</h5>");
    } else {
      $('#accordion').remove();
      $('#not-found').remove();
      $('#scores').append("<div id='accordion' role='tablist'>");
      $.each(jsonData.rap, function(key,rapPeriod) {
        let currentAverage = rapPeriod.average;
        if(rapPeriod.average == 0) {
          currentAverage = "No Score";
          $('#accordion').append(
            "<div class='card'>" +
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
                    "<h5 class='text-right'>" + currentAverage + "</h5>" +
                  "</div>" +
                "</div>" +
              "</div>" +
              "<div id='collapse_" + rapID + "' class='collapse show' role='tabpanel' aria-labbelledby='heading_" + rapID + "' data-parent='#accordion'>" +
                "<div class='card-body'>" +
                  "<p>No scores currently recorded for this period.</p>" +
                "</div>" +
              "</div>" +
            "</div>"
          );
        } else {
          var rapID = rapPeriod.year + "_" + rapPeriod.term + "_" + rapPeriod.week;
          $('#accordion').append(
            "<div class='card'>" +
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
              "<div id='collapse_" + rapID + "' class='collapse show scores-collapse' role='tabpanel' aria-labbelledby='heading_" + rapID + "' data-parent='#accordion'>" +
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
        }
      });
    }
  });
}

$(document).ready(function() {
  // If we are on the student search page
  if ($('#student-form').length) {
    // Autocomplete for Student text box
    $.getJSON("/autocompleteStudents", function(students) {
      $("#studentName").autocomplete({
        source:[students]
      });
    });
    // On student search form submit
    $("#student-form" ).submit(function( event ) {
      var name = $('#studentName').val();
      generateScores(name);
      event.preventDefault();
    });
  // Otherwise we are on the student home page
  } else {
    // Grab name and generate scores
    var name = $('#studentNameHeading').html();
    console.log(name);
    generateScores(name);
  }
});
