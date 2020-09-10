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
    appName: "Yuri Dubler Official",
    screenHeight: "100%",
    screenWidth: "100%",
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
  },
  methods: {
    getScreenDimensions: function() {
      console.log("getScreenDimensions()");
      screenHeightComputed = window.screen.availHeight;
      screenWidthComputed = window.screen.availWidth;
      this.screenHeight = screenHeightComputed;
      this.screenWidth = screenWidthComputed;
      console.log("\tscreen height = " + screenHeightComputed);
      console.log("\tscreen width = " + screenWidthComputed);
    },
    getRow: function(id, longRow) {
      let k = Math.floor(id / (2 * longRow - 1));
      let j = Math.floor((id - (2 * longRow - 1) * k) / longRow);
      return 2 * k + j;
    },
    getDistance: function(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
    createPoints: function(longRow, numRows) {
      console.log("createPoints( L = " + longRow + " , R = " + numRows + " )");
      const numPoints =
        (Math.floor(numRows / 2) + 1) * longRow +
        Math.floor(numRows / 2) * (longRow - 1);
      console.log("\tnumPoints= " + numPoints);

      const deltaX = this.screenWidth / (2 * longRow - 3);
      const deltaY = this.screenHeight / (numRows - 2);
      console.log("Screenheight:" + this.screenHeight);
      console.log("screenwidth:" + this.screenWidth);
      console.log("\tdeltaX = " + deltaX);
      console.log("\tdeltaY = " + deltaY);

      let points = [];

      // iterate through every point
      for (let n = 0; n < numPoints; n++) {
        let k = Math.floor(n / (2 * longRow - 1));
        let j = Math.floor((n - (2 * longRow - 1) * k) / longRow);
        let row = 2 * k + j;

        let variability = 0.4;

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
              deltaX / 2,
            y:
              deltaY * row +
              PointVariability(variability, deltaY, row, index) -
              deltaY / 2,
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
              deltaX / 2,
            y:
              deltaY * row +
              PointVariability(variability, deltaY, row, index) -
              deltaY / 2,
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
      const numPoints = this.points.length;
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

      //console.log(digraph);
    },
    createShortestPath() {
      function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
      }
      let pointA = getRandomInt(0, this.numPoints - 1);
      let pointB = getRandomInt(0, this.numPoints - 1);

      // populate digraph with subarrays (to push edges)
      for (let n = 0; n < this.numPoints; n++) {
        pointIndexInPQ[n] = null;
        distTo[n] = Infinity;
        edgeTo[n] = null;
        minHeapPQ[n] = { point: -1, weight: Infinity };
      }

      findShortestPathDijkstra(pointA, pointB);

      let path = [];

      for (let n = pointB; n != pointA; n = edgeTo[n].from) {
        const x1 = this.points[n].x;
        const y1 = this.points[n].y;
        const x2 = this.points[edgeTo[n].from].x;
        const y2 = this.points[edgeTo[n].from].y;

        path.push({
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2,
        });
      }

      this.pathLines = path;
    },
    addToList: function() {
      this.list.push({ name: this.itemName });
    },
    removeFromList: function(index) {
      this.list.splice(index, 1);
    },
  },
  created: function() {
    const longRow = 19; // Can be even or odd
    const numRows = 19; // MUST BE ODD
    this.getScreenDimensions();
    this.createPoints(longRow, numRows);
    initDigraph(this.numPoints);
    this.createLines(longRow, numRows);

    this.createShortestPath();
    console.log(edgeTo);
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