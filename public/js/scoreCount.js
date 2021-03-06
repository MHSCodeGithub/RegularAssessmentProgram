function longTermCohortChart() {
  //console.log("Generating chart...");
  $('#chart').hide();
  $('#loading').show();
  $('#loading').append("<div id='loading-spinner'></div>");
  $('#loading-spinner').jmspinner('large');
  $.getJSON("/getCohortAverage", function(values) {
    console.log(values);
    var canvas = document.getElementById("chart");
    var ctx = canvas.getContext('2d');
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: values.year7.periods,
            datasets:
            [
              {
                label: 'Year 7',
                data: values.year7.averages,
                backgroundColor: 'rgba(255, 99, 132, 1)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHitRadius: 12,
                fill: false,
              },
              {
                label: 'Year 8',
                data: values.year8.averages,
                backgroundColor: 'rgba(255, 206, 86, 1)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHitRadius: 12,
                fill: false,
              },
              {
                label: 'Year 9',
                data: values.year9.averages,
                backgroundColor: 'rgba(75, 192, 192, 1)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHitRadius: 12,
                fill: false,
              },
              {
                label: 'Year 10',
                data: values.year10.averages,
                backgroundColor: 'rgba(255, 159, 64, 1)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHitRadius: 12,
                fill: false,
              }
            ]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:false
                    }
                }]
            },
            legend: {
              display: true
            }
        }
    });
    $('#loading').fadeOut(200).empty();
    $('#chart').fadeIn(400);
      $.getJSON("/getGroupAverage?current=true", function(group) {
        $('#loading').fadeOut(200).empty();
        $('#chart').fadeIn(400);
        $('#stats').empty().hide();
        $('#stats').append("<div class='ml-5'><h5>Year 7: <strong>" + group.year7 + "</strong></h4></div>");
        $('#stats').append("<div class='ml-5'><h5>Year 8: <strong>" + group.year8 + "</strong></h4></div>");
        $('#stats').append("<div class='ml-5'><h5>Year 9: <strong>" + group.year9 + "</strong></h4></div>");
        $('#stats').append("<div class='ml-5'><h5>Year 10: <strong>" + group.year10 + "</strong></h4></div>");
        $('#stats').fadeIn(800);
    });
  });
}

function longTermYearGroupChart() {
  //console.log("Generating chart...");
  $('#chart').hide();
  $('#loading').show();
  $('#loading').append("<div id='loading-spinner'></div>");
  $('#loading-spinner').jmspinner('large');
  $.getJSON("/getGroupAverage", function(values) {
    console.log(values);
    var canvas = document.getElementById("chart");
    var ctx = canvas.getContext('2d');
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: values.year7.periods,
            datasets:
            [
              {
                label: 'Year 7',
                data: values.year7.averages,
                backgroundColor: 'rgba(255, 99, 132, 1)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHitRadius: 12,
                fill: false,
              },
              {
                label: 'Year 8',
                data: values.year8.averages,
                backgroundColor: 'rgba(255, 206, 86, 1)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHitRadius: 12,
                fill: false,
              },
              {
                label: 'Year 9',
                data: values.year9.averages,
                backgroundColor: 'rgba(75, 192, 192, 1)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHitRadius: 12,
                fill: false,
              },
              {
                label: 'Year 10',
                data: values.year10.averages,
                backgroundColor: 'rgba(255, 159, 64, 1)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHitRadius: 12,
                fill: false,
              }
            ]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:false
                    }
                }]
            },
            legend: {
              display: true
            }
        }
    });
    $('#loading').fadeOut(200).empty();
    $('#chart').fadeIn(400);
      $.getJSON("/getGroupAverage?current=true", function(group) {
        $('#loading').fadeOut(200).empty();
        $('#chart').fadeIn(400);
        $('#stats').empty().hide();
        $('#stats').append("<div class='ml-5'><h5>Year 7: <strong>" + group.year7 + "</strong></h4></div>");
        $('#stats').append("<div class='ml-5'><h5>Year 8: <strong>" + group.year8 + "</strong></h4></div>");
        $('#stats').append("<div class='ml-5'><h5>Year 9: <strong>" + group.year9 + "</strong></h4></div>");
        $('#stats').append("<div class='ml-5'><h5>Year 10: <strong>" + group.year10 + "</strong></h4></div>");
        $('#stats').fadeIn(800);
    });
  });
}

