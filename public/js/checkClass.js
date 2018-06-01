// Generate the table of scores
function generateScores(classCode) {
  $('#scores').append("<div id='loading-spinner'></div>");
  $('#loading-spinner').jmspinner('large');
  $.getJSON("/check/getClass?code="+classCode, function(jsonData) {
    if(jsonData == null) {
      $('#scores').empty();
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
              "<th scope='col' class='text-center'>Class Score</th>" +
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
  $.getJSON("/autocompleteClasses", function(classes) {
    $("#classCode").autocomplete({
      source:[classes]
    });
  });

  // On class search form submit
  $("#class-form" ).submit(function( event ) {
    var code = $('#classCode').val();
    generateScores(code);
    event.preventDefault();
  });

});
