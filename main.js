function onCategoryChanged() {
    console.log('city changed!')
    var select = d3.select('#categorySelect').node();
    var category = select.options[select.selectedIndex].value;
    console.log(category)
    updateChart(category);
}

var cities = {'CLT': 0, 'CQT': 1, 'IND': 2, 'JAX': 3, 'MDW': 4, 'PHL': 5, 'PHX': 6}

var city = 'CLT'

var svg = d3.select('.chart')

var chartG = svg.append('g')
    .attr('transform', 'translate(80, 350)')

var legend = d3.select('.legend')
    // .attr('transform', 'translate(80, 350)')

var colorScale = d3.scaleLinear().domain([0, 110]).range(['#99ccff', '#cc0000'])

var size = 20

legend.selectAll('.legendbars').data([0, 30, 60, 90, 110])
    .enter()
    .append("rect")
    .attr('class', 'legendbars')
    .attr("x", 0)
    .attr("y", function(d, i){ return 10 + i*(size+5)})
    .attr("width", size)
    .attr("height", size)
    .style("fill", function(d){ 
        console.log(d)
        return colorScale(d)})

legend.selectAll('.legendlabels').data(['0°F', '30°F', '60°F', '90°F', '110°F'])
    .enter()
    .append("text")
    .attr('class', 'legendlabels')
    .text((d) => {
        return d
    })
    .attr("x", 30)
    .attr("y", function(d, i){ return 25 + i*(size+5)})

var toolTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([0, 30])
    .html((d) => {
        return `
        <p><b>Date</b>: ${d.date}</p>
        <p><b>Temperature</b>: ${d.actual_min_temp}°F - ${d.actual_max_temp}°F</p>
        <p><b>Precipitation</b>: ${d.average_precipitation}</p>
        <p><b>Record Highest Temperature</b>: ${d.record_max_temp} °F (${d.record_max_temp_year})</p>
        <p><b>Record Highest Precipitation</b>: ${d.record_precipitation}</p>
        `
    })

svg.call(toolTip)

Promise.all([
    d3.csv('./Weather Data/CLT.csv'),
    d3.csv('./Weather Data/CQT.csv'),
    d3.csv('./Weather Data/IND.csv'),
    d3.csv('./Weather Data/JAX.csv'),
    d3.csv('./Weather Data/MDW.csv'),
    d3.csv('./Weather Data/PHL.csv'),
    d3.csv('./Weather Data/PHX.csv')
]).then((datasets) => {
    // let dataset = datasets[cities[city]]
    datasets_copy = datasets
    dataset = datasets_copy[0]

    xScale = d3.scaleTime().domain([Date.parse(dataset[0].date), Date.parse(dataset[dataset.length - 1].date)]).range([0, 700])
    yScale = d3.scaleLinear().domain([0, 0.3]).range([300, 0])

    var xAxis = d3.axisBottom().scale(xScale)
    var yAxis = d3.axisLeft().scale(yScale)

    chartG.append('g').attr('class', 'x-axis').call(xAxis)
    chartG.append('g').attr('class', 'y-axis').call(yAxis).attr('transform', 'translate(0, -300)')

    
    
    // city = filterKey
    chartG.append('text')
        .text('Date (by Month)')
        .attr('transform', 'translate(300, 50)')
        .attr('class', 'x-label')
    
    chartG.append('text')
        .text('Actual Precipitation (by mm)')
        .attr('class', 'y-label')

    updateChart('IND')
                
})

function updateChart(filterKey) {
    // let dataset = (d) => {
    //     return d[cities[filterKey]]
    // }
    dataset = datasets_copy[cities[filterKey]]
    console.log(dataset)

    d3.selectAll('.bar').remove()
    d3.selectAll('.title').remove()

    chartG.append('text')
        .text('Precipitation and Temperature Change of ' + filterKey + ' from Mid 2014 to 2015')
        .attr('class', 'title')
        .attr('transform', 'translate(100, -300)')
    
    var bars = chartG.selectAll('.bar').data(() => {
        console.log('dataset changing!')
        return dataset
    })

    var barsEnter = bars.enter().append('g')
        .attr('class', 'bar')
        .attr('transform', (d, i) => {
            // console.log(d)
            return 'translate(' + xScale(Date.parse(d.date)) + ', 0)'
        })
        .call((bar) => {
            console.log('start changing bars!')
            bar.append('rect')
                .style('fill', (d, i) => {
                    // console.log("adjusting fill!")
                    return colorScale(d.actual_min_temp)
                })
                .attr('width', (d, i) => {
                    // console.log("adjusting width!")
                    return 3
                })
                .attr('height', (d, i) => {
                    // console.log("adjusting height!")
                    return d.average_precipitation * 1000
                })
                .attr('transform', (d, i) => {
                    // console.log("adjusting transform!")
                    return 'translate(0, ' + (d.average_precipitation * 1000 * -1) + ')'
                })
                .attr('rx', '5')
        })

    barsEnter.on('mouseover', toolTip.show)
        .on('mouseout', toolTip.hide)

    // bars.exit().remove()
    console.log("bars changed!")
}