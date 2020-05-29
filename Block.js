class Block {
    /** @type {number} */
    id;
    /** @type {number} */
    TextureColumn;
    /** @type {string} */
    Name;
    /** @type {boolean} */
    IsTransparent;
    constructor(id, TextureColumn, Name, IsTransparent) { this.id = id; this.TextureColumn = TextureColumn; this.Name = Name; this.IsTransparent = IsTransparent }
    /**
     * 
     * @param {{id:number,Name:string,IsTransparent:boolean}[]} Config
     */
    static GetBlockList(Config) {
        var Blocks = [];
        for (var { id, Name, IsTransparent } of Config) {
            Blocks[id] = new Block(id, id, Name, IsTransparent);
        }
        return Blocks;
    }
    /**
     * 
     * @param {Block[]} Blocks
     */
    static FromListGetTextureColumns(Blocks) {
        var TextureColumns = [];
        Blocks.forEach(element => {
            TextureColumns[element.id] = element.TextureColumn;
        });
        return TextureColumns;
    }
}