const conversationsList = [1483, 1484, 1466, 1465, 1461, 1462, 1463, 1447, 1446, 1438, 1441, 1478, 1442, 1434, 1464, 1414, 1413, 1412, 1407, 1403, 1406, 1382, 1379, 1380, 1378, 1411, 1405, 1363, 1360, 1439, 1358, 1355, 1353, 1357, 1352, 1347, 1348, 1349, 1354, 1320, 1323, 1322, 1317, 1304, 1319, 1306, 1311, 1309, 1336, 1310, 1305, 1321, 1293, 1312, 1307, 1290, 1292, 1281, 1280, 1273, 1285, 1268, 1269, 1282, 1251, 1219, 1211, 1225, 1227, 1284, 1223, 1314, 1231, 1192, 1286, 1191, 1190, 1220, 1230, 1193, 1183, 1184, 1189, 1221, 1179, 1177, 1182, 1175, 1178, 1171, 1172, 1174, 1181, 1173, 1170, 1222, 1160, 1337, 1161, 1162, 1157, 1159, 1154, 1151, 1152, 1141, 1131, 1122, 1123];

const canvasHeight = 650;

const width = 1130;
const height = 600;

document.getElementById("chart").style.height = "650px";

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

const tags = ['housing', 'healthcare', 'abuse', 'inequality', 'growth', 'generations', 'accountability', 'infrastructure'];

const conversationPadding = 5;
const snippetHeight = 5;
const verticalSnippetPadding = 1;
const conversationWidth = 120;

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

    gConversation.append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', function (d, i) {
            return '#F8F8F8';
        });

    const scale = d3.scaleLinear()
        .domain([0, duration])
        .range([0, width - 2 * conversationPadding]);

    // snippets.forEach((snippet, index) => {
    g.selectAll('snippet')
        .data(snippets)
        .enter()
        .append('rect')
        .attr('class', () => {
            return "snippet " + tags[Math.floor(Math.random() * tags.length * 20)] + " " + tags[Math.floor(Math.random() * tags.length * 20)]
        })
        .attr('x', (snippet) => x + conversationPadding + scale(snippet['audio_start_offset']))
        .attr('y', (snippet) => y + conversationPadding + ((snippetHeight + verticalSnippetPadding) * Number(snippet.speaker_id)))
        .attr('width', (snippet) => scale(snippet['duration']))
        .attr('height', snippetHeight)
        .attr('fill', function (d, i) {
            return '#A9A9A9';
        })
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)
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
    d3.json('./data/' + conversationId + ".json")
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

let buttons = document.getElementsByTagName('button')
for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', toggleSnippet, false);
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
    d3.selectAll('.' + id).each(function (d, i) {
        let x = d3.select(this).attr('x');
        let y = d3.select(this).attr('y');

        let indexOfTag = tags.indexOf(id);
        let tagWidth = width / tags.length;

        let data = {
            source: {
                x: tagWidth * indexOfTag + tagWidth / 2,
                y: canvasHeight
            },
            target: {
                x,
                y
            }
        };

        g.append('path')
            .attr("d", link(data))
            .attr("class", "line line_" + id)
            .style("stroke-width", 0.5)
            .attr('fill', 'none');
    })
    if (highlightedSnippets.has(id)) {
        highlightedSnippets.delete(id)
        d3.selectAll('.line_' + id).remove();
        d3.selectAll('.' + id).classed('highlight', false);
    } else {
        highlightedSnippets.add(id);
    }
    highlightSnippets();
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

// TOOLTIP

// create a tooltip
var Tooltip = d3.select("#chart")
    .append("div")
    .attr('class', 'tooltip')
    .style("opacity", 0);

var mouseover = function (event, d) {
    let sentence = "";
    d.words.forEach(word => {
        sentence += word[0] + " "
    })
    Tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    Tooltip.html(`${d['speaker_name']}<br/>${sentence}`)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px")
        .style("max-width", (width - event.pageX) + "px");
}
var mouseleave = function (d) {
    Tooltip.transition()
        .duration(200)
        .style("opacity", 0);

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