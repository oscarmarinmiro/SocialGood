var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {}  , 'comm': {}};


tdviz.viz.mapViz = function(options)
{

    // Object

    var self = {};

    // Get options data

    for (key in options){
        self[key] = options[key];
    }

    self.init = function(){

        console.log("Viz init V3...");

        // LEAFLET
        //var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/'+self.apiKey+'/'+self.mapStyle+'/256/{z}/{x}/{y}.png';

        // MAPBOX

//        var cloudmadeUrl = 'http://a.tiles.mapbox.com/v3/oscarmarinmiro.map-aqc5224r/{z}/{x}/{y}.png';
//
//		var cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: self.maxZoom, attribution: self.attributionText});

        //toner-lite: STAMEN

        // http://maps.stamen.com/test/leaflet.html
        // http://maps.stamen.com/

        var cloudmade = new L.StamenTileLayer("toner-lite");

        self.map = new L.Map(self.idName, {
            center: new L.LatLng(self.initLatLng[0],self.initLatLng[1]),
            zoom: self.initZoom,
            layers: [cloudmade]
        });


        self.map._initPathRoot();

        console.log("Mapa inicializado...");

        // Resolution var init



        self.updateResolution();


        // svg init

        self.svg = d3.select("#"+self.idName).select("svg");

        // hide on zoom attribute

        if(self.hideOnZoom)
        {
    	    self.g = self.svg.append("g").attr("class", "leaflet-zoom-hide").on("mousemove",self.mousemove);
        }
        else
        {
            self.g = self.svg.append("g").on("mousemove", self.mousemove);
        }

        self.svg = self.g;

        self.tooltip = d3.select("body").append("div")
        .attr("id","tooltip")
        .html("")
        .attr("class", "tooltip")
        .style("opacity", 0);

        // GeoJson polygon paths

        self.path = d3.geo.path().projection(self.project);

        // GeoJSON line paths [straight arcs]

        self.line = d3.svg.line()
            .interpolate("linear")
            .x(function(d) { return self.project(d)[0];})
            .y(function(d) { return self.project(d)[1];});

        // New functionality in v2 ==> layer management

        // Object containing all layer names and reference to its svg

        self.layers = {};

        // Object containing geoData (polygons, points and paths) for every layer

        self.geoData = {};


        self.map.on("viewreset", self.updateMapMove);

    }

   // create a layer

    self.addLayer = function(layerName)
    {
        self.layers[layerName] = self.svg.append("g").attr("layerName",layerName);
        self.geoData[layerName] = {};


        self.geoData[layerName].geoPoints = [];
        self.geoData[layerName].geoPolygons = [];
        self.geoData[layerName].geoPaths = [];

        console.log("LAYERS");

        console.log(self.layers);
    }

    self.layerAttr = function(layerName, attrName, attrValue)
    {
        self.layers[layerName].attr(attrName,attrValue);
    }

    self.emptyLayer = function(layerName)
    {

        // TODO: This is the fastest way, but find a better way...

        self.layers[layerName].remove();

        self.addLayer(layerName);
    }

   // Pass layer

    self.render = function(mapData,layerName)
    {
        console.log("Viz render with data...");
//        console.log(mapData);

        self.geoData[layerName].geoPoints.length = 0;
        self.geoData[layerName].geoPolygons.length = 0;
        self.geoData[layerName].geoPaths.length = 0;

        mapData.features.forEach(function(d) {
            if(d.geometry.type=="Point")
            {
                self.geoData[layerName].geoPoints.push(d);
            }
            if(d.geometry.type=="Polygon" || d.geometry.type=="MultiPolygon")
            {
                self.geoData[layerName].geoPolygons.push(d);
            }

            if(d.geometry.type=="LineString")
            {
                self.geoData[layerName].geoPaths.push(d);
            }

        });


        self.updateResolution();

        // Polygons


        var mapPolygons = self.layers[layerName].selectAll(".polygons")
                          .data(self.geoData[layerName].geoPolygons,function(d,i){return d.id});

        mapPolygons.call(self.polygonUpdate,layerName);

        var mapPolygonsEnter = mapPolygons.enter().insert("path",".paths").attr("class","polygons").on("mouseover",function(d,i){self.polygonOver(d,i);}).on("mouseout",function(d,i){self.polygonOut(d,i);}).on("click", function(d,i){ var domElement = this; self.polygonClick(d,i,domElement);}).call(self.polygonEnter,layerName);

        var mapPolygonsExit = mapPolygons.exit().call(self.polygonExit,layerName);

        // Paths

        var mapPaths = self.layers[layerName].selectAll(".paths")
                        .data(self.geoData[layerName].geoPaths,function(d,i){return d.properties.source+" "+ d.properties.target});

        mapPaths.call(self.pathUpdate,layerName);

        var mapPathsEnter = mapPaths.enter().insert("path",".points").attr("class","paths").on("mouseover",function(d,i){self.pathOver(d,i);}).on("mouseout",function(d,i){self.pathOut(d,i);}).call(self.pathEnter,layerName);

        var mapPathsExit = mapPaths.exit().call(self.pathExit,layerName);

        // Points

        var mapPoints = self.layers[layerName].selectAll(".points")
                        .data(self.geoData[layerName].geoPoints,function(d,i){return d.id});

        mapPoints.call(self.pointUpdate,layerName);

        var mapPointsEnter = mapPoints.enter()
                            .append("circle").attr("class","points").on("mouseover",function(d,i){self.pointOver(d,i);}).on("mouseout",function(d,i){self.pointOut(d,i);})
                            .call(self.pointEnter, layerName);


        var mapPointsExit = mapPoints.exit().call(self.pointExit,layerName);



    }

    self.project = function (x)
    {
              var point = self.map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
              return [point.x, point.y];
    }

    self.updateMapMove = function() {

        self.updateResolution();

        for(var layerName in self.layers)
        {

            var mapPolygons = self.layers[layerName].selectAll(".polygons")
                            .data(self.geoData[layerName].geoPolygons,function(d,i){return d.id});

            var mapPaths = self.layers[layerName].selectAll(".paths")
                            .data(self.geoData[layerName].geoPaths,function(d,i){return d.properties.source+" "+ d.properties.target});

            var mapPoints = self.layers[layerName].selectAll(".points")
                            .data(self.geoData[layerName].geoPoints,function(d,i){return d.id});

            mapPoints.call(self.pointMapMove,layerName);

            mapPolygons.call(self.polygonMapMove,layerName);

            mapPaths.call(self.pathMapMove,layerName);
        }
    }

    self.updateValues = function(layersVector)
    {
        self.updateResolution();

//        console.log(layersVector);

        for(var layerName in self.layers)
        {
//            console.log(layerName);

            if(layersVector.indexOf(layerName)>-1)
            {
//                console.log("dentro");

                var mapPolygons = self.layers[layerName].selectAll(".polygons")
                                .data(self.geoData[layerName].geoPolygons,function(d,i){return d.id});

                var mapPaths = self.layers[layerName].selectAll(".paths")
                                .data(self.geoData[layerName].geoPaths,function(d,i){return d.properties.source+" "+ d.properties.target});

                var mapPoints = self.layers[layerName].selectAll(".points")
                                .data(self.geoData[layerName].geoPoints,function(d,i){return d.id});

                mapPoints.call(self.pointUpdate, layerName);

                mapPolygons.call(self.polygonUpdate, layerName);

                mapPaths.call(self.pathUpdate, layerName);
            }

        }

    }

    self.mousemove = function()
    {
        self.tooltip
        .style("left", (d3.event.pageX +20) + "px")
        .style("top", (d3.event.pageY - 12) + "px");
    }

    self.updateResolution = function()
    {
        // http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
        // pixel / meters

        self.resolution = Math.pow(2,self.map.getZoom())/156543.034 ;
    }

    // Calculate screen pixels based on meter length and latitude

    self.getRealPixels = function(meters,latitude)
    {
        return meters*self.resolution / Math.abs(Math.cos(latitude));
    }

    // Tweaked from http://bl.ocks.org/mbostock/3916621

    self.pathTween = function(precision) {
            return function() {
                var path0 = this,
                    path1 = path0.cloneNode(),
                    d1 = path0.cloneNode().getAttribute("dfinal"),
                    n0 = path0.getTotalLength(),
                    n1 = (path1.setAttribute("d", d1), path1).getTotalLength();

                    console.log(this.cloneNode().getAttribute("dfinal"));


                // Uniform sampling of distance based on specified precision.
                var distances = [0], i = 0, dt = precision / Math.max(n0, n1);
                while ((i += dt) < 1) distances.push(i);
                distances.push(1);

                // Compute point-interpolators at each distance.
                var points = distances.map(function(t) {
                    var p0 = path0.getPointAtLength(t * n0),
                        p1 = path1.getPointAtLength(t * n1);
                    return d3.interpolate([p0.x, p0.y], [p1.x, p1.y]);
                });

                return function(t) {
                    return t < 1 ? "M" + points.map(function(p) { return p(t); }).join("L") : d1;
                };
            }
        };


    // Main del objeto

    self.init();

    return self;
}
