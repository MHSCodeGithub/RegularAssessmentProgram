// Generate the table of scores
function generateScores(year) {
  $('#scores').append("<div id='loading-spinner'></div>");
  $('#loading-spinner').jmspinner('large');
  $.getJSON("/check/getYear?year="+year, function(jsonData) {
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

  $("#year7" ).click(function( event ) {
    generateScores(7);
  });

  $("#year8" ).click(function( event ) {
    generateScores(8);
  });

  $("#year9" ).click(function( event ) {
    generateScores(9);
  });

  $("#year10" ).click(function( event ) {
    generateScores(10);
  });

});
