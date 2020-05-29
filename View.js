//import * as THREE from './js/three.module.js';

class View {
    /**
     * 场景
     * @type {Scene}
     */
    scene = null;
    /**
     * 相机
     * @type {Camera}
     */
    camera = null;
    /**
     * WebGLRenderer
     * @type {WebGLRenderer}
     **/
    renderer = null;
    /** @type {Raycaster} */
    raycaster = null;
    /**
     * @type {boolean}
     */
    IsEnableShadow = null;
    /**
     * @type {Mesh[]}
     */
    MeshsDict = [];
    /**
     * @type {number}
     */
    frames = 0;
    MarkBox = null;
    /** @type {World} */
    world;
    constructor() {

    }
    /**
     * 
     * @param {number} BackgroundCode
     */
    SetUp(BackgroundCode) {
        this.scene = new THREE.Scene(); // 创建场景
        this.scene.background = new THREE.Color(BackgroundCode); // 设置背景色
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // 设置相机
        this.renderer = new THREE.WebGLRenderer(); // WebGL
        this.renderer.setSize(window.innerWidth, window.innerHeight); // 设置尺寸
        document.body.appendChild(this.renderer.domElement); // 将显示框写入HTML
        this.ambientLight = new THREE.AmbientLight(0xcccccc, 0.35);// 添加环境光
        this.scene.add(this.ambientLight);
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);// 平行光
        this.directionalLight.position.set(256, 256, 100);
        this.scene.add(this.directionalLight);
        this.scene.fog = new THREE.Fog(0xefd1b5, 3 * 16, 4 * 16);
        //this.scene.fog = new THREE.FogExp2(0xefd1b5, 0.005);// 添加迷雾
        this.TextureWidth = 110592;
        this.TextureHeight = 3072;
        this.raycaster = new THREE.Raycaster();
    }
    /** 启用阴影计算 */
    EnableShadow() {
        this.IsEnableShadow = true;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 1000;  // default
        this.directionalLight.shadow.mapSize.height = 1000; // default
        this.directionalLight.shadow.camera.near = 0.5;    // default
        this.directionalLight.shadow.camera.far = 500;     // default
        this.directionalLight.shadow.camera.left = -100;
        this.directionalLight.shadow.camera.bottom = -100;
        this.directionalLight.shadow.camera.right = 100
        this.directionalLight.shadow.camera.top = 100

        //var helper = new THREE.CameraHelper(this.directionalLight.shadow.camera);
        //this.scene.add(helper);
    }
    /** 关闭阴影计算 */
    DisableShadow() {
        this.IsEnableShadow = false;
        this.renderer.shadowMap.enabled = false;
        this.directionalLight.castShadow = false;
    }
    /** 帧 */
    Frame() {
        this.frames++;
        requestAnimationFrame(this.Frame);
        this.renderer.render(this.scene, this.camera);
    }
    /**
     * 设置相机坐标
     * @param {{x:number,y:number,z:number}} coordinate
     */
    SetCameraCoordinate(coordinate) {
        this.camera.position.set(coordinate.x, coordinate.y, coordinate.z);
    }

    LoadTexture(Url) {
        var loader = new THREE.TextureLoader();
        var texture = loader.load(Url, this.render);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        var material = new THREE.MeshPhysicalMaterial({
            map: texture,
            //  side: THREE.DoubleSide,
            alphaTest: 0.1,
            transparent: true,
        });
        //material.depthWrite = false;
        this.material = material;
        var loader = new THREE.TextureLoader();
        var texture = loader.load(Url, this.render);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        this.transparentMaterial = new THREE.MeshPhysicalMaterial({
            map: texture,
            //  side: THREE.DoubleSide,
            alphaTest: 0.1,
            transparent: true,
        });
        this.transparentMaterial.depthWrite = false;
    }
    /**
     * 是否绘制此面
     * @param {{x:number,y:number,z:number}} coordinate
     * @param {number[]} face
     */
    IsDrawThisFace(x, y, z, ID) {
        let id = this.world.Get(x, y, z);
        if (id >= 0)
            if (id == 0 || this.world.Blocks[id].IsTransparent)
                if (this.world.Blocks[id].IsTransparent && id == ID)
                    return false;
                else
                    return true;
        return false;
        //if (this.IsBlockExist(x, y, z)) {
        //    let id = this.Get(x, y, z);
        //    // if (this.Blocks[id].IsTransparent && (id != 2 || (face[1] == 1)))
        //    if (id == 0)
        //        return true;
        //    else
        //        return false;
        //}
        //else
        //    return true;
    }
    /**
     * 根据指定数据集绘制方块
     * @param {{id:number,coordinate:{x:number,y:number,z:number}}[]} data 方块坐标与ID的数组
     * @param {number[]} textureColumn 方块ID所对应的贴图位置
     * @param {UVConstant} UVConstant UV映射常数
     * @param {function} Get 检查对应位置是否有透明方块决定是否绘制此面
     * @param {string} Name Mesh对应的ID
     */
    DrawCubes(data, textureColumn, UVConstant, /*Get,*/ Name) {
        if (!this.MeshsDict.hasOwnProperty(Name)) {// 如果Mesh字典中不存在则创建Mesh
            var positions = []; var positionsTransparent = [];
            var normals = []; var normalsTransparent = [];
            var uvs = []; var uvsTransparent = [];
            var indices = []; var indicesTransparent = [];
            var SideLength = 512;
            var TextureWidth = this.TextureWidth;// 512 * 2;
            var TextureHeight = this.TextureHeight;// 512 * 6;
            for (const { id, coordinate } of data) {
                for (const { textureRow, face, relatively } of UVConstant) {
                    if (coordinate.x == 1 && coordinate.y == 24 && coordinate.z == 0) {
                        console.log(coordinate);
                    }
                    var x = coordinate.x + face[0];
                    var y = coordinate.y + face[1];
                    var z = coordinate.z + face[2];
                    if (this.IsDrawThisFace(x, y, z, id)) {
                        if (this.world.Blocks[id].IsTransparent) {
                            const ndx = positionsTransparent.length / 3; // 教程中唯一搞不懂的地方
                            for (const { position, uv } of relatively) {
                                if (face[1] == -1) {
                                    //           positions.push(position[0] + coordinate.x + 0.01, position[1] + coordinate.y + 0.01, position[2] + coordinate.z + 0.01);
                                }
                                positionsTransparent.push(position[0] + coordinate.x, position[1] + coordinate.y, position[2] + coordinate.z);
                                normalsTransparent.push(...face);
                                uvsTransparent.push((textureColumn[id] + uv[0]) * SideLength / TextureWidth,
                                    1 - (textureRow + 1 - uv[1]) * SideLength / TextureHeight);
                            }
                            indicesTransparent.push(
                                ndx, ndx + 1, ndx + 2,
                                ndx + 2, ndx + 1, ndx + 3,
                            );
                        } else {
                            const ndx = positions.length / 3; // 教程中唯一搞不懂的地方
                            for (const { position, uv } of relatively) {
                                if (face[1] == -1) {
                                    //           positions.push(position[0] + coordinate.x + 0.01, position[1] + coordinate.y + 0.01, position[2] + coordinate.z + 0.01);
                                }
                                positions.push(position[0] + coordinate.x, position[1] + coordinate.y, position[2] + coordinate.z);
                                normals.push(...face);
                                uvs.push((textureColumn[id] + uv[0]) * SideLength / TextureWidth,
                                    1 - (textureRow + 1 - uv[1]) * SideLength / TextureHeight);
                            }
                            indices.push(
                                ndx, ndx + 1, ndx + 2,
                                ndx + 2, ndx + 1, ndx + 3,
                            );
                        }
                    }
                }
            }

            this.MeshsDict[Name] = [];

            var geometry = new THREE.BufferGeometry();// 创建几何图形
            var material = this.material;// 获取贴图
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));// 设置顶点
            geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));// 设置法向量
            geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));;// 设置UV映射
            geometry.setIndex(indices);// 不知道干什么的东西
            var mesh = new THREE.Mesh(geometry, material);// 创建Mesh
            mesh.name = Name;
            if (this.IsEnableShadow) {
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
            this.MeshsDict[Name][0] = mesh;// 加入字典


            var geometryTransparent = new THREE.BufferGeometry();// 创建几何图形
            var materialTransparent = this.transparentMaterial;// 获取贴图
            geometryTransparent.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positionsTransparent), 3));// 设置顶点
            geometryTransparent.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normalsTransparent), 3));// 设置法向量
            geometryTransparent.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvsTransparent), 2));;// 设置UV映射
            geometryTransparent.setIndex(indicesTransparent);// 不知道干什么的东西
            var meshTransparent = new THREE.Mesh(geometryTransparent, materialTransparent);// 创建Mesh
            meshTransparent.name = Name;
            if (this.IsEnableShadow) {
                meshTransparent.castShadow = true;
                meshTransparent.receiveShadow = true;
            }
            this.MeshsDict[Name][1] = meshTransparent;// 加入字典


        }
        this.scene.add(this.MeshsDict[Name][0]);// 加入场景
        this.scene.add(this.MeshsDict[Name][1]);// 加入场景
    }

    DrawMarkBox(x, y, z) {
        var pos = [
            [0, 0, 0],
            [1, 1, 1],
            [1, 1, 0],
            [0, 1, 0],
            [0, 1, 1],
            [1, 0, 1],
            [1, 0, 0],
            [0, 0, 0],
            [0, 0, 1]];
        //var pos = [
        //    [0, 0, 0],
        //    [0.5, 0.5, 0.5],
        //    [0.5, 0.5, -0.5],
        //    [-0.5, 0.5, -0.5],
        //    [-0.5, 0.5, 0.5],
        //    [0.5, -0.5, 0.5],
        //    [0.5, -0.5, -0.5],
        //    [-0.5, -0.5, -0.5],
        //    [-0.5, -0.5, 0.5]];

        let order = [1, 2, 3, 4, 1, 5, 6, 7, 8, 4, 3, 7, 6, 2, 1, 5, 8]

        if (this.show == null) {
            let material = new THREE.LineBasicMaterial({
                color: 0x000000
            });
            material.linewidth = 200;
            let points = [];
            order.forEach(i => {
                points.push(new THREE.Vector3(pos[i][0], pos[i][1], pos[i][2]));
            });
            let geometry = new THREE.BufferGeometry().setFromPoints(points);
            this.show = new THREE.Line(geometry, material);
            this.show.position.set(x, y, z)
            this.scene.add(this.show);
        }
        if (this.show.position.x != x || this.show.position.y != y || this.show.position.z != z) {
            this.show.position.set(x, y, z)
        }
        this.show.visible = true;
    }
    /**
     * 隐藏指定Mesh，使该Mesh暂时不被渲染
     * @param {any} Name
     */
    HideMesh(Name) {
        this.scene.remove(this.MeshsDict[Name][0])
        this.scene.remove(this.MeshsDict[Name][1])
    }
    /**
     * 移除指定Mesh，并且释放全部相关资源
     * @param {any} Name
     */
    ReleaseMesh(Name) {
        let mesh = this.MeshsDict[Name];
        this.scene.remove(mesh[0]);
        this.scene.remove(mesh[1]);
        mesh[0].geometry.dispose();
        mesh[0].material.dispose();
        mesh[1].geometry.dispose();
        mesh[1].material.dispose();
        delete this.MeshsDict[Name];
    }
    GetIntersection() {
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        var intersects = this.raycaster.intersectObjects(this.scene.children.filter(c => c.type == "Mesh" && c.name != "item"));
        return intersects;
        //console.log(intersects);
    }
    GetIntersectionAboutGroup() {
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        var intersects = this.raycaster.intersectObjects(this.scene.children);
        return intersects;
    }

    UVConstant = [
        { // 上
            textureRow: 0,
            face: [0, 1, 0,],
            relatively: [
                { position: [0, 1, 1], uv: [1, 1], },
                { position: [1, 1, 1], uv: [0, 1], },
                { position: [0, 1, 0], uv: [1, 0], },
                { position: [1, 1, 0], uv: [0, 0], },
            ],
        },
        { // 下
            textureRow: 5,
            face: [0, -1, 0,],
            relatively: [
                { position: [1, 0, 1], uv: [1, 0], },
                { position: [0, 0, 1], uv: [0, 0], },
                { position: [1, 0, 0], uv: [1, 1], },
                { position: [0, 0, 0], uv: [0, 1], },
            ],
        },
        { // 左
            textureRow: 1,
            face: [-1, 0, 0,],
            relatively: [
                { position: [0, 1, 0], uv: [0, 1], },
                { position: [0, 0, 0], uv: [0, 0], },
                { position: [0, 1, 1], uv: [1, 1], },
                { position: [0, 0, 1], uv: [1, 0], },
            ],
        },
        { // 右
            textureRow: 2,
            face: [1, 0, 0,],
            relatively: [
                { position: [1, 1, 1], uv: [0, 1], },
                { position: [1, 0, 1], uv: [0, 0], },
                { position: [1, 1, 0], uv: [1, 1], },
                { position: [1, 0, 0], uv: [1, 0], },
            ],
        },
        { // 前
            textureRow: 3,
            face: [0, 0, 1,],
            relatively: [
                { position: [0, 0, 1], uv: [0, 0], },
                { position: [1, 0, 1], uv: [1, 0], },
                { position: [0, 1, 1], uv: [0, 1], },
                { position: [1, 1, 1], uv: [1, 1], },
            ],
        },
        { // 后
            textureRow: 4,
            face: [0, 0, -1,],
            relatively: [
                { position: [1, 0, 0], uv: [0, 0], },
                { position: [0, 0, 0], uv: [1, 0], },
                { position: [1, 1, 0], uv: [0, 1], },
                { position: [0, 1, 0], uv: [1, 1], },
            ],
        },
    ];
}
;