$( document ).ready( function(){ 
	setupThree();
	addLights();
	addControls();

	window.cubeGroup = new THREE.Object3D();

	window.cubeSize = 90;
	window.cube = new THREE.Mesh(){
		new THREE.CubeGeometry( cubeSize, cubeSize, cubeSize, 32, 32, 32),
		new THREE.MeshLambertMaterial({
			new THREE.ImageUtils.loadTexture( 'media/kubr.jpg' )

		})
	}

	cube.position.set( 0, 0, 0 );
	cube.receiveShadow = true;
	cube.castShadow = true;
	cubeGroup.add(cube);


	scene.add( cubeGroup );

	loop();

})


function loop(){
	render();
	controls.update();
	window.requestAnimationFrame( loop );

}


function render(){
	renderer.autoClear = false;
	renderer.clear();

	renderer.render( scene, camera );

}


function surfacePlot( params ){

	params = cascade( params, {} )
	params.latitude  = cascade( params.latitude.degreesToRadians(),  0 )
	params.longitude = cascade( params.longitude.degreesToRadians(), 0 )
	params.center    = cascade( params.center, new THREE.Vector3( 0, 0, 0 ))
	params.radius    = cascade( params.radius, 60 )

	var
	x = params.center.x + params.latitude.cosine() * params.longitude.cosine() * params.radius,
	y = params.center.y + params.latitude.cosine() * params.longitude.sine()   * params.radius,
	z = params.center.z + params.latitude.sine()   * params.radius

	return new THREE.Vector3( x, y, z );
}


function setupThree(){
	window.scene = new THREE.Scene();

	var
	WIDTH      = window.innerHeight,
	HEIGHT     = window.innerHeight,

	//HEIGHT     = window.innerHeight,
	VIEW_ANGLE = 55,   //should be between 0 and 180. really small number can behave as a zoom lens. larger number behave like a IMAX lens
	ASPECT     = WIDTH / HEIGHT,
	NEAR       = 0.1, 	//usually default value is 0.1
	FAR        = 6000; //because we don't have to render something too far away that is not even visible
						// there is no limitation when it comes to far value. but the farther, the more processing
						// usually 1000 to million


	window.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR )
	//orthographic camera trial
	//window.camera = new THREE.OrthographicCamera( WIDTH / - 2, WIDTH / 2, HEIGHT / 2, HEIGHT / - 2, 1, 1000 );
	
	camera.position.set(0, 130, 300 )
	camera.lookAt( scene.position )/////I can use this function later
	scene.add( camera );


	window.renderer = new THREE.WebGLRenderer({ antialias: true })
	//renderer.setSize( 800, 600 )
	renderer.setSize( window.innerWidth, window.innerHeight )
	renderer.shadowMapEnabled = true
	renderer.shadowMapSoft = true

	$( '#three' ).append( renderer.domElement )

}


function addControls(){

	window.controls = new THREE.TrackballControls( camera )

	controls.rotateSpeed = 1.0
	controls.zoomSpeed   = 1.2
	controls.panSpeed    = 0.8

	controls.noZoom = false
	controls.noPan  = false
	controls.staticMoving = true
	controls.dynamicDampingFactor = 0.3
	controls.keys = [ 65, 83, 68 ]//  ASCII values for A, S, and D

	controls.addEventListener( 'change', render );
}


function addLights(){

	var ambient, directional;

	ambient = new THREE.AmbientLight( 0xBBBBBB )
	
	scene.add( ambient )	

	// Now let's create a Directional light as our pretend sunshine.
	// Directional light has an infinite source.

	//directional light does not have a particular position. (not an one source.)
	//just pushing to one direction and everything starts to illuminate. think as a plane reflector on video shooting

	directional = new THREE.DirectionalLight( 0xCCCCCC )
	directional.castShadow = true;
	scene.add( directional );

	directional.position.set( 100, 200, 300 )
	directional.target.position.copy( scene.position )
	directional.shadowCameraTop     =  600
	directional.shadowCameraRight   =  600
	directional.shadowCameraBottom  = -600
	directional.shadowCameraLeft    = -600
	directional.shadowCameraNear    =  600
	directional.shadowCameraFar     = -600
	directional.shadowBias          =   -0.0001
	directional.shadowDarkness      =    0.3
	directional.shadowMapWidth      = directional.shadowMapHeight = 2048
	//directional.shadowCameraVisible = true

	// orthographic camera : losing the depth but there's no skew(oblique angle)
	//
	//references
	//point light: emanate from a particular position in all directions. most realistic. think about a bare bulb
	// not directional. more like all direction
	//regardless of all positions

}	// spotlight: emanate from a partlcular position and in a specific directions
	//has a point source position and target position.


	//vector has magnititude: hw far it can travel1

	//matt texture: if there's low specular area and high scattering, it will look like a matt texture




// 	CubeGeometry(width, height, depth, widthSegments, heightSegments, depthSegments)

// width — Width of the sides on the X axis.
// height — Height of the sides on the Y axis.
// depth — Depth of the sides on the Z axis.
// widthSegments — Number of segmented faces along the width of the sides.
// heightSegments — Number of segmented faces along the height of the sides.
// depthSegments — Number of segmented faces along the depth of the sides.

