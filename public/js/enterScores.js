// Autocomplete for Teacher text box
$.getJSON("/autocomplete", function(teachers) {
  $("#teacherName").autocomplete({
    source:[teachers]
  });
});


// Click handler for radio buttons
function handleClick(student, classCode, score) {
  //$.get("/save?student="+student+"&classCode="+classCode+"&score="+score);
  $.post( "/save", { student: student, classCode: classCode, score: score });
}

// Fill down score for particular class
function fillRadios(num, classCode) {
  let stuNames = [];
  let matches = document.querySelectorAll(".form-check-input");
  $.each(matches, function(i, stu) {
    if(stu.value == classCode && stu.id.slice(0,1) == num) {
      stuNames.push({name: stu.name});
      if (typeof document.getElementById(stu.id) != 'undefined') {
        document.getElementById(stu.id).checked = true;
      }
    }
  });
  $.post( "/fillRadios", { classCode: classCode, score: num, students: stuNames });
}

$(document).ready(function() {

  // AJAX request for Teacher's classes
  $("#teacher-form" ).submit(function( event ) {
    var name = $('#teacherName').val();
    $.getJSON("/teacher?name="+name, function(string) {

      // destroy any class lists that are already there
      $('#classes-card').remove();

      // Create tab list
      $('#classes').append("<div class='card' id='classes-card'></div>");
      $('#classes-card').append("<div class='card-header' id='classes-header'></div>");
      $('#classes-card').append("<div class='card-body' id='classes-body'></div>");
      $('#classes-header').append("<ul id='subject-tabs' class='nav nav-pills nav-fill' role='tablist'></ul>");

      // Loop through each subject and create a tab to click
      $.each(string, function(key,val) {

        // Dynamically creates the tabs for each subject
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

        // Dynamically creates the container for each tab
        if(x == 0) {
          $('#tab-container').append("<div class='tab-pane fade show active' id='tab-container-" + x +
          "' role='tabpanel' aria-labelledby='tab" + x + "_" + y.code + "'></div>");
        } else {
          $('#tab-container').append("<div class='tab-pane fade' id='tab-container-" + x +
          "' role='tabpanel' aria-labelledby='tab" + x + "_" + y.code + "'></div>");
        }

        // Dynamically creates the headings for each column
        $('#tab-container-' + x).append("<form><table class='table table-striped'><thead><tr>" +
            "<th scope='col'>Name:</th>" +
            "<th scope='col' class='scoreColumn'>" +
              "<a href='#' onClick='fillRadios(1, \""+y.code+"\");' data-toggle='tooltip' data-placement='bottom' title='Fill Down 1'>1 </a>" +
              "<a href='#' onClick='fillRadios(2, \""+y.code+"\");' data-toggle='tooltip' data-placement='bottom' title='Fill Down 2'>2 </a>" +
              "<a href='#' onClick='fillRadios(3, \""+y.code+"\");' data-toggle='tooltip' data-placement='bottom' title='Fill Down 3'>3 </a>" +
              "<a href='#' onClick='fillRadios(4, \""+y.code+"\");' data-toggle='tooltip' data-placement='bottom' title='Fill Down 4'>4 </a>" +
              "<a href='#' onClick='fillRadios(5, \""+y.code+"\");' data-toggle='tooltip' data-placement='bottom' title='Fill Down 5'>5 </a>" +
            "</th>" +
          "</tr></thead><tbody id='subjects-body-" + x + "'></tbody></table></form>");

        $.each(y.students, function(i, student) {

          // Checks radio buttons based on student's current score
          let checked1,checked2,checked3,checked4,checked5;
          if(student.score == 1) { checked1 = "checked" } else { checked1 = " " };
          if(student.score == 2) { checked2 = "checked" } else { checked2 = " " };
          if(student.score == 3) { checked3 = "checked" } else { checked3 = " " };
          if(student.score == 4) { checked4 = "checked" } else { checked4 = " " };
          if(student.score == 5) { checked5 = "checked" } else { checked5 = " " };

          // Dynamically creates the radio buttons
          $('#subjects-body-' + x).append(
            "<tr>" +
              "<td>" + student.name + "</td>" +
              "<td class='scoreColumn'>" +
                // Radio Button 1
                "<input class='form-check-input' " + checked1 + " type='radio' name='" + student.name + "' id='1" + "_" +
                i + "_" + y.code + "' value='" + y.code + "' onClick='handleClick(\""+student.name+"\", \""+y.code+"\", 1);'>" +
                "<label for='1" + "_" + i + "_" + y.code + "' class='scoreRadio'>1</label>" +
                // Radio Button 2
                "<input class='form-check-input' " + checked2 + " type='radio' name='" + student.name + "' id='2" + "_" +
                i + "_" + y.code + "' value='" + y.code + "' onClick='handleClick(\""+student.name+"\", \""+y.code+"\", 2);'>" +
                "<label for='2" + "_" + i + "_" + y.code + "' class='scoreRadio'>2</label>" +
                // Radio Button 3
                "<input class='form-check-input' " + checked3 + " type='radio' name='" + student.name + "' id='3" + "_" +
                i + "_" + y.code + "' value='" + y.code + "' onClick='handleClick(\""+student.name+"\", \""+y.code+"\", 3);'>" +
                "<label for='3" + "_" + i + "_" + y.code + "' class='scoreRadio'>3</label>" +
                // Radio Button 4
                "<input class='form-check-input' " + checked4 + " type='radio' name='" + student.name + "' id='4" + "_" +
                i + "_" + y.code + "' value='" + y.code + "' onClick='handleClick(\""+student.name+"\", \""+y.code+"\", 4);'>" +
                "<label for='4" + "_" + i + "_" + y.code + "' class='scoreRadio'>4</label>" +
                // Radio Button 5
                "<input class='form-check-input' " + checked5 + " type='radio' name='" + student.name + "' id='5" + "_" +
                i + "_" + y.code + "' value='" + y.code + "' onClick='handleClick(\""+student.name+"\", \""+y.code+"\", 5);'>" +
                "<label for='5" + "_" + i + "_" + y.code + "' class='scoreRadio'>5</label>" +
              "</td>" +
            "</tr>");

        });
      });

      $('[data-toggle="tooltip"]').tooltip();

    });

    // Prevent form submission
    event.preventDefault();

  });




});
