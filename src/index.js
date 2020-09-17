/*
Dijkstra's Shortest Path Algorithm
1) Choose a source point.
2) Add all edges leading out from the source point and add them to the MinPQ.
    *The minimum edge will always be accesible in log(n) time by floating to the top of the minPQ (critical to efficiency)
3) Update the distTo[] array 
4) 
*/

// EDGE WEIGHTED CYCLIC DIGRAPH
// Every entry in this array is a pointer to an array of edges
// An edge is this object: {from: pointID, to: pointID, weight: distanceBetweenFromAndTo}
let EdgeWeightedCyclicDigraph;
let numPointsInGraph = 0; // the number of points in the graph

// MINIMUM PRIORITY QUEUE
// The minPQ is a critical feature of Dijkstra's Shortest Path algorithm.
// The minPQ allows us to have access to the minimum edge (shortest edge) in ~log(n) time versus n time.
// The minPQ is a binary heap stored in an array where children are entries 2k and 2k+1.
// Every node in the minPQ is smaller than its child nodes and this is ensured by the sink() and swim() functions.
// The minPQ starts at entry 1 (not 0) to ensure children the mathematics.
// The minimum always floats to the top of the binary heap in log(n) time using the swim/sink functions.
// The pointIndexInPQ stores every points index in the minPQ so that it can be updated when it changes in constant time.
let minPQ; // the minHeap itself, an array which contains { point: pointID, weight: edgeDistance }
let pqInsertIndex = 0; // insertion index into the minHeapPQ
let pointIndexInPQ; // stores every points position in the minPQ so a points edge weight can be updated in constant time

// DISTANCE TO & EDGE TO ARRAYS
// The distTo[n] array stores the distance to from the source point to point n.
// The edgeTo[] array is
// The edgeTo[n] array stores the shortest path edges ({ point: pointID, weight: edgeDistance }) relative to a source point.
// To find the shortest path from a source point to point n, follow the edges starting at edgeTo[n].
let distTo;
let edgeTo;

// Initializes all of the data structures based on a number of points.
function initDigraph(numPoints) {
  console.log("initDigraph();");
  numPointsInGraph = numPoints;
  pointIndexInPQ = new Array(numPoints);
  minPQ = new Array(numPoints + 1); // heap positions start at index 1
  distTo = new Array(numPoints);
  edgeTo = new Array(numPoints);
  EdgeWeightedCyclicDigraph = new Array(numPoints);

  // populate digraph with subarrays (to push edges)
  for (let n = 0; n < numPoints; n++) {
    EdgeWeightedCyclicDigraph[n] = []; // every entry into the array points to a subarray
    pointIndexInPQ[n] = null; // no points exist in the minPQ at the beginning
    distTo[n] = Infinity; // all distances start at infinity
    edgeTo[n] = null; // no edges exist at the beginning
    minPQ[n] = { point: -1, weight: Infinity }; // no edges exist in minPQ at the beginning
  }
}

// Returns true if the minPQ is empty and false if it contains at least one { point: pointID, weight: edgeDistance }
function pqIsEmpty() {
  //console.log("pqIsEmpty()");
  if (pqInsertIndex === 0) return true;
  return false;
}

// Returns true if the minPQ contains a point identified by its pointID
function pqContains(pointID) {
  //console.log("pqContains()");
  pqValidateIndex(pointID);
  if (pointIndexInPQ[pointID] != null) {
    //console.log("pqContains() -> point " + point + " is IN the minPQ!");
    return true;
  }
  return false;
}

// Throws an error if a pointID is invalid (negative or greater than the number of points that exist)
// This check might be unneccesary but safety first.
function pqValidateIndex(pointID) {
  //console.log("pqValidate()");
  if (pointID < 0)
    throw new IllegalArgumentException("index is negative: " + i);
  if (pointID >= numPointsInGraph)
    throw new IllegalArgumentException("index >= capacity: " + i);
}

// This function exchange two points (k and j) in the minPQ.
// It swaps minPQ[k] with minPQ[j] , recalling that minPQ[k] = { point: k, weight: distanceOfAnEdgeLeadingToPointK }.
// This function is called whenever a point sinks or swims (when the pqSink() or pqSwim() functions are successful)
function pqExch(k, j) {
  //console.log("pqExch()");
  let kPoint = minPQ[k].point;
  let jPoint = minPQ[j].point;

  if (!pqContains(kPoint) || !pqContains(jPoint)) {
    console.log(minPQ);
    console.log(pointIndexInPQ);
    console.log(distTo);
    console.log(
      "ERROR: One or both of the following aren't contained in the MinHeapPQ"
    );
    console.log("kPoint = " + kPoint);
    console.log("kPoint = " + jPoint);
    throw new IllegalArgumentException("one or both swap points don't exist !");
  }

  // Get each points index in the minPQ (constant time)
  pointIndexInPQ[kPoint] = j;
  pointIndexInPQ[jPoint] = k;

  //console.log("setting pointIndexInPQ[ " + kPoint + " ] to " + j);
  //console.log("setting pointIndexInPQ[ " + jPoint + " ] to " + k);

  // Swap both points
  let swap = { point: minPQ[j].point, weight: minPQ[j].weight };
  minPQ[j] = { point: minPQ[k].point, weight: minPQ[k].weight };
  minPQ[k] = swap;
}

