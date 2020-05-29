
class GameLogic {
    /** @type {number} */
    Ticks = 0;
    /** @type {number} */
    LoadingLength;
    /** @type {User} */
    Player;
    /** @type {World} */
    world;
    /** @type {View} */
    view;
    /** @type {Builder} */
    builder;
    /** @type {Function} */
    GetPlayerCoordinate;
    /** @type {Entity[]} */
    NPCs = [];
    creativeMode;
    /**
     * 
     * @param {any} LoadingLength
     * @param {any} world
     * @param {any} view
     * @param {any} builder
     * @param {any} GetPlayerCoordinate
     */
    constructor(LoadingLength, world, view, builder, GetPlayerCoordinate, creativeMode) {
        this.LoadingLength = LoadingLength;
        this.world = world;
        this.view = view;
        this.Builder = builder;
        this.GetPlayerCoordinate = GetPlayerCoordinate;
        this.creativeMode = creativeMode;
    }
    Main() {
        this.RunCheck();
        if (!this.creativeMode) {
            this.MakeNPC();
            if (this.Ticks % 5000 == 0)
                this.NPCs.forEach(entity => {
                    if (!entity.isDeath)
                        if (entity.Name.indexOf("Creeper") >= 0)
                            if (this.getDistance(entity.position.x, entity.position.y, entity.position.z,
                                this.Player.Entity.position.x, this.Player.Entity.position.y, this.Player.Entity.position.z) < 15) {
                            }
                            else
                                entity.GetRamdonMove();
                        else
                            entity.GetRamdonMove();
                });
            this.NPCs.forEach(entity => {
                if (entity.Name.indexOf("Creeper") >= 0 && !entity.isDeath)
                    if (this.getDistance(entity.position.x, entity.position.y, entity.position.z,
                        this.Player.Entity.position.x, this.Player.Entity.position.y, this.Player.Entity.position.z) < 15) {
                        let x = this.Player.Entity.position.x - entity.position.x;
                        let z = this.Player.Entity.position.z - entity.position.z;
                        let magnitude = Math.pow(Math.pow(x, 2) + Math.pow(z, 2), 0.5);
                        x / magnitude;
                        z /= magnitude;
                        entity.SetMove(x, z, { x: this.Player.Entity.position.x, z: this.Player.Entity.position.z });
                    }
                entity.Move();
                if (entity.isDeath && entity.Countdown > 0) {
                    entity.Countdown--;
                    if (entity.Countdown <= 0) {
                        this.view.scene.remove(entity.Mesh);
                    }
                }
            });
            this.Fighting();
        }
        this.Ticks++;
    }

    RunCheck() {
        var coordinate = this.GetPlayerCoordinate();
        var Min = { x: 0, z: 0 }
        Min.x = Math.floor(coordinate.x / 16);
        Min.z = Math.floor(coordinate.z / 16);
        var ActiveChunks = [];
        for (var x = Min.x - (this.LoadingLength + 2); x <= Min.x + (this.LoadingLength + 2); x++)
            for (var z = Min.z - (this.LoadingLength + 2); z <= Min.z + (this.LoadingLength + 2); z++)
                if (!this.world.IsBlockExist(x * 16, 0, z * 16)) {
                    this.Builder.CreateChunk([x, z]);
                }
        for (var x = Min.x - this.LoadingLength; x <= Min.x + this.LoadingLength; x++)
            for (var z = Min.z - this.LoadingLength; z <= Min.z + this.LoadingLength; z++) {
                //  if (!world.IsChunkExist([x, z]))
                if (this.world.VisibleChunks.indexOf(JSON.stringify([x, z])) < 0)
                    this.world.LoadChunk([x, z])
                ActiveChunks.push(JSON.stringify([x, z]));
            }
        for (let i = this.world.VisibleChunks.length - 1; i >= 0; i--) {
            if (ActiveChunks.indexOf(this.world.VisibleChunks[i]) < 0) {
                this.world.UnloadChunk(JSON.parse(this.world.VisibleChunks[i]));
            }
        }
    }
    /**
     *
     * @param {View} view
     * @param {World} world
     */
    LoadPlayer(view, world) {
        this.Player = new User("Steve", { x: 0, y: 64, z: 0 }, view, world);
    }

