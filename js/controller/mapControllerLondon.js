var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {}  , 'comm': {}};


tdviz.controller.mapController = function(options)
{
    // Instance reference

    var self = {};

    // Self <-> Options

    for (key in options){
        self[key] = options[key];
    }

    self.parentSelect = "#"+self.idName;

    // Init de parametros

    self.selectedOrigin = "none";
    self.selectedDestination = "none";
    self.infoTrip = "None calculated";
    self.infoHover = "None";
    self.infoOrigin = "Something";
    self.infoDestination = "Something";

    self.crimeColor = "#070";
    self.pollutionColor = "#007";
    self.footfallColor = "#700";


    self.comboDict = {'Footfall':'foots','Crime':'Crime','Pollution':'Pollution'};
    self.comboColors = {'foots': ["#FFF","#F00"],'Crime':["#FFF","#0F0"],'Pollution':["#FFF","#00F"]};

    self.comboScales = {'foots': d3.scale.linear().range(["#FFF","#F00"]).domain([0,0.1]).clamp(true),
         'Crime':d3.scale.linear().range(["#FFF","#0F0"]).domain([0,0.5]).clamp(true),
         'Pollution':d3.scale.linear().range(["#FFF","#00F"]).domain([0.4,1]).clamp(true)};

    self.barScales = {'foots': d3.scale.linear().range([0,10]).domain([0,0.1]).clamp(true),
         'Crime':d3.scale.linear().range([0,10]).domain([0,0.5]).clamp(true),
         'Pollution':d3.scale.linear().range([0,10]).domain([0.4,1]).clamp(true)};

    self.tripSDistance = 0;

    self.controlValues = {'dimension':"foots", 'direction':"N",'day':'09/12/2012','hour':'0'};


    // Funciones auxiliares

    function myLog(myString, level)
    {

        if ((self.debugLevel!=0)&&(level<=self.debugLevel))
        {
            console.log(myString);
        }
    }

    self.addBoundingBoxes = function(mapData)
    {
        for(var index in mapData.features)
        {
            var myFeature = mapData.features[index];

            myFeature.properties.bbox = d3.geo.bounds(myFeature);

        }
    }

    self.isPointInsideFeature = function(lon,lat,feature)
    {
        if((feature.properties.bbox[0][0]<lon) && (feature.properties.bbox[0][1]<lat) && (feature.properties.bbox[1][0]>lon) && (feature.properties.bbox[1][1]>lat))
        {
            return true;
        }
        else
        {
           return false;
        }
    }

    self.getLSOAIntersect = function(originFeat,destinationFeat,mapData)
    {
        var LSOADict = {};

        var origCentroid = d3.geo.centroid(originFeat);

        var destinationCentroid = d3.geo.centroid(destinationFeat);

        var rayInterpol = d3.geo.interpolate(origCentroid,destinationCentroid);

        for(var i=0;i<1.0;i+=0.01)
        {
            var interPoint = rayInterpol(i);

            console.log(interPoint);

            for(var index in mapData.features)
            {
                var myFeature = mapData.features[index];

                if(self.isPointInsideFeature(interPoint[0],interPoint[1],myFeature))
                {
                    LSOADict[myFeature.id] = true;
                }
            }
        }

        return LSOADict;

    }

    self.renderFile = function(fileName,layer)
        {
            // Pido el fichero de datos

            d3.json(self.baseJUrl+fileName, function(mapData)
            {
                if(mapData!=null)
                {
                   d3.json(self.baseJUrl+self.londonFile,function(londonData)
                   {
                       if(londonData!=null)
                       {
                           self.londonData = londonData.data;
                           self.fileData = mapData;

                           self.addBoundingBoxes(self.fileData);

                           self.mapChart.render(mapData,layer);

                           self.buildInfoBox();

                       }
                       else
                       {
                            myLog("Could not load file: "+self.baseJUrl+self.londonFile,1);
                       }
                   });


                }
                else
                {
                    myLog("Could not load file: "+self.baseJUrl+self.dataFile,1);
                }
            });
        };


    self.getRegionHTML = function(data)
    {
        return "None";
    }

    self.buildInfoBox = function()
    {
       var html = "<div class='infoTitle'>"+"Information"+"</div>";

//       html += "<span class='boxTitle' style='text-align:center;'>(Hover over a cell for more info, click to select)</br></span>";

       html += "<div class='boxTitle'>Origin Data</div>";

       html += "<div class='boxContent'>";

       var infoOrigin;

       if (self.selectedOrigin == "none")
       {
           infoOrigin = "None selected";

       }
       else
       {
           // Call function

           infoOrigin =self.infoOrigin;
       }

       html+=infoOrigin+"</div>";

       html += "<div class='boxTitle'>Destination Data</div>";

       html += "<div class='boxContent'>";

       var infoDestination;

       if (self.selectedDestination == "none")
       {
           infoDestination = "None selected";

       }
       else
       {
           // Call function

           infoDestination =self.infoDestination;
       }

       html+=infoDestination+"</div>";

       html += "<div class='boxTitle'>Trip Data</div><div class='boxContent'>"+self.infoTrip+"</div>";

       html += "<hr><div class='boxTitle'>Hover Data</div><div class='boxContent'>"+self.infoHover+"</div>";

       html += "</br></br>";


       $('#infoBox').html(html);
    };

    self.pointOver = function(d,i){};self.pointOut = function(d,i){};

    self.pathOver = function(d,i){}; self.pathOut = function(d,i){};self.pointMapMove = function(selection){};

    self.pointUpdate = function(selection){};self.pointEnter = function(selection){};self.pointExit = function(selection){};

    self.getAreaHtml = function(d)
    {
        var myHtml = "";

        myHtml += "<strong>LSOA Code</strong> " + d.properties['LSOA11CD'] ;
        myHtml += "<strong>LSOA Name</strong> " + d.properties['LSOA11NM'] +"</br>";
//        myHtml +="<strong>Centroid</strong> " + d3.geo.centroid(d)[0]+","+d3.geo.centroid(d)[1] + "</br>";
        myHtml += '<div style="display: inline-block;width: '+self.barScales['foots'](self.londonData['foots'][d.id][self.controlValues['day']][parseInt(self.controlValues['hour'],10)])*25+'px;height: 5px;background-color: '+self.footfallColor+';"></div>'+"  "+(self.barScales['foots'](self.londonData['foots'][d.id][self.controlValues['day']][parseInt(self.controlValues['hour'],10)])*10).toFixed(2)+"% <strong>Footfall index</strong></br>";
        myHtml += '<div style="display: inline-block;width: '+self.barScales['Crime'](self.londonData['Crime'][d.id])*25+'px;height: 5px;background-color: '+self.crimeColor+';"></div>'+"  "+(self.barScales['Crime'](self.londonData['Crime'][d.id])*10).toFixed(2)+"% <strong>Crime index</strong></br>";
        myHtml += '<div style="display: inline-block;width: '+self.barScales['Pollution'](self.londonData['Pollution'][d.id])*25+'px;height: 5px;background-color: '+self.pollutionColor+';"></div>'+"  "+(self.barScales['Pollution'](self.londonData['Pollution'][d.id])*10).toFixed(2)+"% <strong>Pollution index</strong></br>";

        return myHtml;

    }

    self.polygonOver = function(d,i){


        self.infoHover = self.getAreaHtml(d);

        self.buildInfoBox();

    };

    self.polygonOut = function(d,i){

        self.infoHover = "None";

        self.buildInfoBox();

    };

    self.polygonClick = function(d,i,domElement)
    {
        if(self.controlValues['direction']=="S")
        {
            console.log("En el source");

            self.selectedOrigin = d.id;

            d3.selectAll(".polygons").classed("origin",false);
            d3.select(domElement).classed("origin",true);

            self.infoOrigin = self.getAreaHtml(d);

            self.originFeature = d;


        }
        if(self.controlValues['direction']=="T")
        {
            self.selectedDestination = d.id;

            d3.selectAll(".polygons").classed("destination",false);
            d3.select(domElement).classed("destination",true);

            self.infoDestination = self.getAreaHtml(d);

            self.destinationFeature = d;

        }
        if(self.controlValues['direction']=="N")
        {
            self.selectedOrigin="none";
            self.selectedDestination="none";
            d3.selectAll(".polygons").classed("destination",false);
            d3.selectAll(".polygons").classed("origin",false);
            d3.selectAll(".polygons").classed("between",false);

        }


        self.buildInfoBox();

        if(self.selectedOrigin!="none" && self.selectedDestination!="none")
        {
            var polDict = self.getLSOAIntersect(self.originFeature,self.destinationFeature,self.fileData);

            console.log(polDict);

            var tripSDistance = d3.geo.greatArc().distance({source: d3.geo.centroid(self.originFeature), target: d3.geo.centroid(self.destinationFeature)}) * 6371;

            console.log(tripSDistance);

            d3.selectAll(".polygons").classed("between",function(d,i){
                if(d.id in polDict && d.id !=self.selectedDestination && d.id != self.selectedOrigin)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            });
//            self.mapChart.updateValues(["lsoas"]);
        }

    };

    self.polygonMapMove = function(selection)
    {
        selection.attr("d",self.mapChart.path);
    }

    self.polygonUpdate = function(selection)
    {
        var dim = self.controlValues['dimension'];

        var colorScale = self.comboScales[dim];

        selection.attr("d",self.mapChart.path).style("fill",function(d,i){

            if(dim=="foots")
            {
                if((d.id in self.londonData[dim]) && (self.controlValues['day'] in self.londonData[dim][d.id]))
                {
                    console.log(self.londonData[dim][d.id]);
                    return colorScale(self.londonData[dim][d.id][self.controlValues['day']][parseInt(self.controlValues['hour'],10)]);
                }
                else
                {
                    return colorScale(0);
                }
            }
            else
            {
                return colorScale(self.londonData[dim][d.id]);
            }

        });

    }

    self.polygonEnter = function(selection)
    {
        var dim = self.controlValues['dimension'];

        var colorScale = self.comboScales[dim];


        selection.attr("d",self.mapChart.path).style("fill",function(d,i){

            if(dim=="foots")
            {
                if((d.id in self.londonData[dim]) && (self.controlValues['day'] in self.londonData[dim][d.id]))
                {

                    return colorScale(self.londonData[dim][d.id][self.controlValues['day']][parseInt(self.controlValues['hour'],10)]);
                }
                else
                {
                    return colorScale(0);
                }
            }
            else
            {
                return colorScale(self.londonData[dim][d.id]);
            }

        });

    }

    self.pathMapMove = function(selection){};self.pathUpdate = function(selection){};self.pathEnter = function(selection,layerName){};self.pathExit = function(selection){};

    // El document ready

    $(document).ready(function()
    {
        // El cache del servidor manda

        $.ajaxSetup({cache: true});

        // Instancio el objeto mapChart

        self.mapChart = tdviz.viz.mapViz(
            {
                'idName':self.idName,
                'transTime': self.transTime,
                'apiKey': self.apiKey,
                'mapStyle': self.mapStyle,
                'initLatLng': self.initLatLng,
                'initZoom': self.initZoom,
                'maxZoom': self.maxZoom,
                'attributionText': self.attributionText,
                'hideOnZoom': self.hideOnZoom,
                'pointUpdate': self.pointUpdate,
                'pointEnter': self.pointEnter,
                'pointExit': self.pointExit,
                'pointOver':self.pointOver,
                'pointOut':self.pointOut,
                'pathUpdate': self.pathUpdate,
                'pathEnter': self.pathEnter,
                'pathExit': self.pathExit,
                'pathOver':self.pathOver,
                'pathOut':self.pathOut,
                'polygonClick': self.polygonClick,
                'polygonUpdate': self.polygonUpdate,
                'polygonEnter': self.polygonEnter,
                'polygonExit': self.pathExit,
                'polygonOver':self.polygonOver,
                'polygonOut':self.polygonOut,
                'polygonMapMove': self.polygonMapMove,
                'pathMapMove': self.pathMapMove,
                'pointMapMove': self.pointMapMove,
                'myLog': myLog
            });

      // Fill the combobox content based on self.comboDict


        var comboHtml = '<select id="dimCombo">';

        for(var key in self.comboDict)
        {
            comboHtml+= key==self.comboDefault ? '<option selected value="'+self.comboDict[key]+'">'+key+ '</option>': '<option value="'+self.comboDict[key]+'">'+key+ '</option>';
        }

        comboHtml += '</select>';

        var hourHtml = '<select id="hourCombo">'+"<option selected value='0'>0</option>";

        for(var i=1;i<24;i++)
        {
            hourHtml+= '<option value="'+i+'">'+i+'</option>';
        }

        hourHtml+= '</select>';

        var dayHtml = '<select id="dayCombo">';

        dayHtml +="<option value='10/12/2012'>Monday</option><option value='11/12/2012'>Tuesday</option><option value='12/12/2012'>Wednesday</option><option value='13/12/2012'>Thursday</option><option value='14/12/2012'>Friday</option><option value='15/12/2012'>Saturday</option><option selected value='09/12/2012'>Sunday</option>";

        dayHtml+= '</select>';

        var optionsHtml =

            '<div class="infoTitle">Options</div>'+
            '<div class="infoContent">'+
                '<div id="optionsContainer">'+
                    '<div id="infoSegmentBox" class="controlBox">'+
                        '<span class="optionsLegend">Heatmap dimension</span>'+
                        '<form>'+
                        comboHtml +
                        '</form>'+
                    '</div>'+
                    '<div id="directionModeBox" class="controlBox">'+
                        '<span class="optionsLegend">Selection</span>'+
                        '<form>'+
                            '<label><input type="radio" name="directionMode" value="N" checked>None</label><br>'+
                            '<label><input type="radio" name="directionMode" value="S">Origin</label><br>'+
                            '<label><input type="radio" name="directionMode" value="T">Destination</label>'+
                        '</form>'+
                    '</div>'+
                    '<div id="dayBox" class="controlBox">'+
                        '<span class="optionsLegend">Day</span>'+
                        '<form>'+
                        dayHtml +
                        '</form>'+
                    '</div>'+
                    '<div id="hourBox" class="controlBox">'+
                        '<span class="optionsLegend">Hour</span>'+
                        '<form>'+
                        hourHtml +
                        '</form>'+
                    '</div>'+
                '</div>'+
            '</div>';



        self.infoBox = d3.select("."+self.className).append("div")
                        .attr("id","infoBox")
                        .html("<span class='optionsLegend'>Hover over a region for more info</span>")
                        .attr("class", "infoBox");


        self.optionsBox = d3.select("body").append("div")
        .attr("id","optionsBox")
        .html(optionsHtml)
        .attr("class", "optionsBox");

        $('input[name="directionMode"]').change(function(){

            self.controlValues['direction'] = this.value;

            if(this.value=="N")
            {
                // Reseteo de lo seleccionado

                self.selectedOrigin="none";
                self.selectedDestination="none";
                d3.selectAll(".polygons").classed("destination",false);
                d3.selectAll(".polygons").classed("origin",false);
                d3.selectAll(".polygons").classed("between",false);

            }

            console.log(self.controlValues);
        });


        $('#dimCombo').change(function(){
            self.controlValues['dimension'] = this.value;
            console.log(self.controlValues);
            self.mapChart.updateValues(["lsoas"]);
        });

        $('#hourCombo').change(function(){
            self.controlValues['hour'] = this.value;
            console.log(self.controlValues);
            self.mapChart.updateValues(["lsoas"]);

        });

        $('#dayCombo').change(function(){
            self.controlValues['day'] = this.value;
            console.log(self.controlValues);
            self.mapChart.updateValues(["lsoas"]);

        });


        self.mapChart.addLayer("lsoas");


        $('#infoBox').html("<div class='infoTitle'>Loading Data...</div>");

        self.renderFile(self.lsoasFile,"lsoas");

    });

    return self;
}
