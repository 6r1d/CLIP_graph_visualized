/*
 * A color manipulation function by vcapra1.
 * https://stackoverflow.com/questions/28016890
 */
function approximateColor1ToColor2ByPercent(color1, color2, percent) {
    var red1 = parseInt(color1[1] + color1[2], 16)
    var green1 = parseInt(color1[3] + color1[4], 16)
    var blue1 = parseInt(color1[5] + color1[6], 16)

    var red2 = parseInt(color2[1] + color2[2], 16)
    var green2 = parseInt(color2[3] + color2[4], 16)
    var blue2 = parseInt(color2[5] + color2[6], 16)

    var red = Math.round(mix(red1, red2, percent))
    var green = Math.round(mix(green1, green2, percent))
    var blue = Math.round(mix(blue1, blue2, percent))

    return generateHex(red, green, blue)
}

function generateHex(r, g, b) {
    let R = r.toString(16)
    let G = g.toString(16)
    let B = b.toString(16)
    // Fix number formatting with
    // a zero padding
    while (R.length < 2) {
        R = `0${R}`
    }
    while (G.length < 2) {
        G = `0${G}`
    }
    while (B.length < 2) {
        B = `0${B}`
    }
    // Compose the color
    return `#${R}${G}${B}`
}

function mix(start, end, percent) {
    return start + ((percent) * (end - start))
}

/* Clamp */
let clamp = function(number, min, max) {
    return Math.min(Math.max(number, min), max)
}

/* Find min and max value in an array */
let min_and_max = function(numbers) {
    return {
        'min': Math.min.apply(null, numbers),
        'max': Math.max.apply(null, numbers)
    }
}

/*
 * Range remapping
 * Source: https://stackoverflow.com/questions/929103 (dragon788)
 */
let remap = function(x, in_min, in_max, out_min, out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
}

/* Render a graph */
let render = function(data) {
    // Find minimum and maximum values for node ranks and link weights
    let ranks = min_and_max(
        data.nodes.map((node) => node.rank)
    )
    let weights = min_and_max(
        data.links.map((link) => link.weight)
    )
    // Prepare node ids and colors
    data.nodes = data.nodes.map((node) => {
        node.id = `${node.id}`
        node.rank = remap(node.rank * 10, ranks.min, ranks.max, 0.0, 1.0)
        node.color = approximateColor1ToColor2ByPercent('#0000ff', '#ff8c00', node.rank)
        return node
    })
    // Prepare link colors
    data.links = data.links.map((link) => {
        link.weight = remap(link.weight * 10, weights.min, weights.max, 0.0, 1.0)
        link.color = approximateColor1ToColor2ByPercent('#0000ff', '#ff8c00', link.weight)
        return link
    })
    // Create a graph instance,
    // configure a color scheme
    const Graph = ForceGraph()
        (document.getElementById('graph'))
        .backgroundColor('#222222')
        .linkColor(l => l.color) 
        .nodeColor(n => n.color)
        .graphData(data)
    // Resize the graph canvas element automatically
    elementResizeDetectorMaker().listenTo(
        document.getElementById('graph'),
        function(element) {
            Graph.width(element.offsetWidth)
            Graph.height(element.offsetHeight)
        }
    )
}

// Preload JSON, render a graph when ready
fetch("./graph.json")
    .then(response => response.json())
    .then(data => render(data))
