// // what to do:
// // change cube to the three planes so I can project only three different versions
// // add 4 function buttons that related to our projects
// // phase one : mask or organic filters
// // phase two:
// // phase three: mesh
// // phase four: mirroring and distorting
// // add about and other pages
// // optionatal : add music changing function to the phase
// // optional: add costume change function to the phase
// thanks Mr.doob!
/**
 *
 * WebCam Mesh by Felix Turner
 * @felixturner / www.airtight.cc
 * (c) Airtight Interactive Inc. 2012
 *
 * Connects HTML5 WebCam input to a WebGL 3D Mesh. It creates a 3D depth map by mapping pixel brightness to Z-depth.
 * Perlin noise is used for the ripple effect and CSS3 filters are used for color effects.
 * Use mouse move to tilt and scroll wheel to zoom. Requires Chrome or Opera.
 *
 */
var canvasWidth = 320 / 2;
var canvasHeight = 240 / 2;
var vidWidth = 320;
var vidHeight = 320;
var tiltSpeed = 0.1;
var tiltAmount = 0.5;

var camera, scene, renderer;
var windowHalfX, windowHalfY;
var video, videoTexture;
var world3D;
var middlePlane, leftPlane, rightPlane;
var vidCanvas;
var pixels;
var wireMaterial;
var meshMaterial;
var container, stats;
var params, title, info, prompt;

var clock = new THREE.Clock();

init();
animate();

function init(){
	//stop the user getting a text cursor
	document.onselectstart = function(){
		return false;
	}

	container = document.createElement('div');
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 1, 10000);
	camera.target = new THREE.Vector3( 0, 0, 0);
	
	
	scene = new THREE.Scene();
	scene.add( camera );
	camera.position.z = 1500;


	// controls = new THREE.FlyControls( camera );
	// controls.movementSpeed = 1000;
	// controls.domElement = container;
	// controls.rollSpeed = Math.PI / 24;
	// controls.autoForward = false;
	// controls.dragToLook = false;

	

	//initiate webcam texture
	video = document.createElement( 'video' );
	video.width = vidWidth;
	video.height = vidHeight;
	video.autoplay = true;
	video.loop = true;

	//make it cross browser
	window.URL = window.URL || wibdow.webkitURL;
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

	//get webcam
	navigator.getUserMedia({
		video: true
	}, function( stream ){
		//on webcam enabled
		video.src = window.URL.createObjectURL( stream );
		prompt.style.display = 'none';
		title.style.display = 'inline';
		container.style.display = 'inline';
	}, function( error ){
		prompt.innerHTML = "Unable to capture Webcam. Please reload the page.";
	});

	
	videoTexture = new THREE.Texture( video );


	cubeGroup= new THREE.Object3D();
	scene.add( cubeGroup );


	// add planes
	middlePlane = new THREE.PlaneGeometry( 640, 640, canvasWidth, canvasHeight);
	middlePlane.dynamic = true;
	meshMaterial = new THREE.MeshBasicMaterial({
		opacity: 1,
		map: videoTexture
	});

	var middleWall = new THREE.Mesh( middlePlane, meshMaterial );
	// middleWall.position.x = window.innerWidth / 2;;
	// middleWall.position.y = window.innerHeight / 2;

	cubeGroup.add( middleWall );
	middleWall.position.z = 5;


	renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	renderer.sortObjects = false;
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );


	//initiate vidCanvas: and used to analyze the video pixels
	vidCanvas = document.createElement('canvas');
	document.body.appendChild( vidCanvas );
	vidCanvas.style.position = 'absolute';
	vidCanvas.style.display = 'none';
	ctx = vidCanvas.getContext('2D');


	//webGL context lost handler
	renderer.domElement.addEventListener("webglcontextlost", function( event ){
		prompt.style.display = 'inline';
		prompt.innerHTML = 'WebGL Context Lost. Please try reloading the page.';
	}, false );

	//onResize();

	animate();

}


function animate(){
	if ( video.readyState === video.HAVE_ENOUGH_DATA ){
		videoTexture.needsUpdate = true;
	}
	requestAnimationFrame( animate );
	render();
}


function render(){
	cubeGroup.scale = new THREE.Vector3( 0.5, 0.5, 1);
	renderer.render( scene, camera );
}


function onResize(){
	renderer.setSize( window.innerWidth, window.innerHeight );
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;
}


function detectSpecs() {

	//init HTML elements
	container = document.querySelector('#container');
	prompt = document.querySelector('#prompt');
	info = document.querySelector('#info');
	title = document.querySelector('#title');
	info.style.display = 'none';
	title.style.display = 'none';
	container.style.display = 'none';

	var hasWebgl = (function() {
		try {
			return !!window.WebGLRenderingContext && !! document.createElement('canvas').getContext('experimental-webgl');
		} catch (e) {
			return false;
		}
	})();

	var hasGetUserMedia = (function() {
		return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
	})();

	//console.log("hasWebGL: " + hasWebgl);
	//console.log("hasGetUserMedia: " + hasGetUserMedia);
	if (!hasGetUserMedia) {
		prompt.innerHTML = 'This demo requires webcam support (Chrome or Opera).';
	} else if (!hasWebgl) {
		prompt.innerHTML = 'No WebGL support detected. Please try restarting the browser.';
	} else {
		prompt.innerHTML = 'Please allow camera access.';
		init();
	}

}


detectSpecs();

// $( document ).ready( function(){ 
// 	console.log("hello hello");
// 	setupThree();
// 	addLights();
// 	addControls();

// 	window.cubeGroup = new THREE.Object3D();

