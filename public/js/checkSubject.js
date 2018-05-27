// Generate the table of scores
function generateScores(subject) {
  $.getJSON("/check/getSubject?subject="+subject, function(jsonData) {
    if(jsonData == null) {
      $('#scores-table').remove();
      $('#not-found').remove();
      $('#scores').append("<h5 id='not-found'>No RAP scores found</h5>");
    } else {
      $('#scores').empty();
      $('#scores').append(
        "<table class='table table-striped scores-table id='scores-table'>" +
          "<thead>" +
            "<tr>" +
              "<th scope='col'>Name</th>" +
              "<th scope='col' class='text-center'>Year</th>" +
              "<th scope='col' class='text-center'>Long-Term Average</th>" +
              "<th scope='col' class='text-center'>Current Average</th>" +
              "<th scope='col' class='text-center'>Subject Score</th>" +
            "</tr>" +
          "</thead>" +
          "<tbody id='scores-body'></tbody>" +
        "</table>"
      );
      $.each(jsonData, function(key,student) {
        console.log(student);
        $('#scores-body').append(
          "<tr>" +
            "<td><a href='/check/single?name=" + student.name + "'>" + student.name + "</a></td>" +
            "<td class='text-center'>" + student.grade + "</td>" +
            "<td class='text-center'>" + student.longTermAverage + "</td>" +
            "<td class='text-center'>" + student.currentAverage + "</td>" +
            "<td class='text-center'>" + student.score + "</td>" +
          "</tr>"
        );
      });
    }
  });
}

$(document).ready(function() {

  // Autocomplete for class text box
  $.getJSON("/autocompleteSubjects", function(subjects) {
    $("#subject").autocomplete({
      source:[subjects]
    });
  });

  // On class search form submit
  $("#subject-form" ).submit(function( event ) {
    var subject = $('#subject').val();
    generateScores(subject);
    event.preventDefault();
  });

});
