/**
 * @ngdoc directive
 * @name mdStep
 * @module md-steppers
 *
 * @restrict E
 *
 * @description TODO DOCS
 * Based on md-tabs by angular material https://github.com/angular/material
 *
 */
angular
    .module('md-steppers')
    .directive('mdStep', ["$http", MdStep]);

function MdStep($http) {
    return {
        require: '^?mdSteppers',
        terminal: true,
        compile: function (element, attr) {
            var label = firstChild(element, 'md-step-label'),
                body = firstChild(element, 'md-step-body'),
                actions = firstChild(element, 'md-step-actions');

            if (label.length == 0) {
                label = angular.element('<md-step-label></md-step-label>');
                if (attr.label) label.text(attr.label);
                else label.append(element.contents());

                if (body.length == 0) {
                    var contents = element.contents().detach();
                    body = angular.element('<md-step-body></md-step-body>');
                    body.append(contents);
                }
            }

            element.append(label);
            if (body.html()) element.append(body);

            return postLink;
        },
        scope: {
            complete: '=?mdComplete',
            active: '=?mdActive',
            disabled: '=?ngDisabled',
            select: '&?mdOnSelect',
            deselect: '&?mdOnDeselect',
            stepTemplateUrl: '@stepTemplateUrl'
        }
    };

    function postLink(scope, element, attr, ctrl) {
        if (!ctrl) return;

        $http.get(scope.stepTemplateUrl)
            .then(function succCb(result){
                setupDirectiveStuff(result.data);
            }, function errCb(error){
                console.error("Could not load template: " + error);
            });

        function setupDirectiveStuff(templateBody){
        var index = ctrl.getStepElementIndex(element),
            body = firstChild(element, 'md-step-body').remove(),
            label = firstChild(element, 'md-step-label').remove(),
            data = ctrl.insertStep({
                scope: scope,
                parent: scope.$parent,
                index: index,
                element: element,
                template: templateBody,
                label: label.html()
            }, index);

        scope.select = scope.select || angular.noop;
        scope.deselect = scope.deselect || angular.noop;

        scope.$watch('active', function (active) {
            if (active) ctrl.select(data.getIndex());
        });
        scope.$watch('complete', function () {
            ctrl.refreshIndex();
        });
        scope.$watch('disabled', function () {
            ctrl.refreshIndex();
        });
        scope.$watch(
            function () {
                return ctrl.getStepElementIndex(element);
            },
            function (newIndex) {
                data.index = newIndex;
                ctrl.updateStepOrder();
            }
        );
        scope.$on('$destroy', function () {
            ctrl.removeStep(data);
        });}
    }

    function firstChild(element, tagName) {
        var children = element[0].children;
        for (var i = 0, len = children.length; i < len; i++) {
            var child = children[i];
            if (child.tagName === tagName.toUpperCase()) return angular.element(child);
        }
        return angular.element();
    }
}
