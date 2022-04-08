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
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // 创建程序
    let program = createProgram(gl, vertexShader, fragmentShader);

    // 取出属性
    let positionAttributeLocation = gl.getAttribLocation(program, "b_position");

    // 创建 buffer
    let positionBuffer = gl.createBuffer();

    // 将 gl.ARRAY_BUFFER 与 positionBuffer 绑定起来，也就是说 gl.ARRAY_BUFFER 就表示 positionBuffer。
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // // 6 个顶点，像素值，左下角是 (0, 0)
    // let positions = [
    //     0, 0,
    //     80, 20,
    //     10, 30,
    //     10, 30,
    //     80, 20,
    //     80, 30,
    // ];

    // // 把顶点数据放入 buffer
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

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

    // 设置分辨率
    let resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    console.log('canvas size:', gl.canvas.width, gl.canvas.height);

    // 设置颜色
    let colorUniformLocation = gl.getUniformLocation(program, "u_color");

    // 打开属性
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

    // 告知 attribute，如何从 buffer 中拿数据
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalized, stride, offset);

    // draw random rectangles
    drawRandomRectangle(gl, colorUniformLocation);
}

function drawRandomRectangle(gl, colorUniformLocation) {
    for (let i = 0; i < 50; i++) {
        // random rectangles positions
        setRectangle(gl, randomInt(300), randomInt(300),randomInt(300),randomInt(300));

        // random color
        gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

        // draw
        // 三角形
        const primitiveType = gl.TRIANGLES;

        // 执行 6 次顶点着色器，绘制 2 个三角形
        const count = 6;

        gl.drawArrays(primitiveType, 0, count);
    }
}

function randomInt(range) {
    return Math.floor(Math.random() * range);
}

function setRectangle(gl, x, y, width, height) {
    let positions = [
        x, y,
        x, y + height,
        x + width, y,
        x, y + height,
        x + width, y,
        x + width, y + height
    ]

    // 数据写入缓冲区
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
}

main()