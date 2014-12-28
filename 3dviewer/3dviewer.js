// VARIABLES!!!
//Render dentro de div render
var Render = new THREE.WebGLRenderer({ alpha: true });
// scene
var scene = new THREE.Scene();

// Figura
var Figura;
// Orbit controls
var controls;
var linia;

var Ancho=window.innerWidth-15;
var Alto=window.innerHeight-10;

var Angulo = 45;
var Aspecto=Ancho/Alto;
var cerca=0.1;
var lejos=10000;

// Camera
//var Camera = new THREE.PerspectiveCamera(Angulo,Aspecto,cerca,lejos);
var Camera = new THREE.PerspectiveCamera( 75, (window.innerWidth) / (window.innerHeight), 0.1, 1000 );
init_3dviewer();
animacion();

function init_3dviewer() {
	Render.setSize(400,600);
	document.getElementById('div-viewer3d').appendChild(Render.domElement);
	Camera.position.z = 100;
	scene.add(Camera);
	// Cargar plano
	//cargar_modelo();
  add_new_shape();
	controls=new THREE.OrbitControls(Camera,Render.domElement);
}

function draw_shape_into_3dviewer() {
  remove_previous_shape();
  add_new_shape();
}

function remove_previous_shape() {
}

function add_new_shape() {
	// http://threejs.org/docs/#Reference/Objects/Line
  alert(array_line_3d);
	var material = new THREE.LineBasicMaterial({
		color: 0x00FFFF,
		linewidth : 10
	});
	var geometry = new THREE.Geometry();
	for(var i = 0; i<array_line_3d.length; i++) {
		geometry.vertices.push(new THREE.Vector3(array_line_3d[i][0],  array_line_3d[i][1], array_line_3d[i][2]));
    console.log(array_line_3d[i][0],  array_line_3d[i][1], array_line_3d[i][2]);
  }
	linia = new THREE.Line(geometry, material);
	//var base = spinningGroup.getObjectByName("base");
	scene.add(linia);
}

function cargar_modelo() {
	// Geometria
	Geometria = new THREE.Geometry();
	var vertices=[ [2,7,0],[7,2,0],[12,7,0],[12,17,0],[7,12,0],[2,17,0],
	[2,7,0], [2,7,2],[7,2,2],[12,7,2],[12,17,2],[7,12,2],[2,17,2],
	[2,7,2]];
	var long_vertices = vertices.length;
	for (i = 0; i < long_vertices; i++) {
		x = vertices[i][0];
		y = vertices[i][1];
		z = vertices[i][2];
		// Agregamos vertices al vector
		Vector = new THREE.Vector3(x, y, z);
		//Agregamos el vector a la geometria
		Geometria.vertices.push(Vector);
	}
	// Agregar punto
	puntoMaterial = new THREE.PointCloudMaterial({color:0x0044FF});
	// Linea
	Figura = new THREE.Line(Geometria, puntoMaterial);
	scene.add(Figura);
}
  
function animacion() {
	requestAnimationFrame(animacion);
	render_modelo();
}

function render_modelo() {
	controls.update();
	//Figura.rotation.y += 0.01;
  linia.scale.x += 0.1;
	Render.render(scene, Camera);
}