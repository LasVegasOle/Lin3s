// Global variables shared with paperscript
window.globals = {
    array_line_2d: [],
    call_array_2d_to_3d: function() { array_2d_to_3d(); }
};
// Object that holds all the user configuration parameters
var parameters = {
  layer_height: 0,
  num_of_layers: 0,
  first_height: 0,
  delta_x: 0,
  layer_rotation: 0,
  top_layer_scale: 0,
  extrusion_radius: 0,  // This parameters is for ThreeJS Cyilinders radius
  center_x: 0,
  center_y: 0,
  'update': function() {
    this.layer_height = parseFloat(document.getElementById("layer_height").value);
    this.num_of_layers = parseFloat(document.getElementById("num_of_layers").value);
    this.first_height = parseFloat(document.getElementById("first_height").value);
    this.delta_x = parseFloat(document.getElementById("delta_x").value);
    this.layer_rotation = parseFloat(document.getElementById("layer_rotation").value);
    this.top_layer_scale = parseFloat(document.getElementById("top_layer_scale").value);
    this.extrusion_radius = this.layer_height/2;
    this.center_x = parseFloat(document.getElementById("center_x").value);
    this.center_y = parseFloat(document.getElementById("center_y").value);
  }
}

// Handling events
// Parameters Events handler
document.getElementById('parameters').addEventListener('change', eventChangeHandler);
function eventChangeHandler(e) {
	if (e.target !== e.currentTarget) {
		var item = e.target.id;
    parameters.update();
    array_2d_to_3d();  
	}
    e.stopPropagation();
} 

// 3Dimension array[layer][node][coordinates]
// Todo: Add extruder dimension
var array_line_3d = [];
parameters.update();

// From 2d array to 3d array for 3d Viewer and Gcode generation
function array_2d_to_3d() {
  // Reset 3d line array
  array_line_3d = [];
  var x, y, z;
  // Loop for the total amount of layers
  for (var layer_index = 0; layer_index < parameters.num_of_layers; layer_index++) {
    array_line_3d[layer_index] = [];  // Adding layer info
    // Loop over the line #number of nodes
    for (var point_index=0; point_index < globals.array_line_2d.length; point_index++) {
      // Scale model to delta_x parameter and round to 3 decimals
      x = Math.round(1000 * globals.array_line_2d[point_index][0] * parameters.delta_x/100)/1000;
      y = Math.round(1000 * globals.array_line_2d[point_index][1] * parameters.delta_x/100)/1000;
      z = parameters.first_height + layer_index * parameters.layer_height;
      z = Math.round(1000 * z) / 1000;
      // Scale model based on top layer scale %
      x = x * scale_layer(layer_index);
      y = y * scale_layer(layer_index);
      // Rotate layers based on rotation parameters deg/layers
      var rotated_coordinates = rotate_point(x, y, layer_index);
      x = rotated_coordinates[0];
      y = rotated_coordinates[1];
      array_line_3d[layer_index].push([x, y, z]); // Adding coordinates info
    }
  }
  // console.log(array_line_3d);
  draw_shape_into_3dviewer();
  // Center array after drawing to avoid messing drawing location
  center_array_line_3d();
}

function rotate_point(x, y, layer_index) {
//http://www.mathematics-online.org/inhalt/aussage/aussage444/
// x' = cos(rot) * x + sin(rot) * y
// y' = -sin(rot) * x + cos(rot) * y
	var rot = parameters.layer_rotation * layer_index * (Math.PI / 180);
	var x_rot = Math.cos(rot) * x + Math.sin(rot) * y;
	var y_rot = -Math.sin(rot) * x + Math.cos(rot) * y;
	return[x_rot, y_rot];
}

// @brief Calculates the layer scale value 1 (100%) for each layer
function scale_layer(layer_index) {
	var totalScale = parameters.top_layer_scale;
	if (totalScale > 100) {
		var layerScale = (totalScale - 100) / parameters.num_of_layers;
		return (1 + (layerScale/100) * layer_index);
	}
	else if (totalScale < 100) {
		var layerScale = (100 - totalScale) / parameters.num_of_layers;
		return (1 - (layerScale/100) * layer_index);
	}
	else
		return 1;
}

// @brief Center array_line_3d this is to adapt to different printer with different center print
// area location
function center_array_line_3d() {
  // Find minimum x and y values
  // Loop for the total amount of layers
  for (var layer_index = 0; layer_index < parameters.num_of_layers; layer_index++) {
    // Loop over the line #number of nodes
    for (var point_index=0; point_index < globals.array_line_2d.length; point_index++) {
      // Moving print center and rounding values, 3decimals
      array_line_3d[layer_index][point_index][0] = Math.round(1000 * 
                                                   (array_line_3d[layer_index][point_index][0] + parameters.center_x))
                                                   / 1000;
      array_line_3d[layer_index][point_index][1] = Math.round(1000 * 
                                                   (array_line_3d[layer_index][point_index][1] + parameters.center_y))
                                                   / 1000;
    }
  }
}