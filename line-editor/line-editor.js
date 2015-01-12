console.log("Loading line-editor.js");
// Todo: To add bezier control to the points study bezierTool PaperJs example

var hitOptions = {
	segments: true,
	stroke: true,
	fill: true,
	tolerance: 5
};

// This path is the one that represents the GCode toolpath
var path = new Path(  {
	strokeColor: '#0000FF',
	strokeWidth: 3,
	strokeCap: 'round',
	strokeJoin: 'round'
});

var path_to_3d;

var types = ['point', 'handleIn', 'handleOut'];
var mode; // move, close or add
var type; // type of segment point handleIn handleOut
var currentSegment;

function findHandle(point) {
// Recorrer todos los segmentos
  for (var i = 0, l = path.segments.length; i < l; i++) {
  // Por cada segmento recorrer los 3 tipos
    for (var j = 0; j < 3; j++) {
      var type = types[j]; // Point handle in, handle out
      var segment = path.segments[i]; // guardar el segmento en que estamos
      var segmentPoint = type == 'point'
          ? segment.point
          : segment.point + segment[type];
      // console.log(segmentPoint);
      var distance = (point - segmentPoint).length;
      // console.log(distance);
      if (distance < 5) {
        return {
          type: type,
          segment: segment
        };
      }
    }
  }
  return null;
}

function onMouseDown(event) {
	var hitResult = project.hitTest(event.point, hitOptions);
  // Handlers!!
  // Permite saber si ya habia un segmento seleccionado y lo deselecciona
  if (currentSegment)
      currentSegment.selected = false;
  mode = type = currentSegment = null;

  var result = findHandle(event.point);
  // Tenemos result si se ha clicado un punto o handler
  if (result) {
    currentSegment = result.segment; // Segmento clicado
    type = result.type; // tipo de click 
  }
  
	// If shift is hold at the same time a segment is hit, this segment is removed
	if (event.modifiers.shift) {
		if (hitResult.type == 'segment') {
			hitResult.segment.remove();
		};
		return;
	}	
  
  // Insert segment in the path
	if (hitResult) {
		// Segment hit
		if (hitResult.type == 'segment') {
			currentSegment = hitResult.segment;
		// Stroke hit insert segment
		} else if (hitResult.type == 'stroke') {
			var location = hitResult.location;
			currentSegment = path.insert(location.index + 1, event.point);
		}
	}
  
  // Si existe el segmento lo movemos, sino creamos uno
  mode = currentSegment ? 'move' : 'add';
  if (!currentSegment && path.closed == false)
    currentSegment = path.add(event.point); // add new point to the path
  currentSegment.selected = true;
}

function onMouseDrag(event) {
  // Si hay que mover y es punto
  if (!event.modifiers.control && 
      (mode == 'move' && type == 'point')) {
      currentSegment.point = event.point;
    } else {
      var delta = event.delta.clone();
      if (mode == 'add' || type == 'point') {
        delta = -delta;
        currentSegment.handleIn += delta;
        currentSegment.handleOut -= delta;
      } else if (type == 'handleOut') {
        currentSegment.handleOut += delta;
      } else if (type == 'handleIn') {
        currentSegment.handleIn += delta;
      }
    }
}

function onKeyDown(event) {
	// Close path whenever shift + c combination happens
	if (event.modifiers.shift && event.key=='c' && path.closed == false){
    path.closed = true;
    globals.open_line = false;
    update_3d_array();
	}
  // Close path whenever shift + o combination happens
	if (event.modifiers.shift && event.key=='o' && path.closed == true){
    path.closed = false;
    globals.open_line = true;
    update_3d_array();
	}
}

function onMouseUp(event) {
  update_3d_array();
}

// @brief This updates the path used on logic.js to convert the 2d shape into 3d 
function update_3d_array() {
    // Copy the path into a the path that would be chopped into segments
    path_to_3d = path.clone();
    // Chop the path into segments of 1px
    path_to_3d.flatten(5);
    // Hide the segmented path so doesnt overlap with the nice bezier original path
    path_to_3d.visible = false;
    // Delete unnecessary points from the path
    delete_flat_points();
    build_line_array();
    globals.draw_line();
}

