const toSnakeCase = str =>
    str &&
    str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(x => x.toLowerCase())
    .join('_');

const conversationsList = [1412, 1413, 1414, 1434, 1441, 1442, 1446, 1447, 1463, 1464, 1465, 1466, 1478, 1483, 1484, 1489, 1490, 1495, 1496, 1497, 1499, 1503, 1504, 1379, 1380, 1508, 1382, 1509, 1511, 1512, 1521, 1527, 1528, 1529, 1530, 1403, 1406, 1407];

const canvasHeight = 550;

let width = Math.max(window.innerWidth - 28 * 2, 800);
const height = 500;

document.getElementsByClassName('tag-container-bottom')[0].style.width = width + "px";
document.getElementsByClassName('tag-container-bottom')[1].style.width = width + "px";

document.getElementById("chart").style.height = canvasHeight + "px";

let svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", canvasHeight);

let g = svg.append('g');


// d3.json('1382.json').then(data => {

//     const entities = data.data.entities;
//     console.log(entities)
//     const conversationDuration = entities.conversations['1382'].duration;
//     const speakerCount = Object.keys(entities.conversations['1382'].speech_pipeline_info.alignment_info.speaker_stats).length;
//     drawConversation({ x: 10, y: 10, width: 800, snippets: Object.values(entities.snippets), duration: conversationDuration, speakerCount });

//     // Object.values(entities.snippets).forEach((snippet, index) => {
//     //     g.append('rect')
//     //         .attr('class', 'rect')
//     //         .attr('x', scale(snippet['audio_start_offset']))
//     //         .attr('y', (snippetHeight + 2) * Number(snippet.speaker_id))
//     //         .attr('width', scale(snippet['duration']))
//     //         .attr('height', snippetHeight)
//     //         .attr('fill', function (d, i) {
//     //             return 'gray';
//     //         })
//     // .on('mouseover', function (d, i) {
//     //     d3.selectAll("." + d3.select(d.target).attr("class")).transition()
//     //         .duration('50')
//     //         .attr('opacity', '.45')
//     // })
//     // .on('mouseout', function (d, i) {
//     //     d3.selectAll("." + d3.select(d.target).attr("class")).transition()
//     //         .duration('50')
//     //         .attr('opacity', '1');
//     // })
//     // })
// });

const tags = ['housing', 'public_health', 'violence', 'discrimination', 'economic_opportunity', 'education', 'government_and_institutions', 'infrastructure', 'community_life', 'safety', ];

const conversationPadding = 5;
const snippetHeight = 7;
const verticalSnippetPadding = 1;
let conversationWidth = (width - 5 * 6) / 6;

const tagsUnique = new Set();

function drawConversation({
    x,
    y,
    width,
    snippets,
    duration,
    speakerCount
}) {
    const gConversation = g.append('g');

    let height = snippetHeight * speakerCount + 2 * conversationPadding + verticalSnippetPadding * (speakerCount - 1);

    let textSpaceWidth = 40;

    gConversation.append('rect')
        .attr('x', x + textSpaceWidth)
        .attr('y', y)
        .attr('width', width - textSpaceWidth)
        .attr('height', height)
        .attr('fill', function (d, i) {
            return '#F8F8F8';
        });

    const scale = d3.scaleLinear()
        .domain([0, duration])
        .range([0, width - 2 * conversationPadding - textSpaceWidth]);

    const speakers = new Set();
    // snippets.forEach((snippet, index) => {
    gConversation.append('g').selectAll('snippet')
        .data(snippets)
        .enter()
        .append('rect')
        .attr('id', (snippet) => {
            return "id" + snippet['id'];
        })
        .attr('class', (snippet) => {
            if (!speakers.has(snippet.speaker_name)) {
                speakers.add(snippet.speaker_name);
            }
            let tags = "";
            if (snippet.tags) {
                tags += "hasTag "
                snippet.tags.forEach(tag => {
                    const mainAndSubTag = tag.split('.');
                    tags += toSnakeCase(mainAndSubTag[0]) + " ";
                    tagsUnique.add(toSnakeCase(mainAndSubTag[0]));
                })
            }
            return "snippet " + tags
        })
        .attr('x', (snippet) => x + textSpaceWidth + conversationPadding + scale(snippet['audio_start_offset']))
        .attr('y', (snippet) => y + conversationPadding + ((snippetHeight + verticalSnippetPadding) * Number(snippet.speaker_id)))
        .attr('width', (snippet) => scale(snippet['duration']))
        .attr('height', snippetHeight)
        .attr('fill', function (d, i) {
            return '#A9A9A9';
        })
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)
        .on("click", snippetClick);

    gConversation.append('g')
        .selectAll('speakers')
        .data(Array.from(speakers))
        .enter()
        .append('text')
        .attr("x", x)
        .attr("y", (speaker, i) => y + conversationPadding + ((snippetHeight + verticalSnippetPadding) * Number(i)))
        .attr("dy", snippetHeight / 2)
        .attr("alignment-baseline", 'middle')
        .style("font-size", "7px")
        .style("fill", '#A9A9A9')
        .text((d) => {
            return d
        });
    // })
}



