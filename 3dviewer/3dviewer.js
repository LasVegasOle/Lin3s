// VARIABLES!!!
//Render dentro de div render
var Render = new THREE.WebGLRenderer({ alpha: true });
// Escenario
var Escenario = new THREE.Scene();

// Figura
var Figura;
// Orbit controls
var controls;

var Ancho=window.innerWidth-15;
var Alto=window.innerHeight-10;

var Angulo = 45;
var Aspecto=Ancho/Alto;
var cerca=0.1;
var lejos=10000;

// Camera
var Camera = new THREE.PerspectiveCamera(Angulo,Aspecto,cerca,lejos);

inicio();
animacion();

function inicio() {
	Render.setSize(400,600);
	document.getElementById('div-viewer3d').appendChild(Render.domElement);
	Camera.position.z = 100;
	Escenario.add(Camera);
	// Cargar plano
	cargar_modelo();

	
	controls=new THREE.OrbitControls(Camera,Render.domElement);
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
	Escenario.add(Figura);
}
  
function animacion() {
	requestAnimationFrame(animacion);
	render_modelo();
}

function render_modelo() {
	controls.update();
	Figura.rotation.y += 0.01;
	Render.render(Escenario, Camera);
}