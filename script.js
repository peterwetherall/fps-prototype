let controls;
if ("pointerLockElement" in document || "mozPointerLockElement" in document || "webkitPointerLockElement" in document) {
	let element = document.body;
	//Setup pointer locking mechanisms
	let pointerlockchange = e => {
		if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
			controls.enabled = true;
		} else {
			controls.enabled = false;
		}
	};
	let pointerlockerror = e => {
		alert("Pointer lock error!");
	};
	//Hook pointer lock state change events
	document.addEventListener("pointerlockchange", pointerlockchange, false);
	document.addEventListener("mozpointerlockchange", pointerlockchange, false);
	document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
	document.addEventListener("pointerlockerror", pointerlockerror, false);
	document.addEventListener("mozpointerlockerror", pointerlockerror, false);
	document.addEventListener("webkitpointerlockerror", pointerlockerror, false);
	document.addEventListener("click", e => {
		//Ask the browser to lock the pointer
		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
		element.requestPointerLock();
	}, false);
} else {
	alert("Pointer lock error!");
}
let ap = {};
ap.keyboard = {};
ap.player = {
    height: 0.4,
    speed: 0.025,
	weapon: "pistol",
    coolDown: 0
};
ap.bullets = [];
class Bullet {
    constructor (x, y, z, dir) {
        this.dir = dir;
        this.mesh = ap.models.bullet.mesh.clone();
        this.ttl = 500;
        this.mesh.position.set(
            x - Math.sin(dir - Math.PI / 4) * 0.15,
            y - 0.025,
            z - Math.cos(dir - Math.PI / 4) * 0.15
        );
		this.mesh.rotation.x -= Math.PI / 2;
        this.mesh.rotation.y = dir;
        ap.scene.add(this.mesh);
    }
    update () {
        this.mesh.position.set(
            this.mesh.position.x - Math.sin(this.dir) * 0.1,
            this.mesh.position.y,
            this.mesh.position.z - Math.cos(this.dir) * 0.1
        );
        this.ttl--;
        if (this.ttl === 0) {
            ap.scene.remove(this.mesh);
            ap.bullets.splice(ap.bullets.indexOf(this), 1);
        }
    }
}
ap.resourcesLoaded = false;
ap.models = {
    pineTree: {
        obj: "models/treePine.obj",
        mtl: "models/treePine.mtl",
        mesh: null,
		castShadow: false,
		receiveShadow: false
    },
	snowyPineTree: {
        obj: "models/treePineSnow.obj",
        mtl: "models/treePineSnow.mtl",
        mesh: null,
		castShadow: false,
		receiveShadow: false
    },
	snowTree: {
        obj: "models/treePineSnowed.obj",
        mtl: "models/treePineSnowed.mtl",
        mesh: null,
		castShadow: false,
		receiveShadow: false
    },
    bigRock: {
        obj: "models/rockFormationLarge.obj",
        mtl: "models/rockFormationLarge.mtl",
        mesh: null,
		castShadow: true,
		receiveShadow: false
    },
    lightPost: {
        obj: "models/lightpost.obj",
        mtl: "models/lightpost.mtl",
        mesh: null,
		castShadow: true,
		receiveShadow: false
    },
	pistol: {
		obj: "models/pistol.obj",
        mtl: "models/pistol.mtl",
        mesh: null,
		castShadow: false,
		receiveShadow: true
	},
    bullet: {
        obj: "models/bullet.obj",
        mtl: "models/bullet.mtl",
        mesh: null,
		castShadow: false,
		receiveShadow: false
    }
};
ap.meshes = {};
ap.init = function () {
    ap.scene = new THREE.Scene();
    ap.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 100);
    
    ap.loadingManager = new THREE.LoadingManager();
    console.log("Loading content ...")
    ap.loadingManager.onLoad = ap.onResourcesLoaded;

    ap.ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    ap.scene.add(ap.ambientLight);

    ap.pointLight = new THREE.PointLight(0xffffff, 0.5, 50);
    ap.pointLight.position.set(8, 12, 8);
    ap.pointLight.castShadow = true;
    ap.pointLight.shadow.camera.near = 0.1;
    ap.pointLight.shadow.camera.far = 25;
    ap.scene.add(ap.pointLight);

    //ap.axis = new THREE.AxisHelper(30);
    //ap.scene.add(ap.axis);

    //Load in all models
    for (let _key in ap.models) {
        (function (key){
            let mtlLoader = new THREE.MTLLoader(ap.loadingManager);
            mtlLoader.load(ap.models[key].mtl, function (materials) {
                materials.preload();
                let objLoader = new THREE.OBJLoader(ap.loadingManager);
                objLoader.setMaterials(materials);
                objLoader.load(ap.models[key].obj, function (mesh) {
                    mesh.traverse(function (node) {
                        if (node instanceof THREE.Mesh) {
                            node.castShadow = ap.models[key].castShadow;
                            node.receiveShadow = ap.models[key].receiveShadow;
                        }
                    });
                    ap.models[key].mesh = mesh;
                });
            });
        })(_key);
    }
    
    ap.skybox = new THREE.Mesh(
        new THREE.CubeGeometry(100, 100, 100),
        new THREE.MeshFaceMaterial([
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader(ap.loadingManager).load('img/sb_ft.jpg'),
                side: THREE.DoubleSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader(ap.loadingManager).load('img/sb_bk.jpg'),
                side: THREE.DoubleSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader(ap.loadingManager).load('img/sb_up.jpg'),
                side: THREE.DoubleSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader(ap.loadingManager).load('img/sb_dn.jpg'),
                side: THREE.DoubleSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader(ap.loadingManager).load('img/sb_rt.jpg'),
                side: THREE.DoubleSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader(ap.loadingManager).load('img/sb_lf.jpg'),
                side: THREE.DoubleSide
            })
        ])
    );
    ap.scene.add(ap.skybox);

    ap.floor = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50, 10, 10),
        new THREE.MeshPhongMaterial({color:0xffffff})
    );
    ap.floor.rotation.x -= Math.PI / 2;
    ap.floor.receiveShadow = true;
    ap.scene.add(ap.floor);

    controls = new THREE.PointerLockControls(ap.camera);
	ap.scene.add(controls.getObject());
    controls.getObject().position.set(0, ap.player.height, -4.5);
    controls.getObject().lookAt(new THREE.Vector3(0, ap.player.height, 0));
    controls.getObject().rotation.y = Math.PI;

    ap.renderer = new THREE.WebGLRenderer();
    ap.renderer.setSize(window.innerWidth, window.innerHeight);
    ap.renderer.shadowMap.enabled = true;
    ap.renderer.shadowMap.type = THREE.BasicShadowMap;
    document.body.appendChild(ap.renderer.domElement);
    ap.animate();
};

