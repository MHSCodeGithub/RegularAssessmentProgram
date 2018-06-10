// Generate the HTML for student scores for each class
function generateScores(name) {

  $('#classes').append("<div id='loading-spinner'></div>");
  $('#loading-spinner').jmspinner('large');

  $.getJSON("/teacher?name="+name, function(string) {

    // destroy any class lists that are already there
    $('#classes').empty();

    // Create tab list
    $('#classes').append("<div class='card' id='classes-card'></div>");
    $('#classes-card').append("<div class='card-header' id='classes-header'></div>");
    $('#classes-card').append("<div class='card-body' id='classes-body'></div>");
    $('#classes-header').append("<ul id='subject-tabs' class='nav nav-pills nav-fill' role='tablist'></ul>");

    // Loop through each subject and create a tab to click
    $.each(string, function(key,val) {

      // Dynamically creates the tabs for each subject
      if(key == 0) {
        $('#subject-tabs').append(
          "<li class='nav-item' data-toggle='tooltip' data-placement='bottom' title='" + val.subject + "' onclick='refreshTooltips();'>" +
              "<a class='nav-link active' id='tab" + key + "' data-toggle='pill' href='#tab-container-" +
              key + "' role='tab' aria-controls='tab-container-" +  key + "' aria-selected='true'>" + val.code + "</a>" +
            "</li>"
          );
      } else {
        $('#subject-tabs').append(
          "<li class='nav-item' data-toggle='tooltip' data-placement='bottom' title='" + val.subject + "' onclick='refreshTooltips();'>" +
            "<a class='nav-link' id='tab" + key + "' data-toggle='pill' href='#tab-container-" +
            key + "' role='tab' aria-controls='tab-container-" +  key + "' aria-selected='true'>" + val.code + "</a>" +
          "</li>"
        );
      }
    });

    // Create tab content container
    $('#classes-body').append("<div class='tab-content' id='tab-container'></div>");

    // Create table of students
    $.each(string, function(x,y) {

      // Dynamically creates the container for each tab
      if(x == 0) {
        $('#tab-container').append("<div class='tab-pane fade show active' id='tab-container-" + x +
        "' role='tabpanel' aria-labelledby='tab" + x + "_" + y.code + "'></div>");
      } else {
        $('#tab-container').append("<div class='tab-pane fade' id='tab-container-" + x +
        "' role='tabpanel' aria-labelledby='tab" + x + "_" + y.code + "'></div>");
      }

      // Dynamically creates the headings for each column
      $('#tab-container-' + x).append(
        "<div class='row'>" +
          "<div class='col-sm-12'>" +
            "<table class='table table-striped'>" +
              "<thead>" +
                "<tr>" +
                  "<th scope='col' class='student-label'>Name:</th>" +
                  "<th scope='col' class='scoreColumnLocked'>Score:</th>" +
                "</tr>" +
              "</thead>" +
              "<tbody id='subjects-body-" + x + "'></tbody>" +
            "</table>" +
          "</div>" +
        "</div>"
      );

      $.each(y.students, function(i, student) {

        student.name = escape(student.name);
        var convertedName = student.name.replace(/\s+/g, '-').toLowerCase();

        // Dynamically creates the student/score rows
        $('#subjects-body-' + x).append(
          "<tr id='" + y.code + "_" + student.id + "'>" +
            "<td class='student-label'>" +
              "<a href='../check/single?name=" + unescape(student.name) + "' " +
              "data-toggle='tooltip' data-placement='right' title='<img src=\"/img/students/" + student.id + ".jpg\"/>'>" + unescape(student.name) + "</a>" +
            "</td>" +
            "<td class='scoreColumnLocked'>" + student.score + "</td>" +
          "</tr>"
        );

      });
    });

    // Activate tooltips
    refreshTooltips();

    // Fill all student name inputs with autocomplete data
    $.getJSON("/autocompleteStudents", function(students) {
      $(".studentNames").autocomplete({
        source:[students]
      });
    });

    // Fill the 'Add Class' input with class codes
    $.getJSON("/autocompleteClasses", function(classes) {
      $(".classCodes").autocomplete({
        source:[classes]
      });
    });

    $('[data-toggle="tooltip"]').on('shown.bs.tooltip', function () {
      $("img").bind("error",function(){
        $(this).attr("src","/img/students/default.jpg");
      });
    });

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

// Functions to run on startup
function startup() {
  // If we are on the student search page
  if ($('#teacher-form').length) {
    // Autocomplete for Teacher text box
    $.getJSON("/autocomplete", function(teachers) {
      $("#teacherName").autocomplete({
        source:[teachers]
      });
      $('#teacherName').focus();
    });
    // AJAX request for Teacher's classes
    $("#teacher-form" ).submit(function( event ) {
      var name = $('#teacherName').val();
      generateScores(name);
      window.history.pushState("", "", '/check/teacher?name=' + name);
      event.preventDefault();
    });

    var name = getUrlParameter('name');

    if(name != null) {
      $('#teacherName').val(name);
      generateScores(name);
    }
  // Otherwise we are on the teacher's home page
  } else {
    // Grab name and generate scores
    var name = $('#teacherName').html();
    generateScores(name);
  }
}

// Runs when document loaded
$(document).ready(function() {
  jQuery.ajaxSetup({ cache: false }); // Fix for IE11
  startup();
});

// Get rid of tooltips for mobile users
window.addEventListener('touchstart', function() {
  $('[data-toggle="tooltip"]').tooltip('dispose');
});
