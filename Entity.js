class Entity {
    /** @type {{x:number,y:number,z:number}} */
    position;
    /** @type {{x:number,z:number}} */
    direction;
    /** @type {{x:number,y:number,z:number}} */
    velocity;
    /** @type {string} */
    Name;
    /** @type {Function} */
    GetID;
    /** @type {Block[]} */
    Blocks = [];
    gravity = 9.8;
    lastTime = null;
    /** @type {Mesh} */
    Mesh;
    FindGround;
    isDeath = false;
    blood = 10;
    cd = 2;
    /**
     * 
     * @param {string} Name
     * @param {{x:number,y:number,z:number}} position
     * @param {{x:number,z:number}} direction
     * @param {{x:number,y:number,z:number}} velocity
     * @param {Block[]} Blocks
     * @param {Function} GetID
     * @param {any} Mesh
     */
    constructor(Name, position, direction, velocity, GetID, Blocks, Mesh) {
        this.Name = Name;
        this.position = position;
        this.direction = direction;
        this.velocity = velocity;
        this.GetID = GetID;
        this.Mesh = Mesh;
        this.Blocks = Blocks;
        this.gravity *= 2;
    }
    Move() {
        if (this.lastTime == null)
            this.lastTime = new Date();
        else {
            let time = new Date() - this.lastTime;
            this.lastTime = new Date();
            let Miny = this.FindGround(Math.floor(this.position.x), Math.floor(this.position.y), Math.floor(this.position.z))

            let x = this.position.x;
            let y = this.position.y;
            let z = this.position.z;
            var d = { x: 0, z: 0 }
            if (this.velocity.x > 0) d.x = 1;
            if (this.velocity.x < 0) d.x = -1;
            if (this.velocity.z > 0) d.z = 1;
            if (this.velocity.z < 0) d.z = -1;

            if (this.GetID(Math.floor(x + (d.x / 2)), Math.floor(y), Math.floor(z)) == 0) {
                x += (this.velocity.x * (time / 1000));
            }
            else
                if (this.GetID(Math.floor(x + (d.x / 2)), Math.floor(y) + 1, Math.floor(z)) == 0 /*&& this.velocity.x > 0.3*/ && this.velocity.y < 1 && Math.abs(Miny - y) < 0.1) {
                    this.velocity.y = this.gravity / 2.5;
                }

            if (this.GetID(Math.floor(x), Math.floor(y), Math.floor(z + (d.z / 2))) == 0)
                z += (this.velocity.z * (time / 1000));
            else
                if (this.GetID(Math.floor(x), Math.floor(y) + 1, Math.floor(z + (d.z / 2))) == 0 /*&& this.velocity.z > 0.3*/ && this.velocity.y < 1 && Math.abs(Miny - y) < 0.1) {
                    this.velocity.y = this.gravity / 2.5;
                }

            if (this.GetID(Math.floor(x), Math.floor(y + 1), Math.floor(z)) == 0 || this.velocity.y > 0)
                y += (this.velocity.y * (time / 1000));

            if (Math.abs(Miny - y) < 0.1 && this.velocity.y < 0) {
                //    console.log("落地速度" + this.velocity.y + "m/s")
                this.velocity.y = 0;
                y = Miny;
            }
            else if (parseInt(Miny) > parseInt(y) && this.velocity.y < -this.gravity) {
                y = Miny;
            } else {
                this.velocity.y -= (this.gravity * (time / 1000));
            }

            this.position.y = y;
            this.position.x = x;
            this.position.z = z;
        }
        this.Mesh.position.x = this.position.x;
        this.Mesh.position.y = this.position.y + this.cd;
        this.Mesh.position.z = this.position.z;
        // this.Mesh.rotation.y += 0.01;
    }
    SetMove(x, z, Look) {
        this.velocity.x = x;
        this.velocity.z = z;
        this.Mesh.lookAt(
            Look.x,
            this.Mesh.position.y,
            Look.z,
        )
    }
    GetRamdonMove() {
        if (Math.random() > 0) {
            if (Math.random() > 0.5)
                this.velocity.x = Math.random()
            if (Math.random() > 0.5)
                this.velocity.x = -Math.random();
            if (Math.random() > 0.5)
                this.velocity.z = Math.random();
            if (Math.random() > 0.5)
                this.velocity.z = -Math.random();
            let m = Math.pow(
                Math.pow(this.velocity.x, 2) +
                Math.pow(this.velocity.z, 2)
                , 0.5);
            this.velocity.x /= m / 2;
            this.velocity.z /= m / 2;
            this.Mesh.lookAt(
                this.Mesh.position.x + this.velocity.x,
                this.Mesh.position.y,
                this.Mesh.position.z + this.velocity.z,
            )

            //      this.Mesh.rotation.y = MathUtils.degToRad(this.getAngle(this.velocity.x / 2, this.velocity.z / 2, 0, 1) - (Math.PI / 2));
        }
        else {
            this.velocity.z = 0;
            this.velocity.x = 0;
        }
    }
    getAngle(x1, y1, x2, y2) {
        var x = x1 - x2,
            y = y1 - y2;
        if (!x && !y) {
            return 0;
        }
        var angle = (180 + Math.atan2(-y, -x) * 180 / Math.PI + 360) % 360;
        return 360 - angle;
    }

}
class CoordinateSystem {

    /**
     * Coordinate System Transformation
     * 坐标系变换
     * 变换
     * @param {number} x
     * @param {number} y
     * @param {number} vectori
     * @param {number} vectorj
     */
    static CSTIn(x, y, vectori, vectorj) {
        var X = x * vectori[0] + y * vectorj[0];
        var Y = x * vectori[1] + y * vectorj[1];
        return [X, Y];
    }
    /**
     * Coordinate System Transformation
     * 坐标系变换
     * 还原
     * @param {number} x
     * @param {number} y
     * @param {number[]} vectori
     * @param {number[]} vectorj
     */
    static CSTOut(x, y, vectori, vectorj) {
        var Inv = this.MatrixInversion([vectori, vectorj]);
        x = x * Inv[0][0] + y * Inv[1][0];
        y = x * Inv[0][1] + y * Inv[1][1];
        return [x, y];
    }
    /**
     * 
     * @param {number[][]} Matrix
     */
    static MatrixInversion(Matrix) {
        // 求原矩阵行列式
        var determinant = (Matrix[0][0] * Matrix[1][1]) - (Matrix[0][1] * Matrix[1][0]);
        // 翻转矩阵并且对角线乘以负一
        var temp = Matrix[0][0];
        Matrix[0][0] = Matrix[1][1];
        Matrix[1][1] = temp;
        Matrix[0][1] *= -1;
        Matrix[1][0] *= -1;
        // 除以行列式
        for (var i = 0; i < Matrix.length; i++)
            for (var j = 0; j < Matrix[i].length; j++)
                Matrix[i][j] /= determinant;
        return Matrix;
    }
}