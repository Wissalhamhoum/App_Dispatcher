require([
    "dojo/dom",
    "dojo/on",
    "esri/map", 
    "esri/dijit/HomeButton",
    "esri/layers/FeatureLayer",
    "esri/arcgis/Portal",
    "esri/arcgis/OAuthInfo",
    "esri/IdentityManager",
    "dojo/domReady!"
  ], function(dom, on,Map, HomeButton, FeatureLayer,arcgisPortal,OAuthInfo,esriId)  {

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

