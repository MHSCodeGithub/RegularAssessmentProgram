var chart;

function wholeSchoolChart() {
  //console.log("Generating chart...");
  $('#chart').hide();
  $('#loading').show();
  $('#loading').append("<div id='loading-spinner'></div>");
  $('#loading-spinner').jmspinner('large');
  $.getJSON("/countScores", function(values) {
    var canvas = document.getElementById("chart");
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    if(chart != null) {
      chart.destroy();
    }
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Ones", "Twos", "Threes", "Fours", "Fives"],
            datasets: [{
                label: 'Count',
                data: values,
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    if(chart != null) {
      chart.destroy();
    }
    var data = [values.unchecked,values.checked];
    console.log(data);
    chart = new Chart(ctx, {
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
      $('#stats').append("<h5>Number of Student Logins: <strong>" + values.checked + "</strong></h4>");
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
  $.getJSON("/countScores?year=7", function(year7) {
    $.getJSON("/countScores?year=8", function(year8) {
      $.getJSON("/countScores?year=9", function(year9) {
        $.getJSON("/countScores?year=10", function(year10) {
          $.getJSON("/getGroupAverage?current=true", function(group) {

            var year7average = group.year7;
            var year8average = group.year8;
            var year9average = group.year9;
            var year10average = group.year10;

            var canvas = document.getElementById("chart");
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            if(chart != null) {
              chart.destroy();
            }
            chart = new Chart(ctx, {
                type: 'bar',
                data: {
                  labels: ["Ones", "Twos", "Threes", "Fours", "Fives"],
                  datasets: [
                      {
                          label: "Year 7",
                          backgroundColor: "blue",
                          data: year7.percentages
                      },
                      {
                          label: "Year 8",
                          backgroundColor: "red",
                          data: year8.percentages
                      },
                      {
                          label: "Year 9",
                          backgroundColor: "green",
                          data: year9.percentages
                      },
                      {
                          label: "Year 10",
                          backgroundColor: "orange",
                          data: year10.percentages
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
      });
    });
  });
}

$(document).ready(function() {

  $("#byWhole").click(function(event) {
    wholeSchoolChart();
  });

  $("#byYear").click(function(event) {
    byYearChart();
  });

  $("#byLogins").click(function(event) {
    console.log("hi");
    studentLoginsChart();
  });

  $("#byWhole").trigger("click");
  $("#byWhole").focus();

});
