(function(){

    var test = [{"ID": 9, "Name": "Cracked", "ParentFaultID": 7, "Active": true}, {
        "ID": 8,
        "Name": "Door",
        "ParentFaultID": 4,
        "Active": true
    }, {"ID": 6, "Name": "Door", "ParentFaultID": 3, "Active": true}, {
        "ID": 3,
        "Name": "Forklift Damage",
        "ParentFaultID": null,
        "Active": true
    }, {"ID": 7, "Name": "Frame", "ParentFaultID": 4, "Active": true}, {
        "ID": 5,
        "Name": "Frame",
        "ParentFaultID": 3,
        "Active": true
    }, {"ID": 4, "Name": "Manufacturer Defect", "ParentFaultID": null, "Active": true}, {
        "ID": 10,
        "Name": "Not Grooved",
        "ParentFaultID": 7,
        "Active": true
    }];


    function getNestedChildren(arr, parent) {
        var out = []
        for (var i in arr) {
            if (arr[i].ParentFaultID == parent) {
                var children = getNestedChildren(arr, arr[i].ID)

                if (children.length) {
                    arr[i].children = children;
                }
                out.push(arr[i]);
            }
        }
        return out;
    }

    angular.module('app').controller('test',function($scope){
        $scope.data = getNestedChildren(test,null);
        window.test = $scope.data;


        $scope.myCategory =  $scope.data[0].children[1];

        $scope.remove = function(){
            $scope.data[1].children[1].children.pop()
        };



        $scope.add = function(){
            $scope.data[0].children.push({
                Name: $scope.child
            });

            $scope.child = '';
        }

    });


}());