// This function sinks (downward) whatever { pointID: point, weight: edgeDistance } is located at index k in the minPQ
// Node k will swap with the smaller of both of its child nodes (2k and 2k+1), ensuring parent nodes are smaller than their child nodes
// Node k will sink until both of its children are larger than it
function pqSink(k) {
  //console.log("pqSink()");
  // Sink node k until both children are larger than it
  while (2 * k <= numPointsInGraph && 2 * k <= pqInsertIndex) {
    // Select k's first child
    let firstChild = 2 * k;

    // If other child is valid, compare both children to determine the smaller of them
    if (firstChild + 1 <= numPointsInGraph && firstChild + 1 <= pqInsertIndex) {
      // Choose the smaller of the two children
      if (pqLess(firstChild + 1, firstChild)) {
        firstChild++; // Change smaller child from 2k to 2k + 1
      }
    }

    // Ensure the smaller child is actually smaller than k
    if (!pqLess(firstChild, k)) {
      break;
    }

    // Exchange node k with its smaller child
    pqExch(k, firstChild);

    // Set k to its new index in the minPQ and check to see if it should sink again (while loop conditional)
    k = firstChild;
  }
}

// This function swims (upward) whatever { pointID: point, weight: edgeDistance } is located at index k in the minPQ
// Node k will swap with it's parent IFF it's parent is larger than node k until it reaches a parent that is smaller
function pqSwim(k) {
  //console.log("pqSwim()");
  // Get the parent index
  let parent = 0;
  if (k === 3) {
    parent = 1;
  } else if (k % 2 === 0) {
    parent = k / 2;
  } else {
    parent = Math.floor(k / 2);
  }

  // Swim node K until its parent is smaller
  while (k > 1 && pqLess(k, parent)) {
    // Get the parent index
    if (k === 3) {
      parent = 1;
    } else if (k % 2 === 0) {
      parent = k / 2;
    } else {
      parent = Math.floor(k / 2);
    }

    // Exchange node k with its parent
    pqExch(k, parent);

    // Set k to its new index in the minPQ and check to see if it should swim again (while loop conditional)
    k = parent;
  }
}

// This function decreases the weight of a points edge in the minPQ.
// The point is identified by its pointID.
function pqDecreaseWeightOfPoint(pointID, weight) {
  //console.log("pqDecreaseWeightOfPoint()");
  // Validate the pointID (only admit points that are non-negative and less than number of points)
  pqValidateIndex(pointID);

  // Ensure the minPQ containts the point
  if (!pqContains(pointID)) {
    throw new NoSuchElementException("index is not in the priority queue");
  }

  // Ensure the existing weight is actually less than the new weight
  if (minPQ[pointIndexInPQ[pointID]].weight < weight) {
    throw new IllegalArgumentException(
      "Calling pqDecreaseWeightOfPoint() with a key strictly greater than the key in the priority queue"
    );
  }

  // Decrease the weight of the point's edge in the minPQ
  minPQ[pointIndexInPQ[pointID]].weight = weight;

  // Swim the point because it's weight just decreased
  pqSwim(pointIndexInPQ[pointID]);
}

// This function checks to see if the weight of entry k in the minPQ is less than the weight of entry j in the minPQ.
function pqLess(k, j) {
  //console.log("pqLess()");

  // Ensure both weights exist
  if (minPQ[k].weight === undefined || minPQ[j].weight === undefined) {
    return false;
  }

  // Return true if the weight of entry k is less than the weight of entry j
  if (minPQ[k].weight < minPQ[j].weight) {
    return true;
  }

  // Return false in every other case
  return false;
}

// This function does two things:
// 1) It removes the minimum-weight point-edge from the minPQ (minPQ[1]) and ensures the minPQ adjusts to be valid
// 2) It returns the pointID associated with the minimum-weight point-edge object { point: pointID, weight: edgeDistance }
function pqDeleteMin() {
  //console.log("pqDeleteMin()");
  // Ensure the minPQ actually contains a minimum value
  if (pqInsertIndex === 0) {
    throw new NoSuchElementException("Priority queue underflow");
  }

  // Get the minimum value and remove it from the index tracking array
  let pointID = minPQ[1].point;
  pointIndexInPQ[pointID] = null;

  // Set the minPQ's first index to whatever the last inserted entry
  // (The minPQ decreased in size by one which is why we are targeting the last entry)
  minPQ[1] = {
    point: minPQ[pqInsertIndex].point,
    weight: minPQ[pqInsertIndex].weight,
  };

  // Set the new last entry's index in the index-tracking array to 1
  // (The last entry is now occupying the first index of the minPQ -- this must be tracked!)
  pointIndexInPQ[minPQ[pqInsertIndex].point] = 1;

  // Decrement the insertion index (the minPQ just decreased in size by 1)
  pqInsertIndex--;

  // Sink the first entry in the minPQ (which just was the last entry in the minPQ)
  pqSink(1);

  // Return the pointID of the point-edge removed from the minPQ
  return pointID;
}

