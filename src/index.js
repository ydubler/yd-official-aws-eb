const name = "#view-one";

// Edged Weighted Digraph Structures
let numPointsInGraph = 0;
let digraph; // stores an edges array for every index
let minHeapPQ = []; // used to find the smallest edge (stores point/dist)
let pqInsertIndex = 0;
let pointIndexInPQ = []; // stores the index of a point in the minHeapPQ
let distTo = []; // stores every points distance from the source point
let edgeTo = []; // stores the shortest paths edge from the source point

function initDigraph(numPoints) {
  console.log("initDigraph();");
  numPointsInGraph = numPoints;
  pointIndexInPQ = new Array(numPoints);
  minHeapPQ = new Array(numPoints + 1); // heap positions start at index 1
  distTo = new Array(numPoints);
  edgeTo = new Array(numPoints);
  digraph = new Array(numPoints);

  // populate digraph with subarrays (to push edges)
  for (let n = 0; n < numPoints; n++) {
    digraph[n] = [];
    pointIndexInPQ[n] = null;
    distTo[n] = Infinity;
    edgeTo[n] = null;
    minHeapPQ[n] = { point: -1, weight: Infinity };
  }
}

function pqIsEmpty() {
  //console.log("pqIsEmpty()");
  if (pqInsertIndex === 0) return true;
  return false;
}

function pqContains(point) {
  //console.log("pqContains()");
  pqValidateIndex(point);
  if (pointIndexInPQ[point] != null) {
    //console.log("pqContains() -> point " + point + " is IN the minPQ!");
    return true;
  }
  return false;
}

function pqValidateIndex(point) {
  //console.log("pqValidate()");
  if (point < 0) throw new IllegalArgumentException("index is negative: " + i);
  let x = 1;
  if (point >= numPointsInGraph)
    throw new IllegalArgumentException("index >= capacity: " + i);
}

function pqExch(k, j) {
  //console.log("pqExch()");
  let kPoint = minHeapPQ[k].point;
  let jPoint = minHeapPQ[j].point;

  if (!pqContains(kPoint) || !pqContains(jPoint)) {
    console.log(minHeapPQ);
    console.log(pointIndexInPQ);
    console.log(distTo);
    console.log(
      "ERROR: One or both of the following aren't contained in the MinHeapPQ"
    );
    console.log("kPoint = " + kPoint);
    console.log("kPoint = " + jPoint);
    throw new IllegalArgumentException("one or both swap points don't exist !");
  }

  pointIndexInPQ[kPoint] = j;
  pointIndexInPQ[jPoint] = k;

  //console.log("setting pointIndexInPQ[ " + kPoint + " ] to " + j);
  //console.log("setting pointIndexInPQ[ " + jPoint + " ] to " + k);

  let swap = { point: minHeapPQ[j].point, weight: minHeapPQ[j].weight };
  minHeapPQ[j] = { point: minHeapPQ[k].point, weight: minHeapPQ[k].weight };
  minHeapPQ[k] = swap;
}

// k is an index in PQ
function pqSink(k) {
  //console.log("pqSink()");
  while (2 * k <= numPointsInGraph && 2 * k <= pqInsertIndex) {
    let j = 2 * k;

    if (j < numPointsInGraph && pqLess(j + 1, j)) {
      j++; // choose smaller child
    }

    if (!pqLess(j, k)) {
      break;
    }

    pqExch(k, j);
    k = j;
  }
}

// k is an index in PQ
function pqSwim(k) {
  //console.log("pqSwim()");
  // get the parent index
  let parent = 0;
  if (k === 3) {
    parent = 1;
  } else if (k % 2 === 0) {
    parent = k / 2;
  } else {
    parent = Math.floor(k / 2);
  }

  while (k > 1 && pqLess(k, parent)) {
    //console.log("swim going from " + k + " to " + parent);

    if (k === 3) {
      parent = 1;
    } else if (k % 2 === 0) {
      parent = k / 2;
    } else {
      parent = Math.floor(k / 2);
    }

    pqExch(k, parent);
    k = parent;
  }
}

function pqDecreaseWeightOfPoint(point, weight) {
  //console.log("pqDecreaseWeightOfPoint()");
  pqValidateIndex(point);

  if (!pqContains(point)) {
    throw new NoSuchElementException("index is not in the priority queue");
  }

  // console.log(
  //   "weight " + minHeapPQ[pointIndexInPQ[point]].weight + " -> " + weight
  // );

  if (minHeapPQ[pointIndexInPQ[point]].weight < weight) {
    console.log("MINHEAPPQ[]");
    console.log(minHeapPQ);
    console.log("DISTTO[]");
    console.log(distTo);
    console.log("pointIndexInP[]");
    console.log(pointIndexInPQ);
    console.log(
      "point " + point + " has index " + pointIndexInPQ[point] + "in MinHeapPQ"
    );
    console.log("distTo[" + point + "]=" + distTo[point]);
    console.log(
      "minHeapPQ[indexInPQ[" +
        point +
        "]].weight =" +
        minHeapPQ[pointIndexInPQ[point]].weight
    );
    throw new IllegalArgumentException(
      "Calling pqDecreaseWeightOfPoint() with a key strictly greater than the key in the priority queue"
    );
  }

  minHeapPQ[pointIndexInPQ[point]].weight = weight;
  pqSwim(pointIndexInPQ[point]);
}

