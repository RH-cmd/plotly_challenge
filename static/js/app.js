// Variable for the metadata field
var demographicsTable = d3.select("#sample-metadata");

// Variable for user input 
var idSelect = d3.select("#selDataset");

// Create a function to build our bar and bubble charts

// Variable for the bar chart div
var barChart = d3.select("#bar");
// Variable for the bubble chart div
var bubbleChart = d3.select("#bubble");
// Varible the gauge chart div
var gaugeChart = d3.select("#gauge");


function plotCharts(id) {

    d3.json("data/samples.json").then((data => {

        // filter
        var eachMetadatapoint = data.metadata.filter(participant => participant.id == id)[0];

        // for the gauge chart below
        var wfreq = eachMetadatapoint.wfreq;

        // For each loop to loop through all the datapoints
        Object.entries(eachMetadatapoint).forEach(([key, value]) => {
            var newList = demographicsTable.append("ul");
            newList.attr("class", "list-group list-group-flush");
            var listItem = newList.append("li");
            listItem.attr("class", "list-group-item p-1 demo-text bg-transparent");
            listItem.text(`${key}: ${value}`);

        });

        // filter for the ID chosen
        var individualSample = data.samples.filter(sample => sample.id == id)[0];

        // create empty arrays to store data during the for each loop
        var otuIds = [];
        var otuLabels = [];
        var sampleValues = [];

        // Iterate through each key and value in the sample to retrieve data for plotting
        Object.entries(individualSample).forEach(([key, value]) => {

            switch (key) {
                case "otu_ids":
                    otuIds.push(value);
                    break;
                case "sample_values":
                    sampleValues.push(value);
                    break;
                case "otu_labels":
                    otuLabels.push(value);
                    break;
                default:
                    break;
            }

        });

        // Top 10 values, labels and IDs
        var topOtuIds = otuIds[0].slice(0, 10).reverse();
        var topOtuLabels = otuLabels[0].slice(0, 10).reverse();
        var topSampleValues = sampleValues[0].slice(0, 10).reverse();
        var topOtuIdsFormatted = topOtuIds.map(otuID => "OTU " + otuID);

        // Create the bar chart
        var traceBar = {
            x: topSampleValues,
            y: topOtuIdsFormatted,
            text: topOtuLabels,
            type: 'bar',
            orientation: 'h',
            marker: {
                color: 'rgb(29,145,192)'
            }
        };

        var dataBar = [traceBar];

        var layoutBar = {
            height: 500,
            width: 600,
            font: {
                family: 'Quicksand'
            },
            hoverlabel: {
                font: {
                    family: 'Quicksand'
                }
            },
            title: {
                text: `<b>Top OTUs for Test Subject ${id}</b>`,
                font: {
                    size: 18,
                    color: 'rgb(34,94,168)'
                }
            },
            xaxis: {
                title: "<b>Sample values<b>",
                color: 'rgb(34,94,168)'
            },
            yaxis: {
                tickfont: { size: 14 }
            }
        }

        Plotly.newPlot("bar", dataBar, layoutBar);

        // Create bubble chart
        var traceBubble = {
            x: otuIds[0],
            y: sampleValues[0],
            text: otuLabels[0],
            mode: 'markers',
            marker: {
                size: sampleValues[0],
                color: otuIds[0],
                colorscale: 'YlGnBu'
            }
        };

        var dataBubble = [traceBubble];

        var layoutBubble = {
            font: {
                family: 'Quicksand'
            },
            hoverlabel: {
                font: {
                    family: 'Quicksand'
                }
            },
            xaxis: {
                title: "<b>OTU Id</b>",
                color: 'rgb(34,94,168)'
            },
            yaxis: {
                title: "<b>Sample Values</b>",
                color: 'rgb(34,94,168)'
            },
            showlegend: false,
        };

        Plotly.newPlot('bubble', dataBubble, layoutBubble);

        // Create the gauge chart
        // if wfreq has a null value, set it to zero for the pointer 
        if (wfreq == null) {
            wfreq = 0;
        }
        
        var traceGauge = {
            domain: { x: [0, 1], y: [0, 1] },
            value: wfreq,
            type: "indicator",
            mode: "gauge",
            gauge: {
                axis: {
                    range: [0, 9],
                    tickmode: 'linear',
                    tickfont: {
                        size: 15
                    }
                },
                bar: { color: 'rgba(8,29,88,0)' },
                steps: [
                    { range: [0, 1], color: 'rgb(255,255,217)' },
                    { range: [1, 2], color: 'rgb(237,248,217)' },
                    { range: [2, 3], color: 'rgb(199,233,180)' },
                    { range: [3, 4], color: 'rgb(127,205,187)' },
                    { range: [4, 5], color: 'rgb(65,182,196)' },
                    { range: [5, 6], color: 'rgb(29,145,192)' },
                    { range: [6, 7], color: 'rgb(34,94,168)' },
                    { range: [7, 8], color: 'rgb(37,52,148)' },
                    { range: [8, 9], color: 'rgb(8,29,88)' }
                ]
            }
        };

        // angle for each wfreq segment 
        var angle = (wfreq / 9) * 180;
        var degrees = 180 - angle,
            radius = .8;
        var radians = degrees * Math.PI / 180;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);

        var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
            cX = String(x),
            cY = String(y),
            pathEnd = ' Z';
        var path = mainPath + cX + " " + cY + pathEnd;

        gaugeColors = ['rgb(8,29,88)', 'rgb(37,52,148)', 'rgb(34,94,168)', 'rgb(29,145,192)', 'rgb(65,182,196)', 'rgb(127,205,187)', 'rgb(199,233,180)', 'rgb(237,248,217)', 'rgb(255,255,217)', 'white']

        var traceNeedleCenter = {
            type: 'scatter',
            showlegend: false,
            x: [0],
            y: [0],
            marker: { size: 35, color: '850000' },
            name: wfreq,
            hoverinfo: 'name'
        };

        var dataGauge = [traceGauge, traceNeedleCenter];

        var layoutGauge = {

            shapes: [{
                type: 'path',
                path: path,
                fillcolor: '850000',
                line: {
                    color: '850000'
                }
            }],
            font: {
                family: 'Quicksand'
            },
            hoverlabel: {
                font: {
                    family: 'Quicksand',
                    size: 16
                }
            },
            title: {
                text: `<b>Test Subject ${id}</b><br><b>Belly Button Washing Frequency</b><br><br>Scrubs per Week`,
                font: {
                    size: 18,
                    color: 'rgb(34,94,168)'
                },
            },
            height: 500,
            width: 500,
            xaxis: {
                zeroline: false,
                showticklabels: false,
                showgrid: false,
                range: [-1, 1],
                fixedrange: true 
            },
            yaxis: {
                zeroline: false,
                showticklabels: false,
                showgrid: false,
                range: [-0.5, 1.5],
                fixedrange: true
            }
        };

        Plotly.newPlot('gauge', dataGauge, layoutGauge);

         
    }));

};

// Create the function for the form panel
function init() {

    // reset any previous data
    resetData();
    d3.json("data/samples.json").then((data => {

        // Create the dropdown menu

        // Populate drop down menu with the IDs
        data.names.forEach((name => {
            var option = idSelect.append("option");
            option.text(name);
        }));

        // Use the first ID to initialize the plot
        var initId = idSelect.property("value")

        plotCharts(initId);

    }));

}

// Reset the data for the new sample choice
function resetData() {
    demographicsTable.html("");
    barChart.html("");
    bubbleChart.html("");
    gaugeChart.html("");
};
  
// Switch the data when we select a new sample
function optionChanged(id) {
    resetData();
    plotCharts(id);
}

// Initialize the dashboard
init();