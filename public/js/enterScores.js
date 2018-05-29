var studentNumber = 0;

function labelClick() {
  event.preventDefault();
}

// Click handler for radio buttons
function handleClick(student, classCode, score, teacher, obj) {

  var id = $(event.target).prev().attr('id');
  var posting = $.post( "/save", { student: unescape(student), classCode: classCode, score: score, teacher: teacher });

  posting.done(function(success) {
    console.log("Success: " + success);
    if(success == "true") {
      $("#" + id).prop("checked", true);
    } else {
      console.log("unsuccessful");
      $("#" + id).prop("checked", false);
    }
  });
}

// Fill down score for particular class
function fillRadios(num, classCode, teacher) {
  let stuNames = [];
  let matches = document.querySelectorAll(".form-check-input");
  $.each(matches, function(i, stu) {
    if(stu.value == classCode && stu.id.slice(0,1) == num) {
      stuNames.push({name: unescape(stu.name)});
      if (typeof document.getElementById(stu.id) != 'undefined') {
        document.getElementById(stu.id).checked = true;
      }
    }
  });
  $.post( "/fillRadios", { classCode: classCode, score: num, students: stuNames, teacher: teacher });
}

// Generate the HTML for student scores for each class
function generateScores(name) {

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

    $('#subject-tabs').append(
      "<li class='nav-item ml-auto' style='flex: 0 0 60px;' " +
        "data-toggle='tooltip' data-placement='bottom' title='Add a Missing Class'>" +
        "<a class='nav-link' id='tab-add' data-toggle='pill' href='#tab-container-add' role='tab' " +
          "aria-controls='tab-container-add' aria-selected='true'>" +
           "<i class='fa fa-plus' aria-hidden='true'></i>" +
          "</a>" +
      "</li>"
    );

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

      // Search box and button to add students missing from class
      $('#tab-container-' + x).append(
        "<div class='row' id='add-student'>" +
          "<div class='col-lg-8 col-md-6 col-sm-12 col-xs-12'>" +
            "<input type='text' class='form-control studentNames form-control-lg' id='" + y.code + "' placeholder='Missing Student Name' " +
            "data-toggle='tooltip' data-placement='bottom' title='If a student is missing from " + y.code + " add them here'>" +
          "</div>" +
          "<div class='col-lg-2 col-md-3 col-sm-6 col-xs-6'>" +
            "<button class='btn btn-primary btn-lg' style='width: 100%;' " +
              "onclick='addStudent(\"" + y.code + "\", \"" + name + "\", \"" + y.subject +
              "\", " + x + ")'>Add Student</button>" +
          "</div>" +
          "<div class='col-lg-2 col-md-3 col-sm-6 col-xs-6'>" +
            "<button class='btn btn-danger btn-lg' style='width: 100%;' " +
              "onclick='removeClass(\"" + y.code + "\")'>Remove Class</button>" +
          "</div>" +
        "</div>"
      );

      // Dynamically creates the headings for each column
      $('#tab-container-' + x).append(
        "<div class='row'>" +
          "<div class='col-sm-12'>" +
            "<table class='table table-striped'>" +
              "<thead>" +
                "<tr>" +
                  "<th scope='col' style='width: 20px;'></th>" +
                  "<th scope='col'>Name:</th>" +
                  "<th scope='col' class='scoreColumn'>" +
                    "<a href='#' onClick='fillRadios(1, \""+y.code+"\", \"" + name + "\");' data-toggle='tooltip' data-placement='bottom' title='Fill Down 1'>1 </a>" +
                    "<a href='#' onClick='fillRadios(2, \""+y.code+"\", \"" + name + "\");' data-toggle='tooltip' data-placement='bottom' title='Fill Down 2'>2 </a>" +
                    "<a href='#' onClick='fillRadios(3, \""+y.code+"\", \"" + name + "\");' data-toggle='tooltip' data-placement='bottom' title='Fill Down 3'>3 </a>" +
                    "<a href='#' onClick='fillRadios(4, \""+y.code+"\", \"" + name + "\");' data-toggle='tooltip' data-placement='bottom' title='Fill Down 4'>4 </a>" +
                    "<a href='#' onClick='fillRadios(5, \""+y.code+"\", \"" + name + "\");' data-toggle='tooltip' data-placement='bottom' title='Fill Down 5'>5 </a>" +
                  "</th>" +
                "</tr>" +
              "</thead>" +
              "<tbody id='subjects-body-" + x + "'></tbody>" +
            "</table>" +
          "</div>" +
        "</div>"
      );

      $.each(y.students, function(i, student) {

        studentNumber++;
        student.name = escape(student.name);
        var convertedName = student.name.replace(/\s+/g, '-').toLowerCase();

        // Checks radio buttons based on student's current score
        var checked1 = "";
        var checked2 = "";
        var checked3 = "";
        var checked4 = "";
        var checked5 = "";
        if(student.score == 1) { checked1 = "checked" };
        if(student.score == 2) { checked2 = "checked" };
        if(student.score == 3) { checked3 = "checked" };
        if(student.score == 4) { checked4 = "checked" };
        if(student.score == 5) { checked5 = "checked" };

        // Dynamically creates the radio buttons
        $('#subjects-body-' + x).append(
          "<tr id='" + studentNumber + "'>" +
            "<td class='student-delete'>" +
              "<button class='btn btn-danger btn-delete' id=\"" + convertedName + "-delete\"" +
              "data-toggle='tooltip' data-placement='bottom' title='Remove Student' " +
              "onclick='deleteStudent(\"" + student.name + "\", \"" + y.code + "\", \"" + studentNumber + "\", \"" + name + "\")'>X</button>" +
            "</td>" +
            "<td class='student-label'><a href='check/single?name=" + unescape(student.name) + "'>" + unescape(student.name) + "</a></td>" +
            "<td class='scoreColumn'>" +

              // Radio Button 1
              "<input class='form-check-input' " + checked1 + " type='radio' name='" + student.name + "' " +
              "id='1" + "_" + i + "_" + y.code + "' value='" + y.code + "'>" +
              "<label for='1" + "_" + i + "_" + y.code + "' class='scoreRadio' onclick='labelClick();'" +
              "onmouseup='handleClick(\""+student.name+"\", \""+y.code+"\", 1, \"" + name + "\", this);' " +
              "data-toggle='tooltip' data-placement='bottom' title='Unsatisfactory Performance'>1</label>" +

              // Radio Button 2
              "<input class='form-check-input' " + checked2 + " type='radio' name='" + student.name + "' " +
              "id='2" + "_" + i + "_" + y.code + "' value='" + y.code + "'>" +
              "<label for='2" + "_" + i + "_" + y.code + "' class='scoreRadio' onclick='labelClick();' " +
              "onmouseup='handleClick(\""+student.name+"\", \""+y.code+"\", 2, \"" + name + "\");' " +
              "data-toggle='tooltip' data-placement='bottom' title='Of Concern'>2</label>" +

              // Radio Button 3
              "<input class='form-check-input' " + checked3 + " type='radio' name='" + student.name + "' " +
              "id='3" + "_" + i + "_" + y.code + "' value='" + y.code + "'>" +
              "<label for='3" + "_" + i + "_" + y.code + "' class='scoreRadio' onclick='labelClick();' " +
              "onmouseup='handleClick(\""+student.name+"\", \""+y.code+"\", 3, \"" + name + "\");' " +
              "data-toggle='tooltip' data-placement='bottom' title='Good'>3</label>" +

              // Radio Button 4
              "<input class='form-check-input' " + checked4 + " type='radio' name='" + student.name + "' " +
              "id='4" + "_" + i + "_" + y.code + "' value='" + y.code + "'>" +
              "<label for='4" + "_" + i + "_" + y.code + "' class='scoreRadio' onclick='labelClick();' " +
              "onmouseup='handleClick(\""+student.name+"\", \""+y.code+"\", 4, \"" + name + "\");' " +
              "data-toggle='tooltip' data-placement='bottom' title='Excellent'>4</label>" +

              // Radio Button 5
              "<input class='form-check-input' " + checked5 + " type='radio' name='" + student.name + "' " +
              "id='5" + "_" + i + "_" + y.code + "' value='" + y.code + "'>" +
              "<label for='5" + "_" + i + "_" + y.code + "' class='scoreRadio' onclick='labelClick();' " +
              "onmouseup='handleClick(\""+student.name+"\", \""+y.code+"\", 5, \"" + name + "\");'" +
              "data-toggle='tooltip' data-placement='bottom' title='Outstanding'>5</label>" +

            "</td>" +
          "</tr>"
        );

      });
    });

    $('#tab-container').append(
      "<div class='tab-pane fade' id='tab-container-add' role='tabpanel' aria-labelledby='tab-add'>" +
        "<div class='row' id='add-class'>" +
          "<div class='col-lg-9 col-md-8 col-sm-6 col-xs-12'>" +
            "<input id='classInput' type='text' class='form-control classCodes form-control-lg' placeholder='Missing Class Code' " +
            "data-toggle='tooltip' data-placement='bottom' title='Search for the missing class'>" +
          "</div>" +
          "<div class='col-lg-3 col-md-4 col-sm-6 col-xs-12'>" +
            "<button class='btn btn-primary btn-lg' style='width: 100%;' " +
              "onClick='addClass();'>Add Missing Class</button>" +
          "</div>" +
        "</div>" +
      "</div>"
    );

    // Activate tooltips
    $('[data-toggle="tooltip"]').tooltip();

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

  });

}

