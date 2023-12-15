// Set up the dimensions and margins for the scatter plot
const scatterSvg = d3.select("#scatterplot");
const margin = { top: 20, right: 20, bottom: 30, left: 50 };
const width = +scatterSvg.attr("width") - margin.left - margin.right;
const height = +scatterSvg.attr("height") - margin.top - margin.bottom;

// Create scales for the scatter plot
const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// Append a group element to the SVG for the scatter plot
const g = scatterSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

// Set up the dimensions for the slider
const sliderSvg = d3.select("#slider-container");
const sliderWidth = +sliderSvg.attr("width") - margin.left - margin.right;
const sliderHeight = +sliderSvg.attr("height");

// Tooltip to hover for more player info
const tooltip = d3.select("#tooltip");

d3.csv("https://raw.githubusercontent.com/dongyiran2730/EDAV-final-project/main/nbaplayersdraft.csv").then(data => {
    // Parse and format the data
    data.forEach(d => {
        d.year = new Date(+d.year, 0, 1);
        d.overall_pick = +d.overall_pick;
        d.win_shares = +d.win_shares;
    });

    // Set the domains
    x.domain(d3.extent(data, d => d.overall_pick));
    y.domain(d3.extent(data, d => d.win_shares));

    // Define and append the x and y axes
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .append("text")
        .attr("fill", "#000")
        .attr("x", width / 2)
        .attr("y", margin.bottom - 6)
        .style("text-anchor", "middle")
        .text("Overall Pick");

    g.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6 - margin.left)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Win Shares");

    // Title to the scatter plot
    scatterSvg.append("text")
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", margin.top)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("text-decoration", "underline")
        .text("Win Shares of NBA Draft Picks Over Time");

    // Time scale for the slider
    const sliderX = d3.scaleTime()
        .domain(d3.extent(data, d => d.year))
        .range([0, sliderWidth])
        .clamp(true);

    // Group for the slider
    const slider = sliderSvg.append("g")
        .attr("class", "slider")
        .attr("transform", `translate(${margin.left},${sliderHeight / 2})`);

    // Line for the slider track
    slider.append("line")
        .attr("class", "track")
        .attr("x1", sliderX.range()[0])
        .attr("x2", sliderX.range()[1]);

    // Handle for the slider as a rectangle
    const handle = slider.insert("rect", ".track-overlay")
        .attr("class", "handle")
        .attr("x", -10)
        .attr("y", -10)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", "orange");

    // Axis for the slider with ticks for each year
    slider.append("g")
        .attr("class", "ticks")
        .attr("transform", `translate(0,${18})`)
        .call(d3.axisBottom(sliderX).ticks(10));

    // Label below the slider
    sliderSvg.append("text")
        .attr("class", "slider-label")
        .attr("x", sliderWidth / 2)
        .attr("y", sliderHeight - 7)
        .style("text-anchor", "middle")
        .text("Draft Year");

    // Function to update the scatter plot based on the selected year
    function update(year) {
        const newData = data.filter(d => d.year.getFullYear() === year);

        const dots = g.selectAll(".dot")
            .data(newData, d => d.overall_pick + ',' + d.win_shares);

        dots.enter()
            .append("circle")
            .attr("class", "dot")
            .attr("r", 5)
            .merge(dots)
            .attr("cx", d => x(d.overall_pick))
            .attr("cy", d => y(d.win_shares))
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html("Player: " + d.player + "<br/>Draft Year: " + d.year.getFullYear() + "<br/>Overall Pick: " + d.overall_pick + "<br/>Win Shares: " + d.win_shares)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mousemove", (event) => {
                tooltip.style("left", (event.pageX + 5) + "px")
                       .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition().duration(500).style("opacity", 0);
            });

        dots.exit().remove();
    }

    // Initialize the scatter plot with the first available year
    update(data[0].year.getFullYear());

    // Drag behavior for the slider
    const drag = d3.drag()
      .on("drag", function(event) {
          // Use `event` directly, as it's now passed as the first argument to the event handler in D3 v6+
          const xPosition = d3.pointer(event, this)[0];
          const selectedYear = sliderX.invert(xPosition).getFullYear();
          handle.attr("x", sliderX(new Date(selectedYear, 0, 1)) - 10);
          update(selectedYear);
      });

    handle.call(drag);
}).catch(error => {
    console.error("Error loading the CSV file: ", error);
});
