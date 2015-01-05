// VARIABLES!!!
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
    var dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(100, -100, 10);
    scene.add(dirLight);
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set( 0, 1, 0 );
    scene.add( directionalLight );
    var ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add(ambientLight);
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
  var material = new THREE.MeshLambertMaterial({color: 0x55ff55});
  
  for(var i = 0; i < array_line_3d.length; i++) {
    for(var j = 0; j < array_line_3d[i].length - 1; j++) {
      // Calculate position for each line (cylinder)
      var current_point = array_line_3d[i][j];
      var target_point = array_line_3d[i][j+1];
      var delta_x = target_point[0] - current_point[0];
      var delta_y = target_point[1] - current_point[1];
      var delta_z = target_point[2] - current_point[2];
      var delta_xy = Math.sqrt(Math.pow(delta_x,2) + Math.pow(delta_y,2));
      var distance = Math.sqrt(Math.pow(delta_x,2) + Math.pow(delta_y,2) + Math.pow(delta_z,2));
      var z_rotation = Math.atan2(delta_z, delta_xy);
      //console.log("target_z = " + target_point[2] + ", current_z = " + current_point[2] + 
      //", delta_z = " + delta_z + ", delta_xy = " + delta_xy + ", z rotation = " + z_rotation);
      var rotation = Math.atan2(delta_y, delta_x);
      // Build cylinder geometry for each line
      var geometry = new THREE.CylinderGeometry(parameters.extrusion_radius, parameters.extrusion_radius, distance, 5);
      var lin3 = new THREE.Mesh(geometry, material);
      // Positioned and rotated to place properly each line
      lin3.rotation.set(0, -z_rotation, -Math.PI/2 + rotation);
      lin3.position.set(current_point[0] + (delta_xy/2) * Math.cos(rotation),
                            current_point[1] + (delta_xy/2) * Math.sin(rotation),
                            current_point[2]);
      group.add(lin3);
      // Adding a sphere joint for each corner
      var geometry = new THREE.SphereGeometry(parameters.extrusion_radius, 5, 5);
      var sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(target_point[0], target_point[1], target_point[2]);
      group.add(sphere);
    }
  }
	scene.add(group);
}

function animation() {
	requestAnimationFrame(animation);
  render_model();
}

function render_model() {
	controls.update();
	//group.rotation.z += 0.001;
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