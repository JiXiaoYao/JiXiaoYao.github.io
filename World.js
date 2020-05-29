class World {
    /** @type {View} */
    View;
    /** @type {number[]} */
    TextureColumn;
    /** @type {Block[]} */
    Blocks;
    Quadrant_1 = []; // 1,1,1
    Quadrant_2 = []; // -1,1,1
    Quadrant_3 = []; // -1,1,-1
    Quadrant_4 = []; // 1,1,-1
    /**
     * 区块数组
     * @type {Chunk}
     */
    Chunks = [];
    /**
     * 可见区块指纹数组
     * @type {number[]}
     */
    VisibleChunks = [];
    /**
     * 构造方法
     * @param {any} map
     * @param {View} view
     * @param {Block[]} Blocks
     */
    constructor(map, view, Blocks) {
        this.Quadrant_1 = map.Quadrant_1;
        this.Quadrant_2 = map.Quadrant_2;
        this.Quadrant_3 = map.Quadrant_3;
        this.Quadrant_4 = map.Quadrant_4;
        this.View = View;
        this.TextureColumn = Block.FromListGetTextureColumns(Blocks);
        this.Blocks = Blocks;
        this.View = view;
    }
    Get(x, y, z) {
        if (this.IsBlockExist(x, y, z))
            switch (this.QuadrantCheck(x, y, z)) {
                case 1:
                    return this.Quadrant_1[x][y][z];
                    break;
                case 2:
                    return this.Quadrant_2[-x][y][z];
                    break;
                case 3:
                    return this.Quadrant_3[-x][y][-z];
                    break;
                case 4:
                    return this.Quadrant_4[x][y][-z];
                    break;
            }
        else return -1;
    }
    Set(x, y, z, id) {
        let Q = this.QuadrantCheck(x, y, z);
        switch (Q) {
            case 1:
                this.SetArrayValue(this.Quadrant_1, x, y, z, id);
                break;
            case 2:
                this.SetArrayValue(this.Quadrant_2, -x, y, z, id);
                break;
            case 3:
                this.SetArrayValue(this.Quadrant_3, -x, y, -z, id);
                break;
            case 4:
                this.SetArrayValue(this.Quadrant_4, x, y, -z, id);
                break;
        }
    }
    SetArrayValue(Array, x, y, z, Value) {
        if (Array[x] == undefined)
            Array[x] = [];
        if (Array[x][y] == undefined)
            Array[x][y] = [];
        if (x < 0 || y < 0 || z < 0) {
            //console.log({ x: x, y: y, z: z });
        }
        Array[x][y][z] = Value;
    }
    QuadrantCheck(x, y, z) {
        if (x >= 0)
            if (z >= 0)
                return 1;
            else
                return 4;
        else
            if (z >= 0)
                return 2;
            else
                return 3;
    }
    /**
     * 检测对于坐标是否存在
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    IsBlockExist(x, y, z) {
        switch (this.QuadrantCheck(x, y, z)) {
            case 1:
                return this.IsInArray(this.Quadrant_1, x, y, z);
            case 2:
                return this.IsInArray(this.Quadrant_2, -x, y, z);
            case 3:
                return this.IsInArray(this.Quadrant_3, -x, y, -z);
            case 4:
                return this.IsInArray(this.Quadrant_4, x, y, -z);
        }
    }
    /**
     * 检测坐标是否在一个数组中
     * @param {number[]} array
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    IsInArray(array, x, y, z) {
        if (array.length > x) if (array[x] != undefined)
            if (array[x].length > y) if (array[x][y] != undefined)
                if (array[x][y].length > z) if (array[x][y][z] != undefined)
                    return true;
        return false;
    }
    /**
     * 加载区块
     * @param {number[]} Fingerprint
     */
    LoadChunk(Fingerprint) {
        let world = this;
        var chunk = null;
        if (!Array.isArray(this.Chunks[Fingerprint[0]]))
            this.Chunks[Fingerprint[0]] = [];
        if (this.Chunks[Fingerprint[0]][Fingerprint[1]] == undefined) {
            chunk = Chunk.CreateChunkFromFingerprint(Fingerprint);
            chunk.CreateFlatData(function (x, y, z) {
                if (world.IsBlockExist(x, y, z))
                    return world.Get(x, y, z);
                else return 0;
            });
            this.Chunks[Fingerprint[0]][Fingerprint[1]] = chunk;
        }
        else
            chunk = this.Chunks[Fingerprint[0]][Fingerprint[1]];
        this.View.DrawCubes(chunk.FlatData, this.TextureColumn, this.View.UVConstant,/* this.Get,*/ JSON.stringify(Fingerprint));
        this.VisibleChunks.push(JSON.stringify(Fingerprint));
        console.log("加载区块:" + Fingerprint);
    }
    /**
     * 卸载区块
     * @param {number[]} Fingerprint
     */
    UnloadChunk(Fingerprint) {
        this.View.HideMesh(JSON.stringify(Fingerprint))
        this.VisibleChunks.splice(this.VisibleChunks.indexOf(JSON.stringify(Fingerprint)), 1);
        console.log("卸载区块:" + Fingerprint);
    }
    /**
     * 区块更新
     * @param {number[]} Fingerprint
     * @param {{x:number,z:number}} Fingerprint
     */
    UpdateChunk(Fingerprint, changePoint) {
        this.View.ReleaseMesh(JSON.stringify(Fingerprint))
        this.VisibleChunks.splice(this.VisibleChunks.indexOf(JSON.stringify(Fingerprint)), 1);
        this.Chunks[Fingerprint[0]][Fingerprint[1]] = undefined;
        this.LoadChunk(Fingerprint);
        if (changePoint.x == Fingerprint[0] * 16)
            this.UpdateChunk([Fingerprint[0] - 1, Fingerprint[1]], changePoint)
        if (changePoint.x == (Fingerprint[0] * 16) + 15)
            this.UpdateChunk([Fingerprint[0] + 1, Fingerprint[1]], changePoint)
        if (changePoint.z == Fingerprint[1] * 16)
            this.UpdateChunk([Fingerprint[0], Fingerprint[1] - 1], changePoint)
        if (changePoint.z == (Fingerprint[1] * 16) + 15)
            this.UpdateChunk([Fingerprint[0], Fingerprint[1] + 1], changePoint)
    }
    /**
     * 检查区块是否存在
     * @param {number[]} Fingerprint
     */
    IsChunkExist(Fingerprint) {
        if (this.Chunks[Fingerprint[0]] != undefined)
            if (this.Chunks[Fingerprint[0]][Fingerprint[1]] != undefined)
                return true;
        return false;
    }
    /**
     * 
     * @param {{x:number,y:number,z:number}} vector
     */
    GetIntersection() {
        this.View.GetIntersection();
    }
    ///**
    // *
    // * @param {{x:number,y:number,z:number}} position
    // * @param {{x:number,y:number,z:number}} vector
    // */
    //GetSeeCoordinate(position, vector) {
    //    var count = 0;
    //    while (this.Get(this.Int(position.x, vector.x), this.Int(position.y, vector.y), this.Int(position.z, vector.z)) == 0 && count < 100) {
    //        position.x += vector.x / 10;
    //        position.y += vector.y / 10;
    //        position.z += vector.z / 10;
    //        count++;
    //    }
    //    position.x = this.Int(position.x, vector.x);
    //    position.y = this.Int(position.y, vector.y);
    //    position.z = this.Int(position.z, vector.z);
    //    if (this.Get(position.x, position.y, position.z) > 0)
    //        return position;
    //    else
    //        return null;
    //}
    GetFocus() {
        let Intersection = view.GetIntersection();
        for (let { distance, face, point, object } of Intersection) {
            if (distance < 10) {
                let x = Math.floor(point.x - face.normal.x);
                let y = Math.floor(point.y - face.normal.y);
                let z = Math.floor(point.z - face.normal.z);
                if (face.normal.y == -1)
                    y = Math.floor(point.y);
                if (face.normal.x == -1)
                    x = Math.floor(point.x);
                if (face.normal.z == -1)
                    z = Math.floor(point.z);
                return {
                    position: { x: x, y: y, z: z },
                    rawposition: { x: point.x, y: point.y, z: point.z },
                    normal: face.normal,
                    ChunkName: object.name
                };
            }
            else return false;
        }
        return false;
    }
    //GetEntity() {
    //    let Intersection = view.GetIntersection();
    //    for (let { distance, face, point, object } of Intersection) {
    //        if (distance < 10) {
    //            let x = Math.floor(point.x - face.normal.x);
    //            let y = Math.floor(point.y - face.normal.y);
    //            let z = Math.floor(point.z - face.normal.z);
    //            if (face.normal.y == -1)
    //                y = Math.floor(point.y);
    //            if (face.normal.x == -1)
    //                x = Math.floor(point.x);
    //            if (face.normal.z == -1)
    //                z = Math.floor(point.z);
    //            return {
    //                position: { x: x, y: y, z: z },
    //                rawposition: { x: point.x, y: point.y, z: point.z },
    //                normal: face.normal,
    //                ChunkName: object.name
    //            };
    //        }
    //        else return false;
    //    }
    //    return false;
    //}
    Int(x1, x0) {
        return Math.round(x1);
        if (x1 - x0)
            return Math.ceil(x1);
        else
            return Math.floor(x1);
    }
}

