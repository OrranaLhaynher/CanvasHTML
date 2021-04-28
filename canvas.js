//import fs from 'fs';
var coords = [];

if (window.addEventListener) {
    window.addEventListener(
        "load",
        function () {
            var canvas, context, canvaso, contexto;

            var tool;
            var tool_default = "lapis";

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

                var lineWidth = document.getElementById("lineWidth"),
                    fillColor = document.getElementById("fillColor"),
                    strokeColor = document.getElementById("strokeColor");

                context = canvas.getContext("2d");
                context.strokeStyle = strokeColor.value;
                context.lineWidth = lineWidth.value;
                context.fillStyle = fillColor.value;
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
                lineWidth.addEventListener("input", changeLineWidth, false);
                fillColor.addEventListener("input", changeFillStyle, false);
                strokeColor.addEventListener("input", changeStrokeStyle, false);
            }

            function changeLineWidth() {
                context.lineWidth = this.value;
                stopPropagation();
            }

            function changeStrokeStyle() {
                context.strokeStyle = this.value;
                stopPropagation();
            }

            function changeFillStyle() {
                context.fillStyle = this.value;
                stopPropagation();
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

            function updateValue() {
                return document.getElementById("polygonSides").value;
            }

            function updateValueBezier() {
                return document.getElementById("bezierLenght").value;
            }

            var tools = {};

            tools.lapis = function () {
                var tool = this;
                this.started = false;

                this.mousedown = function (ev) {
                    context.beginPath();
                    context.moveTo(ev._x, ev._y);
                    tool.started = true;
                };

                this.mousemove = function (ev) {
                    if (tool.started) {
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

            tools.poligono = function () {
                var tool = this,
                    angle = Math.PI / 4;
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
                    var sides = updateValue();

                    var coordinates = [],
                        radius = Math.sqrt(
                            Math.pow(tool.x0 - ev._x, 2) +
                                Math.pow(tool.y0 - ev._y, 2)
                        ),
                        index = 0;

                    for (index = 0; index < sides; index++) {
                        coordinates.push({
                            x: tool.x0 + radius * Math.cos(angle),
                            y: tool.y0 - radius * Math.sin(angle),
                        });
                        angle += (2 * Math.PI) / sides;
                    }

                    context.beginPath();
                    context.moveTo(coordinates[0].x, coordinates[0].y);
                    for (index = 1; index < sides; index++) {
                        context.lineTo(
                            coordinates[index].x,
                            coordinates[index].y
                        );
                    }
                    context.fill();
                    context.closePath();

                    var coordenadas = coordinates.values();
                    for (let letter of coordenadas) {
                        coords.push([letter.x, letter.y]);
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

            tools.bezier = function () {
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

                    var tamanho = updateValueBezier();
                    var midx1 = canvas.width / tamanho,
                        midy1 = canvas.height / tamanho,
                        midx2 = canvas.width - midx1,
                        midy2 = canvas.height - midy1;

                    context.clearRect(0, 0, canvas.width, canvas.height);

                    context.beginPath();
                    context.moveTo(ev._x, ev._y);
                    context.bezierCurveTo(
                        midx1,
                        midy1,
                        midx2,
                        midy2,
                        tool.x0,
                        tool.y0
                    );
                    context.stroke();
                    context.closePath();
                    coords.push([
                        ev._x,
                        ev._y,
                        midx1,
                        midy1,
                        midx2,
                        midy2,
                        tool.x0,
                        tool.y0,
                    ]);
                };

                this.mouseup = function (ev) {
                    if (tool.started) {
                        tool.mousemove(ev);
                        tool.started = false;
                        img_update();
                    }
                };
            };

            tools.circulo = function () {
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

                    var radius = Math.sqrt(
                        Math.pow(tool.x0 - ev._x, 2) +
                            Math.pow(tool.y0 - ev._y, 2)
                    );
                    context.beginPath();
                    context.arc(
                        tool.x0,
                        tool.y0,
                        radius,
                        0,
                        2 * Math.PI,
                        false
                    );

                    context.fill();
                    coords.push([tool.x0, tool.y0]);
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
