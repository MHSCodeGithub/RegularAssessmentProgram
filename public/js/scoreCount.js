var yearChart;
var wholeChart;

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    if(yearChart != null) {
      yearChart.destroy();
    }
    wholeChart = new Chart(ctx, {
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
    $.getJSON("/getWholeAverage", function(average) {
      $('#stats').empty().hide();
      $('#stats').append("<h5>Whole School Average: <strong>" + average + "</strong></h4>");
      $('#stats').fadeIn(400);
    });
  });
}

function byYearChart() {
  console.log("Generating chart...");
  $('#chart').hide();
  $('#loading').show();
  $('#loading').append("<div id='loading-spinner'></div>");
  $('#loading-spinner').jmspinner('large');
  $.getJSON("/countScores?year=7", function(year7) {
    $.getJSON("/countScores?year=8", function(year8) {
      $.getJSON("/countScores?year=9", function(year9) {
        $.getJSON("/countScores?year=10", function(year10) {

          // Log raw data
          console.log(year7);
          console.log(year8);
          console.log(year9);
          console.log(year10);

          // Year 7 average
          var year7count = year7[0] + year7[1] + year7[2] + year7[3] + year7[4];
          var year7total = year7[0] + (year7[1] * 2) + (year7[2] * 3) + (year7[3] * 4) + (year7[4] * 5);
          var year7average = Number(year7total / year7count).toFixed(2);

          // Year 8 average
          var year8count = year8[0] + year8[1] + year8[2] + year8[3] + year8[4];
          var year8total = year8[0] + (year8[1] * 2) + (year8[2] * 3) + (year8[3] * 4) + (year8[4] * 5);
          var year8average = Number(year8total / year8count).toFixed(2);

          // Year 9 average
          var year9count = year9[0] + year9[1] + year9[2] + year9[3] + year9[4];
          var year9total = year9[0] + (year9[1] * 2) + (year9[2] * 3) + (year9[3] * 4) + (year9[4] * 5);
          var year9average = Number(year9total / year9count).toFixed(2);

          // Year 10 average
          var year10count = year10[0] + year10[1] + year10[2] + year10[3] + year10[4];
          var year10total = year10[0] + (year10[1] * 2) + (year10[2] * 3) + (year10[3] * 4) + (year10[4] * 5);
          var year10average = Number(year10total / year10count).toFixed(2);

          var canvas = document.getElementById("chart");
          var ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.beginPath();
          if(wholeChart != null) {
            wholeChart.destroy();
          }
          yearChart = new Chart(ctx, {
              type: 'bar',
              data: {
                labels: ["Ones", "Twos", "Threes", "Fours", "Fives"],
                datasets: [
                    {
                        label: "Year 7",
                        backgroundColor: "blue",
                        data: year7
                    },
                    {
                        label: "Year 8",
                        backgroundColor: "red",
                        data: year8
                    },
                    {
                        label: "Year 9",
                        backgroundColor: "green",
                        data: year9
                    },
                    {
                        label: "Year 10",
                        backgroundColor: "orange",
                        data: year10
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
}

$(document).ready(function() {

  $("#byWhole").click(function(event) {
    wholeSchoolChart();
  });

  $("#byYear").click(function(event) {
    byYearChart();
  });

  $("#byWhole").trigger("click");
  $("#byWhole").focus();

});
