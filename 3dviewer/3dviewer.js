// VARIABLES!!!
var cylinder_faces = 3;
var sphere_faces = 3;
var show_spheres = false;
//Render dentro de div render
var Render = new THREE.WebGLRenderer({ alpha: true });
// scene
var scene = new THREE.Scene();
// Orbit controls
var controls;
var width=400;
var height=600;
var Camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
var group; //create an empty container for all the figure lin3s

var lin3;

init_3dviewer();
animation();

function init_3dviewer() {
	Render.setSize(width, height);
	document.getElementById('div-viewer3d').appendChild(Render.domElement);
	Camera.position.set(  0,-100,100);
	scene.add(Camera);
  addLights();
  group = new THREE.Object3D();//create an empty container
	controls=new THREE.OrbitControls(Camera,Render.domElement);
}

function draw_shape_into_3dviewer() {
  remove_previous_shape();
  add_new_shape();
}

function addLights() {
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(-200, -200, 100);
    scene.add(dirLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(200, 200, 100);
    scene.add( directionalLight);
    var ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambientLight);
}

function remove_previous_shape() {
  scene.remove(lin3);
}

function add_new_shape() {

  if(array_draw_line_3d[0].length < 2){
    return;
  }
	// http://threejs.org/docs/#Reference/Objects/Line
  // Why lines doesnt react to light
  // http://stackoverflow.com/questions/16308730/three-js-lines-with-different-materials-and-directional-light-intensity
  var material = new THREE.MeshLambertMaterial({color: 0x00ff00,
                                                side:THREE.DoubleSide
                                               });
  var geometry = new THREE.Geometry();
  
  // Adding vertices to the geometry
  for(var i = 0; i < array_draw_line_3d.length; i++) {
    for(var j = 0; j < array_draw_line_3d[i].length; j++) {
      geometry.vertices.push(new THREE.Vector3(array_draw_line_3d[i][j][0],  array_draw_line_3d[i][j][1], array_draw_line_3d[i][j][2])); 
    }
  }
  
  // Adding faces to the geometry
  var layer_num_of_points = array_draw_line_3d[0].length;
  console.log("layer_num_of_points = " + layer_num_of_points);
  var num_of_faces = (layer_num_of_points - 1) * (array_draw_line_3d.length-1);
  console.log("num_of_faces = " + num_of_faces);

  // Lucky faces generation, only god knows why it works, si l'encerto l'endevino
  for(var i = 1; i < array_draw_line_3d.length; i++) {
    for(var j = 0; j < (array_draw_line_3d[i].length - 1); j++) {
      geometry.faces.push(new THREE.Face3(j, 
                                          j + 1 ,
                                          j + layer_num_of_points * i));
      geometry.faces.push(new THREE.Face3(j + 1,
                                          j + 1 + layer_num_of_points * i,
                                          j + layer_num_of_points * i)); 
    }
  }
  var jump = 0;
  for(var i = 0; i < num_of_faces; i++) {
    if(i==layer_num_of_points)
      jump++;
    // geometry.faces.push(new THREE.Face3(i + jump, i + 1 + jump, i + jump + layer_num_of_points));
    // geometry.faces.push(new THREE.Face3(i + 1 + jump, i + 1 + layer_num_of_points + jump, i + layer_num_of_points + jump)); 
  }
  // This does the trick to have lighting effect in the material from
  // http://stackoverflow.com/questions/21761704/three-js-draw-custom-mesh-with-meshlambertmaterial-and-point-light
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();
  
  console.log("geometry size = " + geometry.vertices.length);
  lin3 = new THREE.Mesh(geometry, material);
  // Positioned and rotated to place properly each line
	scene.add(lin3);
}

function animation() {
	requestAnimationFrame(animation);
  render_model();
}

function render_model() {
	controls.update();
  if(lin3)
    lin3.rotation.z += 0.001;
	Render.render(scene, Camera);
}

var debugaxis = function(axisLength){
    //Shorten the vertex function
    function v(x,y,z){ 
            return new THREE.Vector3(x,y,z); 
    }    
    //Create axis (point1, point2, colour)
    function createAxis(p1, p2, color){
            var line, lineGeometry = new THREE.Geometry(),
            lineMat = new THREE.LineBasicMaterial({color: color, lineWidth: 1});
            lineGeometry.vertices.push(p1, p2);
            line = new THREE.Line(lineGeometry, lineMat);
            scene.add(line);
    }
    createAxis(v(-axisLength, 0, 0), v(axisLength, 0, 0), 0xFF0000);
    createAxis(v(0, -axisLength, 0), v(0, axisLength, 0), 0x00FF00);
    createAxis(v(0, 0, -axisLength), v(0, 0, axisLength), 0x0000FF);
};

//To use enter the axis length
debugaxis(100);