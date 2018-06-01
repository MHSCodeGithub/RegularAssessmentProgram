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
              "<th scope='col'>Teacher</th>" +
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
            "<td><a href='../check/single?name=" + student.name + "' " +
            "data-toggle='tooltip' data-placement='right' title='<img src=\"/img/students/" + student.id + ".jpg\">'>" + student.name + "</a></td>" +
            "<td class='text-center'>" + student.grade + "</td>" +
            "<td class='text-center'>" + student.longTermAverage + "</td>" +
            "<td class='text-center'>" + student.currentAverage + "</td>" +
            "<td><a href='../check/teacher?name=" + student.teacher + "'>" + student.teacher + "</a></td>" +
            "<td class='text-center'>" + student.score + "</td>" +
          "</tr>"
        );
      });
    }
    refreshTooltips();
  });
}

// Remove and re-add tooltips
function refreshTooltips() {
  $('[data-toggle="tooltip"]').tooltip('dispose');
  $('[data-toggle="tooltip"]').tooltip({
    animated: 'fade',
    html: true,
    offset: '50, 10'
  });
  $('[data-toggle="tooltip"]').on('shown.bs.tooltip', function () {
    $("img").bind("error",function(){
      $(this).attr("src","/img/students/default.jpg");
    });
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

  var classCode = getUrlParameter('code');

  if(classCode != null) {
    $('#classCode').val(classCode);
    generateScores(classCode);
  }

});
