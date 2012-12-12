// // what to do:
// making submitted picture as a texture of the cube

// question to ask Stewart:
// How can I make the submitted picture as a texture?

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
var picture, pictureTexture, pictureMaterial;
var world3D;
var middlePlane, leftPlane, rightPlane;
var vidCanvas;
var picCanvas;
var pixels;
var wireMaterial;
var meshMaterial;
var container, stats;
var params, title, info, prompt;

var clock = new THREE.Clock();


init();

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

	

	//initiate webcam texture
	video = document.createElement( 'video' );
	video.width = vidWidth;
	video.height = vidHeight;
	video.autoplay = true;
	video.loop = true;

	//make it cross browser
	window.URL = window.URL || window.webkitURL;
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

	//get webcam
	navigator.getUserMedia({
		video: true
	}, function( stream ){
		//on webcam enabled
		video.src = window.URL.createObjectURL( stream );
		 prompt.style.display = 'none';
		//title.style.display = 'inline';
		container.style.display = 'inline';
	}, function( error ){
		prompt.innerHTML = "Unable to capture Webcam. Please reload the page.";
	});


	latest = document.getElementById( 'latest' );
	picture = "https://s3.amazonaws.com/gotham-project/2012120515101354738200-stern.png"; 
	console.log( picture );
	// picture = "https://s3.amazonaws.com/gotham-project/{{ img.images[0] }}";
	// picture = document.getElementsByClassName( 'img-polaroid' ).images[0];
	// console.log( picture );
	//picture = '{{ images[0] }}';
	// picture.width = vidWidth;
	// picture.height = vidHeight;

/////////////////////////////////////////////////////////////////
// next step should be how to use filtered video as a texture? //
/////////////////////////////////////////////////////////////////
	
	videoTexture = new THREE.Texture( video );

	cubeGroup= new THREE.Object3D();
	scene.add( cubeGroup );


	//video texture
	meshMaterial = new THREE.MeshBasicMaterial({
		opacity: 0.5,
		map: videoTexture,
		side: THREE.DoubleSide
		//wireframe: true
	});

	pictureMaterial = new THREE.MeshBasicMaterial({
		opacity: 0.5,
		map: THREE.ImageUtils.loadTexture( picture ),
		side: THREE.DoubleSide
		
	})


	//1. add middle wall
	middlePlane = new THREE.PlaneGeometry( 640, 640, vidWidth, vidHeight);
	middlePlane.dynamic = true;

	
	var middleWall = new THREE.Mesh( middlePlane, pictureMaterial );
	middleWall.position.z = -280;


	cubeGroup.add( middleWall );


	// 2. add left wall
	leftPlane = new THREE.PlaneGeometry( 640, 640, vidWidth, vidHeight);
	leftPlane.dynamic = true;

	var leftWall = new THREE.Mesh( leftPlane, meshMaterial );

	leftWall.rotation.y = 1.25;
	leftWall.position.x = -400;
	leftWall.position.z = 5;

	cubeGroup.add( leftWall );	
	

	// 3. add right wall
	rightPlane = new THREE.PlaneGeometry( 640, 640, vidWidth, vidHeight);
	rightPlane.dynamic = true;

	var rightWall = new THREE.Mesh( rightPlane, meshMaterial );

	//leftWall.rotation.y = Math.PI / 2;
	rightWall.position.x = 400;
	rightWall.position.z = 5;
	rightWall.rotation.y = -1.25;

	cubeGroup.add( rightWall );	

	cubeGroup.position.set( 0, 150, -300);


	renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	renderer.sortObjects = false;
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMapEnabled = true
	renderer.shadowMapSoft = true

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


/////////////////////////////////////////////
/////phase3. wireframe z depth
////////////////////////////////////////
// if ()


function animate(){
	if ( video.readyState === video.HAVE_ENOUGH_DATA ){
		videoTexture.needsUpdate = true;
	}
	
	
	controls.update();
	requestAnimationFrame( animate );
	render();
}



function render(){
	cubeGroup.scale = new THREE.Vector3( 0.5, 0.5, 1 );

	// renderer.autoClear = false;
	// renderer.clear();

	renderer.render( scene, camera );
}



// function onResize(){
// 	renderer.setSize( window.innerWidth, window.innerHeight );
// 	camera.aspect = window.innerWidth / window.innerHeight;
// 	camera.updateProjectionMatrix();
// 	windowHalfX = window.innerWidth / 2;
// 	windowHalfY = window.innerHeight / 2;
// }


function detectSpecs() {

	//init HTML elements
	container = document.querySelector('#container');
	prompt = document.querySelector('#prompt');
	info = document.querySelector('#info');
	title = document.querySelector('#title');
	//info.style.display = 'none';
	//title.style.display = 'none';
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
		//init();
	}

}

detectSpecs();

