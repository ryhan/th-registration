google.load('visualization', '1.0', {'packages':['corechart']});
google.setOnLoadCallback(drawChart);

function drawChart(){

  // Default Chart Options
  var options = {
    backgroundColor: { fill:'transparent' },
    colors: ['#E34D53', '#3C6EC4'],
    width: 150,
    height: 200,
    legend: 'none'
  };


  // Load Gender Data
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Gender');
  data.addColumn('number', 'Hackers');
  data.addRows([
    ['Male', 112],
    ['Female', 54]
  ]);

  var chartDiv = document.getElementById('chart_1');
  var chart = new google.visualization.PieChart(chartDiv);
  chart.draw(data, options);

  // Load T-Shirt Data
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Gender');
  data.addColumn('number', 'Hackers');
  data.addRows([
    ['M XS', 3],
    ['M S', 26],
    ['M M', 33],
    ['M L', 18],
    ['M XL', 4],
    ['W XS', 12],
    ['W S', 38],
    ['W M', 43],
    ['W L', 21],
    ['W XL', 2],
  ]);

  options.width = 540;

  var chartDiv = document.getElementById('chart_2');
  var chart = new google.visualization.ColumnChart(chartDiv);
  chart.draw(data, options);

}