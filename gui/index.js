Snap.load('layer.svg', function(loadedFragment) {
    console.log(loadedFragment);
    var svg = Snap('.layer-container');
    svg.append(loadedFragment);
});
