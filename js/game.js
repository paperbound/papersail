var GAME = {
	ms_Canvas: null,
	ms_Renderer: null,
	ms_Camera: null,
	ms_Scene: null,
	ms_Controls: null,
	ms_Water: null,
	ms_FileRedditFun: null,
	ms_Projector: null,
	ms_Terrain: [],
	ms_Barrel: null,
	ms_Keyboard: null,
	ms_Starting: null,
	ms_Clickable: [],

    enable: (function enable() {
        try {
            var aCanvas = document.createElement('canvas');
            return !! window.WebGLRenderingContext && (aCanvas.getContext('webgl')
						|| aCanvas.getContext('experimental-webgl'));
        }
        catch(e) {
            return false;
        }
    })(),

	initialize: function initialize(inIdCanvas, inParameters) {
		this.ms_Canvas = $('#'+inIdCanvas);

		// Initialize Renderer, Camera, Projector and Scene
		this.ms_Renderer = this.enable? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
		this.ms_Canvas.html(this.ms_Renderer.domElement);
		this.ms_Scene = new THREE.Scene();

		this.ms_Camera = new THREE.PerspectiveCamera(55.0, WINDOW.ms_Width / WINDOW.ms_Height, 0.5, 3000000);
		this.ms_Starting = new THREE.Vector3(0, Math.max(inParameters.width * 1.5, inParameters.height) / 8,
		 -inParameters.height - 100*RAND_MT.Random() - 1000);
		this.ms_Camera.position.set(0, this.ms_Starting.y, this.ms_Starting.z);
		this.ms_Camera.lookAt(new THREE.Vector3(0, 0, 0));

		// this.ms_Projector = new THREE.Projector();

		// Initialize Orbit control
		this.ms_Keyboard = new THREEx.KeyboardState();

		// this.ms_Controls = new THREE.OrbitControls(this.ms_Camera, this.ms_Renderer.domElement);
		// this.ms_Controls.userPan = false;
		// this.ms_Controls.userPanSpeed = 0.0;
		// this.ms_Controls.maxDistance = 5000.0;
		// this.ms_Controls.maxPolarAngle = Math.PI * 0.495;

		// Add light
		var directionalLight = new THREE.DirectionalLight(0xffff55, 1);
		directionalLight.position.set(-600, 300, 600);
		this.ms_Scene.add(directionalLight);

		// Create terrain
		this.loadTerrain(inParameters);

		this.loadPlayer(inParameters)

		// Load textures
		var waterNormals = new THREE.ImageUtils.loadTexture('img/waternormals.jpg');
		waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

		// Load FileRedditFun texture
		new Konami(function() {
			if(GAME.ms_FileRedditFun == null)
			{
				var aTextureFDND = THREE.ImageUtils.loadTexture("img/yoman.ico");
				GAME.ms_FileRedditFun = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000),
				new THREE.MeshBasicMaterial({
					map : aTextureFDND,
					transparent: true,
					side : THREE.DoubleSide }));

				// Mesh callback
				GAME.ms_FileRedditFun.callback = function() { window.open("http://www.reddit.com"); }
				GAME.ms_Clickable.push(GAME.ms_FileRedditFun);

				GAME.ms_FileRedditFun.position.y = 1200;
				GAME.ms_Scene.add(GAME.ms_FileRedditFun);
			}
		});

		// Create the water effect
		this.ms_Water = new THREE.Water(this.ms_Renderer, this.ms_Camera, this.ms_Scene, {
			textureWidth: 512,
			textureHeight: 512,
			waterNormals: waterNormals,
			alpha: 	1.0,
			sunDirection: directionalLight.position.normalize(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			distortionScale: 50.0
		});
		var aMeshMirror = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(inParameters.width * 500, inParameters.height * 500, 10, 10),
			this.ms_Water.material
		);
		aMeshMirror.add(this.ms_Water);
		aMeshMirror.rotation.x = - Math.PI * 0.5;
		this.ms_Scene.add(aMeshMirror);

		this.loadSkyBox();
	},

	loadSkyBox: function loadSkyBox() {
		var aCubeMap = THREE.ImageUtils.loadTextureCube([
		  'img/px.jpg',
		  'img/nx.jpg',
		  'img/py.jpg',
		  'img/ny.jpg',
		  'img/pz.jpg',
		  'img/nz.jpg'
		]);
		aCubeMap.format = THREE.RGBFormat;

		var aShader = THREE.ShaderLib['cube'];
		aShader.uniforms['tCube'].value = aCubeMap;

		var aSkyBoxMaterial = new THREE.ShaderMaterial({
		  fragmentShader: aShader.fragmentShader,
		  vertexShader: aShader.vertexShader,
		  uniforms: aShader.uniforms,
		  depthWrite: false,
		  side: THREE.BackSide
		});

		var aSkybox = new THREE.Mesh(
		  new THREE.BoxGeometry(1000000, 1000000, 1000000),
		  aSkyBoxMaterial
		);

		this.ms_Scene.add(aSkybox);
	},

	loadPlayer: function loadPlayer(inParameters){
		// Adds the Player to the Game

		// var diffuse = new THREE.ImageUtils.loadTexture( "img/diffuse.jpg" );
	  // var specular = new THREE.ImageUtils.loadTexture( "img/specular.jpg" );
	  // var normal = new THREE.ImageUtils.loadTexture( "img/normal.jpg" );
		//
		// var barrelMaterial = new THREE.MeshPhongMaterial({
	  //   map: diffuse,
	  //   specular: 0xffffff,
	  //   specularMap: specular,
	  //   shininess: 10,
	  //   normalMap: normal
	  // });
		//
	  // // Load in the mesh and add it to the scene.
	  // var loader = new THREE.JSONLoader();
		// console.log('should enter');
	  // loader.load(
	  //   "img/barrel/barrel.json",function(barrelGeometry){
		// 	console.log()
	  //   this.ms_Barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
		// 	console.log(this.ms_Scene);
		// 	this.ms_Barrel.position.set(0, 100, 0);
	  //   this.ms_Scene.add(this.ms_Barrel);
	  // });

		var table;
		var tableSize = 300;
		var tableThickness = 40;

		var tableMaterial = new THREE.MeshLambertMaterial( {
			color : 0x641f3b,
			emissive : 0x1b1717,
			vertexColors : THREE.FaceColors
		});
		var tableGeometry = new THREE.BoxGeometry(tableSize,tableThickness, tableSize);

		this.ms_Barrel = new THREE.Mesh( tableGeometry, tableMaterial );
		this.ms_Barrel.position.set( 0, 0, this.ms_Starting.z + 800);
		this.ms_Scene.add( this.ms_Barrel );

	},

	loadTerrain: function loadTerrain(inParameters) {

		var terrainGeo = TERRAINGEN.Get(inParameters);
		var terrainMaterial = new THREE.MeshPhongMaterial({
			vertexColors: THREE.VertexColors,
			shading: THREE.FlatShading,
			side: THREE.DoubleSide });

		var terrain;

		for (var i = 0; i < 7; i++) {
			terrain = new THREE.Mesh(terrainGeo, terrainMaterial)
			terrain.position.set( i*50*RAND_MT.Random(), -inParameters.depth * 0.4, 200*i + i*5000*RAND_MT.Random() );
			this.ms_Scene.add(terrain);
			this.ms_Terrain.push(terrain);
		}
	},

	display: function display() {
		this.ms_Water.render();
		this.ms_Renderer.render(this.ms_Scene, this.ms_Camera);
	},

	respawn: function respawn(){
		this.ms_Barrel.position.set(0, 0, this.ms_Starting.z + 800);
		this.ms_Camera.position.set(0, this.ms_Starting.y, this.ms_Starting.z);
	},

	collided: function collided(){
		for (var ter in this.ms_Terrain) {
			var flag = false;
			var terrain = this.ms_Terrain[ter].position.clone();
			var barrel = this.ms_Barrel.position.clone();
			var xposdis = 700;
			var zposdis = 900;
			if ( (barrel.x > (terrain.x - xposdis)) && (barrel.x < (terrain.x + xposdis))
				 &&  (barrel.z > (terrain.z - zposdis)) && (barrel.z < (terrain.z + zposdis)) ) {
					// this.respawn();
				  window.setTimeout(function(){window.location = "menu.html";}, 1500);

			}
		}
	},

	update: function update() {
		if (this.ms_FileRedditFun != null) {
			this.ms_FileRedditFun.rotation.y += 0.01;
		}
		this.ms_Water.material.uniforms.time.value += 1.0 / 60.0;
		this.ms_Barrel.position.z += 15;
		this.ms_Camera.position.z += 15;
		for (var terrain in this.ms_Terrain) {
			this.ms_Terrain[terrain].position.y += 0.005;
		}
		if (this.ms_Keyboard.pressed('up')) {
			this.ms_Barrel.position.z += 10;
			this.ms_Camera.position.z += 10;
		}
		if (this.ms_Keyboard.pressed('down')) {
			this.ms_Barrel.position.z -= 1;
			this.ms_Camera.position.z -= 1;
		}
		if (this.ms_Keyboard.pressed('right') && this.ms_Barrel.position.x > -1500) {
			this.ms_Barrel.position.x -= 10;
			this.ms_Camera.position.x -= 10;
		}
		if (this.ms_Keyboard.pressed('left') && this.ms_Barrel.position.x < 1500) {
			this.ms_Barrel.position.x += 10;
			this.ms_Camera.position.x += 10;
		}
		this.display();
		this.collided();
	},

	resize: function resize(inWidth, inHeight) {
		this.ms_Camera.aspect =  inWidth / inHeight;
		this.ms_Camera.updateProjectionMatrix();
		this.ms_Renderer.setSize(inWidth, inHeight);
		this.ms_Canvas.html(this.ms_Renderer.domElement);
		this.display();
	}
};
