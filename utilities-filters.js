﻿"use strict";

define(['angular'], function () {

    angular.module("jedi.utilities.filters", []).filter('jdSelected', function () {
        return function (list, field) {
            if (!field) {
                field = 'selected';
            }
            return _.filter(list, function (item) { return item[field] == true });
        };
    }).filter('jdBoolToText', ['$injector', function ($injector) {
        var localize;
        try {
            localize = $injector.get('jedi.i18n.Localize');
        } catch (e) { }

        var yes = (localize ? (localize.getDefaultLanguage().indexOf('pt') >= 0 ? localize.get("Sim") : localize.get("Yes")) : "Yes");
        var no = (localize ? (localize.getDefaultLanguage().indexOf('pt') >= 0 ? localize.get("Não") : localize.get("No")) : "No");

        return function (boolValue) {
            if (boolValue === true)
                return yes;
            else
                return no
        }
    }]).filter('jdTranslate', function () {
        return (function (value) {
            //arguments[0] é ignorado porque é igual ao 'value' recebido pelo parâmetro.
            //Estrutura para entendimento: 
            //-> arguments em uma posição(i) ímpar é o valor que será comparado com o 'value'
            //-> caso seja igual, retorno o texto(string) associado a esse valor, que é arguments[i + 1].
            //Exemplo:
            //arguments[1] == true e arguments[2] == 'Sim'
            for (var i = 1; i < arguments.length; i = i + 2) {
                if (arguments[i] === value) {
                    return arguments[i + 1];
                }
            }
        })
    }).filter('jdCapitalize', function () {
        return function (input) {
            return input.charAt(0).toUpperCase() + input.substr(1);
        }
    });
});