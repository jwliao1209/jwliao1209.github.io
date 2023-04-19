class Entity{
    constructor(id, name, trans_vec, rotate_vec, scale_vec, shear_vec, clip_vec, gl){
        this.id = id;
        this.name = name;

        this.VertexPositionBuffer;
        this.VertexNormalBuffer;
        this.VertexFrontColorBuffer;
        this.vertexTextureCoordBuffer;

        this.translation_vec = trans_vec;
        this.rotate_vec = rotate_vec;
        this.scale_vec = scale_vec;
        this.shear_vec = shear_vec;
        this.clip_vec = clip_vec;

        this.mvMatrix = mat4.create();
        this.pMatrix  = mat4.create();
        this.gl = gl;
    }

    load() {
        var request = new XMLHttpRequest();
        request.open("GET", "./object/" + this.name, true);
        request.onreadystatechange = () => {
            if (request.readyState == 4){
                let jsonObj = JSON.parse(request.responseText);
                let vertexPositions = jsonObj.vertexPositions;
                let vertexBackcolors = jsonObj.vertexBackcolors;
                let vertexFrontcolors = jsonObj.vertexFrontcolors;
                let vertexNormals = jsonObj.vertexNormals;

                this.clip(vertexPositions, vertexBackcolors, vertexFrontcolors, vertexNormals);


                jsonObj.vertexPositions = vertexPositions
                jsonObj.vertexBackcolors = vertexBackcolors
                jsonObj.vertexFrontcolors = vertexFrontcolors
                jsonObj.vertexNormals = vertexNormals

                this.loadVertexInformation(jsonObj);
            }
        };
        request.send();
    }

    loadVertexInformation(objData){
        this.VertexPositionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.VertexPositionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(objData.vertexPositions), this.gl.STATIC_DRAW);
        this.VertexPositionBuffer.itemSize = 3;
        this.VertexPositionBuffer.numItems = objData.vertexPositions.length / 3;

        this.VertexNormalBuffer = gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(objData.vertexNormals), this.gl.STATIC_DRAW);
        this.VertexNormalBuffer.itemSize = 3;
        this.VertexNormalBuffer.numItems = objData.vertexNormals.length / 3;

        this.VertexFrontColorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.VertexFrontColorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(objData.vertexFrontcolors), this.gl.STATIC_DRAW);
        this.VertexFrontColorBuffer.itemSize = 3;
        this.VertexFrontColorBuffer.numItems = objData.vertexFrontcolors.length / 3;
    }

    translation(){
        mat4.translate(this.mvMatrix, this.translation_vec);
    }

    rotation(){
        const [rx, ry, rz] = this.rotate_vec.map(degreesToRadians);
        mat4.rotate(this.mvMatrix, rx, [1, 0, 0]);        
        mat4.rotate(this.mvMatrix, ry, [0, 1, 0]);
        mat4.rotate(this.mvMatrix, rz, [0, 0, 1]);
    }

    scale(){
        mat4.scale(this.mvMatrix, this.scale_vec);
    }

    shear(){
        const [cotx, coty, cotz] = this.shear_vec.map(cot);
        const shearMatrix = mat4.create([
          1, 0, cotz, 0,
          cotx, 1, 0, 0,
          0, coty, 1, 0,
          0, 0, 0, 1
        ]);
        mat4.multiply(this.mvMatrix, shearMatrix);
    }

    clip(vertexPositions, vertexBackcolors, vertexFrontcolors, vertexNormals){
        for (let i = 0; i < vertexPositions.length; ++i){
            if (vertexPositions[i] < this.clip_vec[i % 3]){
                vertexPositions[i - 1] = 0;
                vertexPositions[i] = 0;
                vertexPositions[i + 1] = 0;

                vertexBackcolors[i - 1] = 0;
                vertexBackcolors[i] = 0;
                vertexBackcolors[i + 1] = 0;

                vertexFrontcolors[i - 1] = 0;
                vertexFrontcolors[i] = 0;
                vertexFrontcolors[i + 1] = 0;

                vertexNormals[i - 1] = 0;
                vertexNormals[i] = 0;
                vertexNormals[i + 1] = 0;
            }
        }
        return 
    }
}


class EntityOpt{
    constructor(id, vertex, shader, gl){
        this.id = id;
        this.vertex = vertex;
        this.shader = shader;
        this.gl = gl;
    }

    init(id, vertex, shader, gl) {
        this.id = id;
        this.vertex = vertex;
        this.shader = shader;
        this.gl = gl;
    }

    updateShading(){
        const mode = document.getElementById("shading_" + this.id).value;
        const uniformLocation = this.gl.getUniformLocation(this.shader.program, "mode");
        this.gl.uniform1i(uniformLocation, mode);
    }

    updateTransform(vecName) {
        const x = document.getElementById(vecName + "_X_" + this.id).value;
        const y = document.getElementById(vecName + "_Y_" + this.id).value;
        const z = document.getElementById(vecName + "_Z_" + this.id).value;
        this.vertex[vecName + "_vec"] = vec3.create([x, y, z]);
    }

    updateTranslate(){
        this.updateTransform("translation");
    }

    updateRotate(){
        this.updateTransform("rotate");
    }

    updateShear(){
        this.updateTransform("shear");
    }

    updateScale(){
        this.updateTransform("scale");
    }

    updateClip(){
        this.updateTransform("clip");
        main2();
    }
}


class LightOpt{
    constructor(lightNumber, lightPositions, lightColors, lightKdKsCDs){
        this.number = lightNumber;
        this.positions = lightPositions;
        this.colors = lightColors;
        this.kdkscds = lightKdKsCDs;
    }

    updatePosition(lightId){
        const x = document.getElementById(lightId + "_llocX").value;
        const y = document.getElementById(lightId + "_llocY").value;
        const z = document.getElementById(lightId + "_llocZ").value;
        this.positions.set([x, y, z], lightId * this.number);
    }

    updateColor(lightId){
        const r = document.getElementById(lightId + "_lR").value;
        const g = document.getElementById(lightId + "_lG").value;
        const b = document.getElementById(lightId + "_lB").value;
        this.colors.set([r, g, b], lightId * this.number);
    }

    updateKdKsCD(lightId){
        const kd = document.getElementById(lightId + "_lKd").value;
        const ks = document.getElementById(lightId + "_lKs").value;
        const cd = document.getElementById(lightId + "_lCD").value;
        this.kdkscds.set([kd, ks, cd], lightId * this.number);
    }
}


class AmbientLightOpt{
    constructor(ambientlightColor, ambientlightKa){
        this.color = ambientlightColor.slice();
        this.ka = ambientlightKa;
        this.color_mul_ka = this.color * this.ka;
    }

    updateColor(){
        const r = document.getElementById("am_lR").value;
        const g = document.getElementById("am_lG").value;
        const b = document.getElementById("am_lB").value;
        this.color.set([r, g, b], 0);
        this.updateColorMulKa();
    }

    updateKa(){
        this.ka = document.getElementById("am_ka").value;
        this.updateColorMulKa();
    }

    updateColorMulKa(){
        this.color_mul_ka = this.color * this.ka;
    }

    * getColorMulKa(){
        yield this.color_mul_ka;
    }

    reset(){

    }
}


function degreesToRadians(theta) {
    return theta * Math.PI / 180;
}


function cot(theta) {
    return 1 / Math.tan(degreesToRadians(theta));
}


function reset(){
    if (!document.getElementById("reset").value){
        main();
    }
}