ap.onResourcesLoaded = function () {
    console.log("Content loaded!");
    document.getElementById("load-screen").classList.add("hidden");
    ap.resourcesLoaded = true;

	//Player gun
	ap.meshes["gun"] = ap.models[ap.player.weapon].mesh.clone();
	ap.meshes["gun"].scale.set(3, 3, 3);
	ap.scene.add(ap.meshes["gun"]);

    ap.meshes["lightPost"] = ap.models.lightPost.mesh.clone();
    ap.scene.add(ap.meshes["lightPost"]);
    ap.lightPost = new THREE.PointLight(0xffffff, 0.3, 5);
    ap.lightPost.position.set(0, 3, 0);
    ap.lightPost.castShadow = true;
    ap.lightPost.shadow.camera.near = 0.1;
    ap.lightPost.shadow.camera.far = 25;
    ap.scene.add(ap.lightPost);

    ap.meshes["bigRock1"] = ap.models.bigRock.mesh.clone();
    ap.meshes["bigRock1"].position.set(2, 0, -3);
    ap.scene.add(ap.meshes["bigRock1"]);
    ap.meshes["bigRock2"] = ap.models.bigRock.mesh.clone();
    ap.meshes["bigRock2"].position.set(-2, 0, 3);
    ap.meshes["bigRock2"].rotation.y += Math.PI;
    ap.scene.add(ap.meshes["bigRock2"]);

	//Tree border
    for (let k = 0; k < 2.5; k += 0.5) {
        for (let j = 0; j < 1; j += 0.5) {
            for (let i = -5; i < (j == 0.5 ? 5: 6); i++) {
				if (Math.random() < 0.4) {
					ap.meshes["borderTree0" + i] = ap.models.snowyPineTree.mesh.clone();
				} else if (Math.random() < 0.1) {
					ap.meshes["borderTree0" + i] = ap.models.snowTree.mesh.clone();
				} else {
					ap.meshes["borderTree0" + i] = ap.models.pineTree.mesh.clone();
				}
                ap.meshes["borderTree0" + i].position.set(-5 - k + j / 5, 0, i + j + (k % 1 == 0 ? 0 : 0.25));
                ap.meshes["borderTree0" + i].rotation.y = Math.PI * 2 * Math.random();
                ap.scene.add(ap.meshes["borderTree0" + i]);
            }
            for (let i = -5; i < (j == 0.5 ? 5: 6); i++) {
                if (Math.random() < 0.4) {
					ap.meshes["borderTree1" + i] = ap.models.snowyPineTree.mesh.clone();
				} else if (Math.random() < 0.1) {
					ap.meshes["borderTree1" + i] = ap.models.snowTree.mesh.clone();
				} else {
					ap.meshes["borderTree1" + i] = ap.models.pineTree.mesh.clone();
				}
                ap.meshes["borderTree1" + i].position.set(i + j + (k % 1 == 0 ? 0 : 0.25), 0, 5 + k - j / 5);
                ap.meshes["borderTree1" + i].rotation.y = Math.PI * 2 * Math.random();
                ap.scene.add(ap.meshes["borderTree1" + i]);
            }
            for (let i = -5; i < (j == 0.5 ? 5: 6); i++) {
                if (Math.random() < 0.4) {
					ap.meshes["borderTree2" + i] = ap.models.snowyPineTree.mesh.clone();
				} else if (Math.random() < 0.1) {
					ap.meshes["borderTree2" + i] = ap.models.snowTree.mesh.clone();
				} else {
					ap.meshes["borderTree2" + i] = ap.models.pineTree.mesh.clone();
				}
                ap.meshes["borderTree2" + i].position.set(5 + k - j / 5, 0, i + j + (k % 1 == 0 ? 0 : 0.25));
                ap.meshes["borderTree2" + i].rotation.y = Math.PI * 2 * Math.random();
                ap.scene.add(ap.meshes["borderTree2" + i]);
            }
            for (let i = -5; i < (j == 0.5 ? 5: 6); i++) {
                if (Math.random() < 0.4) {
					ap.meshes["borderTree3" + i] = ap.models.snowyPineTree.mesh.clone();
				} else if (Math.random() < 0.1) {
					ap.meshes["borderTree3" + i] = ap.models.snowTree.mesh.clone();
				} else {
					ap.meshes["borderTree3" + i] = ap.models.pineTree.mesh.clone();
				}
                ap.meshes["borderTree3" + i].position.set(i + j + (k % 1 == 0 ? 0 : 0.25), 0, -5 - k + j / 5);
                ap.meshes["borderTree3" + i].rotation.y = Math.PI * 2 * Math.random();
                ap.scene.add(ap.meshes["borderTree3" + i]);
            }
        }
    }
};