function getConversationAndDraw(index, startY, startX) {
    console.log(index);
    const conversationId = conversationsList[index]
    // d3.json('http://localhost:3000', {
    //     method: 'GET',
    //     headers: new Headers({
    //         'Target-URL': 'https://app.lvn.org/api/conversations/detail/' + conversationId,
    //     }),
    // })
    d3.json('./data_RTFC/' + conversationId + ".json")
        .then(data => {
            const entities = data.data.entities;
            console.log(entities)
            const conversationDuration = entities.conversations[conversationId].duration;
            const speakerCount = Object.keys(entities.conversations[conversationId].speech_pipeline_info.alignment_info.speaker_stats).length;

            let convHeight = snippetHeight * speakerCount + 2 * conversationPadding + verticalSnippetPadding * (speakerCount - 1);
            let nextStartY = startY + convHeight + 5;
            if (nextStartY > height) {
                startY = 5;
                nextStartY = 5 + convHeight + 5;
                startX += conversationWidth + 5;
            }

            drawConversation({
                x: startX,
                y: startY,
                width: conversationWidth,
                snippets: Object.values(entities.snippets),
                duration: conversationDuration,
                speakerCount
            });



            if (index < 98) {
                getConversationAndDraw(index + 1, nextStartY, startX);
            }

        });
}

let highlightedSnippets = new Set();

let buttons = document.getElementsByClassName('tag-button')
for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', toggleSnippet, false);
    buttons[i].addEventListener('mouseover', hoverSnippet, false);
    buttons[i].addEventListener("mouseout", exitHoverSnippet, false);
}

var link = d3.linkHorizontal()
    .x(function (d) {
        return d.x;
    })
    .y(function (d) {
        return d.y;
    });

function toggleSnippet(e) {
    this.classList.toggle('active');
    const id = e.target.id;

    if (highlightedSnippets.has(id) && !this.classList.contains('active')) {
        highlightedSnippets.delete(id)
        d3.selectAll('.line_' + id).remove();
        d3.selectAll('.' + id).classed('highlight', false);
    } else {
        highlightedSnippets.add(id);
    }
    console.log(highlightedSnippets)
    highlightComboButtons();
    drawConnections();
    highlightSnippets();
}

function hoverSnippet(e) {
    const id = e.target.id;

    if (highlightedSnippets.has(id)) {
        return;
    }
    highlightedSnippets.add(id);

    drawConnections();
}

function exitHoverSnippet(e) {
    const id = e.target.id;

    if (highlightedSnippets.has(id) && this.classList.contains('active')) {
        return;
    }

    highlightedSnippets.delete(id)
    d3.selectAll('.line_' + id).remove();

    drawConnections();
}

function highlightComboButtons() {
    if (!Array.from(highlightedSnippets).length) {
        d3.selectAll('.tag-button').property("disabled", false);
        d3.selectAll('.tag-button').classed('disabled', false);
        return;
    }
    let connectionClass = "";
    highlightedSnippets.forEach(id => {
        connectionClass += "." + id;
    });
    let combos = [];
    d3.selectAll('.tag-button').classed('disabled', true);
    d3.selectAll('.tag-button').property("disabled", true);
    tags.forEach(tag => {
        if (highlightedSnippets.has(tag) || !d3.select(connectionClass + "." + tag).empty()) {
            combos.push(tag);
            d3.select('#' + tag).classed('disabled', false);
            d3.select('#' + tag).property("disabled", false);
        }
    })
}

