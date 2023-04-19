var gl;
var canvas;
var shader;

var analyser;
var frequencyData = new Uint8Array();


class Shader {
    constructor(gl) {
        this.gl = gl;
        this.vertexShader;
        this.fragmentShader;
        this.program;
    }

    initShader(shader, glShaderID, shaderText) {
        shader = this.gl.createShader(glShaderID);
        this.gl.shaderSource(shader, shaderText);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert(this.gl.getShaderInfoLog(shader));
            return;
        }
        return shader;
    }

    initVertexShader() {
        return this.initShader(this.vertexShader, this.gl.VERTEX_SHADER, vertexShaderText);
    }

    initFragmentShader() {
        return this.initShader(this.fragmentShader, this.gl.FRAGMENT_SHADER, fragmentShaderText);
    }

    initProgram() {
        this.vertexShader = this.initVertexShader();
        this.fragmentShader = this.initFragmentShader();
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, this.vertexShader);
        this.gl.attachShader(this.program, this.fragmentShader);
        this.gl.linkProgram(this.program);
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
            return;
        }
        return;
    }
}



function initShaders() {
    shader = new Shader(gl);
    shader.initProgram();

    gl.useProgram(shader.program);

    shader.program.vertexPositionAttribute = gl.getAttribLocation(shader.program, "aVertexPosition");
    gl.enableVertexAttribArray(shader.program.vertexPositionAttribute);

    shader.program.vertexFrontColorAttribute = gl.getAttribLocation(shader.program, "aFrontColor");
    gl.enableVertexAttribArray(shader.program.vertexFrontColorAttribute);

    shader.program.vertexNormalAttribute = gl.getAttribLocation(shader.program, "aVertexNormal");
    gl.enableVertexAttribArray(shader.program.vertexNormalAttribute);

    shader.program.pMatrixUniform  = gl.getUniformLocation(shader.program, "uPMatrix");
    shader.program.mvMatrixUniform = gl.getUniformLocation(shader.program, "uMVMatrix");

    gl.uniform1i(gl.getUniformLocation(shader.program, "mode"), renderingMethod);

    gl.uniform3fv(gl.getUniformLocation(shader.program, "lightLoc"), light.positions);
    gl.uniform3fv(gl.getUniformLocation(shader.program, "lightColor"), light.colors);
    gl.uniform3fv(gl.getUniformLocation(shader.program, "lightKdKsCD"), light.kdkscds);

    gl.uniform1f(gl.getUniformLocation(shader.program, "Ka"), ambientlight.ka);
    gl.uniform3fv(gl.getUniformLocation(shader.program, "ambient_color"), ambientlight.color);

    var context = new AudioContext();
    var audio = document.getElementById('myAudio');
    var audioSrc = context.createMediaElementSource(audio);
    var sourceJs = context.createScriptProcessor(2048); 

    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.6;
    analyser.fftSize = 512;

    audioSrc.connect(analyser);
    analyser.connect(sourceJs);
    sourceJs.buffer = audioSrc.buffer;
    sourceJs.connect(context.destination);
    audioSrc.connect(context.destination);

    sourceJs.onaudioprocess = function(e) {
        frequencyData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(frequencyData);
    };
    
    // audio.play();
    gl.uniform1f(gl.getUniformLocation(shader.program, "volume"), 0.);

    return shader;
}


function setMatrixUniforms(obj) {
    gl.uniformMatrix4fv(shader.program.pMatrixUniform, false, obj.pMatrix);
    gl.uniformMatrix4fv(shader.program.mvMatrixUniform, false, obj.mvMatrix);
    return;
}


function drawScene(shader)
{
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(
        ambientlight.ka * ambientlight.color[0],
        ambientlight.ka * ambientlight.color[1],
        ambientlight.ka * ambientlight.color[2],
        transparent
    );
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for(var i=0 ; i<3 ; ++i)
    {
        if (obj_vec[i].VertexPositionBuffer == null ||
            obj_vec[i].VertexNormalBuffer == null ||
            obj_vec[i].VertexFrontColorBuffer == null)
            continue;

        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, obj_vec[i].pMatrix);
        mat4.identity(obj_vec[i].mvMatrix);

        obj_vec[i].translation();
        obj_vec[i].rotation();
        obj_vec[i].scale();
        obj_vec[i].shear();
        setMatrixUniforms(obj_vec[i]);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj_vec[i].VertexPositionBuffer);
        gl.vertexAttribPointer(shader.program.vertexPositionAttribute, obj_vec[i].VertexPositionBuffer.itemSize,  gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj_vec[i].VertexFrontColorBuffer);
        gl.vertexAttribPointer(shader.program.vertexFrontColorAttribute, obj_vec[i].VertexFrontColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj_vec[i].VertexNormalBuffer);
        gl.vertexAttribPointer(shader.program.vertexNormalAttribute, obj_vec[i].VertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.uniform3fv(gl.getUniformLocation(shader.program, "lightLoc"), light.positions);
        gl.uniform3fv(gl.getUniformLocation(shader.program, "lightColor"), light.colors);
        gl.uniform3fv(gl.getUniformLocation(shader.program, "lightKdKsCD"), light.kdkscds);

        gl.uniform1f(gl.getUniformLocation(shader.program, "Ka"), ambientlight.ka);
        gl.uniform3fv(gl.getUniformLocation(shader.program, "ambient_color"), ambientlight.color);

        gl.uniform1f(gl.getUniformLocation(shader.program, "volume"), frequencyData[Math.floor(256 / 7) * i] / 625 );

        if (document.getElementById("shape").value == 0){
            gl.drawArrays(gl.TRIANGLES, 0, obj_vec[i].VertexPositionBuffer.numItems);
        }
        else if (document.getElementById("shape").value == 1){
            gl.drawArrays(gl.LINES, 0, obj_vec[i].VertexPositionBuffer.numItems);
        }        
    }
    return;
}


function tick()
{
    requestAnimFrame(tick);
    drawScene(shader);
    analyser.getByteFrequencyData(frequencyData);
    
    if(rotate_flag)
        rotate_objects();

    if(random_light_flag)
        random_light();

    return;
}


function main2(){
    for(var i = 0 ; i < 3 ; ++i){
        obj_vec[i].load();
    }

    [r_ka, g_ka, b_ka] = ambientlight.getColorMulKa();
    gl.clearColor(r_ka, g_ka, b_ka, transparent);
    gl.enable(gl.DEPTH_TEST);

    for (var i = 0; i < 3; ++i) {
        slideOption[i].init(i, obj_vec[i], shader, gl);
    }
    tick();

    return;
}


function main(){
    canvas = document.getElementById("ICG-canvas");
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (!gl){
        alert("Could not initialise WebGL, sorry :-(");
        return;
    }
    gl.getExtension('OES_standard_derivatives');
    gl.viewportWidth  = canvas.width;
    gl.viewportHeight = canvas.height;

    ambientlight = new AmbientLightOpt(ambientlightColor, ambientlightKa);
    light = new LightOpt(3, lightPosition, lightColors, lightKdKsCD);
    shader = initShaders();
    
    obj_vec = [
        new Entity(Kangaroo.id, Kangaroo.name, Kangaroo.translate, Kangaroo.rotate, Kangaroo.scale, Kangaroo.shear, Kangaroo.clip, gl),
        new Entity(Teapot.id, Teapot.name, Teapot.translate, Teapot.rotate, Teapot.scale, Teapot.shear, Teapot.clip, gl),
        new Entity(CSIE.id, CSIE.name, CSIE.translate, CSIE.rotate, CSIE.scale, CSIE.shear, CSIE.clip, gl),
    ];
    main2();    
}