// @brief builds up de line array
function build_line_array(){
	var trajectory = path_to_3d.segments;
  globals.array_line_2d = [];
	// Vars for interations (for loops)
	var i=0, x=0, y=0;
	// Calculate x,y max and min values
	var xMax = 0, yMax = 0, xMin = 1000, yMin = 1000, max = 0; 
	for (i = 0; i < trajectory.length; i++){
		x = trajectory[i].point.x;
		y = trajectory[i].point.y;
    // console.log("x = " + x + ", y = " + y);
		if (xMin > x) {
			xMin = x;
    }	
    if (xMax < x) {
			xMax = x;
    }
		if (yMin > y) {
			yMin = y;
    }
    if (yMax < y) {
			yMax = y;
    }
	}
  // console.log("last x = " + x + ", xMax = " + xMax + ", xMin = " + xMin);
  // console.log("last y = " + y + ", yMax = " + yMax + ", yMin = " + yMin);
  
	// Getting offset for centring the array starting from 0,0 for min values
	var xOffset = xMin + (xMax - xMin)/2;  // Values in px
	var yOffset = yMin + (yMax - yMin)/2;
  // console.log("xOffset = " + xOffset + ", yOffset = " + yOffset);
  var xMaxCentered = xMax - xMin;  // Shifting max values
  var yMaxCentered = yMax - yMin;
    // Max value
  max = (xMaxCentered > yMaxCentered) ? xMaxCentered : yMaxCentered;
  // console.log("max = " + max);
  
	for (i = 0; i != trajectory.length; i ++) {
		// Centring the gcode to origin (0,0) AND rounding to 4 digits
    // Convert pixels to values scale from 0(min) to a 100(max))
    x = (Math.round(10000 * (100*(trajectory[i].point.x - xOffset) / max)) / 10000);
    y = (Math.round(10000 * (100*(trajectory[i].point.y - yOffset) / max)) / 10000);
    // console.log("Scale x = " + x + "; Scale y = " + y);
    y = - y;  // Inverting y axis due to coordinates orientation for paperjs and three js are different
		globals.array_line_2d.push([x, y]);
	}
	// If the path is closed, close the drawing adding the closing edge
	if (path.closed) {
		// Converting from pixels to mm, centring the gcode to origin (0,0) AND rounding to 4 digits
    x = (Math.round(10000 * ( 100*(path.firstSegment.point.x - xOffset) / max)) / 10000);
    y = (Math.round(10000 * ( 100*(path.firstSegment.point.y - yOffset) / max)) / 10000);
    y = - y;  // Inverting y axis due to coordinates orientation for paperjs and three js are different
		globals.array_line_2d.push([x, y]);
	}
}

// This delete unnecessary points created due to we chop the path into segments of 1px.
// To do this we calculate the angle between previous and next point, and if its smaller than 
// a threshold we delete it.
function delete_flat_points() {
	// Loop all the path to three 3d length skipping first point and last point
  path_to_3d_segments = path_to_3d.segments;
  //console.log("path_to_3d_segments = " + path_to_3d_segments + ", path_to_3d_segments.length = " + path_to_3d_segments.length);
  //console.log("Path_to_3d_segments.length = " + path_to_3d_segments.length);
  for (i = 1; i < (path_to_3d_segments.length - 1); i ++) {
    //console.log("i = " + i);
    var previous = path_to_3d_segments[i-1];
    var current = path_to_3d_segments[i];
    var next = path_to_3d_segments[i+1];
    // console.log("prev_point = " + previous.point + ", current_point = " + current.point + ", next_point = " + next.point);
    var previous_to_current_delta_x = Math.abs(current.point.x - previous.point.x);
    var previous_to_current_delta_y = Math.abs(current.point.y - previous.point.y);
    var current_to_next_delta_x = Math.abs(next.point.x - current.point.x);
    var current_to_next_delta_y = Math.abs(next.point.y - current.point.y);
    var previous_to_current_angle = Math.atan(previous_to_current_delta_y/previous_to_current_delta_x)*180/Math.PI;
    var current_to_next_angle = Math.atan(current_to_next_delta_y/current_to_next_delta_x)*180/Math.PI;
    // Rounding decimals to 3 digits
    previous_to_current_angle = Math.round(1000*previous_to_current_angle)/1000;
    current_to_next_angle = Math.round(1000*current_to_next_angle)/1000;
    // console.log("prev angle = " + previous_to_current_angle 
    //           + ", next angle = " + current_to_next_angle);
    // if both angles are equal means the three points are aligned into a straight line, so delete middle point (current)
    if (previous_to_current_angle == current_to_next_angle) {
      path_to_3d_segments[i].remove();
      i--; // decrease counter if a segment has been removed due to array segment shifting
    }
  }
  //console.log("path_to_3d_segments = " + path_to_3d_segments + ", path_to_3d_segments.length = " + path_to_3d_segments.length);
  //console.log("Path_to_3d_segments.length = " + path_to_3d_segments.length);
}