function drawConnections() {
    let connectionClass = "";
    highlightedSnippets.forEach(id => {
        connectionClass += "." + id;
    });
    d3.selectAll('.line').remove();
    if (connectionClass) {
        d3.selectAll(connectionClass).each(function (d, i) {
            let x = Number(d3.select(this).attr('x'));
            let y = Number(d3.select(this).attr('y'));
            let dx = Number(d3.select(this).attr('width')) / 2;
            let dy = Number(d3.select(this).attr('height')) / 2;

            highlightedSnippets.forEach(id => {
                let indexOfTag = tags.indexOf(id);
                let tagWidth = width / tags.length;

                let data = {
                    source: {
                        x: tagWidth * indexOfTag + tagWidth / 2,
                        y: canvasHeight
                    },
                    target: {
                        x: x + dx,
                        y: y + dy,
                    }
                };

                g.append('path')
                    .attr("d", link(data))
                    .attr("class", "line line_" + id)
                    .style("stroke-width", 0.4)
                    .attr('fill', 'none');
            });
        })
    }
}

function highlightSnippets() {
    d3.selectAll('.snippet').style('opacity', 0.5);
    highlightedSnippets.forEach(id => {
        d3.selectAll('.' + id)
            .style('opacity', 1)
            .classed('highlight', true);
    });
    if (highlightedSnippets.size === 0) {
        d3.selectAll('.snippet').style('opacity', 1);
    }
}

const strokeScale = d3.scaleLinear()
    .domain([1, 10])
    .range([200, 100]);

// Info bar

// var Infobar = d3.select("#infobar")
//     .attr('class', 'infobar')
//     .style("display", "none")
//     .style("max-height", canvasHeight + "px")
//     .style("left", (width) + "px")
//     .style("top", "0px");

// var InfobarText = d3.select('#infobar-text');

// var InfobarSpeaker = d3.select('#infobar-speaker');

// d3.select("#close-infobar").on('click', () => {
//     Infobar.style("display", "none");
// })

// TOOLTIP

// create a tooltip
var Tooltip = d3.select("#chart")
    .append("div")
    .attr('class', 'tooltip')
    .style("opacity", 0)
// .style("left", (width) + "px")
// .style("top", "0px");

var mouseover = function (event, d) {

    if (d['highlight_words']) {
        d3.select("#id" + d.id).classed("hover", true);
        Tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        // if (event.pageX < width / 2) {
        Tooltip.html(`${d['highlight_words'].split(' ').slice(0,20).join(' ') + "..."}`)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY) + "px")
            .style("max-width", (width - event.pageX) + "px");
        // } else {
        //     Tooltip.html(`${d['highlight_words']}`)
        //     // .style("left", (0) + "px")
        //     // .style("top", (event.pageY) + "px")
        //     // .style("max-width", (event.pageX) + "px");
        // }
    }

}
var mouseleave = function (event, d) {
    d3.select("#id" + d.id).classed("hover", false);
    if (d['highlight_words']) {
        Tooltip.transition()
            .duration(200)
            .style("opacity", 0);
    }
}

var snippetClick = function (event, d) {
    if (d['highlight_words']) {
        // Infobar.style("display", "inherit");
        // InfobarText.html(`${d['highlight_words']}`);
        // InfobarSpeaker.html(d['speaker_name']);

        iframe.src = "https://labs.lvn.org/rtfc-lvn-embed/index.html?hid=" + d['highlight_id']
        modal.style.display = "block";

    }
}


// MODAL / OVERLAY

// Get the modal
var modal = document.getElementById("myModal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

var iframe = document.getElementById('audio-iframe');

iframe.onload = function () {
    iframe.style.visibility = "visible"
};

// When the user clicks on the button, open the modal
// btn.onclick = function() {
//   modal.style.display = "block";
// }

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
    iframe.style.visibility = "hidden";
    iframe.src = "";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
        iframe.style.visibility = "hidden";
        iframe.src = "";
    }
}



// ZOOM

let zoomStroke = true;

const zoom = d3.zoom()
    .scaleExtent([1, 10])
    .translateExtent([
        [0, 0],
        [width, canvasHeight]
    ])
    .on('zoom', handleZoom);

function handleZoom(e) {
    // if (e.transform.k > 1.5 && zoomStroke) {
    //     d3.selectAll(".snippet.highlight").attr('stroke-opacity', "0");
    //     zoomStroke = false;
    // } else if (e.transform.k < 1.5 && !zoomStroke) {
    //     d3.selectAll(".snippet.highlight").attr('stroke-opacity', "1");
    //     zoomStroke = true;
    // }

    d3.select('svg g')
        .attr('transform', e.transform);
}

function initZoom() {
    d3.select('svg')
        .call(zoom);
}



getConversationAndDraw(0, 5, 5);

initZoom();

// function drawChart() {
//     width = window.innerWidth - 28 * 2;
//     conversationWidth = (width - 5 * 6) / 6;

//     svg.attr("width", width);

//     getConversationAndDraw(0, 5, 5);

//     initZoom();
// }

// window.addEventListener('resize', drawChart);