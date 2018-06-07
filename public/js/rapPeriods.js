function setCurrent(year, term, week) {
  var button = event.target;
  var currentString = `<h5><strong>Current Period: </strong>Week ${week}, Term ${term}, ${year}</h5>`;
  var statusString = `<h5><strong>Status:</strong> Locked</h5>`;
  var posting = $.post( "/setCurrentPeriod", { year: year, term: term, week: week, active: false });
  posting.done(function(success) {
    if(success == "true") {
      $(".btn-primary").prop('disabled', false);
      $(button).prop('disabled', true);
      $(".btn-secondary").prop('disabled', true).html("Set Active");
      $(button).closest('tr').find('.btn-secondary').prop('disabled', false).html("Set Active");
      $('#currentPeriod').empty();
      $('#currentStatus').empty();
      $('#currentPeriod').append(currentString);
      $('#currentStatus').append(statusString);
    } else {
      alert("An error occured");
    }
  });
}

function setActive(year, term, week) {
  var button = event.target;
  var currentString = `<h5><strong>Current Period: </strong>Week ${week}, Term ${term}, ${year}</h5>`;
  if($(button).html() == "Set Active") {
    var statusString = `<h5><strong>Status:</strong> Active</h5>`;
    var posting = $.post( "/setCurrentPeriod", { year: year, term: term, week: week, active: true });
    posting.done(function(success) {
      if(success == "true") {
        $(button).html("Lock");
        $('#currentStatus').empty();
        $('#currentStatus').append(statusString);
      } else {
        alert("An error occured");
      }
    });
  } else {
    var statusString = `<h5><strong>Status:</strong> Locked</h5>`;
    var posting = $.post( "/setCurrentPeriod", { year: year, term: term, week: week, active: false });
    posting.done(function(success) {
      if(success == "true") {
        $(button).html("Set Active");
        $('#currentStatus').empty();
        $('#currentStatus').append(statusString);
      } else {
        alert("An error occured");
      }
    });
  }

}

// Generate the table of scores
function generatePeriods() {
  $('#periods').append("<div id='loading-spinner'></div>");
  $('#loading-spinner').jmspinner('large');
  $.getJSON("/getRapPeriods", function(jsonData) {
    if(jsonData == null) {
      $('#periods').empty();
      $('#periods').append("<h5 id='not-found'>No RAP periods found</h5>");
    } else {
      $('#periods').empty();
      $('#periods').append(
        "<table class='table table-striped scores-table text-center' id='scores-table'>" +
          "<thead>" +
            "<tr>" +
              "<th style='width:20%' scope='col'>Year</th>" +
              "<th style='width:20%' scope='col'>Term</th>" +
              "<th style='width:20%' scope='col'>Week</th>" +
              "<th style='width:20%' scope='col'>Current</th>" +
              "<th style='width:20%' scope='col'>Active</th>" +
            "</tr>" +
          "</thead>" +
          "<tbody id='periods-body'></tbody>" +
        "</table>"
      );
      $.each(jsonData, function(key,period) {
        var id1 = period.year+","+period.term+","+period.week+"-current";
        var id2 = period.year+","+period.term+","+period.week+"-current";
        if(period.current == true) {
          let currentString = `<h5><strong>Current Period: </strong>Week ${period.week}, Term ${period.term}, ${period.year}</h5>`;
          if(period.active == true) {
            var statusString = `<h5><strong>Status:</strong> Active</h5>`;
            $('#currentPeriod').append(currentString);
            $('#currentStatus').append(statusString);
            $('#periods-body').append(
              "<tr>" +
                "<td>" + period.year + "</td>" +
                "<td>" + period.term + "</td>" +
                "<td>" + period.week + "</td>" +
                "<td><button id="+id1+" type='submit' class='btn btn-primary' style='width: 100%;' disabled " +
                  "onclick='setCurrent("+period.year+","+period.term+","+period.week+")'>Set Current</button></td>" +
                "<td><button id="+id2+" type='submit' class='btn btn-secondary' style='width: 100%;' " +
                  "onclick='setActive("+period.year+","+period.term+","+period.week+")'>Lock</button></td>" +
              "</tr>"
            );
          } else {
            var statusString = `<h5><strong>Status:</strong> Locked</h5>`;
            $('#currentPeriod').append(currentString);
            $('#currentStatus').append(statusString);
            $('#periods-body').append(
              "<tr>" +
                "<td>" + period.year + "</td>" +
                "<td>" + period.term + "</td>" +
                "<td>" + period.week + "</td>" +
                "<td><button id="+id1+" type='submit' class='btn btn-primary' style='width: 100%;' disabled " +
                  "onclick='setCurrent("+period.year+","+period.term+","+period.week+")'>Set Current</button></td>" +
                "<td><button id="+id2+" type='submit' class='btn btn-secondary' style='width: 100%;' " +
                  "onclick='setActive("+period.year+","+period.term+","+period.week+")'>Set Active</button></td>" +
              "</tr>"
            );
          }

        }
        else {
          $('#periods-body').append(
            "<tr>" +
              "<td>" + period.year + "</td>" +
              "<td>" + period.term + "</td>" +
              "<td>" + period.week + "</td>" +
              "<td><button id="+id1+" type='submit' class='btn btn-primary' style='width: 100%;' " +
                "onclick='setCurrent("+period.year+","+period.term+","+period.week+")'>Set Current</button></td>" +
                "<td><button id="+id2+" type='submit' class='btn btn-secondary' style='width: 100%;' disabled " +
                  "onclick='setActive("+period.year+","+period.term+","+period.week+")'>Set Active</button></td>" +
            "</tr>"
          );
        }
      });
    }
  });
}

$(document).ready(function() {
    generatePeriods();
});