// Remove and re-add tooltips
function refreshTooltips() {
  $('[data-toggle="tooltip"]').tooltip('dispose');
  $('[data-toggle="tooltip"]').tooltip();
}

// Add class
function addClass() {
  var classCode = $('#classInput').val();
  var name;
  if ($('#teacher-form').length) {
    name = $('#teacherName').val();
  } else {
    name = $('#teacherName').html();
  }
  var posting = $.post( "/addClass", { classCode: classCode, teacher: name });

  posting.done(function(success) {
    console.log(success);
    $('[data-toggle="tooltip"]').tooltip('dispose');
    generateScores(name);
  });
}

// Remove class
function removeClass(classCode) {
  if (confirm('Are you sure you want to remove ' + classCode)) {
    var name;
    if ($('#teacher-form').length) {
      name = $('#teacherName').val();
    } else {
      name = $('#teacherName').html();
    }
    var posting = $.post( "/removeClass", { classCode: classCode, teacher: name });

    posting.done(function(success) {
      console.log(success);
      $('[data-toggle="tooltip"]').tooltip('dispose');
      generateScores(name);
    });
  }
}

// Add a missing student
function addStudent(classCode, teacher, subject, x) {
  var student = escape($('#' + classCode).val());
  var convertedName = student.replace(/\s+/g, '-').toLowerCase();
  var posting = $.post( "/addStudent", { student: unescape(student), classCode: classCode, subject: subject, teacher: teacher });

  posting.done(function(success) {
    console.log(success);
    if(success == 'true') {
      studentNumber++;
      console.log(studentNumber);
      $('[data-toggle="tooltip"]').tooltip('dispose');
      $("<tr id='" + studentNumber + "'>" +
        "<td class='student-delete'>" +
          "<button class='btn btn-danger btn-delete' id=\"" + convertedName + "-delete\"" +
          "data-toggle='tooltip' data-placement='bottom' title='Remove Student' " +
          "onclick='deleteStudent(\"" + student + "\" , \"" + classCode + "\", \"" + studentNumber + "\", \"" + teacher + "\")'>X</button>" +
        "</td>" +
          "<td class='student-label'><a href='check/single?name=" + unescape(student) + "'>" + unescape(student) + "</a></td>" +
          "<td class='scoreColumn'>" +

            // Radio Button 1
            "<input class='form-check-input' type='radio' name='" + student + "' id='1" + "_" +
            studentNumber + "_" + classCode + "' value='" + classCode + "'>" +
            "<label for='1" + "_" + studentNumber + "_" + classCode + "' class='scoreRadio' onclick='labelClick();' " +
            "onmouseup='handleClick(\""+student+"\", \""+classCode+"\", 1, \"" + teacher + "\");' " +
            "data-toggle='tooltip' data-placement='bottom' title='Unsatisfactory Performance'>1</label>" +

            // Radio Button 2
            "<input class='form-check-input' type='radio' name='" + student.name + "' id='2" + "_" +
            studentNumber + "_" + classCode + "' value='" + classCode + "'>" +
            "<label for='2" + "_" + studentNumber + "_" + classCode + "' class='scoreRadio' onclick='labelClick();' " +
            "onmouseup='handleClick(\""+student+"\", \""+classCode+"\", 2, \"" + teacher + "\");' " +
            "data-toggle='tooltip' data-placement='bottom' title='Of Concern'>2</label>" +

            // Radio Button 3
            "<input class='form-check-input' type='radio' name='" + student.name + "' id='3" + "_" +
            studentNumber + "_" + classCode + "' value='" + classCode + "'>" +
            "<label for='3" + "_" + studentNumber + "_" + classCode + "' class='scoreRadio' onclick='labelClick();' " +
            "onmouseup='handleClick(\""+student+"\", \""+classCode+"\", 3, \"" + teacher + "\");' " +
            "data-toggle='tooltip' data-placement='bottom' title='Good'>3</label>" +

            // Radio Button 4
            "<input class='form-check-input' type='radio' name='" + student.name + "' id='4" + "_" +
            studentNumber + "_" + classCode + "' value='" + classCode + "'>" +
            "<label for='4" + "_" + studentNumber + "_" + classCode + "' class='scoreRadio' onclick='labelClick();' " +
            "onmouseup='handleClick(\""+student+"\", \""+classCode+"\", 4, \"" + teacher + "\");' " +
            "data-toggle='tooltip' data-placement='bottom' title='Excellent'>4</label>" +

            // Radio Button 5
            "<input class='form-check-input' type='radio' name='" + student.name + "' id='5" + "_" +
            studentNumber + "_" + classCode + "' value='" + classCode + "'>" +
            "<label for='5" + "_" + studentNumber + "_" + classCode + "' class='scoreRadio' onclick='labelClick();' " +
            "onmouseup='handleClick(\""+student+"\", \""+classCode+"\", 5, \"" + teacher + "\");' " +
            "data-toggle='tooltip' data-placement='bottom' title='Outstanding'>5</label>" +

          "</td>" +
        "</tr>"
      ).hide().prependTo('#subjects-body-' + x).fadeIn("slow");
    } else {
      alert("Student not enrolled, or student already in your class");
    }
    $('[data-toggle="tooltip"]').tooltip();
  });
}

