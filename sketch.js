let video;
let facemesh;
let handpose;
let facePredictions = [];
let handPredictions = [];

function setup() {
  createCanvas(windowWidth, windowHeight); // 畫布為整個視窗
  video = createCapture(VIDEO);
  video.size(400, 600); // 設定視訊畫面為 400x600
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
  background(230, 220, 255); // 淡紫色

  // 設定視訊畫面顯示在畫布中央
  const videoW = 400;
  const videoH = 600;
  const videoX = (width - videoW) / 2;
  const videoY = (height - videoH) / 2;
  image(video, videoX, videoY, videoW, videoH);

  if (facePredictions.length > 0) {
    const keypoints = facePredictions[0].scaledMesh;

    // 將臉部點位轉換到畫布上的正確位置
    function mapPoint(pt) {
      return [
        pt[0] / video.width * videoW + videoX,
        pt[1] / video.height * videoH + videoY
      ];
    }

    // 臉頰兩側
    const [lx, ly] = mapPoint(keypoints[234]);
    const [rx, ry] = mapPoint(keypoints[454]);
    fill(255, 0, 0);
    stroke(255, 0, 0);
    strokeWeight(4);
    ellipse(lx, ly, 30, 30);
    ellipse(rx, ry, 30, 30);

    // 偵測手勢並在指定臉部點畫圓
    if (handPredictions.length > 0) {
      const gesture = detectGesture(handPredictions[0]);
      let faceIndex = null;
      let color = [0, 255, 0];

      if (gesture === 'scissors') {
        faceIndex = 10;
        color = [0, 255, 255];
      } else if (gesture === 'rock') {
        faceIndex = 1;
        color = [255, 0, 255];
      } else if (gesture === 'paper') {
        faceIndex = 152;
        color = [0, 0, 255];
      }

      if (faceIndex !== null && keypoints[faceIndex]) {
        const [fx, fy] = mapPoint(keypoints[faceIndex]);
        fill(255);
        noStroke();
        textSize(32);
        text(gesture || 'none', 10, 40);
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

// 讓畫布隨視窗大小變動
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
