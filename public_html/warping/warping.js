
var camera;
var renderer;
var scene;
var material;
var animating = false;
function init() {
    var canvas = RENDER_CANVAS;
    var width = RENDER_WIDTH;
    var height = RENDER_HEIGHT;

    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000);

    scene.add(camera);
    camera.position.z = 1;
    renderer.setSize(width, height);

    canvas.append(renderer.domElement);

    vshader_text = $.ajax({
        type: "GET",
        url: "/warping/warping.vert",
        async: false,
        cache: false,
    }).responseText;

    fshader_text = $.ajax({
        type: "GET",
        url: "/warping/warping.frag",
        async: false,
        cache: false,
    }).responseText;

    material = new THREE.ShaderMaterial({
        vertexShader:   vshader_text,
        fragmentShader: fshader_text,
        uniforms: {
            aspect: { type: "f", value: (width / height) },
            scale: { type: "f", value: RENDER_SCALE},
            time: { type: "f", value: 0.0},
            offset: { type: "v2", value: new THREE.Vector2(0, 0)}
        }
    });
    update();
    var plane = new THREE.PlaneGeometry(width, height);

    var mesh = new THREE.Mesh(plane, material);
    scene.add(mesh);
}


function resize() {
    var w = RENDER_WIDTH;
    var h = RENDER_HEIGHT;
    material.uniforms.width = { type: "f", value: w};
    material.uniforms.height = { type: "f", value: h };
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    render();
}

function render() {
    renderer.render(scene, camera);
}

function update() {
    var width = RENDER_WIDTH;
    var height = RENDER_HEIGHT;
    material.uniforms.aspect.value = (width / height);
    material.uniforms.time.value += 0.005;
    render();
    return false;
}

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function( callback ){
              window.setTimeout(callback, 1000 / 10);
            };
})();

function animate() {
    requestAnimFrame(animate);
    update();

    var x0 = parseFloat($("#x0").val());
    if(x0 <= 1.0 && x0 >= 0.0 && animating) {
        var inc = parseFloat($("#anim_speed").val());
        x0 += inc;
        $("#x0").val(x0);
    }
    else if(animating) {
        x0 = x0 >= 1.0 ? 1.0 : 0.0;
        $("#x0").val(x0);
        animating = false;
    }
}

function start_animating() {
    animating = !animating;
    return false;
}