ap.animate = function () {

    if (ap.resourcesLoaded == false) {
        requestAnimationFrame(ap.animate);
        return;
    }

    requestAnimationFrame(ap.animate);

    for (let bullet of ap.bullets) {
        bullet.update();
    }
    if (ap.keyboard[87]) { //W key
        controls.getObject().position.x -= Math.sin(controls.getObject().rotation.y) * ap.player.speed;
        controls.getObject().position.z -= Math.cos(controls.getObject().rotation.y) * ap.player.speed;
    }
    if (ap.keyboard[83]) { //S key
        controls.getObject().position.x += Math.sin(controls.getObject().rotation.y) * ap.player.speed / 2;
        controls.getObject().position.z += Math.cos(controls.getObject().rotation.y) * ap.player.speed / 2;
    }
    if (ap.keyboard[65]) { //A key
        controls.getObject().position.x += Math.sin(controls.getObject().rotation.y - Math.PI / 2) * ap.player.speed / 2;
        controls.getObject().position.z += Math.cos(controls.getObject().rotation.y - Math.PI / 2) * ap.player.speed / 2;
    }
    if (ap.keyboard[68]) { //D key
        controls.getObject().position.x += Math.sin(controls.getObject().rotation.y + Math.PI / 2) * ap.player.speed / 2;
        controls.getObject().position.z += Math.cos(controls.getObject().rotation.y + Math.PI / 2) * ap.player.speed / 2;
    }
    if (controls.getObject().position.x < -4.5) {
        controls.getObject().position.x = -4.5;
    }
    if (controls.getObject().position.z < -4.5) {
        controls.getObject().position.z = -4.5;
    }
    if (controls.getObject().position.x > 4.5) {
        controls.getObject().position.x = 4.5;
    }
    if (controls.getObject().position.z > 4.5) {
        controls.getObject().position.z = 4.5;
    }
	//Position gun in front of player
	ap.meshes["gun"].position.set(
		controls.getObject().position.x - Math.sin(controls.getObject().rotation.y - Math.PI / 4) * 0.3,
		controls.getObject().position.y - 0.1,
		controls.getObject().position.z - Math.cos(controls.getObject().rotation.y - Math.PI / 4) * 0.3
	);
	ap.meshes["gun"].rotation.y = controls.getObject().rotation.y + Math.PI;
    ap.meshes["gun"].rotation.x = controls.getObject().rotation.x;
    ap.meshes["gun"].rotation.z = controls.getObject().rotation.z;
    if (ap.player.coolDown > 0) {
        ap.player.coolDown--;
    }
    if (ap.keyboard[16]) {
        controls.getObject().position.y = ap.player.height / 2;
        ap.player.speed = 0.0125;
    } else {
        controls.getObject().position.y = ap.player.height;
        ap.player.speed = 0.025;
    }
    ap.renderer.render(ap.scene, ap.camera);
};

window.addEventListener("keydown", function (e) {
    ap.keyboard[event.keyCode] = true;
});
window.addEventListener("keyup", function (e) {
    ap.keyboard[event.keyCode] = false;
});
window.addEventListener("click", function (e) {
    if (ap.player.coolDown == 0) {
        ap.bullets.push(new Bullet(
            controls.getObject().position.x,
            controls.getObject().position.y,
            controls.getObject().position.z,
            controls.getObject().rotation.y
        ));
        ap.player.coolDown = 10;
    }
});
window.addEventListener("resize", function (e) {
    ap.renderer.setSize(window.innerWidth, window.innerHeight);
    ap.camera.aspect = window.innerWidth / window.innerHeight;
    ap.camera.updateProjectionMatrix();
});

ap.init();