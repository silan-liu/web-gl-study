/**
 * 创建着色器
 * @param {*} gl
 * @param {*} type 着色器类型
 * @param {*} source 着色器源码
 * @returns
 */
function createShader(gl, type, source) {
  let shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

/**
 * 创建程序
 * @param {*} gl
 * @param {*} vertexShader 顶点着色器
 * @param {*} fragmentShader 片段着色器
 * @returns
 */
function createProgram(gl, vertexShader, fragmentShader) {
  let program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function main() {
  let canvas = document.getElementById("canvas");
  let gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // 取出着色器的代码
  let vertexShaderSource = document.getElementById("vertex-shader-2d").text;
  let fragmentShaderSource = document.getElementById("fragment-shader-2d").text;

  // 创建着色器
  let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  let fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  // 创建程序
  let program = createProgram(gl, vertexShader, fragmentShader);

  // 取出属性
  let positionAttributeLocation = gl.getAttribLocation(program, "b_position");
  let colorAttributeLocation = gl.getAttribLocation(program, "a_color");

  // 取出 uniform matrix
  let matrixLocation = gl.getUniformLocation(program, "u_matrix");

  // 创建 buffer
  let positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  setGeometry(gl);

  // create color buffer
  let colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

  setColors(gl);

  let translation = [200, 150];
  let angleInRadians = 0;
  let scale = [1, 1];

  drawScene();

  // Setup a ui.
  setupUI();

  function setupUI() {
    // Setup a ui.
    webglLessonsUI.setupSlider("#x", {
      value: translation[0],
      slide: updatePosition(0),
      max: gl.canvas.width,
    });
    webglLessonsUI.setupSlider("#y", {
      value: translation[1],
      slide: updatePosition(1),
      max: gl.canvas.height,
    });
    webglLessonsUI.setupSlider("#angle", { slide: updateAngle, max: 360 });
    webglLessonsUI.setupSlider("#scaleX", {
      value: scale[0],
      slide: updateScale(0),
      min: -5,
      max: 5,
      step: 0.01,
      precision: 2,
    });
    webglLessonsUI.setupSlider("#scaleY", {
      value: scale[1],
      slide: updateScale(1),
      min: -5,
      max: 5,
      step: 0.01,
      precision: 2,
    });
  }

  function updatePosition(index) {
    return function (event, ui) {
      translation[index] = ui.value;
      drawScene();
    };
  }

  function updateAngle(event, ui) {
    let angleInDegress = 360 - ui.value;

    console.log("updateAngle:", angleInDegress);

    angleInRadians = (angleInDegress * Math.PI) / 180;

    drawScene();
  }

  function updateScale(index) {
    return function (event, ui) {
      scale[index] = ui.value;
      drawScene();
    };
  }

  function setGeometry(gl) {
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -150, -100,
        150, -100,
       -150,  100,
        150, -100,
       -150,  100,
        150,  100]),
      gl.STATIC_DRAW
    );
  }

  function setColors(gl) {
    // 固定两个颜色
    const r1 = Math.random();
    const g1 = Math.random();
    const b1 = Math.random();
    const r2 = Math.random();
    const g2 = Math.random();
    const b2 = Math.random();

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        r1, g1, b1, 1,
        r1, g1, b1, 1,
        r1, g1, b1, 1,
        r2, g2, b2, 1,
        r2, g2, b2, 1,
        r2, g2, b2, 1,
      ]),
      gl.STATIC_DRAW
    );
  }

  function configPostionLocationAttr() {
    
    console.log(positionAttributeLocation);

    // 将 gl.ARRAY_BUFFER 与 positionBuffer 绑定起来，也就是说 gl.ARRAY_BUFFER 就表示 positionBuffer。
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // 告诉 webgl，我们接下来会从 buffer 中提供数据给属性
    gl.enableVertexAttribArray(positionAttributeLocation);

    // 一次拿 2 个
    const size = 2;

    // 数据类型是 FLOAT
    const type = gl.FLOAT;

    const normalized = false;

    // 数据间隔
    const stride = 0;

    // 从开头
    const offset = 0;

    // 告知 position attribute，如何从 buffer 中拿数据
    gl.vertexAttribPointer(
      positionAttributeLocation,
      size,
      type,
      normalized,
      stride,
      offset
    );
  }

  function configColorPositionAttr() {
    
    console.log(colorAttributeLocation);

    // 将 gl.ARRAY_BUFFER 与 colorBuffer 绑定起来，也就是说 gl.ARRAY_BUFFER 就表示 colorBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    // 告诉 webgl，我们接下来会从 buffer 中提供数据给属性
    gl.enableVertexAttribArray(colorAttributeLocation);

    // 一次拿 4 个, rgba
    let size = 4;

    // 数据类型是 FLOAT
    const type = gl.FLOAT;

    const normalized = false;

    // 数据间隔
    const stride = 0;

    // 从开头
    const offset = 0;

    // 告知 color attribute，如何从 buffer 中拿数据
    gl.vertexAttribPointer(
      colorAttributeLocation,
      size,
      type,
      normalized,
      stride,
      offset
    );
  }

  function drawScene() {
    // 更新 canvas 大小
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // 设置视口
    // [-1, 1] -> [0, width]
    // [-1, 1] -> [0, height]
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // 清除 canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    configPostionLocationAttr();

    configColorPositionAttr();

    // compute matrix
    let matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);

    matrix = m3.translate(matrix, translation[0], translation[1]);
    matrix = m3.rotate(matrix, angleInRadians);
    matrix = m3.scale(matrix, scale[0], scale[1]);

    // set matrix
    gl.uniformMatrix3fv(matrixLocation, false, matrix);

    // draw 2 triangles
    const primitiveType = gl.TRIANGLES;
    const count = 6;
    const offset = 0;
    gl.drawArrays(primitiveType, offset, count);
  }
}

main();
