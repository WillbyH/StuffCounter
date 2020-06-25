// StuffCounter.js By Willby an OpenRCT2 Plugin

var downCoord = void 0;
var currentCoord = void 0;

var items = [];

var selected_area = false; // If an area is selected

var counts = {};

var left = 1; // Defining for selection
var right = 1;
var top = 1;
var bottom = 1;

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
      if (entity && entity.type === 'peep') { // Count Peeps
        var peep = entity;
        if (peep.peepType=="guest") {
          name = "Guest"
        } else if (peep.peepType=="staff") {
          if (peep.staffType=="handyman") {
            name = "Handyman";
          } else if (peep.staffType=="mechanic") {
            name = "Mechanic";
          } else if (peep.staffType=="security") {
            name = "Security";
          } else if (peep.staffType=="entertainer") {
            name = "Entertainer (" + peep.costume + ")";
          }
        }
        if (name!=undefined&&name!="undefined") {
          if (counts[name]!=undefined) {
            counts[name]++;
          } else {
            counts[name] = 1;
          }
        }
      } else if (entity && entity.type === 'car') {
        var car = entity;
        if (map.getRide(car.ride)!=null) {
          var name = "Ride Car (" + map.getRide(car.ride).name + ")"
        } else {
          var name = "Ride Car (No Ride)"
        }
        if (name!=undefined&&name!="undefined") {
          if (counts[name]!=undefined) {
            counts[name]++;
          } else {
            counts[name] = 1;
          }
        }
      }
    }
    for (var i = 0; i < map.numRides; i++) { // Count Rides
      var ride = map.getRide(i);
      if (ride!=null) {
        name = "Ride (" + ride.status + ")";
      }
      if (name!=undefined&&name!="undefined") {
        if (counts[name]!=undefined) {
          counts[name]++;
        } else {
          counts[name] = 1;
        }
      }
    }
    counts["Tile (" + map.size.x + " X " + map.size.y + ")"] = map.size.y*map.size.x;
    counts["Duck"] = map.getAllEntities("duck").length;
  }
  var stuff = 0;
  for (var key in counts) {
    stuff = stuff + counts[key];
  }
  if (selected_area) {
    counts["Player Stuff (Total)"] = stuff;
  } else {
    counts["Player Stuff (Total)"] = stuff-counts["Duck"]-counts["Tile (" + map.size.x + " X " + map.size.y + ")"]-counts["Guest"];
  }
  items = [];
  for (var key in counts) {
    items.push([counts[key].toString(), key])
  }
  items.sort(function(first, second) {
    return second[1] - first[1];
  });
  items.sort(function(first, second) {
    return second[0] - first[0];
  });
}

function count_elements_tile(tile) {
  for (var i = 0; i < tile.numElements; i++) {
    var element = tile.getElement(i);
    if (typeof element.type!==undefined) {
      var name;
      if (element.type=="small_scenery"||element.type=="wall"||element.type=="large_scenery") { // Account for all basic sceneary
        try {
          name = context.getObject(element.type, element.object).name;
        }
        catch(err) {
          continue;
        }
      } else if (element.type=="footpath") { // Account for paths
        if (element.isQueue) {
          if (map.getRide(element.ride)!=null) {
            name = "Queue (" + map.getRide(element.ride).name + ")";
          } else {
            name = "Queue (No Ride)";
          }
        } else {
          name = "Path";
        }
      } else if (element.type=="track") { // Account for tracks
        if (element.station) {
          if (map.getRide(element.ride)!=null) {
            name = "Station (" + map.getRide(element.ride).name + ")";
          } else {
            name = "Station (No Ride)";
          }
        } else {
          if (map.getRide(element.ride)!=null) {
            name = "Track (" + map.getRide(element.ride).name + ")";
          } else {
            name = "Track (No Ride)";
          }
        }
      } else if (element.type=="entrance") { // Account for entrances
        name = "Entrance";
      } else if (element.type=="banner") { // Account for banners
        name = "Banner";
      } else if (element.type=="surface") { // Account for surface tiles
        name = "Surface (" + surfaceStyles[element.surfaceStyle.toString()] + ")";
      }
      if (counts[name]!=undefined&&name!=undefined&&name!="undefined") {
        counts[name]++;
      } else {
        counts[name] = 1;
      }
    }
  }
}

function sc_window() {
  count_stuff()
  window = ui.openWindow({
      classification: 'park',
      title: "Stuff Counter",
      width: 240,
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
          width: 236,
          height: 250,
          showColumnHeaders: true,
          scrollbars: "vertical",
          columns: [{header: "count", ratioWidth: 1, canSort: true},{header: "name", ratioWidth: 4.5, canSort: true}],
          items: items
      },{
          type: 'button',
          name: "select-area-button",
          x: 10,
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
          x: 120,
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
  count_stuff()
  ui.registerMenuItem("Stuff Counter", function() {
    sc_window()
  });
}

registerPlugin({
    name: 'Stuff Counter',
    version: '1.0',
    licence: 'MIT',
    authors: ['Willby'],
    type: 'local',
    main: main
});
