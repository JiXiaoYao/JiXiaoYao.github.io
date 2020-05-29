class Config {
    static GetMap() {
        let MapData = { Quadrant_1: [], Quadrant_2: [], Quadrant_3: [], Quadrant_4: [] };
        /*  $.ajax({
              type: "GET",
              url: "map.json",
              async: false,
              success: function (e) {
                  console.log("map get ok");
                  MapData.Quadrant_1 = e.Quadrant_1;
                  MapData.Quadrant_2 = e.Quadrant_2;
                  MapData.Quadrant_3 = e.Quadrant_3;
                  MapData.Quadrant_4 = e.Quadrant_4;
              }
          });*/
        var arr = [];
        for (var i = 0; i < 4; i++) {
            arr[i] = [];
            for (let x = 0; x <= 100; x++) {
                arr[i][x] = [];
                for (let y = 0; y <= 100; y++) {
                    arr[i][x][y] = [];
                    for (let z = 0; z <= 100; z++) {
                        arr[i][x][y][z] = 0;
                        if (y < 25 && x < z && y < x) {
                            if (Math.random() > 0.5)
                                arr[i][x][y][z] = 1;
                            else
                                arr[i][x][y][z] = 3;
                        }
                    }
                }
            }
        }
        //MapData.Quadrant_1 = arr[0];
        //MapData.Quadrant_2 = arr[1];
        //MapData.Quadrant_3 = arr[2];
        //MapData.Quadrant_4 = arr[3];
        //MapData.Quadrant_1[0][24][0] = 0;
        return MapData;
    }
    static GetBlockConfig() {
        let Result = "";
        $.ajax({
            type: "GET",
            url: "/textures/Texture.json",
            async: false,
            success: function (e) {
                Result = e;
            }
        });
        return Result;
    }
}