history.pushState(null, null, 'SeungHo_game')

import { Bodies, Body, Collision, Engine, Events, Render, Runner, World } from "matter-js"; //matter-js의 기본 엔진 임포트
import { FRUITS } from "./fruits";

const engine = Engine.create(); //엔진  스타트
const render = Render.create({  
  engine,
  element: document.body, //document.body 안에 그릴 것이다
  options: {
    wireframes: false, //true시 물리엔진 눈으로 볼 수 있음
    background: "#F7F4C8", //배경색
    width: 620, //너비
    height: 850, //높이
  }
});//엔진을 그릴 렌더링 스타트

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, { //x,y,너비,높이
  isStatic: true,
  render: { fillStyle: "#E6B143" } //렌더색
})

const rightWall = Bodies.rectangle(605, 395, 30, 790, { //x,y,너비,높이
  isStatic: true,
  render: { fillStyle: "#E6B143" } //렌더색
})

const ground = Bodies.rectangle(310, 820, 620, 60, { //x,y,너비,높이
  isStatic: true,
  render: { fillStyle: "#E6B143" } //렌더색
})

const topLine = Bodies.rectangle(310, 150, 620, 2, {
  name: "topLine",
  isStatic: true,
  isSensor: true, //부딪히지 않고 감지만 한다
  render: { fillStyle: "#E6B143" }
})

World.add(world, [leftWall, rightWall,ground,topLine]);

Render.run(render); //렌더 실행
Runner.run(engine); //엔진 실행

// ... (기존 코드)

let currentBody = null; // 전역 변수 설정
let currentFruit = null; // 전역 변수 설정
let disableAction = false;
let interval = null;

function addFruit() { // 과일 함수
  const index = Math.floor(Math.random() * 5); // 랜덤으로 나오게끔
  const fruit = FRUITS[index]; // 인덱스로 가져옴

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index, // 과일에 인덱스 저장
    isSleeping: true, // 처음 고정
    render: {
      sprite: { texture: `${fruit.name}.png` } // png 이름으로 렌더링
    },
    restitution: 0.2,
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);
}

window.onkeydown = (event) => {
  if (disableAction) {
    return; //disable이 막혀있다면 실행 중지
  }

  switch (event.code) {
    case "KeyA": // 왼쪽키
      if (interval)
        return;

      interval = setInterval(()=> {
        if (currentBody.position.x - currentFruit.radius > 30) //벽 밖으로 못나가게끔
        Body.setPosition(currentBody, {
          x: currentBody.position.x - 1,
          y: currentBody.position.y,
        });
      }), 5;
 
      break;
    case "KeyD": // 오른쪽키
     if (interval)
        return;

      interval = setInterval(()=> {
        if (currentBody.position.x + currentFruit.radius < 590) //벽 밖으로 못나가게끔
        Body.setPosition(currentBody, {
          x: currentBody.position.x + 1,
          y: currentBody.position.y,
        });
      }), 5;
 
      break;
    case "KeyS": // 아래쪽키 또는 필요한 동작
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000) //일정 시간 뒤에 코드 실행
      break;
  }
}

window.onkeyup = (event) => {
  switch (event.code) {
    case "KeyA":
    case "KeyD":
      clearInterval(interval);
      interval = null;
  }
}

//충돌판정
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if (collision.bodyA.index === collision.bodyB.index)//똑같은 과일이라면\
    {
      const index = collision.bodyA.index;
      if (index === FRUITS.length - 1) //맨 마지막 거 안 겹치게 만드는 거임
      {
        return;
      }

      World.remove(world, [collision.bodyA, collision.bodyB]);//없어짐
      
      const newFruit = FRUITS[index + 1];

      const newBody = Bodies.circle ( //충돌이 시작될 때 이벤트
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render: { 
            sprite: { texture: `${newFruit.name}.png` }
          },
          index: index +1,
        }
      );

      World.add(world, newBody);
    }

    if (
      !disableAction && //disa~가 아닐 때만 검사
      (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine"))
    {
      alert("형아 게임오버예여!!");
    }
  });
});

addFruit();
