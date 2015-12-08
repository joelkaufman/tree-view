/**
 * Created by joel kaufman
 */
'use strict';

(function (ng, window, mod, undefined){

    var $ = angular.element;


    var tmpl = function(str){
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn = new Function("obj",
                "var p=[],print=function(){p.push.apply(p,arguments);};" +

                    // Introduce the data as local variables using with(){}
                "with(obj){p.push('" +

                    // Convert the template into pure JavaScript
                str
                    .replace(/[\r\t\n]/g, " ")
                    .split("<%").join("\t")
                    .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                    .replace(/\t=(.*?)%>/g, "',$1,'")
                    .split("\t").join("');")
                    .split("%>").join("p.push('")
                    .split("\r").join("\\'")
                + "');}return p.join('');");

        // Provide some basic currying to the user
        return fn;
    };



    String.prototype.isEmpty = function() {
        return (this.length === 0 || !this.trim());
    };

    ng.module(mod, [])
        .directive("treeView", treeView)
        .directive("treeItem", treeItem)
    ;

    var tpl = {
        treeView: tmpl(
            '<h2>'+
            '   <span ng-repeat="crumb in breadCrumbs" ng-click="setLevel($index +1)">{{crumb.Name}} / </span>'+
            '</h2>'+
            '<ul class="tree-view">'+
            '   <li class="item-root" ng-repeat="item in treeView" tree-item="item" children-name="<%= children %>" item-name="<%= item %>"></li>'+
            '</ul>'),

        treeItem:tmpl(
            "<li ng-class=\"{\\'item-leaf\': ! item.<%= children %>}\" ng-click=\"select($event)\"></li>"),

        itemChildren:tmpl(
            '<ul>' +
            '   <li ng-repeat="<%= item %> in <%= item %>.<%= children %>" children-name="<%= children %>" item-name="<%= item %>"  tree-item="<%= item %>"></li>' +
            '</ul>')
    };


    function treeView(){

        function compile(el, attrs){

            var item = 'item';
            var children = 'children';

            if(attrs.treeScope){
                var expression = attrs.treeScope;

                var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)??\s*$/);

                if (!match) {
                    throw ('tree-scope usage tree-view="item in items.children"\ntree-scope="' + attrs.treeScope + '" was given !\n');
                }

                item = match[1];
                children = match[2];
            }

            var template = tpl.treeView({item: item, children: children});

            attrs.$template = el.html();
            el.html(template);
            return ng.noop;
        }

        function controller($scope, $attrs){

            var controllers = [];
            $scope.breadCrumbs =[];

            this.getTemplate = function(){
                return $attrs.$template;
            };

            this.getSelected = function(){
                return $scope.treeModel;
            };

            this.reset = function(){
                ng.forEach(controllers, function(ctrl){
                    ctrl.reset();
                });

                $scope.breadCrumbs = [];
                controllers = [];
            };


            this.addSelected = function(category, ctrl, reset){
                if(reset) this.reset();

                controllers.unshift(ctrl);
                $scope.breadCrumbs.unshift(category);
            };

            this.select = function(){
                ng.forEach(controllers, function(ctrl,i){
                    ctrl.selectEl(i == controllers.length -1);
                });

                $scope.treeModel = $scope.breadCrumbs[$scope.breadCrumbs.length -1];
            };


            this.onRemoveCategory = function(category){

                var level = $scope.breadCrumbs.indexOf(category);

                $scope.setLevel(level);
            };

            $scope.setLevel = function(level){
                if((level < 1) || (level > controllers.length))return;

                controllers[level -1].select(true);
            };

        }

        return {
            template:ng.noop,
            compile: compile,
            controller: controller,
            restrict:'A',
            scope:{
                treeView: '=',
                treeModel:'='
            }
        };
    }




    function treeItem($compile){

        function getTemplate(el, attrs){
            return tpl.treeItem({item:attrs.itemName , children:attrs.childrenName});
        }

        function controller($scope, $element, $attrs)
        {
            var treeViewCtrl= $element.controller('treeView');
            var parentCtrl = $element.parent().controller('treeItem');

            this.select = function(reset){
                treeViewCtrl.addSelected($scope[$attrs.itemName], this, reset);
                if(parentCtrl){
                    parentCtrl.select();
                }else{
                    treeViewCtrl.select();
                }
            };

            this.selectEl = function(deepest){
                $element.addClass('expand');
                if(deepest) $element.addClass('selected');
            };

            this.reset = function(){
              $element.removeClass('expand selected');
            };

            $scope.$on('$destroy', function(e){
                if(e.defaultPrevented) return;
                e.preventDefault();

                treeViewCtrl.onRemoveCategory($scope[$attrs.itemName]);
            });
        }

        function link(scope, el, attrs, ctrl)
        {
            var treeViewCtrl= el.controller('treeView');

            var customTemplate = treeViewCtrl.getTemplate();

            if(! customTemplate.isEmpty()){
                customTemplate =  $(customTemplate);
                el.append(customTemplate);
                $compile(customTemplate)(scope);
            }

            var $el = $(tpl.itemChildren({item:attrs.itemName, children:attrs.childrenName}));
            el.append($el);
            $compile($el)(scope);

            if(treeViewCtrl.getSelected() == scope.category) ctrl.select(true);

            scope.select = function($event){
                $event.stopPropagation();
                ctrl.select(true);
            };
        }

        return {
            template:getTemplate,
            require:'treeItem',
            controller: controller,
            scope:true,
            replace: true,
            link: link
        };
    }

}(angular, window, 'app'));