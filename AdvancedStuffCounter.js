// AdvancedStuffCounter.js By Willby an OpenRCT2 Plugin

var downCoord = void 0;
var currentCoord = void 0;

var items = [];

var selected_area = false; // If an area is selected

var counts = {};

var left = 1; // Defining for selection
var right = 1;
var top = 1;
var bottom = 1;

var activeSurfaces = [];

var surfaceStyles = {
  "0": "Grass",
  "1": "Sand",
  "2": "Dirt",
  "3": "Rock",
  "4": "Red Rock",
  "5": "Checkered",
  "6": "Grassy Dirt",
  "7": "Snow",
  "8": "Red Grid",
  "9": "Yellow Grid",
  "10": "Purple Grid",
  "11": "Green Grid",
  "12": "Red Sand",
  "13": "Gravel",
  "14": "14", // Extra just in case something happens, idk
  "15": "15",
  "16": "16",
  "17": "17",
  "18": "18",
  "19": "19",
  "20": "20",
}

function ArrayIncludes(array, key) {
  for (var k in array) {
    if (array[k] == key) {
      return true
    }
  }
  return false
}

function selectTheMap() { // Display Selection
    var left = Math.min(downCoord.x, currentCoord.x);
    var right = Math.max(downCoord.x, currentCoord.x);
    var top = Math.min(downCoord.y, currentCoord.y);
    var bottom = Math.max(downCoord.y, currentCoord.y);
    ui.tileSelection.range = {
        leftTop: { x: left, y: top },
        rightBottom: { x: right, y: bottom }
    };
}

function finishSelection() { // Modify tiles in the selected area once the mouseUp has activated
  left = Math.floor(Math.min(downCoord.x, currentCoord.x) / 32);
  right = Math.floor(Math.max(downCoord.x, currentCoord.x) / 32);
  top = Math.floor(Math.min(downCoord.y, currentCoord.y) / 32);
  bottom = Math.floor(Math.max(downCoord.y, currentCoord.y) / 32);
  selected_area = true;
  window.close();
  sc_window();
}

function count_stuff() {
  activeSurfaces = [];
  counts = {};
  if (selected_area) {
    for (var x = left; x <= right; x++) {
      for (var y = top; y <= bottom; y++) {
        var tile = map.getTile(x, y);
        count_elements_tile(tile)
      }
    }
  } else {
    for (var y = 0; y < map.size.y; y++) {
      for (var x = 0; x < map.size.x; x++) {
        var tile = map.getTile(x, y);
        count_elements_tile(tile)
      }
    }
  }
  if (!(selected_area)) {
    for (var i = 0; i < map.numEntities; i++) {
      var entity = map.getEntity(i);
      var name, identifier;
      if (entity && entity.type === 'peep') { // Count Peeps
        var peep = entity;
        if (peep.peepType=="guest") {
          name = "Guest"
          identifier = "GUEST";
        } else if (peep.peepType=="staff") {
          identifier = "STAFF" + peep.staffType.toString();
          if (peep.staffType=="handyman") {
            name = "Handyman";
          } else if (peep.staffType=="mechanic") {
            name = "Mechanic";
          } else if (peep.staffType=="security") {
            name = "Security";
          } else if (peep.staffType=="entertainer") {
            name = "Entertainer (" + peep.costume + ")";
            identifier = "STAFF" + peep.staffType.toString() + peep.costume.toString();
          }
        }
        if (identifier!=undefined&&identifier!="undefined") {
          if (counts[identifier]!=undefined) {
            counts[identifier][1]++;
          } else {
            counts[identifier] = [name, 1];
          }
        }
      } else if (entity && entity.type === 'car') {
        var car = entity;
        if (map.getRide(car.ride)!=null) {
          name = "Ride Car (" + map.getRide(car.ride).name + ")"
          identifier = "CAR" + car.ride.toString();
        } else {
          name = "Ride Car (No Ride)"
          identifier = "CARNORIDE";
        }
        if (identifier!=undefined&&identifier!="undefined") {
          if (counts[identifier]!=undefined) {
            counts[identifier][1]++;
          } else {
            counts[identifier] = [name, 1];
          }
        }
      }
    }
    for (var i = 0; i < map.numRides; i++) { // Count Rides
      var ride = map.getRide(i);
      if (ride!=null) {
        name = "Ride (" + ride.status + ")";
        identifier = "RIDE" + ride.status.toString();
      }
      if (identifier!=undefined&&identifier!="undefined") {
        if (counts[identifier]!=undefined) {
          counts[identifier][1]++;
        } else {
          counts[identifier] = [name, 1];
        }
      }
    }
    counts["TILE"] = [map.size.x + " X " + map.size.y, map.size.y*map.size.x];
    counts["DUCK"] = ["Duck", map.getAllEntities("duck").length];
  }
  var stuff = 0;
  for (var key in counts) {
    stuff = stuff + counts[key][1];
  }
  for (var surface in activeSurfaces) {
    stuff = stuff - counts[activeSurfaces[surface]][1];
  }
  if (selected_area) {
    counts["PSTUFF"] = ["Player Stuff (Total)", stuff];
  } else {
    counts["PSTUFF"] = ["Player Stuff (Total)", stuff-counts["DUCK"][1]-counts["TILE"][1]-counts["GUEST"][1]];
  }
  items = [];
  for (var identifier in counts) {
    items.push([counts[identifier][1].toString(), counts[identifier][0].toString(), identifier])
  }
  items.sort(function(first, second) {
    return second[0] - first[0];
  });
}

