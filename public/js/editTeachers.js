// get details of each teacher
$.getJSON("/getTeachers", function(teacher) {
  $('#display').append(
    "<table class='table table-striped'>" +
      "<thead>" +
        "<tr>" +
          "<th scope='col'>Name:</th>" +
          "<th scope='col'>DoE Username:</th>" +
          "<th scope='col'>Faculty:</th>" +
          "<th scope='col'>Access:</th>" +
          "<th scope='col' style='width: 145px;'>Save / Delete:</th>" +
        "</tr>" +
      "</thead>" +
      "<tbody id='teacher-table'></tbody>" +
    "</table>"
  );
  $.each(teacher, function(key,val) {

    var convertedName = val.name.replace(/\s+/g, '-').toLowerCase();

    // Detect access level for 'select' access input
    let access1,access2,access3;
    if(val.access == 1) { access1 = " selected " } else { access1 = " " };
    if(val.access == 2) { access2 = " selected " } else { access2 = " " };
    if(val.access == 3) { access3 = " selected " } else { access3 = " " };

    // Detect faculty for 'select' faculty input
    let faculty1,faculty2,faculty3,faculty4,faculty5,faculty6,faculty7,faculty8,faculty9;
    if(val.faculty == null) { faculty1 = " selected " } else { faculty1 = " " };
    if(val.faculty == "Other") { faculty1 = " selected " } else { faculty1 = " " };
    if(val.faculty == "English") { faculty2 = " selected " } else { faculty2 = " " };
    if(val.faculty == "Mathematics") { faculty3 = " selected " } else { faculty3 = " " };
    if(val.faculty == "Science") { faculty4 = " selected " } else { faculty4 = " " };
    if(val.faculty == "HSIE") { faculty5 = " selected " } else { faculty5 = " " };
    if(val.faculty == "PDHPE") { faculty6 = " selected " } else { faculty6 = " " };
    if(val.faculty == "TAS") { faculty7 = " selected " } else { faculty7 = " " };
    if(val.faculty == "CAPA") { faculty8 = " selected " } else { faculty8 = " " };
    if(val.faculty == "Special Ed") { faculty9 = " selected " } else { faculty9 = " " };

    // Build table of teachers and their details
    $('#teacher-table').append(
      "<tr id='" + convertedName + "-row'>" +
        "<td><a href='/queryTeacher?name=" + val.name + "'>" + val.name + "</a></td>" +
        "<td>" +
          "<input id='" + convertedName + "' class='form-control' value='" + val.username + "' " +
            "onkeydown='changed(\"" + convertedName + "\");' oninput='changed(\"" + convertedName + "\");'>" +
        "</td>" +
        "<td>" +
          "<select class='form-control' id='" + convertedName + "-faculty' onchange='changed(\"" + convertedName + "\");'>" +
            "<option value='Other'" + faculty1 + ">Other</option>" +
            "<option value='English'" + faculty2 + ">English</option>" +
            "<option value='Mathematics'" + faculty3 + ">Mathematics</option>" +
            "<option value='Science'" + faculty4 + ">Science</option>" +
            "<option value='HSIE'" + faculty5 + ">HSIE</option>" +
            "<option value='PDHPE'" + faculty6 + ">PDHPE</option>" +
            "<option value='TAS'" + faculty7 + ">TAS</option>" +
            "<option value='CAPA'" + faculty8 + ">CAPA</option>" +
            "<option value='Special Ed'" + faculty9 + ">Special Ed</option>" +
          "</select>" +
        "</td>" +
        "<td>" +
          "<select class='form-control' id='" + convertedName + "-access' onchange='changed(\"" + convertedName + "\");'>" +
            "<option value='1'" + access1 + ">Teacher</option>" +
            "<option value='2'" + access2 + ">Executive</option>" +
            "<option value='3'" + access3 + ">Administrator</option>" +
          "</select>" +
        "</td>" +
        "<td>" +
          "<button id='" + convertedName + "-save' class='btn btn-primary save-button' " +
            "onclick='updateTeacher(\"" + val.name + "\", \"" + convertedName + "\")'>Save</button>" +
          "<button class='btn btn-danger' onclick='deleteTeacher(\"" + val.name + "\", \"" + convertedName + "\")'>X</button>" +
        "</td>" +
      "</tr>"
    );

  });
});