    Fighting() {
        this.NPCs.forEach(entity => {
            if (entity.Name.indexOf("Creeper") >= 0 && !entity.isDeath)
                if (this.getDistance(entity.position.x, entity.position.y, entity.position.z,
                    this.Player.Entity.position.x, this.Player.Entity.position.y, this.Player.Entity.position.z) < 6) {
                    let move = {
                        x: this.Player.Entity.position.x - entity.position.x,
                        y: this.Player.Entity.position.y - entity.position.y,
                        z: this.Player.Entity.position.z - entity.position.z
                    };
                    this.Player.Entity.velocity.x = 5 * move.x;
                    this.Player.Entity.velocity.y = 5 * move.y;
                    this.Player.Entity.velocity.z = 5 * move.z;
                    this.Player.blood -= 10;
                    entity.isDeath = true;
                    entity.Countdown = 144 * 2;
                    entity.Mesh.rotation.x = Math.PI / 2;
                    entity.velocity.x = 0;
                    entity.velocity.y = 0;
                    entity.velocity.z = 0;
                    console.log("在:" + entity.position + "发生了爆炸")
                    var boom = document.getElementById("boom");
                    boom.volume = 0.5;
                    boom.play();
                    var min = { x: Math.floor(entity.position.x - 4), y: Math.floor(entity.position.y - 4), z: Math.floor(entity.position.z - 4) }
                    var max = { x: Math.floor(entity.position.x + 4), y: Math.floor(entity.position.y + 4), z: Math.floor(entity.position.z + 4) }

                    this.NPCs.forEach(npc => {
                        if (npc.position.x > min.x && npc.position.x < max.x &&
                            npc.position.y > min.y && npc.position.y < max.y &&
                            npc.position.z > min.z && npc.position.z < max.z) {
                            npc.blood = 0;
                            npc.isDeath = true;
                            npc.Countdown = 144 * 5;
                            npc.velocity.x = 0;
                            npc.velocity.y = 0;
                            npc.velocity.z = 0;
                            npc.Mesh.rotation.x = Math.PI / 2;
                        }
                    })
                    for (let x = min.x; x <= max.x; x++)
                        for (let y = min.y; y <= max.y; y++)
                            for (let z = min.z; z <= max.z; z++) {
                                if (this.getDistance(x, y, z, entity.position.x, entity.position.y, entity.position.z) < 4)
                                    this.world.Set(x, y, z, 0);
                                //     else
                                //          if (Math.random() > 0.3)
                                //              this.world.Set(x, y, z, 0);
                            }
                    for (let x = min.x - 32; x <= max.x + 32; x++)
                        for (let z = min.z - 32; z <= max.z + 32; z++)
                            if (x % 16 == 0 && z % 16 == 0) {
                                this.world.UpdateChunk([x / 16, z / 16], { x: 0, y: 0, z: 0 })
                            }
                }
            if (entity.blood <= 0 && !entity.isDeath) {
                if (entity.Name.indexOf("Creeper") >= 0) {
                    var creeper = document.getElementById("creeper");
                    creeper.volume = 0.5;
                    creeper.play();
                }
                if (entity.Name.indexOf("Cow") >= 0) {
                    var cow = document.getElementById("cow");
                    cow.volume = 0.5;
                    cow.play();
                }
                if (entity.Name.indexOf("Pig") >= 0) {
                    var pig = document.getElementById("pig");
                    pig.volume = 0.5;
                    pig.play();
                }
                entity.isDeath = true;
                entity.Countdown = 144 * 5;
                entity.velocity.x = 0;
                entity.velocity.y = 0;
                entity.velocity.z = 0;
                entity.Mesh.rotation.x = Math.PI / 2;
            }
        });
    }

