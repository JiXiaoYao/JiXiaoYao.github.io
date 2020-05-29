class Builder {
    /** @type {World} */
    world;
    constructor(world) {
        this.world = world;
        this.Noise = noise;
        this.Noise.seed(Math.random() * 25565);
    }

    CreateChunk(Fingerprint) {
        let chunk = Chunk.CreateChunkFromFingerprint(Fingerprint);
        let min = chunk.MinCoordinate;
        let max = chunk.MaxCoordinate;
        for (let x = min.x; x <= max.x; x++)
            for (let z = min.z; z <= max.z; z++) {
                let value = this.Noise.simplex2(x / 75, z / 75) + 1;
                value = parseInt(value * (255 / 16)) + 32;
                this.world.Set(x, value, z, 2);
                for (let y = value - 1; y >= 0; y--) {
                    this.world.Set(x, y, z, 1);
                    if (Math.random() < 0.3)
                        this.world.Set(x, y, z, 15);
                    if (Math.random() < 0.15)
                        this.world.Set(x, y, z, 14);
                    if (Math.random() < 0.15)
                        this.world.Set(x, y, z, 73);
                    if (Math.random() < 0.05)
                        this.world.Set(x, y, z, 56);
                    if (y < 1)
                        this.world.Set(x, y, z, 7);
                }
                for (let y = value + 1; y < 256; y++) {
                    //if (y < 64)
                    //    this.world.Set(x, y, z, 2);
                    //else
                    //    this.world.Set(x, y, z, 0);
                    if (!this.world.IsBlockExist(x, y, z))
                        if (y < 40)
                            this.world.Set(x, y, z, 8);
                        else
                            this.world.Set(x, y, z, 0);
                }
                if (Math.random() < 0.01 && value > 45) {
                    this.treeData.leaves[1].forEach(leave => {
                        this.world.Set(x + leave[0], value + 4, z + leave[1], 18);
                    });
                    this.treeData.leaves[2].forEach(leave => {
                        this.world.Set(x + leave[0], value + 4, z + leave[1], 18);
                    });
                    this.treeData.leaves[1].forEach(leave => {
                        this.world.Set(x + leave[0], value + 5, z + leave[1], 18);
                    });
                    this.world.Set(x, value + 6, z, 18);

                    this.treeData.wood.forEach(block => {
                        this.world.Set(x + block[0], value + block[1], z + block[2], 17);
                    });
                }
            }
    }
    treeData = {
        wood: [[0, 0, 0],
        [0, 1, 0],
        [0, 2, 0],
        [0, 3, 0],
        [0, 4, 0],
        [0, 5, 0],],
        leaves: [[
            [0, 0]
        ],
        [
            [1, 0], [-1, 0],
            [0, 1], [0, -1],
            [-1, 1], [1, 1],
            [-1, -1], [1, -1]],
        [
            [-2, 2], [-1, 2], [0, 2], [1, 2],
            [2, 2], [2, 1], [2, 0], [2, -1],
            [2, -2], [1, -2], [0, -2], [-1, -2],
            [-2, -2], [-2, -1], [-2, 0], [-2, 1]
        ],
        ]
    };
}