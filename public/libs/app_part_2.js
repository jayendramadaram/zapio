// default global variables needed to update scene on the fly
let somniumAudio, oceansAudio, effectPass;
let needRender = true;

const globalRotation = { value: 0.001 };

const darkTextureRotation = { value: 0.0006 };
const darkMoveForward = { value: 0.0006 };
const darkOpacity = { value: 0.4 };

const colorFullTextureRotation = { value: 0.0006 };
const colorFullMoveForward = { value: 0.0016 };
const colorFullOpacity = { value: 0.4 };

const waterTextureRotation = { value: 0.004 };
const waterMoveForward = { value: 0.0001 };
const waterOpacity = { value: 0 };

const lightTextureRotation = { value: 0.0006 };
const lightMoveForward = { value: 0.0056 };
const lightOpacity = { value: 0 };

const parallelTextureRotation = { value: 0.0006 };
const parallelMoveForward = { value: 0.0016 };
const parallelOpacity = { value: 0 };

/**
 * Hide the space background and reveal the wormhole
 * The rendering of the scene start here!
 */
async function revealWormhole() {
  return await new Promise((resolve) => {
    setTimeout(() => {
      document.getElementById("base-space").className =
        "background-container fadeOut";

      // start rendering the scene now that we need it
      needRender = true;

      document.getElementById("wormhole").className = "fadeIn";
      resolve();
    }, 3000);
  });
}

/**
 * Make the horizon blink for the horizon event call to action
 * Timeout is synced to music
 */
async function horizonAwakeningEvent() {
  return await new Promise((resolve) => {
    setTimeout(() => {
      const horizonGrowExposureCallToAction = new TWEEN.Tween(
        effectPass.effects[0].godRaysMaterial.uniforms.exposure
      )
        .to({ value: 4 }, 3000)
        .easing(TWEEN.Easing.Cubic.In);

      const horizonReduceExposureCallToAction = new TWEEN.Tween(
        effectPass.effects[0].godRaysMaterial.uniforms.exposure
      )
        .to({ value: 0.8 }, 3000)
        .easing(TWEEN.Easing.Cubic.Out);

      horizonGrowExposureCallToAction
        .start()
        .chain(horizonReduceExposureCallToAction);
      resolve();
    }, 24000);
  });
}

/**
 * Show the call to action for the horizon event
 */
async function revealCallToActionEvent() {
  return await new Promise((resolve) => {
    setTimeout(() => {
      document.getElementById("callToAction").style.display = "block";
      resolve();
    }, 3000);
  });
}

/**
 * Entrypoint of the horizon event
 * Will be trigger by the click on the horizon
 *
 * @param {Object} event event of the click
 */
function prepareLaunchHorizonEvent(event) {
  event.preventDefault();

  document.getElementById("callToAction").remove();

  somniumAudio.fade(1, 0, 1500);
  oceansAudio.volume(0);
  oceansAudio.play();
  oceansAudio.fade(0, 1, 5000);

  const timeToLaunch = 12500;
  const easingHideAndSpeed = TWEEN.Easing.Quintic.In;
  const easingRotation = TWEEN.Easing.Quintic.Out;

  const slowingTextureRotationDark = new TWEEN.Tween(darkTextureRotation)
    .to({ value: 0.0001 }, timeToLaunch)
    .easing(easingRotation);

  const slowingTextureRotationColorFull = new TWEEN.Tween(
    colorFullTextureRotation
  )
    .to({ value: 0.0001 }, timeToLaunch)
    .easing(easingRotation);

  const slowingGlobalRotation = new TWEEN.Tween(globalRotation)
    .to({ value: 0 }, timeToLaunch)
    .easing(easingRotation);

  const reduceBloomEffect = new TWEEN.Tween(bloomEffect.blendMode.opacity)
    .to({ value: 1 }, timeToLaunch)
    .easing(TWEEN.Easing.Elastic.Out);

  const reduceDark = new TWEEN.Tween(darkCylinderMaterial)
    .to({ opacity: 0.1 }, timeToLaunch)
    .easing(easingHideAndSpeed);

  const hideColorFull = new TWEEN.Tween(colorFullCylinderMaterial)
    .to({ opacity: 0 }, timeToLaunch)
    .easing(easingHideAndSpeed);

  const slowingSpeedDark = new TWEEN.Tween(darkMoveForward)
    .to({ value: 0.0001 }, timeToLaunch)
    .easing(easingHideAndSpeed);

  const slowingSpeedColorFull = new TWEEN.Tween(colorFullMoveForward)
    .to({ value: 0.0001 }, timeToLaunch)
    .easing(easingHideAndSpeed);

  // leaving normal space
  reduceBloomEffect.start();
  reduceDark.start();
  hideColorFull.start().onComplete(() => scene.remove(colorFullCylinder));

  // slowing general rotation
  slowingTextureRotationDark.start();
  slowingTextureRotationColorFull.start();
  slowingGlobalRotation.start();

  // slowing general speed
  slowingSpeedDark.start();
  slowingSpeedColorFull.start().onComplete(() => launchHorizonEvent());
}