function count_elements_tile(tile) {
  for (var i = 0; i < tile.numElements; i++) {
    var element = tile.getElement(i);
    if (typeof element.type!==undefined) {
      var name, identifier;
      if (element.type=="small_scenery"||element.type=="wall"||element.type=="large_scenery") { // Account for all basic sceneary
        try {
          name = context.getObject(element.type, element.object).name;
          identifier = context.getObject(element.type, element.object).identifier;
        }
        catch(err) {
          continue;
        }
      } else if (element.type=="footpath") { // Account for paths
        if (element.isQueue) {
          if (map.getRide(element.ride)!=null) {
            name = "Queue (" + map.getRide(element.ride).name + ")";
            identifier = "QUEUE" + element.ride;
          } else {
            name = "Queue (No Ride)";
            identifier = "QUEUENORIDE";
          }
        } else {
          name = "Path";
          identifier = "PATH";
        }
      } else if (element.type=="track") { // Account for tracks
        if (element.station) {
          if (map.getRide(element.ride)!=null) {
            name = "Station (" + map.getRide(element.ride).name + ")";
            identifier = "STATION" + element.ride;
          } else {
            name = "Station (No Ride)";
            identifier = "STATIONNORIDE";
          }
        } else {
          if (map.getRide(element.ride)!=null) {
            name = "Track (" + map.getRide(element.ride).name + ")";
          } else {
            name = "Track (No Ride)";
          }
          identifier = "TRACK" + element.trackType;
        }
      } else if (element.type=="entrance") { // Account for entrances
        name = "Entrance";
        identifier = "ENTERANCE";
      } else if (element.type=="banner") { // Account for banners
        name = "Banner";
        identifier = "BANNER";
      } else if (element.type=="surface") { // Account for surface tiles
        name = "Surface (" + surfaceStyles[element.surfaceStyle.toString()] + ")";
        identifier = "SUR" + element.surfaceStyle;
      }
      if (identifier!=undefined&&identifier!="undefined") {
        if (counts[identifier]!=undefined) {
          counts[identifier][1]++;
        } else {
          counts[identifier] = [name, 1];
          if (ArrayIncludes(["SUR0","SUR1","SUR2","SUR3","SUR4","SUR5","SUR6","SUR7","SUR8","SUR9","SUR10","SUR11","SUR12","SUR13","SUR14","SUR15","SUR16","SUR17","SUR18","SUR19","SUR20"], identifier)) { // Filter out everything but surfaces
            if (!(ArrayIncludes(activeSurfaces, identifier))) { // Make sure the surface is not already in the list
              activeSurfaces.push(identifier);
            }
          }
        }
      }
    }
  }
}

function sc_window() {
  count_stuff()
  window = ui.openWindow({
      classification: 'park',
      title: "Advanced Stuff Counter",
      width: 320,
      height: 320,
      x: 20,
      y: 50,
      colours: [12,12],
      widgets: [{
          type: 'label',
          name: 'label-description',
          x: 3,
          y: 20,
          width: 300,
          height: 60,
          text: "List of everything in your park."
      },{
          type: 'listview',
          name: 'stuff-list',
          x: 3,
          y: 40,
          width: 316,
          height: 250,
          showColumnHeaders: true,
          scrollbars: "vertical",
          columns: [{header: "count", ratioWidth: 1, canSort: true},{header: "name", ratioWidth: 4.5, canSort: true},{header: "identifier", ratioWidth: 2, canSort: true}],
          items: items
      },{
          type: 'button',
          name: "select-area-button",
          x: 45,
          y: 297,
          width: 110,
          height: 15,
          text: "Select Area",
          onClick: function onClick() {
            start_select_tool()
          }
      },{
          type: 'button',
          name: "deselect-area-button",
          x: 155,
          y: 297,
          width: 110,
          height: 15,
          text: "Deselect Area",
          onClick: function onClick() {
            selected_area = false;
            window.close();
            sc_window();
          }
      }],
      onClose: function onClose() { // Stop selection tool when the window closes
        window = null;
        if (ui.tool && ui.tool.id == "stuff-counter-tool") {
          ui.tool.cancel();
        }
      }
  });
}

function start_select_tool() {
  ui.activateTool({ // Create tool for selecting area
      id: "stuff-counter-tool",
      cursor: "cross_hair",
      onStart: function onStart(e) {
          ui.mainViewport.visibilityFlags |= 1 << 7;
      },
      onDown: function onDown(e) {
          if (e.mapCoords.x === 0 && e.mapCoords.y === 0) {
              return;
          }
          downCoord = e.mapCoords;
          currentCoord = e.mapCoords;
      },
      onMove: function onMove(e) {
          if (e.mapCoords.x === 0 && e.mapCoords.y === 0) {
              return;
          }
          if (e.isDown) {
              currentCoord = e.mapCoords;
              selectTheMap();
          } else {
              downCoord = e.mapCoords;
              currentCoord = e.mapCoords;
              selectTheMap();
          }
      },
      onUp: function onUp(e) {
          finishSelection();
          ui.tileSelection.range = null;
      },
      onFinish: function onFinish() {
          ui.tileSelection.range = null;
          ui.mainViewport.visibilityFlags &= ~(1 << 7);
          if (window != null) window.close();
      }
  });
}

function main() {
  ui.registerMenuItem("Advanced Stuff Counter", function() {
    sc_window()
  });
}

registerPlugin({
    name: 'Advanced Stuff Counter',
    version: '1.1',
    licence: 'MIT',
    authors: ['Willby'],
    type: 'local',
    main: main
});

// Update 1.1 - Removed Surfaces from the Player Stuff (total)
