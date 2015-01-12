// Global variables shared with paperscript
window.globals = {
    array_line_2d: [],
    open_line: true,  
    call_array_2d_to_3d: function() { array_2d_to_3d(); },
    draw_line: function() { draw_line(); }
};
// Object that holds all the user configuration parameters
var parameters = {
  layer_height: 0,
  width_x: 0,
  length_y: 0,
  height_z: 0,
  num_of_layers: 0,
  first_height: 0,
  delta_x: 0,
  total_rotation: 0,
  layer_rotation: 0,
  top_layer_scale: 0,
  extrusion_radius: 0,  // This parameters is for ThreeJS Cyilinders radius
  center_x: 0,
  center_y: 0,
  continuous_path: true,
  material_diameter: 0,
  nozzle_diameter: 0,
  nozzle_material_surfaces_ratio: 0,
  feedrate: 0,
  delay: 0,
  'update': function() {
    this.width_x = parseFloat(document.getElementById("width_x").value);
    //this.length_y = parseFloat(document.getElementById("length_y").value);
    this.height_z = parseFloat(document.getElementById("height_z").value);
    this.layer_height = parseFloat(document.getElementById("layer_height").value);
    this.num_of_layers = this.height_z/this.layer_height;
    this.first_height = parseFloat(document.getElementById("first_height").value);
    this.total_rotation = parseFloat(document.getElementById("layer_rotation").value);
    this.layer_rotation = parseFloat(this.total_rotation/this.num_of_layers);
    this.top_layer_scale = parseFloat(document.getElementById("top_layer_scale").value);
    this.extrusion_radius = this.layer_height/2;
    this.center_x = parseFloat(document.getElementById("center_x").value);
    this.center_y = parseFloat(document.getElementById("center_y").value);
    this.feedrate = 60 * parseFloat(document.getElementById("feedrate").value); // from mm/s to mm/min
    this.delay = parseFloat(document.getElementById("delay").value);
    this.material_diameter = parseFloat(document.getElementById("material_diameter").value);
    this.nozzle_diameter = parseFloat(document.getElementById("nozzle_diameter").value);
    var nozzle_surface = Math.PI * Math.pow((this.nozzle_diameter/2),2);
    var material_surface = Math.PI * Math.pow((this.material_diameter/2),2);
    //console.log("Nozzle surface = " + nozzle_surface + ", Material Surface = " + material_surface);
    this.nozzle_material_surfaces_ratio = nozzle_surface / material_surface;
    //console.log("nozzle material surface ratio = " + this.nozzle_material_surfaces_ratio);
  }
}

// Handling events
// Parameters Events handler
document.getElementById('parameters').addEventListener('change', eventChangeHandler);
function eventChangeHandler(e) {
	if (e.target !== e.currentTarget) {
		var item = e.target.id;
    parameters.update();
    draw_line();  
	}
    e.stopPropagation();
} 

//document.getElementById('width')

// 3Dimension array[layer][node][coordinates]
// Todo: Add extruder dimension
var array_line_3d = [], array_draw_line_3d = [];

parameters.update();

// This transforms the 2d shape into an ordered array used by the 3d-viewer
function draw_line() {
  //console.log("draw_line");
    array_draw_line_3d = [];
  var x, y, z;
  // Loop for the total amount of layers
  for (var layer_index = 0; layer_index < parameters.num_of_layers; layer_index++) {
    array_draw_line_3d[layer_index] = [];  // Adding layer info
    // console.log("LOGIC: start = " + start + ", direction = " + direction + ", inc = " + inc);
    for (var point_index = 0; point_index < globals.array_line_2d.length; point_index ++) {
      // Scale model to delta_x parameter and round to 3 decimals
      x = Math.round(1000 * globals.array_line_2d[point_index][0] * parameters.width_x/100)/1000;
      y = Math.round(1000 * globals.array_line_2d[point_index][1] * parameters.width_x/100)/1000;
      z = parameters.first_height + layer_index * parameters.layer_height;
      z = Math.round(1000 * z) / 1000;
      // Scale model based on top layer scale %
      x = x * scale_layer(layer_index);
      y = y * scale_layer(layer_index);
      // Rotate layers based on rotation parameters deg/layers
      var rotated_coordinates = rotate_point(x, y, layer_index);
      x = rotated_coordinates[0];
      y = rotated_coordinates[1];
      array_draw_line_3d[layer_index].push([x, y, z]); // Adding coordinates info
    }
  }
  // console.log(array_draw_line_3d);
  draw_shape_into_3dviewer();
}

