Snap.load('layer.svg', function(loadedFragment) {
    console.log(loadedFragment);
    var svg = Snap('.layer-container');
    svg.append(loadedFragment);
    svg.selectAll('.key').forEach(function(element) {
        element.click(function() {
            var boundingBox = this.node.getBoundingClientRect();
            centerY = boundingBox.top + boundingBox.height/2;
            console.log('click', boundingBox);
            svg.select('svg').text(boundingBox.left, centerY, 'lo!').attr({fill:'white'});
        })
    });


});
