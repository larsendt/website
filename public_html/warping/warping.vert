uniform float aspect;
uniform float scale;
varying vec2 texcoord;

void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    texcoord = vec2(gl_Position.x * aspect, gl_Position.y) * scale;
}