function updateTeacher(teacherName, convertedName) {
  var username = $("#" + convertedName).val();
  var access = $("#" + convertedName +"-access").val();
  var faculty = $("#" + convertedName +"-faculty").val();
  $.getJSON("/updateTeacher?name="+teacherName+"&username="+username+"&access="
    +access+"&faculty="+faculty, function(string) {
    if(string.result) {
      console.log("Result: " + string.result);
      $('#' + convertedName + '-save').animate({
        opacity: '0.5'
      }).html("Success!").css("background-color", "#007bff" ).prop('disabled', true);
    } else {
      $('#' + convertedName + '-save').html("Error!").css("background-color", "#bd2130" ).prop('disabled', false);
    }
  });
}

function changed(convertedName) {
  $('#' + convertedName + '-save').animate({
    opacity: '1.0'
  }).html("Save").css("background-color", "#007bff" ).prop('disabled', false);
}

function deleteTeacher(teacherName, convertedName) {
  var posting = $.post( "/deleteTeacher", { teacher: teacherName });
  posting.done(function(success) {
    console.log(success);
    if(success == 'true') {
      console.log("Deleted: " + teacherName);
      $('#' + convertedName + '-row').find('td').fadeOut(1000,
        function() {
            $(this).parents('tr:first').remove();
        });
    } else {
      console.log("Could not delete teacher");
    }
  });
}

function addTeacher() {
  var teacherName = $('#teacherName').val();
  var convertedName = teacherName.replace(/\s+/g, '-').toLowerCase();
  var posting = $.post( "/addTeacher", { teacher: teacherName });
  posting.done(function(success) {
    console.log(success);
    if(success == 'true') {
      console.log("Added: " + teacherName);
      $("<tr id='" + convertedName + "-row'>" +
        "<td><a href='/queryTeacher?name=" + teacherName + "'>" + teacherName + "</a></td>" +
        "<td>" +
          "<input id='" + convertedName + "' class='form-control' " +
            "onkeydown='changed(\"" + convertedName + "\");' oninput='changed(\"" + convertedName + "\");'>" +
        "</td>" +
        "<td>" +
          "<select class='form-control' id='" + convertedName + "-faculty' onchange='changed(\"" + convertedName + "\");'>" +
            "<option value='Other' selected>Other</option>" +
            "<option value='English'>English</option>" +
            "<option value='Mathematics'>Mathematics</option>" +
            "<option value='Science'>Science</option>" +
            "<option value='HSIE'>HSIE</option>" +
            "<option value='PDHPE'>PDHPE</option>" +
            "<option value='TAS'>TAS</option>" +
            "<option value='CAPA'>CAPA</option>" +
            "<option value='Special Ed'>Special Ed</option>" +
          "</select>" +
        "</td>" +
        "<td>" +
          "<select class='form-control' id='" + convertedName + "-access' onchange='changed(\"" + convertedName + "\");'>" +
            "<option value='1' selected>Teacher</option>" +
            "<option value='2'>Executive</option>" +
            "<option value='3'>Administrator</option>" +
          "</select>" +
        "</td>" +
        "<td>" +
          "<button id='" + convertedName + "-save' class='btn btn-primary save-button' " +
            "onclick='updateTeacher(\"" + teacherName + "\", \"" + convertedName + "\")'>Save</button>" +
          "<button class='btn btn-danger' onclick='deleteTeacher(\"" + teacherName + "\", \"" + convertedName + "\")'>X</button>" +
        "</td>" +
      "</tr>").hide().prependTo('#teacher-table').fadeIn("slow");
    } else {
      console.log("Could not add teacher");
    }
  });
  $('#teacherName').val("");
}

$(document).ready(function() {
  $('#exportTeachers').click(function(event) {
    event.preventDefault();
    $.get("/exportTeachers", function(data) {
      let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(data);
      let exportFileDefaultName = 'teachers.json';
      let linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    });
  });
});