/**
 * Horizon event
 * Water + Dark cylinder
 */
function launchHorizonEvent() {
  darkTextureRotation.value = 0.004;

  const showDark = new TWEEN.Tween(darkCylinderMaterial)
    .to({ opacity: 1 }, 500)
    .easing(TWEEN.Easing.Circular.Out);

  const showWater = new TWEEN.Tween(waterCylinderMaterial)
    .to({ opacity: 0.3 }, 500)
    .easing(TWEEN.Easing.Circular.Out);

  const speedUpDark = new TWEEN.Tween(darkMoveForward)
    .to({ value: 0.0086 }, 2000)
    .easing(TWEEN.Easing.Elastic.Out);

  const speedUpWater = new TWEEN.Tween(waterMoveForward)
    .to({ value: 0.0156 }, 2000)
    .easing(TWEEN.Easing.Elastic.Out);

  const horizonExposure = new TWEEN.Tween(
    effectPass.effects[0].godRaysMaterial.uniforms.exposure
  )
    .to({ value: 45 }, 35000)
    .easing(TWEEN.Easing.Circular.In);

  // huge speed at launch
  speedUpDark.start();
  speedUpWater.start();

  // show hyperspace
  scene.add(waterCylinder);
  showWater.start();
  showDark.start().onComplete(() => secondPhaseHorizonEvent());

  // launch long exposure from horizon
  // because of the huge timeout this will be trigger after all the horizon phase event
  horizonExposure.start().onComplete(() => enterParallelUniverse());
}

/**
 * Second phase Horizon event
 * Water cylinder
 */
async function secondPhaseHorizonEvent() {
  await new Promise((resolve) => setTimeout(resolve, 6000));

  const hideDark = new TWEEN.Tween(darkCylinderMaterial)
    .to({ opacity: 0 }, 3000)
    .easing(TWEEN.Easing.Circular.Out);

  hideDark.start().onComplete(() => {
    scene.remove(darkCylinder);
    thirdPhaseHorizonEvent();
  });
}

/**
 * Third phase Horizon event
 * Water + light cylinder
 */
async function thirdPhaseHorizonEvent() {
  const showLight = new TWEEN.Tween(lightCylinderMaterial)
    .to({ opacity: 1 }, 3000)
    .easing(TWEEN.Easing.Sinusoidal.In);

  const speedUpRotation = new TWEEN.Tween(globalRotation)
    .to({ value: 0.03 }, 3000)
    .easing(TWEEN.Easing.Sinusoidal.In);

  scene.add(lightCylinder);
  showLight.start();
  speedUpRotation.start();
}

/**
 * entering the parallel universe
 * no cylinder
 */
