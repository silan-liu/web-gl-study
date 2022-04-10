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
    let image = new Image();

    image.src = "1.jpg"
    image.onload = function() {
        render(image);
    }
}

function render(image) {
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
    let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    let texcoordLocation = gl.getAttribLocation(program, "a_textureCoord");

    // 创建 buffer
    let positionBuffer = gl.createBuffer();

    // 将 gl.ARRAY_BUFFER 与 positionBuffer 绑定起来，也就是说 gl.ARRAY_BUFFER 就表示 positionBuffer。
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    setRectangle(gl, 0, 0, image.width / 4, image.height / 4);

    // // texture buffer
    let texcoordBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0
    ]), gl.STATIC_DRAW);

    // create texture
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // get uniform location
    let resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    let textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
    let kernelLocation = gl.getUniformLocation(program, "u_kernel[0]");
    let kernelWeightLocation = gl.getUniformLocation(program, "u_kernelWeight");

    const edgeDetectKernel = [
        -1, -1, -1,
        -1, 8, -1,
        -1, -1, -1
    ]

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

    // 打开属性
    gl.enableVertexAttribArray(positionAttributeLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // 告知 attribute，如何从 buffer 中拿数据
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // texCoord attribute
    gl.enableVertexAttribArray(texcoordLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    // set uniforms
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform2f(textureSizeLocation, image.width, image.height);
    gl.uniform1fv(kernelLocation, edgeDetectKernel);
    gl.uniform1f(kernelWeightLocation, computeKernelWeight(edgeDetectKernel))

    // 三角形
    const primitiveType = gl.TRIANGLES;

    // 画一个三角形
    gl.drawArrays(primitiveType, 0, 6);
}

function computeKernelWeight(kernel) {
    const weight = kernel.reduce(function(prev, curr) {
        return prev + curr;
    })

    return weight <= 0 ? 1 : weight;
}

function setRectangle(gl, x, y, width, height) {
    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2
    ]), gl.STATIC_DRAW);
}

main()