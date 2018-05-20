function generateScores(name) {
  $.getJSON("/student?name="+name, function(jsonData) {
    if(jsonData == null) {
      $('#accordion').remove();
      $('#scores').append("<h5>No RAP scores found</h5>");
    } else {
      $('#accordion').remove();
      $('#scores').append("<div id='accordion' role='tablist'>");
      $.each(jsonData.rap, function(key,rapPeriod) {
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
                  "<h5 class='text-right'>Score: " + rapPeriod.average + "</h5>" +
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
          console.log(subjectScore);
          $('#' + rapID).append(
            "<tr>" +
              "<td>" + subjectScore.subject + "</td>" +
              "<td>" + subjectScore.code + "</td>" +
              "<td>" + subjectScore.teacher + "</td>" +
              "<td class='score-column'>" + subjectScore.value + "</td>" +
            "</tr>"
          );
        });
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
    var name = $('#studentName').html();
    generateScores(name);
  }
});
