function mainLoop() {
	requestAnimationFrame(mainLoop);
	GAME.update();
}

function onDocumentMouseDown(event) {
    event.preventDefault();

    var vector = new THREE.Vector3(
        ( event.clientX / window.innerWidth ) * 2 - 1,
        - ( event.clientY / window.innerHeight ) * 2 + 1,
        0.5 );

    GAME.ms_Projector.unprojectVector( vector, GAME.ms_Camera );

    var ray = new THREE.Raycaster( GAME.ms_Camera.position, vector.sub( GAME.ms_Camera.position ).normalize() );
    var intersects = ray.intersectObjects( GAME.ms_Clickable );

    if (intersects.length > 0) {
        intersects[0].object.callback();
    }
}

$(function() {
	WINDOW.initialize();

	document.addEventListener('click', onDocumentMouseDown, false);

	var parameters = {
		alea: RAND_MT,
		generator: PN_GENERATOR,
		width: 2000,
		height: 2000,
		widthSegments: 250,
		heightSegments: 250,
		depth: 1500,
		param: 4,
		filterparam: 1,
		filter: [ CIRCLE_FILTER ],
		postgen: [ MOUNTAINS_COLORS ],
		effect: [ DESTRUCTURE_EFFECT ]
	};

	GAME.initialize('canvas-3d', parameters);

	WINDOW.resizeCallback = function(inWidth, inHeight) { GAME.resize(inWidth, inHeight); };
	GAME.resize(WINDOW.ms_Width, WINDOW.ms_Height);

	mainLoop();
});