/** 区块类 */
class Chunk {
    /**
     * 区块指纹
     * @type {number[]} 
     */
    Fingerprint = [0, 0];
    Width = 16;
    Height = 16;
    /**
     * 区块中最小的坐标
     * @type {{x:number,y:number,z:number}}
     */
    MinCoordinate = { x: 0, y: 0, z: 0 }
    /**
     * 区块中最大的坐标
     * @type {{x:number,y:number,z:number}}
     */
    MaxCoordinate = { x: 15, y: 256, z: 15 }
    /**
     * 扁平的区块缓存数据
     * @type {{id:number,coordinate:{x:number,y:number,z:number}}[]}
     */
    FlatData = null;
    /**
     * 构造方法
     * @param {any} MinCoordinate 区块中最小的坐标
     * @param {any} MaxCoordinate 区块中最大的坐标
     */
    constructor(MinCoordinate, MaxCoordinate) {
        this.MinCoordinate = MinCoordinate;
        this.MaxCoordinate = MaxCoordinate;
        this.Fingerprint = [MinCoordinate.x / 16, MinCoordinate.z / 16];
    }
    /**
     * 创建区块的扁平数据
     * @param {function} getId
     */
    CreateFlatData(getId) {
        this.FlatData = [];
        let min = this.MinCoordinate;
        let max = this.MaxCoordinate;
        for (let x = min.x; x <= max.x; x++)
            for (let y = min.y; y <= max.y; y++)
                for (let z = min.z; z <= max.z; z++) {
                    if (getId(x, y, z) != 0)
                        this.FlatData.push({ id: getId(x, y, z), coordinate: { x: x, y: y, z: z } });
                }
        return this;
    }
    /**
     * 从指纹创建区块
     * @param {number[]} Fingerprint
     */
    static CreateChunkFromFingerprint(Fingerprint) {
        var min = { x: Fingerprint[0] * 16, y: 0, z: Fingerprint[1] * 16 }
        return new Chunk(min, { x: min.x + 15, y: 256, z: min.z + 15 });
    }
}