// This function inserts a point-edge into the minPQ at the pqInsertIndex and swims it
function pqInsert(pointID, weight) {
  //console.log("pqInsert()");
  // Validate the pointID (only admit points that are non-negative and less than number of points)
  pqValidateIndex(pointID);

  // Ensure the minPQ contains the point
  if (pqContains(pointID)) {
    throw new IllegalArgumentException(
      "index is already in the priority queue"
    );
  }

  // Increment the insertion index
  pqInsertIndex++;

  // Track the point's index in the index-tracking array
  pointIndexInPQ[pointID] = pqInsertIndex;

  // Add the point-edge to the minPQ
  minPQ[pqInsertIndex] = { point: pointID, weight: weight };

  // Swim the point because it might be smaller than its parent
  pqSwim(pqInsertIndex);
}

// This function creates the distTo[] and edgeTo[] arrays given a sourcePoint.
// This function is Dijkstra's Shortest Paths algorithm.
function findShortestPathDijkstra(sourcePoint) {
  // Set the distance to the source point as 0.
  distTo[sourcePoint] = 0;

  // Insert the source point into the minPQ
  pqInsert(sourcePoint, 0.0);

  // While the minPQ has a minimum edge...
  while (!pqIsEmpty()) {
    // ...pop the minimum edge from the minPQ and set v as the point it is associated with
    // Recall: pqDeleteMin returns the point property from the point-edge which looks like { point: pointID, weight: edgeDistance }
    let v = pqDeleteMin();

    // Relax every edge that originates from point v (looking at the edges in the EWCD)
    for (let n = 0; n < EdgeWeightedCyclicDigraph[v].length; n++) {
      // Relax the edge
      relax(EdgeWeightedCyclicDigraph[v][n]);
    }
  }
}

// This function updates the distTo[] and edgeTo[] arrays
// This function is called inside the findShortestPathDijkstra(sourcePoint) function.
function relax(edge) {
  // Get the from, to, and distance from the edge
  let from = edge.from; // point from which the edge is emitted
  let to = edge.to; // point which the edge is going to
  let weight = edge.weight; // the length of the edge

  // Get the original distance from the source to distTo[to]
  let originalDistance = distTo[to];

  // Get the new distance from the source to distTo[to]
  let newDistance = distTo[from] + weight;

  // If the new distance is shorter than the original distance...
  if (originalDistance > newDistance) {
    // ... update the distTo[] and edgeTo[] arrays
    distTo[to] = newDistance;
    edgeTo[to] = edge;

    // If the minPQ contains the "to" point...
    if (pqContains(to)) {
      // ... decrease the weight of the "to" point in the minPQ with the new distance
      pqDecreaseWeightOfPoint(to, newDistance);
    } else {
      // ... otherwise insert the "to" point at the end of the minPQ and swim it
      pqInsert(to, newDistance);
    }
  }
}