    MakeNPC() {
        if (this.Ticks % 1000 == 0) {
            var NPCs = this.NPCs;
            let Ticks = this.Ticks;
            // 生成猪
            for (let i = 0; i < 1; i++) {
                var loader = new THREE.GLTFLoader();
                loader.load('./textures/entity/pig/scene.gltf', function (gltf) {
                    console.log(gltf.scene);
                    gltf.scene.scale.set(0.07, 0.07, 0.07);
                    gltf.scene.position.y = 64;
                    gltf.scene.name = "Pig" + (Ticks / 1000) + i;
                    view.scene.add(gltf.scene);
                    let creeper = new Entity(gltf.scene.name, { x: 0, y: 64, z: 0 }, { x: 0, z: 0 }, { x: 0, y: 0, z: 0 }, function (x, y, z) {
                        return world.Get(x, y, z);
                    }, world.Blocks, gltf.scene);
                    creeper.FindGround = function (x, y, z) {
                        while (world.Get(x, y, z) == 0)
                            y--;
                        return y + 1;
                    }
                    creeper.GetRamdonMove();
                    creeper.cd = 1;
                    NPCs.push(creeper);
                }, undefined, function (error) {
                    console.error(error);
                });
            }
            // 生成牛
            for (let i = 0; i < 1; i++) {
                var loader = new THREE.GLTFLoader();
                loader.load('./textures/entity/cow/scene.gltf', function (gltf) {
                    console.log(gltf.scene);
                    gltf.scene.scale.set(0.07, 0.07, 0.07);
                    gltf.scene.position.y = 64;
                    gltf.scene.name = "Cow" + (Ticks / 1000) + i;
                    view.scene.add(gltf.scene);
                    let creeper = new Entity(gltf.scene.name, { x: 0, y: 64, z: 0 }, { x: 0, z: 0 }, { x: 0, y: 0, z: 0 }, function (x, y, z) {
                        return world.Get(x, y, z);
                    }, world.Blocks, gltf.scene);
                    creeper.FindGround = function (x, y, z) {
                        while (world.Get(x, y, z) == 0)
                            y--;
                        return y + 1;
                    }
                    creeper.GetRamdonMove();
                    creeper.cd = 1;
                    NPCs.push(creeper);
                }, undefined, function (error) {
                    console.error(error);
                });
            }
            // 生成僵尸
            for (let i = 0; i < 6; i++) {
            }
            // 生成Creeper
            for (let i = 0; i < 4; i++) {
                var loader = new THREE.GLTFLoader();
                loader.load('./textures/entity/creeper/scene.gltf', function (gltf) {
                    console.log(gltf.scene);
                    gltf.scene.scale.set(0.07, 0.07, 0.07);
                    gltf.scene.position.y = 64;
                    gltf.scene.name = "Creeper" + (Ticks / 1000) + i;
                    view.scene.add(gltf.scene);
                    let creeper = new Entity(gltf.scene.name, { x: 0, y: 64, z: 0 }, { x: 0, z: 0 }, { x: 0, y: 0, z: 0 }, function (x, y, z) {
                        return world.Get(x, y, z);
                    }, world.Blocks, gltf.scene);
                    creeper.FindGround = function (x, y, z) {
                        while (world.Get(x, y, z) == 0)
                            y--;
                        return y + 1;
                    }
                    creeper.GetRamdonMove();
                    NPCs.push(creeper);
                }, undefined, function (error) {
                    console.error(error);
                });
            }
        }
    }
    AttackByName(name) {
        this.NPCs.filter(entity => entity.Name == name && !entity.isDeath).forEach(element => {

            let vX = element.position.x - this.Player.Entity.position.x;
            let vZ = element.position.z - this.Player.Entity.position.z;
            let magnitude = Math.pow(Math.pow(vX, 2) + Math.pow(vZ, 2), 0.5);
            vX / magnitude;
            vZ /= magnitude;
            element.velocity.x = vX;
            element.velocity.z = vZ;
            element.velocity.y += 4;
            element.blood--;
            if (element.blood <= 0) {
                this.Player.exp += 5;
                if (element.Name.indexOf("Creeper") < 0)
                    this.Player.blood += 10;
                else
                    this.Player.exp += 10;
            }
            window.setTimeout(function () { if (!element.isDeath) element.GetRamdonMove(); }, 200);

            //  entity.position.y += 2;

        });
    }
    Attack(position, min, max, r) {
        this.NPCs.filter(entity => entity.position.x > min.x && entity.position.x < max.x &&
            entity.position.y > min.y && entity.position.y < max.y &&
            entity.position.z > min.z && entity.position.z < max.z && !entity.isDeath)
            .forEach(entity => {
                entity.blood--;
                entity.velocity.y += 4;
                //  entity.position.y += 2;
                player.exp += 2;
                if (entity.Name != "creeper")
                    this.Player.blood += 0.5;
                else
                    player.exp += 3;
            });
    }
    /**
     *
     * @param {{x:number,y:number,z:number}} position
     * @param {Vector3} Vector
     */
    findEntity(position, Vector) {
        let magnitude = Math.pow(
            Math.pow(Vector.x, 2) +
            Math.pow(Vector.z, 2) +
            Math.pow(Vector.z, 2)
            , 0.5);
        var src = { x: position.x, y: position.y, z: position.z };
        let x = Vector.x / magnitude;
        let y = Vector.y / magnitude;
        let z = Vector.z / magnitude;
        let result = null;
        while (this.getDistance(position.x, position.y, position.z, src.x, src.y, src.z) < 10) {
            if (result != null)
                return result;
            position.x += x;
            position.y += y;
            position.z += z;
        }
        return null;
    }
    getDistance(x1, y1, z1, x2, y2, z2) {
        return Math.pow(
            Math.pow(x1 - x2, 2) +
            Math.pow(y1 - y2, 2) +
            Math.pow(z1 - z2, 2)
            , 0.5);
    }
}