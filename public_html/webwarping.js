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

function Warping(canvas, scale) {
    this._canvas = canvas;
    this._width = canvas.width();
    this._height = canvas.height();
    this._scale = scale;
    this._camera = null;
    this._renderer = null;
    this._scene = null;
    this._material = null;
    this._start_time = 0;
    this._frames_this_second = 0;
    this._frame_counter_start = 0;
    this._frame_rate = 0;
    this._running = true;
    
    // shader uniforms
    this._color1 = new THREE.Vector4(1.0, 0.5, 0.0, 1.0);
    this._color2 = new THREE.Vector4(0.0, 0.3, 0.7, 1.0);
    

    this._init = function() {
        this._scene = new THREE.Scene();
        this._renderer = new THREE.WebGLRenderer();
        this._camera = new THREE.OrthographicCamera(this._width / - 2, 
                this._width / 2, this._height / 2, this._height / - 2, 1, 1000);

        this._scene.add(this._camera);
        this._camera.position.z = 1;
        this._renderer.setSize(this._width, this._height);

        this._canvas.append(this._renderer.domElement);

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

        this._material = new THREE.ShaderMaterial({
            vertexShader:   vshader_text,
            fragmentShader: fshader_text,
            uniforms: {
                aspect: { type: "f", value: (this._width / this._height) },
                scale: { type: "f", value: this._scale },
                time: { type: "f", value: 0.0 },
                offset: { type: "v2", value: new THREE.Vector2(0, 0) },
                color1: { type: "v4", value: this._color1 },
                color2: { type: "v4", value: this._color2 },
            }
        });

        var plane = new THREE.PlaneGeometry(this._width, this._height);

        var mesh = new THREE.Mesh(plane, this._material);
        this._scene.add(mesh);
            
        this._start_time = new Date().getTime();
    }

    this.resize = function() {
        this._width = this._canvas.width();
        this._height = this._canvas.height();
        var w = this._width;
        var h = this._height;
        this._material.uniforms.width = { type: "f", value: w };
        this._material.uniforms.height = { type: "f", value: h };
        this._renderer.setSize(w, h);
        this._camera.aspect = w / h;
        this._camera.updateProjectionMatrix();
        this._render();
    }


    this.destroy = function() {
        this._running = false;
        this._canvas.get(0).removeChild(this._renderer.domElement);
    }


    this._render = function() {
        this._frames_this_second += 1;
        var now = new Date().getTime();
        if(new Date().getTime() - this._frame_counter_start >= 1000) {
            this._frame_rate = this._frames_this_second / ((now - this._frame_counter_start) / 1000);
            this._frames_this_second = 0;
            this._frame_counter_start = now;
            $("#fps-counter").html("FPS: " + Number(this._frame_rate).toFixed(1));
        }
        this._renderer.render(this._scene, this._camera);
    }


    this.animate = function() {
        if(!this._running) {
            return;
        }
        this._material.uniforms.aspect.value = (this._width / this._height);
        this._material.uniforms.time.value = ((new Date().getTime()) - this._start_time) / 2000;
        this._render();
        requestAnimFrame(function() {this.animate()}.bind(this));
    }

    this.framerate = function() {
        return this._frame_rate; 
    }

    this._init();
}

