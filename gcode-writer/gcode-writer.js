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
  if (typeof array_line_3d[0] == "undefined") {
    alert("Draw some lines before exporting your GCode :)");
    return;
  }
  // Add commented text with parameters to the file
  var output = write_parameters();
  //console.log(output);
  // Add GCode instruction
	output += write_gcode_instructions();
  // console.log(output);
  // Create and save GCode file using FileSaver.js library
	var gcode_file = new Blob([output], {type: 'text/plain'});
	saveAs(gcode_file, document.getElementById("name").value + '.gcode');
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
  console.log("write gcode instructions Init");
 
  // Home printer
	var gcode_instructions = "G28 \n";
  // Move head to first print position
  gcode_instructions += "G1 X" + array_line_3d[0][0][0]
                        + " Y" + array_line_3d[0][0][1]
                        + " Z" + array_line_3d[0][0][2] 
                        + " F" + document.getElementById("feedrate").value + "\n";
  // Turn on air compressed extruder
  gcode_instructions += "M126 \n";
  // Add turn on delay
  gcode_instructions += "G4 P" + document.getElementById("delay").value + "\n";
  // Loop for the total amount of layers
  for (var i = 0; i < array_line_3d.length; i++) {
 // Loop over the line #number of nodes
    //gcode_instructions +=  "G1 Z" + array_line_3d[i][j][2] + "\n";
    for (var j = 0; j < array_line_3d[i].length; j++) {
      gcode_instructions +=  "G1 X" + array_line_3d[i][j][0] 
                             + " Y" + array_line_3d[i][j][1]
                             + " Z" + array_line_3d[i][j][2] + 
                             "\n";
    }
  }
  // Close air extrusion
  gcode_instructions += "M127 \n";
  //homing
  gcode_instructions += "G28 \n";
  
  return gcode_instructions;
}

