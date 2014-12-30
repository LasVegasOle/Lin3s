console.log("Loading logic.js");
// Global variables shared with paperscript
window.globals = {
    array_line_2d: [],
    call_array_2d_to_3d: function() { array_2d_to_3d(); }
};

// Handling events
// Parameters Events handler
document.getElementById('parameters').addEventListener('change', eventChangeHandler);

function eventChangeHandler(e) {
	if (e.target !== e.currentTarget) {
	
		var item = e.target.id;
		//if(item == "layers")
			//updateZCamera(document.getElementById("layers").value);
    array_2d_to_3d();  
	}
    e.stopPropagation();
} 

/*document.getElementById("tha_gcode").addEventListener("click", function(){
    alert(window.array_line_2d);
});

document.getElementById("help_me").addEventListener("click", function(){
    alert("Help me!");
});*/

// TODO: Para dibujar bien, tengo que diferenciar entre tramos de linia.
// o linia continua, porque sino el viewer no sabe
// nueva estructura de datos
// Array de 3dimensiones.
// primera dimension linias de la figura,
// segunda dimension puntos de la linia
// tercera dimension coordenadas de los puntos
// array_line_3d[layer][node][coordinates]

var array_line_3d = [];

// From 2d array to 3d array for 3d Viewer and Gcode generation

function array_2d_to_3d() {
  // Depending on the amount of layers
  // Read layer height and number of layers
  // Fill 3d array with a #n 2d layers
    // Scale each layer depending on scale value
      // Rotate layer points depending on rotation
      
  // Reset 3d line array
  array_line_3d = [];
  var num_of_layers = document.getElementById("num_layers").value;
  var x, y;
  // Loop for the total amount of layers
  for (var i = 0; i < num_of_layers; i++) {
    array_line_3d[i] = [];  // Adding layer info
    // Loop over the line #number of nodes
    for (var j=0; j < globals.array_line_2d.length; j++) {
      //array_line_3d[i][j] = []; // Adding node info
      //console.log("# of node line" + window.array_line_2d.length);
      x = globals.array_line_2d[j][0];
      y = globals.array_line_2d[j][1];
      //array_line_3d.push([x, y, i]);
      array_line_3d[i].push([x, y, i]); // Adding coordinates info
    }
  }
  console.log(array_line_3d);
  draw_shape_into_3dviewer();
}

function rotate_point (x, y, layerRotation) {
//http://www.mathematics-online.org/inhalt/aussage/aussage444/
// x' = cos(rot) * x + sin(rot) * y
// y' = -sin(rot) * x + cos(rot) * y
	var rot = Number(layerRotation) * (Math.PI / 180);
	var x_rot = Math.cos(rot) * x + Math.sin(rot) * y;
	var y_rot = -Math.sin(rot) * x + Math.cos(rot) * y;
	
	return[x_rot, y_rot];
}

// @brief Calculates the layer scale value 1 (100%) for each layer
function scale_layer (h) {
	var totalScale = document.getElementById("scale").value;
	if (totalScale > 100) {
		var layerScale = (totalScale - 100) / (document.getElementById("layers").value);
		return ( 1 + (layerScale/100) * h );
	}
	else if (totalScale < 100) {
		var layerScale = (100 - totalScale) / (document.getElementById("layers").value);
		return ( 1 - (layerScale/100) * h );
	}
	else
		return 1;
}