// 	window.cubeSize = 90;
// 	window.cube = new THREE.Mesh(
// 		new THREE.CubeGeometry( cubeSize, cubeSize, cubeSize, 32, 32, 32),
// 		new THREE.MeshLambertMaterial({
// 			map: THREE.ImageUtils.loadTexture( 'static/media/kubr.jpg' )
// 		})
// 	)

// 	cube.position.set( 0, 0, 0 );
// 	cube.receiveShadow = true;
// 	cube.castShadow = true;
// 	cubeGroup.add(cube);


// 	scene.add( cubeGroup );

// 	loop();

// })


// function loop(){
// 	render();
// 	controls.update();
// 	window.requestAnimationFrame( loop );

// }


// function render(){
// 	renderer.autoClear = false;
// 	renderer.clear();

// 	renderer.render( scene, camera );

// }


// function surfacePlot( params ){

// 	params = cascade( params, {} )
// 	params.latitude  = cascade( params.latitude.degreesToRadians(),  0 )
// 	params.longitude = cascade( params.longitude.degreesToRadians(), 0 )
// 	params.center    = cascade( params.center, new THREE.Vector3( 0, 0, 0 ))
// 	params.radius    = cascade( params.radius, 60 )

// 	var
// 	x = params.center.x + params.latitude.cosine() * params.longitude.cosine() * params.radius,
// 	y = params.center.y + params.latitude.cosine() * params.longitude.sine()   * params.radius,
// 	z = params.center.z + params.latitude.sine()   * params.radius

// 	return new THREE.Vector3( x, y, z );
// }


// function setupThree(){
// 	window.scene = new THREE.Scene();

// 	var
// 	WIDTH      = window.innerHeight,
// 	HEIGHT     = window.innerHeight,

// 	//HEIGHT     = window.innerHeight,
// 	VIEW_ANGLE = 55,   //should be between 0 and 180. really small number can behave as a zoom lens. larger number behave like a IMAX lens
// 	ASPECT     = WIDTH / HEIGHT,
// 	NEAR       = 0.1, 	//usually default value is 0.1
// 	FAR        = 6000; //because we don't have to render something too far away that is not even visible
// 						// there is no limitation when it comes to far value. but the farther, the more processing
// 						// usually 1000 to million


// 	window.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR )
// 	//orthographic camera trial
// 	//window.camera = new THREE.OrthographicCamera( WIDTH / - 2, WIDTH / 2, HEIGHT / 2, HEIGHT / - 2, 1, 1000 );
	
// 	camera.position.set(0, 100, 250 )
// 	camera.lookAt( scene.position )/////I can use this function later
// 	scene.add( camera );


// 	window.renderer = new THREE.WebGLRenderer({ antialias: true })
// 	//renderer.setSize( 800, 600 )
// 	renderer.setSize( window.innerWidth, window.innerHeight )
// 	renderer.shadowMapEnabled = true
// 	renderer.shadowMapSoft = true

// 	$( '#three' ).append( renderer.domElement )

// }


// function addControls(){

// 	window.controls = new THREE.TrackballControls( camera )

// 	controls.rotateSpeed = 1.0
// 	controls.zoomSpeed   = 1.2
// 	controls.panSpeed    = 0.8

// 	controls.noZoom = false
// 	controls.noPan  = false
// 	controls.staticMoving = true
// 	controls.dynamicDampingFactor = 0.3
// 	controls.keys = [ 65, 83, 68 ]//  ASCII values for A, S, and D

// 	controls.addEventListener( 'change', render );
// }


// function addLights(){

// 	var ambient, directional;

// 	ambient = new THREE.AmbientLight( 0xBBBBBB )
	
// 	scene.add( ambient )	

// 	// Now let's create a Directional light as our pretend sunshine.
// 	// Directional light has an infinite source.

// 	//directional light does not have a particular position. (not an one source.)
// 	//just pushing to one direction and everything starts to illuminate. think as a plane reflector on video shooting

// 	directional = new THREE.DirectionalLight( 0xCCCCCC )
// 	directional.castShadow = true;
// 	scene.add( directional );

// 	directional.position.set( 100, 200, 300 )
// 	directional.target.position.copy( scene.position )
// 	directional.shadowCameraTop     =  600
// 	directional.shadowCameraRight   =  600
// 	directional.shadowCameraBottom  = -600
// 	directional.shadowCameraLeft    = -600
// 	directional.shadowCameraNear    =  600
// 	directional.shadowCameraFar     = -600
// 	directional.shadowBias          =   -0.0001
// 	directional.shadowDarkness      =    0.3
// 	directional.shadowMapWidth      = directional.shadowMapHeight = 2048
// 	//directional.shadowCameraVisible = true

// 	// orthographic camera : losing the depth but there's no skew(oblique angle)
// 	//
// 	//references
// 	//point light: emanate from a particular position in all directions. most realistic. think about a bare bulb
// 	// not directional. more like all direction
// 	//regardless of all positions

// }	// spotlight: emanate from a partlcular position and in a specific directions
// 	//has a point source position and target position.


// 	//vector has magnititude: hw far it can travel1

// 	//matt texture: if there's low specular area and high scattering, it will look like a matt texture




// // 	CubeGeometry(width, height, depth, widthSegments, heightSegments, depthSegments)

// // width — Width of the sides on the X axis.
// // height — Height of the sides on the Y axis.
// // depth — Depth of the sides on the Z axis.
// // widthSegments — Number of segmented faces along the width of the sides.
// // heightSegments — Number of segmented faces along the height of the sides.
// // depthSegments — Number of segmented faces along the depth of the sides.

