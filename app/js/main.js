/**
 * Created by joel kaufman
 */
'use strict';

(function (ng, window, mod, undefined){

    var $ = angular.element;

    String.prototype.isEmpty = function() {
        return (this.length === 0 || !this.trim());
    };

    ng.module(mod, [])
        .directive("categories", categories)
        .directive("category", category)
    ;

    var tpl = {
        categories:
            '<h2>'+
            '   <span ng-repeat="crumb in breadCrumbs" ng-click="setLevel($index +1)">{{crumb.Name}} / </span>'+
            '</h2>'+
            '<ul class="categories">'+
            '   <li class="category-root" ng-repeat="category in categories" category="category"></li>'+
            '</ul>',

        category:
            '<li ng-class="{\'category-leaf\': ! category.children}" ng-click="select($event)"></li>',

        categoryChildren:
            '<ul>' +
            '   <li ng-repeat="category in category.children" category="category"></li>' +
            '</ul>'
    };


    function categories(){

        function compile(el, attrs){
            attrs.$template = el.html();
            el.html(tpl.categories);
            return ng.noop;
        }

        function controller($scope, $attrs){

            var controllers = [];
            $scope.breadCrumbs =[];

            this.getTemplate = function(){
                return $attrs.$template;
            };

            this.getSelected = function(){
                return $scope.categoryModel;
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

                $scope.categoryModel = $scope.breadCrumbs[$scope.breadCrumbs.length -1];
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
            template:angular.noop,
            scope: {
                categories:"=",
                categoryModel: '=',
                breadCrumbs:'=',
            },
            compile: compile,
            controller: controller
        };
    }




    function category($compile){

        var template =
            '<li ng-class="{\'category-leaf\': ! category.children}" ng-click="select($event)"><div class="category-name">{{ category.Name }}</div></li>';

        var childrenTemplate =
            '<ul>' +
            '   <li ng-repeat="category in category.children" category="category"></li>' +
            '</ul>';


        function controller($scope, $element)
        {
            var categoriesCtrl= $element.controller('categories');
            var parentCtrl = $element.parent().controller('category');

            this.select = function(reset){
                categoriesCtrl.addSelected($scope.category, this, reset);
                if(parentCtrl){
                    parentCtrl.select();
                }else{
                    categoriesCtrl.select();
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

                categoriesCtrl.onRemoveCategory($scope.category);
            });
        }


        function link(scope, el, attrs, ctrl)
        {
            var categoriesCtrl= el.controller('categories');

            var customTemplate = categoriesCtrl.getTemplate();

            if(! customTemplate.isEmpty()){
                customTemplate =  $(customTemplate);
                el.append(customTemplate);
                $compile(customTemplate)(scope);
            }

            var $el = $(tpl.categoryChildren);
            el.append($el);
            $compile($el)(scope);

            if(categoriesCtrl.getSelected() == scope.category) ctrl.select(true);

            scope.select = function($event){
                $event.stopPropagation();
                ctrl.select(true);
            };
        }

        return {
            template: tpl.category,
            replace: true,
            require:'category',
            controller: controller,
            scope: {
                category: '='
            },
            link: link
        };
    }

}(angular, window, 'app'));