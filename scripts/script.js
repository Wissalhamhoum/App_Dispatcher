
    var map, params;
    require([
     
      "esri/geometry/geometryEngine",
      "dojo/_base/array",
      "esri/Color",
      "dojo/parser",
      "dijit/registry",

      "esri/map",
      "esri/dijit/Search",
      "esri/lang",
      "esri/graphic",
      "esri/InfoTemplate",
      "esri/layers/GraphicsLayer",
      "esri/layers/FeatureLayer",
      "esri/renderers/SimpleRenderer",

      "esri/geometry/Point",
      "esri/tasks/FeatureSet",

      "esri/tasks/ClosestFacilityTask",
      "esri/tasks/ClosestFacilityParameters",

      "esri/symbols/SimpleMarkerSymbol",
      "esri/symbols/SimpleLineSymbol",

      "esri/arcgis/Portal",
      "esri/arcgis/OAuthInfo",
      "esri/IdentityManager",
      "dojo/dom-style", 
      "dojo/dom-attr",
      "dojo/dom",
      "dojo/on" , 

      "esri/tasks/query",

      "dijit/form/ComboBox",
      "dijit/layout/BorderContainer",
      "dijit/layout/ContentPane",

      "dojo/_base/json",

      "dojo/promise/all",
      "dojox/gfx/fx",

      "dojo/domReady!"
    ], function(
      geometryEngine,  array, Color, parser, registry,
      Map,Search, esriLang, Graphic, InfoTemplate, GraphicsLayer,FeatureLayer, SimpleRenderer,
      Point, FeatureSet,
      ClosestFacilityTask, ClosestFacilityParameters,
      SimpleMarkerSymbol, SimpleLineSymbol,arcgisPortal,OAuthInfo,esriId ,domStyle, domAttr,dom, on, Query , dojoJson , 
       all , fx , 
    ) {
      
      parser.parse();

      var info = new OAuthInfo({
      appId: "q244Lb8gDRgWQ8hM",
      // Uncomment the next line and update if using your own portal
      // portalUrl: "https://<host>:<port>/arcgis",
      // Uncomment the next line to prevent the user's signed in state from being shared
      // with other apps on the same domain with the same authNamespace value.
      //authNamespace: "portal_oauth_inline",
      popup: false
    });
    esriId.registerOAuthInfos([info]);

    esriId.checkSignInStatus(info.portalUrl + "/sharing").then(
      function (){
        displayMap();
      }
    ).otherwise(
      function (){
        // Anonymous view
        domStyle.set("anonymousPanel", "display", "block");
        domStyle.set("personalizedPanel", "display", "none");
      }
    );

    on(dom.byId("sign-in"), "click", function (){
      console.log("click", arguments);
      // user will be redirected to OAuth Sign In page
      esriId.getCredential(info.portalUrl + "/sharing");
    });

    on(dom.byId("sign-out"), "click", function (){
      esriId.destroyCredentials();
      window.location.reload();
    });

    function displayMap () {
      var incidentsGraphicsLayer , geoAmbulance ;

      /*** Creating a map ***/
      map = new Map("map", {
        center: [10, 35],  // les références de la Tunisie
        zoom: 7,
        basemap: "topo",
        showInfoWindowOnClick: false
      });

      var search = new Search({
          map: map
        }, "search");
      search.startup();

      var ambulanceLayer = new FeatureLayer ("https://services8.arcgis.com/fM0eo5ptjcKgJViW/arcgis/rest/services/workforce_ceea173740504353aa50e5cc6a3b33b8/FeatureServer/1" , {
        
        id: "ambulance",
        mode: FeatureLayer.MODE_SNAPSHOT,
        outFields: ["*"],
        refreshInterval: 1  /* the layer is refreshed every 1min in order to keep track of the ambulances last location */

      });
      
      
      
      map.on("click", mapClickHandler);

      map.on("load", function(evtObj) {
        var map = evtObj.target;

       /* this creates the symbol of the incident it's ugly but we should cope with it for now */
        var incidentPointSymbol = new SimpleMarkerSymbol(
          SimpleMarkerSymbol.STYLE_CIRCLE,
          16,
          new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color([89,95,35]), 2
          ),
          new Color([130,159,83,0.40])
        );

         /*the layer containing the location of an incident */ 
        incidentsGraphicsLayer = new GraphicsLayer();

        var incidentsRenderer = new SimpleRenderer(incidentPointSymbol);
        incidentsGraphicsLayer.setRenderer(incidentsRenderer);
        map.addLayer(incidentsGraphicsLayer);

        /*the following code querys the graphics of the feature layer so later on we can use the geomtry to calculate the distance */
        map.addLayer(ambulanceLayer);
        ambulanceLayer.on ("load", function() {
          var query = new Query();
            query.where = "1=1";
            ambulanceLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW, function(result){
              console.log( "go ahead this part is fine");
              geoAmbulance = result //retourne les coordonnées des ambulances
            }) 
        });

      });

     /*this  is useless for now*/
      /*registry.byId("numLocations").on("change", function() {
        params.defaultTargetFacilityCount = this.value;
        clearGraphics();
      });*/

      function clearGraphics() {
        //clear graphics
        map.graphics.clear();
        incidentsGraphicsLayer.clear();
      }

      function mapClickHandler(evt) {
        clearGraphics();
        var inPoint = new Point(evt.mapPoint.x, evt.mapPoint.y, map.spatialReference);
        var location = new Graphic(inPoint);
        incidentsGraphicsLayer.add(location);
        console.log(incidentsGraphicsLayer.graphics[0]);
        if (ambulanceLayer.loaded) {
          findClosestAmbulance (inPoint ,geoAmbulance)
        } else {
          console.log ("loading"); 
        }
        map.graphics.enableMouseEvents();
        
      }

      function findClosestAmbulance (inPoint , ambulanceFeatures) {
        var minDistance = Infinity;
        var distance ; 
        var closestAmbulance = 0 ; 
        var buffer =  geometryEngine.geodesicBuffer(inPoint, 50 , "kilometers") ; 
        var closestAmbulances = [] ; 
        
        for (i =0 ; i< ambulanceFeatures.length ; i++){
          if ( geometryEngine.contains(buffer , ambulanceFeatures[i].geometry )  ) {
            closestAmbulances.push(ambulanceFeatures[i])
          }

        };

        var x =  0;

        while (x < closestAmbulances.length) {
          distance= geometryEngine.distance(inPoint , closestAmbulances[x].geometry , "kilometers" );
          if ( distance < minDistance && ambulanceFeatures[x].attributes.status == 1 ) { // status == 0 => ne travaille pas , status == 1 => travail , status == 2 => en pause: so we will consider the status == 2 as the one refering to a free(libre) ambance
            minDistance = distance;
            closestAmbulance = closestAmbulances[x]; 
          }
          x++ 
        }

        if (closestAmbulance === 0 ) {
          console.log("no ambulance is available ")
        } else {
          console.log(closestAmbulance); 
          console.log("the closest ambulance driver", closestAmbulance.attributes.name); //displayes the name of the selected worker
          console.log("the selected worker's ID ", closestAmbulance.attributes.OBJECTID);
          //ambulanceLayer.hide() ;
          //incidentsGraphicsLayer.add(closestAmbulance);
        }
       

      }

    };
  });

