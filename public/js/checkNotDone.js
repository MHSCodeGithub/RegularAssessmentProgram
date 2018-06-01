// Generate the table of scores
function generateScores() {
  $('#scores').append("<div id='loading-spinner'></div>");
  $('#loading-spinner').jmspinner('large');
  $.getJSON("/showNoScores", function(jsonData) {
    if(jsonData == null) {
      $('#scores').empty();
      $('#scores').append("<h5 id='not-found'>No RAP scores found</h5>");
    } else {
      $('#scores').empty();
      $('#scores').append(
        "<table class='table table-striped scores-table id='scores-table'>" +
          "<thead>" +
            "<tr>" +
              "<th scope='col'>Teacher</th>" +
              "<th scope='col'>Class</th>" +
            "</tr>" +
          "</thead>" +
          "<tbody id='scores-body'></tbody>" +
        "</table>"
      );
      $.each(jsonData, function(key,subject) {
        $('#scores-body').append(
          "<tr>" +
            "<td><a href='/queryTeacher?name=" + subject.teacher + "'>" + subject.teacher + "</a></td>" +
            "<td>" + subject.code + "</td>" +
          "</tr>"
        );
      });
    }
  });
}

$(document).ready(function() {
  generateScores();
});
