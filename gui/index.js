Snap.load('layer.svg', function(loadedFragment) {
    var container = Snap('.layer-container');
    container.append(loadedFragment);
    var svg = container.select('svg');
    container.selectAll('.key').forEach(function(element) {
        element.click(function() {
            var OUT_OF_VIEWPORT_COORDINATE = -1000000;
            var FONT_BASELINE_RATIO = 0.1;
            var keyBoundingBox = this.node.getBoundingClientRect();
            var text = svg.text(OUT_OF_VIEWPORT_COORDINATE, OUT_OF_VIEWPORT_COORDINATE, 'x')
                          .attr({fill:'white', fontSize:'40'});
            var textBoundingBox = text.node.getBoundingClientRect();
            text.attr({
                x: keyBoundingBox.left + (keyBoundingBox.width - textBoundingBox.width)/2,
                y: keyBoundingBox.top + keyBoundingBox.height/2 + FONT_BASELINE_RATIO*textBoundingBox.height
            });
        })
    });
});
