// VARIABLES!!!
//Render dentro de div render
var Render = new THREE.WebGLRenderer({ alpha: true });
// scene
var scene = new THREE.Scene();

// Orbit controls
var controls;

var width=400;
var height=600;

var group; //create an empty container for all the figure lin3s

// Camera
//var Camera = new THREE.PerspectiveCamera(Angulo,Aspecto,cerca,lejos);
var Camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
init_3dviewer();
animation();

function init_3dviewer() {
	Render.setSize(width, height);
	document.getElementById('div-viewer3d').appendChild(Render.domElement);
	Camera.position.z = 100;
	scene.add(Camera);
  // addLights();
  group = new THREE.Object3D();//create an empty container
  
	controls=new THREE.OrbitControls(Camera,Render.domElement);
}

function draw_shape_into_3dviewer() {
  remove_previous_shape();
  add_new_shape();
}

function addLights() {
    var dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(100, 100, 50);
    scene.add(dirLight);
}

function remove_previous_shape() {

	var obj, i;
	for (i = group.children.length - 1; i >= 0 ; i--) {
		obj = group.children[i];
    group.remove(obj);
	}
}

function add_new_shape() {
	// http://threejs.org/docs/#Reference/Objects/Line
  // Why lines doesnt react to light
  // http://stackoverflow.com/questions/16308730/three-js-lines-with-different-materials-and-directional-light-intensity
	var material = new THREE.LineBasicMaterial({
		color: 0x1111FF,
		linewidth : 8
	});
  
  for(var i = 0; i < array_line_3d.length; i++) {
    var geometry = new THREE.Geometry(); // New geometry for each layer line
    for(var j = 0; j < array_line_3d[i].length; j++) {
      geometry.vertices.push(new THREE.Vector3(array_line_3d[i][j][0],  
                                               array_line_3d[i][j][1], 
                                               array_line_3d[i][j][2]));
    }
    var lin3 = new THREE.Line(geometry, material);
    lin3.name = j;
    group.add(lin3);
  }
	
	//var base = spinningGroup.getObjectByName("base");
	scene.add(group);
}

function animation() {
	requestAnimationFrame(animation);
	render_model();
}

function render_model() {
	controls.update();
	//linia.rotation.z += 0.002;
	Render.render(scene, Camera);
}