async function enterParallelUniverse() {
  // workaround firefox bug on godrays fadeout
  document.getElementById("whitewall").style.zIndex = "9999";
  document.getElementById("whitewall").style.visibility = "visible";
  document.getElementById("wormhole").className = "fadeOut";
  scene.remove(waterCylinder);
  scene.remove(lightCylinder);
  scene.remove(light);

  const lightLight = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(lightLight);
  const blueLight = new THREE.AmbientLight(0x000080, 0.5);
  scene.add(blueLight);

  await new Promise((resolve) => setTimeout(resolve, 3000));

  needRender = false;

  document.getElementById("whitewall").className = "fadeOut";
  await new Promise((resolve) => setTimeout(resolve, 9000));
  document.getElementById("whitewall").remove();

  scene.remove(horizon);
  horizonMaterial.opacity = 0;

  needRender = true;
  document.getElementById("wormhole").className = "fadeIn";

  showTeasingParalelUniverse();
}

/**
 * Show teasing for the parallel universe
 * dark + parallel cylinder
 */
async function showTeasingParalelUniverse() {
  globalRotation.value = 0.001;

  darkTextureRotation.value = -0.0004;
  darkMoveForward.value = 0.0004;

  parallelTextureRotation.value = -0.0002;
  parallelMoveForward.value = 0.0014;

  const showDark = new TWEEN.Tween(darkCylinderMaterial)
    .to({ opacity: 1 }, 10000)
    .easing(TWEEN.Easing.Quadratic.In);

  const showParallel = new TWEEN.Tween(parallelCylinderMaterial)
    .to({ opacity: 1 }, 10000)
    .easing(TWEEN.Easing.Quadratic.In);

  scene.add(darkCylinder);
  showDark.start();

  scene.add(parallelCylinder);
  showParallel.start().onComplete(async () => showCredits());
}

/**
 * Show credits
 */
async function showCredits() {
  await new Promise((resolve) => {
    setTimeout(() => {
      document.getElementById("outro").style.visibility = "visible";
      document.getElementById("outro").style.zIndex = "9999";
      document.getElementById("outro").className = "fadeIn";
      resolve();
    }, 4500);
  });
}

// THREE.js part
const scene = new THREE.Scene();
window.scene = scene;

