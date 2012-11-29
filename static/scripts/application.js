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

var camera, scene, renderer, controls;
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
addControls();


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


	//1. add middle wall
	middlePlane = new THREE.PlaneGeometry( 640, 640, canvasWidth, canvasHeight);
	middlePlane.dynamic = true;
	meshMaterial = new THREE.MeshBasicMaterial({
		opacity: 1,
		map: videoTexture
	});

	var middleWall = new THREE.Mesh( middlePlane, meshMaterial );
	middleWall.position.z = 5;

	cubeGroup.add( middleWall );


	// 2. add left wall
	leftPlane = new THREE.PlaneGeometry( 640, 640, canvasWidth, canvasHeight);
	leftPlane.dynamic = true;

	var leftWall = new THREE.Mesh( leftPlane, meshMaterial );

	//leftWall.rotation.y = Math.PI / 2;
	leftWall.rotation.y = 1.2;
	leftWall.position.x = -320;
	leftWall.position.z = 5;

	cubeGroup.add( leftWall );	
	

	// 3. add left wall
	rightPlane = new THREE.PlaneGeometry( 640, 640, canvasWidth, canvasHeight);
	rightPlane.dynamic = true;

	var rightWall = new THREE.Mesh( rightPlane, meshMaterial );

	//leftWall.rotation.y = Math.PI / 2;
	rightWall.rotation.y = -1.2;
	rightWall.position.x = 320;
	rightWall.position.z = 5;

	cubeGroup.add( rightWall );	
	console.log( "leftwall should be there");



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
	controls.update();
}


function render(){
	cubeGroup.scale = new THREE.Vector3( 0.5, 0.5, 1 );

	renderer.autoClear = false;
	renderer.clear();

	renderer.render( scene, camera );
}


function onResize(){
	renderer.setSize( window.innerWidth, window.innerHeight );
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;
}


function addControls(){

	controls = new THREE.TrackballControls( camera )

	controls.rotateSpeed = 1.0
	controls.zoomSpeed   = 1.2
	controls.panSpeed    = 0.8

	controls.noZoom = false
	controls.noPan  = false
	controls.staticMoving = true
	controls.dynamicDampingFactor = 0.3
	controls.keys = [ 65, 83, 68 ]//  ASCII values for A, S, and D

	controls.addEventListener( 'change', render );
	console.log("controls controls");

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