// Delete student from class
function deleteStudent(studentName, classCode, num, teacher) {

  var posting = $.post( "/deleteStudent", { student: unescape(studentName), classCode: classCode, teacherName: teacher });

  posting.done(function(success) {
    console.log(success);
    if(success == 'true') {
      console.log("Deleted: " + studentName);
      $('[data-toggle="tooltip"]').tooltip('dispose');
      $('#' + num).find('td').fadeOut(1000,
        function() {
            $(this).parents('tr:first').remove();
        });
      $('[data-toggle="tooltip"]').tooltip();
    } else {
      console.log("Could not delete student");
    }
  });
}

// Functions to run on startup
function startup() {
  // If we are on the student search page
  if ($('#teacher-form').length) {
    // Autocomplete for Teacher text box
    $.getJSON("/autocomplete", function(teachers) {
      $("#teacherName").autocomplete({
        source:[teachers]
      });
    });
    // AJAX request for Teacher's classes
    $("#teacher-form" ).submit(function( event ) {
      var name = $('#teacherName').val();
      generateScores(name);
      event.preventDefault();
    });
  // Otherwise we are on the teacher's home page
  } else {
    // Grab name and generate scores
    var name = $('#teacherName').html();
    generateScores(name);
  }
}

// Runs when document loaded
$(document).ready(function() {
  jQuery.ajaxSetup({ cache: false });
  startup();
});

// Get rid of tooltips for mobile users
window.addEventListener('touchstart', function() {
  $('[data-toggle="tooltip"]').tooltip('dispose');
});
