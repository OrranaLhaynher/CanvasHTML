// Keep everything in anonymous function, called on window load.
if (window.addEventListener) {
    window.addEventListener(
        "load",
        function () {
            var canvas, context, canvaso, contexto;

            // The active tool instance.
            var tool;
            var tool_default = "lapis";

            function init() {
                // Find the canvas element.
                canvaso = document.getElementById("canvas");
                if (!canvaso) {
                    alert("Error: I cannot find the canvas element!");
                    return;
                }

                if (!canvaso.getContext) {
                    alert("Error: no canvas.getContext!");
                    return;
                }

                // Get the 2D canvas context.
                contexto = canvaso.getContext("2d");
                if (!contexto) {
                    alert("Error: failed to getContext!");
                    return;
                }

                // Add the temporary canvas.
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
                context.strokeStyle = "black";
                context.lineWidth = 10;
                context.lineJoin = context.lineCap = "round";

                // Get the tool select input.
                var tool_select = document.getElementById("dtool");
                if (!tool_select) {
                    alert("Error: failed to get the dtool element!");
                    return;
                }
                tool_select.addEventListener("change", ev_tool_change, false);

                // Activate the default tool.
                if (tools[tool_default]) {
                    tool = new tools[tool_default]();
                    tool_select.value = tool_default;
                }

                // Attach the mousedown, mousemove and mouseup event listeners.
                canvas.addEventListener("mousedown", ev_canvas, false);
                canvas.addEventListener("mousemove", ev_canvas, false);
                canvas.addEventListener("mouseup", ev_canvas, false);
            }

            // The general-purpose event handler. This function just determines the mouse
            // position relative to the canvas element.
            function ev_canvas(ev) {
                if (ev.layerX || ev.layerX == 0) {
                    // Firefox
                    ev._x = ev.layerX;
                    ev._y = ev.layerY;
                } else if (ev.offsetX || ev.offsetX == 0) {
                    // Opera
                    ev._x = ev.offsetX;
                    ev._y = ev.offsetY;
                }

                // Call the event handler of the tool.
                var func = tool[ev.type];
                if (func) {
                    func(ev);
                }
            }

            // The event handler for any changes made to the tool selector.
            function ev_tool_change(ev) {
                if (tools[this.value]) {
                    tool = new tools[this.value]();
                }
            }

            // This function draws the #imageTemp canvas on top of #imageView, after which
            // #imageTemp is cleared. This function is called each time when the user
            // completes a drawing operation.
            function img_update() {
                contexto.drawImage(canvas, 0, 0);
                context.clearRect(0, 0, canvas.width, canvas.height);
            }

            function updateValue() {
                return document.getElementById("polygonSides").value;
              }

            // This object holds the implementation of each drawing tool.
            var tools = {};

            // The drawing pencil.
            tools.lapis = function () {
                var tool = this;
                this.started = false;

                // This is called when you start holding down the mouse button.
                // This starts the pencil drawing.
                this.mousedown = function (ev) {
                    context.beginPath();
                    context.moveTo(ev._x, ev._y);
                    tool.started = true;
                };

                // This function is called every time you move the mouse. Obviously, it only
                // draws if the tool.started state is set to true (when you are holding down
                // the mouse button).
                this.mousemove = function (ev) {
                    if (tool.started) {
                        context.lineTo(ev._x, ev._y);
                        context.stroke();
                    }
                };

                // This is called when you release the mouse button.
                this.mouseup = function (ev) {
                    if (tool.started) {
                        tool.mousemove(ev);
                        tool.started = false;
                        img_update();
                    }
                };
            };

            // The drawing pencil.
            tools.ponto = function () {
                var tool = this;
                this.started = false;

                // This is called when you start holding down the mouse button.
                // This starts the pencil drawing.
                this.mousedown = function (ev) {
                    context.beginPath();
                    context.moveTo(ev._x, ev._y);
                    tool.started = true;
                };

                // This function is called every time you move the mouse. Obviously, it only
                // draws if the tool.started state is set to true (when you are holding down
                // the mouse button).
                this.mousemove = function (ev) {
                    if (tool.started) {
                        context.moveTo(ev._x, ev._y); //move to the start position
                        context.lineTo(ev._x, ev._y); //set the end
                        context.stroke();
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

            // The line tool.
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
                };

                this.mouseup = function (ev) {
                    if (tool.started) {
                        tool.mousemove(ev);
                        tool.started = false;
                        img_update();
                    }
                };
            };

            // The rectangle tool.
            tools.retangulo = function () {
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

                    var x = Math.min(ev._x, tool.x0),
                        y = Math.min(ev._y, tool.y0),
                        w = Math.abs(ev._x - tool.x0),
                        h = Math.abs(ev._y - tool.y0);

                    context.clearRect(0, 0, canvas.width, canvas.height);

                    if (!w || !h) {
                        return;
                    }

                    context.strokeRect(x, y, w, h);
                };

                this.mouseup = function (ev) {
                    if (tool.started) {
                        tool.mousemove(ev);
                        tool.started = false;
                        img_update();
                    }
                };
            };

            // The poligono tool.
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
                    sides = updateValue();

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
                };

                this.mouseup = function (ev) {
                    if (tool.started) {
                        tool.mousemove(ev);
                        tool.started = false;
                        img_update();
                    }
                };
            };

            // The bezier tool.
            tools.bezier = function () {
                var tool = this;
                this.started = false;

                // This is called when you start holding down the mouse button.
                // This starts the pencil drawing.
                this.mousedown = function (ev) {
                    tool.started = true;
                    tool.x0 = ev._x;
                    tool.y0 = ev._y;
                };

                // This function is called every time you move the mouse. Obviously, it only
                // draws if the tool.started state is set to true (when you are holding down
                // the mouse button).
                this.mousemove = function (ev) {
                    if (!tool.started) {
                        return;
                    }

                    var midx1 = canvas.width/4,
                        midy1 = canvas.height/4,
                        midx2 = canvas.width - midx1,
                        midy2 = canvas.height - midy1;

                    context.clearRect(0, 0, canvas.width, canvas.height);

                    context.beginPath();
                    context.moveTo(tool.x0, tool.y0);
			        context.bezierCurveTo(midx1, midy1, midx2, midy2, ev._x, ev._y);
                    context.stroke();
                    context.closePath();
                };

                // This is called when you release the mouse button.
                this.mouseup = function (ev) {
                    if (tool.started) {
                        tool.mousemove(ev);
                        tool.started = false;
                        img_update();
                    }
                };
            };

            // The circulo tool.
            tools.circulo = function () {
                var tool = this;
                this.started = false;

                // This is called when you start holding down the mouse button.
                // This starts the pencil drawing.
                this.mousedown = function (ev) {
                    tool.started = true;
                    tool.x0 = ev._x;
                    tool.y0 = ev._y;
                };

                // This function is called every time you move the mouse. Obviously, it only
                // draws if the tool.started state is set to true (when you are holding down
                // the mouse button).
                this.mousemove = function (ev) {
                    if (!tool.started) {
                        return;
                    }

                    var radius = Math.sqrt(Math.pow((tool.x0 - ev._x), 2) + Math.pow((tool.y0 - ev._y), 2));
                    context.beginPath();
                    context.arc(tool.x0, tool.y0, radius, 0, 2 * Math.PI, false);
                    context.fill();
                };

                // This is called when you release the mouse button.
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
    }
}