// k is a weight value in PQ
function pqLess(k, j) {
  //console.log("pqLess()");
  //console.log(k + " weight=" + minHeapPQ[k].weight);
  //console.log(j + " weight=" + minHeapPQ[k].weight);

  if (minHeapPQ[k].weight === undefined || minHeapPQ[j].weight === undefined) {
    return false;
  }

  if (minHeapPQ[k].weight < minHeapPQ[j].weight) {
    return true;
  }

  return false;
}

function pqDeleteMin() {
  //console.log("pqDeleteMin()");
  if (pqInsertIndex === 0) {
    throw new NoSuchElementException("Priority queue underflow");
  }

  let point = minHeapPQ[1].point;
  pointIndexInPQ[point] = null;
  //console.log("REMOVING pointIndexInPQ[ " + point + " ] to NULL");

  minHeapPQ[1] = {
    point: minHeapPQ[pqInsertIndex].point,
    weight: minHeapPQ[pqInsertIndex].weight,
  };

  pointIndexInPQ[minHeapPQ[pqInsertIndex].point] = 1;
  pqInsertIndex--;
  pqSink(1);

  return point;
}

function pqInsert(point, weight) {
  //console.log("pqInsert()");
  pqValidateIndex(point);

  if (pqContains(point)) {
    throw new IllegalArgumentException(
      "index is already in the priority queue"
    );
  }

  pqInsertIndex++;
  pointIndexInPQ[point] = pqInsertIndex;
  //console.log("setting pointIndexInPQ[ " + point + " ] to " + pqInsertIndex);
  minHeapPQ[pqInsertIndex] = { point: point, weight: weight };
  pqSwim(pqInsertIndex);
}

function relax(edge) {
  //console.log("relax()");
  let from = edge.from;
  let to = edge.to;
  let weight = edge.weight;
  let originalDistance = distTo[to];
  let newDistance = distTo[from] + weight;

  // console.log(
  //   "RELAXING EDGE: { from: " +
  //     from +
  //     " , to: " +
  //     to +
  //     " , weight: " +
  //     weight +
  //     " } with original distance of " +
  //     originalDistance
  // );

  if (originalDistance > newDistance) {
    distTo[to] = newDistance;
    edgeTo[to] = edge;

    if (pqContains(to)) {
      // console.log(
      //   "weight updating from " + originalDistance + " to " + newDistance
      // );
      pqDecreaseWeightOfPoint(to, newDistance);
    } else {
      pqInsert(to, newDistance);
    }
  }
}

function findShortestPathDijkstra(sourcePoint) {
  //console.log(digraph);

  distTo[sourcePoint] = 0;

  pqInsert(sourcePoint, 0.0);
  //console.log(minHeapPQ);
  while (!pqIsEmpty()) {
    let v = pqDeleteMin();
    //console.log(v + " popped off heapMinPQ");
    for (let n = 0; n < digraph[v].length; n++) {
      // console.log(
      //   "relaxing digraph[" +
      //     v +
      //     "][" +
      //     n +
      //     "] = { from: " +
      //     digraph[v][n].from +
      //     " , to: " +
      //     digraph[v][n].to +
      //     " , weight: " +
      //     digraph[v][n].weight
      // );
      // console.log(digraph[v][n]);
      relax(digraph[v][n]);
    }
  }
}

var view1 = new Vue({
  el: name,
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

        if (this.isPortrait) {
          this.introText.text3MarginBottom = 2 * 40 + "px";
          this.introText.text2MarginBottom = 3.5 * 40 + "px";
          this.introText.text1MarginBottom = 5 * 40 + "px";
        } else {
          this.introText.text3MarginBottom = 1 * 40 + "px";
          this.introText.text2MarginBottom = 2.5 * 40 + "px";
          this.introText.text1MarginBottom = 4 * 40 + "px";
        }
      } else {
        this.introText.fontSize = 80 + "px";
        this.introText.text3MarginBottom = 1 * 80 + "px";
        this.introText.text2MarginBottom = 2.5 * 80 + "px";
        this.introText.text1MarginBottom = 4 * 80 + "px";
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

          if (this.isPortrait) {
            this.introText.text3MarginBottom = 2 * 40 + "px";
            this.introText.text2MarginBottom = 3.5 * 40 + "px";
            this.introText.text1MarginBottom = 5 * 40 + "px";
          } else {
            this.introText.text3MarginBottom = 1 * 40 + "px";
            this.introText.text2MarginBottom = 2.5 * 40 + "px";
            this.introText.text1MarginBottom = 4 * 40 + "px";
          }
        } else {
          this.introText.fontSize = 80 + "px";
          this.introText.text3MarginBottom = 1 * 80 + "px";
          this.introText.text2MarginBottom = 2.5 * 80 + "px";
          this.introText.text1MarginBottom = 4 * 80 + "px";
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

          digraph[n].push({
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

          digraph[n].push({
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

          digraph[n].push({
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

          digraph[n].push({
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

          digraph[n].push({
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

          digraph[n].push({
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
        minHeapPQ[n] = { point: -1, weight: Infinity };
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
