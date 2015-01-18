var scopedPolyFill = (function (doc, undefined) {

    // check for support of scoped and certain option
    var compat = (function () {
        var check = doc.createElement('style')
        , DOMStyle = 'undefined' !== typeof check.sheet ? 'sheet' : 'undefined' !== typeof check.getSheet ? 'getSheet' : 'styleSheet'
        , scopeSupported = undefined !== check.scoped
        , testSheet
        , DOMRules
        , testStyle
        ;

        // we need to append it to the DOM because the DOM element at least FF keeps NULL as a sheet utill appended
        // and we can't check for the rules / cssRules and changeSelectorText untill we have that

        doc.body.appendChild(check);
        testSheet = check[DOMStyle];

        // add a test styleRule to be able to test selectorText changing support
        // IE doesn't allow inserting of '' as a styleRule
        testSheet.addRule ? testSheet.addRule('c', 'blink') : testSheet.insertRule('c{}', 0);

        // store the way to get to the list of rules
        DOMRules = testSheet.rules ? 'rules' : 'cssRules';

        // cache the test rule (its allways the first since we didn't add any other thing inside this <style>
        testStyle = testSheet[DOMRules][0];

        // try catch it to prevent IE from throwing errors
        // can't check the read-only flag since IE just throws errors when setting it and Firefox won't allow setting it (and has no read-only flag
        try {
            testStyle.selectorText = 'd';
        } catch (e) { }

        // check if the selectorText has changed to the value we tried to set it to
        // toLowerCase() it to account for browsers who change the text
        var changeSelectorTextAllowed = 'd' === testStyle.selectorText.toLowerCase();

        // remove the <style> to clean up
        check.parentNode.removeChild(check);

        // return the object with the appropriate flags
        return {
            scopeSupported: scopeSupported
        , rules: DOMRules
        , sheet: DOMStyle
        , changeSelectorTextAllowed: changeSelectorTextAllowed
        };
    })();

    // scope is supported? just return a function which returns "this" when scoped support is found to make it chainable for jQuery
    if (compat.scopeSupported)
        return function () { return this };

    //window.console && console.log( "No support for <style scoped> found, commencing jumping through hoops in 3, 2, 1..." );

    // this was called so we "scope" all the <style> nodes which need to be scoped now
    var scopedSheets
    , i
    , idCounter = 0
    ;

    if (doc.querySelectorAll) {

        scopedSheets = doc.querySelectorAll('style[scoped]');

    } else {

        var tempSheets = [], scopedAttr;
        scopedSheets = doc.getElementsByTagName('style');
        i = scopedSheets.length;

        while (i--) {
            scopedAttr = scopedSheets[i].getAttribute('scoped');

            if ("scoped" === scopedAttr || "" === scopedAttr)
                tempSheets.push(scopedSheets[i]);
            // Array.prototype.apply doen't work in the browsers this is eecuted for so we have to use array.push()

        }

        scopedSheets = tempSheets;

    }

    i = scopedSheets.length;
    while (i--)
        scopeIt(scopedSheets[i]);

    // make a function so we can return it to enable the "scoping" of other <styles> which are inserted later on for instance
    function scopeIt(styleNode, jQueryItem) {

        // catch the second argument if this was called via the $.each
        if (jQueryItem)
            styleNode = jQueryItem;

        // check if we received a <style> node
        // if not chcek if it's a jQuery object and go from there
        // if no <style> and no jQuery? return to avoid errors
        if (!styleNode.nodeName) {

            if (!styleNode.jquery)
                return;
            else
                return styleNode.each(scopeIt);

        }

        if ('STYLE' !== styleNode.nodeName)
            return;

        // init some vars
        var parentSheet = styleNode[compat.sheet]
        , allRules = parentSheet[compat.rules]
        , par = styleNode.parentNode
        , id = par.id || (par.id = 'scopedByScopedPolyfill_' + ++idCounter)
        , glue = ''
        , index = allRules.length || 0
        , rule
        ;

        // get al the ids from the parents so we are as specific as possible
        // if no ids are found we always have the id which is placed on the <style>'s parentNode
        while (par) {

            if (par.id)
                //if id begins with a number, we have to apply css escaping
                if (parseInt(par.id.slice(0, 1))) {
                    glue = '#\\3' + par.id.slice(0, 1) + ' ' + par.id.slice(1) + ' ' + glue;
                } else {
                    glue = '#' + par.id + ' ' + glue;
                }

            par = par.parentNode;

        }

        // iterate over the collection from the end back to account for IE's inability to insert a styleRule at a certain point
        // it can only add them to the end...
        while (index--) {

            rule = allRules[index];
            processCssRules(rule, index);

        }

        //recursively process cssRules
        function processCssRules(parentRule, index) {
            var sheet = parentRule.cssRules ? parentRule : parentSheet
            , allRules = parentRule.cssRules || [parentRule]
            , i = allRules.length || 0
            , ruleIndex = parentRule.cssRules ? i : index
            , rule
            , selector
            , styleRule
            ;

            // iterate over the collection from the end back to account for IE's inability to insert a styleRule at a certain point
            // it can only add them to the end...
            while (i--) {

                rule = allRules[i];
                if (rule.selectorText) {

                    selector = glue + ' ' + rule.selectorText.split(',').join(', ' + glue);

                    // replace :root by the scoped element
                    selector = selector.replace(/[\ ]+:root/gi, '');

                    // we can just change the selectorText for this one
                    if (compat.changeSelectorTextAllowed) {

                        rule.selectorText = selector;

                    } else {// or we need to remove the rule and add it back in if we cant edit the selectorText

                        /*
                         * IE only adds the normal rules to the array (no @imports, @page etc)
                         * and also does not have a type attribute so we check if that exists and execute the old IE part if it doesn't
                         * all other browsers have the type attribute to show the type
                         *  1 : normal style rules  <---- use these ones
                         *  2 : @charset
                         *  3 : @import
                         *  4 : @media
                         *  5 : @font-face
                         *  6 : @page rules
                         *
                         */
                        if (!rule.type || 1 === rule.type) {

                            styleRule = rule.style.cssText;
                            // IE doesn't allow inserting of '' as a styleRule
                            if (styleRule) {
                                sheet.removeRule ? sheet.removeRule(ruleIndex) : sheet.deleteRule(ruleIndex);
                                sheet.addRule ? sheet.addRule(selector, styleRule, ruleIndex) : sheet.insertRule(selector + '{' + styleRule + '}', ruleIndex);
                            }
                        }
                    }
                } else if (rule.cssRules) {
                    processCssRules(rule, ruleIndex);
                }
            }
            
        }
    }

    // Expose it as a jQuery function for convenience
    if (typeof jQuery === "function" && typeof jQuery.fn === "object") {
        jQuery.fn.scopedPolyFill = function () {
            return this.each(scopeIt);
        }
    }

    return scopeIt;

})(document);
