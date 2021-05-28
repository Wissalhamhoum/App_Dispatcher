require([
    "esri/arcgis/Portal",
    "esri/arcgis/OAuthInfo",
    "esri/IdentityManager",
    "dojo/dom-style",
    "dojo/dom-attr",
    "dojo/dom",
    "dojo/on",
    "dojo/_base/array",
    "dojo/domReady!","esri/map", 
    "esri/dijit/HomeButton",
    "esri/layers/FeatureLayer",
  ], function (arcgisPortal, OAuthInfo, esriId,
    domStyle, domAttr, dom, on, arrayUtils,Map, HomeButton, FeatureLayer){
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

    //Affichage de la carte 
    var map = new Map("map", {
      center: [10, 35],  // les références de la Tunidsie
      zoom: 7,
      basemap: "topo"
    });


    //Création de le bouton  Home      
    var home = new HomeButton({
      map: map
    }, "HomeButton");
    home.startup();

    var featureLayer = new FeatureLayer("https://services8.arcgis.com/fM0eo5ptjcKgJViW/arcgis/rest/services/workforce_ceea173740504353aa50e5cc6a3b33b8/FeatureServer/1"); /* ici on a utilisé le lien fourni avec la couche "workers" dans notre répertoire "Dispatching ambulance", dans le but de faire un simple affichage comme une première étape*/
    map.addLayer(featureLayer);


  });

 //création du bouton locate
  require (["esri/dijit/LocateButton"], 
    function (LocateButton){

      geoLocate = new LocateButton({
        map: map
      }, "LocateButton");
      geoLocate.startup();
    }) ; 