function longTermChart() {
  //console.log("Generating chart...");
  $('#chart').hide();
  $('#loading').show();
  $('#loading').append("<div id='loading-spinner'></div>");
  $('#loading-spinner').jmspinner('large');
  $.getJSON("/getWholeAverage", function(values) {
    console.log(values.averages);
    var canvas = document.getElementById("chart");
    var ctx = canvas.getContext('2d');
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: values.periods,
            datasets: [{
                label: 'Average',
                data: values.averages,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            },
            legend: {
              display: false
            }
        }
    });
    $('#loading').fadeOut(200).empty();
    $('#chart').fadeIn(400);
    $.getJSON("/getWholeAverage?current=true", function(average) {
      $('#stats').empty().hide();
      $('#stats').append("<h5>Whole School Average: <strong>" + average + "</strong></h4>");
      $('#stats').fadeIn(400);
    });
  });
}

function wholeSchoolChart() {
  console.log("Generating chart...");
  $('#chart').hide();
  $('#loading').show();
  $('#loading').append("<div id='loading-spinner'></div>");
  $('#loading-spinner').jmspinner('large');
  $.getJSON("/countScores", function(values) {
    console.log(values);
    var canvas = document.getElementById("chart");
    var ctx = canvas.getContext('2d');
    var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Ones", "Twos", "Threes", "Fours", "Fives"],
            datasets: [{
                label: 'Count',
                data: values.percentages.whole,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            },
            legend: {
              display: false
            }
        }
    });
    $('#loading').fadeOut(200).empty();
    $('#chart').fadeIn(400);
    $.getJSON("/getWholeAverage?current=true", function(average) {
      $('#stats').empty().hide();
      $('#stats').append("<h5>Whole School Average: <strong>" + average + "</strong></h4>");
      $('#stats').fadeIn(400);
    });
  });
}

function studentLoginsChart() {
  //console.log("Generating chart...");
  $('#chart').hide();
  $('#loading').show();
  $('#loading').append("<div id='loading-spinner'></div>");
  $('#loading-spinner').jmspinner('large');
  $.getJSON("/trackChecked", function(values) {
    var canvas = document.getElementById("chart");
    var ctx = canvas.getContext('2d');
    var data = [values.unchecked,values.checked];
    var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Unchecked", "Checked"],
            datasets: [{
                label: 'Count',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            },
            legend: {
              display: false
            }
        }
    });
    $('#loading').fadeOut(200).empty();
    $('#chart').fadeIn(400);
    $.getJSON("/getWholeAverage", function(average) {
      $('#stats').empty().hide();
      $('#stats').append("<h5>Number of Student Logins: <strong><a href='../check/logins'>" + values.checked + "</a></strong></h4>");
      $('#stats').fadeIn(400);
    });
  });
}

function byYearChart() {
  //console.log("Generating chart...");
  $('#chart').hide();
  $('#loading').show();
  $('#loading').append("<div id='loading-spinner'></div>");
  $('#loading-spinner').jmspinner('large');
  $.getJSON("/countScores", function(scores) {
    $.getJSON("/getGroupAverage?current=true", function(group) {

      var year7average = group.year7;
      var year8average = group.year8;
      var year9average = group.year9;
      var year10average = group.year10;

      var canvas = document.getElementById("chart");
      var ctx = canvas.getContext('2d');
      var chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ["Ones", "Twos", "Threes", "Fours", "Fives"],
            datasets: [
                {
                    label: "Year 7",
                    backgroundColor: "blue",
                    data: scores.percentages.year7
                },
                {
                    label: "Year 8",
                    backgroundColor: "red",
                    data: scores.percentages.year8
                },
                {
                    label: "Year 9",
                    backgroundColor: "green",
                    data: scores.percentages.year9
                },
                {
                    label: "Year 10",
                    backgroundColor: "orange",
                    data: scores.percentages.year10
                }
            ]
          },
          options: {
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero:true
                      }
                  }]
              },
              legend: {
                display: true
              }
          }
      });
      $('#loading').fadeOut(200).empty();
      $('#chart').fadeIn(400);
      $('#stats').empty().hide();
      $('#stats').append("<div class='ml-5'><h5>Year 7: <strong>" + year7average + "</strong></h4></div>");
      $('#stats').append("<div class='ml-5'><h5>Year 8: <strong>" + year8average + "</strong></h4></div>");
      $('#stats').append("<div class='ml-5'><h5>Year 9: <strong>" + year9average + "</strong></h4></div>");
      $('#stats').append("<div class='ml-5'><h5>Year 10: <strong>" + year10average + "</strong></h4></div>");
      $('#stats').fadeIn(800);
    });
  });
}

