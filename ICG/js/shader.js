const vertexShaderText = `
        attribute vec3 aVertexPosition;
        attribute vec3 aFrontColor;
        attribute vec3 aVertexNormal;

        uniform vec3 lightLoc[3];
        uniform vec3 lightColor[3];
        uniform vec3 lightKdKsCD[3];
        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        uniform float Ka;
        uniform vec3 ambient_color;
        uniform int mode;
        uniform float volume;

        varying vec3 vertexColor;
        varying vec3 fragPosition;
        varying vec3 fragNormal;
        varying vec3 shading_mode;
        varying vec3 lightLocations[3];
        varying vec3 lightColors[3];
        varying vec3 lightKdKsCDs[3];
        varying float Ka_val;
        varying vec3 ambient_lightColor;
        varying vec4 fragcolor;


        vec3 computeDiffuse(vec3 lightColor, float Kd, vec3 objectColor, float cosLN){
            return lightColor * Kd * objectColor * max(cosLN, 0.);
        }


        vec3 computeSpecular(vec3 lightColor, float Ks, float cosAplha_n){
            return lightColor * Ks * cosAplha_n;
        }


        vec3 computeColor(vec3 fragPosition, vec3 objectColor, vec3 N, vec3 V, vec3 lightLocation, vec3 lightColor, vec3 lightKdKsCD, vec3 ambientFactor){
            float Kd = lightKdKsCD[0];
            float Ks = lightKdKsCD[1];
            float n = lightKdKsCD[2];

            vec3 L = normalize(lightLocation - fragPosition);
            vec3 H = normalize(L + V);
            float cosLN = dot(L, N);
            float cosAplha_n = pow(max(dot(H, N), 0.), n);  // (cos(alpha))^n

            vec3 ambient = objectColor * ambientFactor;
            vec3 diffuse = computeDiffuse(lightColor, Kd, objectColor, cosLN);
            vec3 specular = computeSpecular(lightColor, Ks, cosAplha_n);

            return ambient + diffuse + specular;
        }


        void main() {
            Ka_val = Ka;
            ambient_lightColor = ambient_color;
            shading_mode = vec3(mode);

            for (int i=0 ; i<3 ; ++i) {
                lightLocations[i] = lightLoc[i];
                lightColors[i] = lightColor[i];
                lightKdKsCDs[i] = lightKdKsCD[i];
            }

            vec3 vertex_copy = aVertexPosition * (1. + volume);
            fragPosition = (uMVMatrix * vec4(vertex_copy, 1.0)).xyz;
            fragNormal = mat3(uMVMatrix) * aVertexNormal;
            vertexColor = aFrontColor;

            if (shading_mode[0] == 1.) {
                float ka = Ka_val;
                vec3 V = -normalize(fragPosition);
                vec3 N = normalize(fragNormal);
                vec3 ambientFactor = ka * ambient_lightColor;
                vec3 color = vec3(0., 0., 0.);

                for (int i=0 ; i<3 ; ++i){
                    color += computeColor(
                        fragPosition,
                        vertexColor, N, V,
                        lightLocations[i], lightColors[i], lightKdKsCDs[i],
                        ambientFactor);
                }                
                fragcolor =  vec4(color, 1.0);
            }
            gl_Position = uPMatrix * uMVMatrix * vec4(vertex_copy, 1.0);
        }
    `;


const fragmentShaderText = `
        #extension GL_OES_standard_derivatives : enable

        precision mediump float;

        varying vec3 shading_mode;
        varying vec3 vertexColor;
        varying vec3 fragPosition;
        varying vec3 fragNormal;
        varying vec3 lightLocations[3];
        varying vec3 lightColors[3];
        varying vec3 lightKdKsCDs[3];
        varying float Ka_val;
        varying vec3 ambient_lightColor;
        varying vec4 fragcolor;


        vec3 computeDiffuse(vec3 lightColor, float Kd, vec3 objectColor, float cosLN){
            return lightColor * Kd * objectColor * max(cosLN, 0.);
        }

        vec3 computeSpecular(vec3 lightColor, float Ks, float cosAplha_n){
            return lightColor * Ks * cosAplha_n;
        }

        vec3 computeColor(vec3 fragPosition, vec3 objectColor, vec3 N, vec3 V, vec3 lightLocation, vec3 lightColor, vec3 lightKdKsCD, vec3 ambientFactor){
            float Kd = lightKdKsCD[0];
            float Ks = lightKdKsCD[1];
            float n = lightKdKsCD[2];

            vec3 L = normalize(lightLocation - fragPosition);
            vec3 H = normalize(L + V);
            float cosLN = dot(L, N);
            float cosAplha_n = pow(max(dot(H, N), 0.), n);  // (cos(alpha))^n

            vec3 ambient = objectColor * ambientFactor;
            vec3 diffuse = computeDiffuse(lightColor, Kd, objectColor, cosLN);
            vec3 specular = computeSpecular(lightColor, Ks, cosAplha_n);

            return ambient + diffuse + specular;
        }


        vec3 getNormalVec(vec3 p) {
            return normalize(cross(dFdx(p), dFdy(p)));
        }


        vec4 gouraudShading() {
            return fragcolor;
        }


        vec4 flatShading() {
            float ka = Ka_val;
            vec3 V = -normalize(fragPosition);
            vec3 N = getNormalVec(fragPosition);

            vec3 color = vec3(0., 0., 0.);
            vec3 specular = vec3(0., 0., 0.);
            vec3 ambientFactor = ka * ambient_lightColor;

            for (int i=0 ; i<3 ; ++i){
                color += computeColor(
                    fragPosition,
                    vertexColor, N, V,
                    lightLocations[i], lightColors[i], lightKdKsCDs[i],
                    ambientFactor);
            }
            return vec4(color, 1.0);
        }


        vec4 phongShading() {
            float ka = Ka_val;
            vec3 V = -normalize(fragPosition);
            vec3 N = normalize(fragNormal);
            vec3 color = vec3(0., 0., 0.);
            vec3 ambientFactor = ka * ambient_lightColor;
            
            for (int i=0 ; i<3 ; ++i){
                color += computeColor(
                    fragPosition,
                    vertexColor, N, V,
                    lightLocations[i], lightColors[i], lightKdKsCDs[i],
                    ambientFactor);
            }
            return vec4(color, 1.0);
        }


        void main() {
            if (shading_mode[0] == 0.)
                gl_FragColor = flatShading();
            else if (shading_mode[0] == 1.)
                gl_FragColor = gouraudShading();
            else if (shading_mode[0] == 2.)
                gl_FragColor = phongShading();
            return;
        }
    `;