const renderer = new THREE.WebGLRenderer({
  powerPreference: "high-performance",
  antialias: false,
  stencil: false,
  depth: false,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 0);
renderer.domElement.id = "wormhole";
//renderer.domElement.className = 'fadeOut'

document.body.appendChild(renderer.domElement);
const para = document.createElement("p");
const node = document.createTextNode("This is a paragraph.");

document.body.style.height = "100vh";
document.body.style.width = "100vw";
document.body.style.overflow = "hidden";
para.appendChild(node);
document.body.appendChild(para);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.x = 0;
camera.position.y = 10;
camera.position.z = 0;
camera.lookAt(0, 0, 0);

const commonCylinderGeometry = new THREE.CylinderGeometry(
  1,
  1,
  20,
  12,
  0,
  true
);

// dark space full of stars - background cylinder
const darkCylinderTexture = new THREE.TextureLoader().load("/images/dark.jpg");
darkCylinderTexture.wrapS = THREE.RepeatWrapping;
darkCylinderTexture.wrapT = THREE.MirroredRepeatWrapping;
darkCylinderTexture.repeat.set(1, 1);
const darkCylinderMaterial = new THREE.MeshLambertMaterial({
  side: THREE.BackSide,
  map: darkCylinderTexture,
  blending: THREE.AdditiveBlending,
  opacity: darkOpacity.value,
});
const darkCylinder = new THREE.Mesh(
  commonCylinderGeometry,
  darkCylinderMaterial
);

// colourfull space full of nebulas - main universe cylinder
const colorFullCylinderTexture = new THREE.TextureLoader().load(
  "/images/colorfull.jpg"
);
colorFullCylinderTexture.wrapS = THREE.RepeatWrapping;
colorFullCylinderTexture.wrapT = THREE.MirroredRepeatWrapping;
colorFullCylinderTexture.repeat.set(1, 1);
const colorFullCylinderMaterial = new THREE.MeshBasicMaterial({
  side: THREE.BackSide,
  map: colorFullCylinderTexture,
  blending: THREE.AdditiveBlending,
  opacity: colorFullOpacity.value,
});
const colorFullCylinder = new THREE.Mesh(
  commonCylinderGeometry,
  colorFullCylinderMaterial
);

// water - hyperspace cylinder
const waterCylinderTexture = new THREE.TextureLoader().load(
  "/images/water.jpg"
);
waterCylinderTexture.wrapS = THREE.RepeatWrapping;
waterCylinderTexture.wrapT = THREE.MirroredRepeatWrapping;
waterCylinderTexture.repeat.set(1, 1);
const waterCylinderMaterial = new THREE.MeshBasicMaterial({
  side: THREE.BackSide,
  map: waterCylinderTexture,
  blending: THREE.AdditiveBlending,
  opacity: waterOpacity.value,
});
const waterCylinder = new THREE.Mesh(
  commonCylinderGeometry,
  waterCylinderMaterial
);

// light cylinder - near horizon cylinder
const lightCylinderTexture = new THREE.TextureLoader().load(
  "/images/light.jpg"
);
lightCylinderTexture.wrapS = THREE.RepeatWrapping;
lightCylinderTexture.wrapT = THREE.MirroredRepeatWrapping;
lightCylinderTexture.repeat.set(1, 1);
const lightCylinderMaterial = new THREE.MeshBasicMaterial({
  side: THREE.BackSide,
  map: lightCylinderTexture,
  blending: THREE.AdditiveBlending,
  opacity: lightOpacity.value,
});
const lightCylinder = new THREE.Mesh(
  commonCylinderGeometry,
  lightCylinderMaterial
);

// parallel cylinder - parallel universe cylinder
const parallelCylinderTexture = new THREE.TextureLoader().load(
  "/images/parallel.jpg"
);
parallelCylinderTexture.wrapS = THREE.RepeatWrapping;
parallelCylinderTexture.wrapT = THREE.MirroredRepeatWrapping;
parallelCylinderTexture.repeat.set(1, 1);
const parallelCylinderMaterial = new THREE.MeshLambertMaterial({
  side: THREE.BackSide,
  map: parallelCylinderTexture,
  blending: THREE.AdditiveBlending,
  opacity: parallelOpacity.value,
});
const parallelCylinder = new THREE.Mesh(
  commonCylinderGeometry,
  parallelCylinderMaterial
);

const light = new THREE.AmbientLight(0xffffff, 1);
// const image = new Image();
// image.src = "/images/Image.png";
// var imageMesh;
// const texture = new THREE.Texture(image);
// texture.needsUpdate = true;

// // Create a material using the texture
// const material = new THREE.MeshBasicMaterial({ map: texture });

// // Create a geometry for the image
// const geometry = new THREE.PlaneGeometry(1, 1);

// imageMesh = new THREE.Mesh(geometry, material);

// Set the initial position of the image
// imageMesh.position.set(0, 0, 0);
const Imagepoly = new THREE.TextureLoader().load("/images/parallel.jpg");
Imagepoly.wrapS = THREE.RepeatWrapping;
Imagepoly.wrapT = THREE.MirroredRepeatWrapping;
Imagepoly.repeat.set(1, 1);
const ImagepolyMat = new THREE.MeshLambertMaterial({
  side: THREE.BackSide,
  map: Imagepoly,
  blending: THREE.AdditiveBlending,
  opacity: parallelOpacity.value,
});
const ImageCyl = new THREE.Mesh(commonCylinderGeometry, ImagepolyMat);
// Add the image to the scene
// console.log(ImageCyl, "prr");
// scene.add(ImageCyl);
scene.add(darkCylinder);
scene.add(colorFullCylinder);
scene.add(light);

// handling horizon => this will be highly animated by godrays effect at post processing
const horizonMaterial = new THREE.MeshBasicMaterial({ opacity: 1 });
const horizonGeometry = new THREE.SphereBufferGeometry(0.25, 32, 32);
const horizon = new THREE.Mesh(horizonGeometry, horizonMaterial);
horizon.frustumCulled = false;
horizon.matrixAutoUpdate = false;
scene.add(horizon);

// handling post processing process
// godrays and bloom effects are added to the renderer
const godRaysEffectOptions = {
  height: 480,
  blendFunction: POSTPROCESSING.BlendFunction.ADD,
  color: 0x000000,
  kernelSize: POSTPROCESSING.KernelSize.SMALL,
  density: 1.2,
  decay: 0.92,
  weight: 1,
  exposure: 0.8,
  samples: 60,
  clampMax: 1.0,
};
const godRaysEffect = new POSTPROCESSING.GodRaysEffect(
  camera,
  horizon,
  godRaysEffectOptions
);
const bloomEffect = new POSTPROCESSING.BloomEffect({
  blendFunction: POSTPROCESSING.BlendFunction.ADD,
  kernelSize: POSTPROCESSING.KernelSize.SMALL,
});
bloomEffect.blendMode.opacity.value = 4;

// using a global variable because effects will be highly animated during the experience
effectPass = new POSTPROCESSING.EffectPass(camera, bloomEffect, godRaysEffect);
effectPass.renderToScreen = true;

const composer = new POSTPROCESSING.EffectComposer(renderer);
composer.addPass(new POSTPROCESSING.RenderPass(scene, camera));
composer.addPass(effectPass);

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  composer.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
});

