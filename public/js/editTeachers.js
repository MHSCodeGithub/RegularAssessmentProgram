// get details of each teacher
$.getJSON("/getTeachers", function(teacher) {
  $('#display').append(
    "<table class='table table-striped'>" +
      "<thead>" +
        "<tr>" +
          "<th scope='col'>Name:</th>" +
          "<th scope='col'>DoE Username:</th>" +
          "<th scope='col'>Access:</th>" +
          "<th scope='col' style='width: 145px;'>Save / Delete:</th>" +
        "</tr>" +
      "</thead>" +
      "<tbody id='teacher-table'></tbody>" +
    "</table>"
  );
  $.each(teacher, function(key,val) {
    var convertedName = val.name.replace(/\s+/g, '-').toLowerCase();
    let access1,access2,access3;
    if(val.access == 1) { access1 = " selected " } else { access1 = " " };
    if(val.access == 2) { access2 = " selected " } else { access2 = " " };
    if(val.access == 3) { access3 = " selected " } else { access3 = " " };
    $('#teacher-table').append(
      "<tr id='" + convertedName + "-row'>" +
        "<td><a href='/queryTeacher?name=" + val.name + "'>" + val.name + "</a></td>" +
        "<td>" +
          "<input id='" + convertedName + "' class='form-control' value='" + val.username + "' " +
            "onkeydown='changed(\"" + convertedName + "\");' oninput='changed(\"" + convertedName + "\");'>" +
        "</td>" +
        "<td>" +
          "<select class='form-control' id='" + convertedName + "-access' onchange='changed(\"" + convertedName + "\");'>" +
            "<option value='1'" + access1 + ">Teacher</option>" +
            "<option value='2'" + access2 + ">Executive</option>" +
            "<option value='3'" + access3 + ">Administrator</option>" +
          "</select>" +
        "</td>" +
        "<td>" +
          "<button id='" + convertedName + "-save' class='btn btn-primary save-button' onclick='updateTeacher(\"" + val.name +
            "\", \"" + convertedName + "\")'>Save</button>" +
          "<button class='btn btn-danger' onclick='deleteTeacher(\"" + convertedName + "\")'>X</button>" +
        "</td>" +
      "</tr>"
    );
  });
});

function updateTeacher(teacherName, convertedName) {
  var username = $("#" + convertedName).val();
  var access = $("#" + convertedName +"-access").val();
  //console.log(username);
  $.getJSON("/updateTeacher?name="+teacherName+"&username="+username+"&access="+access, function(string) {
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

function deleteTeacher(teacher) {
  console.log("Deleted: " + teacher);
  $('#' + teacher + '-row').find('td').fadeOut(1000,
    function() {
        $(this).parents('tr:first').remove();
    });
}

$(document).ready(function() {



});
