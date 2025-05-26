let video;
let facemesh;
let handpose;
let facePredictions = [];
let handPredictions = [];

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, () => {});
  facemesh.on('predict', results => {
    facePredictions = results;
  });

  handpose = ml5.handpose(video, () => {});
  handpose.on('predict', results => {
    handPredictions = results;
  });
}

function draw() {
  image(video, 0, 0, width, height);

  if (facePredictions.length > 0) {
    const keypoints = facePredictions[0].scaledMesh;

    // 在第152點和第123點各畫一個紅色圓
    const [x1, y1] = keypoints[152];
    const [x2, y2] = keypoints[123];
    noFill();
    stroke(255, 0, 0);
    strokeWeight(4);
    ellipse(x1, y1, 100, 100);
    ellipse(x2, y2, 100, 100);

    // 偵測手勢並在指定臉部點畫圓
    if (handPredictions.length > 0) {
      const gesture = detectGesture(handPredictions[0]);
      let faceIndex = null;
      let color = [0, 255, 0];

      // debug: 顯示目前偵測到的手勢
      textSize(32);
      fill(255);
      noStroke();
      text(gesture || 'none', 10, 40);

      // 修改圓的位置
      if (gesture === 'scissors') {
        faceIndex = 1;
        color = [0, 255, 255];
      } else if (gesture === 'rock') {
        faceIndex = 9;
        color = [255, 0, 255];
      } else if (gesture === 'paper') {
        faceIndex = 200;
        color = [0, 0, 255];
      }

      if (faceIndex !== null && keypoints[faceIndex]) {
        const [fx, fy] = keypoints[faceIndex];
        // debug: 顯示目前圓的座標
        fill(255);
        noStroke();
        text(`(${Math.round(fx)}, ${Math.round(fy)})`, 10, 80);

        noFill();
        stroke(...color);
        strokeWeight(6);
        ellipse(fx, fy, 60, 60);
      }
    }
  }
}

// 簡單手勢判斷：根據手指張開數量
function detectGesture(hand) {
  // hand.landmarks: 21個點
  // 0:手腕, 4:大拇指, 8:食指, 12:中指, 16:無名指, 20:小指
  const tips = [4, 8, 12, 16, 20];
  let open = 0;
  for (let i = 1; i < tips.length; i++) {
    // 指尖y座標比對應指根y座標小(手指張開)
    if (hand.landmarks[tips[i]][1] < hand.landmarks[tips[i] - 2][1]) {
      open++;
    }
  }
  if (open === 2) return 'scissors'; // 剪刀
  if (open === 0) return 'rock';     // 石頭
  if (open === 4) return 'paper';    // 布
  return null;
}
