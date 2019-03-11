function clusteredhorizontalbar() {

    var _NAME = 'clusteredhorizontalbar';

    var _config,
        _dimension,
        _measure,
        _showLegend,
        _legendPosition,
        _sort,
        _tooltip,
        _showXaxis,
        _showYaxis,
        _showXaxisLabel,
        _showYaxisLabel,
        _xAxisColor,
        _yAxisColor,
        _showGrid,
        _stacked,
        _displayName,
        _legendData,
        _showValues = [],
        _displayNameForMeasure = [],
        _fontStyle = [],
        _fontWeight = [],
        _numberFormat = [],
        _textColor = [],
        _displayColor = [],
        _borderColor = [],
        _fontSize = [];

    var _local_svg, _Local_data, _originalData, _localLabelStack = [], legendBreakCount=1;

    var parentWidth, parentHeight, plotWidth, plotHeight;

    var x0, x1, y;
    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 45
    };

    var tickLength = d3.scaleLinear()
        .domain([22, 34])
        .range([4, 6]);

    var legendSpace = 20, axisLabelSpace = 20, offsetX = 16, offsetY = 3, div;

    var threshold = [];
    var filter = false, filterData = [];

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);

        this.showLegend(config.showLegend);
        this.legendPosition(config.legendPosition);

        this.showXaxis(config.showXaxis);
        this.showYaxis(config.showYaxis);
        this.showXaxisLabel(config.showXaxisLabel);
        this.showYaxisLabel(config.showYaxisLabel);
        this.xAxisColor(config.xAxisColor);
        this.yAxisColor(config.yAxisColor);
        this.displayName(config.displayName);
        this.showYaxis(config.showYaxis);
        this.showXaxisLabel(config.showXaxisLabel);
        this.showValues(config.showValues);
        this.displayNameForMeasure(config.displayNameForMeasure);
        this.fontStyle(config.fontStyle);
        this.fontWeight(config.fontWeight);
        this.numberFormat(config.numberFormat);
        this.textColor(config.textColor);
        this.displayColor(config.displayColor);
        this.borderColor(config.borderColor);
        this.fontSize(config.fontSize);
        this.legendData(config.displayColor, config.measure);

    }

    var _buildTooltipData = function (datum, chart) {
        var output = "";

        output += "<table><tr>"
            + "<th>" + chart.dimension() + ": </th>"
            + "<td>" + datum[chart.dimension()] + "</td>"
            + "</tr><tr>"
            + "<th>" + datum["measure"] + ": </th>"
            + "<td>" + datum[datum["measure"]] + "</td>"
            + "</tr></table>";

        return output;
    }

    var onLassoStart = function (lasso, chart) {
        return function () {
            if (filter) {
                lasso.items().selectAll('rect')
                    .classed('not_possible', true)
                    .classed('selected', false);
            }
        }
    }

    var onLassoDraw = function (lasso, chart) {
        return function () {
            filter = true;
            lasso.items().selectAll('rect')
                .classed('selected', false);

            lasso.possibleItems().selectAll('rect')
                .classed('not_possible', false)
                .classed('possible', true);

            lasso.notPossibleItems().selectAll('rect')
                .classed('not_possible', true)
                .classed('possible', false);
        }
    }

    var onLassoEnd = function (lasso, chart) {
        return function () {
            var data = lasso.selectedItems().data();
            if (!filter) {
                return;
            }
            if (data.length > 0) {
                lasso.items().selectAll('rect')
                    .classed('not_possible', false)
                    .classed('possible', false);
            }

            lasso.selectedItems().selectAll('rect')
                .classed('selected', true)

            lasso.notSelectedItems().selectAll('rect');

            var confirm = d3.select('.confirm')
                .style('visibility', 'visible');

            var _filter = [];
            if (data.length > 0) {
                var keys = UTIL.getMeasureList(data[0], _dimension);
                data.forEach(function (d) {
                    var obj = new Object();
                    obj[_dimension[0]] = d[_dimension[0]];
                    for (var index = 0; index < keys.length; index++) {
                        obj[keys[index]] = d[keys[index]];
                    }
                    _filter.push(obj)
                });
            }
            if (_filter.length > 0) {
                filterData = _filter;
            }
        }
    }

    var applyFilter = function (chart) {
        return function () {
            if (filterData.length > 0) {
                chart.update(filterData);
            }
        }
    }
    var clearFilter = function () {
        return function () {
            chart.update(_originalData);
        }
    }
    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'pointer')
                .style('cursor', 'pointer')
                .style('fill', COMMON.HIGHLIGHTER);
            var border = UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor)
            if (tooltip) {
                UTIL.showTooltip(tooltip);
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, border);
            }
        }
    }

    var _handleMouseMoveFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            if (tooltip) {
                var border = UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor)
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me, border), container, border);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'default')
                .style('fill', function (d1, i) {
                    return UTIL.getDisplayColor(_measure.indexOf(d1.measure), _displayColor);
                })
                .style('stroke', function (d1, i) {
                    return UTIL.getBorderColor(_measure.indexOf(d1.measure), _borderColor);
                });

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }

    function chart(selection) {
        _local_svg = selection;

        selection.each(function (data) {
            _Local_data = _originalData = data;
            var margin = {
                top: 0,
                right: 0,
                bottom: 0,
                left: 45
            };

            div = d3.select(this).node().parentNode;

            var _local_svg = d3.select(this),
                width = div.clientWidth,
                height = div.clientHeight;

            parentWidth = width - 2 * COMMON.PADDING - margin.left;
            parentHeight = (height - 2 * COMMON.PADDING - axisLabelSpace * 2);

            _local_svg.attr('width', width)
                .attr('height', height)

            d3.select(div).append('div')
                .attr('class', 'sort_selection');

            d3.select(div).append('div')
                .attr('class', 'arrow-down');

            var str = UTIL.createAlert($(div).attr('id'), _measure);
            $(div).append(str);

            $(document).on('click', '_local_svg', function (e) {
                if ($("#myonoffswitch").prop('checked') == false) {
                    var element = e.target
                    if (element.tagName == "_local_svg") {
                        $('#Modal_' + $(div).attr('id') + ' .measure').val('')
                        $('#Modal_' + $(div).attr('id') + ' .threshold').val('')
                        $('#Modal_' + $(div).attr('id') + ' .measure').attr('disabled', false)
                        $('#Modal_' + $(div).attr('id')).modal('toggle');
                    }
                }
            })

            $(document).on('click', '#Modal_' + $(div).attr('id') + ' .ThresholdSubmit', function (e) {
                var newValue = $('#Modal_' + $(div).attr('id') + ' .threshold').val();
                var obj = new Object()
                obj.measure = $('#Modal_' + $(div).attr('id') + ' .measure').val()
                obj.threshold = newValue;
                threshold.push(obj);
                $('#Modal_' + $(div).attr('id')).modal('toggle');
            })


            container = _local_svg.append('g')
                .attr('transform', 'translate(' + COMMON.PADDING + ', ' + COMMON.PADDING + ')');

            var legendWidth = 0,
                legendHeight = 0;

            plotWidth = parentWidth;
            plotHeight = parentHeight;

            if (_showLegend) {
                var clusteredverticalbarLegend = LEGEND.bind(chart);

                var result = clusteredverticalbarLegend(_legendData, container, {
                    width: parentWidth,
                    height: parentHeight,
                    legendBreakCount: legendBreakCount
                });

                legendWidth = result.legendWidth;
                legendHeight = result.legendHeight;
                legendBreakCount = result.legendBreakCount;

                switch (_legendPosition) {
                    case 'top':
                        plotHeight = parentHeight - legendHeight - axisLabelSpace;
                        break;
                    case 'bottom':
                        plotHeight = parentHeight - legendHeight - axisLabelSpace * 2;
                        break;
                    case 'right':
                    case 'left':
                        plotWidth = parentWidth - legendWidth;
                        break;
                }

                if ((_legendPosition == 'top') || (_legendPosition == 'bottom')) {
                    plotWidth = parentWidth;
                    plotHeight = parentHeight - 3 * axisLabelSpace;
                    legendSpace = 20;
                } else if ((_legendPosition == 'left') || (_legendPosition == 'right')) {
                    var legend = _local_svg.selectAll('.item');
                    legendSpace = legend.node().parentNode.getBBox().width;
                    plotWidth = (parentWidth - legendSpace) - margin.left + axisLabelSpace;
                    plotHeight = parentHeight;

                    legend.attr('transform', function (d, i) {
                        if (_legendPosition == 'left') {
                            return 'translate(0, ' + i * 20 + ')';

                        }
                        else if (_legendPosition == 'right') {
                            return 'translate(' + (parentWidth - legendSpace + axisLabelSpace) + ', ' + i * 20 + ')';
                        }
                    });
                }
            }
            else {
                legendSpace = 0;
                plotWidth = parentWidth;
                plotHeight = parentHeight;
            } 

            if (_tooltip) {
                tooltip = d3.select(this.parentNode).select('#tooltip');
            }

            drawPlot.call(this, data);
        });

    }

    var drawPlot = function (data) {
        var me = this;
        _Local_data = data;
        x0 = d3.scaleBand()
            .rangeRound([plotHeight, 0])
            .paddingInner(0.1)
            .padding([0.1]);

        x1 = d3.scaleBand()
            .padding(0.2);

        y = d3.scaleLinear()
            .rangeRound([0, plotWidth]);

        var plot = container.append('g')
            .attr('class', 'clusteredhorizontalbar-plot')
            .classed('plot', true)
            .attr('transform', function () {
                if (_legendPosition == 'top') {
                    return 'translate(' + margin.left + ', ' + parseInt(legendSpace * 2 + (20 * parseInt(legendBreakCount))) + ')';
                } else if (_legendPosition == 'bottom') {
                    return 'translate(' + margin.left + ', 0)';
                } else if (_legendPosition == 'left') {
                    return 'translate(' + (legendSpace + margin.left + axisLabelSpace) + ', 0)';
                } else if (_legendPosition == 'right') {
                    return 'translate(' + margin.left + ', 0)';
                }
            });

        var keys = UTIL.getMeasureList(data[0], _dimension);

        x0.domain(data.map(function (d) { return d[_dimension[0]]; }));
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(data, function (d) {
            return d3.max(keys, function (key) {
                return parseInt(d[key]);
            });
        })]).nice();

        var cluster = plot.selectAll('.cluster')
            .data(data)
            .enter().append('g')
            .attr('class', 'cluster')
            .attr('transform', function (d) {
                return 'translate(0,' + x0(d[_dimension[0]]) + ')';
            });

        var labelStack = []
        var clusteredhorizontalbar = cluster.selectAll('g.clusteredhorizontalbar')
            .data(function (d) {
                return keys.filter(function (m) {
                    return labelStack.indexOf(m) == -1;
                }).map(function (m) {
                    var obj = {};
                    obj[_dimension[0]] = d[_dimension[0]];
                    obj[m] = d[m];
                    obj['dimension'] = _dimension[0];
                    obj['measure'] = m;
                    return obj;
                });
            })
            .enter().append('g')
            .attr('class', 'clusteredhorizontalbar');


        drawViz(clusteredhorizontalbar);

        plot.append("g")
            .attr("class", "x_axis")
            .attr("transform", "translate(0," + plotHeight + ")")
            .call(d3.axisBottom(y))
            .append("text")
            .attr("x", plotWidth / 2)
            .attr("y", 2 * axisLabelSpace)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .style('text-anchor', 'middle')
            .style('visibility', UTIL.getVisibility(_showXaxisLabel))
            .text(function () {
                return _displayNameForMeasure.map(function (p) { return p; }).join(', ');
            });

        plot.append("g")
            .attr("class", "y_axis")
            .call(d3.axisLeft(x0).ticks(null, "s"))
            .append("text")
            .attr("x", plotHeight / 2)
            .attr("y", 2 * axisLabelSpace)
            .attr("transform", function (d) { return "rotate(" + 90 + ")"; })
            .attr("dy", "0.32em")
            .style('visibility', UTIL.getVisibility(_showYaxisLabel))
            .attr("font-weight", "bold")
            .style('text-anchor', 'middle')
            .text(function () {
                return _displayName;
            });

        UTIL.setAxisColor(_local_svg, _yAxisColor, _xAxisColor, _showYaxis, _showXaxis, _showYaxis, _showXaxis);

        _local_svg.select('g.sort').remove();
        UTIL.sortingView(container, parentHeight, parentWidth+margin.left, legendBreakCount, axisLabelSpace, offsetX);

        _local_svg.select('g.sort').selectAll('text')
            .on('click', function () {
                var order = d3.select(this).attr('class')
                switch (order) {
                    case 'ascending':
                        UTIL.toggleSortSelection(me, 'ascending', drawPlot, _local_svg, keys, _Local_data);
                        break;
                    case 'descending':
                        UTIL.toggleSortSelection(me, 'descending', drawPlot, _local_svg, keys, _Local_data);
                        break;
                    case 'reset': {
                        _local_svg.select(me.parentElement).select('.plot').remove();
                        drawPlot.call(me, _Local_data);
                        break;
                    }
                }
            }
            );

        d3.select(div).select('.btn-primary')
            .on('click', applyFilter(chart));

        d3.select(div).select('.btn-default')
            .on('click', clearFilter());

        _local_svg.select('g.lasso').remove()
        var lasso = d3.lasso()
            .hoverSelect(true)
            .closePathSelect(true)
            .closePathDistance(100)
            .items(cluster)
            .targetArea(_local_svg);

        lasso.on('start', onLassoStart(lasso, chart))
            .on('draw', onLassoDraw(lasso, chart))
            .on('end', onLassoEnd(lasso, chart));

        _local_svg.call(lasso);
    }

    var drawViz = function (element) {
        var me = this;

        element.append('rect')
            .attr("y", function (d) {
                return x1(d.measure);
            })
            .attr("x", 1)
            .attr("height", x1.bandwidth())
            .attr("width", function (d) {
                return y(d[d.measure]);
            })
            .style('fill', function (d, i) {
                return UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor);
            })
            .style('stroke', function (d, i) {
                return UTIL.getBorderColor(_measure.indexOf(d.measure), _borderColor);
            })
            .style('stroke-width', 2)
            .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
            .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
            .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
            .on('click', function (d) {
                if ($("#myonoffswitch").prop('checked') == false) {
                    $('#Modal_' + $(div).attr('id') + ' .measure').val(d.measure);
                    $('#Modal_' + $(div).attr('id') + ' .threshold').val('');
                    $('#Modal_' + $(div).attr('id') + ' .measure').attr('disabled', true);;
                    $('#Modal_' + $(div).attr('id')).modal('toggle');
                }
                else {
                    var confirm = d3.select('.confirm')
                        .style('visibility', 'visible');
                    var _filter = _Local_data.filter(function (d1) {
                        return d[_dimension[0]] === d1[_dimension[0]]
                    })
                    var rect = d3.select(this);
                    if (rect.classed('selected')) {
                        rect.classed('selected', false);
                        filterData.map(function (val, i) {
                            if (val[_dimension[0]] == d[_dimension[0]]) {
                                filterData.splice(i, 1)
                            }
                        })
                    } else {
                        rect.classed('selected', true);
                        var isExist = filterData.filter(function (val) {
                            if (val[_dimension[0]] == d[_dimension[0]]) {
                                return val
                            }
                        })
                        if (isExist.length == 0) {
                            filterData.push(_filter[0]);
                        }
                    }
                }
            })

        element.append('text')
            .text(function (d, i) {
                return UTIL.getFormattedValue(d[d.measure], UTIL.getValueNumberFormat(i, _numberFormat));
            })
            .attr('x', function (d, i) {
                return y(d[d.measure]) + 20;
            })
            .attr('y', function (d, i) {
                return x1(d['measure']);
            })
            .attr('dx', function (d, i) {
                return offsetX / 8;
            })
            .attr('dy', function (d, i) {
                return x1.bandwidth() / 2 + d3.select(this).style('font-size').replace('px', '') / 2.5;
            })
            .style('text-anchor', 'middle')
            .attr('visibility', function (d, i) {
                return UTIL.getVisibility(_showValues[i]);
            })
            .attr('visibility', function (d, i) {
                var rect = d3.select(this.previousElementSibling).node(),
                    rectWidth = rect.getAttribute('width'),
                    rectHeight = rect.getAttribute('height');

                if (this.getAttribute('visibility') == 'hidden') return 'hidden';

                if ((this.getComputedTextLength() + (offsetX / 2)) > parseFloat(plotWidth - rectWidth)) {
                    return 'hidden';
                }

                if (parseInt(rectHeight) < parseInt(_fontSize[i])) {
                    return 'hidden';
                }
                return 'visible';
            })
            .style('font-style', function (d, i) {
                return _fontStyle[i];
            })
            .style('font-weight', function (d, i) {
                return _fontWeight[i];
            })
            .style('font-size', function (d, i) {
                return _fontSize[i] + 'px';
            })
            .style('fill', function (d, i) {
                return _textColor[i];
            });
    }
    /**
     * Builds the html data for the tooltip
     *
     * @param {object} datum Datum forming the arc
     * @param {function} chart Pie chart function
     * @return {string} String encoded HTML data
     */
    chart._legendInteraction = function (event, data) {
        switch (event) {
            case 'mouseover':
                _legendMouseOver(data);
                break;
            case 'mousemove':
                _legendMouseMove(data);
                break;
            case 'mouseout':
                _legendMouseOut(data);
                break;
            case 'click':
                _legendClick(data);
                break;
        }
    }

    chart._getName = function () {
        return _NAME;
    }


    var _legendMouseOver = function (data) {

        d3.selectAll('g.clusteredhorizontalbar')
            .filter(function (d) {
                return d.measure === data;
            })
            .select('rect')
            .style('fill', COMMON.HIGHLIGHTER);
    }

    var _legendMouseMove = function (data) {

    }

    var _legendMouseOut = function (data) {
        d3.selectAll('g.clusteredhorizontalbar')
            .filter(function (d) {
                return d.measure === data;
            })
            .select('rect')
            .style('fill', function (d, i) {
                return UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor);
            });
    }

    var _legendClick = function (data) {
        var _filter = UTIL.getFilterData(_localLabelStack, data, _originalData)
        drawPlot.call(this, _filter);
    }

    chart.update = function (data) {

        _Local_data = data,
            filterData = [];

        x0 = d3.scaleBand()
            .rangeRound([plotHeight, 0])
            .paddingInner(0.1)
            .padding([0.1]);

        x1 = d3.scaleBand()
            .padding(0.2);

        y = d3.scaleLinear()
            .rangeRound([0, plotWidth]);

        var keys = UTIL.getMeasureList(data[0], _dimension);

        x0.domain(data.map(function (d) { return d[_dimension[0]]; }));
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(data, function (d) {
            return d3.max(keys, function (key) {
                return parseInt(d[key]);
            });
        })]).nice();

        var plot = _local_svg.select('.plot')
        var cluster = plot.selectAll("g.cluster")
            .data(data);

        cluster.enter().append('g')
            .attr('class', 'cluster')
            .attr('transform', function (d) {
                return 'translate(0, ' + x0(d[_dimension[0]]) + ')';
            });

        cluster.exit()
            .transition()
            .duration(1000)
            .attr('height', 0)
            .attr('y', plotHeight)
            .remove();

        cluster = plot.selectAll('g.cluster');
        var labelStack = [];
        var clusteredhorizontalbar = cluster.selectAll('g.clusteredhorizontalbar')
            .data(function (d) {
                return keys.filter(function (m) {
                    return labelStack.indexOf(m) == -1;
                }).map(function (m) {

                    var obj = {};
                    obj[_dimension[0]] = d[_dimension[0]];
                    obj[m] = d[m];
                    obj['dimension'] = _dimension[0];
                    obj['measure'] = m;
                    return obj;
                });
            });

        clusteredhorizontalbar.select('rect')
            .attr("x", 1)
            .attr("y", function (d) {
                return x1(d.measure);
            })
            .attr("height", x1.bandwidth())
            .attr("width", function (d) {
                return y(d[d.measure]);
            })
            .attr('class', '')

        clusteredhorizontalbar.select('text')
            .text(function (d, i) {
                return UTIL.getFormattedValue(d[d.measure], UTIL.getValueNumberFormat(i, _numberFormat));
            })
            .attr('x', function (d, i) {
                return y(d[d.measure]) + 20;
            })
            .attr('y', function (d, i) {
                return x1(d['measure']);
            })
            .attr('dy', function (d, i) {
                return x1.bandwidth() / 2 + d3.select(this).style('font-size').replace('px', '') / 2.5;
            })
            .attr('visibility', function (d, i) {
                return UTIL.getVisibility(_showValues[i]);
            })
            .attr('visibility', function (d, i) {
                var rect = d3.select(this.previousElementSibling).node(),
                    rectWidth = rect.getAttribute('width'),
                    rectHeight = rect.getAttribute('height');

                if (this.getAttribute('visibility') == 'hidden') return 'hidden';

                if ((this.getComputedTextLength() + (offsetX / 2)) > parseFloat(plotWidth - rectWidth)) {
                    return 'hidden';
                }

                if (parseInt(rectHeight) < parseInt(_fontSize[i])) {
                    return 'hidden';
                }
                return 'visible';
            })

        var newBars = clusteredhorizontalbar.enter().append('g')
            .attr('class', 'clusteredhorizontalbar');

        drawViz(newBars);

        d3.selectAll('g.cluster')
            .attr('transform', function (d) {
                return 'translate(0, ' + x0(d[_dimension[0]]) + ')';
            });

        plot.select('.x_axis')
            .transition()
            .duration(1000)
            .call(d3.axisBottom(y));

        plot.select('.y_axis')
            .transition()
            .duration(1000)
            .call(d3.axisLeft(x0).ticks(null, "s"));

        UTIL.setAxisColor(_local_svg, _yAxisColor, _xAxisColor, _showYaxis, _showXaxis);
        UTIL.displayThreshold(threshold, data, keys);

    }

    chart.config = function (value) {
        if (!arguments.length) {
            return _config;
        }
        _config = value;
        _setConfigParams.call(chart, _config);
        return chart;
    }

    chart.dimension = function (value) {
        if (!arguments.length) {
            return _dimension;
        }
        _dimension = value;
        return chart;
    }

    chart.measure = function (value) {
        if (!arguments.length) {
            return _measure;
        }
        _measure = value;
        return chart;
    }

    chart.showLegend = function (value) {
        if (!arguments.length) {
            return _showLegend;
        }
        _showLegend = value;
        return chart;
    }

    chart.legendPosition = function (value) {
        if (!arguments.length) {
            return _legendPosition;
        }
        _legendPosition = value;
        return chart;
    }

    chart.sort = function (value) {
        if (!arguments.length) {
            return _sort;
        }
        _sort = value;
        return chart;
    }

    chart.tooltip = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _tooltip = value;
        return chart;
    }

    chart.showXaxis = function (value) {
        if (!arguments.length) {
            return _showXaxis;
        }
        _showXaxis = value;
        return chart;
    }

    chart.showYaxis = function (value) {
        if (!arguments.length) {
            return _showYaxis;
        }
        _showYaxis = value;
        return chart;
    }

    chart.showXaxisLabel = function (value) {
        if (!arguments.length) {
            return _showXaxisLabel;
        }
        _showXaxisLabel = value;
        return chart;
    }

    chart.showYaxisLabel = function (value) {
        if (!arguments.length) {
            return _showYaxisLabel;
        }
        _showYaxisLabel = value;
        return chart;
    }

    chart.xAxisColor = function (value) {
        if (!arguments.length) {
            return _xAxisColor;
        }
        _xAxisColor = value;
        return chart;
    }

    chart.yAxisColor = function (value) {
        if (!arguments.length) {
            return _yAxisColor;
        }
        _yAxisColor = value;
        return chart;
    }

    chart.showGrid = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _showGrid = value;
        return chart;
    }

    chart.stacked = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _stacked = value;
        return chart;
    }

    chart.displayName = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _displayName = value;
        return chart;
    }

    chart.legendData = function (measureConfig, measureName) {
        _legendData = {
            measureConfig: measureConfig,
            measureName: measureName
        }
        return _legendData;
    }

    chart.showValues = function (value, measure) {
        _baseAccessor.call(_showValues, value, measure)
    }

    chart.displayNameForMeasure = function (value, measure) {
        _baseAccessor.call(_displayNameForMeasure, value, measure)
    }

    chart.fontStyle = function (value, measure) {
        _baseAccessor.call(_fontStyle, value, measure)
    }

    chart.fontWeight = function (value, measure) {
        _baseAccessor.call(_fontWeight, value, measure)
    }

    chart.numberFormat = function (value, measure) {
        _baseAccessor.call(_numberFormat, value, measure)
    }

    chart.textColor = function (value, measure) {
        _baseAccessor.call(_textColor, value, measure)
    }

    chart.displayColor = function (value, measure) {
        _baseAccessor.call(_displayColor, value, measure)
    }

    chart.borderColor = function (value, measure) {
        _baseAccessor.call(_borderColor, value, measure)
    }

    chart.fontSize = function (value, measure) {
        _baseAccessor.call(_fontSize, value, measure)
    }

    var _baseAccessor = function (value, measure) {
        var me = this;

        if (!arguments.length) {
            return me;
        }

        if (value instanceof Array && measure == void 0) {
            me.splice(0, me.length);
            me.push.apply(me, value);
            return chart;
        }

        var index = _measure.indexOf(measure);

        if (index === -1) {
            throw new Error('Invalid measure provided');
        }

        if (value == void 0) {
            return me[index];
        } else {
            me[index] = value;
        }
        return chart;
    }
    return chart;
}