var view1 = new Vue({
  el: "#view-one",
  data: {
    // DESKTOP OR MOBILE
    isMobile: false,
    isPortrait: false,
    mobileOrDesktop: "?",
    orientation: "?",
    // SCREEN WIDTH & HEIGHT
    resizecalled: 0,
    width: 0,
    height: 0,
    screenHeight: "100%",
    screenWidth: "100%",
    // DIJKSTRA SHORTEST PATHS
    longRow: 15, // Can be even or odd
    numRows: 15, // MUST BE ODD
    variability: 0.7,
    numPoints: -1,
    points: [
      { x: -20, y: -20 },
      { x: 100, y: 60 },
      { x: 130, y: 90 },
      { x: 150, y: 40 },
    ],
    lines: [],
    pathLines: [],
    edges: [],
    triangles: [],
    // SHORTEST PATH SVG PROPERTIES
    svgWidth: 0,
    svgHeight: 0,
    svgOffsetX: 0,
    svgOffsetY: 0,
    numTailTriangles: 0,
    mouseOnTriangle: false,
    mouseTrianglePoints: "",
    mouseTriangleLines: [],
    // PATHEATER PROPERTIES
    pathEater: {
      point1: 0,
      point2: 0,
      point3: 0,
      moving: false,
      adjacent: false,
      deltaX: 100,
      deltaY: 100,
      trianglePoints: "",
      color: "orangered",
      from: 40,
      to: 41,
      x: 300,
      y: 300,
    },
    // INTRO TEXT SIZE AND SPACING PROPERTIES
    introText: {
      fontSize: "80px",
      text1MarginBottom: "50px",
      text2MarginBottom: "150px",
      text3MarginBottom: "250px",
    },
  },
  computed: {
    cssVars() {
      console.log("returning pathEaterDeltas:");
      console.log("-> pathEaterDeltaX = " + this.pathEater.deltaX);
      console.log("-> pathEaterDeltaY = " + this.pathEater.deltaY);
      return {
        /* variables you want to pass to css */
        "--pathEaterDeltaX": this.pathEater.deltaX + "px",
        "--pathEaterDeltaY": this.pathEater.deltaY + "px",
      };
    },
  },
  methods: {
    mobileCheck: function() {
      let check = false;
      (function(a) {
        if (
          /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
            a
          ) ||
          /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
            a.substr(0, 4)
          )
        )
          check = true;
      })(navigator.userAgent || navigator.vendor || window.opera);
      return check;
    },
    setMobileOrDesktop: function() {
      let isMobile = this.mobileCheck();
      this.isMobile = isMobile;
      if (isMobile) {
        this.mobileOrDesktop = "mobile";
      } else {
        this.mobileOrDesktop = "desktop";
      }
    },
    setScreenDimensions: function() {
      console.log("setScreenDimensions()");
      let screenHeightComputed = window.screen.availHeight;
      let screenWidthComputed = window.screen.availWidth;
      this.screenWidth = screenWidthComputed;
      this.screenHeight = screenHeightComputed;

      this.svgWidth = screenWidthComputed;
      this.svgHeight = screenHeightComputed;

      // Mobile solution
      if (this.isMobile) {
        if (screenHeightComputed > screenWidthComputed) {
          this.svgWidth = screenHeightComputed;
          this.svgHeight = screenHeightComputed;

          this.screenWidth = screenHeightComputed;
          this.screenHeight = screenHeightComputed;
        } else {
          this.svgWidth = screenWidthComputed;
          this.svgHeight = screenWidthComputed;

          this.screenHeight = screenHeightComputed;
          this.screenWidth = screenWidthComputed;
        }
      }
    },
    createResizeHandler: function() {
      this.height = window.innerHeight;
      this.width = window.innerWidth;
      let screenHeightComputed = window.screen.availHeight;
      let screenWidthComputed = window.screen.availWidth;

      let root = document.documentElement;
      this.svgOffsetX = (this.screenWidth - this.width) / 2;
      this.svgOffsetY = 0;
      root.style.setProperty("--spSvgOffsetX", -this.svgOffsetX + "px");
      root.style.setProperty("--spSvgOffsetY", -this.svgOffsetY + "px");

      // PORTRAIT
      if (this.height > this.width) {
        this.orientation = "portrait";
        this.isPortrait = true;

        if (this.isMobile) {
          this.screenWidth = screenWidthComputed;
          this.screenHeight = screenHeightComputed;

          // center svg
          this.svgOffsetX = (this.screenHeight - this.width) / 2;
          this.svgOffsetY = 0;
          root.style.setProperty("--spSvgOffsetX", -this.svgOffsetX + "px");
          root.style.setProperty("--spSvgOffsetY", -this.svgOffsetY + "px");
        }
      }
      // LANDSCAPE
      else {
        this.orientation = "landscape";
        this.isPortrait = false;

        if (this.isMobile) {
          this.screenWidth = screenHeightComputed;
          this.screenHeight = screenWidthComputed;

          this.svgOffsetX = 0;
          this.svgOffsetY = 0;
          root.style.setProperty("--spSvgOffsetX", -this.svgOffsetX + "px");
          root.style.setProperty("--spSvgOffsetY", -this.svgOffsetY + "px");
        }
      }

      // set intro-text font-size
      if (this.width < 700) {
        this.introText.fontSize = 40 + "px";

        if (this.isMobile) {
          if (this.isPortrait) {
            this.introText.text3MarginBottom = 3 * 40 + "px";
            this.introText.text2MarginBottom = 4.5 * 40 + "px";
            this.introText.text1MarginBottom = 6 * 40 + "px";
          } else {
            this.introText.text3MarginBottom = 1.5 * 40 + "px";
            this.introText.text2MarginBottom = 3 * 40 + "px";
            this.introText.text1MarginBottom = 4.5 * 40 + "px";
          }
        } else {
          this.introText.text3MarginBottom = 3 * 40 + "px";
          this.introText.text2MarginBottom = 4.5 * 40 + "px";
          this.introText.text1MarginBottom = 6 * 40 + "px";
        }
      } else {
        this.introText.fontSize = 80 + "px";
        this.introText.text3MarginBottom = 120 + "px";
        this.introText.text2MarginBottom = 120 + 1.5 * 80 + "px";
        this.introText.text1MarginBottom = 120 + 3 * 80 + "px";
      }

      window.addEventListener("resize", () => {
        this.resizecalled++;
        this.height = window.innerHeight;
        this.width = window.innerWidth;

        let screenHeightComputed = window.screen.availHeight;
        let screenWidthComputed = window.screen.availWidth;

        let root = document.documentElement;
        this.svgOffsetX = (this.screenWidth - this.width) / 2;
        this.svgOffsetY = 0;
        root.style.setProperty("--spSvgOffsetX", -this.svgOffsetX + "px");
        root.style.setProperty("--spSvgOffsetY", -this.svgOffsetY + "px");

        // PORTRAIT
        if (this.height > this.width) {
          this.orientation = "portrait";
          this.isPortrait = true;

          if (this.isMobile) {
            this.screenWidth = screenWidthComputed;
            this.screenHeight = screenHeightComputed;

            // center svg
            // using screenHeight because sH and sW switch on mobile devices
            this.svgOffsetX = (this.screenHeight - this.width) / 2;
            this.svgOffsetY = 0;
            root.style.setProperty("--spSvgOffsetX", -this.svgOffsetX + "px");
            root.style.setProperty("--spSvgOffsetY", -this.svgOffsetY + "px");
          }
        }
        // LANDSCAPE
        else {
          this.orientation = "landscape";
          this.isPortrait = false;

          if (this.isMobile) {
            this.screenWidth = screenHeightComputed;
            this.screenHeight = screenWidthComputed;

            this.svgOffsetX = 0;
            this.svgOffsetY = 0;
            root.style.setProperty("--spSvgOffsetX", -this.svgOffsetX + "px");
            root.style.setProperty("--spSvgOffsetY", -this.svgOffsetY + "px");
          }
        }
        // set intro-text font-size
        if (this.width < 700) {
          this.introText.fontSize = 40 + "px";

          if (this.isMobile) {
            if (this.isPortrait) {
              this.introText.text3MarginBottom = 3 * 40 + "px";
              this.introText.text2MarginBottom = 4.5 * 40 + "px";
              this.introText.text1MarginBottom = 6 * 40 + "px";
            } else {
              this.introText.text3MarginBottom = 1.5 * 40 + "px";
              this.introText.text2MarginBottom = 3 * 40 + "px";
              this.introText.text1MarginBottom = 4.5 * 40 + "px";
            }
          } else {
            this.introText.text3MarginBottom = 3 * 40 + "px";
            this.introText.text2MarginBottom = 4.5 * 40 + "px";
            this.introText.text1MarginBottom = 6 * 40 + "px";
          }
        } else {
          this.introText.fontSize = 80 + "px";
          this.introText.text3MarginBottom = 120 + "px";
          this.introText.text2MarginBottom = 120 + 1.5 * 80 + "px";
          this.introText.text1MarginBottom = 120 + 3 * 80 + "px";
        }
      });
    },
    balanceRowsAndCols: function() {
      if (Math.abs(this.svgWidth - this.svgHeight) < Number.EPSILON) {
        this.longRow = this.numRows;
      } else {
        const deltaX = this.svgWidth / (2 * this.longRow - 3);
        const deltaY = this.svgHeight / (this.numRows - 2);

        let ratio = deltaX / deltaY;

        if (deltaY > deltaY) {
          let newNumRows = this.numRows * ratio;
          if (newNumRows % 2 === 1) {
            this.numRows = newNumRows;
          } else {
            this.numRows = newNumRows - 1;
          }
        } else {
          let newLongrow = Math.round(this.longRow * ratio);
          this.longRow = newLongrow;
        }
      }
    },
    getRow: function(id, longRow) {
      let k = Math.floor(id / (2 * longRow - 1));
      let j = Math.floor((id - (2 * longRow - 1) * k) / longRow);
      return 2 * k + j;
    },
    getDistance: function(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
    getRandomIntInRange: function(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    },
    // creates all of the points in a predefined grid with a maximum x and y offset to create "controlled variability"
    createPoints: function(longRow, numRows) {
      console.log("createPoints( L = " + longRow + " , R = " + numRows + " )");
      const numPoints =
        (Math.floor(numRows / 2) + 1) * longRow +
        Math.floor(numRows / 2) * (longRow - 1);
      console.log("\tnumPoints= " + numPoints);

      const deltaX = this.svgWidth / (2 * longRow - 3);
      const deltaY = this.svgHeight / (numRows - 2);
      console.log("svgWidth:" + this.screenHeight);
      console.log("svgHeight:" + this.screenWidth);
      console.log("\tdeltaX = " + deltaX);
      console.log("\tdeltaY = " + deltaY);

      let points = [];
      let changeInVariability = this.variability / numPoints;

      // iterate through every point
      for (let n = 0; n < numPoints; n++) {
        let k = Math.floor(n / (2 * longRow - 1));
        let j = Math.floor((n - (2 * longRow - 1) * k) / longRow);
        let row = 2 * k + j;

        // decreasing variability
        let variability = this.variability - n * changeInVariability;

        //this if statement makes the last few rows linear
        if (n > numPoints - 3 * longRow + 1) {
          variability = 0;
        }

        // variability function
        let PointVariability = function(variabilityIn, delta, row, index) {
          if (
            row === 0 ||
            row === numRows - 1 ||
            (row % 2 === 0 && (index === 0 || index === longRow - 1))
          ) {
            return 0;
          }
          return delta * Math.random() * (2 * variabilityIn) - variabilityIn;
        };

        if (row % 2 === 0) {
          let index = (n - (2 * longRow - 1) * k) % longRow;
          points.push({
            x:
              2 * deltaX * index +
              PointVariability(variability, deltaX, row, index) -
              deltaX,
            y:
              deltaY * row +
              PointVariability(variability, deltaY, row, index) -
              deltaY,
            row: row,
            index: index,
            id: n,
          });
        } else {
          let index = (n - (2 * longRow - 1) * k - longRow * j) % (longRow - 1);
          points.push({
            x:
              2 * deltaX * (index + 0.5) +
              PointVariability(variability, deltaX, row, index) -
              deltaX,
            y:
              deltaY * row +
              PointVariability(variability, deltaY, row, index) -
              deltaY,
            row: row,
            index: index,
            id: n,
          });
        }
      }

      this.numPoints = numPoints;
      this.points = points;
    },
    createLines: function(longRow, numRows) {
      console.log("createLines( L = " + longRow + " , R = " + numRows + " )");
      //const numPoints = this.points.length;
      const numPoints = this.numPoints;
      console.log("\tnumPoints= " + numPoints);

      let lines = [];

      // iterate
      for (let n = 0; n < numPoints; n++) {
        //console.log("iterating on n=" + n);
        let upLeft = n - longRow;
        let upRight = n - longRow + 1;
        let left = n - 1;
        let right = n + 1;
        let downLeft = n + longRow - 1;
        let downRight = n + longRow;

        let myRow = this.getRow(n, longRow);

        if (upLeft >= 0 && this.getRow(upLeft, longRow) === myRow - 1) {
          const x1 = this.points[n].x;
          const y1 = this.points[n].y;
          const x2 = this.points[upLeft].x;
          const y2 = this.points[upLeft].y;

          lines.push({
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
          });

          // insert into EWCD
          EdgeWeightedCyclicDigraph[n].push({
            from: n,
            to: upLeft,
            weight: this.getDistance(x1, y1, x2, y2),
          });
        }
        if (upRight >= 0 && this.getRow(upRight, longRow) === myRow - 1) {
          const x1 = this.points[n].x;
          const y1 = this.points[n].y;
          const x2 = this.points[upRight].x;
          const y2 = this.points[upRight].y;

          lines.push({
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
          });

          // insert into EWCD
          EdgeWeightedCyclicDigraph[n].push({
            from: n,
            to: upRight,
            weight: this.getDistance(x1, y1, x2, y2),
          });
        }
        if (left >= 0 && this.getRow(left, longRow) === myRow) {
          const x1 = this.points[n].x;
          const y1 = this.points[n].y;
          const x2 = this.points[left].x;
          const y2 = this.points[left].y;

          lines.push({
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
          });

          // insert into EWCD
          EdgeWeightedCyclicDigraph[n].push({
            from: n,
            to: left,
            weight: this.getDistance(x1, y1, x2, y2),
          });
        }
        if (right >= 0 && this.getRow(right, longRow) === myRow) {
          const x1 = this.points[n].x;
          const y1 = this.points[n].y;
          const x2 = this.points[right].x;
          const y2 = this.points[right].y;

          lines.push({
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
          });

          // insert into EWCD
          EdgeWeightedCyclicDigraph[n].push({
            from: n,
            to: right,
            weight: this.getDistance(x1, y1, x2, y2),
          });
        }
        if (
          downLeft < numPoints &&
          this.getRow(downLeft, longRow) === myRow + 1
        ) {
          const x1 = this.points[n].x;
          const y1 = this.points[n].y;
          const x2 = this.points[downLeft].x;
          const y2 = this.points[downLeft].y;

          lines.push({
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
          });

          // insert into EWCD
          EdgeWeightedCyclicDigraph[n].push({
            from: n,
            to: downLeft,
            weight: this.getDistance(x1, y1, x2, y2),
          });
        }
        if (
          downRight < numPoints &&
          this.getRow(downRight, longRow) === myRow + 1
        ) {
          const x1 = this.points[n].x;
          const y1 = this.points[n].y;
          const x2 = this.points[downRight].x;
          const y2 = this.points[downRight].y;

          lines.push({
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
          });

          // insert into EWCD
          EdgeWeightedCyclicDigraph[n].push({
            from: n,
            to: downRight,
            weight: this.getDistance(x1, y1, x2, y2),
          });
        }
      }

      this.lines = lines;
    },
    createTriangles: function(longRow, numRows) {
      console.log(
        "createTriangles( L = " + longRow + " , R = " + numRows + " )"
      );
      // const numPoints =
      //   (Math.floor(numRows / 2) + 1) * longRow +
      //   Math.floor(numRows / 2) * (longRow - 1);
      // console.log("\tnumPoints= " + numPoints);
      const numPoints = this.numPoints;

      let triangles = [];

      let curTriangle = 0;
      // iterate through every point
      for (let n = 0; n < this.numPoints; n++) {
        //console.log("n = " + n);
        let k = Math.floor(n / (2 * longRow - 1));
        let j = Math.floor((n - (2 * longRow - 1) * k) / longRow);
        let row = 2 * k + j;

        let downOne = n + longRow - 1;
        let downTwo = n + longRow;
        let right = n + 1;

        if (
          this.getRow(downOne, longRow) === this.getRow(downTwo, longRow) &&
          downOne < numPoints &&
          downTwo < downTwo < numPoints
        ) {
          // let color =
          //   "rgb(" +
          //   (((40 - 30) / this.numRows) * row + 30) +
          //   "," +
          //   (((40 - 30) / this.numRows) * row + 30) +
          //   "," +
          //   (((40 - 30) / this.numRows) * row + 30) +
          //   ")";

          triangles.push({
            id: curTriangle++,
            color: "#131313",
            point1: n,
            point2: downOne,
            point3: downTwo,
            points:
              this.points[n].x +
              "," +
              this.points[n].y +
              " " +
              this.points[downOne].x +
              "," +
              this.points[downOne].y +
              " " +
              this.points[downTwo].x +
              "," +
              this.points[downTwo].y,
          });
        }

        if (this.getRow(right, longRow) === row && downTwo < numPoints) {
          // let color =
          //   "rgb(" +
          //   (((40 - 30) / this.numRows) * row + 30) +
          //   "," +
          //   (((40 - 30) / this.numRows) * row + 30) +
          //   "," +
          //   (((40 - 30) / this.numRows) * row + 30) +
          //   ")";

          triangles.push({
            id: curTriangle++,
            color: "#131313",
            point1: n,
            point2: right,
            point3: downTwo,
            points:
              this.points[n].x +
              "," +
              this.points[n].y +
              " " +
              this.points[right].x +
              "," +
              this.points[right].y +
              " " +
              this.points[downTwo].x +
              "," +
              this.points[downTwo].y,
          });
        }
      }

      this.triangles = triangles;
    },
    createShortestPathsTree() {
      // reset digraph and supporting arrays
      for (let n = 0; n < this.numPoints; n++) {
        pointIndexInPQ[n] = null;
        distTo[n] = Infinity;
        edgeTo[n] = null;
        minPQ[n] = { point: -1, weight: Infinity };
      }

      findShortestPathDijkstra(this.pathEater.from);

      let path = [];

      let numPaths = 0;
      for (
        let n = this.pathEater.to;
        n != this.pathEater.from;
        n = edgeTo[n].from
      ) {
        const x1 = this.points[n].x;
        const y1 = this.points[n].y;
        const x2 = this.points[edgeTo[n].from].x;
        const y2 = this.points[edgeTo[n].from].y;

        path.push({
          point1: n,
          point2: edgeTo[n].from,
          width: 2 + numPaths,
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2,
        });

        numPaths++;
      }

      this.pathLines = path;
    },
    mouseEnterTriangle: function(triangle) {
      this.triangleMouseIn = triangle;

      this.triangles[triangle].color = "black";

      // get nearest point to cursor
      let point1 = this.triangles[triangle].point1;
      let point2 = this.triangles[triangle].point2;
      let point3 = this.triangles[triangle].point3;

      if (distTo[point1] < distTo[point2] && distTo[point1] < distTo[point3]) {
        this.pathEater.to = point1;
      } else if (
        distTo[point2] < distTo[point1] &&
        distTo[point2] < distTo[point3]
      ) {
        this.pathEater.to = point2;
      } else {
        this.pathEater.to = point3;
      }

      this.mouseOnTriangle = true;
      this.mouseTrianglePoints =
        this.points[point1].x +
        "," +
        this.points[point1].y +
        " " +
        this.points[point2].x +
        "," +
        this.points[point2].y +
        " " +
        this.points[point3].x +
        "," +
        this.points[point3].y;

      // create the 3 lines that compose the entered triangle
      let triangleLines = [];

      triangleLines.push({
        x1: this.points[point1].x,
        y1: this.points[point1].y,
        x2: this.points[point2].x,
        y2: this.points[point2].y,
      });

      triangleLines.push({
        x1: this.points[point1].x,
        y1: this.points[point1].y,
        x2: this.points[point3].x,
        y2: this.points[point3].y,
      });

      triangleLines.push({
        x1: this.points[point2].x,
        y1: this.points[point2].y,
        x2: this.points[point3].x,
        y2: this.points[point3].y,
      });

      this.mouseTriangleLines = triangleLines;

      this.createShortestPathsTree();

      //this.triangles[triangle].color = "#1b2a3a";
      setTimeout(() => (this.triangles[triangle].color = "#131313"), 200);
    },
    mouseLeaveTriangle: function(triangle) {
      //this.triangles[triangle].color = "#1e1e1e";
    },
    initializePathEater: function() {
      console.log("initializePathEater()");
      let pathEaterSource = this.getRandomIntInRange(
        2 * this.longRow,
        this.numPoints - 2 * this.longRow
      );
      console.log("pathEaterSource = " + pathEaterSource);
      this.pathEater.from = pathEaterSource;
      this.pathEater.x = this.points[pathEaterSource].x;
      this.pathEater.y = this.points[pathEaterSource].y;
      this.pathEater.moving = false;
      this.pathEater.adjacent = false;
      this.pathEater.animate = false;
    },
    pathEaterEvaluate: function() {
      let userScrollY = window.pageYOffset;

      // make the patheater stop if the user has scrolled beyond the shortest paths
      if (userScrollY > this.screenHeight) {
        console.log("user has scrolled beyond");
      } else {
        let root = document.documentElement;
        this.pathEater.moving = false;

        //console.log("pathEaterEvaluate()");
        if (this.pathEater.from === this.pathEater.to) {
          // we have reached the source
          this.pathEater.adjacent = true;
          this.pathEater.color = "#ff008a";
          this.pathEater.moving = false;

          // get nearest point to cursor
          let point1 = this.triangles[this.triangleMouseIn].point1;
          let point2 = this.triangles[this.triangleMouseIn].point2;
          let point3 = this.triangles[this.triangleMouseIn].point3;

          this.pathEater.point1 = point1;
          this.pathEater.point2 = point2;
          this.pathEater.point3 = point3;

          let pointXAvg =
            (this.points[point1].x +
              this.points[point2].x +
              this.points[point3].x) /
            3;

          let pointYAvg =
            (this.points[point1].y +
              this.points[point2].y +
              this.points[point3].y) /
            3;

          root.style.setProperty(
            "--transformOrigin",
            pointXAvg + "px " + pointYAvg + "px "
          );

          // root.style.setProperty(
          //   "--triangleCenterX",
          //   this.pathEater.x - pointXAvg
          // );
          // root.style.setProperty(
          //   "--triangleCenterY",
          //   this.pathEater.y - pointYAvg
          // );

          // this.pathEater.x = pointXAvg;
          // this.pathEater.y = pointYAvg;

          this.pathEater.trianglePoints =
            this.points[point1].x +
            "," +
            this.points[point1].y +
            " " +
            this.points[point2].x +
            "," +
            this.points[point2].y +
            " " +
            this.points[point3].x +
            "," +
            this.points[point3].y;
        } else {
          this.pathEater.adjacent = false;
          this.pathEater.color = "orangered";

          if (this.pathLines.length >= 1) {
            // Get the new source (the point the path-eater is moving to)
            let newSource = this.pathLines.pop().point1;

            // Set the CSS property so the animation works correctly
            let pathEaterDeltaX = this.pathEater.x - this.points[newSource].x;
            let pathEaterDeltaY = this.pathEater.y - this.points[newSource].y;

            this.pathEater.deltaX = pathEaterDeltaX;
            this.pathEater.deltaY = pathEaterDeltaY;

            root.style.setProperty("--pathEaterDeltaX", pathEaterDeltaX + "px");
            root.style.setProperty("--pathEaterDeltaY", pathEaterDeltaY + "px");

            this.pathEater.x = this.points[newSource].x;
            this.pathEater.y = this.points[newSource].y;
            this.pathEater.moving = true;

            this.pathEater.from = newSource;
            this.pathEater.adjacent = false;
            this.pathEater.animate = false;

            if (this.pathLines.length === 0) {
              this.pathEater.color = "#ff008a";
            }

            setTimeout(() => (this.pathEater.moving = false), 450);
          }
        }
      }
    },
  },
  created: function() {
    this.setMobileOrDesktop();
    this.setScreenDimensions();
    this.createResizeHandler();
    this.balanceRowsAndCols();
    this.createPoints(this.longRow, this.numRows);
    initDigraph(this.numPoints);
    this.createLines(this.longRow, this.numRows);
    this.createTriangles(this.longRow, this.numRows);
    this.initializePathEater();

    setInterval(() => this.pathEaterEvaluate(), 500);
    //this.createShortestPath();
    // console.log(edgeTo);
  },
  mounted: function() {
    this.$nextTick(function() {
      // Code that will run only after the
      // entire view has been rendered
    });
  },
});

// var view2 = new Vue({
//   el: "#view-two",
//   data: {
//     appName: "Yuri Dubler Official 2",
//     checkboxOne: false,
//     checkboxTwo: false,
//     list: [
//       { name: "Can of Prickly Pear" },
//       { name: "A Doubleshot Latte" },
//       { name: "ArcUser Magazine" },
//     ],
//     itemName: "",
//   },
//   methods: {
//     addToList: function() {
//       this.list.push({ name: this.itemName });
//     },
//     removeFromList: function(index) {
//       this.list.splice(index, 1);
//     },
//   },
// });