function animate(time) {
  if (needRender) {
    TWEEN.update(time);
    // console.log(imageMesh);
    // imageMesh.position.y += 0.001;

    darkCylinder.rotation.y += globalRotation.value;
    darkCylinderTexture.offset.y -= darkMoveForward.value;
    darkCylinderTexture.offset.x -= darkTextureRotation.value;

    colorFullCylinder.rotation.y += globalRotation.value;
    colorFullCylinderTexture.offset.y -= colorFullMoveForward.value;
    colorFullCylinderTexture.offset.x -= colorFullTextureRotation.value;

    composer.render();
  }
  requestAnimationFrame(animate);
}
// Create an array of image URLs
const imageURLs = [
  "https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/DPYBKVZG55EWFHIK2TVT3HTH7Y.png",
  "images\\bitcoin.png",
  "images\\cosmos.png",
  "images\\avax.png",
  "images\\near.png",
  "images\\ipfs.png",
];

// Get the center of the screen
const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2;

let angle = 0;
const increment = 360 / imageURLs.length;

// Iterate over the image URLs
for (let i = 0; i < imageURLs.length; i++) {
  // Create an image element
  const image = document.createElement("img");

  // Set the source of the image
  image.src = imageURLs[i];

  // Calculate the new position of the image
  const x = centerX + Math.cos(angle * (Math.PI / 180)) * 1600;
  const y = centerY + Math.sin(angle * (Math.PI / 180)) * 1600;
  console.log(
    Math.cos(angle * (Math.PI / 180)),
    Math.sin(angle * (Math.PI / 180))
  );

  image.style.position = "absolute";
  image.style.zIndex = 999;

  // Set the top and left properties to center the image over the divs
  image.style.height = "600px";
  image.style.width = "600px";

  image.style.top = y + "px";
  image.style.left = x + "px";
  image.style.visibility = "visible";
  image.style.transition = "all 2s ease";
  // Append the image to the body of the HTML document
  document.body.appendChild(image);

  // Set the new position of the image using the `style` property
  setTimeout(() => {
    image.style.transform =
      "perspective(1000px) rotateX(39deg) rotateY(357deg) scale3d(1.1, 1.1, 1.1)";
    image.style.top = `${centerY}px`;
    image.style.left = `${centerX}px`;
    image.style.height = "2px";
    image.style.width = "2px";
    image.style.visibility = "hidden";
    console.log("yoooo");
  }, i * 500); // 1000ms = 1s

  angle += 75;
}

animate();
