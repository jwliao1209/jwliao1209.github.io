class Option {
    constructor(
        vertex=null,
        light=null,
        ambient_light=null,
        shader=null,
        gl=null) {

        this.vertex = vertex;
        this.light = light;
        this.ambient_light = ambient_light;
        this.shader = shader;
        this.gl = gl;
    }

    init(vertex, light, ambient_light, shader, gl) {
        this.vertex = vertex;
        this.light = light;
        this.ambient_light = ambient_light;
        this.shader = shader;
        this.gl = gl;
    }

    updateShading() {
        this.gl.uniform1i(
            this.gl.getUniformLocation(this.shader.program, "mode"),
            document.getElementById("shading").value);
        return;
    }

    updateTranslation() {
        this.vertex.translation_vec = vec3.create([
            document.getElementById("0_transX").value,
            document.getElementById("0_transY").value,
            document.getElementById("0_transZ").value,
        ]);
        return;
    }

    updateRotate() {
        this.vertex.rotate_vec = vec3.create([
            document.getElementById("0_rotateX").value,
            document.getElementById("0_rotateY").value,
            document.getElementById("0_rotateZ").value,
        ]);
        return;
    }

    updateShear() {
        this.vertex.shear_vec = vec3.create([
            document.getElementById("0_shearX").value,
            document.getElementById("0_shearY").value,
            document.getElementById("0_shearZ").value,
        ]);
        return;
    }

    updateLightPosition() {
        this.light.position = vec3.create([
            document.getElementById("0_llocX").value,
            document.getElementById("0_llocY").value,
            document.getElementById("0_llocZ").value,
        ]);
        return;
    }

    updateLightColor() {
        this.light.color = vec3.create([
            document.getElementById("0_lR").value,
            document.getElementById("0_lG").value,
            document.getElementById("0_lB").value,
        ])
        return;        
    }
    updateLightParameter() {
        this.light.color = vec3.create([
            document.getElementById("0_lKd").value,
            document.getElementById("0_lKs").value,
            document.getElementById("0_lCD").value,
        ])
        return;        
    }

    updateAmbientLightKa() {
        this.ambient_light.ka = document.getElementById("am_ka").value;
        return;
    }

    updateAmbientLightColor() {
        this.ambient_light.color = vec3.create([
            document.getElementById("am_lR").value,
            document.getElementById("am_lG").value,
            document.getElementById("am_lB").value,
        ])
        return;        
    }

}
