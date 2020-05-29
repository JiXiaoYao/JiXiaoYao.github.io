class User {
    /** @type {string} */
    Name;
    /** @type {{x:number,y:number,z:number}} */
    position;
    /** @type {Camera} */
    camera;
    /** @type {Entity} */
    Entity;
    /** @type {number} 血量*/
    blood = 60;
    /** @type {number} 速度*/
    Speed = 4;
    /** @type {number} 护甲*/
    Armor = 0;
    /** @type {number} 经验*/
    exp = 0;
    MaxExp = 1000;
    Maxblood = 100;
    /**
     * 背包(5x10)
     * @type {{id:number,number:number}[][]}
     */
    Bag;
    /**
     * 
     * @param {string} Name
     * @param {{x:number,y:number,z:number}} position
     * @param {View} view
     * @param {World} world
     */
    constructor(Name, position, view, world) {
        this.Name = Name;
        this.position = position;
        this.camera = view.camera;
        var entity = new Entity(Name, position, { x: 0, z: 0 }, { x: 0, y: 0, z: 0 }, function (x, y, z) { return world.Get(x, y, z) }, world.Blocks, view.camera);
        this.Entity = entity;
        this.Entity.FindGround = function (x, y, z) {
            while (world.Get(x, y, z) == 0)
                y--;
            return y + 1;
        }
        var geometry = new THREE.PlaneGeometry(1, 1, 32);
        var loader = new THREE.TextureLoader();//
        var texture = loader.load("./textures/diamond_sword.png", this.render);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        var material = new THREE.MeshPhysicalMaterial({
            map: texture,
            side: THREE.DoubleSide,
            //alphaTest: 0.1,
            transparent: true,
        });
        var plane = new THREE.Mesh(geometry, material);
        plane.position.set(0, 64, 0);
        plane.name = "item"
        view.scene.add(plane);
        this.plane = plane;
        window.setInterval(function () {
            entity.Move();
            var vector = new THREE.Vector3();
            view.camera.getWorldDirection(vector);
            plane.rotation.set(vector.x + OffsetAngle.x, vector.y + OffsetAngle.y, vector.z + OffsetAngle.z)
            plane.position.x = entity.position.x + 2 * vector.x;
            plane.position.y = entity.position.y + vector.y + 1.2 + OffsetAngle.y;
            plane.position.z = entity.position.z + vector.z;
            plane.lookAt(
                plane.position.x + vector.x,
                plane.position.y + vector.y,
                plane.position.z + vector.z
            );
            //if (OffsetAngle.x != 0)
            //    OffsetAngle.x = 0;
            //if (OffsetAngle.y != 0)
            //    OffsetAngle.y = 0;
            //if (OffsetAngle.z != 0)
            //    OffsetAngle.z = 0;
        }, 10);
    }
    /**
     * 
     * @param {string} type
     * @param {Vector3} Vector
     */
    Move(type, Vector) {
        let magnitude = Math.pow(
            Math.pow(Vector.x, 2) +
            Math.pow(Vector.z, 2)
            , 0.5);
        let x = Vector.x / magnitude;
        let z = Vector.z / magnitude;
        if (type == "before") {//向前，增加视线向量乘以移速
            this.Entity.velocity.x = x * this.Speed;
            this.Entity.velocity.z = z * this.Speed;

        }
        if (type == "back") {//向后，减去视线向量乘以移速
            this.Entity.velocity.x = -x * this.Speed;
            this.Entity.velocity.z = -z * this.Speed;
        }
        if (type == "left") {//左移
            var newArray = CoordinateSystem.CSTIn(x, z, [0, -1], [1, 0]);//垂直坐标系变换
            this.Entity.velocity.x = newArray[0] * this.Speed;
            this.Entity.velocity.z = newArray[1] * this.Speed;
        }
        if (type == "right") {//右移
            var newArray = CoordinateSystem.CSTIn(x, z, [0, 1], [-1, 0]);//垂直坐标系变换
            this.Entity.velocity.x = newArray[0] * this.Speed;
            this.Entity.velocity.z = newArray[1] * this.Speed;
        }
        if (type == "down") {
            this.Entity.velocity.y -= this.Speed / 2;
        }
        if (type == "up") {
            this.Entity.velocity.y = 4.5;
        }
    }
    Stop() {
        this.Entity.velocity.x = 0;
        this.Entity.velocity.z = 0;
    }
    CleanBag() {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 10; j++) {
                this.Bag[i][j] = { id: -1, number: 0 }
            }
        }
    }
}