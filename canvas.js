var coords = [];

if (window.addEventListener) {
    window.addEventListener(
        "load",
        function () {
            var canvas, context, canvaso, contexto;

            var tool;
            var tool_default = "ponto";

            function init() {
                canvaso = document.getElementById("canvas");
                if (!canvaso) {
                    alert("Error: I cannot find the canvas element!");
                    return;
                }

                if (!canvaso.getContext) {
                    alert("Error: no canvas.getContext!");
                    return;
                }

                contexto = canvaso.getContext("2d");
                if (!contexto) {
                    alert("Error: failed to getContext!");
                    return;
                }

                var container = canvaso.parentNode;
                canvas = document.createElement("canvas");
                if (!canvas) {
                    alert("Error: I cannot create a new canvas element!");
                    return;
                }

                canvas.id = "canvasTemp";
                canvas.width = canvaso.width;
                canvas.height = canvaso.height;
                container.appendChild(canvas);

                context = canvas.getContext("2d");
                context.lineWidth = 10;
                context.lineJoin = context.lineCap = "round";

                var tool_select = document.getElementById("dtool");
                if (!tool_select) {
                    alert("Error: failed to get the dtool element!");
                    return;
                }
                tool_select.addEventListener("change", ev_tool_change, false);

                if (tools[tool_default]) {
                    tool = new tools[tool_default]();
                    tool_select.value = tool_default;
                }

                canvas.addEventListener("mousedown", ev_canvas, false);
                canvas.addEventListener("mousemove", ev_canvas, false);
                canvas.addEventListener("mouseup", ev_canvas, false);
            }

            function ev_canvas(ev) {
                if (ev.layerX || ev.layerX == 0) {
                    ev._x = ev.layerX;
                    ev._y = ev.layerY;
                } else if (ev.offsetX || ev.offsetX == 0) {
                    ev._x = ev.offsetX;
                    ev._y = ev.offsetY;
                }

                var func = tool[ev.type];
                if (func) {
                    func(ev);
                }
            }

            function ev_tool_change(ev) {
                if (tools[this.value]) {
                    tool = new tools[this.value]();
                }
            }

            function img_update() {
                contexto.drawImage(canvas, 0, 0);
                context.clearRect(0, 0, canvas.width, canvas.height);
            }

            var tools = {};

            tools.ponto = function () {
                var tool = this;
                this.started = false;

                this.mousedown = function (ev) {
                    context.beginPath();
                    context.moveTo(ev._x, ev._y);
                    tool.started = true;
                };

                this.mousemove = function (ev) {
                    if (tool.started) {
                        context.moveTo(ev._x, ev._y);
                        context.lineTo(ev._x, ev._y);
                        context.stroke();
                        coords.push([ev._x, ev._y]);
                    }
                };

                this.mouseup = function (ev) {
                    if (tool.started) {
                        tool.mousemove(ev);
                        tool.started = false;
                        img_update();
                    }
                };
            };

            tools.linha = function () {
                var tool = this;
                this.started = false;

                this.mousedown = function (ev) {
                    tool.started = true;
                    tool.x0 = ev._x;
                    tool.y0 = ev._y;
                };

                this.mousemove = function (ev) {
                    if (!tool.started) {
                        return;
                    }

                    context.clearRect(0, 0, canvas.width, canvas.height);

                    context.beginPath();
                    context.moveTo(tool.x0, tool.y0);
                    context.lineTo(ev._x, ev._y);
                    context.stroke();
                    context.closePath();
                    coords.push([tool.x0, tool.y0, ev._x, ev._y]);
                };

                this.mouseup = function (ev) {
                    if (tool.started) {
                        tool.mousemove(ev);
                        tool.started = false;
                        img_update();
                    }
                };
            };

            init();
        },
        false
    );
}

function erase() {
    if (confirm("Deseja limpar o canvas?")) {
        canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        coords = [];
    }
}

function make_base() {
    canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    base_image = new Image();
    base_image.src = 'E0ZmpE-WEAoNY6k.jpg';
    base_image.onload = function(){
        ctx.drawImage(base_image, 0, 0);
    }
}

var imageLoader = document.getElementById('imageLoader');
    imageLoader.addEventListener('change', handleImage, false);
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');


function handleImage(e){
    var reader = new FileReader();
    reader.onload = function(event){
        var img = new Image();
        img.onload = function(){
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img,0,0);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);     
}

function download() {
    var element = document.createElement("a");
    element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(coords)
    );
    element.setAttribute("download", "filename.txt");

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
