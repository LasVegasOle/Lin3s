console.log("Loading line-editor.js");

var hitOptions = {
	segments: true,
	stroke: true,
	fill: true,
	tolerance: 5
};

// This path is the one that represents the GCode toolpath
var path = new Path({
	strokeColor: '#0000FF',
	strokeWidth: 5,
	strokeCap: 'round',
	strokeJoin: 'round'
});

var segment;

function onMouseDown(event) {
	segment = null;
	// Check if there is a collision between the mouse down position and our path
	var hitResult = project.hitTest(event.point, hitOptions);
	// If there is no collision then a new path-segment is created
	if (!hitResult){
		if(path.closed==false){
			path.add(event.point);
			path.fullySelected = true;
			path.strokeColor = '#e08285';
			return;
		}
	}
	// Path has been hit
	path.fullySelected = true;
	path.strokeColor = '#e08285';
	// If shift is hold at the same time a segment is hit, this segment is removed
	if (event.modifiers.shift) {
		if (hitResult.type == 'segment') {
			hitResult.segment.remove();
		};
		return;
	}
	
	// Close path whenever clicking on the first segment
	if( hitResult.point == path.firstSegment.point && path.closed == false ){
		path.closed = true;
		return;
	}
	
	if (hitResult) {
		// Segment hit
		if (hitResult.type == 'segment') {
			segment = hitResult.segment;
		// Stroke hit insert segment
		} else if (hitResult.type == 'stroke') {
			var location = hitResult.location;
			segment = path.insert(location.index + 1, event.point);
		}
	}
	
}

function onMouseUp(event) {
	path.fullySelected = false;
	path.strokeColor = '#0099FF';
  build_line_array();
  //window.array_2d_to_3d();
  globals.call_array_2d_to_3d();
}

function onMouseDrag(event) {
	if (segment)
		segment.point += event.delta; 
}

// @brief builds up de line array
function build_line_array(){
	var trajectory = path.segments;
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
  //alert(array);
}
