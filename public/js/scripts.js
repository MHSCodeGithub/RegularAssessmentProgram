function handleClick(student, classCode, score) {
  $.get("/save?student="+student+"&classCode="+classCode+"&score="+score, function(string) {
    // Pass student, class and score data to server
  });
}

// Fill down score for particular class
function fillRadios(num, classCode) {
  $.get("/fillRadios?classCode="+classCode+"&score="+num, function(string) {
    // Pass class code and score to the server
  });
  var matches = document.querySelectorAll(".form-check-input");
  $.each(matches, function(i, stu) {
    if(stu.value == classCode && stu.id.slice(0,1) == num) {
      if (typeof document.getElementById(stu.id) != 'undefined') {
        document.getElementById(stu.id).checked = true;
        console.log("Fill down: " + stu.id);
      }
    }
  });
}

$(document).ready(function() {

  // AJAX request for Teacher's classes
  $( "#teacher-form" ).submit(function( event ) {
    var name = $('#name').val();
    $.getJSON("/teacher?name="+name, function(string) {
      //alert("JSON Received");

      // destroy any class lists that are already there
      $('#classes-card').remove();

      // Create tab list
      $('#classes').append("<div class='card' id='classes-card'></div>");
      $('#classes-card').append("<div class='card-header' id='classes-header'></div>");
      $('#classes-card').append("<div class='card-body' id='classes-body'></div>");
      $('#classes-header').append("<ul id='subject-tabs' class='nav nav-pills nav-fill' role='tablist'></ul>");

      // Loop through each subject and create a tab to click
      $.each(string, function(key,val) {

        if(key == 0) {
          $('#subject-tabs').append("<li class='nav-item'>" +
              "<a class='nav-link active' id='tab" + key + "' data-toggle='pill' href='#tab-container-" +
              key + "' role='tab' aria-controls='tab-container-" +  key + "' aria-selected='true'>" + val.code + "</a>");
        } else {
          $('#subject-tabs').append("<li class='nav-item'>" +
              "<a class='nav-link' id='tab" + key + "' data-toggle='pill' href='#tab-container-" +
              key + "' role='tab' aria-controls='tab-container-" +  key + "' aria-selected='true'>" + val.code + "</a>");
        }
      });

      // Create tab content container
      $('#classes-body').append("<div class='tab-content' id='tab-container'></div>");

      // Class list to hold DOM elements
      var classLists = [];

      // Create table of students
      $.each(string, function(x,y) {

        if(x == 0) {
          $('#tab-container').append("<div class='tab-pane fade show active' id='tab-container-" + x +
          "' role='tabpanel' aria-labelledby='tab" + x + "_" + y.code + "'></div>");
        } else {
          $('#tab-container').append("<div class='tab-pane fade' id='tab-container-" + x +
          "' role='tabpanel' aria-labelledby='tab" + x + "_" + y.code + "'></div>");
        }

        $('#tab-container-' + x).append("<form><table class='table table-striped'><thead><tr>" +
            "<th scope='col'>Name:</th>" +
            "<th scope='col'><a href='#' onClick='fillRadios(1, \""+y.code+"\");'>1 </a></th>" +
            "<th scope='col'><a href='#' onClick='fillRadios(2, \""+y.code+"\");'>2 </a></th>" +
            "<th scope='col'><a href='#' onClick='fillRadios(3, \""+y.code+"\");'>3 </a></th>" +
            "<th scope='col'><a href='#' onClick='fillRadios(4, \""+y.code+"\");'>4 </a></th>" +
            "<th scope='col'><a href='#' onClick='fillRadios(5, \""+y.code+"\");'>5 </a></th>" +
          "</tr></thead><tbody id='subjects-body-" + x + "''></tbody></table></form>");

        $.each(y.students, function(i, student) {
          $('#subjects-body-' + x).append("<tr>" +
              "<td>" + student + "</td>" +
              "<td><input class='form-check-input' type='radio' name='" + student + "' id='1" + "_" + i + "_"
              + y.code + "' value='" + y.code + "' onClick='handleClick(\""+student+"\", \""+y.code+"\", 1);'></td>" +
              "<td><input class='form-check-input' type='radio' name='" + student + "' id='2" + "_" + i + "_"
              + y.code + "' value='" + y.code + "' onClick='handleClick(\""+student+"\", \""+y.code+"\", 2);'></td>" +
              "<td><input class='form-check-input' type='radio' name='" + student + "' id='3" + "_" + i + "_"
              + y.code + "' value='" + y.code + "' onClick='handleClick(\""+student+"\", \""+y.code+"\", 3);'></td>" +
              "<td><input class='form-check-input' type='radio' name='" + student + "' id='4" + "_" + i + "_"
              + y.code + "' value='" + y.code + "' onClick='handleClick(\""+student+"\", \""+y.code+"\", 4);'></td>" +
              "<td><input class='form-check-input' type='radio' name='" + student + "' id='5" + "_" + i + "_"
              + y.code + "' value='" + y.code + "' onClick='handleClick(\""+student+"\", \""+y.code+"\", 5);'></td>" +
            "</tr>");

        });
      });

    });

    event.preventDefault();

  });

});