// From 2d array to 3d array for 3d Viewer and Gcode generation
function array_2d_to_3d() {
  // Reset 3d line array
  array_line_3d = [];
  var x, y, z;
  var direction = true; // used to invert the order of points on a layer
                         // this is useful for a path that changes directions every layer
  var point_index = 0;
  // Loop for the total amount of layers
  for (var layer_index = 0; layer_index < parameters.num_of_layers; layer_index++) {
    array_line_3d[layer_index] = [];  // Adding layer info
    // Loop over the line #number of nodes
    // Every layer needs to reverse de points order to have a path that returns through that inverts direction
    // Avoiding jumps
    // line is printed inverting direction every layer. Used for prints without jumps
    var start, loop_cond, inc; 
    if(direction) { 
        start = 0; 
        inc = 1; 
        loop_cond = function(){return point_index < globals.array_line_2d.length}; 
    } else { 
        start = globals.array_line_2d.length - 1; 
        inc = -1; 
        loop_cond = function(){return point_index >= 0}; 
    }
    // console.log("LOGIC: start = " + start + ", direction = " + direction + ", inc = " + inc);
    for (point_index=start; loop_cond(); point_index += inc) {
      // Scale model to delta_x parameter and round to 3 decimals
      x = Math.round(1000 * globals.array_line_2d[point_index][0] * parameters.width_x/100)/1000;
      y = Math.round(1000 * globals.array_line_2d[point_index][1] * parameters.width_x/100)/1000;
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
    if(globals.open_line) {
      direction = !direction;// Reverse direction
    }
  }
  // Convert path to conitnuous path in Z axis too
  // If line is not a closed path, do not calculate continuous path
  // due to to reach same point on a layer, 2 layers need to be walked (1 forward, 1 backwards)
  // this increases the height distance between this points = 2*layer_height
  // Possible solution is for none-closed-lines double the amount of layers, and reduce the layer_height to half  
  if (parameters.continuous_path && !globals.open_line) {
    continuous_path_calculation();
  }
  add_extrusion_values();
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

// @brief Increases height point by point instead of layer by layer
function continuous_path_calculation() {
  for(var layers_index = 0; layers_index < array_line_3d.length; layers_index++) {
    // Measure whole layer size
    var layer_length = 0;
    // Calculate total layer length
    for(var points_index = 0; points_index < array_line_3d[layers_index].length - 1; points_index++) {
      // Calculate distance btw current and next point
      var current_point = array_line_3d[layers_index][points_index];
      var target_point = array_line_3d[layers_index][points_index+1];
      var delta_x = target_point[0] - current_point[0];
      var delta_y = target_point[1] - current_point[1];
      var distance = Math.sqrt(Math.pow(delta_x,2)+Math.pow(delta_y,2));
      layer_length += distance;
    }
    // console.log(layer_length);
    // Measure whole each point displacement
    var partial_point_layer_length = 0;  
    for(var points_index = 0; points_index < array_line_3d[layers_index].length - 1; points_index++) {
      // Calculate distance btw current and next point
      var current_point = array_line_3d[layers_index][points_index];
      var target_point = array_line_3d[layers_index][points_index+1];
      var delta_x = target_point[0] - current_point[0];
      var delta_y = target_point[1] - current_point[1];
      var distance = Math.sqrt(Math.pow(delta_x,2)+Math.pow(delta_y,2));
      partial_point_layer_length += distance;
      // Make sure first point of each layer (when layer length = 0)
      // has a starting point of previous non continuous layer height
      var continuous_z = array_line_3d[layers_index][points_index][2];
      if (layer_length != 0) {
        continuous_z = array_line_3d[layers_index][0][2] + // Initial layer height
                       Math.round(1000 * 
                                        (partial_point_layer_length/layer_length) 
                                       * parameters.layer_height
                                  )/1000;
      }
      //console.log("partial_point_layer_length = " + partial_point_layer_length + 
      //            ", layer_length = " + layer_length + ", parameters.layer_height = " + parameters.layer_height);
      array_line_3d[layers_index][points_index+1][2] = Math.round(1000 *continuous_z)/1000;
      //console.log("layer length = " + layer_length + ", continuous_z = " + continuous_z);
    }
  }
}

// This calculates the extrusion value for each trajectory
function add_extrusion_values() {
    // if(globals.open_line)
  var e = 0;
  var point_index = 0;
  
  for(var layer_index = 0; layer_index < array_line_3d.length; layer_index++ ) {
    // This feels first point of each layer with the last e value
    point_index = 0;
    // This is for closed paths, to have a first layer point with extrusion
    if (!globals.open_line && layer_index != 0) {
      var current_point = array_line_3d[layer_index-1][array_line_3d[layer_index].length - 1];
      var target_point = array_line_3d[layer_index][0];
      var delta_x = target_point[0] - current_point[0];
      var delta_y = target_point[1] - current_point[1];
      var delta_z = target_point[2] - current_point[2];
      var distance = Math.sqrt(Math.pow(delta_x,2) + Math.pow(delta_y,2) + Math.pow(delta_z,2));
      e += distance * parameters.nozzle_material_surfaces_ratio;     
      array_line_3d[layer_index][point_index][3] = Math.round(10000 * e) / 10000;  
    } else {
      array_line_3d[layer_index][point_index][3] = e;
    }
    for(point_index = 0; point_index < (array_line_3d[layer_index].length - 1); point_index++) {
      var current_point = array_line_3d[layer_index][point_index];
      var target_point = array_line_3d[layer_index][point_index+1];
      var delta_x = target_point[0] - current_point[0];
      var delta_y = target_point[1] - current_point[1];
      var delta_z = target_point[2] - current_point[2];
      var distance = Math.sqrt(Math.pow(delta_x,2) + Math.pow(delta_y,2) + Math.pow(delta_z,2));
      // console.log("delta x = " + delta_x + ", delta_y = "  + delta_y + " ,delta z = " + delta_z);  
      // Extruder displacement = distance * Sn / Sm
      e += distance * parameters.nozzle_material_surfaces_ratio;     
      //console.log("Distance = " + distance + ", extrusion = " + e);
      e = array_line_3d[layer_index][point_index+1][3] = Math.round(10000 * e) / 10000;
    }
  }
  //array_line_3d[][][]
}
 
// Basic fluidic continuity equation to calculate the amount of material to extrude
// Used nozzle diameter and material nozzle
// Xm = Material or filament; Xn = nozzle
// Sm * Vm = Sn * Vn
// Vn = Feedrate
// Sn = pi * (nozzle_diameter/2)^2
// Sm = pi * (nozzle_material/2)^2  
// Vm = Sm * Vn / Sn