function longTermGenderChart(year) {
  $('#chart').remove();
  $('#content').prepend(
    "<canvas id='chart' width='500px' height='220px' />"
  );
  $('#chart').hide();
  $('#loading').show();
  $('#loading').append("<div id='loading-spinner'></div>");
  $('#loading-spinner').jmspinner('large');
  $.getJSON("/getGenderAverage?year="+year, function(values) {
    $('#chart').empty();
    var boys = values.male.averages[values.male.averages.length-1];
    var girls = values.female.averages[values.female.averages.length-1];
    var canvas = document.getElementById("chart");
    var ctx = canvas.getContext('2d');
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: values.male.periods,
            datasets:
            [
              {
                label: 'Boys',
                data: values.male.averages,
                backgroundColor: 'rgba(255, 99, 132, 1)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHitRadius: 12,
                fill: false,
              },
              {
                label: 'Girls',
                data: values.female.averages,
                backgroundColor: 'rgba(255, 206, 86, 1)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHitRadius: 12,
                fill: false,
              }
            ]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:false
                    }
                }]
            },
            legend: {
              display: true
            }
        }
    });
    $('#loading').fadeOut(200).empty();
    $('#chart').fadeIn(400);
      $('#loading').fadeOut(200).empty();
      $('#chart').fadeIn(400);
      $('#stats').empty().hide();
      $('#stats').append("<div class='ml-5'><h5>Boys: <strong>" + boys + "</strong></h4></div>");
      $('#stats').append("<div class='ml-5'><h5>Girls: <strong>" + girls + "</strong></h4></div>");
      $('#stats').fadeIn(800);
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
  jQuery.ajaxSetup({ cache: false });
  var type = getUrlParameter('type');
  if(type == null || type == 'byWhole') {
    wholeSchoolChart();
    $('#pageTitle').html("Whole School Score Distribution");
    $('#explanation').html("Shows the distribution of each score (1-5) for the current RAP Period.");
  } else if(type == 'longTerm') {
    longTermChart();
    $('#pageTitle').html("Long-Term School Averages");
    $('#explanation').html("Shows the whole school average score for each RAP Period.");
  } else if(type == 'byYear') {
    byYearChart();
    $('#pageTitle').html("Score Distribution By Year Group");
    $('#explanation').html("Shows the distribution of each score separated by year group.");
  } else if(type == 'longYear') {
    longTermYearGroupChart();
    $('#pageTitle').html("Long-Term Year Level Averages");
    $('#explanation').html("Shows the average score achieved at that year level for each RAP Period.");
  } else if(type == 'longCohort') {
    longTermCohortChart();
    $('#pageTitle').html("Long-Term Cohort Averages");
    $('#explanation').html("Tracks the average scores of the cohort over time (each line follows a single cohort).");
  } else if(type == 'byLogins') {
    studentLoginsChart();
    $('#pageTitle').html("Number of Student Logins");
    $('#explanation').html("Shows how many students have logged in to check their scores in the current RAP Period.");
  } else if(type == 'byGender') {
    longTermGenderChart("all");
    $('#pageTitle').html("Long-Term Average By Gender");
    $('#explanation').html("Shows the average score differences betwen boys and girls for each RAP Period");
    $('#content').append(
      "<br><br>" +
      "<div class='form-group'>" +
        "<div class='row'>" +
          "<div class='col-sm-4'>" +
            "<button class='btn btn-primary year-button' id='year7' style='width: 100%;' onclick='longTermGenderChart(\"all\");'>All Years</button>" +
          "</div>" +
          "<div class='col-sm-2'>" +
            "<button class='btn btn-primary year-button' id='year7' style='width: 100%;' onclick='longTermGenderChart(\"7\");'>7</button>" +
          "</div>" +
          "<div class='col-sm-2'>" +
            "<button class='btn btn-primary year-button' id='year7' style='width: 100%;' onclick='longTermGenderChart(\"8\");'>8</button>" +
          "</div>" +
          "<div class='col-sm-2'>" +
            "<button class='btn btn-primary year-button' id='year7' style='width: 100%;' onclick='longTermGenderChart(\"9\");'>9</button>" +
          "</div>" +
          "<div class='col-sm-2'>" +
            "<button class='btn btn-primary year-button' id='year7' style='width: 100%;' onclick='longTermGenderChart(\"10\");'>10</button>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }
});
