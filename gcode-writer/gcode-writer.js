// GCode-writer is in charge of transforming the 3d shape array into GCode

// Catch GCODE event button to create file
document.getElementById('tha_gcode').addEventListener('click', write_gcode);
//document.getElementById('help_me').addEventListener('click', help_me);

function help_me() {
  alert("help me");
  document.getElementById("help_me").style.display = 'block';
}

function write_gcode() {
  console.log("write_gcode Init");
  array_2d_to_3d();
  if (typeof array_line_3d[0] == "undefined") {
    alert("Draw some lines before exporting your GCode :)");
    return;
  }
  // Add commented text with parameters to the file
  var output = write_parameters();
  // Add GCode instruction
	output += write_gcode_instructions();
  // console.log(output);
  // Create and save GCode file using FileSaver.js library
  if(!globals.debug) {
    var gcode_file = new Blob([output], {type: 'text/plain'});
    saveAs(gcode_file, document.getElementById("name").value + '.gcode');
  }
}

// Creates and returns header info text holding the value of the different 
// parameters used for configuration 
function write_parameters() {
var params = [];
	params += "; GCode generated with Lin3s from www.3digitalcooks.com \n";
	//params += "; Rose OD [mm]: " + document.getElementById("diameter").value + "\n";
return params;
}

function write_gcode_instructions() {
  //console.log("write gcode instructions Init");
  // Home printer
	var gcode_instructions = "G28 \n";

  // Move head to a safe height over base dirty
  safe_z_height = array_line_3d[0][0][2] + 2;
  gcode_instructions += "G1 Z" + safe_z_height
                        + " F" + parameters.feedrate + "\n";  

  // Move head to first print position
  gcode_instructions += "G1 X" + array_line_3d[0][0][0]
                        + " Y" + array_line_3d[0][0][1] + "\n";

  // Lower head position
  gcode_instructions += "G1 Z" + array_line_3d[0][0][2] + "\n";

  // Reset Extruder position
  gcode_instructions += "G92 E0 \n";

  // Turn on air compressed extruder
  gcode_instructions += "M126 \n";

  // Add turn on delay
  gcode_instructions += "G4 P" + parameters.delay + "\n";

  // Loop for the total amount of layers
  for (var i = 0; i < array_line_3d.length; i++) {
  // Loop over the line #number of nodes
    //gcode_instructions +=  "G1 Z" + array_line_3d[i][j][2] + "\n";
    for (var j = 0; j < array_line_3d[i].length; j++) {
      gcode_instructions +=  "G1 X" + array_line_3d[i][j][0]
                             + " Y" + array_line_3d[i][j][1]
                             + " Z" + array_line_3d[i][j][2]
                             + " E" + array_line_3d[i][j][3]
                             + "\n";
    }
  }

  // Close air extrusion
  gcode_instructions += "M127 \n";

  //homing
  // gcode_instructions += "G28 \n";
  // Short retraction
  last_layer = array_line_3d.length - 1;
  last_layer_point = array_line_3d[last_layer].length - 1;
  // console.log("last_layer = " + last_layer + " ,last_layer_point = " + last_layer_point);
  // console.log(array_line_3d[last_layer][last_layer_point][3]);
  var end_retraction = array_line_3d[last_layer][last_layer_point][3] - 2;
  gcode_instructions +=  "G1 E" + end_retraction + "\n";

  // Moving head printer away from print
  var end_lift = array_line_3d[last_layer][last_layer_point][2] + 10;
  gcode_instructions +=  "G1 Z" + end_lift + "\n";

  return gcode_instructions;
}

